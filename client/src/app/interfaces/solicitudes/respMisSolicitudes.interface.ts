export interface Solicitud {
    calificacion_riesgo: string;
    estado: string;
    fecha_actualizacion: string;
    fecha_analisis: string | null;
    fecha_solicitud: string;
    monto_solicitado: number;
    motivo_decision: string;
    motivo_prestamo: string;
    nombre_negocio: string;
    observaciones_analista: string | null;
    plazo_semanas: number;
    ratio_cuota_utilidad: number;
    utilidad_neta: number;
}