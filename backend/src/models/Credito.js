import pool from '../config/database.js';

export class Credito {
  // Crear crédito desde solicitud aprobada
  static async crearDesdeSolicitud(solicitud) {
    const [result] = await pool.execute(
      `INSERT INTO creditos 
      (id_solicitud, monto_desembolsado, saldo_pendiente_total, tasa_interes, fecha_desembolso, estado) 
      VALUES (?, ?, ?, ?, NOW(), 'activo')`,
      [solicitud.id_solicitud, solicitud.monto_solicitado, solicitud.monto_solicitado, 0.02]
    );

    // Generar cuotas automáticamente
    const { generarCuotas } = await import('../utils/helpers.js');
    const cuotas = generarCuotas(solicitud.monto_solicitado, solicitud.plazo_semanas);
    
    const { Cuota } = await import('./Cuota.js');
    for (const cuota of cuotas) {
      await Cuota.create({
        id_credito: result.insertId,
        numero_cuota: cuota.numero,
        fecha_vencimiento: cuota.fechaVencimiento,
        monto_esperado: cuota.monto,
        capital: cuota.capital,
        interes: cuota.interes,
        estado: 'pendiente'
      });
    }

    return this.findById(result.insertId);
  }

  // Buscar por ID
  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT c.*, s.monto_solicitado, s.plazo_semanas, e.nombre_negocio, u.nombre as nombre_emprendedor
       FROM creditos c
       INNER JOIN solicitudes s ON c.id_solicitud = s.id_solicitud
       INNER JOIN emprendedores e ON s.id_emprendedor = e.id_emprendedor
       INNER JOIN usuarios u ON e.id_usuario = u.id_usuario
       WHERE c.id_credito = ?`,
      [id]
    );
    return rows[0];
  }

  // Obtener créditos activos
  static async findActive() {
    const [rows] = await pool.execute(
      `SELECT c.*, e.nombre_negocio, u.nombre as nombre_emprendedor
       FROM creditos c
       INNER JOIN solicitudes s ON c.id_solicitud = s.id_solicitud
       INNER JOIN emprendedores e ON s.id_emprendedor = e.id_emprendedor
       INNER JOIN usuarios u ON e.id_usuario = u.id_usuario
       WHERE c.estado = 'activo'
       ORDER BY c.fecha_desembolso DESC`
    );
    return rows;
  }

  // Obtener créditos por emprendedor
  static async findByEmprendedor(idEmprendedor) {
    const [rows] = await pool.execute(
      `SELECT c.*, s.plazo_semanas
       FROM creditos c
       INNER JOIN solicitudes s ON c.id_solicitud = s.id_solicitud
       WHERE s.id_emprendedor = ?
       ORDER BY c.fecha_creacion DESC`,
      [idEmprendedor]
    );
    return rows;
  }

  // Actualizar saldo
  static async updateSaldo(idCredito, nuevoSaldo) {
    await pool.execute(
      'UPDATE creditos SET saldo_pendiente_total = ? WHERE id_credito = ?',
      [nuevoSaldo, idCredito]
    );
    return this.findById(idCredito);
  }

  // Cambiar estado
  static async updateEstado(idCredito, estado) {
    await pool.execute(
      'UPDATE creditos SET estado = ? WHERE id_credito = ?',
      [estado, idCredito]
    );
    return this.findById(idCredito);
  }
}