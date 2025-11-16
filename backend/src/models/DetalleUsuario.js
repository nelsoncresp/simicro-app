import pool from '../config/database.js';

export class DetalleUsuario {
  // Crear nuevo detalle de usuario
  static async create(id_usuario, data) {
    const {
      tipo_documento,
      numero_documento,
      fecha_nacimiento,
      genero,
      telefono,
      direccion,
      municipio,
      departamento,
      estado_civil
    } = data;

    const query = `
      INSERT INTO detalle_usuarios (
        id_usuario, tipo_documento, numero_documento, fecha_nacimiento,
        genero, telefono, direccion, municipio, departamento, estado_civil
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.execute(query, [
      id_usuario,
      tipo_documento || 'CC',
      numero_documento,
      fecha_nacimiento || null,
      genero || 'otro',
      telefono,
      direccion,
      municipio,
      departamento,
      estado_civil || 'soltero'
    ]);

    return { id_detalle_usuario: result.insertId, ...data };
  }

  // Obtener detalle de usuario por ID
  static async findById(id_detalle_usuario) {
    const query = 'SELECT * FROM detalle_usuarios WHERE id_detalle_usuario = ?';
    const [rows] = await pool.execute(query, [id_detalle_usuario]);
    return rows[0] || null;
  }

  // Obtener detalle de usuario por id_usuario
  static async findByUserId(id_usuario) {
    const query = 'SELECT * FROM detalle_usuarios WHERE id_usuario = ?';
    const [rows] = await pool.execute(query, [id_usuario]);
    return rows[0] || null;
  }

  // Obtener todos los detalles de usuarios
  static async findAll(filters = {}) {
    let query = 'SELECT * FROM detalle_usuarios';
    const params = [];

    if (filters.id_usuario) {
      query += ' WHERE id_usuario = ?';
      params.push(filters.id_usuario);
    }

    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(filters.limit);
    }

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  // Actualizar detalle de usuario
  static async update(id_detalle_usuario, data) {
    const allowedFields = [
      'tipo_documento',
      'numero_documento',
      'fecha_nacimiento',
      'genero',
      'telefono',
      'direccion',
      'municipio',
      'departamento',
      'estado_civil'
    ];

    const updates = Object.keys(data)
      .filter(key => allowedFields.includes(key))
      .map(key => `${key} = ?`);

    if (updates.length === 0) return null;

    const values = Object.keys(data)
      .filter(key => allowedFields.includes(key))
      .map(key => data[key]);

    const query = `UPDATE detalle_usuarios SET ${updates.join(', ')}, fecha_actualizacion = CURRENT_TIMESTAMP WHERE id_detalle_usuario = ?`;
    values.push(id_detalle_usuario);

    await pool.execute(query, values);
    return this.findById(id_detalle_usuario);
  }

  // Eliminar detalle de usuario
  static async delete(id_detalle_usuario) {
    const query = 'DELETE FROM detalle_usuarios WHERE id_detalle_usuario = ?';
    const [result] = await pool.execute(query, [id_detalle_usuario]);
    return result.affectedRows > 0;
  }

  // Verificar si existe detalle para un usuario
  static async existsByUserId(id_usuario) {
    const query = 'SELECT COUNT(*) as count FROM detalle_usuarios WHERE id_usuario = ?';
    const [rows] = await pool.execute(query, [id_usuario]);
    return rows[0].count > 0;
  }
}
