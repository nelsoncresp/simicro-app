// services/emprendimientoService.js
export const EmprendimientoService = {
  validarPayload(data) {
    const {
      id_usuario,
      nombre_emprendimiento,
      ingresos_mensuales,
      gastos_mensuales,
      numero_trabajadores,
    } = data;

    if (!id_usuario) throw new Error('El campo id_usuario es obligatorio (viene del token).');
    if (!nombre_emprendimiento) throw new Error('El campo nombre_emprendimiento es obligatorio.');

    // Números válidos
    const toNumber = (v) => (v === null || v === undefined || v === '' ? null : Number(v));
    const ing = toNumber(ingresos_mensuales);
    const gas = toNumber(gastos_mensuales);
    const trab = toNumber(numero_trabajadores);

    if (ing === null || Number.isNaN(ing)) throw new Error('ingresos_mensuales es obligatorio y debe ser numérico.');
    if (gas === null || Number.isNaN(gas)) throw new Error('gastos_mensuales es obligatorio y debe ser numérico.');
    if (trab !== null && (Number.isNaN(trab) || trab < 0)) throw new Error('numero_trabajadores debe ser un entero >= 0.');

    // Normalizaciones y defaults suaves
    return {
      sector_economico: data.sector_economico ?? null,
      ubicacion_negocio: data.ubicacion_negocio ?? null,
      tiempo_funcionamiento: data.tiempo_funcionamiento ?? null,
      tipo_local: data.tipo_local ?? null,
      numero_trabajadores: trab ?? 0,
      ingresos_mensuales: ing,
      gastos_mensuales: gas,
      productos_servicios: data.productos_servicios ?? null,
      canales_venta: data.canales_venta ?? null,
      frecuencia_ventas: data.frecuencia_ventas ?? null,
      apoyo_familiar: data.apoyo_familiar ?? null,
      nivel_educativo: data.nivel_educativo ?? null,
      // Campos obligatorios ya verificados
      id_usuario,
      nombre_emprendimiento,
      // ⚠️ JAMÁS aceptar utilidad_neta del cliente (columna generada)
      utilidad_neta: undefined,
      fecha_registro: undefined,
      id_emprendimiento: undefined,
    };
  },

  // Lista blanca de campos de la tabla (para insert/update dinámico)
  allowedColumns: [
    'id_usuario',
    'nombre_emprendimiento',
    'sector_economico',
    'ubicacion_negocio',
    'tiempo_funcionamiento',
    'tipo_local',
    'numero_trabajadores',
    'ingresos_mensuales',
    'gastos_mensuales',
    'productos_servicios',
    'canales_venta',
    'frecuencia_ventas',
    'apoyo_familiar',
    'nivel_educativo',
    // utilidad_neta es GENERADA -> no incluir
    // fecha_registro es DEFAULT -> no incluir
  ],

  sanitizeForInsert(payload) {
    const clean = {};
    for (const k of this.allowedColumns) {
      if (payload[k] !== undefined) clean[k] = payload[k];
    }
    return clean;
  },

  sanitizeForUpdate(payload) {
    const clean = {};
    for (const k of this.allowedColumns) {
      // No permitir cambiar id_usuario desde update en esta API
      if (k === 'id_usuario') continue;
      if (payload[k] !== undefined) clean[k] = payload[k];
    }
    return clean;
  },
};
