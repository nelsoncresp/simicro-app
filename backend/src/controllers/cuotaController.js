import { Cuota } from '../models/Cuota.js';
import { Pago } from '../models/Pago.js';
import { Credito } from '../models/Credito.js';
import { CreditoService } from '../services/CreditoService.js';
import { success, error } from '../utils/responses.js';

export class CuotaController {
  // Obtener todas las cuotas del usuario
  static async obtenerMisCuotas(req, res) {
    try {
      const id_usuario = req.user?.id_usuario;
      if (!id_usuario) return error(res, 'Usuario no autenticado', 401);

      const cuotas = await Cuota.findByUsuario(id_usuario);
      success(res, cuotas, 'Cuotas obtenidas exitosamente');
    } catch (err) {
      console.error('Error obteniendo cuotas:', err);
      error(res, 'Error interno al obtener cuotas', 500);
    }
  }

  // Obtener cuotas pendientes del usuario
  static async obtenerCuotasPendientes(req, res) {
    try {
      const id_usuario = req.user?.id_usuario;
      if (!id_usuario) return error(res, 'Usuario no autenticado', 401);

      const cuotas = await Cuota.findPendientesByUsuario(id_usuario);
      success(res, cuotas, 'Cuotas pendientes obtenidas');
    } catch (err) {
      console.error('Error obteniendo cuotas pendientes:', err);
      error(res, 'Error interno al obtener cuotas pendientes', 500);
    }
  }

  // Obtener detalle de una cuota con pagos
  static async obtenerCuotaDetalle(req, res) {
    try {
      const { id } = req.params;
      const id_usuario = req.user?.id_usuario;
      if (!id_usuario) return error(res, 'Usuario no autenticado', 401);

      const cuota = await Cuota.findByIdConPagos(id);
      if (!cuota) return error(res, 'Cuota no encontrada', 404);

      // Verificar autorización
      const [rows] = await pool.execute(
        `SELECT u.id_usuario FROM cuotas c
         INNER JOIN creditos cr ON c.id_credito = cr.id_credito
         INNER JOIN solicitudes s ON cr.id_solicitud = s.id_solicitud
         INNER JOIN emprendimientos e ON s.id_emprendedor = e.id_emprendimiento
         INNER JOIN usuarios u ON e.id_usuario = u.id_usuario
         WHERE c.id_cuota = ?`,
        [id]
      );

      if (rows.length === 0 || rows[0].id_usuario !== id_usuario) {
        return error(res, 'No autorizado', 403);
      }

      success(res, cuota, 'Detalle de cuota obtenido');
    } catch (err) {
      console.error('Error obteniendo detalle cuota:', err);
      error(res, 'Error interno al obtener cuota', 500);
    }
  }

  // Registrar pago de cuota
  static async registrarPago(req, res) {
    try {
      const { id_cuota, monto_recibido, metodo_pago = 'efectivo', referencia_pago, observaciones } = req.body;
      const id_usuario = req.user?.id_usuario;

      if (!id_usuario) return error(res, 'Usuario no autenticado', 401);
      if (!id_cuota || !monto_recibido) return error(res, 'Datos incompletos', 400);

      // Obtener cuota
      const cuota = await Cuota.findById(id_cuota);
      if (!cuota) return error(res, 'Cuota no encontrada', 404);

      // Verificar autorización
      const [authRows] = await pool.execute(
        `SELECT u.id_usuario FROM cuotas c
         INNER JOIN creditos cr ON c.id_credito = cr.id_credito
         INNER JOIN solicitudes s ON cr.id_solicitud = s.id_solicitud
         INNER JOIN emprendimientos e ON s.id_emprendedor = e.id_emprendimiento
         INNER JOIN usuarios u ON e.id_usuario = u.id_usuario
         WHERE c.id_cuota = ?`,
        [id_cuota]
      );

      if (authRows.length === 0 || authRows[0].id_usuario !== id_usuario) {
        return error(res, 'No autorizado para pagar esta cuota', 403);
      }

      const montoPendiente = cuota.monto_esperado - (cuota.monto_pagado || 0);

      if (monto_recibido <= 0) {
        return error(res, 'El monto debe ser mayor a 0', 400);
      }

      if (monto_recibido > montoPendiente) {
        return error(res, `El monto excede lo adeudado. Pendiente: ${montoPendiente}`, 400);
      }

      // Crear pago
      const pago = await Pago.create({
        id_cuota,
        monto_recibido,
        metodo_pago,
        referencia_pago: referencia_pago || null,
        observaciones: observaciones || null
      });

      // Actualizar cuota
      const nuevoMontoPagado = (cuota.monto_pagado || 0) + monto_recibido;
      const nuevoEstado = nuevoMontoPagado === cuota.monto_esperado ? 'pagada' : 'pendiente';

      await Cuota.updateMontoPagado(id_cuota, nuevoMontoPagado, nuevoEstado);

      // Actualizar mora del crédito si cambió estado
      if (nuevoEstado === 'pagada') {
        await CreditoService.calcularYActualizarMoraCredito(cuota.id_credito);
      }

      success(res, 
        {
          pago,
          cuota_actualizada: {
            id_cuota,
            monto_pagado: nuevoMontoPagado,
            monto_pendiente: montoPendiente - monto_recibido,
            estado: nuevoEstado
          }
        },
        'Pago registrado exitosamente'
      );
    } catch (err) {
      console.error('Error registrando pago:', err);
      error(res, 'Error interno al registrar pago', 500);
    }
  }

  // Obtener historial de pagos del usuario
  static async obtenerHistorialPagos(req, res) {
    try {
      const id_usuario = req.user?.id_usuario;
      if (!id_usuario) return error(res, 'Usuario no autenticado', 401);

      const pagos = await Pago.findByUsuario(id_usuario);
      success(res, pagos, 'Historial de pagos obtenido');
    } catch (err) {
      console.error('Error obteniendo historial:', err);
      error(res, 'Error interno al obtener historial', 500);
    }
  }
}
