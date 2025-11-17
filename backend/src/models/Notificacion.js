import pool from '../config/database.js';

export class Notificacion {
  // Crear notificación
  static async create(data) {
    const {
      id_usuario,
      id_solicitud,
      tipo, // 'aprobado', 'rechazado'
      mensaje,
      estado_envio = 'enviado', // 'pendiente', 'enviado', 'fallido'
      telefono
    } = data;

    const [result] = await pool.execute(
      `INSERT INTO notificaciones 
       (id_usuario, id_solicitud, tipo, mensaje, estado_envio, telefono)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id_usuario, id_solicitud, tipo, mensaje, estado_envio, telefono]
    );

    return this.findById(result.insertId);
  }

  // Obtener notificación por ID
  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT n.*, u.nombre, u.email
       FROM notificaciones n
       INNER JOIN usuarios u ON n.id_usuario = u.id_usuario
       WHERE n.id_notificacion = ?`,
      [id]
    );
    return rows[0];
  }

  // Obtener notificaciones del usuario
  static async findByUsuario(id_usuario) {
    const [rows] = await pool.execute(
      `SELECT n.* FROM notificaciones n
       WHERE n.id_usuario = ?
       ORDER BY n.fecha_creacion DESC`,
      [id_usuario]
    );
    return rows;
  }

  // Obtener notificaciones por solicitud
  static async findBySolicitud(id_solicitud) {
    const [rows] = await pool.execute(
      `SELECT n.* FROM notificaciones n
       WHERE n.id_solicitud = ?
       ORDER BY n.fecha_creacion DESC`,
      [id_solicitud]
    );
    return rows;
  }

  // Actualizar estado de envío
  static async updateEstadoEnvio(id, estado) {
    await pool.execute(
      `UPDATE notificaciones SET estado_envio = ? WHERE id_notificacion = ?`,
      [estado, id]
    );
    return this.findById(id);
  }

  // Obtener notificaciones no leídas
  static async findNoLeidas(id_usuario) {
    const [rows] = await pool.execute(
      `SELECT n.* FROM notificaciones n
       WHERE n.id_usuario = ? AND n.leida = FALSE
       ORDER BY n.fecha_creacion DESC`,
      [id_usuario]
    );
    return rows;
  }

  // Marcar como leída
  static async marcarComoLeida(id) {
    await pool.execute(
      `UPDATE notificaciones SET leida = TRUE WHERE id_notificacion = ?`,
      [id]
    );
    return this.findById(id);
  }
}
