-- ============================================
-- SCRIPT DE DATOS INICIALES (SEED DATA)
-- Ejecutar este script después de crear las tablas
-- ============================================

-- Limpiar datos existentes (opcional, descomentar si quieres empezar desde cero)
-- TRUNCATE TABLE subjects CASCADE;
-- TRUNCATE TABLE careers CASCADE;

-- ============================================
-- INSERTAR CARRERAS
-- ============================================

-- Insertar carrera de Desarrollo de Software
INSERT INTO careers (id, name, years, theme)
VALUES (
    'dev',
    'Tecnicatura Superior en Desarrollo de Software',
    ARRAY[1, 2, 3],
    'theme-dev'
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    years = EXCLUDED.years,
    theme = EXCLUDED.theme;

-- Insertar carrera de Diseño
INSERT INTO careers (id, name, years, theme)
VALUES (
    'design',
    'Tecnicatura Superior en Diseño, Imagen y Sonido',
    ARRAY[1, 2, 3],
    'theme-design'
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    years = EXCLUDED.years,
    theme = EXCLUDED.theme;

-- ============================================
-- INSERTAR MATERIAS
-- ============================================

-- Materias de Desarrollo - 1er Año
INSERT INTO subjects (id, name, career_id, year)
VALUES 
    ('dev-1-algo', 'Algoritmos y Estructuras de Datos', 'dev', 1),
    ('dev-1-prog1', 'Programación I', 'dev', 1),
    ('dev-1-arq', 'Arquitectura de Computadoras', 'dev', 1)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    career_id = EXCLUDED.career_id,
    year = EXCLUDED.year;

-- Materias de Desarrollo - 2do Año
INSERT INTO subjects (id, name, career_id, year)
VALUES 
    ('dev-2-prog2', 'Programación II', 'dev', 2),
    ('dev-2-db', 'Bases de Datos', 'dev', 2),
    ('dev-2-so', 'Sistemas Operativos', 'dev', 2)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    career_id = EXCLUDED.career_id,
    year = EXCLUDED.year;

-- Materias de Desarrollo - 3er Año
INSERT INTO subjects (id, name, career_id, year)
VALUES 
    ('dev-3-net', 'Redes y Comunicación', 'dev', 3),
    ('dev-3-sec', 'Seguridad Informática', 'dev', 3),
    ('dev-3-final', 'Proyecto Final (Dev)', 'dev', 3)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    career_id = EXCLUDED.career_id,
    year = EXCLUDED.year;

-- Materias de Diseño - 1er Año
INSERT INTO subjects (id, name, career_id, year)
VALUES 
    ('des-1-dg1', 'Diseño Gráfico I', 'design', 1),
    ('des-1-img', 'Teoría de la Imagen', 'design', 1),
    ('des-1-photo', 'Fotografía', 'design', 1)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    career_id = EXCLUDED.career_id,
    year = EXCLUDED.year;

-- Materias de Diseño - 2do Año
INSERT INTO subjects (id, name, career_id, year)
VALUES 
    ('des-2-av', 'Diseño Audiovisual', 'design', 2),
    ('des-2-video', 'Edición de Video', 'design', 2),
    ('des-2-sound', 'Diseño de Sonido', 'design', 2)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    career_id = EXCLUDED.career_id,
    year = EXCLUDED.year;

-- Materias de Diseño - 3er Año
INSERT INTO subjects (id, name, career_id, year)
VALUES 
    ('des-3-3d', 'Animación 3D', 'design', 3),
    ('des-3-post', 'Postproducción Digital', 'design', 3),
    ('des-3-final', 'Proyecto Final (Design)', 'design', 3)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    career_id = EXCLUDED.career_id,
    year = EXCLUDED.year;

-- ============================================
-- INSERTAR HORARIOS DE CLASE
-- ============================================

-- Horarios Dev 1
INSERT INTO class_schedules (subject_id, day_of_week, start_time, end_time, classroom)
VALUES 
    ('dev-1-prog1', 1, '18:20', '20:20', 'Aula 12'),
    ('dev-1-prog1', 3, '20:30', '22:20', 'Lab 3'),
    ('dev-1-algo', 2, '18:20', '22:20', 'Aula 10'),
    ('dev-1-arq', 4, '18:20', '20:20', 'Taller A')
ON CONFLICT (subject_id, day_of_week, start_time) DO UPDATE SET
    end_time = EXCLUDED.end_time,
    classroom = EXCLUDED.classroom;

-- Horarios Dev 2
INSERT INTO class_schedules (subject_id, day_of_week, start_time, end_time, classroom)
VALUES 
    ('dev-2-prog2', 2, '18:20', '20:20', 'Lab 1'),
    ('dev-2-db', 3, '18:20', '22:20', 'Lab 2'),
    ('dev-2-so', 5, '18:20', '20:20', 'Aula 14')
ON CONFLICT (subject_id, day_of_week, start_time) DO UPDATE SET
    end_time = EXCLUDED.end_time,
    classroom = EXCLUDED.classroom;

-- Horarios Dev 3
INSERT INTO class_schedules (subject_id, day_of_week, start_time, end_time, classroom)
VALUES 
    ('dev-3-net', 1, '20:30', '22:20', 'Lab 4'),
    ('dev-3-sec', 4, '20:30', '22:20', 'Aula 15'),
    ('dev-3-final', 5, '20:30', '22:20', 'SUM')
ON CONFLICT (subject_id, day_of_week, start_time) DO UPDATE SET
    end_time = EXCLUDED.end_time,
    classroom = EXCLUDED.classroom;

-- Horarios Design 1
INSERT INTO class_schedules (subject_id, day_of_week, start_time, end_time, classroom)
VALUES 
    ('des-1-dg1', 1, '18:20', '22:20', 'Taller B'),
    ('des-1-img', 3, '18:20', '20:20', 'Microcine'),
    ('des-1-photo', 5, '18:20', '22:20', 'Estudio Foto')
ON CONFLICT (subject_id, day_of_week, start_time) DO UPDATE SET
    end_time = EXCLUDED.end_time,
    classroom = EXCLUDED.classroom;

-- Horarios Design 2
INSERT INTO class_schedules (subject_id, day_of_week, start_time, end_time, classroom)
VALUES 
    ('des-2-av', 2, '18:20', '22:20', 'Isla Edición 1'),
    ('des-2-video', 4, '18:20', '20:20', 'Isla Edición 2'),
    ('des-2-sound', 4, '20:30', '22:20', 'Estudio Sonido')
ON CONFLICT (subject_id, day_of_week, start_time) DO UPDATE SET
    end_time = EXCLUDED.end_time,
    classroom = EXCLUDED.classroom;

-- Horarios Design 3
INSERT INTO class_schedules (subject_id, day_of_week, start_time, end_time, classroom)
VALUES 
    ('des-3-3d', 1, '18:20', '20:20', 'Lab 3D'),
    ('des-3-post', 3, '20:30', '22:20', 'Isla Edición 3'),
    ('des-3-final', 5, '18:20', '20:20', 'SUM')
ON CONFLICT (subject_id, day_of_week, start_time) DO UPDATE SET
    end_time = EXCLUDED.end_time,
    classroom = EXCLUDED.classroom;

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Verificar que las carreras se insertaron correctamente
SELECT 'Carreras insertadas:' as info, COUNT(*) as total FROM careers;

-- Verificar que las materias se insertaron correctamente
SELECT 'Materias insertadas:' as info, COUNT(*) as total FROM subjects;

-- Verificar que los horarios se insertaron correctamente
SELECT 'Horarios insertados:' as info, COUNT(*) as total FROM class_schedules;

-- Mostrar las carreras
SELECT id, name, years, theme FROM careers ORDER BY id;

-- Mostrar las materias por carrera
SELECT 
    c.name as carrera,
    s.year as año,
    s.name as materia
FROM subjects s
JOIN careers c ON s.career_id = c.id
ORDER BY c.id, s.year, s.name;

