import pool from '../config/database.js';

export class Cuota {
  // Crear cuota
  static async create(cuotaData) {
    const [result] = await pool.execute(
      `INSERT INTO cuotas 
      (id_credito, numero_cuota, fecha_vencimiento, monto_esperado, capital, interes, estado) 
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [cuotaData.id_credito, cuotaData.numero_cuota, cuotaData.fecha_vencimiento, 
       cuotaData.monto_esperado, cuotaData.capital, cuotaData.interes, cuotaData.estado]
    );
    return this.findById(result.insertId);
  }

  // Buscar por ID
  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT c.*, cr.id_credito, s.id_emprendedor, e.nombre_negocio
       FROM cuotas c
       INNER JOIN creditos cr ON c.id_credito = cr.id_credito
       INNER JOIN solicitudes s ON cr.id_solicitud = s.id_solicitud
       INNER JOIN emprendedores e ON s.id_emprendedor = e.id_emprendedor
       WHERE c.id_cuota = ?`,
      [id]
    );
    return rows[0];
  }

  // Obtener cuotas por crédito
  static async findByCredito(idCredito) {
    const [rows] = await pool.execute(
      `SELECT c.* 
       FROM cuotas c 
       WHERE c.id_credito = ? 
       ORDER BY c.numero_cuota`,
      [idCredito]
    );
    return rows;
  }

  // Obtener cuotas vencidas
  static async findVencidas() {
    const [rows] = await pool.execute(
      `SELECT c.*, cr.id_credito, e.nombre_negocio, u.nombre as nombre_emprendedor
       FROM cuotas c
       INNER JOIN creditos cr ON c.id_credito = cr.id_credito
       INNER JOIN solicitudes s ON cr.id_solicitud = s.id_solicitud
       INNER JOIN emprendedores e ON s.id_emprendedor = e.id_emprendedor
       INNER JOIN usuarios u ON e.id_usuario = u.id_usuario
       WHERE c.estado = 'pendiente' 
       AND c.fecha_vencimiento < CURDATE()`
    );
    return rows;
  }

  // Obtener cuotas pendientes por crédito
  static async findPendientesByCredito(idCredito) {
    const [rows] = await pool.execute(
      `SELECT c.* 
       FROM cuotas c 
       WHERE c.id_credito = ? 
       AND c.estado = 'pendiente'
       ORDER BY c.numero_cuota`,
      [idCredito]
    );
    return rows;
  }

  // Registrar pago de cuota
  static async registrarPago(idCuota, montoPagado, metodoPago = 'efectivo') {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // 1. Actualizar cuota
      await connection.execute(
        `UPDATE cuotas 
         SET estado = 'pagada', monto_pagado = ?, fecha_pago = NOW() 
         WHERE id_cuota = ?`,
        [montoPagado, idCuota]
      );

      // 2. Registrar en tabla pagos
      await connection.execute(
        `INSERT INTO pagos (id_cuota, monto_recibido, metodo_pago) 
         VALUES (?, ?, ?)`,
        [idCuota, montoPagado, metodoPago]
      );

      // 3. Actualizar saldo del crédito
      const cuota = await this.findById(idCuota);
      const credito = await connection.execute(
        'SELECT saldo_pendiente_total FROM creditos WHERE id_credito = ?',
        [cuota.id_credito]
      );

      const nuevoSaldo = credito[0][0].saldo_pendiente_total - montoPagado;
      await connection.execute(
        'UPDATE creditos SET saldo_pendiente_total = ? WHERE id_credito = ?',
        [nuevoSaldo, cuota.id_credito]
      );

      await connection.commit();
      return this.findById(idCuota);

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Marcar como vencida
  static async marcarComoVencida(idCuota) {
    await pool.execute(
      'UPDATE cuotas SET estado = "vencida" WHERE id_cuota = ?',
      [idCuota]
    );
    return this.findById(idCuota);
  }
}