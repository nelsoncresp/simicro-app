import pool from '../config/database.js';

export class Pago {
  // Crear pago
  static async create(pagoData) {
    const [result] = await pool.execute(
      `INSERT INTO pagos 
      (id_cuota, monto_recibido, metodo_pago, referencia_pago, observaciones) 
      VALUES (?, ?, ?, ?, ?)`,
      [pagoData.id_cuota, pagoData.monto_recibido, pagoData.metodo_pago, 
       pagoData.referencia_pago, pagoData.observaciones]
    );
    return this.findById(result.insertId);
  }

  // Buscar por ID
  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT p.*, c.numero_cuota, c.monto_esperado, cr.id_credito, e.nombre_negocio
       FROM pagos p
       INNER JOIN cuotas c ON p.id_cuota = c.id_cuota
       INNER JOIN creditos cr ON c.id_credito = cr.id_credito
       INNER JOIN solicitudes s ON cr.id_solicitud = s.id_solicitud
       INNER JOIN emprendedores e ON s.id_emprendedor = e.id_emprendedor
       WHERE p.id_pago = ?`,
      [id]
    );
    return rows[0];
  }

  // Obtener pagos por crédito
  static async findByCredito(idCredito) {
    const [rows] = await pool.execute(
      `SELECT p.*, c.numero_cuota, c.fecha_vencimiento
       FROM pagos p
       INNER JOIN cuotas c ON p.id_cuota = c.id_cuota
       WHERE c.id_credito = ?
       ORDER BY p.fecha_pago DESC`,
      [idCredito]
    );
    return rows;
  }

  // Obtener pagos por fecha
  static async findByFecha(fechaInicio, fechaFin) {
    const [rows] = await pool.execute(
      `SELECT p.*, c.numero_cuota, e.nombre_negocio
       FROM pagos p
       INNER JOIN cuotas c ON p.id_cuota = c.id_cuota
       INNER JOIN creditos cr ON c.id_credito = cr.id_credito
       INNER JOIN solicitudes s ON cr.id_solicitud = s.id_solicitud
       INNER JOIN emprendedores e ON s.id_emprendedor = e.id_emprendedor
       WHERE DATE(p.fecha_pago) BETWEEN ? AND ?
       ORDER BY p.fecha_pago DESC`,
      [fechaInicio, fechaFin]
    );
    return rows;
  }

  // Obtener total de pagos por día
  static async getTotalPorDia(fecha) {
    const [rows] = await pool.execute(
      `SELECT DATE(fecha_pago) as fecha, SUM(monto_recibido) as total
       FROM pagos
       WHERE DATE(fecha_pago) = ?
       GROUP BY DATE(fecha_pago)`,
      [fecha]
    );
    return rows[0] || { fecha, total: 0 };
  }
}