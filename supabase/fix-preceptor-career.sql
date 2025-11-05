-- ============================================
-- CORREGIR CARRERAS DE PRECEPTORES
-- Si los preceptores no tienen career_id asignado
-- ============================================

-- Ver el estado actual de los preceptores
SELECT 
    id,
    name,
    email,
    role,
    career_id,
    year,
    CASE 
        WHEN career_id IS NULL THEN '❌ NO TIENE CARRERA'
        WHEN NOT EXISTS (SELECT 1 FROM careers WHERE id = career_id) THEN '❌ CARRERA INVÁLIDA'
        ELSE '✅ OK'
    END as estado
FROM users 
WHERE role = 'Preceptor'
ORDER BY id;

-- Asignar carreras a preceptores que no tienen (ajusta según corresponda)
-- Preceptores de Desarrollo (dev)
UPDATE users 
SET career_id = 'dev'
WHERE role = 'Preceptor' 
  AND career_id IS NULL
  AND id IN (1, 3, 5); -- Ajusta los IDs según tus preceptores de dev

-- Preceptores de Diseño (design)
UPDATE users 
SET career_id = 'design'
WHERE role = 'Preceptor' 
  AND career_id IS NULL
  AND id IN (2, 4); -- Ajusta los IDs según tus preceptores de design

-- O si prefieres asignar 'dev' a todos los que no tienen carrera:
-- UPDATE users 
-- SET career_id = 'dev'
-- WHERE role = 'Preceptor' AND career_id IS NULL;

-- Verificar después de actualizar
SELECT 
    id,
    name,
    career_id,
    CASE 
        WHEN EXISTS (SELECT 1 FROM careers WHERE id = career_id) THEN '✅ OK'
        ELSE '❌ CARRERA INVÁLIDA'
    END as estado
FROM users 
WHERE role = 'Preceptor'
ORDER BY id;

