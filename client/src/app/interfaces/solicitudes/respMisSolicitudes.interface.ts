export interface Solicitud {
  id_solicitud: number;
  id_emprendedor: number;
  monto_solicitado: number;
  plazo_meses: number;
  estado: string;
  calificacion_riesgo: string;
  ratio_cuota_utilidad: number;
  motivo_prestamo: string;
  motivo_decision: string | null;
  id_analista: number | null;
  observaciones_analista: string | null;
  fecha_analisis: string | null;
  fecha_solicitud: string;
  fecha_actualizacion: string;
  nombre_negocio: string;
  nombre_emprendedor: string;
  utilidad_neta: number;
  email: string;
}