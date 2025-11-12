import { Solicitud } from '../models/Solicitud.js';
import { Credito } from '../models/Credito.js';
import { Pago } from '../models/Pago.js';
import { Mora } from '../models/Mora.js';
import { Emprendimiento } from '../models/Emprendedor.js';

export class DashboardService {
  // Obtener métricas generales para admin
  static async getMetricasGenerales() {
    try {
      // Total de solicitudes por estado
      const solicitudesPendientes = await Solicitud.findAll({ estado: 'pendiente' });
      const solicitudesPreAprobadas = await Solicitud.findAll({ estado: 'pre-aprobado' });
      const solicitudesAprobadas = await Solicitud.findAll({ estado: 'aprobado' });

      // Créditos activos
      const creditosActivos = await Credito.findActive();

      // Total de pagos del mes
      const hoy = new Date();
      const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      const ultimoDiaMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
      
      const pagosMes = await Pago.findByFecha(
        primerDiaMes.toISOString().split('T')[0],
        ultimoDiaMes.toISOString().split('T')[0]
      );

      // Resumen de moras
      const morasActivas = await Mora.findActivas();

      // Calcular métricas
      const totalSolicitudes = solicitudesPendientes.length + solicitudesPreAprobadas.length + solicitudesAprobadas.length;
      const totalCartera = creditosActivos.reduce((sum, credito) => 
        sum + parseFloat(credito.saldo_pendiente_total), 0
      );
      const totalPagosMes = pagosMes.reduce((sum, pago) => 
        sum + parseFloat(pago.monto_recibido), 0
      );
      const totalMora = morasActivas.reduce((sum, mora) => 
        sum + parseFloat(mora.monto_penalidad_acumulado), 0
      );

      // Tasa de aprobación
      const tasaAprobacion = totalSolicitudes > 0 
        ? ((solicitudesAprobadas.length + solicitudesPreAprobadas.length) / totalSolicitudes * 100).toFixed(1)
        : 0;

      return {
        metricas: {
          totalSolicitudes,
          solicitudesPendientes: solicitudesPendientes.length,
          solicitudesPreAprobadas: solicitudesPreAprobadas.length,
          solicitudesAprobadas: solicitudesAprobadas.length,
          creditosActivos: creditosActivos.length,
          totalCartera: Number(totalCartera.toFixed(2)),
          totalPagosMes: Number(totalPagosMes.toFixed(2)),
          totalMora: Number(totalMora.toFixed(2)),
          tasaAprobacion: `${tasaAprobacion}%`,
          cuotasEnMora: morasActivas.length
        },
        alertas: morasActivas.length > 0 ? [
          {
            tipo: 'warning',
            mensaje: `${morasActivas.length} cuotas en mora`,
            detalles: `Total en penalidades: $${Number(totalMora.toFixed(2))}`
          }
        ] : []
      };

    } catch (error) {
      console.error('Error obteniendo métricas:', error);
      throw error;
    }
  }

  // Obtener métricas para analistas
  static async getMetricasAnalista() {
    const metricasGenerales = await this.getMetricasGenerales();
    
    // Agregar métricas específicas para analistas
    const pagosHoy = await Pago.getTotalPorDia(new Date().toISOString().split('T')[0]);
    
    return {
      ...metricasGenerales,
      metricas: {
        ...metricasGenerales.metricas,
        pagosHoy: Number(pagosHoy.total || 0)
      }
    };
  }

  // Obtener datos para gráficos
  static async getDatosGraficos(dias = 30) {
    const datos = {
      solicitudesPorEstado: {},
      pagosPorDia: [],
      creditosPorMes: []
    };

    // Solicitudes por estado (últimos 30 días)
    const solicitudesRecientes = await Solicitud.findAll({ limit: 1000 });
    datos.solicitudesPorEstado = this.contarPorEstado(solicitudesRecientes);

    // Pagos por día (últimos 7 días)
    for (let i = 6; i >= 0; i--) {
      const fecha = new Date();
      fecha.setDate(fecha.getDate() - i);
      const fechaStr = fecha.toISOString().split('T')[0];
      
      const totalDia = await Pago.getTotalPorDia(fechaStr);
      datos.pagosPorDia.push({
        fecha: fechaStr,
        total: Number(totalDia.total || 0)
      });
    }

    return datos;
  }

  // Helper: contar solicitudes por estado
  static contarPorEstado(solicitudes) {
    return solicitudes.reduce((acc, solicitud) => {
      acc[solicitud.estado] = (acc[solicitud.estado] || 0) + 1;
      return acc;
    }, {});
  }
}