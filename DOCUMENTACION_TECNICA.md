# Documentación Técnica - Sistema de Gestión Académica

## Índice
1. [Arquitectura General](#arquitectura-general)
2. [Sistema de Roles y Permisos](#sistema-de-roles-y-permisos)
3. [Autenticación y Autorización](#autenticación-y-autorización)
4. [Gestión de Asistencia](#gestión-de-asistencia)
5. [Sistema de Calificaciones](#sistema-de-calificaciones)
6. [Sistema de Notificaciones](#sistema-de-notificaciones)
7. [Foros y Comunicación](#foros-y-comunicación)
8. [Material Didáctico](#material-didáctico)
9. [Planificaciones](#planificaciones)
10. [Centro de Estudiantes](#centro-de-estudiantes)
11. [Panel de Staff](#panel-de-staff)
12. [Temas y Personalización](#temas-y-personalización)
13. [Flujos de Datos Principales](#flujos-de-datos-principales)
14. [Estructura de Datos](#estructura-de-datos)

---

## Arquitectura General

### Stack Tecnológico
- **Frontend Framework**: React 19.1.1
- **Build Tool**: Vite 6.2.0
- **Lenguaje**: TypeScript 5.8.2
- **Librerías Externas**:
  - `@google/genai`: Integración con Gemini AI para generación de justificaciones
  - `jspdf` y `jspdf-autotable`: Generación de reportes PDF

### Estructura del Proyecto
```
appjulian/
├── App.tsx                 # Componente principal, router de roles
├── index.tsx               # Punto de entrada de la aplicación
├── types.ts                # Definiciones de tipos TypeScript
├── constants.ts            # Datos iniciales y constantes
├── vite.config.ts          # Configuración de Vite
├── components/             # Componentes React
│   ├── AuthForm.tsx        # Formulario de login/registro
│   ├── StudentDashboard.tsx
│   ├── PreceptorDashboard.tsx
│   ├── TeacherDashboard.tsx
│   ├── StaffDashboard.tsx
│   ├── StudentRepDashboard.tsx
│   └── [otros componentes]
└── index.html              # HTML base
```

### Estado de la Aplicación
El estado se gestiona completamente en el componente `App.tsx` usando React Hooks (`useState`). No hay backend ni persistencia externa - todos los datos residen en memoria durante la sesión.

**Estados principales gestionados en App.tsx:**
- `currentUser`: Usuario autenticado actualmente
- `users`: Lista de todos los usuarios
- `attendanceRecords`: Registros de asistencia
- `grades`: Calificaciones
- `notifications`: Notificaciones del sistema
- `forumThreads` / `forumReplies`: Hilos y respuestas del foro
- `privateMessages`: Mensajes privados entre usuarios
- `planificaciones`: Planificaciones de materias
- `materials`: Material didáctico
- `dailyTasks`: Tareas diarias (Staff)
- `incidents`: Incidentes (Staff)
- `studentRepEvents`: Eventos del Centro de Estudiantes

---

## Sistema de Roles y Permisos

### Roles Disponibles

#### 1. **Alumno (STUDENT)**
**Capacidades:**
- Ver su asistencia por materia
- Solicitar justificaciones de faltas
- Ver calificaciones y promedios
- Ver comunicados y anuncios
- Enviar/recibir mensajes privados
- Crear y participar en foros (requiere aprobación del preceptor)
- Ver horarios y agenda personal
- Acceder a material didáctico de sus materias
- Ver eventos del Centro de Estudiantes
- Enviar reclamos/sugerencias al Centro de Estudiantes

**Restricciones:**
- No puede modificar asistencia
- No puede ver asistencia de otros estudiantes
- Sus publicaciones en foros requieren aprobación

#### 2. **Preceptor (PRECEPTOR)**
**Capacidades:**
- Tomar asistencia de estudiantes de su carrera/año
- Aprobar/rechazar justificaciones de faltas
- Crear sesiones QR para asistencia
- Ver reportes de asistencia
- Crear y gestionar comunicados
- Aprobar/rechazar/editar publicaciones del foro
- Ver y responder mensajes privados
- Ver eventos del Centro de Estudiantes

**Restricciones:**
- Solo puede gestionar estudiantes de su carrera asignada
- No puede modificar calificaciones directamente

#### 3. **Profesor (TEACHER)**
**Capacidades:**
- Tomar asistencia en sus materias asignadas
- Cargar y modificar calificaciones
- Crear comunicados específicos por materia/carrera/año
- Crear planificaciones de materias
- Subir material didáctico
- Ver eventos del Centro de Estudiantes

**Restricciones:**
- Solo puede gestionar materias asignadas (`assignedSubjects`)
- No puede aprobar justificaciones (solo preceptor)

#### 4. **Auxiliar (STAFF)**
**Capacidades:**
- Gestionar tareas diarias de limpieza/mantenimiento
- Registrar incidentes
- Gestionar instalaciones y su estado
- Ver historial de mantenimiento
- Solicitar cambio de turnos a colegas
- Justificar ausencias propias

**Restricciones:**
- No tiene acceso a información académica de estudiantes

#### 5. **Centro de Estudiantes (STUDENT_REP)**
**Capacidades:**
- Crear y gestionar eventos académicos/culturales/deportivos
- Crear foros internos del Centro de Estudiantes
- Publicar anuncios
- Recibir y gestionar reclamos/sugerencias de estudiantes
- Ver participantes de eventos

**Restricciones:**
- No puede modificar asistencia o calificaciones

### Asignación de Roles
- Los estudiantes se asignan a una carrera (`careerId`) y año (`year`)
- Los preceptores pueden gestionar múltiples años (array de años)
- Los profesores tienen materias asignadas (`assignedSubjects`)
- El staff no requiere carrera/año

---

## Autenticación y Autorización

### Proceso de Autenticación

**Login (`AuthForm.tsx`):**
1. Usuario selecciona rol, carrera (si aplica), año (si aplica)
2. Ingresa email/nombre y contraseña
3. El sistema busca en `INITIAL_USERS` un usuario que coincida:
   - Email o nombre debe coincidir
   - Contraseña debe coincidir
   - Rol debe coincidir
   - Si requiere carrera/año, deben coincidir
4. Si encuentra coincidencia, establece `currentUser` en `App.tsx`

**Registro:**
1. Usuario completa formulario con datos personales
2. Para roles especiales (Preceptor, Profesor, Staff), requiere código de registro
3. Códigos de preceptor: `PRECEPTOR_DEV_2024`, `PRECEPTOR_DESIGN_2024`, `ADMIN_ACCESS_01`
4. Nuevo usuario se agrega al array `users` en `App.tsx`

### Seguridad
- ⚠️ **Nota de Seguridad**: Las contraseñas se almacenan en texto plano (solo para prototipo)
- En producción, deben hashearse (bcrypt, argon2, etc.)
- No hay validación de sesión expirada
- No hay tokens JWT

### Flujo de Autorización
```
Usuario no autenticado → AuthForm
Usuario autenticado → Dashboard según role
```

---

## Gestión de Asistencia

### Modelo de Datos
```typescript
interface AttendanceRecord {
  id: string;
  studentId: number;
  subjectId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  justificationReason?: string;
  justificationFile?: JustificationFile;
}
```

### Estados de Asistencia
- **PRESENT**: Presente
- **ABSENT**: Ausente
- **JUSTIFIED**: Justificado (aprobaron la justificación)
- **PENDING_JUSTIFICATION**: Pendiente de justificación

### Reglas de Negocio

#### Límites de Asistencia
- **ABSENCE_LIMIT**: 8 faltas (sin justificar) = condición "Libre"
- **MINIMUM_PRESENTISM**: 70% de presentismo requerido
- **CLASS_COUNT_THRESHOLD_FOR_LIBRE**: 10 clases registradas mínimas para evaluar condición

#### Cálculo de Condición
1. Se cuentan las ausencias sin justificar de una materia
2. Si ausencias >= 8 → condición "Libre"
3. Si ausencias < 8 pero presenteismo < 70% → Alerta de asistencia
4. Se envían notificaciones automáticas cuando:
   - Alumno tiene 5 faltas restantes para llegar al límite
   - Alumno alcanza condición "Libre"

### Flujo de Toma de Asistencia

#### Por Preceptor
1. Preceptor selecciona materia y fecha
2. Se muestran estudiantes de su carrera/año
3. Preceptor marca presente/ausente para cada estudiante
4. Se crean registros `AttendanceRecord` con estado `PRESENT` o `ABSENT`
5. Se envía notificación a estudiantes: `PRECEPTOR_ATTENDANCE_TAKEN`

#### Por Profesor
1. Profesor selecciona materia asignada y fecha
2. Se muestran estudiantes de esa materia
3. Similar al preceptor, pero notificación: `TEACHER_ATTENDANCE_TAKEN`

#### Sincronización de Asistencia
- Si un profesor tiene `syncAttendance` habilitado para una materia
- Y el preceptor también tiene `syncAttendance` habilitado
- La asistencia tomada por uno se sincroniza automáticamente con el otro
- Notificación: `SYNCED_ATTENDANCE_TAKEN`

### Flujo de Justificación de Faltas

#### 1. Alumno Solicita Justificación
1. Alumno ve sus faltas en el dashboard
2. Selecciona una falta sin justificar
3. Completa formulario:
   - Motivo (texto)
   - Archivo adjunto (certificado, comprobante, etc.)
   - Opcional: Generar justificación con IA (Gemini)
4. Estado cambia a `PENDING_JUSTIFICATION`
5. Notificación al preceptor: `JUSTIFICATION_REQUEST`

#### 2. Generación con IA
- Usa Google Gemini API (`gemini-2.5-flash`)
- El usuario ingresa palabras clave
- La IA genera texto formal de justificación
- API Key: `process.env.GEMINI_API_KEY`

#### 3. Preceptor Resuelve Justificación
1. Preceptor ve solicitudes pendientes en panel
2. Puede descargar/ver archivo adjunto
3. Opciones:
   - **Aprobar**: Estado → `JUSTIFIED`
   - **Rechazar**: Estado → `ABSENT`
4. Notificaciones:
   - Aprobar: `JUSTIFICATION_APPROVED` al estudiante
   - Rechazar: `JUSTIFICATION_REJECTED` al estudiante

### Asistencia QR (No Implementado)
- Interfaz preparada pero función retorna `"Not implemented yet"`
- Estructura de datos `QRAttendanceSession` existe pero no se usa

---

## Sistema de Calificaciones

### Modelo de Datos
```typescript
interface Grade {
  id: string;
  studentId: number;
  subjectId: string;
  type: GradeType;
  value: string; // Puede ser numérico "8" o conceptual "Aprobado"
  comments?: string;
}
```

### Tipos de Calificación
```typescript
type GradeType = 
  | 'Parcial 1' 
  | 'Recuperatorio 1' 
  | 'TP' 
  | 'Parcial 2' 
  | 'Recuperatorio 2' 
  | 'Nota 1er Cuatrimestre' 
  | 'Nota 2do Cuatrimestre' 
  | 'Examen Final';
```

### Flujo de Carga de Calificaciones

#### Por Profesor
1. Profesor selecciona materia asignada
2. Ve lista de estudiantes de esa materia
3. Para cada estudiante, puede cargar:
   - Parciales, recuperatorios, TPs
   - Notas de cuatrimestre (calculadas o manuales)
   - Nota de examen final
4. Al guardar, se actualiza array `grades`
5. Se envía notificación: `NEW_GRADE` al estudiante

### Cálculo de Promedios
- Los estudiantes ven promedios calculados automáticamente
- Se considera:
  - Nota 1er Cuatrimestre
  - Nota 2do Cuatrimestre
  - Examen Final (si existe)
- Lógica de condición:
  - **Promociona**: Ambos cuatrimestres >= 7 y promedio >= 7
  - **Rinde Final**: Ambos cuatrimestres >= 4
  - **Libre**: No cumple condiciones anteriores o condición de asistencia

---

## Sistema de Notificaciones

### Modelo de Datos
```typescript
interface Notification {
  id: string;
  userId: number;
  type: NotificationType;
  text: string;
  details?: string;
  timestamp: string;
  read: boolean;
}
```

### Tipos de Notificaciones

#### Asistencia
- `ABSENCE`: Alerta de falta
- `ATTENDANCE_WARNING`: Alerta de asistencia (cerca del límite)
- `ATTENDANCE_STATUS_LIBRE`: Condición "Libre"
- `PRECEPTOR_ATTENDANCE_TAKEN`: Asistencia tomada por preceptor
- `TEACHER_ATTENDANCE_TAKEN`: Asistencia tomada por profesor
- `SYNCED_ATTENDANCE_TAKEN`: Asistencia sincronizada

#### Justificaciones
- `JUSTIFICATION_REQUEST`: Solicitud de justificación recibida (preceptor)
- `JUSTIFICATION_APPROVED`: Justificación aprobada (estudiante)
- `JUSTIFICATION_REJECTED`: Justificación rechazada (estudiante)

#### Foros
- `FORUM_THREAD_APPROVED`: Publicación aprobada
- `FORUM_THREAD_REJECTED`: Publicación rechazada
- `FORUM_THREAD_NEEDS_REVISION`: Solicitud de revisión

#### Académicas
- `NEW_ASSIGNMENT`: Nuevo comunicado/tarea
- `NEW_GRADE`: Nueva calificación
- `LOW_PERFORMANCE_WARNING`: Alerta de rendimiento

#### Eventos
- `UPCOMING_EVENT`: Evento próximo (24h antes)
- `NEW_EVENT_PARTICIPANT`: Nuevo participante en evento

#### Staff
- `TASK_COMPLETED`: Tarea completada
- `NEW_INCIDENT`: Nueva incidencia
- `INCIDENT_RESOLVED`: Incidencia resuelta
- `SHIFT_CHANGE_REQUEST`: Solicitud de cambio de turno
- `SHIFT_CHANGE_ACCEPTED`: Cambio de turno aceptado
- `SHIFT_CHANGE_REJECTED`: Cambio de turno rechazado

### Generación de Notificaciones

#### Automáticas
- Al tomar asistencia → estudiantes reciben notificación
- Al cargar calificación → estudiante recibe notificación
- Al crear comunicado → estudiantes filtrados reciben notificación
- Al aprobar/rechazar justificación → estudiante recibe notificación
- Al aprobar/rechazar publicación foro → autor recibe notificación
- Eventos próximos (24h antes) → notificación si está habilitada en perfil

#### Manuales
- Preceptores/Profesores pueden crear notificaciones manuales
- Centro de Estudiantes notifica sobre eventos

### Gestión de Notificaciones
- Panel de notificaciones muestra todas las no leídas primero
- Marcar como leída: `markNotificationsAsRead(userId)`
- Se actualiza estado `read: true`

---

## Foros y Comunicación

### Foros de Estudiantes

#### Modelo de Datos
```typescript
interface ForumThread {
  id: string;
  authorId: number;
  title: string;
  content: string;
  timestamp: string;
  status: ForumThreadStatus;
  careerId: string;
  year: number;
  rejectionReason?: string;
  isLocked?: boolean;
}

interface ForumReply {
  id: string;
  threadId: string;
  authorId: number;
  content: string;
  timestamp: string;
}
```

#### Estados de Publicación
- **PENDING**: Pendiente de aprobación
- **APPROVED**: Aprobado y visible
- **REJECTED**: Rechazado
- **NEEDS_REVISION**: Necesita revisión

#### Flujo de Publicación

1. **Estudiante crea publicación**
   - Completa título y contenido
   - Selecciona carrera y año
   - Estado inicial: `PENDING`

2. **Preceptor revisa**
   - Ve publicaciones pendientes
   - Opciones:
     - **Aprobar**: Estado → `APPROVED`, se vuelve visible
     - **Rechazar**: Estado → `REJECTED`, se oculta (con razón opcional)
     - **Solicitar revisión**: Estado → `NEEDS_REVISION`
     - **Editar**: Modifica contenido, estado vuelve a `PENDING`

3. **Respuestas**
   - Cualquier usuario puede responder a hilos aprobados
   - No requieren moderación
   - Hilos pueden bloquearse (`isLocked`) para evitar nuevas respuestas

### Mensajes Privados

#### Modelo de Datos
```typescript
interface PrivateMessage {
  id: string;
  senderId: number;
  receiverId: number;
  text: string;
  timestamp: string;
  read: boolean;
}
```

#### Funcionalidad
- Envío bidireccional entre cualquier usuario
- Indicador de "no leído" (`read: false`)
- Marcado como leído al abrir conversación
- No hay límite de caracteres ni validaciones especiales

### Comunicados/Anuncios

#### Modelo de Datos
```typescript
interface NewsItem {
  id: string;
  text: string;
  careerId?: string;    // Opcional: filtro por carrera
  year?: number;         // Opcional: filtro por año
  subjectId?: string;    // Opcional: filtro por materia
}
```

#### Creación de Comunicados

**Por Preceptor:**
- Puede crear comunicados generales o por carrera/año

**Por Profesor:**
- Puede crear comunicados específicos por materia
- Sistema filtra automáticamente estudiantes que deben recibirlo:
  - Misma carrera
  - Mismo año (o incluye el año)
  - Tienen la materia asignada (si `subjectId` está presente)
- Notificación automática: `NEW_ASSIGNMENT`

---

## Material Didáctico

### Modelo de Datos
```typescript
interface Material {
  id: string;
  subjectId: string;
  title: string;
  category: MaterialCategory;
  type: 'link' | 'pdf' | 'image' | 'presentation';
  url?: string;              // Para enlaces externos
  fileName?: string;          // Nombre del archivo
  fileType?: string;          // MIME type
  content?: string;           // Base64 para archivos
  viewCount: number;
  downloadCount: number;
  createdAt: string;
}
```

### Categorías
- `GUIAS`: Guías de Estudio
- `PRACTICAS`: Trabajos Prácticos
- `EVALUACIONES`: Modelos de Evaluación
- `EXTRA`: Material Extra

### Flujo de Gestión

#### Por Profesor
1. Selecciona materia asignada
2. Sube material:
   - Tipo: enlace, PDF, imagen, presentación
   - Si es archivo: se convierte a base64
   - Límite de tamaño: 5MB (validado en frontend)
3. Material queda disponible para estudiantes de esa materia

#### Por Estudiante
1. Ve material de sus materias
2. Puede ver/descargar
3. Se incrementan contadores: `viewCount`, `downloadCount`

---

## Planificaciones

### Modelo de Datos
```typescript
interface Planificacion {
  id: string;
  subjectId: string;
  title: string;
  status: PlanificacionStatus;
  startDate: string;      // YYYY-MM-DD
  endDate: string;        // YYYY-MM-DD
  objectives: string;
  content: string;
  activities: string;
  evaluations: string;
  resources: PlanificacionResource[];
}
```

### Estados
- `PENDIENTE`: Pendiente de iniciar
- `EN_CURSO`: Actualmente en curso
- `COMPLETADO`: Finalizada

### Gestión
- Solo profesores pueden crear/editar planificaciones
- Vinculadas a materias asignadas
- Incluyen objetivos, contenidos, actividades, evaluaciones y recursos

---

## Centro de Estudiantes

### Funcionalidades

#### 1. Eventos
```typescript
interface StudentRepEvent {
  id: string;
  title: string;
  date: string;           // YYYY-MM-DD
  time?: string;          // HH:MM
  location?: string;
  description: string;
  type: StudentRepEventType;  // 'académico' | 'cultural' | 'deportivo' | 'reunión'
  organizer: string;
}
```

- Crear eventos públicos
- Estudiantes pueden unirse
- Notificación cuando alguien se une: `NEW_EVENT_PARTICIPANT`

#### 2. Foros Internos
```typescript
interface StudentRepForumThread {
  id: string;
  authorId: number;
  title: string;
  content: string;
  category: StudentRepForumCategory;  // 'general' | 'propuestas' | 'eventos'
  timestamp: string;
  isPinned?: boolean;
}
```

- No requieren moderación (a diferencia de foros de estudiantes)
- Categorías: general, propuestas, eventos
- Pueden fijarse (`isPinned`)

#### 3. Anuncios
```typescript
interface StudentRepAnnouncement {
  id: string;
  title: string;
  content: string;
  authorId: number;
  timestamp: string;
  isPinned?: boolean;
  files?: JustificationFile[];
  publishDate?: string;
}
```

- Anuncios públicos para todos los estudiantes
- Pueden incluir archivos adjuntos
- Fecha de publicación programable

#### 4. Reclamos/Sugerencias
```typescript
interface StudentRepClaim {
  id: string;
  authorId: number;
  category: StudentRepClaimCategory;  // 'académico' | 'infraestructura' | 'administrativo' | 'sugerencia'
  description: string;
  file?: JustificationFile;
  timestamp: string;
  status: StudentRepClaimStatus;      // 'pendiente' | 'en revisión' | 'resuelto' | 'archivado'
  response?: string;
  responderId?: number;
}
```

- Cualquier estudiante puede enviar reclamos
- Categorías: académico, infraestructura, administrativo, sugerencia
- Centro de Estudiantes puede responder y cambiar estado
- Notificación cuando se recibe: `ANNOUNCEMENT` a todos los representantes

---

## Panel de Staff

### Funcionalidades

#### 1. Tareas Diarias
```typescript
interface DailyTask {
  id: string;
  title: string;
  startTime: string;
  type: TaskType;          // 'limpieza' | 'mantenimiento' | 'rutina'
  status: TaskStatus;      // 'pendiente' | 'completada'
  location: string;
  details?: string;
}
```

- Gestión de tareas diarias
- Marcar como completadas
- Notificación: `TASK_COMPLETED`

#### 2. Incidentes
```typescript
interface Incident {
  id: string;
  description: string;
  priority: IncidentPriority;  // 'Baja' | 'Media' | 'Alta'
  sector: string;
  image?: string;              // Base64
  status: IncidentStatus;       // 'abierta' | 'en_progreso' | 'resuelta'
  timestamp: string;
}
```

- Registrar incidentes con foto
- Prioridades: Baja, Media, Alta
- Estados: abierta, en progreso, resuelta
- Notificaciones: `NEW_INCIDENT`, `INCIDENT_RESOLVED`

#### 3. Instalaciones
```typescript
interface Installation {
  id: string;
  name: string;
  status: InstallationStatus;  // 'ok' | 'maintenance' | 'out_of_service'
  layout: InstallationLayout;  // Posición en grid
  details: {
    lastCleaned: string;
    nextTask?: string;
    incident?: string;
  };
}
```

- Mapa de instalaciones
- Estados: ok, maintenance, out_of_service
- Historial de limpieza

#### 4. Historial de Mantenimiento
```typescript
interface MaintenanceHistoryItem {
  id: string;
  date: string;          // DD/MM/YYYY
  task: string;
  responsible: string;
}
```

#### 5. Cambio de Turnos
```typescript
interface ShiftChangeRequest {
  id: string;
  requesterId: number;
  colleagueId: number;
  requesterTurno: string;  // fecha
  colleagueTurno: string; // fecha
  reason?: string;
  status: 'pending' | 'accepted' | 'rejected';
}
```

- Solicitar cambio de turno con otro auxiliar
- El colega recibe notificación
- Puede aceptar/rechazar
- Notificaciones: `SHIFT_CHANGE_REQUEST`, `SHIFT_CHANGE_ACCEPTED`, `SHIFT_CHANGE_REJECTED`

---

## Temas y Personalización

### Temas Disponibles
```typescript
type Theme = 'celestial' | 'oscuro' | 'ensoñacion' | 'moderno' | 'fantasma' | 'rebelde';
```

Cada tema define:
- Color de fondo (`bg`)
- Color primario (`primary`)
- Color de acento (`accent`)

### Estilos de Borde
```typescript
type BorderStyle = 'sencillo' | 'refinado' | 'gradiente' | 'neon' | 'acentuado' | 'doble';
```

### Estilos de Fuente
```typescript
type FontStyle = 'predeterminado' | 'clasico' | 'moderno' | 'elegante' | 'tecnico' | 'amigable';
```

### Aplicación de Temas
- Los temas se aplican mediante atributos `data-theme`, `data-border-style`, `data-font-style` en `<html>`
- CSS usa variables CSS (`--color-text-primary`, `--color-accent`, etc.)
- Se persisten en `localStorage` (si está implementado)

### Perfiles de Usuario
```typescript
interface UserProfileData {
  profilePicture?: string;        // Base64
  bannerImage?: string;           // Base64
  bio?: string;
  phone?: string;
  address?: string;
  emergencyContact?: string;
  personalLinks?: PersonalLink[];
  profileAccentColor?: string;
  studentRepPosition?: string;    // Para Centro de Estudiantes
  viewPermissions?: { ... };      // Control de visibilidad
  notificationSettings?: { ... }; // Configuración de notificaciones
  teacherSettings?: { ... };      // Configuración de profesores
  preceptorSettings?: { ... };    // Configuración de preceptores
}
```

---

## Flujos de Datos Principales

### 1. Flujo de Login
```
Usuario → AuthForm → handleLogin → setCurrentUser → App.tsx renderiza Dashboard según role
```

### 2. Flujo de Toma de Asistencia
```
Preceptor/Profesor selecciona materia/fecha
  → Se muestran estudiantes
  → Marca presente/ausente
  → addAttendanceRecord()
  → setAttendanceRecords()
  → Notificación a estudiantes
```

### 3. Flujo de Justificación
```
Estudiante ve falta
  → Solicita justificación (motivo + archivo)
  → requestJustification()
  → Estado → PENDING_JUSTIFICATION
  → Notificación a preceptor
  → Preceptor aprueba/rechaza
  → Estado → JUSTIFIED/ABSENT
  → Notificación a estudiante
```

### 4. Flujo de Publicación en Foro
```
Estudiante crea publicación
  → onAddForumThread()
  → Estado → PENDING
  → Notificación a preceptor (si está configurado)
  → Preceptor aprueba/rechaza
  → Estado → APPROVED/REJECTED
  → Notificación a estudiante
```

### 5. Flujo de Calificaciones
```
Profesor carga calificaciones
  → onUpdateGrades()
  → setGrades()
  → Notificación NEW_GRADE a estudiante
  → Estudiante ve promedios calculados
```

### 6. Flujo de Eventos
```
Centro de Estudiantes crea evento
  → setStudentRepEvents()
  → Estudiante se une
  → handleJoinEvent()
  → setEventParticipants()
  → Notificación NEW_EVENT_PARTICIPANT a Centro de Estudiantes
```

---

## Estructura de Datos

### Carreras y Materias

#### Carreras
```typescript
interface Career {
  id: string;                    // 'dev' | 'design'
  name: CareerName;
  years: number[];              // [1, 2, 3]
  theme: 'theme-dev' | 'theme-design';
}
```

Carreras disponibles:
- **dev**: Tecnicatura Superior en Desarrollo de Software
- **design**: Tecnicatura Superior en Diseño, Imagen y Sonido

#### Materias
- Definidas en `SUBJECTS` (constants.ts)
- Cada materia tiene: `id`, `name`, `careerId`, `year`
- IDs siguen patrón: `{career}-{year}-{abreviatura}`

### Horarios de Clase
```typescript
interface ClassSchedule {
  subjectId: string;
  dayOfWeek: number;            // 1=Lunes, 5=Viernes
  startTime: string;            // "HH:MM"
  endTime: string;              // "HH:MM"
  classroom: string;
}
```

### Eventos de Calendario
```typescript
interface CalendarEvent {
  id: string;
  date: string;                 // YYYY-MM-DD
  startTime?: string;           // "HH:MM"
  endTime?: string;             // "HH:MM"
  title: string;
  type: EventType;              // 'class' | 'exam' | 'assignment' | 'event' | 'custom'
  description?: string;
  subjectId?: string;
  isAllDay?: boolean;
}
```

### Notas Personales
```typescript
interface Note {
  id: string;
  title: string;
  content: string;
  color: string;
  isPinned: boolean;
  lastModified: string;
}
```

---

## Constantes Importantes

### Límites y Umbrales
- `ABSENCE_LIMIT = 8`: Límite de faltas sin justificar
- `MINIMUM_PRESENTISM = 70`: Presentismo mínimo requerido (%)
- `CLASS_COUNT_THRESHOLD_FOR_LIBRE = 10`: Clases mínimas para evaluar condición

### Códigos de Registro
- `PRECEPTOR_DEV_2024`: Para preceptores de carrera dev
- `PRECEPTOR_DESIGN_2024`: Para preceptores de carrera design
- `ADMIN_ACCESS_01`: Código de administrador

### Datos Iniciales
- `INITIAL_USERS`: Usuarios precargados (prototipos)
- `INITIAL_ATTENDANCE`: Registros de asistencia de ejemplo
- `INITIAL_GRADES`: Calificaciones de ejemplo
- `INITIAL_NOTIFICATIONS`: Notificaciones iniciales
- `INITIAL_FORUM_THREADS`: Hilos de foro iniciales
- `INITIAL_PLANIFICACIONES`: Planificaciones de ejemplo
- `INITIAL_MATERIAL_DIDACTICO`: Material didáctico de ejemplo

---

## Consideraciones de Implementación

### Estado en Memoria
- ⚠️ **Todas las operaciones se realizan en memoria**
- No hay persistencia entre sesiones
- Al recargar la página, se pierden cambios (excepto datos iniciales)

### IDs Generados
- Los IDs se generan con timestamp: `id: \`${prefix}-${Date.now()}\``
- Formatos comunes:
  - Asistencia: `att-{studentId}-{subjectId}-{date}`
  - Notificaciones: `notif-{userId}-{index}`
  - Hilos: `thread-{timestamp}`
  - Respuestas: `reply-{timestamp}`

### Manejo de Archivos
- Los archivos se convierten a base64 para almacenamiento
- Límite de tamaño: 5MB (validado en frontend)
- Tipos: PDF, imágenes, documentos

### Integración con IA
- Google Gemini API para generación de justificaciones
- Modelo: `gemini-2.5-flash`
- API Key: variable de entorno `GEMINI_API_KEY`

### Generación de PDFs
- Librería `jspdf` y `jspdf-autotable`
- Se usa para reportes de asistencia y otros documentos

---

## Extensibilidad

### Agregar Nuevo Rol
1. Agregar enum `Role` en `types.ts`
2. Agregar caso en `switch` de `App.tsx`
3. Crear componente `{Role}Dashboard.tsx`
4. Definir permisos y capacidades

### Agregar Nueva Funcionalidad
1. Definir tipos en `types.ts`
2. Agregar estado en `App.tsx`
3. Crear componente o vista
4. Integrar en dashboard correspondiente
5. Agregar notificaciones si aplica

### Migración a Backend
- Separar lógica de negocio en servicios
- Implementar API REST
- Reemplazar `useState` por llamadas a API
- Implementar autenticación JWT
- Persistencia en base de datos (MongoDB, PostgreSQL, etc.)

---

## Notas Finales

Esta documentación cubre toda la lógica y procesos del sistema de gestión académica. El sistema está diseñado como un prototipo funcional con todas las características principales implementadas, pero sin persistencia de datos ni backend.

Para producción, se recomienda:
- Implementar backend con API REST
- Base de datos para persistencia
- Autenticación segura (JWT, OAuth)
- Validación de datos en backend
- Logging y monitoreo
- Tests automatizados
- Documentación de API

---

**Última actualización**: Generado automáticamente basado en análisis del código
**Versión del sistema**: 0.0.0 (prototipo)

