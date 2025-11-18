import { DashboardService } from '../services/dashboard.service.js';
import { success, error } from '../utils/responses.js';

export class DashboardController {

  static async getDashboardGeneral(req, res) {
    try {
      const data = await DashboardService.getMetricasGenerales();

      return success(res, {
        ...data,
        montoTotal: Number(data.montoTotal || 0),
        ingresosMensuales: Number(data.ingresosMensuales || 0),
        tasaAprobacion: Number(data.tasaAprobacion || 0),
        actividadReciente: data.actividadReciente || [],
        alertas: data.alertas || []
      }, 'Dashboard general obtenido');

    } catch (err) {
      console.error('Error obteniendo dashboard general:', err);
      return error(res, 'Error obteniendo dashboard general', 500);
    }
  }

  static async getMetricas(req, res) {
    try {
      const data = await DashboardService.getMetricasAnalista();
      return success(res, data, 'Métricas obtenidas');
    } catch (err) {
      console.error('Error obteniendo métricas:', err);
      return error(res, 'Error obteniendo métricas', 500);
    }
  }

  static async getDashboardEmprendedor(req, res) {
    try {
      const { Emprendimiento } = await import('../models/Emprendedor.js');
      const { Credito } = await import('../models/Credito.js');
      const { Cuota } = await import('../models/Cuota.js');

      const usuarioId = req.user.id_usuario;
      const emprendimiento = await Emprendimiento.findByUserId(usuarioId);

      if (!emprendimiento) {
        return error(res, 'No tiene un emprendimiento registrado.', 404);
      }

      const creditos = await Credito.findByEmprendedor(emprendimiento.id_emprendimiento);

      let totalPendiente = 0;
      let proximoVencimiento = null;

      for (const credito of creditos) {
        const cuotasPendientes = await Cuota.findPendientesByCredito(credito.id_credito);

        totalPendiente += cuotasPendientes.reduce((s, c) => s + Number(c.monto_esperado), 0);

        if (cuotasPendientes.length > 0) {
          const primera = cuotasPendientes[0];
          if (!proximoVencimiento || new Date(primera.fecha_vencimiento) < new Date(proximoVencimiento.fecha_vencimiento)) {
            proximoVencimiento = primera;
          }
        }
      }

      return success(res, {
        emprendedor: emprendimiento,
        resumen: {
          totalCreditos: creditos.length,
          creditosActivos: creditos.filter(c => c.estado === 'activo').length,
          totalPendiente: Number(totalPendiente.toFixed(2)),
          proximoVencimiento
        },
        creditos
      }, 'Dashboard emprendedor obtenido');

    } catch (err) {
      console.error('Error obteniendo dashboard emprendedor:', err);
      return error(res, 'Error obteniendo dashboard emprendedor', 500);
    }
  }
}
