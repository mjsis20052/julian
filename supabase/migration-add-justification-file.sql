-- ============================================
-- MIGRACIÓN: Agregar columna justification_file JSONB
-- ============================================
-- Este script migra la tabla attendance_records para usar
-- una columna JSONB en lugar de columnas separadas

-- Paso 1: Agregar la nueva columna JSONB
ALTER TABLE attendance_records
ADD COLUMN IF NOT EXISTS justification_file JSONB;

-- Paso 2: Migrar datos existentes (si hay columnas antiguas)
-- Si tienes datos en justification_file_name, justification_file_type, justification_file_content
-- puedes migrarlos con:
/*
UPDATE attendance_records
SET justification_file = jsonb_build_object(
    'name', justification_file_name,
    'type', justification_file_type,
    'content', justification_file_content
)
WHERE justification_file_name IS NOT NULL
  AND justification_file IS NULL;
*/

-- Paso 3: Eliminar columnas antiguas (OPCIONAL - descomentar si ya migraste todo)
-- ALTER TABLE attendance_records
-- DROP COLUMN IF EXISTS justification_file_name,
-- DROP COLUMN IF EXISTS justification_file_type,
-- DROP COLUMN IF EXISTS justification_file_content;

-- Verificar que la columna se creó correctamente
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'attendance_records'
  AND column_name = 'justification_file';

