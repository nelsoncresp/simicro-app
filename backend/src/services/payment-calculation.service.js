export class PaymentCalculationService {
  // Calcular distribución de pago (cuota normal + mora)
  static calcularDistribucionPago(montoPagado, montoCuota, montoMora = 0) {
    let aplicadoCuota = 0;
    let aplicadoMora = 0;
    let sobrante = 0;

    // Primero cubrir la mora
    if (montoMora > 0) {
      aplicadoMora = Math.min(montoPagado, montoMora);
      montoPagado -= aplicadoMora;
    }

    // Luego cubrir la cuota
    if (montoPagado > 0) {
      aplicadoCuota = Math.min(montoPagado, montoCuota);
      montoPagado -= aplicadoCuota;
    }

    // Sobrante (pago adelantado)
    sobrante = montoPagado;

    return {
      aplicadoCuota: Number(aplicadoCuota.toFixed(2)),
      aplicadoMora: Number(aplicadoMora.toFixed(2)),
      sobrante: Number(sobrante.toFixed(2)),
      completo: aplicadoCuota >= montoCuota && aplicadoMora >= montoMora
    };
  }

  // Validar si el pago cubre los montos mínimos
  static validarPagoMinimo(montoPagado, montoCuota, montoMora = 0) {
    const minimoRequerido = montoCuota + montoMora;
    return {
      esValido: montoPagado >= minimoRequerido,
      minimoRequerido: Number(minimoRequerido.toFixed(2)),
      falta: Number(Math.max(0, minimoRequerido - montoPagado).toFixed(2))
    };
  }

  // Calcular próximo vencimiento
  static calcularProximoVencimiento(cuotasPendientes) {
    if (!cuotasPendientes || cuotasPendientes.length === 0) {
      return null;
    }

    // Ordenar por fecha de vencimiento y tomar la más próxima
    const proximaCuota = cuotasPendientes
      .filter(cuota => cuota.estado === 'pendiente')
      .sort((a, b) => new Date(a.fecha_vencimiento) - new Date(b.fecha_vencimiento))[0];

    return proximaCuota || null;
  }
}