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
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

-- =========================================================
-- 003 - Detalle de emprendedores (información del negocio)
-- =========================================================
CREATE TABLE emprendimientos (
  id_emprendimiento INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT,
  nombre_emprendimiento VARCHAR(100),
  sector_economico VARCHAR(50),
  ubicacion_negocio VARCHAR(100),
  tiempo_funcionamiento VARCHAR(30),
  tipo_local VARCHAR(30),
  numero_trabajadores INT,
  ingresos_mensuales DECIMAL(12,2),
  gastos_mensuales DECIMAL(12,2),
  utilidad_neta DECIMAL(12,2) GENERATED ALWAYS AS (ingresos_mensuales - gastos_mensuales) STORED,
  productos_servicios TEXT,
  canales_venta VARCHAR(100),
  frecuencia_ventas VARCHAR(20),
  apoyo_familiar VARCHAR(100),
  nivel_educativo VARCHAR(50),
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
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
    motivo_prestamo TEXT,
    motivo_decision TEXT,
    id_analista INT,
    observaciones_analista TEXT,
    fecha_analisis TIMESTAMP NULL,
    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (id_emprendedor) REFERENCES emprendimientos(id_emprendimiento) ON DELETE CASCADE,
    FOREIGN KEY (id_analista) REFERENCES usuarios(id_usuario) ON DELETE SET NULL
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
    mora_acumulada DECIMAL(10,2) DEFAULT 0,
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
