import pool from '../config/database.js';

export class Solicitud {
  // Crear solicitud
  static async create(solicitudData) {
    const { id_emprendedor, monto_solicitado, plazo_semanas, estado, calificacion_riesgo, ratio_cuota_utilidad, motivo_decision } = solicitudData;
    
    const [result] = await pool.execute(
      `INSERT INTO solicitudes 
      (id_emprendedor, monto_solicitado, plazo_semanas, estado, calificacion_riesgo, ratio_cuota_utilidad, motivo_decision) 
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id_emprendedor, monto_solicitado, plazo_semanas, estado, calificacion_riesgo, ratio_cuota_utilidad, motivo_decision]
    );
    
    return this.findById(result.insertId);
  }

  // Buscar por ID
  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT s.*, e.nombre_negocio, e.ingreso_neto_diario, e.antiguedad_meses,
              u.nombre as nombre_emprendedor, u.email
       FROM solicitudes s
       INNER JOIN emprendedores e ON s.id_emprendedor = e.id_emprendedor
       INNER JOIN usuarios u ON e.id_usuario = u.id_usuario
       WHERE s.id_solicitud = ?`,
      [id]
    );
    return rows[0];
  }

  // Obtener todas las solicitudes con filtros
  static async findAll(filters = {}) {
    let query = `
      SELECT s.*, e.nombre_negocio, u.nombre as nombre_emprendedor
      FROM solicitudes s
      INNER JOIN emprendedores e ON s.id_emprendedor = e.id_emprendedor
      INNER JOIN usuarios u ON e.id_usuario = u.id_usuario
    `;

    const values = [];
    const conditions = [];

    // Filtros opcionales
    if (filters.estado) {
      conditions.push('s.estado = ?');
      values.push(filters.estado);
    }

    if (filters.id_emprendedor) {
      conditions.push('s.id_emprendedor = ?');
      values.push(filters.id_emprendedor);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ' ORDER BY s.fecha_solicitud DESC';

    if (filters.limit) {
      query += ' LIMIT ?';
      values.push(filters.limit);
    }

    const [rows] = await pool.execute(query, values);
    return rows;
  }

  // Actualizar estado de solicitud
  static async updateEstado(id, estado, calificacion_riesgo = null, ratio = null) {
    const updateData = { estado };
    
    if (calificacion_riesgo) updateData.calificacion_riesgo = calificacion_riesgo;
    if (ratio) updateData.ratio_cuota_utilidad = ratio;

    const fields = [];
    const values = [];

    Object.keys(updateData).forEach(key => {
      fields.push(`${key} = ?`);
      values.push(updateData[key]);
    });

    values.push(id);

    await pool.execute(
      `UPDATE solicitudes SET ${fields.join(', ')} WHERE id_solicitud = ?`,
      values
    );

    return this.findById(id);
  }

  // Obtener solicitudes por emprendedor
  static async findByEmprendedor(idEmprendedor) {
    const [rows] = await pool.execute(
      `SELECT s.*, e.nombre_negocio 
       FROM solicitudes s
       INNER JOIN emprendedores e ON s.id_emprendedor = e.id_emprendedor
       WHERE s.id_emprendedor = ?
       ORDER BY s.fecha_solicitud DESC`,
      [idEmprendedor]
    );
    return rows;
  }
}