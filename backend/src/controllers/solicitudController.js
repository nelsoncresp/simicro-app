// controllers/solicitudController.js
import { Solicitud } from '../models/Solicitud.js';
import { Credito } from '../models/Credito.js';
import { Emprendimiento } from '../models/Emprendedor.js';
import { CreditoService } from '../services/CreditoService.js';
import { success, error } from '../utils/responses.js';
import { calcularRatio, generarCuotas } from '../utils/helpers.js';

export class SolicitudController {
  // Crear solicitud del usuario autenticado
  static async crearSolicitud(req, res) {
    try {
      const { monto_solicitado, plazo_semanas, motivo_prestamo } = req.body;
      const id_usuario = req.user?.id_usuario;
      console.log('AQUIII:', motivo_prestamo)
      if (!id_usuario) return error(res, 'Usuario no autenticado', 401);
      if (!monto_solicitado || !plazo_semanas || !motivo_prestamo)
        return error(res, 'Datos incompletos', 400);

      // Obtener emprendimiento asociado al usuario logueado
      const emprendimiento = await Emprendimiento.findByUserId(id_usuario);
      if (!emprendimiento) return error(res, 'Emprendimiento no encontrado', 404);

      const id_emprendedor = emprendimiento.id_emprendimiento;

      // Evaluación de riesgo
      const parsearMeses = (t) => {
        if (!t) return 0;
        const texto = t.toLowerCase();
        const matchAnios = texto.match(/(\d+)\s*(año|años|ano)/);
        if (matchAnios) return parseInt(matchAnios[1]) * 12;
        const matchMeses = texto.match(/(\d+)\s*mes/);
        if (matchMeses) return parseInt(matchMeses[1]);
        return parseInt(texto) || 0;
      };

      const mesesAntiguedad = parsearMeses(emprendimiento.tiempo_funcionamiento);
      if (mesesAntiguedad < 6) {
        const solicitud = await Solicitud.create({
          id_emprendedor,
          monto_solicitado,
          plazo_semanas,
          motivo_prestamo,
          estado: 'rechazado',
          calificacion_riesgo: 'alto',
          motivo_decision: 'Negocio con menos de 6 meses de antigüedad'
        });
        return success(res, solicitud, 'Solicitud rechazada por antigüedad');
      }

      // Calcular ratio y riesgo
      const cuotaSemanal = monto_solicitado / plazo_semanas;
      const ingresoMensual = Number(emprendimiento.ingresos_mensuales) || 0;
      const ingresoDiario = ingresoMensual / 30;
      const ratio = calcularRatio(ingresoDiario, cuotaSemanal);

      let estado = 'pre-aprobado';
      let riesgo = ratio < 25 ? 'bajo' : 'medio';
      let motivo = `Solicitud pre-aprobada. Ratio: ${ratio.toFixed(2)}%`;

      if (ratio >= 40) {
        estado = 'rechazado';
        riesgo = 'alto';
        motivo = `Capacidad de pago insuficiente. Ratio: ${ratio.toFixed(2)}%`;
      }

      const solicitud = await Solicitud.create({
        id_emprendedor,
        monto_solicitado,
        plazo_semanas,
        motivo_prestamo,
        estado,
        calificacion_riesgo: riesgo,
        ratio_cuota_utilidad: ratio,
        motivo_decision: motivo
      });

      success(res, { solicitud}, 'Solicitud creada exitosamente');
    } catch (err) {
      console.error('Error creando solicitud:', err);
      error(res, 'Error interno al crear solicitud', 500);
    }
  }

  //  Obtener todas las solicitudes (admin o analista)
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
      error(res, 'Error interno al obtener solicitudes', 500);
    }
  }

  // Obtener solicitudes del usuario autenticado
  static async obtenerSolicitudesUsuario(req, res) {
    try {
      const id_usuario = req.user?.id_usuario;
      if (!id_usuario) return error(res, 'Usuario no autenticado', 401);

      const solicitudes = await Solicitud.findByUsuario(id_usuario);
      success(res, solicitudes, 'Solicitudes del usuario obtenidas');
    } catch (err) {
      console.error('Error obteniendo solicitudes del usuario:', err);
      error(res, 'Error interno al obtener solicitudes del usuario', 500);
    }
  }

  //  Obtener solicitud específica
  static async obtenerSolicitud(req, res) {
    try {
      const { id } = req.params;
      const solicitud = await Solicitud.findById(id);
      if (!solicitud) return error(res, 'Solicitud no encontrada', 404);
      success(res, solicitud, 'Solicitud obtenida');
    } catch (err) {
      console.error('Error obteniendo solicitud:', err);
      error(res, 'Error interno al obtener solicitud', 500);
    }
  }

  // 🆕 Actualizar solicitud (análisis del analista)
  static async actualizarSolicitud(req, res) {
    try {
      const { id } = req.params;
      const { observaciones_analista } = req.body;
      const id_analista = req.user?.id_usuario;

      if (!id_analista) return error(res, 'Usuario no autenticado', 401);

      const solicitud = await Solicitud.findById(id);
      if (!solicitud) return error(res, 'Solicitud no encontrada', 404);

      if (solicitud.estado !== 'pre-aprobado') {
        return error(res, 'Solo se pueden analizar solicitudes pre-aprobadas', 400);
      }

      const solicitudActualizada = await Solicitud.updateAnalisis(
        id,
        id_analista,
        observaciones_analista || null
      );

      success(res, solicitudActualizada, 'Solicitud analizada exitosamente');
    } catch (err) {
      console.error('Error actualizando solicitud:', err);
      error(res, 'Error interno al actualizar solicitud', 500);
    }
  }

  // 🔄 Decidir solicitud (solo Analista) - Ahora crea crédito si aprueba
  static async decidirSolicitud(req, res) {
    try {
      const { id } = req.params;
      const { accion } = req.body;

      const solicitud = await Solicitud.findById(id);
      if (!solicitud) return error(res, 'Solicitud no encontrada', 404);

      if (solicitud.estado !== 'pre-aprobado') {
        return error(res, 'Solo se pueden decidir solicitudes pre-aprobadas', 400);
      }

      if (accion === 'aprobar') {
        // 1️⃣ Actualizar estado de solicitud a 'aprobado'
        await Solicitud.decidirSolicitud(id, 'aprobar');

        // 2️⃣ Crear crédito automáticamente
        const creditoData = {
          id_solicitud: id,
          monto_desembolsado: solicitud.monto_solicitado,
          tasa_interes: 2.0,
          plazo_semanas: solicitud.plazo_semanas
        };

        const nuevoCredito = await Credito.create(creditoData);

        // 3️⃣ Generar cuotas
        await CreditoService.generarCuotas(
          nuevoCredito.id_credito,
          solicitud.monto_solicitado,
          solicitud.plazo_semanas,
          2.0
        );

        // 4️⃣ Actualizar solicitud a estado 'activo'
        await Solicitud.updateEstado(id, 'activo');

        success(res, 
          { 
            solicitud: { id, estado: 'aprobado' }, 
            credito: nuevoCredito 
          }, 
          'Solicitud aprobada y crédito creado exitosamente'
        );
      } else {
        // Rechazar
        await Solicitud.decidirSolicitud(id, 'rechazar');
        success(res, { id, estado: 'rechazado' }, 'Solicitud rechazada');
      }
    } catch (err) {
      console.error('Error decidiendo solicitud:', err);
      error(res, 'Error interno al decidir solicitud', 500);
    }
  }
}
