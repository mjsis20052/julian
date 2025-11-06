-- ============================================
-- SCRIPT DE SOLUCIÓN RÁPIDA
-- Soluciona el error: "La carrera con ID 'dev' no existe"
-- ============================================

-- Paso 1: Verificar si las carreras existen
SELECT 'Verificando carreras existentes...' as paso;
SELECT id, name FROM careers;

-- Paso 2: Crear las carreras si no existen
INSERT INTO careers (id, name, years, theme)
VALUES 
    ('dev', 'Tecnicatura Superior en Desarrollo de Software', ARRAY[1, 2, 3], 'theme-dev'),
    ('design', 'Tecnicatura Superior en Diseño, Imagen y Sonido', ARRAY[1, 2, 3], 'theme-design')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    years = EXCLUDED.years,
    theme = EXCLUDED.theme;

-- Paso 3: Verificar que las carreras se crearon correctamente
SELECT 'Carreras después de la inserción:' as paso;
SELECT id, name, years, theme FROM careers ORDER BY id;

-- Paso 4: Crear materias básicas si no existen
INSERT INTO subjects (id, name, career_id, year)
VALUES 
    -- Dev - Año 1
    ('dev-1-algo', 'Algoritmos y Estructuras de Datos', 'dev', 1),
    ('dev-1-prog1', 'Programación I', 'dev', 1),
    ('dev-1-arq', 'Arquitectura de Computadoras', 'dev', 1),
    -- Dev - Año 2
    ('dev-2-prog2', 'Programación II', 'dev', 2),
    ('dev-2-db', 'Bases de Datos', 'dev', 2),
    ('dev-2-so', 'Sistemas Operativos', 'dev', 2),
    -- Dev - Año 3
    ('dev-3-net', 'Redes y Comunicación', 'dev', 3),
    ('dev-3-sec', 'Seguridad Informática', 'dev', 3),
    ('dev-3-final', 'Proyecto Final (Dev)', 'dev', 3),
    -- Design - Año 1
    ('des-1-dg1', 'Diseño Gráfico I', 'design', 1),
    ('des-1-img', 'Teoría de la Imagen', 'design', 1),
    ('des-1-photo', 'Fotografía', 'design', 1),
    -- Design - Año 2
    ('des-2-av', 'Diseño Audiovisual', 'design', 2),
    ('des-2-video', 'Edición de Video', 'design', 2),
    ('des-2-sound', 'Diseño de Sonido', 'design', 2),
    -- Design - Año 3
    ('des-3-3d', 'Animación 3D', 'design', 3),
    ('des-3-post', 'Postproducción Digital', 'design', 3),
    ('des-3-final', 'Proyecto Final (Design)', 'design', 3)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    career_id = EXCLUDED.career_id,
    year = EXCLUDED.year;

-- Paso 5: Verificar materias creadas
SELECT 'Materias creadas:' as paso, COUNT(*) as total FROM subjects;

-- Paso 6: Verificar que el preceptor tenga career_id válido
SELECT 'Verificando preceptores...' as paso;
SELECT 
    id, 
    name, 
    email, 
    role, 
    career_id,
    CASE 
        WHEN career_id IS NULL THEN '❌ SIN CARRERA - Necesita actualización'
        WHEN NOT EXISTS (SELECT 1 FROM careers WHERE id = career_id) THEN '❌ CARRERA INVÁLIDA'
        ELSE '✅ OK'
    END as estado
FROM users 
WHERE role = 'Preceptor'
ORDER BY id;

-- Paso 7: Asignar carrera 'dev' a preceptores que no tienen carrera
UPDATE users 
SET career_id = 'dev'
WHERE role = 'Preceptor' 
  AND (career_id IS NULL OR NOT EXISTS (SELECT 1 FROM careers WHERE id = career_id))
LIMIT 10; -- Limitar para evitar actualizar todos si hay muchos

-- Paso 8: Verificación final
SELECT '========================================' as "";
SELECT 'VERIFICACIÓN FINAL' as "";
SELECT '========================================' as "";

SELECT 
    'Carreras' as tabla,
    COUNT(*) as total,
    STRING_AGG(id, ', ') as ids
FROM careers;

SELECT 
    'Materias' as tabla,
    COUNT(*) as total
FROM subjects;

SELECT 
    'Preceptores con carrera válida' as tabla,
    COUNT(*) as total
FROM users 
WHERE role = 'Preceptor' 
  AND career_id IS NOT NULL
  AND EXISTS (SELECT 1 FROM careers WHERE id = career_id);

-- Paso 9: Si todo está OK, mostrar mensaje de éxito
DO $$
DECLARE
    career_count INTEGER;
    subject_count INTEGER;
    preceptor_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO career_count FROM careers WHERE id IN ('dev', 'design');
    SELECT COUNT(*) INTO subject_count FROM subjects;
    SELECT COUNT(*) INTO preceptor_count FROM users 
    WHERE role = 'Preceptor' 
      AND career_id IS NOT NULL
      AND EXISTS (SELECT 1 FROM careers WHERE id = career_id);
    
    IF career_count >= 2 AND subject_count >= 18 AND preceptor_count > 0 THEN
        RAISE NOTICE '========================================';
        RAISE NOTICE '✅ ¡PROBLEMA SOLUCIONADO!';
        RAISE NOTICE '========================================';
        RAISE NOTICE '✅ Carreras creadas: %', career_count;
        RAISE NOTICE '✅ Materias creadas: %', subject_count;
        RAISE NOTICE '✅ Preceptores con carrera válida: %', preceptor_count;
        RAISE NOTICE '========================================';
        RAISE NOTICE 'Ahora puedes crear estudiantes sin problemas.';
        RAISE NOTICE '========================================';
    ELSE
        RAISE WARNING '⚠️  Algunos datos pueden faltar. Verifica manualmente.';
        RAISE NOTICE 'Carreras: %, Materias: %, Preceptores: %', career_count, subject_count, preceptor_count;
    END IF;
END $$;

