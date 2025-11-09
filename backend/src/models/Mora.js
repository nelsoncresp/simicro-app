import pool from '../config/database.js';

export class Mora {
  // Crear registro de mora
  static async create(moraData) {
    const [result] = await pool.execute(
      `INSERT INTO moras 
      (id_cuota, dias_mora, monto_penalidad_acumulado, fecha_inicio_mora, estado) 
      VALUES (?, ?, ?, NOW(), 'activa')`,
      [moraData.id_cuota, moraData.dias_mora, moraData.monto_penalidad_acumulado]
    );
    return this.findById(result.insertId);
  }

  // Buscar por ID
  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT m.*, c.numero_cuota, c.monto_esperado, cr.id_credito, e.nombre_negocio
       FROM moras m
       INNER JOIN cuotas c ON m.id_cuota = c.id_cuota
       INNER JOIN creditos cr ON c.id_credito = cr.id_credito
       INNER JOIN solicitudes s ON cr.id_solicitud = s.id_solicitud
       INNER JOIN emprendedores e ON s.id_emprendedor = e.id_emprendedor
       WHERE m.id_mora = ?`,
      [id]
    );
    return rows[0];
  }

  // Buscar mora activa por cuota
  static async findActivaByCuota(idCuota) {
    const [rows] = await pool.execute(
      `SELECT m.* 
       FROM moras m 
       WHERE m.id_cuota = ? AND m.estado = 'activa'`,
      [idCuota]
    );
    return rows[0];
  }

  // Obtener todas las moras activas
  static async findActivas() {
    const [rows] = await pool.execute(
      `SELECT m.*, c.numero_cuota, e.nombre_negocio, u.nombre as nombre_emprendedor
       FROM moras m
       INNER JOIN cuotas c ON m.id_cuota = c.id_cuota
       INNER JOIN creditos cr ON c.id_credito = cr.id_credito
       INNER JOIN solicitudes s ON cr.id_solicitud = s.id_solicitud
       INNER JOIN emprendedores e ON s.id_emprendedor = e.id_emprendedor
       INNER JOIN usuarios u ON e.id_usuario = u.id_usuario
       WHERE m.estado = 'activa'
       ORDER BY m.dias_mora DESC`
    );
    return rows;
  }

  // Actualizar días de mora y penalidad
  static async actualizarMora(idMora, diasMora, penalidad) {
    await pool.execute(
      `UPDATE moras 
       SET dias_mora = ?, monto_penalidad_acumulado = ? 
       WHERE id_mora = ?`,
      [diasMora, penalidad, idMora]
    );
    return this.findById(idMora);
  }

  // Liquidar mora (cuando se paga la penalidad)
  static async liquidar(idMora) {
    await pool.execute(
      `UPDATE moras 
       SET estado = 'liquidada', fecha_fin_mora = NOW() 
       WHERE id_mora = ?`,
      [idMora]
    );
    return this.findById(idMora);
  }

  // Obtener moras por crédito
  static async findByCredito(idCredito) {
    const [rows] = await pool.execute(
      `SELECT m.*, c.numero_cuota
       FROM moras m
       INNER JOIN cuotas c ON m.id_cuota = c.id_cuota
       WHERE c.id_credito = ?
       ORDER BY m.fecha_inicio_mora DESC`,
      [idCredito]
    );
    return rows;
  }
}