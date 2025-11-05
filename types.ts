export enum Role {
  STUDENT = 'Alumno',
  PRECEPTOR = 'Preceptor',
  TEACHER = 'Profesor',
  STAFF = 'Auxiliar',
  STUDENT_REP = 'Centro de Estudiantes',
}

export enum CareerName {
  SOFTWARE = 'Tecnicatura Superior en Desarrollo de Software',
  DESIGN = 'Tecnicatura Superior en Diseño, Imagen y Sonido',
}

export enum AttendanceStatus {
  PRESENT = 'Presente',
  ABSENT = 'Ausente',
  JUSTIFIED = 'Justificado',
  PENDING_JUSTIFICATION = 'Pendiente',
}

export interface Career {
  id: string;
  name: CareerName;
  years: number[];
  theme: 'theme-dev' | 'theme-design';
}

export interface Subject {
  id: string;
  name: string;
  careerId: string;
  year: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  password; // In a real app, this would be a hash
  role: Role;
  careerId?: string;
  year?: number | number[];
  assignedSubjects?: string[]; // Array of subject IDs for teachers
}

export interface JustificationFile {
  name: string;
  type: string;
  content: string; // base64 encoded string
}

export interface AttendanceRecord {
  id: string;
  studentId: number;
  subjectId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  justificationReason?: string;
  justificationFile?: JustificationFile;
}

export type GradeType = 
  | 'Parcial 1' | 'Recuperatorio 1' | 'TP' 
  | 'Parcial 2' | 'Recuperatorio 2' 
  | 'Nota 1er Cuatrimestre' | 'Nota 2do Cuatrimestre' 
  | 'Examen Final';

export interface Grade {
  id: string;
  studentId: number;
  subjectId: string;
  type: GradeType;
  value: string; // Puede ser numérico "8" o conceptual "Aprobado"
  comments?: string;
}


export interface NewsItem {
  id: string;
  text: string;
  careerId?: string; // Optional: for career-specific news
  year?: number;     // Optional: for year-specific news
  subjectId?: string; // Optional: for subject-specific news
}

export interface PrivateMessage {
  id: string;
  senderId: number;
  receiverId: number;
  text: string;
  timestamp: string;
  read: boolean;
}

export enum NotificationType {
  ANNOUNCEMENT = 'Anuncio',
  ABSENCE = 'Falta',
  JUSTIFICATION_APPROVED = 'Justificación Aprobada',
  JUSTIFICATION_REJECTED = 'Justificación Rechazada',
  JUSTIFICATION_REQUEST = 'Solicitud de Justificación',
  FORUM_THREAD_APPROVED = 'Publicación Aprobada',
  FORUM_THREAD_REJECTED = 'Publicación Rechazada',
  FORUM_THREAD_NEEDS_REVISION = 'Revisión de Publicación Solicitada',
  ATTENDANCE_WARNING = 'Alerta de Asistencia',
  ATTENDANCE_STATUS_LIBRE = 'Condición: Libre',
  LOW_PERFORMANCE_WARNING = 'Alerta de Rendimiento',
  NEW_ASSIGNMENT = 'Nueva Tarea/Comunicado',
  PRECEPTOR_ATTENDANCE_TAKEN = 'Asistencia Tomada por Preceptor',
  TEACHER_ATTENDANCE_TAKEN = 'Asistencia Tomada por Profesor',
  NEW_GRADE = 'Nueva Calificación',
  SYNCED_ATTENDANCE_TAKEN = 'Asistencia Sincronizada',
  UPCOMING_EVENT = 'Evento Próximo',
  NEW_EVENT_PARTICIPANT = 'Nuevo Participante de Evento',
  
  // New ones for Staff
  TASK_COMPLETED = 'Tarea Completada',
  NEW_INCIDENT = 'Nueva Incidencia',
  INCIDENT_RESOLVED = 'Incidencia Resuelta',
  SHIFT_CHANGE_REQUEST = 'Solicitud de Cambio de Turno',
  SHIFT_CHANGE_ACCEPTED = 'Cambio de Turno Aceptado',
  SHIFT_CHANGE_REJECTED = 'Cambio de Turno Rechazado',
}

export interface Notification {
  id: string;
  userId: number; // The user who receives the notification
  type: NotificationType;
  text: string;
  details?: string; // Optional subtitle or details
  timestamp: string;
  read: boolean;
}

export interface PersonalLink {
  id: string;
  url: string;
  label: string;
}

export interface AvailabilitySlot {
  id: string;
  dayOfWeek: number; // 1 for Monday, 5 for Friday
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
}

export interface UserProfileData {
  profilePicture?: string; // base64
  bannerImage?: string; // base64
  bio?: string;
  phone?: string;
  address?: string;
  emergencyContact?: string;
  personalLinks?: PersonalLink[];
  profileAccentColor?: string;
  studentRepPosition?: string;
  viewPermissions?: {
    overview?: boolean;
    classmates?: boolean;
    absences?: boolean;
    history?: boolean;
    stats?: boolean;
    agenda?: boolean;
    notes?: boolean;
    forums?: boolean;
    qrAttendance?: boolean;
    calificaciones?: boolean;
    comunidad?: boolean;
  };
  notificationSettings?: {
    upcomingEvents?: boolean;
    communityPosts?: boolean;
  };
  teacherSettings?: {
    autoAttendance: boolean;
    autoAverage?: Record<string, boolean>; // Key is subjectId
    syncAttendance?: Record<string, boolean>; // Key is subjectId
    availabilitySlots?: AvailabilitySlot[];
  };
  preceptorSettings?: {
    syncAttendance?: Record<string, boolean>; // Key is subjectId
  };
}

export interface Note {
  id: string;
  title: string;
  content: string;
  color: string;
  isPinned: boolean;
  lastModified: string;
}

export enum ForumThreadStatus {
  PENDING = 'Pendiente',
  APPROVED = 'Aprobado',
  REJECTED = 'Rechazado',
  NEEDS_REVISION = 'Necesita Revisión',
}

export interface ForumThread {
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

export interface ForumReply {
    id: string;
    threadId: string;
    authorId: number;
    content: string;
    timestamp: string;
}

export interface Coordinates {
    latitude: number;
    longitude: number;
}

export interface QRAttendanceSession {
    id: string;
    subjectId: string;
    preceptorId: number;
    createdAt: string; // ISO string
    expiresAt: string; // ISO string
    location: Coordinates;
    radius: number; // in meters
}

export interface ClassSchedule {
    subjectId: string;
    dayOfWeek: number; // 1 for Monday, 5 for Friday
    startTime: string; // "HH:MM"
    endTime: string; // "HH:MM"
    classroom: string;
}

export type EventType = 'class' | 'exam' | 'assignment' | 'event' | 'custom';

export interface CalendarEvent {
  id: string;
  date: string; // YYYY-MM-DD
  startTime?: string; // "HH:MM"
  endTime?: string; // "HH:MM"
  title: string;
  type: EventType;
  description?: string;
  subjectId?: string;
  isAllDay?: boolean;
}

export enum PlanificacionStatus {
  PENDIENTE = 'Pendiente',
  EN_CURSO = 'En curso',
  COMPLETADO = 'Completado',
}

export interface PlanificacionResource {
  id: string;
  label: string;
  url: string;
}

export interface Planificacion {
  id: string;
  subjectId: string;
  title: string;
  status: PlanificacionStatus;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  objectives: string;
  content: string;
  activities: string;
  evaluations: string;
  resources: PlanificacionResource[];
}

export enum MaterialCategory {
  GUIAS = 'Guías de Estudio',
  PRACTICAS = 'Trabajos Prácticos',
  EVALUACIONES = 'Modelos de Evaluación',
  EXTRA = 'Material Extra',
}

export interface Material {
  id: string;
  subjectId: string;
  title: string;
  category: MaterialCategory;
  type: 'link' | 'pdf' | 'image' | 'presentation';
  url?: string; // for links
  fileName?: string; // for files
  fileType?: string; // for mime type
  content?: string; // for base64 content
  viewCount: number;
  downloadCount: number;
  createdAt: string;
}

export type TaskType = 'limpieza' | 'mantenimiento' | 'rutina';
export type TaskStatus = 'pendiente' | 'completada';

export interface DailyTask {
  id: string;
  title: string;
  startTime: string;
  type: TaskType;
  status: TaskStatus;
  location: string;
  details?: string;
}

export type ShiftType = 'Normal' | 'Cambio' | 'Libre' | 'Feriado';

export interface StaffSchedule {
  id: string;
  day: string;
  date: string;
  time: string;
  type: ShiftType;
}

export type InstallationStatus = 'ok' | 'maintenance' | 'out_of_service';
export interface InstallationLayout {
  col: number; row: number;
  colSpan: number; rowSpan: number;
}
export interface Installation {
  id: string;
  name: string;
  status: InstallationStatus;
  layout: InstallationLayout;
  details: { lastCleaned: string; nextTask?: string; incident?: string; };
}

export type IncidentStatus = 'abierta' | 'en_progreso' | 'resuelta';
export type IncidentPriority = 'Baja' | 'Media' | 'Alta';

export interface Incident {
  id: string;
  description: string;
  priority: IncidentPriority;
  sector: string;
  image?: string; // base64
  status: IncidentStatus;
  timestamp: string; // ISO string
}

export interface MaintenanceHistoryItem {
    id: string;
    date: string; // "DD/MM/YYYY" format
    task: string;
    responsible: string;
}

export interface ShiftChangeRequest {
    id: string;
    requesterId: number;
    colleagueId: number;
    requesterTurno: string; // date
    colleagueTurno: string; // date
    reason?: string;
    status: 'pending' | 'accepted' | 'rejected';
}

export type StudentRepEventType = 'académico' | 'cultural' | 'deportivo' | 'reunión';

export interface StudentRepEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM
  location?: string;
  description: string;
  type: StudentRepEventType;
  organizer: string;
}

export type StudentRepForumCategory = 'general' | 'propuestas' | 'eventos';

export interface StudentRepForumThread {
  id: string;
  authorId: number;
  title: string;
  content: string;
  category: StudentRepForumCategory;
  timestamp: string;
  isPinned?: boolean;
}

export interface StudentRepForumReply {
  id: string;
  threadId: string;
  authorId: number;
  content: string;
  timestamp: string;
}

export interface StudentRepAnnouncement {
  id: string;
  title: string;
  content: string;
  authorId: number;
  timestamp: string;
  isPinned?: boolean;
  files?: JustificationFile[];
  publishDate?: string;
}

export type StudentRepClaimCategory = 'académico' | 'infraestructura' | 'administrativo' | 'sugerencia';
export type StudentRepClaimStatus = 'pendiente' | 'en revisión' | 'resuelto' | 'archivado';

export interface StudentRepClaim {
  id: string;
  authorId: number;
  category: StudentRepClaimCategory;
  description: string;
  file?: JustificationFile;
  timestamp: string;
  status: StudentRepClaimStatus;
  response?: string;
  responderId?: number;
}