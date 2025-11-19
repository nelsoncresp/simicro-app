import pool from '../config/database.js';
import { Credito } from '../models/Credito.js';

export class CreditoService {
  /**
   * Calcula la cuota mensual usando el método francés
   */
  static calculateMonthlyPayment(principal, tasaMensual, numCuotas) {
    if (tasaMensual === 0) {
      return principal / numCuotas;
    }
    
    const tasaDecimal = tasaMensual / 100;
    const numerador = tasaDecimal * Math.pow(1 + tasaDecimal, numCuotas);
    const denominador = Math.pow(1 + tasaDecimal, numCuotas) - 1;
    
    return principal * (numerador / denominador);
  }

  /**
   * Genera el calendario de cuotas con interés fijo
   * Fórmula: Total = Monto + (Monto × Tasa Anual × Meses/12)
   */
  static async generarCuotas(id_credito, monto, plazo_meses, tasa_interes_anual) {
    const numCuotas = plazo_meses;
    
    // Calcular interés total usando fórmula simple
    const totalInteres = monto * (tasa_interes_anual / 100) * (plazo_meses / 12);
    const montoTotal = monto + totalInteres;
    
    // Cuota mensual fija
    const cuotaMensual = montoTotal / numCuotas;
    
    // Interés fijo por cuota (distribuido equitativamente)
    const interesPorCuota = totalInteres / numCuotas;
    
    // Capital fijo por cuota
    const capitalPorCuota = monto / numCuotas;
    
    const cuotas = [];
    const hoy = new Date();

    for (let i = 1; i <= numCuotas; i++) {
      const fechaVencimiento = new Date(hoy);
      fechaVencimiento.setMonth(fechaVencimiento.getMonth() + i);

      // Redondear a 2 decimales
      const montoEsperado = Math.round(cuotaMensual * 100) / 100;
      const capital = Math.round(capitalPorCuota * 100) / 100;
      const interes = Math.round(interesPorCuota * 100) / 100;

      const [result] = await pool.execute(
        `INSERT INTO cuotas 
         (id_credito, numero_cuota, fecha_vencimiento, monto_esperado, capital, interes, estado)
         VALUES (?, ?, ?, ?, ?, ?, 'pendiente')`,
        [
          id_credito,
          i,
          fechaVencimiento.toISOString().split('T')[0],
          montoEsperado,
          capital,
          interes
        ]
      );

      cuotas.push({
        id_cuota: result.insertId,
        numero_cuota: i,
        fecha_vencimiento: fechaVencimiento,
        monto_esperado: montoEsperado,
        capital: capital,
        interes: interes
      });
    }

    return cuotas;
  }

  /**
   * Obtener calendario de pagos de un crédito
   */
  static async obtenerCalendarioPagos(id_credito) {
    const [cuotas] = await pool.execute(
      `SELECT * FROM cuotas WHERE id_credito = ? ORDER BY numero_cuota ASC`,
      [id_credito]
    );
    return cuotas;
  }

  /**
   * Calcular mora de una cuota
   */
  static calcularMora(fecha_vencimiento) {
    const hoy = new Date();
    const diasMora = Math.floor((hoy - new Date(fecha_vencimiento)) / (1000 * 60 * 60 * 24));
    return Math.max(0, diasMora);
  }

  /**
   * Calcular multa por mora (2% mensual)
   */
  static calcularMultaMora(monto_pendiente, diasMora, tasaMora = 2) {
    const mesesMora = diasMora / 30;
    return Math.round((monto_pendiente * tasaMora * mesesMora) * 100) / 100;
  }

  /**
   * Calcular mora total de un crédito y actualizar en BD
   */
  static async calcularYActualizarMoraCredito(id_credito) {
    const cuotas = await this.obtenerCalendarioPagos(id_credito);
    let totalMora = 0;

    cuotas.forEach(cuota => {
      if (cuota.estado !== 'pagada') {
        const diasMora = this.calcularMora(cuota.fecha_vencimiento);
        const montoPendiente = cuota.monto_esperado - (cuota.monto_pagado || 0);

        if (diasMora > 0) {
          const multaMora = this.calcularMultaMora(montoPendiente, diasMora);
          totalMora += multaMora;
        }
      }
    });

    // Actualizar mora en tabla creditos
    await Credito.updateMoraAcumulada(id_credito, Math.round(totalMora * 100) / 100);
    
    return Math.round(totalMora * 100) / 100;
  }

  /**
   * Obtener resumen completo de crédito (actualiza mora antes de retornar)
   */
  static async obtenerResumenCredito(id_credito) {
    const credito = await Credito.findById(id_credito);
    if (!credito) return null;

    // Calcular y actualizar mora
    const totalMora = await this.calcularYActualizarMoraCredito(id_credito);

    const cuotas = await this.obtenerCalendarioPagos(id_credito);

    let totalPagado = 0;
    let totalPendiente = 0;
    let cuotasConMora = [];

    cuotas.forEach(cuota => {
      totalPagado += cuota.monto_pagado || 0;

      if (cuota.estado === 'pagada') {
        // Ya pagada
      } else {
        const diasMora = this.calcularMora(cuota.fecha_vencimiento);
        const montoPendiente = cuota.monto_esperado - (cuota.monto_pagado || 0);

        if (diasMora > 0) {
          const multaMora = this.calcularMultaMora(montoPendiente, diasMora);
          cuotasConMora.push({
            numero_cuota: cuota.numero_cuota,
            fecha_vencimiento: cuota.fecha_vencimiento,
            diasMora,
            montoPendiente,
            multaMora
          });
        }

        totalPendiente += montoPendiente;
      }
    });

    return {
      id_credito,
      emprendedor: credito.nombre,
      monto_total: credito.monto_desembolsado,
      totalPagado: Math.round(totalPagado * 100) / 100,
      totalPendiente: Math.round(totalPendiente * 100) / 100,
      totalMora: Math.round(totalMora * 100) / 100,
      estado: credito.estado,
      cuotas_totales: cuotas.length,
      cuotas_pagadas: cuotas.filter(c => c.estado === 'pagada').length,
      cuotas_pendientes: cuotas.filter(c => c.estado !== 'pagada').length,
      cuotas_con_mora: cuotasConMora
    };
  }

  /**
   * Actualizar estado de cuotas vencidas
   */
  static async actualizarCuotasVencidas() {
    const hoy = new Date().toISOString().split('T')[0];
    await pool.execute(
      `UPDATE cuotas 
       SET estado = 'vencida' 
       WHERE fecha_vencimiento < ? AND estado = 'pendiente'`,
      [hoy]
    );
  }
}
