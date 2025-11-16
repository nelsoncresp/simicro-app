import { Credito } from '../models/Credito.js';
import { CreditoService } from '../services/CreditoService.js';
import { success, error } from '../utils/responses.js';
import pool from '../config/database.js';

export class CreditoController {
  // Obtener créditos del usuario autenticado
  static async obtenerMisCreditos(req, res) {
    try {
      const id_usuario = req.user?.id_usuario;
      if (!id_usuario) return error(res, 'Usuario no autenticado', 401);

      const creditos = await Credito.findByUsuario(id_usuario);
      success(res, creditos, 'Créditos obtenidos');
    } catch (err) {
      console.error('Error obteniendo créditos:', err);
      error(res, 'Error interno al obtener créditos', 500);
    }
  }

  // Obtener detalle de un crédito específico
  static async obtenerCredito(req, res) {
    try {
      const { id } = req.params;
      const id_usuario = req.user?.id_usuario;
      if (!id_usuario) return error(res, 'Usuario no autenticado', 401);

      const credito = await Credito.findById(id);
      if (!credito) return error(res, 'Crédito no encontrado', 404);

      // Verificar que el usuario sea el dueño del crédito
      const [rows] = await pool.execute(
        `SELECT e.id_usuario FROM creditos c
         INNER JOIN solicitudes s ON c.id_solicitud = s.id_solicitud
         INNER JOIN emprendimientos e ON s.id_emprendedor = e.id_emprendimiento
         WHERE c.id_credito = ?`,
        [id]
      );

      if (rows.length === 0 || rows[0].id_usuario !== id_usuario) {
        return error(res, 'No autorizado para ver este crédito', 403);
      }

      success(res, credito, 'Crédito obtenido');
    } catch (err) {
      console.error('Error obteniendo crédito:', err);
      error(res, 'Error interno al obtener crédito', 500);
    }
  }

  // Obtener calendario de pagos de un crédito
  static async obtenerCalendarioPagos(req, res) {
    try {
      const { id } = req.params;
      const id_usuario = req.user?.id_usuario;
      if (!id_usuario) return error(res, 'Usuario no autenticado', 401);

      // Verificar autorización
      const [rows] = await pool.execute(
        `SELECT e.id_usuario FROM creditos c
         INNER JOIN solicitudes s ON c.id_solicitud = s.id_solicitud
         INNER JOIN emprendimientos e ON s.id_emprendedor = e.id_emprendimiento
         WHERE c.id_credito = ?`,
        [id]
      );

      if (rows.length === 0 || rows[0].id_usuario !== id_usuario) {
        return error(res, 'No autorizado', 403);
      }

      const cuotas = await CreditoService.obtenerCalendarioPagos(id);
      success(res, cuotas, 'Calendario de pagos obtenido');
    } catch (err) {
      console.error('Error obteniendo calendario:', err);
      error(res, 'Error interno al obtener calendario', 500);
    }
  }

  // Obtener resumen de crédito (deuda, mora, etc)
  static async obtenerResumenCredito(req, res) {
    try {
      const { id } = req.params;
      const id_usuario = req.user?.id_usuario;
      if (!id_usuario) return error(res, 'Usuario no autenticado', 401);

      // Verificar autorización
      const [rows] = await pool.execute(
        `SELECT e.id_usuario FROM creditos c
         INNER JOIN solicitudes s ON c.id_solicitud = s.id_solicitud
         INNER JOIN emprendimientos e ON s.id_emprendedor = e.id_emprendimiento
         WHERE c.id_credito = ?`,
        [id]
      );

      if (rows.length === 0 || rows[0].id_usuario !== id_usuario) {
        return error(res, 'No autorizado', 403);
      }

      const resumen = await CreditoService.obtenerResumenCredito(id);
      success(res, resumen, 'Resumen de crédito obtenido');
    } catch (err) {
      console.error('Error obteniendo resumen:', err);
      error(res, 'Error interno al obtener resumen', 500);
    }
  }

  // Registrar pago de una cuota
  static async registrarPago(req, res) {
    try {
      const { id_cuota, monto_recibido, metodo_pago = 'efectivo', referencia_pago, observaciones } = req.body;
      const id_usuario = req.user?.id_usuario;

      if (!id_usuario) return error(res, 'Usuario no autenticado', 401);
      if (!id_cuota || !monto_recibido) return error(res, 'Datos incompletos', 400);

      // Obtener cuota
      const [cuotaRows] = await pool.execute(
        `SELECT c.*, cr.id_credito FROM cuotas c
         INNER JOIN creditos cr ON c.id_credito = cr.id_credito
         WHERE c.id_cuota = ?`,
        [id_cuota]
      );

      if (cuotaRows.length === 0) return error(res, 'Cuota no encontrada', 404);

      const cuota = cuotaRows[0];
      const montoPendiente = cuota.monto_esperado - (cuota.monto_pagado || 0);

      if (monto_recibido > montoPendiente) {
        return error(res, 'El monto excede lo adeudado', 400);
      }

      // Registrar pago
      const [result] = await pool.execute(
        `INSERT INTO pagos 
         (id_cuota, monto_recibido, metodo_pago, referencia_pago, observaciones)
         VALUES (?, ?, ?, ?, ?)`,
        [id_cuota, monto_recibido, metodo_pago, referencia_pago || null, observaciones || null]
      );

      // Actualizar cuota
      const nuevoMontoPagado = (cuota.monto_pagado || 0) + monto_recibido;
      const nuevoEstado = nuevoMontoPagado === cuota.monto_esperado ? 'pagada' : 'pendiente';

      await pool.execute(
        `UPDATE cuotas 
         SET monto_pagado = ?, estado = ?, fecha_pago = CURRENT_TIMESTAMP
         WHERE id_cuota = ?`,
        [nuevoMontoPagado, nuevoEstado, id_cuota]
      );

      const pagoRegistrado = {
        id_pago: result.insertId,
        id_cuota,
        monto_recibido,
        fecha_pago: new Date(),
        cuota_completada: nuevoEstado === 'pagada'
      };

      success(res, pagoRegistrado, 'Pago registrado exitosamente');
    } catch (err) {
      console.error('Error registrando pago:', err);
      error(res, 'Error interno al registrar pago', 500);
    }
  }

  // Obtener historial de pagos de una cuota
  static async obtenerHistorialPagos(req, res) {
    try {
      const { id_cuota } = req.params;
      const id_usuario = req.user?.id_usuario;
      if (!id_usuario) return error(res, 'Usuario no autenticado', 401);

      const [pagos] = await pool.execute(
        `SELECT p.* FROM pagos p
         INNER JOIN cuotas c ON p.id_cuota = c.id_cuota
         INNER JOIN creditos cr ON c.id_credito = cr.id_credito
         INNER JOIN solicitudes s ON cr.id_solicitud = s.id_solicitud
         INNER JOIN emprendimientos e ON s.id_emprendedor = e.id_emprendimiento
         WHERE p.id_cuota = ? AND e.id_usuario = ?
         ORDER BY p.fecha_pago DESC`,
        [id_cuota, id_usuario]
      );

      success(res, pagos, 'Historial de pagos obtenido');
    } catch (err) {
      console.error('Error obteniendo historial:', err);
      error(res, 'Error interno al obtener historial', 500);
    }
  }
}