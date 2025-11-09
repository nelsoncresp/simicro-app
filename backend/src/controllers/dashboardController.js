import { DashboardService } from '../services/dashboard.service.js';
import { success, error } from '../utils/responses.js';

export class DashboardController {
  // Dashboard general (admin)
  static async getDashboardGeneral(req, res) {
    try {
      const metricas = await DashboardService.getMetricasGenerales();
      const graficos = await DashboardService.getDatosGraficos();

      success(res, {
        ...metricas,
        graficos
      }, 'Dashboard general obtenido');

    } catch (err) {
      console.error('Error obteniendo dashboard:', err);
      error(res, 'Error obteniendo dashboard', 500);
    }
  }

  // Métricas para analistas
  static async getMetricas(req, res) {
    try {
      const metricas = await DashboardService.getMetricasAnalista();
      success(res, metricas, 'Métricas obtenidas');
    } catch (err) {
      console.error('Error obteniendo métricas:', err);
      error(res, 'Error obteniendo métricas', 500);
    }
  }

  // Dashboard emprendedor
  static async getDashboardEmprendedor(req, res) {
    try {
      // Obtener emprendedor del usuario autenticado
      const { Emprendedor } = await import('../models/Emprendedor.js');
      const emprendedor = await Emprendedor.findByUserId(req.user.id_usuario);

      if (!emprendedor) {
        return error(res, 'Perfil de emprendedor no encontrado', 404);
      }

      // Obtener créditos del emprendedor
      const { Credito } = await import('../models/Credito.js');
      const creditos = await Credito.findByEmprendedor(emprendedor.id_emprendedor);

      // Obtener cuotas pendientes
      let proximoVencimiento = null;
      let totalPendiente = 0;

      for (let credito of creditos) {
        const { Cuota } = await import('../models/Cuota.js');
        const cuotasPendientes = await Cuota.findPendientesByCredito(credito.id_credito);
        
        totalPendiente += cuotasPendientes.reduce((sum, cuota) => 
          sum + parseFloat(cuota.monto_esperado), 0
        );

        if (cuotasPendientes.length > 0) {
          const proxima = cuotasPendientes[0];
          if (!proximoVencimiento || new Date(proxima.fecha_vencimiento) < new Date(proximoVencimiento.fecha_vencimiento)) {
            proximoVencimiento = proxima;
          }
        }
      }

      success(res, {
        emprendedor,
        resumen: {
          totalCreditos: creditos.length,
          totalPendiente: Number(totalPendiente.toFixed(2)),
          proximoVencimiento,
          creditosActivos: creditos.filter(c => c.estado === 'activo').length
        },
        creditos
      }, 'Dashboard emprendedor obtenido');

    } catch (err) {
      console.error('Error obteniendo dashboard emprendedor:', err);
      error(res, 'Error obteniendo dashboard emprendedor', 500);
    }
  }
}