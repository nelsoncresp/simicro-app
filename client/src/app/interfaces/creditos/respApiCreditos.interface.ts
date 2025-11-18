export interface respApiCreditos {
    id_credito: number;
    id_solicitud: number;
    monto_desembolsado: string;
    saldo_pendiente_total: string;
    tasa_interes: string;
    mora_acumulada: string;
    fecha_desembolso: string;
    fecha_vencimiento: string | null;
    estado: string;
    fecha_creacion: string;
    nombre_emprendimiento: string;
    plazo_semanas: number;
}