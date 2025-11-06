-- ============================================
-- ESQUEMA SQL COMPLETO PARA SISTEMA ACADÉMICO
-- Base de datos: PostgreSQL (Supabase)
-- ============================================

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLAS BASE
-- ============================================

-- Tabla de Carreras
CREATE TABLE IF NOT EXISTS careers (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    years INTEGER[] NOT NULL,
    theme VARCHAR(50) NOT NULL CHECK (theme IN ('theme-dev', 'theme-design')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Materias
CREATE TABLE IF NOT EXISTS subjects (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    career_id VARCHAR(50) NOT NULL REFERENCES careers(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Usuarios
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- En producción debería ser hash
    role VARCHAR(50) NOT NULL CHECK (role IN ('Alumno', 'Preceptor', 'Profesor', 'Auxiliar', 'Centro de Estudiantes')),
    career_id VARCHAR(50) REFERENCES careers(id) ON DELETE SET NULL,
    year INTEGER[], -- Array para permitir múltiples años
    assigned_subjects TEXT[], -- Array de IDs de materias para profesores
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Horarios de Clase
CREATE TABLE IF NOT EXISTS class_schedules (
    id SERIAL PRIMARY KEY,
    subject_id VARCHAR(50) NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 1 AND 5), -- 1=Lunes, 5=Viernes
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    classroom VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(subject_id, day_of_week, start_time)
);

-- ============================================
-- TABLAS DE ASISTENCIA
-- ============================================

-- Tabla de Registros de Asistencia
CREATE TABLE IF NOT EXISTS attendance_records (
    id VARCHAR(100) PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject_id VARCHAR(50) NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('Presente', 'Ausente', 'Justificado', 'Pendiente')),
    justification_reason TEXT,
    justification_file JSONB, -- { name: string, type: string, content: string (base64) }
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, subject_id, date)
);

-- Tabla de Sesiones QR de Asistencia
CREATE TABLE IF NOT EXISTS qr_attendance_sessions (
    id VARCHAR(100) PRIMARY KEY,
    subject_id VARCHAR(50) NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    preceptor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    location_latitude DECIMAL(10, 8) NOT NULL,
    location_longitude DECIMAL(11, 8) NOT NULL,
    radius INTEGER NOT NULL, -- En metros
    created_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLAS DE CALIFICACIONES
-- ============================================

-- Tabla de Calificaciones
CREATE TABLE IF NOT EXISTS grades (
    id VARCHAR(100) PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject_id VARCHAR(50) NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN (
        'Parcial 1', 'Recuperatorio 1', 'TP',
        'Parcial 2', 'Recuperatorio 2',
        'Nota 1er Cuatrimestre', 'Nota 2do Cuatrimestre',
        'Examen Final'
    )),
    value VARCHAR(50) NOT NULL, -- Puede ser numérico o conceptual
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, subject_id, type)
);

-- ============================================
-- TABLAS DE COMUNICACIÓN
-- ============================================

-- Tabla de Comunicados/Anuncios
CREATE TABLE IF NOT EXISTS news_items (
    id VARCHAR(100) PRIMARY KEY,
    text TEXT NOT NULL,
    career_id VARCHAR(50) REFERENCES careers(id) ON DELETE CASCADE,
    year INTEGER,
    subject_id VARCHAR(50) REFERENCES subjects(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Mensajes Privados
CREATE TABLE IF NOT EXISTS private_messages (
    id VARCHAR(100) PRIMARY KEY,
    sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Notificaciones
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(100) PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL,
    text TEXT NOT NULL,
    details TEXT,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLAS DE FOROS
-- ============================================

-- Tabla de Hilos de Foro (Estudiantes)
CREATE TABLE IF NOT EXISTS forum_threads (
    id VARCHAR(100) PRIMARY KEY,
    author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('Pendiente', 'Aprobado', 'Rechazado', 'Necesita Revisión')),
    career_id VARCHAR(50) NOT NULL REFERENCES careers(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    rejection_reason TEXT,
    is_locked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Respuestas de Foro (Estudiantes)
CREATE TABLE IF NOT EXISTS forum_replies (
    id VARCHAR(100) PRIMARY KEY,
    thread_id VARCHAR(100) NOT NULL REFERENCES forum_threads(id) ON DELETE CASCADE,
    author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Hilos de Foro del Centro de Estudiantes
CREATE TABLE IF NOT EXISTS student_rep_forum_threads (
    id VARCHAR(100) PRIMARY KEY,
    author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('general', 'propuestas', 'eventos')),
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    is_pinned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Respuestas del Centro de Estudiantes
CREATE TABLE IF NOT EXISTS student_rep_forum_replies (
    id VARCHAR(100) PRIMARY KEY,
    thread_id VARCHAR(100) NOT NULL REFERENCES student_rep_forum_threads(id) ON DELETE CASCADE,
    author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLAS DE PERFILES Y CONFIGURACIÓN
-- ============================================

-- Tabla de Perfiles de Usuario
CREATE TABLE IF NOT EXISTS user_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    profile_picture TEXT, -- Base64
    banner_image TEXT, -- Base64
    bio TEXT,
    phone VARCHAR(50),
    address TEXT,
    emergency_contact TEXT,
    profile_accent_color VARCHAR(7), -- Hex color
    student_rep_position VARCHAR(100),
    view_permissions JSONB, -- JSON con permisos de vista
    notification_settings JSONB, -- JSON con configuración de notificaciones
    teacher_settings JSONB, -- JSON con configuración de profesores
    preceptor_settings JSONB, -- JSON con configuración de preceptores
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Enlaces Personales
CREATE TABLE IF NOT EXISTS personal_links (
    id VARCHAR(100) PRIMARY KEY,
    user_profile_id INTEGER NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    label VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Slots de Disponibilidad (Profesores)
CREATE TABLE IF NOT EXISTS availability_slots (
    id VARCHAR(100) PRIMARY KEY,
    user_profile_id INTEGER NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 1 AND 5),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Notas Personales
CREATE TABLE IF NOT EXISTS notes (
    id VARCHAR(100) PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    color VARCHAR(7) NOT NULL, -- Hex color
    is_pinned BOOLEAN DEFAULT FALSE,
    last_modified TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLAS DE CALENDARIO Y EVENTOS
-- ============================================

-- Tabla de Eventos de Calendario
CREATE TABLE IF NOT EXISTS calendar_events (
    id VARCHAR(100) PRIMARY KEY,
    date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    title VARCHAR(500) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('class', 'exam', 'assignment', 'event', 'custom')),
    description TEXT,
    subject_id VARCHAR(50) REFERENCES subjects(id) ON DELETE SET NULL,
    is_all_day BOOLEAN DEFAULT FALSE,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Participantes de Eventos
CREATE TABLE IF NOT EXISTS event_participants (
    id SERIAL PRIMARY KEY,
    event_id VARCHAR(100) NOT NULL REFERENCES calendar_events(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

-- Tabla de Eventos del Centro de Estudiantes
CREATE TABLE IF NOT EXISTS student_rep_events (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    date DATE NOT NULL,
    time TIME,
    location VARCHAR(255),
    description TEXT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('académico', 'cultural', 'deportivo', 'reunión')),
    organizer VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Participantes de Eventos del Centro de Estudiantes
CREATE TABLE IF NOT EXISTS student_rep_event_participants (
    id SERIAL PRIMARY KEY,
    event_id VARCHAR(100) NOT NULL REFERENCES student_rep_events(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

-- ============================================
-- TABLAS ACADÉMICAS
-- ============================================

-- Tabla de Planificaciones
CREATE TABLE IF NOT EXISTS planificaciones (
    id VARCHAR(100) PRIMARY KEY,
    subject_id VARCHAR(50) NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('Pendiente', 'En curso', 'Completado')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    objectives TEXT NOT NULL,
    content TEXT NOT NULL,
    activities TEXT NOT NULL,
    evaluations TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Recursos de Planificación
CREATE TABLE IF NOT EXISTS planificacion_resources (
    id VARCHAR(100) PRIMARY KEY,
    planificacion_id VARCHAR(100) NOT NULL REFERENCES planificaciones(id) ON DELETE CASCADE,
    label VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Material Didáctico
CREATE TABLE IF NOT EXISTS materials (
    id VARCHAR(100) PRIMARY KEY,
    subject_id VARCHAR(50) NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('Guías de Estudio', 'Trabajos Prácticos', 'Modelos de Evaluación', 'Material Extra')),
    type VARCHAR(50) NOT NULL CHECK (type IN ('link', 'pdf', 'image', 'presentation')),
    url TEXT,
    file_name VARCHAR(255),
    file_type VARCHAR(100),
    content TEXT, -- Base64
    view_count INTEGER DEFAULT 0,
    download_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLAS DE STAFF
-- ============================================

-- Tabla de Tareas Diarias
CREATE TABLE IF NOT EXISTS daily_tasks (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    start_time TIME NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('limpieza', 'mantenimiento', 'rutina')),
    status VARCHAR(50) NOT NULL CHECK (status IN ('pendiente', 'completada')),
    location VARCHAR(255) NOT NULL,
    details TEXT,
    assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Historial de Mantenimiento
CREATE TABLE IF NOT EXISTS maintenance_history (
    id VARCHAR(100) PRIMARY KEY,
    date DATE NOT NULL,
    task TEXT NOT NULL,
    responsible VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Instalaciones
CREATE TABLE IF NOT EXISTS installations (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('ok', 'maintenance', 'out_of_service')),
    layout_col INTEGER NOT NULL,
    layout_row INTEGER NOT NULL,
    layout_col_span INTEGER NOT NULL,
    layout_row_span INTEGER NOT NULL,
    last_cleaned DATE,
    next_task TEXT,
    incident TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Incidentes
CREATE TABLE IF NOT EXISTS incidents (
    id VARCHAR(100) PRIMARY KEY,
    description TEXT NOT NULL,
    priority VARCHAR(50) NOT NULL CHECK (priority IN ('Baja', 'Media', 'Alta')),
    sector VARCHAR(255) NOT NULL,
    image TEXT, -- Base64
    status VARCHAR(50) NOT NULL CHECK (status IN ('abierta', 'en_progreso', 'resuelta')),
    reported_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Solicitudes de Cambio de Turno
CREATE TABLE IF NOT EXISTS shift_change_requests (
    id VARCHAR(100) PRIMARY KEY,
    requester_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    colleague_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    requester_turno DATE NOT NULL,
    colleague_turno DATE NOT NULL,
    reason TEXT,
    status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLAS DEL CENTRO DE ESTUDIANTES
-- ============================================

-- Tabla de Anuncios del Centro de Estudiantes
CREATE TABLE IF NOT EXISTS student_rep_announcements (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    is_pinned BOOLEAN DEFAULT FALSE,
    publish_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Archivos de Anuncios
CREATE TABLE IF NOT EXISTS student_rep_announcement_files (
    id SERIAL PRIMARY KEY,
    announcement_id VARCHAR(100) NOT NULL REFERENCES student_rep_announcements(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_content TEXT NOT NULL, -- Base64
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Reclamos/Sugerencias
CREATE TABLE IF NOT EXISTS student_rep_claims (
    id VARCHAR(100) PRIMARY KEY,
    author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL CHECK (category IN ('académico', 'infraestructura', 'administrativo', 'sugerencia')),
    description TEXT NOT NULL,
    file_name VARCHAR(255),
    file_type VARCHAR(100),
    file_content TEXT, -- Base64
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('pendiente', 'en revisión', 'resuelto', 'archivado')),
    response TEXT,
    responder_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- ============================================

-- Índices para usuarios
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_career_id ON users(career_id);

-- Índices para asistencia
CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON attendance_records(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_subject_id ON attendance_records(subject_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance_records(date);
CREATE INDEX IF NOT EXISTS idx_attendance_status ON attendance_records(status);

-- Índices para calificaciones
CREATE INDEX IF NOT EXISTS idx_grades_student_id ON grades(student_id);
CREATE INDEX IF NOT EXISTS idx_grades_subject_id ON grades(subject_id);

-- Índices para mensajes
CREATE INDEX IF NOT EXISTS idx_messages_sender ON private_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON private_messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_read ON private_messages(read);

-- Índices para notificaciones
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Índices para foros
CREATE INDEX IF NOT EXISTS idx_forum_threads_author ON forum_threads(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_threads_status ON forum_threads(status);
CREATE INDEX IF NOT EXISTS idx_forum_threads_career_year ON forum_threads(career_id, year);
CREATE INDEX IF NOT EXISTS idx_forum_replies_thread ON forum_replies(thread_id);

-- Índices para eventos
CREATE INDEX IF NOT EXISTS idx_calendar_events_date ON calendar_events(date);
CREATE INDEX IF NOT EXISTS idx_student_rep_events_date ON student_rep_events(date);

-- ============================================
-- TRIGGERS PARA updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger a todas las tablas con updated_at
CREATE TRIGGER update_careers_updated_at BEFORE UPDATE ON careers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subjects_updated_at BEFORE UPDATE ON subjects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_attendance_records_updated_at BEFORE UPDATE ON attendance_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_grades_updated_at BEFORE UPDATE ON grades FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_news_items_updated_at BEFORE UPDATE ON news_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_private_messages_updated_at BEFORE UPDATE ON private_messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_forum_threads_updated_at BEFORE UPDATE ON forum_threads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_forum_replies_updated_at BEFORE UPDATE ON forum_replies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_student_rep_forum_threads_updated_at BEFORE UPDATE ON student_rep_forum_threads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_student_rep_forum_replies_updated_at BEFORE UPDATE ON student_rep_forum_replies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON calendar_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_student_rep_events_updated_at BEFORE UPDATE ON student_rep_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_planificaciones_updated_at BEFORE UPDATE ON planificaciones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_materials_updated_at BEFORE UPDATE ON materials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_daily_tasks_updated_at BEFORE UPDATE ON daily_tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_installations_updated_at BEFORE UPDATE ON installations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_incidents_updated_at BEFORE UPDATE ON incidents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shift_change_requests_updated_at BEFORE UPDATE ON shift_change_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_student_rep_announcements_updated_at BEFORE UPDATE ON student_rep_announcements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_student_rep_claims_updated_at BEFORE UPDATE ON student_rep_claims FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMENTARIOS EN TABLAS
-- ============================================

COMMENT ON TABLE careers IS 'Carreras disponibles (Dev, Design)';
COMMENT ON TABLE subjects IS 'Materias por carrera y año';
COMMENT ON TABLE users IS 'Usuarios del sistema (estudiantes, profesores, preceptores, etc.)';
COMMENT ON TABLE attendance_records IS 'Registros de asistencia de estudiantes';
COMMENT ON TABLE grades IS 'Calificaciones de estudiantes';
COMMENT ON TABLE notifications IS 'Notificaciones del sistema para usuarios';
COMMENT ON TABLE forum_threads IS 'Hilos del foro de estudiantes (requieren moderación)';
COMMENT ON TABLE student_rep_events IS 'Eventos organizados por el Centro de Estudiantes';

