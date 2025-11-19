-- ============================================
-- MIGRACIÓN: Cambiar plazo_semanas a plazo_meses
-- ============================================
-- Este script migra la columna plazo_semanas a plazo_meses
-- y convierte los valores existentes de semanas a meses

USE simicro_db;

-- PASO 1: Convertir valores existentes de semanas a meses
-- Usamos CEIL para redondear hacia arriba (4.33 semanas ≈ 1 mes)
UPDATE solicitudes 
SET plazo_semanas = CEIL(plazo_semanas / 4.33)
WHERE plazo_semanas IS NOT NULL;

-- PASO 2: Renombrar la columna
ALTER TABLE solicitudes 
CHANGE COLUMN plazo_semanas plazo_meses INT NOT NULL;

-- PASO 3: Verificar los cambios
SELECT id_solicitud, monto_solicitado, plazo_meses, estado, fecha_solicitud
FROM solicitudes
ORDER BY fecha_solicitud DESC
LIMIT 10;

-- ============================================
-- NOTAS IMPORTANTES:
-- ============================================
-- 1. Este script convierte semanas a meses usando la fórmula: meses = CEIL(semanas / 4.33)
-- 2. Se usa CEIL para redondear hacia arriba y asegurar que no se pierdan meses
-- 3. Ejemplos de conversión:
--    - 12 semanas → CEIL(12/4.33) = CEIL(2.77) = 3 meses
--    - 24 semanas → CEIL(24/4.33) = CEIL(5.54) = 6 meses
--    - 52 semanas → CEIL(52/4.33) = CEIL(12.01) = 13 meses
-- 4. IMPORTANTE: Ejecutar este script en un entorno de desarrollo primero
-- 5. IMPORTANTE: Hacer backup de la base de datos antes de ejecutar en producción
