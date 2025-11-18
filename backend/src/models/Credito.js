import pool from '../config/database.js';

export class Credito {
  // Crear crédito desde solicitud aprobada
  static async create(data) {
    const {
      id_solicitud,
      monto_desembolsado,
      tasa_interes = 2.0
    } = data;

    const [result] = await pool.execute(
      `INSERT INTO creditos 
       (id_solicitud, monto_desembolsado, saldo_pendiente_total, tasa_interes, fecha_desembolso, estado)
       VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, 'activo')`,
      [id_solicitud, monto_desembolsado, monto_desembolsado, tasa_interes]
    );

    return this.findById(result.insertId);
  }

  // Buscar crédito por ID
  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT c.*, 
              s.id_emprendedor, s.plazo_semanas,
              e.nombre_emprendimiento, u.nombre, u.email
       FROM creditos c
       INNER JOIN solicitudes s ON c.id_solicitud = s.id_solicitud
       INNER JOIN emprendimientos e ON s.id_emprendedor = e.id_emprendimiento
       INNER JOIN usuarios u ON e.id_usuario = u.id_usuario
       WHERE c.id_credito = ?`,
      [id]
    );
    return rows[0];
  }

  // Buscar créditos por solicitud
  static async findBySolicitud(id_solicitud) {
    const [rows] = await pool.execute(
      `SELECT * FROM creditos WHERE id_solicitud = ?`,
      [id_solicitud]
    );
    return rows[0];
  }

  // Obtener créditos activos de un emprendedor
  static async findByEmprendedor(id_emprendedor) {
    const [rows] = await pool.execute(
      `SELECT c.*, s.plazo_semanas
       FROM creditos c
       INNER JOIN solicitudes s ON c.id_solicitud = s.id_solicitud
       WHERE s.id_emprendedor = ? AND c.estado IN ('activo', 'moroso')
       ORDER BY c.fecha_creacion DESC`,
      [id_emprendedor]
    );
    return rows;
  }

  // Actualizar saldo pendiente
  static async updateSaldoPendiente(id_credito, nuevoSaldo) {
    await pool.execute(
      `UPDATE creditos SET saldo_pendiente_total = ? WHERE id_credito = ?`,
      [nuevoSaldo, id_credito]
    );
  }

  // Actualizar estado del crédito
  static async updateEstado(id_credito, estado) {
    await pool.execute(
      `UPDATE creditos SET estado = ? WHERE id_credito = ?`,
      [estado, id_credito]
    );
  }

  // Actualizar mora acumulada del crédito
  static async updateMoraAcumulada(id_credito, mora_acumulada) {
    await pool.execute(
      `UPDATE creditos SET mora_acumulada = ? WHERE id_credito = ?`,
      [mora_acumulada, id_credito]
    );
  }

  // Obtener mora acumulada
  static async getMoraAcumulada(id_credito) {
    const [rows] = await pool.execute(
      `SELECT mora_acumulada FROM creditos WHERE id_credito = ?`,
      [id_credito]
    );
    return rows[0]?.mora_acumulada || 0;
  }

  // Obtener todos los créditos del usuario
  static async findByUsuario(id_usuario) {
    const [rows] = await pool.execute(
      `SELECT c.*, e.nombre_emprendimiento, s.plazo_semanas
       FROM creditos c
       INNER JOIN solicitudes s ON c.id_solicitud = s.id_solicitud
       INNER JOIN emprendimientos e ON s.id_emprendedor = e.id_emprendimiento
       INNER JOIN usuarios u ON e.id_usuario = u.id_usuario
       WHERE u.id_usuario = ? AND c.estado IN ('activo', 'moroso')
       ORDER BY c.fecha_creacion DESC`,
      [id_usuario]
    );
    return rows;
  }
  static async findActive() {
  const [rows] = await pool.execute(
    `SELECT * FROM creditos WHERE estado = 'activo'`
  );
  return rows;
}


}