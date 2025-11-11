import pool from '../config/database.js';

export class Emprendedor {
  static async create(data) {
    const {
      id_usuario,
      nombre_negocio,
      descripcion_negocio,
      sector_economico,
      tipo_negocio,
      antiguedad_meses,
      numero_empleados,
      ingreso_neto_mensual,
      egresos_mensuales,
      tipo_vivienda,
      tiempo_residencia_anios,
      estabilidad_vivienda,
      calificacion_riesgo,
      observaciones
    } = data;

    const [result] = await pool.execute(
      `INSERT INTO emprendedores (
        id_usuario, nombre_negocio, descripcion_negocio, sector_economico, tipo_negocio,
        antiguedad_meses, numero_empleados, ingreso_neto_mensual, egresos_mensuales,
        tipo_vivienda, tiempo_residencia_anios, estabilidad_vivienda, calificacion_riesgo, observaciones
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id_usuario,
        nombre_negocio,
        descripcion_negocio,
        sector_economico,
        tipo_negocio,
        antiguedad_meses,
        numero_empleados,
        ingreso_neto_mensual,
        egresos_mensuales,
        tipo_vivienda,
        tiempo_residencia_anios,
        estabilidad_vivienda,
        calificacion_riesgo,
        observaciones
      ]
    );

    return this.findById(result.insertId);
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT e.*, u.email, u.nombre AS nombre_completo 
       FROM emprendedores e 
       INNER JOIN usuarios u ON e.id_usuario = u.id_usuario 
       WHERE e.id_emprendedor = ?`,
      [id]
    );
    return rows[0];
  }

  static async findByUserId(userId) {
    const [rows] = await pool.execute(
      `SELECT e.*, u.email, u.nombre AS nombre_completo 
       FROM emprendedores e 
       INNER JOIN usuarios u ON e.id_usuario = u.id_usuario 
       WHERE e.id_usuario = ?`,
      [userId]
    );
    return rows[0];
  }

  static async findAll() {
    const [rows] = await pool.execute(
      `SELECT e.*, u.email, u.nombre AS nombre_completo 
       FROM emprendedores e 
       INNER JOIN usuarios u ON e.id_usuario = u.id_usuario 
       ORDER BY e.fecha_creacion DESC`
    );
    return rows;
  }

  static async update(id, data) {
    const fields = [];
    const values = [];

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (!fields.length) return this.findById(id);

    values.push(id);

    await pool.execute(
      `UPDATE emprendedores SET ${fields.join(', ')}, fecha_actualizacion = CURRENT_TIMESTAMP WHERE id_emprendedor = ?`,
      values
    );

    return this.findById(id);
  }
}
