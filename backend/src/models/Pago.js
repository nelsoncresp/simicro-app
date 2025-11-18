import pool from '../config/database.js';

export class Pago {
  // Crear pago
  static async create(data) {
    const {
      id_cuota,
      monto_recibido,
      metodo_pago = 'efectivo',
      referencia_pago = null,
      observaciones = null
    } = data;

    const [result] = await pool.execute(
      `INSERT INTO pagos 
       (id_cuota, monto_recibido, metodo_pago, referencia_pago, observaciones)
       VALUES (?, ?, ?, ?, ?)`,
      [id_cuota, monto_recibido, metodo_pago, referencia_pago, observaciones]
    );

    return this.findById(result.insertId);
  }

  // Obtener pago por ID
  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT p.*, c.numero_cuota, c.monto_esperado, c.fecha_vencimiento
       FROM pagos p
       INNER JOIN cuotas c ON p.id_cuota = c.id_cuota
       WHERE p.id_pago = ?`,
      [id]
    );
    return rows[0];
  }

  // Obtener pagos por cuota
  static async findByCuota(id_cuota) {
    const [rows] = await pool.execute(
      `SELECT * FROM pagos WHERE id_cuota = ? ORDER BY fecha_pago DESC`,
      [id_cuota]
    );
    return rows;
  }

  // Obtener pagos por usuario
  static async findByUsuario(id_usuario) {
    const [rows] = await pool.execute(
      `SELECT p.*, c.numero_cuota, c.monto_esperado, c.fecha_vencimiento, c.id_credito,
              e.nombre_emprendimiento,
              u.nombre AS nombre_emprendedor
       FROM pagos p
       INNER JOIN cuotas c ON p.id_cuota = c.id_cuota
       INNER JOIN creditos cr ON c.id_credito = cr.id_credito
       INNER JOIN solicitudes s ON cr.id_solicitud = s.id_solicitud
       INNER JOIN emprendimientos e ON s.id_emprendedor = e.id_emprendimiento
       INNER JOIN usuarios u ON e.id_usuario = u.id_usuario
       WHERE u.id_usuario = ?
       ORDER BY p.fecha_pago DESC`,
      [id_usuario]
    );
    return rows;
  }

  static async findByFecha(inicio, fin) {
  const [rows] = await pool.execute(
    `SELECT * FROM pagos WHERE DATE(fecha_pago) BETWEEN ? AND ?`,
    [inicio, fin]
  );
  return rows;
}

static async getTotalPorDia(fecha) {
  const [rows] = await pool.execute(
    `SELECT SUM(monto_recibido) AS total 
     FROM pagos 
     WHERE DATE(fecha_pago) = ?`,
    [fecha]
  );
  return rows[0] || { total: 0 };
}

}