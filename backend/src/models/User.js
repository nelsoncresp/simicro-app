import pool from "../config/database.js";

export class User {
  // Crear usuario
  static async create(userData) {
    const { email, password, nombre, rol } = userData;
    const [result] = await pool.execute(
      "INSERT INTO usuarios (email, password, nombre, rol) VALUES (?, ?, ?, ?)",
      [email, password, nombre, rol]
    );
    return this.findById(result.insertId);
  }

  // Crear analista (solo admins)
  static async createAnalyst(req, res) {
    try {
      // Verificar que el usuario autenticado sea admin
      if (req.user.rol !== "admin") {
        return error(res, "No tienes permisos para crear un analista", 403);
      }

      const { email, password, nombre } = req.body;

      if (!email || !password || !nombre) {
        return error(res, "Email, contraseña y nombre son requeridos", 400);
      }

      // Verificar si ya existe
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return error(res, "El email ya está registrado", 409);
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      const user = await User.create({
        email,
        password: hashedPassword,
        nombre,
        rol: "analista",
      });

      const token = jwt.sign(
        {
          id_usuario: user.id_usuario,
          email: user.email,
          rol: user.rol,
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      const userData = {
        id_usuario: user.id_usuario,
        email: user.email,
        nombre: user.nombre,
        rol: user.rol,
      };

      success(
        res,
        { user: userData, token },
        "Analista creado exitosamente",
        201
      );
    } catch (err) {
      console.error("Error creando analista:", err);
      error(res, "Error creando analista", 500);
    }
  }

  // Buscar por ID
  static async findById(id) {
    const [rows] = await pool.execute(
      "SELECT id_usuario, email, nombre, rol, fecha_creacion FROM usuarios WHERE id_usuario = ? AND activo = true",
      [id]
    );
    return rows[0];
  }

  // Buscar por email (para login)
  static async findByEmail(email) {
    const [rows] = await pool.execute(
      "SELECT * FROM usuarios WHERE email = ? AND activo = true",
      [email]
    );
    return rows[0];
  }

  // Obtener todos los usuarios
  static async findAll() {
    const [rows] = await pool.execute(
      "SELECT id_usuario, email, nombre, rol, fecha_creacion FROM usuarios WHERE activo = true ORDER BY fecha_creacion DESC"
    );
    return rows;
  }

  // Actualizar usuario
  static async update(id, userData) {
    const fields = [];
    const values = [];

    Object.keys(userData).forEach((key) => {
      if (userData[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(userData[key]);
      }
    });

    values.push(id);

    await pool.execute(
      `UPDATE usuarios SET ${fields.join(", ")} WHERE id_usuario = ?`,
      values
    );

    return this.findById(id);
  }

  // Desactivar usuario
  static async deactivate(id) {
    await pool.execute(
      "UPDATE usuarios SET activo = false WHERE id_usuario = ?",
      [id]
    );
    return true;
  }
}
