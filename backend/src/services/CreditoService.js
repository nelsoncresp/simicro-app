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
   * Genera el calendario de cuotas
   */
  static async generarCuotas(id_credito, monto, plazo_semanas, tasa_interes_anual) {
    const tasaMensual = tasa_interes_anual / 12;
    const numCuotas = Math.ceil(plazo_semanas / 4.33); // Convertir semanas a meses aprox

    const cuotaMensual = this.calculateMonthlyPayment(monto, tasaMensual, numCuotas);
    let saldoRestante = monto;
    const cuotas = [];

    const hoy = new Date();

    for (let i = 1; i <= numCuotas; i++) {
      const fechaVencimiento = new Date(hoy);
      fechaVencimiento.setMonth(fechaVencimiento.getMonth() + i);

      const interes = (saldoRestante * tasaMensual) / 100;
      const capital = cuotaMensual - interes;

      const [result] = await pool.execute(
        `INSERT INTO cuotas 
         (id_credito, numero_cuota, fecha_vencimiento, monto_esperado, capital, interes, estado)
         VALUES (?, ?, ?, ?, ?, ?, 'pendiente')`,
        [
          id_credito,
          i,
          fechaVencimiento.toISOString().split('T')[0],
          Math.round(cuotaMensual * 100) / 100,
          Math.round(capital * 100) / 100,
          Math.round(interes * 100) / 100
        ]
      );

      cuotas.push({
        id_cuota: result.insertId,
        numero_cuota: i,
        fecha_vencimiento: fechaVencimiento,
        monto_esperado: Math.round(cuotaMensual * 100) / 100,
        capital: Math.round(capital * 100) / 100,
        interes: Math.round(interes * 100) / 100
      });

      saldoRestante -= capital;
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
   * Obtener resumen completo de crédito
   */
  static async obtenerResumenCredito(id_credito) {
    const credito = await Credito.findById(id_credito);
    if (!credito) return null;

    const cuotas = await this.obtenerCalendarioPagos(id_credito);

    let totalPagado = 0;
    let totalPendiente = 0;
    let totalMora = 0;
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
          totalMora += multaMora;
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
