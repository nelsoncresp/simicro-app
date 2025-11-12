// controllers/solicitudController.js
import { Solicitud } from '../models/Solicitud.js';
import { Emprendimiento } from '../models/Emprendedor.js';
import { success, error } from '../utils/responses.js';
import { calcularRatio, generarCuotas } from '../utils/helpers.js';

export class SolicitudController {
  // 🧾 Crear solicitud del usuario autenticado
  static async crearSolicitud(req, res) {
    try {
      const { monto_solicitado, plazo_semanas } = req.body;
      const id_usuario = req.user?.id_usuario;

      if (!id_usuario) return error(res, 'Usuario no autenticado', 401);
      if (!monto_solicitado || !plazo_semanas)
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
        estado,
        calificacion_riesgo: riesgo,
        ratio_cuota_utilidad: ratio,
        motivo_decision: motivo
      });

      const planPagos = estado === 'pre-aprobado' ? generarCuotas(monto_solicitado, plazo_semanas) : null;

      success(res, { solicitud, planPagos }, 'Solicitud creada exitosamente');
    } catch (err) {
      console.error('Error creando solicitud:', err);
      error(res, 'Error interno al crear solicitud', 500);
    }
  }

  // 📋 Obtener todas las solicitudes (admin o analista)
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

  // 🙋‍♂️ Obtener solicitudes del usuario autenticado
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

  // 📄 Obtener solicitud específica
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

  // ✅ Decidir (aprobar o rechazar)
  static async decidirSolicitud(req, res) {
    try {
      const { id } = req.params;
      const { accion } = req.body;
      const solicitud = await Solicitud.findById(id);
      if (!solicitud) return error(res, 'Solicitud no encontrada', 404);

      if (solicitud.estado !== 'pre-aprobado')
        return error(res, 'Solo se pueden decidir solicitudes pre-aprobadas', 400);

      const nuevoEstado = accion === 'aprobar' ? 'aprobado' : 'rechazado';
      await Solicitud.updateEstado(id, nuevoEstado);

      success(res, { id, estado: nuevoEstado }, `Solicitud ${nuevoEstado}`);
    } catch (err) {
      console.error('Error decidiendo solicitud:', err);
      error(res, 'Error interno al decidir solicitud', 500);
    }
  }
}
