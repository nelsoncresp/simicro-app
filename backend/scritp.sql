-- backend/src/database/migrations/001_create_usuarios_table.sql
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

-- backend/src/database/migrations/002_create_emprendedores_table.sql
CREATE TABLE emprendedores (
    id_emprendedor INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario INT NOT NULL,
    nombre_negocio VARCHAR(255) NOT NULL,
    antiguedad_meses INT NOT NULL,
    ingreso_neto_diario DECIMAL(10,2) NOT NULL,
    estabilidad_vivienda ENUM('propia', 'alquilada', 'familiar') NOT NULL,
    telefono VARCHAR(20),
    direccion TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

-- backend/src/database/migrations/003_create_solicitudes_table.sql
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

-- backend/src/database/migrations/004_create_creditos_table.sql
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

-- backend/src/database/migrations/005_create_cuotas_table.sql
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

-- backend/src/database/migrations/006_create_moras_table.sql
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

-- backend/src/database/migrations/007_create_pagos_table.sql
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