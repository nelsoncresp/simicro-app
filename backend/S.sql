-- Crear base de datos y usarla
CREATE DATABASE IF NOT EXISTS simicro_db CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE simicro_db;

-- =========================================================
-- 001 - Tabla de usuarios
-- =========================================================
CREATE TABLE usuarios (
    id_usuario INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol ENUM('admin', 'analista', 'emprendedor') NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =========================================================
-- 002 - Detalle de usuarios (información personal general)
-- =========================================================
CREATE TABLE detalle_usuarios (
    id_detalle_usuario INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario INT NOT NULL,
    tipo_documento ENUM('CC', 'CE', 'TI', 'Pasaporte') DEFAULT 'CC',
    numero_documento VARCHAR(50) UNIQUE NOT NULL,
    fecha_nacimiento DATE NULL,
    genero ENUM('masculino', 'femenino', 'otro') DEFAULT 'otro',
    telefono VARCHAR(20),
    direccion TEXT,
    municipio VARCHAR(100),
    departamento VARCHAR(100),
    estado_civil ENUM('soltero', 'casado', 'union_libre', 'divorciado', 'viudo') DEFAULT 'soltero',
    nivel_educativo ENUM('ninguno', 'primaria', 'secundaria', 'tecnico', 'profesional', 'posgrado') DEFAULT 'ninguno',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

-- =========================================================
-- 003 - Detalle de emprendedores (información del negocio)
-- =========================================================
CREATE TABLE emprendedores (
    id_emprendedor INT PRIMARY KEY AUTO_INCREMENT, -- CORREGIDO: nombre de campo coherente
    id_usuario INT NOT NULL,
    
    -- 💼 Información del negocio
    nombre_negocio VARCHAR(255) NOT NULL,
    descripcion_negocio TEXT,
    sector_economico ENUM('comercio', 'servicios', 'manufactura', 'agricultura', 'transporte', 'otro') DEFAULT 'otro',
    tipo_negocio ENUM('formal', 'informal') DEFAULT 'informal',
    antiguedad_meses INT NOT NULL,
    numero_empleados INT DEFAULT 0,
    
    -- 💰 Información financiera
    ingreso_neto_mensual DECIMAL(12,2) NOT NULL,
    egresos_mensuales DECIMAL(12,2) DEFAULT 0.00,
    utilidad_promedio_mensual DECIMAL(12,2) GENERATED ALWAYS AS (ingreso_neto_mensual - egresos_mensuales) STORED,
    
    -- 🏠 Vivienda / estabilidad
    tipo_vivienda ENUM('propia', 'alquilada', 'familiar', 'otra') DEFAULT 'otra',
    tiempo_residencia_anios INT DEFAULT 0,
    estabilidad_vivienda ENUM('alta', 'media', 'baja') DEFAULT 'media',
    
    -- 📈 Riesgo y observaciones
    calificacion_riesgo ENUM('bajo', 'medio', 'alto') DEFAULT 'medio',
    observaciones TEXT,
    
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

-- =========================================================
-- 004 - Solicitudes de microcrédito
-- =========================================================
CREATE TABLE solicitudes (
    id_solicitud INT PRIMARY KEY AUTO_INCREMENT,
    id_emprendedor INT NOT NULL,
    monto_solicitado DECIMAL(12,2) NOT NULL,
    plazo_semanas INT NOT NULL,
    estado ENUM('pendiente', 'pre-aprobado', 'aprobado', 'rechazado', 'activo') DEFAULT 'pendiente',
    calificacion_riesgo ENUM('bajo', 'medio', 'alto'),
    ratio_cuota_utilidad DECIMAL(5,2),
    motivo_decision TEXT,
    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (id_emprendedor) REFERENCES emprendedores(id_emprendedor) ON DELETE CASCADE
);

-- =========================================================
-- 005 - Créditos (una vez aprobada la solicitud)
-- =========================================================
CREATE TABLE creditos (
    id_credito INT PRIMARY KEY AUTO_INCREMENT,
    id_solicitud INT NOT NULL,
    monto_desembolsado DECIMAL(12,2) NOT NULL,
    saldo_pendiente_total DECIMAL(12,2) NOT NULL,
    tasa_interes DECIMAL(5,2) DEFAULT 2.0,
    fecha_desembolso TIMESTAMP NULL,
    fecha_vencimiento DATE NULL,
    estado ENUM('activo', 'pagado', 'moroso', 'cancelado') DEFAULT 'activo',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (id_solicitud) REFERENCES solicitudes(id_solicitud) ON DELETE CASCADE
);

-- =========================================================
-- 006 - Cuotas del crédito
-- =========================================================
CREATE TABLE cuotas (
    id_cuota INT PRIMARY KEY AUTO_INCREMENT,
    id_credito INT NOT NULL,
    numero_cuota INT NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    monto_esperado DECIMAL(10,2) NOT NULL,
    capital DECIMAL(10,2) NOT NULL,
    interes DECIMAL(10,2) NOT NULL,
    estado ENUM('pendiente', 'pagada', 'vencida') DEFAULT 'pendiente',
    fecha_pago TIMESTAMP NULL,
    monto_pagado DECIMAL(10,2) DEFAULT 0,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (id_credito) REFERENCES creditos(id_credito) ON DELETE CASCADE
);

-- =========================================================
-- 007 - Moras (cuotas vencidas)
-- =========================================================
CREATE TABLE moras (
    id_mora INT PRIMARY KEY AUTO_INCREMENT,
    id_cuota INT NOT NULL,
    dias_mora INT NOT NULL DEFAULT 0,
    monto_penalidad_acumulado DECIMAL(10,2) NOT NULL DEFAULT 0,
    fecha_inicio_mora DATE NOT NULL,
    fecha_fin_mora DATE NULL,
    estado ENUM('activa', 'liquidada') DEFAULT 'activa',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (id_cuota) REFERENCES cuotas(id_cuota) ON DELETE CASCADE
);

-- =========================================================
-- 008 - Pagos realizados
-- =========================================================
CREATE TABLE pagos (
    id_pago INT PRIMARY KEY AUTO_INCREMENT,
    id_cuota INT NOT NULL,
    monto_recibido DECIMAL(10,2) NOT NULL,
    fecha_pago TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metodo_pago ENUM('efectivo', 'transferencia', 'tarjeta') DEFAULT 'efectivo',
    referencia_pago VARCHAR(100),
    observaciones TEXT,
    
    FOREIGN KEY (id_cuota) REFERENCES cuotas(id_cuota) ON DELETE CASCADE
);
