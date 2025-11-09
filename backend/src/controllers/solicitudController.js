import { Solicitud } from '../models/Solicitud.js';
import { Emprendedor } from '../models/Emprendedor.js';
import { success, error } from '../utils/responses.js';
import { calcularRatio, generarCuotas } from '../utils/helpers.js';

export class SolicitudController {
  // Crear solicitud de crédito
  static async crearSolicitud(req, res) {
    try {
      const { id_emprendedor, monto_solicitado, plazo_semanas } = req.body;

      // Validaciones
      if (!id_emprendedor || !monto_solicitado || !plazo_semanas) {
        return error(res, 'Datos incompletos', 400);
      }

      // Verificar emprendedor
      const emprendedor = await Emprendedor.findById(id_emprendedor);
      if (!emprendedor) {
        return error(res, 'Emprendedor no encontrado', 404);
      }

      // EVALUACIÓN DE RIESGO (Lógica de negocio)
      
      // 1. Filtro de antigüedad (6 meses mínimo)
      if (emprendedor.antiguedad_meses < 6) {
        const solicitudRechazada = await Solicitud.create({
          id_emprendedor,
          monto_solicitado,
          plazo_semanas,
          estado: 'rechazado',
          calificacion_riesgo: 'alto',
          motivo_decision: 'Antigüedad del negocio insuficiente (mínimo 6 meses requeridos)'
        });

        return success(res, { 
          solicitud: solicitudRechazada,
          evaluacion: { aprobado: false, motivo: 'Antigüedad insuficiente' }
        }, 'Solicitud evaluada - Rechazada');
      }

      // 2. Cálculo de capacidad de pago
      const cuotaSemanal = monto_solicitado / plazo_semanas;
      const ratio = calcularRatio(emprendedor.ingreso_neto_diario, cuotaSemanal);

      let estado, calificacion_riesgo, motivo;

      if (ratio >= 40) {
        // Rechazar por capacidad de pago
        estado = 'rechazado';
        calificacion_riesgo = 'alto';
        motivo = `Capacidad de pago insuficiente. Ratio: ${ratio.toFixed(2)}% (máximo 40%)`;
      } else {
        // Pre-aprobar
        estado = 'pre-aprobado';
        calificacion_riesgo = ratio < 25 ? 'bajo' : 'medio';
        motivo = `Solicitud pre-aprobada. Ratio: ${ratio.toFixed(2)}%`;
      }

      // Crear solicitud
      const solicitud = await Solicitud.create({
        id_emprendedor,
        monto_solicitado,
        plazo_semanas,
        estado,
        calificacion_riesgo,
        ratio_cuota_utilidad: ratio,
        motivo_decision: motivo
      });

      // Generar plan de pagos para solicitudes pre-aprobadas
      let planPagos = null;
      if (estado === 'pre-aprobado') {
        planPagos = generarCuotas(monto_solicitado, plazo_semanas);
      }

      success(res, { 
        solicitud, 
        evaluacion: { 
          aprobado: estado === 'pre-aprobado',
          ratio: ratio.toFixed(2),
          motivo 
        },
        planPagos 
      }, 'Solicitud evaluada exitosamente');

    } catch (err) {
      console.error('Error creando solicitud:', err);
      error(res, 'Error creando solicitud', 500);
    }
  }

  // Obtener todas las solicitudes
  static async obtenerSolicitudes(req, res) {
    try {
      const { estado, limit } = req.query;
      const filters = {};

      if (estado) filters.estado = estado;
      if (limit) filters.limit = parseInt(limit);

      const solicitudes = await Solicitud.findAll(filters);
      success(res, solicitudes, 'Solicitudes obtenidas');

    } catch (err) {
      console.error('Error obteniendo solicitudes:', err);
      error(res, 'Error obteniendo solicitudes', 500);
    }
  }

  // Obtener solicitud por ID
  static async obtenerSolicitud(req, res) {
    try {
      const { id } = req.params;
      const solicitud = await Solicitud.findById(id);

      if (!solicitud) {
        return error(res, 'Solicitud no encontrada', 404);
      }

      success(res, solicitud, 'Solicitud obtenida');

    } catch (err) {
      console.error('Error obteniendo solicitud:', err);
      error(res, 'Error obteniendo solicitud', 500);
    }
  }

  // Aprobar/rechazar solicitud (admin)
  static async decidirSolicitud(req, res) {
    try {
      const { id } = req.params;
      const { accion } = req.body; // 'aprobar' o 'rechazar'

      const solicitud = await Solicitud.findById(id);
      if (!solicitud) {
        return error(res, 'Solicitud no encontrada', 404);
      }

      if (solicitud.estado !== 'pre-aprobado') {
        return error(res, 'Solo se pueden decidir solicitudes pre-aprobadas', 400);
      }

      const nuevoEstado = accion === 'aprobar' ? 'aprobado' : 'rechazado';
      
      await Solicitud.updateEstado(id, nuevoEstado);

      // Si se aprueba, crear el crédito
      if (accion === 'aprobar') {
        const { Credito } = await import('../models/Credito.js');
        await Credito.crearDesdeSolicitud(solicitud);
      }

      const solicitudActualizada = await Solicitud.findById(id);
      success(res, solicitudActualizada, `Solicitud ${accion}da`);

    } catch (err) {
      console.error('Error decidiendo solicitud:', err);
      error(res, 'Error decidiendo solicitud', 500);
    }
  }
}