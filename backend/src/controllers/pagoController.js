import { Pago } from '../models/Pago.js';
import { Cuota } from '../models/Cuota.js';
import { success, error } from '../utils/responses.js';

export class PagoController {
  // Registrar pago
  static async registrarPago(req, res) {
    try {
      const { id_cuota, monto_recibido, metodo_pago, referencia_pago, observaciones } = req.body;

      if (!id_cuota || !monto_recibido) {
        return error(res, 'ID de cuota y monto son requeridos', 400);
      }

      // Verificar que la cuota existe y está pendiente
      const cuota = await Cuota.findById(id_cuota);
      if (!cuota) {
        return error(res, 'Cuota no encontrada', 404);
      }

      if (cuota.estado === 'pagada') {
        return error(res, 'La cuota ya fue pagada', 400);
      }

      // Registrar pago (esto actualiza la cuota y el saldo del crédito automáticamente)
      const cuotaActualizada = await Cuota.registrarPago(
        id_cuota, 
        parseFloat(monto_recibido), 
        metodo_pago || 'efectivo',
        referencia_pago,
        observaciones 
      );

      success(res, { cuota: cuotaActualizada }, 'Pago registrado exitosamente');

    } catch (err) {
      console.error('Error registrando pago:', err);
      error(res, 'Error registrando pago', 500);
    }
  }

  // Obtener historial de pagos por crédito
  static async obtenerPagosPorCredito(req, res) {
    try {
      const { idCredito } = req.params;
      const pagos = await Pago.findByCredito(idCredito);
      success(res, pagos, 'Pagos obtenidos');
    } catch (err) {
      console.error('Error obteniendo pagos:', err);
      error(res, 'Error obteniendo pagos', 500);
    }
  }

  // Obtener pagos del día
  static async obtenerPagosDelDia(req, res) {
    try {
      const hoy = new Date().toISOString().split('T')[0];
      const pagos = await Pago.findByFecha(hoy, hoy);
      const total = await Pago.getTotalPorDia(hoy);

      success(res, { pagos, total }, 'Pagos del día obtenidos');
    } catch (err) {
      console.error('Error obteniendo pagos del día:', err);
      error(res, 'Error obteniendo pagos del día', 500);
    }
  }
}