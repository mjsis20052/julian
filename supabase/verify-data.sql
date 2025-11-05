-- ============================================
-- SCRIPT DE VERIFICACIÓN DE DATOS
-- Ejecuta este script para verificar que los datos se insertaron correctamente
-- ============================================

-- Verificar carreras
SELECT 
    'Carreras' as tabla,
    COUNT(*) as total,
    STRING_AGG(id, ', ') as ids
FROM careers;

-- Verificar materias por carrera
SELECT 
    c.name as carrera,
    s.year as año,
    COUNT(*) as materias,
    STRING_AGG(s.name, ', ') as lista_materias
FROM subjects s
JOIN careers c ON s.career_id = c.id
GROUP BY c.name, s.year
ORDER BY c.id, s.year;

-- Verificar horarios
SELECT 
    'Horarios' as tabla,
    COUNT(*) as total
FROM class_schedules;

-- Ver todas las carreras con sus detalles
SELECT 
    id,
    name,
    years,
    theme,
    created_at
FROM careers
ORDER BY id;

-- Ver todas las materias
SELECT 
    s.id,
    s.name,
    c.name as carrera,
    s.year as año
FROM subjects s
JOIN careers c ON s.career_id = c.id
ORDER BY c.id, s.year, s.name;

-- Verificar que no haya usuarios sin carrera válida (opcional)
SELECT 
    u.id,
    u.name,
    u.email,
    u.role,
    u.career_id,
    CASE 
        WHEN u.career_id IS NULL THEN 'Sin carrera'
        WHEN NOT EXISTS (SELECT 1 FROM careers c WHERE c.id = u.career_id) THEN 'Carrera inválida'
        ELSE 'OK'
    END as estado_carrera
FROM users u
WHERE u.role IN ('Alumno', 'Preceptor', 'Profesor')
ORDER BY u.role, u.name;

