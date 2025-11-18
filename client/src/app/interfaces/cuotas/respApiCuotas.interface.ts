export interface RespApiCuotas {
    id_cuota: number;
    id_credito: number;
    numero_cuota: number;
    fecha_vencimiento: string;
    monto_esperado: string;
    capital: string;
    interes: string;
    estado: string;
    fecha_pago: string | null;
    monto_pagado: string;
    fecha_creacion: string;
    monto_desembolsado: string;
    mora_acumulada: string;
    id_solicitud: number;
    monto_solicitado: string;
    nombre_emprendimiento: string;
    nombre_emprendedor: string;
}