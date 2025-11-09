import pool from '../config/database.js';

export class User {
  // Crear usuario
  static async create(userData) {
    const { email, password, nombre, rol } = userData;
    const [result] = await pool.execute(
      'INSERT INTO usuarios (email, password, nombre, rol) VALUES (?, ?, ?, ?)',
      [email, password, nombre, rol]
    );
    return this.findById(result.insertId);
  }

  // Buscar por ID
  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT id_usuario, email, nombre, rol, fecha_creacion FROM usuarios WHERE id_usuario = ? AND activo = true',
      [id]
    );
    return rows[0];
  }

  // Buscar por email (para login)
  static async findByEmail(email) {
    const [rows] = await pool.execute(
      'SELECT * FROM usuarios WHERE email = ? AND activo = true',
      [email]
    );
    return rows[0];
  }

  // Obtener todos los usuarios
  static async findAll() {
    const [rows] = await pool.execute(
      'SELECT id_usuario, email, nombre, rol, fecha_creacion FROM usuarios WHERE activo = true ORDER BY fecha_creacion DESC'
    );
    return rows;
  }

  // Actualizar usuario
  static async update(id, userData) {
    const fields = [];
    const values = [];

    Object.keys(userData).forEach(key => {
      if (userData[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(userData[key]);
      }
    });

    values.push(id);

    await pool.execute(
      `UPDATE usuarios SET ${fields.join(', ')} WHERE id_usuario = ?`,
      values
    );

    return this.findById(id);
  }

  // Desactivar usuario
  static async deactivate(id) {
    await pool.execute(
      'UPDATE usuarios SET activo = false WHERE id_usuario = ?',
      [id]
    );
    return true;
  }
}