// models/Solicitud.js
import pool from '../config/database.js';

export class Solicitud {
  // Crear nueva solicitud
  static async create(data) {
    const {
      id_emprendedor,
      monto_solicitado,
      plazo_semanas,
      estado = 'pendiente',
      calificacion_riesgo = null,
      ratio_cuota_utilidad = null,
      motivo_decision = null
    } = data;

    const [result] = await pool.execute(
      `INSERT INTO solicitudes 
       (id_emprendimiento, monto_solicitado, plazo_semanas, estado, calificacion_riesgo, ratio_cuota_utilidad, motivo_decision)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id_emprendedor, monto_solicitado, plazo_semanas, estado, calificacion_riesgo, ratio_cuota_utilidad, motivo_decision]
    );

    return this.findById(result.insertId);
  }

  // Buscar solicitud por ID (con joins)
  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT s.*, 
              e.nombre_emprendimiento AS nombre_negocio,
              e.ingresos_mensuales, e.gastos_mensuales, e.utilidad_neta, e.tiempo_funcionamiento,
              u.nombre AS nombre_emprendedor, u.email
       FROM solicitudes s
       INNER JOIN emprendimientos e ON s.id_emprendimiento = e.id_emprendimiento
       INNER JOIN usuarios u ON e.id_usuario = u.id_usuario
       WHERE s.id_solicitud = ?`,
      [id]
    );
    return rows[0];
  }

  // Obtener todas las solicitudes (opcionalmente filtradas)
  static async findAll(filters = {}) {
    let query = `
      SELECT s.*, 
             e.nombre_emprendimiento AS nombre_negocio,
             u.nombre AS nombre_emprendedor
      FROM solicitudes s
      INNER JOIN emprendimientos e ON s.id_emprendedor = e.id_emprendimiento
      INNER JOIN usuarios u ON e.id_usuario = u.id_usuario
    `;

    const conditions = [];
    const values = [];

    if (filters.estado) {
      conditions.push('s.estado = ?');
      values.push(filters.estado);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY s.fecha_solicitud DESC';

    if (filters.limit) {
      query += ' LIMIT ?';
      values.push(filters.limit);
    }

    const [rows] = await pool.execute(query, values);
    return rows;
  }

  // 🔹 Obtener todas las solicitudes del usuario autenticado
  static async findByUsuario(id_usuario) {
    const [rows] = await pool.execute(
      `SELECT s.*, e.nombre_emprendimiento AS nombre_negocio, e.utilidad_neta
       FROM solicitudes s
       INNER JOIN emprendimientos e ON s.id_emprendimiento = e.id_emprendimiento
       INNER JOIN usuarios u ON e.id_usuario = u.id_usuario
       WHERE u.id_usuario = ?
       ORDER BY s.fecha_solicitud DESC`,
      [id_usuario]
    );
    return rows;
  }

  // Actualizar estado / riesgo / ratio
  static async updateEstado(id, estado, calificacion_riesgo = null, ratio = null, motivo = null) {
    const updateData = { estado };
    if (calificacion_riesgo) updateData.calificacion_riesgo = calificacion_riesgo;
    if (ratio) updateData.ratio_cuota_utilidad = ratio;
    if (motivo) updateData.motivo_decision = motivo;

    const fields = [];
    const values = [];

    Object.keys(updateData).forEach((key) => {
      fields.push(`${key} = ?`);
      values.push(updateData[key]);
    });

    values.push(id);
    await pool.execute(
      `UPDATE solicitudes 
       SET ${fields.join(', ')}, fecha_actualizacion = CURRENT_TIMESTAMP 
       WHERE id_solicitud = ?`,
      values
    );
  }
}
