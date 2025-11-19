export class CreditEvaluationService {
  // Evaluar solicitud completa
  static evaluarSolicitud(solicitudData, emprendedorData) {
    // 1. Validar antigüedad mínima (6 meses)
    const antiguedadValida = this.validarAntiguedad(emprendedorData.antiguedad_meses);
    
    if (!antiguedadValida.aprobado) {
      return antiguedadValida;
    }

    // 2. Calcular capacidad de pago
    const capacidadPago = this.calcularCapacidadPago(
      emprendedorData.utilidad_neta,
      solicitudData.monto_solicitado,
      solicitudData.plazo_meses
    );

    if (!capacidadPago.aprobado) {
      return capacidadPago;
    }

    // 3. Evaluar riesgo completo
    return this.evaluarRiesgoCompleto(emprendedorData, capacidadPago.ratio);
  }

  // Validar antigüedad del negocio
  static validarAntiguedad(antiguedadMeses) {
    const minMeses = 6;
    
    if (antiguedadMeses < minMeses) {
      return {
        aprobado: false,
        motivo: `Antigüedad del negocio insuficiente. Mínimo ${minMeses} meses requeridos.`,
        nivelRiesgo: 'alto',
        estado: 'rechazado'
      };
    }

    return {
      aprobado: true,
      motivo: 'Antigüedad válida'
    };
  }

  // Calcular capacidad de pago (Ratio Cuota/Utilidad)
  static calcularCapacidadPago(utilidadNeta, montoSolicitado, plazoMeses) {
    const cuotaMensual = montoSolicitado / plazoMeses;
    const ratio = utilidadNeta > 0 ? (cuotaMensual / utilidadNeta) * 100 : 100;

    const maxRatio = 40; // 40% máximo

    if (ratio >= maxRatio) {
      return {
        aprobado: false,
        motivo: `Capacidad de pago insuficiente. Ratio: ${ratio.toFixed(2)}% (máximo ${maxRatio}%)`,
        nivelRiesgo: 'alto',
        ratio: ratio,
        estado: 'rechazado'
      };
    }

    return {
      aprobado: true,
      ratio: ratio,
      cuotaMensual: cuotaMensual
    };
  }

  // Evaluación completa de riesgo
  static evaluarRiesgoCompleto(emprendedorData, ratio) {
    let nivelRiesgo = 'medio';
    let puntuacion = 0;

    // Puntos por ratio de deuda
    if (ratio < 25) puntuacion += 30;
    else if (ratio < 35) puntuacion += 20;
    else puntuacion += 10;

    // Puntos por antigüedad
    if (emprendedorData.antiguedad_meses >= 24) puntuacion += 30;
    else if (emprendedorData.antiguedad_meses >= 12) puntuacion += 20;
    else puntuacion += 10;

    // Puntos por estabilidad de vivienda
    const puntosVivienda = {
      'propia': 20,
      'alquilada': 15,
      'familiar': 10
    };
    puntuacion += puntosVivienda[emprendedorData.estabilidad_vivienda] || 10;

    // Determinar nivel de riesgo
    if (puntuacion >= 70) nivelRiesgo = 'bajo';
    else if (puntuacion >= 50) nivelRiesgo = 'medio';
    else nivelRiesgo = 'alto';

    return {
      aprobado: true,
      nivelRiesgo: nivelRiesgo,
      ratio: ratio,
      puntuacion: puntuacion,
      estado: 'pre-aprobado',
      motivo: `Solicitud pre-aprobada. Nivel de riesgo: ${nivelRiesgo}. Puntuación: ${puntuacion}/100`
    };
  }

  // Calcular tasa de interés según riesgo
  static calcularTasaInteres(nivelRiesgo) {
    const tasas = {
      'bajo': 0.015,    // 1.5%
      'medio': 0.025,   // 2.5%
      'alto': 0.035     // 3.5%
    };

    return tasas[nivelRiesgo] || 0.025;
  }
}