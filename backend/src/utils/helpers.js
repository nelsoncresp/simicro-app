// Calcular ratio para evaluación de crédito
export const calcularRatio = (ingresoDiario, cuotaSemanal) => {
  const ingresoSemanal = ingresoDiario * 7;
  return (cuotaSemanal / ingresoSemanal) * 100;
};

// Generar cuotas semanales
export const generarCuotas = (monto, semanas, tasa = 0.02) => {
  const interesTotal = monto * tasa;
  const totalPagar = monto + interesTotal;
  const cuotaSemanal = totalPagar / semanas;
  
  const cuotas = [];
  let fecha = new Date();
  
  for (let i = 1; i <= semanas; i++) {
    fecha.setDate(fecha.getDate() + 7);
    
    cuotas.push({
      numero: i,
      fechaVencimiento: new Date(fecha),
      monto: Number(cuotaSemanal.toFixed(2)),
      capital: Number((monto / semanas).toFixed(2)),
      interes: Number((interesTotal / semanas).toFixed(2))
    });
  }
  
  return cuotas;
};