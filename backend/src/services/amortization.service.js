export class AmortizationService {
  // Generar plan de amortización
  static generarPlanAmortizacion(monto, plazoSemanas, tasaInteres = 0.02) {
    const cuotas = [];
    const interesTotal = monto * tasaInteres;
    const montoTotal = monto + interesTotal;
    const cuotaFija = montoTotal / plazoSemanas;
    const capitalSemanal = monto / plazoSemanas;
    const interesSemanal = interesTotal / plazoSemanas;

    let fecha = new Date();
    let saldoPendiente = montoTotal;

    for (let i = 1; i <= plazoSemanas; i++) {
      fecha = new Date(fecha);
      fecha.setDate(fecha.getDate() + 7); // Sumar 7 días

      saldoPendiente -= cuotaFija;

      cuotas.push({
        numero: i,
        fechaVencimiento: new Date(fecha),
        monto: Number(cuotaFija.toFixed(2)),
        capital: Number(capitalSemanal.toFixed(2)),
        interes: Number(interesSemanal.toFixed(2)),
        saldoPendiente: Number(Math.max(0, saldoPendiente).toFixed(2))
      });
    }

    return cuotas;
  }

  // Calcular cuota semanal
  static calcularCuotaSemanal(monto, plazoSemanas, tasaInteres = 0.02) {
    const interesTotal = monto * tasaInteres;
    const montoTotal = monto + interesTotal;
    return montoTotal / plazoSemanas;
  }

  // Calcular intereses totales
  static calcularInteresesTotales(monto, tasaInteres = 0.02) {
    return monto * tasaInteres;
  }
}