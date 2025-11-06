-- ============================================
-- SCRIPT COMPLETO DE DATOS DE EJEMPLO
-- Este script carga datos de ejemplo en TODAS las tablas
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- Limpiar datos existentes (OPCIONAL - descomentar si quieres empezar desde cero)
-- TRUNCATE TABLE attendance_records CASCADE;
-- TRUNCATE TABLE grades CASCADE;
-- TRUNCATE TABLE news_items CASCADE;
-- TRUNCATE TABLE forum_threads CASCADE;
-- TRUNCATE TABLE forum_replies CASCADE;
-- TRUNCATE TABLE notifications CASCADE;
-- TRUNCATE TABLE private_messages CASCADE;
-- TRUNCATE TABLE planificaciones CASCADE;
-- TRUNCATE TABLE material_didactico CASCADE;
-- TRUNCATE TABLE users CASCADE;
-- TRUNCATE TABLE class_schedules CASCADE;
-- TRUNCATE TABLE subjects CASCADE;
-- TRUNCATE TABLE careers CASCADE;

-- ============================================
-- 1. CARRERAS
-- ============================================

INSERT INTO careers (id, name, years, theme)
VALUES 
    ('dev', 'Tecnicatura Superior en Desarrollo de Software', ARRAY[1, 2, 3], 'theme-dev'),
    ('design', 'Tecnicatura Superior en Diseño, Imagen y Sonido', ARRAY[1, 2, 3], 'theme-design')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    years = EXCLUDED.years,
    theme = EXCLUDED.theme;

-- ============================================
-- 2. MATERIAS
-- ============================================

-- Materias Dev
INSERT INTO subjects (id, name, career_id, year)
VALUES 
    ('dev-1-algo', 'Algoritmos y Estructuras de Datos', 'dev', 1),
    ('dev-1-prog1', 'Programación I', 'dev', 1),
    ('dev-1-arq', 'Arquitectura de Computadoras', 'dev', 1),
    ('dev-2-prog2', 'Programación II', 'dev', 2),
    ('dev-2-db', 'Bases de Datos', 'dev', 2),
    ('dev-2-so', 'Sistemas Operativos', 'dev', 2),
    ('dev-3-net', 'Redes y Comunicación', 'dev', 3),
    ('dev-3-sec', 'Seguridad Informática', 'dev', 3),
    ('dev-3-final', 'Proyecto Final (Dev)', 'dev', 3),
    ('des-1-dg1', 'Diseño Gráfico I', 'design', 1),
    ('des-1-img', 'Teoría de la Imagen', 'design', 1),
    ('des-1-photo', 'Fotografía', 'design', 1),
    ('des-2-av', 'Diseño Audiovisual', 'design', 2),
    ('des-2-video', 'Edición de Video', 'design', 2),
    ('des-2-sound', 'Diseño de Sonido', 'design', 2),
    ('des-3-3d', 'Animación 3D', 'design', 3),
    ('des-3-post', 'Postproducción Digital', 'design', 3),
    ('des-3-final', 'Proyecto Final (Design)', 'design', 3)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    career_id = EXCLUDED.career_id,
    year = EXCLUDED.year;

-- ============================================
-- 3. HORARIOS DE CLASE
-- ============================================

INSERT INTO class_schedules (subject_id, day_of_week, start_time, end_time, classroom)
VALUES 
    ('dev-1-prog1', 1, '18:20', '20:20', 'Aula 12'),
    ('dev-1-prog1', 3, '20:30', '22:20', 'Lab 3'),
    ('dev-1-algo', 2, '18:20', '22:20', 'Aula 10'),
    ('dev-1-arq', 4, '18:20', '20:20', 'Taller A'),
    ('dev-2-prog2', 2, '18:20', '20:20', 'Lab 1'),
    ('dev-2-db', 3, '18:20', '22:20', 'Lab 2'),
    ('dev-2-so', 5, '18:20', '20:20', 'Aula 14'),
    ('dev-3-net', 1, '20:30', '22:20', 'Lab 4'),
    ('dev-3-sec', 4, '20:30', '22:20', 'Aula 15'),
    ('dev-3-final', 5, '20:30', '22:20', 'SUM'),
    ('des-1-dg1', 1, '18:20', '22:20', 'Taller B'),
    ('des-1-img', 3, '18:20', '20:20', 'Microcine'),
    ('des-1-photo', 5, '18:20', '22:20', 'Estudio Foto'),
    ('des-2-av', 2, '18:20', '22:20', 'Isla Edición 1'),
    ('des-2-video', 4, '18:20', '20:20', 'Isla Edición 2'),
    ('des-2-sound', 4, '20:30', '22:20', 'Estudio Sonido'),
    ('des-3-3d', 1, '18:20', '20:20', 'Lab 3D'),
    ('des-3-post', 3, '20:30', '22:20', 'Isla Edición 3'),
    ('des-3-final', 5, '18:20', '20:20', 'SUM')
ON CONFLICT (subject_id, day_of_week, start_time) DO UPDATE SET
    end_time = EXCLUDED.end_time,
    classroom = EXCLUDED.classroom;

-- ============================================
-- 4. USUARIOS
-- ============================================

-- Preceptores
INSERT INTO users (id, name, email, password, role, career_id, year)
VALUES 
    (1, 'Carlos Gomez', 'carlos@preceptor.com', '123', 'Preceptor', 'dev', ARRAY[1, 2, 3]),
    (2, 'Ana Rodriguez', 'ana@preceptor.com', '123', 'Preceptor', 'design', ARRAY[1]),
    (3, 'Mariana Juarez', 'mariana@preceptor.com', '123', 'Preceptor', 'dev', ARRAY[1]),
    (4, 'Esteban Quito', 'esteban@preceptor.com', '123', 'Preceptor', 'design', ARRAY[2, 3]),
    (5, 'Susana Gimenez', 'susana@preceptor.com', '123', 'Preceptor', 'dev', ARRAY[2, 3])
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    password = EXCLUDED.password,
    role = EXCLUDED.role,
    career_id = EXCLUDED.career_id,
    year = EXCLUDED.year;

-- Profesores
INSERT INTO users (id, name, email, password, role, career_id, year, assigned_subjects)
VALUES 
    (601, 'Silvia Kent', 'silvia@teacher.com', '123', 'Profesor', 'dev', ARRAY[2], ARRAY['dev-2-prog2', 'dev-2-db']),
    (602, 'Laura Pausini', 'laura@teacher.com', '123', 'Profesor', 'design', ARRAY[1], ARRAY['des-1-dg1', 'des-1-img']),
    (603, 'Miguel Bose', 'miguel@teacher.com', '123', 'Profesor', 'design', ARRAY[2, 3], ARRAY['des-2-av', 'des-3-3d']),
    (604, 'Ricardo Arjona', 'ricardoa@teacher.com', '123', 'Profesor', 'dev', ARRAY[1], ARRAY['dev-1-algo', 'dev-1-prog1']),
    (605, 'Charly Garcia', 'charly@teacher.com', '123', 'Profesor', 'dev', ARRAY[3], ARRAY['dev-3-net', 'dev-3-sec'])
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    password = EXCLUDED.password,
    role = EXCLUDED.role,
    career_id = EXCLUDED.career_id,
    year = EXCLUDED.year,
    assigned_subjects = EXCLUDED.assigned_subjects;

-- Auxiliares
INSERT INTO users (id, name, email, password, role)
VALUES 
    (701, 'Roberto Carlos', 'roberto@staff.com', '123', 'Auxiliar'),
    (702, 'Ana Maria', 'anamaria@staff.com', '123', 'Auxiliar'),
    (703, 'Jorge Luis', 'jorge@staff.com', '123', 'Auxiliar'),
    (704, 'Marta Sanchez', 'marta@staff.com', '123', 'Auxiliar'),
    (705, 'Luis Alberto', 'luis@staff.com', '123', 'Auxiliar'),
    (706, 'Claudia Fernandez', 'claudia@staff.com', '123', 'Auxiliar'),
    (707, 'Fernando Torres', 'fernando@staff.com', '123', 'Auxiliar')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    password = EXCLUDED.password,
    role = EXCLUDED.role;

-- Centro de Estudiantes
INSERT INTO users (id, name, email, password, role, career_id, year)
VALUES 
    (801, 'Felipe Melo', 'felipe@studentrep.com', '123', 'Centro de Estudiantes', 'design', ARRAY[2]),
    (802, 'Carolina Peleritti', 'carolina@studentrep.com', '123', 'Centro de Estudiantes', 'dev', ARRAY[3]),
    (803, 'Juan Cruz Toledo', 'juancruz@studentrep.com', '123', 'Centro de Estudiantes', 'dev', ARRAY[2]),
    (804, 'Sofia Beltran', 'sofiab@studentrep.com', '123', 'Centro de Estudiantes', 'design', ARRAY[3]),
    (805, 'Mateo Rojas', 'mateor@studentrep.com', '123', 'Centro de Estudiantes', 'dev', ARRAY[1]),
    (806, 'Valentina Costa', 'valentinac@studentrep.com', '123', 'Centro de Estudiantes', 'design', ARRAY[1]),
    (807, 'Lucas Gimenez', 'lucasg@studentrep.com', '123', 'Centro de Estudiantes', 'dev', ARRAY[2]),
    (808, 'Julieta Navarro', 'julietan@studentrep.com', '123', 'Centro de Estudiantes', 'design', ARRAY[2]),
    (809, 'Martina Heredia', 'martinah@studentrep.com', '123', 'Centro de Estudiantes', 'dev', ARRAY[3]),
    (810, 'Bautista Ponce', 'bautistap@studentrep.com', '123', 'Centro de Estudiantes', 'design', ARRAY[1])
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    password = EXCLUDED.password,
    role = EXCLUDED.role,
    career_id = EXCLUDED.career_id,
    year = EXCLUDED.year;

-- Estudiantes Dev - Año 1
INSERT INTO users (id, name, email, password, role, career_id, year)
VALUES 
    (101, 'Juan Perez', 'juan@dev.com', '123', 'Alumno', 'dev', ARRAY[1]),
    (102, 'Maria Lopez', 'maria@dev.com', '123', 'Alumno', 'dev', ARRAY[1]),
    (104, 'Laura Vargas', 'laura@dev.com', '123', 'Alumno', 'dev', ARRAY[1]),
    (105, 'David Gimenez', 'david@dev.com', '123', 'Alumno', 'dev', ARRAY[1]),
    (106, 'Sofia Romano', 'sofiar@dev.com', '123', 'Alumno', 'dev', ARRAY[1]),
    (107, 'Martin Castro', 'martin@dev.com', '123', 'Alumno', 'dev', ARRAY[1]),
    (108, 'Valentina Medina', 'valentina@dev.com', '123', 'Alumno', 'dev', ARRAY[1]),
    (109, 'Agustin Sosa', 'agustin@dev.com', '123', 'Alumno', 'dev', ARRAY[1]),
    (110, 'Camila Diaz', 'camila@dev.com', '123', 'Alumno', 'dev', ARRAY[1]),
    (111, 'Mateo Acosta', 'mateo@dev.com', '123', 'Alumno', 'dev', ARRAY[1])
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    password = EXCLUDED.password,
    role = EXCLUDED.role,
    career_id = EXCLUDED.career_id,
    year = EXCLUDED.year;

-- Estudiantes Dev - Año 2
INSERT INTO users (id, name, email, password, role, career_id, year)
VALUES 
    (103, 'Pedro Martinez', 'pedro@dev.com', '123', 'Alumno', 'dev', ARRAY[2]),
    (112, 'Javier Rios', 'javier@dev.com', '123', 'Alumno', 'dev', ARRAY[2]),
    (113, 'Florencia Juarez', 'florencia@dev.com', '123', 'Alumno', 'dev', ARRAY[2]),
    (114, 'Nicolas Vega', 'nicolas@dev.com', '123', 'Alumno', 'dev', ARRAY[2]),
    (115, 'Catalina Moreno', 'catalina@dev.com', '123', 'Alumno', 'dev', ARRAY[2]),
    (116, 'Bautista Rojas', 'bautista@dev.com', '123', 'Alumno', 'dev', ARRAY[2]),
    (117, 'Martina Benitez', 'martina@dev.com', '123', 'Alumno', 'dev', ARRAY[2]),
    (118, 'Santiago Molina', 'santiago@dev.com', '123', 'Alumno', 'dev', ARRAY[2]),
    (119, 'Victoria Ortiz', 'victoria@dev.com', '123', 'Alumno', 'dev', ARRAY[2]),
    (120, 'Lucas Silva', 'lucas@dev.com', '123', 'Alumno', 'dev', ARRAY[2])
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    password = EXCLUDED.password,
    role = EXCLUDED.role,
    career_id = EXCLUDED.career_id,
    year = EXCLUDED.year;

-- Estudiantes Dev - Año 3
INSERT INTO users (id, name, email, password, role, career_id, year)
VALUES 
    (121, 'Elena Herrera', 'elena@dev.com', '123', 'Alumno', 'dev', ARRAY[3]),
    (122, 'Facundo Romero', 'facundo@dev.com', '123', 'Alumno', 'dev', ARRAY[3]),
    (123, 'Isabella Quiroga', 'isabella@dev.com', '123', 'Alumno', 'dev', ARRAY[3]),
    (124, 'Felipe Castillo', 'felipe@dev.com', '123', 'Alumno', 'dev', ARRAY[3]),
    (125, 'Renata Ledesma', 'renata@dev.com', '123', 'Alumno', 'dev', ARRAY[3]),
    (126, 'Joaquin Ponce', 'joaquin@dev.com', '123', 'Alumno', 'dev', ARRAY[3]),
    (127, 'Abril Coronel', 'abril@dev.com', '123', 'Alumno', 'dev', ARRAY[3]),
    (128, 'Benjamin Vazquez', 'benjamin@dev.com', '123', 'Alumno', 'dev', ARRAY[3]),
    (129, 'Jazmin Ferreyra', 'jazmin@dev.com', '123', 'Alumno', 'dev', ARRAY[3]),
    (130, 'Thiago Ibarra', 'thiago@dev.com', '123', 'Alumno', 'dev', ARRAY[3])
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    password = EXCLUDED.password,
    role = EXCLUDED.role,
    career_id = EXCLUDED.career_id,
    year = EXCLUDED.year;

-- Estudiantes Design - Año 1
INSERT INTO users (id, name, email, password, role, career_id, year)
VALUES 
    (201, 'Lucia Fernandez', 'lucia@design.com', '123', 'Alumno', 'design', ARRAY[1]),
    (202, 'Diego Sanchez', 'diego@design.com', '123', 'Alumno', 'design', ARRAY[1]),
    (204, 'Clara Navarro', 'clara@design.com', '123', 'Alumno', 'design', ARRAY[1]),
    (205, 'Ignacio Roldan', 'ignacio@design.com', '123', 'Alumno', 'design', ARRAY[1]),
    (206, 'Guadalupe Rios', 'guadalupe@design.com', '123', 'Alumno', 'design', ARRAY[1]),
    (207, 'Manuel Pereyra', 'manuel@design.com', '123', 'Alumno', 'design', ARRAY[1]),
    (208, 'Olivia Mendez', 'olivia@design.com', '123', 'Alumno', 'design', ARRAY[1]),
    (209, 'Francisco Morales', 'francisco@design.com', '123', 'Alumno', 'design', ARRAY[1]),
    (210, 'Emilia Paez', 'emilia@design.com', '123', 'Alumno', 'design', ARRAY[1]),
    (211, 'Andres Miranda', 'andres@design.com', '123', 'Alumno', 'design', ARRAY[1])
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    password = EXCLUDED.password,
    role = EXCLUDED.role,
    career_id = EXCLUDED.career_id,
    year = EXCLUDED.year;

-- Estudiantes Design - Año 2
INSERT INTO users (id, name, email, password, role, career_id, year)
VALUES 
    (203, 'Sofia Torres', 'sofia@design.com', '123', 'Alumno', 'design', ARRAY[2]),
    (212, 'Ambar Carrizo', 'ambar@design.com', '123', 'Alumno', 'design', ARRAY[2]),
    (213, 'Lautaro Godoy', 'lautaro@design.com', '123', 'Alumno', 'design', ARRAY[2]),
    (214, 'Pilar Cabrera', 'pilar@design.com', '123', 'Alumno', 'design', ARRAY[2]),
    (215, 'Daniel Sosa', 'daniel@design.com', '123', 'Alumno', 'design', ARRAY[2]),
    (216, 'Micaela Nuñez', 'micaela@design.com', '123', 'Alumno', 'design', ARRAY[2]),
    (217, 'Federico Aguilera', 'federico@design.com', '123', 'Alumno', 'design', ARRAY[2]),
    (218, 'Julieta Guzman', 'julieta@design.com', '123', 'Alumno', 'design', ARRAY[2]),
    (219, 'Ramiro Pacheco', 'ramiro@design.com', '123', 'Alumno', 'design', ARRAY[2]),
    (220, 'Paula Dominguez', 'paula@design.com', '123', 'Alumno', 'design', ARRAY[2])
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    password = EXCLUDED.password,
    role = EXCLUDED.role,
    career_id = EXCLUDED.career_id,
    year = EXCLUDED.year;

-- Estudiantes Design - Año 3
INSERT INTO users (id, name, email, password, role, career_id, year)
VALUES 
    (221, 'Bruno Vega', 'bruno@design.com', '123', 'Alumno', 'design', ARRAY[3]),
    (222, 'Zoe Flores', 'zoe@design.com', '123', 'Alumno', 'design', ARRAY[3]),
    (223, 'Alejo Bravo', 'alejo@design.com', '123', 'Alumno', 'design', ARRAY[3]),
    (224, 'Delfina Peralta', 'delfina@design.com', '123', 'Alumno', 'design', ARRAY[3]),
    (225, 'Leo Montes', 'leo@design.com', '123', 'Alumno', 'design', ARRAY[3]),
    (226, 'Candelaria Luna', 'candelaria@design.com', '123', 'Alumno', 'design', ARRAY[3]),
    (227, 'Lisandro Nieva', 'lisandro@design.com', '123', 'Alumno', 'design', ARRAY[3]),
    (228, 'Regina Campos', 'regina@design.com', '123', 'Alumno', 'design', ARRAY[3]),
    (229, 'Santino Mercado', 'santino@design.com', '123', 'Alumno', 'design', ARRAY[3]),
    (230, 'Amanda Nieves', 'amanda@design.com', '123', 'Alumno', 'design', ARRAY[3])
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    password = EXCLUDED.password,
    role = EXCLUDED.role,
    career_id = EXCLUDED.career_id,
    year = EXCLUDED.year;

-- ============================================
-- 5. REGISTROS DE ASISTENCIA (ejemplos)
-- ============================================

-- Nota: Solo insertamos algunos registros de ejemplo para no saturar la BD
-- En producción, estos se generan automáticamente

INSERT INTO attendance_records (id, student_id, subject_id, date, status, justification_reason, justification_file)
VALUES 
    -- Juan Perez (101) - dev-1-algo - 9 ausencias (Libre)
    ('att-101-algo-absent1', 101, 'dev-1-algo', '2024-06-02', 'Ausente', NULL, NULL),
    ('att-101-algo-absent2', 101, 'dev-1-algo', '2024-06-04', 'Ausente', NULL, NULL),
    ('att-101-algo-absent3', 101, 'dev-1-algo', '2024-06-06', 'Ausente', NULL, NULL),
    ('att-101-algo-absent4', 101, 'dev-1-algo', '2024-06-09', 'Ausente', NULL, NULL),
    ('att-101-algo-absent5', 101, 'dev-1-algo', '2024-06-11', 'Ausente', NULL, NULL),
    ('att-101-algo-absent6', 101, 'dev-1-algo', '2024-06-13', 'Ausente', NULL, NULL),
    ('att-101-algo-absent7', 101, 'dev-1-algo', '2024-06-16', 'Ausente', NULL, NULL),
    ('att-101-algo-absent8', 101, 'dev-1-algo', '2024-06-18', 'Ausente', NULL, NULL),
    ('att-101-algo-absent9', 101, 'dev-1-algo', '2024-06-20', 'Ausente', NULL, NULL),
    ('att-101-algo-present1', 101, 'dev-1-algo', '2024-07-02', 'Presente', NULL, NULL),
    ('att-101-algo-present2', 101, 'dev-1-algo', '2024-07-04', 'Presente', NULL, NULL),
    
    -- Maria Lopez (102) - dev-1-prog1 - Con justificación pendiente
    ('att-102-prog1-pending', 102, 'dev-1-prog1', '2024-06-15', 'Pendiente de Justificación', 
     'Turno con el dentista, adjunto comprobante de asistencia a la consulta.', 
     '{"name": "comprobante_dentista.pdf", "type": "application/pdf", "content": ""}'::jsonb),
    ('att-102-prog1-present1', 102, 'dev-1-prog1', '2024-06-17', 'Presente', NULL, NULL),
    ('att-102-prog1-present2', 102, 'dev-1-prog1', '2024-06-19', 'Presente', NULL, NULL),
    
    -- Pedro Martinez (103) - dev-2-prog2
    ('att-103-prog2-present1', 103, 'dev-2-prog2', '2024-06-10', 'Presente', NULL, NULL),
    ('att-103-prog2-present2', 103, 'dev-2-prog2', '2024-06-12', 'Presente', NULL, NULL),
    ('att-103-prog2-justified', 103, 'dev-2-prog2', '2024-06-14', 'Justificado', 'Certificado médico', NULL),
    
    -- Lucia Fernandez (201) - des-1-dg1
    ('att-201-dg1-present1', 201, 'des-1-dg1', '2024-06-05', 'Presente', NULL, NULL),
    ('att-201-dg1-present2', 201, 'des-1-dg1', '2024-06-07', 'Presente', NULL, NULL),
    ('att-201-dg1-justified', 201, 'des-1-dg1', '2024-06-09', 'Justificado', 'Fallecimiento familiar', NULL)
ON CONFLICT (id) DO UPDATE SET
    student_id = EXCLUDED.student_id,
    subject_id = EXCLUDED.subject_id,
    date = EXCLUDED.date,
    status = EXCLUDED.status,
    justification_reason = EXCLUDED.justification_reason,
    justification_file = EXCLUDED.justification_file;

-- ============================================
-- 6. CALIFICACIONES
-- ============================================

INSERT INTO grades (id, student_id, subject_id, type, value)
VALUES 
    -- Juan Perez (101) - dev-1-algo
    ('g-101-p1-algo', 101, 'dev-1-algo', 'Parcial 1', '2'),
    ('g-101-r1-algo', 101, 'dev-1-algo', 'Recuperatorio 1', '6'),
    ('g-101-tp-algo', 101, 'dev-1-algo', 'TP', '7'),
    ('g-101-n1c-algo', 101, 'dev-1-algo', 'Nota 1er Cuatrimestre', '6'),
    ('g-101-p2-algo', 101, 'dev-1-algo', 'Parcial 2', '5'),
    ('g-101-n2c-algo', 101, 'dev-1-algo', 'Nota 2do Cuatrimestre', '5'),
    ('g-101-final-algo', 101, 'dev-1-algo', 'Examen Final', '3'),
    
    -- Javier Rios (112) - dev-2-prog2
    ('g-112-p1', 112, 'dev-2-prog2', 'Parcial 1', '8'),
    ('g-112-tp11', 112, 'dev-2-prog2', 'TP', '9'),
    ('g-112-n1c', 112, 'dev-2-prog2', 'Nota 1er Cuatrimestre', '8'),
    ('g-112-p2', 112, 'dev-2-prog2', 'Parcial 2', '7'),
    ('g-112-n2c', 112, 'dev-2-prog2', 'Nota 2do Cuatrimestre', '7'),
    
    -- Florencia Juarez (113) - dev-2-prog2
    ('g-113-p1', 113, 'dev-2-prog2', 'Parcial 1', '3'),
    ('g-113-r1', 113, 'dev-2-prog2', 'Recuperatorio 1', '6'),
    ('g-113-tp11', 113, 'dev-2-prog2', 'TP', '5'),
    ('g-113-n1c', 113, 'dev-2-prog2', 'Nota 1er Cuatrimestre', '5'),
    ('g-113-p2', 113, 'dev-2-prog2', 'Parcial 2', '5'),
    ('g-113-n2c', 113, 'dev-2-prog2', 'Nota 2do Cuatrimestre', '5'),
    ('g-113-final', 113, 'dev-2-prog2', 'Examen Final', '6'),
    
    -- Nicolas Vega (114) - dev-2-prog2
    ('g-114-p1', 114, 'dev-2-prog2', 'Parcial 1', '9'),
    ('g-114-tp11', 114, 'dev-2-prog2', 'TP', '10'),
    ('g-114-n1c', 114, 'dev-2-prog2', 'Nota 1er Cuatrimestre', '9'),
    
    -- Catalina Moreno (115) - dev-2-db
    ('g-115-p1', 115, 'dev-2-db', 'Parcial 1', '6'),
    ('g-115-n1c', 115, 'dev-2-db', 'Nota 1er Cuatrimestre', '6'),
    ('g-115-p2', 115, 'dev-2-db', 'Parcial 2', '7'),
    ('g-115-n2c', 115, 'dev-2-db', 'Nota 2do Cuatrimestre', '7')
ON CONFLICT (id) DO UPDATE SET
    student_id = EXCLUDED.student_id,
    subject_id = EXCLUDED.subject_id,
    type = EXCLUDED.type,
    value = EXCLUDED.value;

-- ============================================
-- 7. NOTICIAS
-- ============================================

INSERT INTO news_items (id, text, career_id, year, subject_id)
VALUES 
    ('n1', 'Semana de finales: ¡Mucha suerte a todos los estudiantes!', NULL, NULL, NULL),
    ('n4', 'Inscripciones a materias del próximo cuatrimestre abiertas del 1 al 5 de Agosto.', NULL, NULL, NULL),
    ('n2', 'Examen de Programación II: Miércoles 24 de Julio.', 'dev', 2, 'dev-2-prog2'),
    ('n3', 'Entrega final del proyecto de Animación 3D: Viernes 26 de Julio.', 'design', 3, 'des-3-3d'),
    ('n5', 'Taller de Fotografía: Sábado 27 de Julio en el aula magna.', 'design', 1, 'des-1-photo'),
    ('n6', 'Recordatorio: TP N°3 de Algoritmos debe entregarse el Lunes.', 'dev', 1, 'dev-1-algo'),
    ('n7', 'Consulta para el parcial de Bases de Datos: Jueves a las 18hs.', 'dev', 2, 'dev-2-db')
ON CONFLICT (id) DO UPDATE SET
    text = EXCLUDED.text,
    career_id = EXCLUDED.career_id,
    year = EXCLUDED.year,
    subject_id = EXCLUDED.subject_id;

-- ============================================
-- 8. HILOS DE FORO
-- ============================================

INSERT INTO forum_threads (id, author_id, title, content, timestamp, status, career_id, year)
VALUES 
    ('thread-1', 101, '¿Alguien tiene apuntes de la clase de Algoritmos del lunes?', 
     'Me perdí la última clase de Algoritmos y Estructuras de Datos y estoy un poco perdido con el tema de árboles binarios. ¿Alguien podría compartir sus apuntes o un resumen? ¡Gracias!',
     (NOW() - INTERVAL '2 days')::timestamp, 'Aprobado', 'dev', 1),
    ('thread-2', 201, 'Recomendaciones de cámaras para la materia de Fotografía',
     'Hola a todos, estoy buscando comprar una cámara para la materia de Fotografía pero no sé por dónde empezar. ¿Tienen alguna recomendación que no sea súper cara? ¿Qué es más importante, el lente o el cuerpo de la cámara para empezar?',
     (NOW() - INTERVAL '1 day')::timestamp, 'Aprobado', 'design', 1),
    ('thread-3', 102, '¿Cómo instalar el entorno de desarrollo para Programación I?',
     'Estoy teniendo problemas para instalar y configurar el entorno de desarrollo que pidió el profesor para Programación I. ¿Alguien podría explicarme los pasos o pasar algún tutorial? Me da error al compilar.',
     NOW()::timestamp, 'Pendiente', 'dev', 1),
    ('thread-4', 103, 'Grupo de estudio para Bases de Datos',
     'El parcial de Bases de Datos se viene complicado. ¿A alguien le gustaría armar un grupo de estudio? Podríamos juntarnos en la biblioteca los martes y jueves.',
     (NOW() - INTERVAL '3 days')::timestamp, 'Aprobado', 'dev', 2)
ON CONFLICT (id) DO UPDATE SET
    author_id = EXCLUDED.author_id,
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    timestamp = EXCLUDED.timestamp,
    status = EXCLUDED.status,
    career_id = EXCLUDED.career_id,
    year = EXCLUDED.year;

-- ============================================
-- 9. RESPUESTAS DE FORO
-- ============================================

INSERT INTO forum_replies (id, thread_id, author_id, content, timestamp)
VALUES 
    ('reply-1', 'thread-1', 104, 'Hola! Te paso mis apuntes de esa clase. Los árboles binarios son bastante simples una vez que entiendes el concepto. ¿Te sirve si te los paso mañana?', (NOW() - INTERVAL '1 day')::timestamp),
    ('reply-2', 'thread-1', 105, 'Yo también tengo apuntes bastante completos. Si querés los comparto por email.', (NOW() - INTERVAL '18 hours')::timestamp),
    ('reply-3', 'thread-2', 202, 'Para empezar, te recomiendo una cámara réflex básica. El lente es más importante que el cuerpo al principio. Podés buscar algo usado y barato en marketplace.', (NOW() - INTERVAL '12 hours')::timestamp),
    ('reply-4', 'thread-4', 112, 'Me sumo! ¿A qué hora pensaban juntarse?', (NOW() - INTERVAL '2 days')::timestamp)
ON CONFLICT (id) DO UPDATE SET
    thread_id = EXCLUDED.thread_id,
    author_id = EXCLUDED.author_id,
    content = EXCLUDED.content,
    timestamp = EXCLUDED.timestamp;

-- ============================================
-- 10. NOTIFICACIONES
-- ============================================

INSERT INTO notifications (id, user_id, type, text, details, timestamp, read)
VALUES 
    ('notif-101-1', 101, 'Condición: Libre', 'Condición: Libre en Algoritmos y Estructuras de Datos', 'Has superado el límite de 8 faltas.', (NOW() - INTERVAL '1 hour')::timestamp, false),
    ('notif-101-2', 101, 'Alerta de Asistencia', 'Alerta de Asistencia en Programación I', 'Te quedan solo 3 faltas para alcanzar el límite.', (NOW() - INTERVAL '3 hours')::timestamp, false),
    ('notif-101-3', 101, 'Publicación del Foro Aprobada', 'Tu publicación del foro ha sido aprobada.', 'Título: ¿Alguien tiene apuntes de la clase de Algoritmos del lunes?', (NOW() - INTERVAL '5 hours')::timestamp, false),
    ('notif-101-4', 101, 'Anuncio', 'Nuevo anuncio', 'Inscripciones a materias del próximo cuatrimestre abiertas del 1 al 5 de Agosto.', (NOW() - INTERVAL '1 day')::timestamp, false),
    ('notif-101-5', 101, 'Justificación Rechazada', 'Tu solicitud de justificación ha sido rechazada.', 'Materia: Arquitectura de Computadoras', (NOW() - INTERVAL '2 days')::timestamp, true),
    ('notif-1-1', 1, 'Solicitud de Justificación', 'Maria Lopez ha solicitado una justificación.', 'Materia: Programación I', (NOW() - INTERVAL '10 minutes')::timestamp, false)
ON CONFLICT (id) DO UPDATE SET
    user_id = EXCLUDED.user_id,
    type = EXCLUDED.type,
    text = EXCLUDED.text,
    details = EXCLUDED.details,
    timestamp = EXCLUDED.timestamp,
    read = EXCLUDED.read;

-- ============================================
-- 11. PLANIFICACIONES
-- ============================================

INSERT INTO planificaciones (id, subject_id, title, status, start_date, end_date, objectives, content, activities, evaluations, resources)
VALUES 
    ('plan-1', 'dev-2-prog2', 'Semana 10: Introducción a APIs REST', 'Completado', '2024-07-22', '2024-07-26',
     'Comprender los principios de las APIs REST. Crear un endpoint básico.',
     'Verbos HTTP (GET, POST, PUT, DELETE). Estructura de una petición. JSON. Postman.',
     'Clase teórica sobre REST. Taller práctico de creación de una API simple con Node.js/Express.',
     'Ejercicio práctico en clase. Avance del TP.',
     '[{"id": "res-1-1", "label": "Documentación MDN", "url": "https://developer.mozilla.org/"}]'::jsonb),
    ('plan-2', 'dev-2-prog2', 'Semana 11: Conexión a Base de Datos', 'En Curso', '2024-07-29', '2024-08-02',
     'Conectar la API a una base de datos. Realizar operaciones CRUD.',
     'ORM vs Query Builders. Conexión a PostgreSQL. Modelos y migraciones.',
     'Demostración en vivo. Ejercicios de CRUD.',
     'Entrega del TP N°2.',
     '[{"id": "res-2-1", "label": "Documentación Sequelize", "url": "https://sequelize.org/"}]'::jsonb),
    ('plan-3', 'dev-2-db', 'Módulo 3: Normalización y Modelado', 'Pendiente', '2024-08-05', '2024-08-09',
     'Aplicar las formas normales. Diseñar un modelo relacional eficiente.',
     'Primera, Segunda y Tercera Forma Normal (1FN, 2FN, 3FN). Diagramas Entidad-Relación.',
     'Resolución de casos de estudio en grupo.',
     'Cuestionario sobre formas normales.',
     '[]'::jsonb)
ON CONFLICT (id) DO UPDATE SET
    subject_id = EXCLUDED.subject_id,
    title = EXCLUDED.title,
    status = EXCLUDED.status,
    start_date = EXCLUDED.start_date,
    end_date = EXCLUDED.end_date,
    objectives = EXCLUDED.objectives,
    content = EXCLUDED.content,
    activities = EXCLUDED.activities,
    evaluations = EXCLUDED.evaluations,
    resources = EXCLUDED.resources;

-- ============================================
-- 12. MATERIAL DIDÁCTICO
-- ============================================

INSERT INTO material_didactico (id, subject_id, title, category, type, file_name, file_type, content, url, view_count, download_count, created_at)
VALUES 
    ('mat-1', 'dev-2-prog2', 'Guía de Estilo de Código', 'Guías', 'pdf', 'guia_estilo_codigo.pdf', 'application/pdf',
     'JVBERi0xLjQKJdPr6eEKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovT3V0bGluZXMgMiAwIFIKL1BhZ2VzIDMgMCBSPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL091dGxpbmVzCi9Db3VudCAwPj4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFs0IDAgUl0KL0NvdW50IDE+PgplbmRvYmoKNCAwIG9iago8PAovVHlwZSAvUGFnZQovUGFyZW50IDMgMCBSCi9SZXNvdXJjZXMgPDwKL0ZvbnQgPDwKL0YxIDYgMCBSCj4+Ci9Qcm9jU2V0IFsvUERGL1RleHQvSW1hZ2VCL0ltYWdlQy9JbWFnZUldPj4KL01lZGlhQm94IFswIDAgNTk1IDg0Ml0KL0NvbnRlbnRzIDUgMCBSCi9Hcm9wIDw8Ci9UeXBlIC9Hcm9wCi9TIC9UcmFuc3BhcmVuY3kKL0NTIC9EZXZpY2VSR0IKPj4+PgplbmRvYmoKNSAwIG9iago8PAovTGVuZ3RoIDYyPj4Kc3RyZWFtCkJUCjcwIDc1MCBUZAovRjEgMTIgVGYKKFRoaXMgaXMgYSBzaW1wbGUgUERGLikgVGoKRVQKZW5kc3RyZWFtCmVuZG9iago2IDAgb2JqCjw8Ci9UeXBlIC9Gb250Ci9TdWJ0eXBlIC9UeXBlMQovQmFzZUZvbnQgL0hlbHZldGljYQo+PgplbmRvYmoKeHJlZgowIDcKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDE1IDY1NTM1IGYgCjAwMDAwMDAwNzQgNjU1MzUgZiAKMDAwMDAwMDA5MyA2NTUzNSBmIAowMDAwMDAwMTQyIDY1NTM1IGYgCjAwMDAwMDAzMjYgNjU1MzUgZiAKMDAwMDAwMzkzIDY1NTM1IGYgCnRyYWlsZXIKPDwKL1NpemUgNwovUm9vdCAxIDAgUgo+PgpzdGFydHhyZWYKNDQxCjUlRU9GCg==',
     NULL, 15, 12, '2024-07-10T10:00:00Z'::timestamp),
    ('mat-2', 'dev-2-prog2', 'Tutorial de APIs REST', 'Extra', 'link', NULL, NULL,
     NULL, 'https://www.youtube.com/watch?v=Q-B_j9_g_aE', 22, 0, '2024-07-12T11:30:00Z'::timestamp),
    ('mat-3', 'dev-2-prog2', 'Enunciado TP N°2: API de Tareas', 'Prácticas', 'pdf', 'tp2_api_tareas.pdf', 'application/pdf',
     'JVBERi0xLjQKJdPr6eEKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovT3V0bGluZXMgMiAwIFIKL1BhZ2VzIDMgMCBSPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL091dGxpbmVzCi9Db3VudCAwPj4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFs0IDAgUl0KL0NvdW50IDE+PgplbmRvYmoKNCAwIG9iago8PAovVHlwZSAvUGFnZQovUGFyZW50IDMgMCBSCi9SZXNvdXJjZXMgPDwKL0ZvbnQgPDwKL0YxIDYgMCBSCj4+Ci9Qcm9jU2V0IFsvUERGL1RleHQvSW1hZ2VCL0ltYWdlQy9JbWFnZUldPj4KL01lZGlhQm94IFswIDAgNTk1IDg0Ml0KL0NvbnRlbnRzIDUgMCBSCi9Hcm9wIDw8Ci9UeXBlIC9Hcm9wCi9TIC9UcmFuc3BhcmVuY3kKL0NTIC9EZXZpY2VSR0IKPj4+PgplbmRvYmoKNSAwIG9iago8PAovTGVuZ3RoIDYyPj4Kc3RyZWFtCkJUCjcwIDc1MCBUZAovRjEgMTIgVGYKKFRoaXMgaXMgYSBzaW1wbGUgUERGLikgVGoKRVQKZW5kc3RyZWFtCmVuZG9iago2IDAgb2JqCjw8Ci9UeXBlIC9Gb250Ci9TdWJ0eXBlIC9UeXBlMQovQmFzZUZvbnQgL0hlbHZldGljYQo+PgplbmRvYmoKeHJlZgowIDcKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDE1IDY1NTM1IGYgCjAwMDAwMDAwNzQgNjU1MzUgZiAKMDAwMDAwMDA5MyA2NTUzNSBmIAowMDAwMDAwMTQyIDY1NTM1IGYgCjAwMDAwMDAzMjYgNjU1MzUgZiAKMDAwMDAwMzkzIDY1NTM1IGYgCnRyYWlsZXIKPDwKL1NpemUgNwovUm9vdCAxIDAgUgo+PgpzdGFydHhyZWYKNDQxCjUlRU9GCg==',
     NULL, 18, 18, '2024-07-29T09:00:00Z'::timestamp),
    ('mat-4', 'dev-2-db', 'Modelo Entidad-Relación de Ejemplo', 'Guías', 'image', 'modelo_er.png', 'image/png',
     'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
     NULL, 25, 20, '2024-07-15T14:00:00Z'::timestamp),
    ('mat-5', 'dev-2-db', 'Ejercicios de Normalización', 'Prácticas', 'pdf', 'ejercicios_normalizacion.pdf', 'application/pdf',
     'JVBERi0xLjQKJdPr6eEKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovT3V0bGluZXMgMiAwIFIKL1BhZ2VzIDMgMCBSPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL091dGxpbmVzCi9Db3VudCAwPj4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFs0IDAgUl0KL0NvdW50IDE+PgplbmRvYmoKNCAwIG9iago8PAovVHlwZSAvUGFnZQovUGFyZW50IDMgMCBSCi9SZXNvdXJjZXMgPDwKL0ZvbnQgPDwKL0YxIDYgMCBSCj4+Ci9Qcm9jU2V0IFsvUERGL1RleHQvSW1hZ2VCL0ltYWdlQy9JbWFnZUldPj4KL01lZGlhQm94IFswIDAgNTk1IDg0Ml0KL0NvbnRlbnRzIDUgMCBSCi9Hcm9wIDw8Ci9UeXBlIC9Hcm9wCi9TIC9UcmFuc3BhcmVuY3kKL0NTIC9EZXZpY2VSR0IKPj4+PgplbmRvYmoKNSAwIG9iago8PAovTGVuZ3RoIDYyPj4Kc3RyZWFtCkJUCjcwIDc1MCBUZAovRjEgMTIgVGYKKFRoaXMgaXMgYSBzaW1wbGUgUERGLikgVGoKRVQKZW5kc3RyZWFtCmVuZG9iago2IDAgb2JqCjw8Ci9UeXBlIC9Gb250Ci9TdWJ0eXBlIC9UeXBlMQovQmFzZUZvbnQgL0hlbHZldGljYQo+PgplbmRvYmoKeHJlZgowIDcKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDE1IDY1NTM1IGYgCjAwMDAwMDAwNzQgNjU1MzUgZiAKMDAwMDAwMDA5MyA2NTUzNSBmIAowMDAwMDAwMTQyIDY1NTM1IGYgCjAwMDAwMDAzMjYgNjU1MzUgZiAKMDAwMDAwMzkzIDY1NTM1IGYgCnRyYWlsZXIKPDwKL1NpemUgNwovUm9vdCAxIDAgUgo+PgpzdGFydHhyZWYKNDQxCjUlRU9GCg==',
     NULL, 12, 10, '2024-08-01T18:00:00Z'::timestamp)
ON CONFLICT (id) DO UPDATE SET
    subject_id = EXCLUDED.subject_id,
    title = EXCLUDED.title,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    file_name = EXCLUDED.file_name,
    file_type = EXCLUDED.file_type,
    content = EXCLUDED.content,
    url = EXCLUDED.url,
    view_count = EXCLUDED.view_count,
    download_count = EXCLUDED.download_count,
    created_at = EXCLUDED.created_at;

-- ============================================
-- RESUMEN Y VERIFICACIÓN
-- ============================================

DO $$
DECLARE
    career_count INTEGER;
    subject_count INTEGER;
    user_count INTEGER;
    attendance_count INTEGER;
    grade_count INTEGER;
    news_count INTEGER;
    thread_count INTEGER;
    reply_count INTEGER;
    notification_count INTEGER;
    planificacion_count INTEGER;
    material_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO career_count FROM careers;
    SELECT COUNT(*) INTO subject_count FROM subjects;
    SELECT COUNT(*) INTO user_count FROM users;
    SELECT COUNT(*) INTO attendance_count FROM attendance_records;
    SELECT COUNT(*) INTO grade_count FROM grades;
    SELECT COUNT(*) INTO news_count FROM news_items;
    SELECT COUNT(*) INTO thread_count FROM forum_threads;
    SELECT COUNT(*) INTO reply_count FROM forum_replies;
    SELECT COUNT(*) INTO notification_count FROM notifications;
    SELECT COUNT(*) INTO planificacion_count FROM planificaciones;
    SELECT COUNT(*) INTO material_count FROM material_didactico;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'RESUMEN DE DATOS INSERTADOS';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ Carreras: %', career_count;
    RAISE NOTICE '✅ Materias: %', subject_count;
    RAISE NOTICE '✅ Usuarios: %', user_count;
    RAISE NOTICE '✅ Registros de Asistencia: %', attendance_count;
    RAISE NOTICE '✅ Calificaciones: %', grade_count;
    RAISE NOTICE '✅ Noticias: %', news_count;
    RAISE NOTICE '✅ Hilos de Foro: %', thread_count;
    RAISE NOTICE '✅ Respuestas de Foro: %', reply_count;
    RAISE NOTICE '✅ Notificaciones: %', notification_count;
    RAISE NOTICE '✅ Planificaciones: %', planificacion_count;
    RAISE NOTICE '✅ Material Didáctico: %', material_count;
    RAISE NOTICE '========================================';
    RAISE NOTICE '¡Datos cargados exitosamente!';
    RAISE NOTICE '========================================';
END $$;

