// services/emprendedorService.js

export const EmprendedorService = {
  validarDatosEmprendedor(data) {
    const {
      id_usuario,
      nombre_negocio,
      antiguedad_meses,
      ingreso_neto_mensual,
      sector_economico = 'otro',
      tipo_negocio = 'informal',
      tipo_vivienda = 'otra',
      estabilidad_vivienda = 'media',
      calificacion_riesgo = 'medio'
    } = data;

    // Campos obligatorios
    if (!id_usuario) throw new Error('El campo id_usuario es obligatorio.');
    if (!nombre_negocio) throw new Error('El campo nombre_negocio es obligatorio.');
    if (antiguedad_meses == null || isNaN(antiguedad_meses))
      throw new Error('El campo antiguedad_meses es obligatorio y debe ser numérico.');
    if (ingreso_neto_mensual == null || isNaN(ingreso_neto_mensual))
      throw new Error('El campo ingreso_neto_mensual es obligatorio y debe ser numérico.');

    // Enums válidos
    const ENUMS = {
      sector_economico: ['comercio', 'servicios', 'manufactura', 'agricultura', 'transporte', 'otro'],
      tipo_negocio: ['formal', 'informal'],
      tipo_vivienda: ['propia', 'alquilada', 'familiar', 'otra'],
      estabilidad_vivienda: ['alta', 'media', 'baja'],
      calificacion_riesgo: ['bajo', 'medio', 'alto']
    };

    if (!ENUMS.sector_economico.includes(sector_economico))
      throw new Error(`sector_economico debe ser uno de: ${ENUMS.sector_economico.join(', ')}`);

    if (!ENUMS.tipo_negocio.includes(tipo_negocio))
      throw new Error(`tipo_negocio debe ser uno de: ${ENUMS.tipo_negocio.join(', ')}`);

    if (!ENUMS.tipo_vivienda.includes(tipo_vivienda))
      throw new Error(`tipo_vivienda debe ser uno de: ${ENUMS.tipo_vivienda.join(', ')}`);

    if (!ENUMS.estabilidad_vivienda.includes(estabilidad_vivienda))
      throw new Error(`estabilidad_vivienda debe ser uno de: ${ENUMS.estabilidad_vivienda.join(', ')}`);

    if (!ENUMS.calificacion_riesgo.includes(calificacion_riesgo))
      throw new Error(`calificacion_riesgo debe ser uno de: ${ENUMS.calificacion_riesgo.join(', ')}`);

    // Normalizar valores numéricos por defecto
    return {
      descripcion_negocio: null,
      numero_empleados: 0,
      egresos_mensuales: 0.00,
      tiempo_residencia_anios: 0,
      observaciones: null,
      ...data
    };
  }
};
