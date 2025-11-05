-- Verificación rápida - Copia y pega esto en Supabase SQL Editor

-- 1. Verificar carreras (debe mostrar 2)
SELECT 'CARRERAS' as tipo, COUNT(*) as total FROM careers;
SELECT id, name FROM careers ORDER BY id;

-- 2. Verificar materias (debe mostrar 18)
SELECT 'MATERIAS' as tipo, COUNT(*) as total FROM subjects;

-- 3. Verificar que el preceptor tenga career_id válido
SELECT 
    id, 
    name, 
    role, 
    career_id,
    CASE 
        WHEN career_id IS NULL THEN '❌ SIN CARRERA'
        WHEN EXISTS (SELECT 1 FROM careers WHERE id = career_id) THEN '✅ OK'
        ELSE '❌ CARRERA INVÁLIDA'
    END as estado
FROM users 
WHERE role = 'Preceptor';

-- Si algún preceptor no tiene carrera, ejecuta esto:
-- UPDATE users SET career_id = 'dev' WHERE role = 'Preceptor' AND career_id IS NULL;

