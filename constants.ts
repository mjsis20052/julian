import { Career, User, Role, CareerName, AttendanceRecord, AttendanceStatus, Subject, NewsItem, PrivateMessage, ForumThread, ForumThreadStatus, ForumReply, ClassSchedule, Notification, NotificationType, Grade, GradeType, Planificacion, PlanificacionStatus, Material, MaterialCategory, DailyTask, MaintenanceHistoryItem, Installation, Incident, StudentRepEvent, StudentRepForumThread, StudentRepForumReply, StudentRepAnnouncement, StudentRepClaim } from './types';

// The MONGODB_URI should be set as an environment variable in your deployment environment (e.g., Vercel).
// It should not be hardcoded in the frontend.

export const ABSENCE_LIMIT = 8;
export const MINIMUM_PRESENTISM = 70;
export const CLASS_COUNT_THRESHOLD_FOR_LIBRE = 10;

export const PRECEPTOR_REGISTRATION_CODES = ['PRECEPTOR_DEV_2024', 'PRECEPTOR_DESIGN_2024', 'ADMIN_ACCESS_01'];


export const CAREERS: Career[] = [
  {
    id: 'dev',
    name: CareerName.SOFTWARE,
    years: [1, 2, 3],
    theme: 'theme-dev',
  },
  {
    id: 'design',
    name: CareerName.DESIGN,
    years: [1, 2, 3],
    theme: 'theme-design',
  },
];

export const SUBJECTS: Subject[] = [
  // Dev
  { id: 'dev-1-algo', name: 'Algoritmos y Estructuras de Datos', careerId: 'dev', year: 1 },
  { id: 'dev-1-prog1', name: 'Programación I', careerId: 'dev', year: 1 },
  { id: 'dev-1-arq', name: 'Arquitectura de Computadoras', careerId: 'dev', year: 1 },
  { id: 'dev-2-prog2', name: 'Programación II', careerId: 'dev', year: 2 },
  { id: 'dev-2-db', name: 'Bases de Datos', careerId: 'dev', year: 2 },
  { id: 'dev-2-so', name: 'Sistemas Operativos', careerId: 'dev', year: 2 },
  { id: 'dev-3-net', name: 'Redes y Comunicación', careerId: 'dev', year: 3 },
  { id: 'dev-3-sec', name: 'Seguridad Informática', careerId: 'dev', year: 3 },
  { id: 'dev-3-final', name: 'Proyecto Final (Dev)', careerId: 'dev', year: 3 },

  // Design
  { id: 'des-1-dg1', name: 'Diseño Gráfico I', careerId: 'design', year: 1 },
  { id: 'des-1-img', name: 'Teoría de la Imagen', careerId: 'design', year: 1 },
  { id: 'des-1-photo', name: 'Fotografía', careerId: 'design', year: 1 },
  { id: 'des-2-av', name: 'Diseño Audiovisual', careerId: 'design', year: 2 },
  { id: 'des-2-video', name: 'Edición de Video', careerId: 'design', year: 2 },
  { id: 'des-2-sound', name: 'Diseño de Sonido', careerId: 'design', year: 2 },
  { id: 'des-3-3d', name: 'Animación 3D', careerId: 'design', year: 3 },
  { id: 'des-3-post', name: 'Postproducción Digital', careerId: 'design', year: 3 },
  { id: 'des-3-final', name: 'Proyecto Final (Design)', careerId: 'design', year: 3 },
];

export const CLASS_SCHEDULE: ClassSchedule[] = [
    // Dev 1
    { subjectId: 'dev-1-prog1', dayOfWeek: 1, startTime: '18:20', endTime: '20:20', classroom: 'Aula 12' },
    { subjectId: 'dev-1-prog1', dayOfWeek: 3, startTime: '20:30', endTime: '22:20', classroom: 'Lab 3' },
    { subjectId: 'dev-1-algo', dayOfWeek: 2, startTime: '18:20', endTime: '22:20', classroom: 'Aula 10' },
    { subjectId: 'dev-1-arq', dayOfWeek: 4, startTime: '18:20', endTime: '20:20', classroom: 'Taller A' },

    // Dev 2
    { subjectId: 'dev-2-prog2', dayOfWeek: 2, startTime: '18:20', endTime: '20:20', classroom: 'Lab 1' },
    { subjectId: 'dev-2-db', dayOfWeek: 3, startTime: '18:20', endTime: '22:20', classroom: 'Lab 2' },
    { subjectId: 'dev-2-so', dayOfWeek: 5, startTime: '18:20', endTime: '20:20', classroom: 'Aula 14' },

    // Dev 3
    { subjectId: 'dev-3-net', dayOfWeek: 1, startTime: '20:30', endTime: '22:20', classroom: 'Lab 4' },
    { subjectId: 'dev-3-sec', dayOfWeek: 4, startTime: '20:30', endTime: '22:20', classroom: 'Aula 15' },
    { subjectId: 'dev-3-final', dayOfWeek: 5, startTime: '20:30', endTime: '22:20', classroom: 'SUM' },

    // Design 1
    { subjectId: 'des-1-dg1', dayOfWeek: 1, startTime: '18:20', endTime: '22:20', classroom: 'Taller B' },
    { subjectId: 'des-1-img', dayOfWeek: 3, startTime: '18:20', endTime: '20:20', classroom: 'Microcine' },
    { subjectId: 'des-1-photo', dayOfWeek: 5, startTime: '18:20', endTime: '22:20', classroom: 'Estudio Foto' },

    // Design 2
    { subjectId: 'des-2-av', dayOfWeek: 2, startTime: '18:20', endTime: '22:20', classroom: 'Isla Edición 1' },
    { subjectId: 'des-2-video', dayOfWeek: 4, startTime: '18:20', endTime: '20:20', classroom: 'Isla Edición 2' },
    { subjectId: 'des-2-sound', dayOfWeek: 4, startTime: '20:30', endTime: '22:20', classroom: 'Estudio Sonido' },
    
    // Design 3
    { subjectId: 'des-3-3d', dayOfWeek: 1, startTime: '18:20', endTime: '20:20', classroom: 'Lab 3D' },
    { subjectId: 'des-3-post', dayOfWeek: 3, startTime: '20:30', endTime: '22:20', classroom: 'Isla Edición 3' },
    { subjectId: 'des-3-final', dayOfWeek: 5, startTime: '18:20', endTime: '20:20', classroom: 'SUM' },
];


export const INITIAL_USERS: User[] = [
  // Preceptors
  { id: 1, name: 'Carlos Gomez', email: 'carlos@preceptor.com', password: '123', role: Role.PRECEPTOR, careerId: 'dev', year: [1, 2, 3] },
  { id: 2, name: 'Ana Rodriguez', email: 'ana@preceptor.com', password: '123', role: Role.PRECEPTOR, careerId: 'design', year: 1 },
  { id: 3, name: 'Mariana Juarez', email: 'mariana@preceptor.com', password: '123', role: Role.PRECEPTOR, careerId: 'dev', year: 1 },
  { id: 4, name: 'Esteban Quito', email: 'esteban@preceptor.com', password: '123', role: Role.PRECEPTOR, careerId: 'design', year: [2, 3] },
  { id: 5, name: 'Susana Gimenez', email: 'susana@preceptor.com', password: '123', role: Role.PRECEPTOR, careerId: 'dev', year: [2, 3] },

  // New Roles for Prototypes
  { id: 601, name: 'Silvia Kent', email: 'silvia@teacher.com', password: '123', role: Role.TEACHER, careerId: 'dev', year: 2, assignedSubjects: ['dev-2-prog2', 'dev-2-db'] },
  { id: 602, name: 'Laura Pausini', email: 'laura@teacher.com', password: '123', role: Role.TEACHER, careerId: 'design', year: 1, assignedSubjects: ['des-1-dg1', 'des-1-img'] },
  { id: 603, name: 'Miguel Bose', email: 'miguel@teacher.com', password: '123', role: Role.TEACHER, careerId: 'design', year: [2, 3], assignedSubjects: ['des-2-av', 'des-3-3d'] },
  { id: 604, name: 'Ricardo Arjona', email: 'ricardoa@teacher.com', password: '123', role: Role.TEACHER, careerId: 'dev', year: 1, assignedSubjects: ['dev-1-algo', 'dev-1-prog1'] },
  { id: 605, name: 'Charly Garcia', email: 'charly@teacher.com', password: '123', role: Role.TEACHER, careerId: 'dev', year: 3, assignedSubjects: ['dev-3-net', 'dev-3-sec'] },
  
  { id: 701, name: 'Roberto Carlos', email: 'roberto@staff.com', password: '123', role: Role.STAFF },
  { id: 702, name: 'Ana Maria', email: 'anamaria@staff.com', password: '123', role: Role.STAFF },
  { id: 703, name: 'Jorge Luis', email: 'jorge@staff.com', password: '123', role: Role.STAFF },
  { id: 704, name: 'Marta Sanchez', email: 'marta@staff.com', password: '123', role: Role.STAFF },
  { id: 705, name: 'Luis Alberto', email: 'luis@staff.com', password: '123', role: Role.STAFF },
  { id: 706, name: 'Claudia Fernandez', email: 'claudia@staff.com', password: '123', role: Role.STAFF },
  { id: 707, name: 'Fernando Torres', email: 'fernando@staff.com', password: '123', role: Role.STAFF },

  { id: 801, name: 'Felipe Melo', email: 'felipe@studentrep.com', password: '123', role: Role.STUDENT_REP, careerId: 'design', year: 2 },
  { id: 802, name: 'Carolina Peleritti', email: 'carolina@studentrep.com', password: '123', role: Role.STUDENT_REP, careerId: 'dev', year: 3 },
  { id: 803, name: 'Juan Cruz Toledo', email: 'juancruz@studentrep.com', password: '123', role: Role.STUDENT_REP, careerId: 'dev', year: 2 },
  { id: 804, name: 'Sofia Beltran', email: 'sofiab@studentrep.com', password: '123', role: Role.STUDENT_REP, careerId: 'design', year: 3 },
  { id: 805, name: 'Mateo Rojas', email: 'mateor@studentrep.com', password: '123', role: Role.STUDENT_REP, careerId: 'dev', year: 1 },
  { id: 806, name: 'Valentina Costa', email: 'valentinac@studentrep.com', password: '123', role: Role.STUDENT_REP, careerId: 'design', year: 1 },
  { id: 807, name: 'Lucas Gimenez', email: 'lucasg@studentrep.com', password: '123', role: Role.STUDENT_REP, careerId: 'dev', year: 2 },
  { id: 808, name: 'Julieta Navarro', email: 'julietan@studentrep.com', password: '123', role: Role.STUDENT_REP, careerId: 'design', year: 2 },
  { id: 809, name: 'Martina Heredia', email: 'martinah@studentrep.com', password: '123', role: Role.STUDENT_REP, careerId: 'dev', year: 3 },
  { id: 810, name: 'Bautista Ponce', email: 'bautistap@studentrep.com', password: '123', role: Role.STUDENT_REP, careerId: 'design', year: 1 },

  // Software Students - Year 1
  { id: 101, name: 'Juan Perez', email: 'juan@dev.com', password: '123', role: Role.STUDENT, careerId: 'dev', year: 1 },
  { id: 102, name: 'Maria Lopez', email: 'maria@dev.com', password: '123', role: Role.STUDENT, careerId: 'dev', year: 1 },
  { id: 104, name: 'Laura Vargas', email: 'laura@dev.com', password: '123', role: Role.STUDENT, careerId: 'dev', year: 1 },
  { id: 105, name: 'David Gimenez', email: 'david@dev.com', password: '123', role: Role.STUDENT, careerId: 'dev', year: 1 },
  { id: 106, name: 'Sofia Romano', email: 'sofiar@dev.com', password: '123', role: Role.STUDENT, careerId: 'dev', year: 1 },
  { id: 107, name: 'Martin Castro', email: 'martin@dev.com', password: '123', role: Role.STUDENT, careerId: 'dev', year: 1 },
  { id: 108, name: 'Valentina Medina', email: 'valentina@dev.com', password: '123', role: Role.STUDENT, careerId: 'dev', year: 1 },
  { id: 109, name: 'Agustin Sosa', email: 'agustin@dev.com', password: '123', role: Role.STUDENT, careerId: 'dev', year: 1 },
  { id: 110, name: 'Camila Diaz', email: 'camila@dev.com', password: '123', role: Role.STUDENT, careerId: 'dev', year: 1 },
  { id: 111, name: 'Mateo Acosta', email: 'mateo@dev.com', password: '123', role: Role.STUDENT, careerId: 'dev', year: 1 },
  
  // Software Students - Year 2
  { id: 103, name: 'Pedro Martinez', email: 'pedro@dev.com', password: '123', role: Role.STUDENT, careerId: 'dev', year: 2 },
  { id: 112, name: 'Javier Rios', email: 'javier@dev.com', password: '123', role: Role.STUDENT, careerId: 'dev', year: 2 },
  { id: 113, name: 'Florencia Juarez', email: 'florencia@dev.com', password: '123', role: Role.STUDENT, careerId: 'dev', year: 2 },
  { id: 114, name: 'Nicolas Vega', email: 'nicolas@dev.com', password: '123', role: Role.STUDENT, careerId: 'dev', year: 2 },
  { id: 115, name: 'Catalina Moreno', email: 'catalina@dev.com', password: '123', role: Role.STUDENT, careerId: 'dev', year: 2 },
  { id: 116, name: 'Bautista Rojas', email: 'bautista@dev.com', password: '123', role: Role.STUDENT, careerId: 'dev', year: 2 },
  { id: 117, name: 'Martina Benitez', email: 'martina@dev.com', password: '123', role: Role.STUDENT, careerId: 'dev', year: 2 },
  { id: 118, name: 'Santiago Molina', email: 'santiago@dev.com', password: '123', role: Role.STUDENT, careerId: 'dev', year: 2 },
  { id: 119, name: 'Victoria Ortiz', email: 'victoria@dev.com', password: '123', role: Role.STUDENT, careerId: 'dev', year: 2 },
  { id: 120, name: 'Lucas Silva', email: 'lucas@dev.com', password: '123', role: Role.STUDENT, careerId: 'dev', year: 2 },

  // Software Students - Year 3
  { id: 121, name: 'Elena Herrera', email: 'elena@dev.com', password: '123', role: Role.STUDENT, careerId: 'dev', year: 3 },
  { id: 122, name: 'Facundo Romero', email: 'facundo@dev.com', password: '123', role: Role.STUDENT, careerId: 'dev', year: 3 },
  { id: 123, name: 'Isabella Quiroga', email: 'isabella@dev.com', password: '123', role: Role.STUDENT, careerId: 'dev', year: 3 },
  { id: 124, name: 'Felipe Castillo', email: 'felipe@dev.com', password: '123', role: Role.STUDENT, careerId: 'dev', year: 3 },
  { id: 125, name: 'Renata Ledesma', email: 'renata@dev.com', password: '123', role: Role.STUDENT, careerId: 'dev', year: 3 },
  { id: 126, name: 'Joaquin Ponce', email: 'joaquin@dev.com', password: '123', role: Role.STUDENT, careerId: 'dev', year: 3 },
  { id: 127, name: 'Abril Coronel', email: 'abril@dev.com', password: '123', role: Role.STUDENT, careerId: 'dev', year: 3 },
  { id: 128, name: 'Benjamin Vazquez', email: 'benjamin@dev.com', password: '123', role: Role.STUDENT, careerId: 'dev', year: 3 },
  { id: 129, name: 'Jazmin Ferreyra', email: 'jazmin@dev.com', password: '123', role: Role.STUDENT, careerId: 'dev', year: 3 },
  { id: 130, name: 'Thiago Ibarra', email: 'thiago@dev.com', password: '123', role: Role.STUDENT, careerId: 'dev', year: 3 },

  // Design Students - Year 1
  { id: 201, name: 'Lucia Fernandez', email: 'lucia@design.com', password: '123', role: Role.STUDENT, careerId: 'design', year: 1 },
  { id: 202, name: 'Diego Sanchez', email: 'diego@design.com', password: '123', role: Role.STUDENT, careerId: 'design', year: 1 },
  { id: 204, name: 'Clara Navarro', email: 'clara@design.com', password: '123', role: Role.STUDENT, careerId: 'design', year: 1 },
  { id: 205, name: 'Ignacio Roldan', email: 'ignacio@design.com', password: '123', role: Role.STUDENT, careerId: 'design', year: 1 },
  { id: 206, name: 'Guadalupe Rios', email: 'guadalupe@design.com', password: '123', role: Role.STUDENT, careerId: 'design', year: 1 },
  { id: 207, name: 'Manuel Pereyra', email: 'manuel@design.com', password: '123', role: Role.STUDENT, careerId: 'design', year: 1 },
  { id: 208, name: 'Olivia Mendez', email: 'olivia@design.com', password: '123', role: Role.STUDENT, careerId: 'design', year: 1 },
  { id: 209, name: 'Francisco Morales', email: 'francisco@design.com', password: '123', role: Role.STUDENT, careerId: 'design', year: 1 },
  { id: 210, name: 'Emilia Paez', email: 'emilia@design.com', password: '123', role: Role.STUDENT, careerId: 'design', year: 1 },
  { id: 211, name: 'Andres Miranda', email: 'andres@design.com', password: '123', role: Role.STUDENT, careerId: 'design', year: 1 },

  // Design Students - Year 2
  { id: 203, name: 'Sofia Torres', email: 'sofia@design.com', password: '123', role: Role.STUDENT, careerId: 'design', year: 2 },
  { id: 212, name: 'Ambar Carrizo', email: 'ambar@design.com', password: '123', role: Role.STUDENT, careerId: 'design', year: 2 },
  { id: 213, name: 'Lautaro Godoy', email: 'lautaro@design.com', password: '123', role: Role.STUDENT, careerId: 'design', year: 2 },
  { id: 214, name: 'Pilar Cabrera', email: 'pilar@design.com', password: '123', role: Role.STUDENT, careerId: 'design', year: 2 },
  { id: 215, name: 'Daniel Sosa', email: 'daniel@design.com', password: '123', role: Role.STUDENT, careerId: 'design', year: 2 },
  { id: 216, name: 'Micaela Nuñez', email: 'micaela@design.com', password: '123', role: Role.STUDENT, careerId: 'design', year: 2 },
  { id: 217, name: 'Federico Aguilera', email: 'federico@design.com', password: '123', role: Role.STUDENT, careerId: 'design', year: 2 },
  { id: 218, name: 'Julieta Guzman', email: 'julieta@design.com', password: '123', role: Role.STUDENT, careerId: 'design', year: 2 },
  { id: 219, name: 'Ramiro Pacheco', email: 'ramiro@design.com', password: '123', role: Role.STUDENT, careerId: 'design', year: 2 },
  { id: 220, name: 'Paula Dominguez', email: 'paula@design.com', password: '123', role: Role.STUDENT, careerId: 'design', year: 2 },
  
  // Design Students - Year 3
  { id: 221, name: 'Bruno Vega', email: 'bruno@design.com', password: '123', role: Role.STUDENT, careerId: 'design', year: 3 },
  { id: 222, name: 'Zoe Flores', email: 'zoe@design.com', password: '123', role: Role.STUDENT, careerId: 'design', year: 3 },
  { id: 223, name: 'Alejo Bravo', email: 'alejo@design.com', password: '123', role: Role.STUDENT, careerId: 'design', year: 3 },
  { id: 224, name: 'Delfina Peralta', email: 'delfina@design.com', password: '123', role: Role.STUDENT, careerId: 'design', year: 3 },
  { id: 225, name: 'Leo Montes', email: 'leo@design.com', password: '123', role: Role.STUDENT, careerId: 'design', year: 3 },
  { id: 226, name: 'Candelaria Luna', email: 'candelaria@design.com', password: '123', role: Role.STUDENT, careerId: 'design', year: 3 },
  { id: 227, name: 'Lisandro Nieva', email: 'lisandro@design.com', password: '123', role: Role.STUDENT, careerId: 'design', year: 3 },
  { id: 228, name: 'Regina Campos', email: 'regina@design.com', password: '123', role: Role.STUDENT, careerId: 'design', year: 3 },
  { id: 229, name: 'Santino Mercado', email: 'santino@design.com', password: '123', role: Role.STUDENT, careerId: 'design', year: 3 },
  { id: 230, name: 'Amanda Nieves', email: 'amanda@design.com', password: '123', role: Role.STUDENT, careerId: 'design', year: 3 },
];

const createDate = (month: number, day: number) => {
  const d = new Date(2024, month - 1, day);
  return d.toISOString().split('T')[0];
};

// Function to generate more realistic attendance data
const generateStudentAttendance = (studentId: number, subjectId: string, totalClasses: number, absenceRate: number, justifiedRate: number): AttendanceRecord[] => {
    const records: AttendanceRecord[] = [];
    let absences = 0;
    for (let i = 0; i < totalClasses; i++) {
        const day = i + 1;
        const month = 6; // June / July
        const date = createDate(month + Math.floor(i/30), day % 30 + 1);
        let status: AttendanceStatus;
        const random = Math.random();
        
        if (random < absenceRate && absences < 8) {
             status = AttendanceStatus.ABSENT;
             absences++;
        } else if (random < absenceRate + justifiedRate) {
            status = AttendanceStatus.JUSTIFIED;
        } else {
            status = AttendanceStatus.PRESENT;
        }

        records.push({
            id: `att-${studentId}-${subjectId.split('-').pop()}-${i}`,
            studentId,
            subjectId,
            date,
            status,
        });
    }
    return records;
}

const manualRecordsForJuanPerezAlgo = (): AttendanceRecord[] => {
    const records: AttendanceRecord[] = [];
    const studentId = 101;
    const subjectId = 'dev-1-algo';
    // 9 absences to make him "libre"
    for (let i = 1; i <= 9; i++) {
        records.push({ id: `att-${studentId}-${subjectId}-absent${i}`, studentId, subjectId, date: createDate(6, i*2), status: AttendanceStatus.ABSENT });
    }
    // 6 presents
    for (let i = 1; i <= 6; i++) {
        records.push({ id: `att-${studentId}-${subjectId}-present${i}`, studentId, subjectId, date: createDate(7, i*2), status: AttendanceStatus.PRESENT });
    }
    return records;
};

const recordsForMariaLopezProg1 = (): AttendanceRecord[] => {
    const studentId = 102;
    const subjectId = 'dev-1-prog1';
    const records = generateStudentAttendance(studentId, subjectId, 25, 0.20, 0.08); // ~5 absences, 2 justified

    // Find first absence and make it pending justification for demo
    const firstAbsenceIndex = records.findIndex(r => r.status === AttendanceStatus.ABSENT);
    if (firstAbsenceIndex !== -1) {
        records[firstAbsenceIndex].status = AttendanceStatus.PENDING_JUSTIFICATION;
        records[firstAbsenceIndex].justificationReason = 'Turno con el dentista, adjunto comprobante de asistencia a la consulta.';
        records[firstAbsenceIndex].justificationFile = { name: 'comprobante_dentista.pdf', type: 'application/pdf', content: '' };
    }
    return records;
};

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
    // Dev 1 - Juan Perez (101) - In risk in Prog1, Libre in Algo
    ...generateStudentAttendance(101, 'dev-1-prog1', 25, 0.20, 0.04), // ~5 absences, 1 justified -> 3 remaining
    ...manualRecordsForJuanPerezAlgo(), // 9 absences -> Libre
    ...generateStudentAttendance(101, 'dev-1-arq', 22, 0.0, 0.04),   // 0 absences, 1 justified

    // Dev 1 - Maria Lopez (102) - Has a pending justification
    ...recordsForMariaLopezProg1(),
    ...generateStudentAttendance(102, 'dev-1-algo', 20, 0.30, 0.05), // ~6 absences, 1 justified
    ...generateStudentAttendance(102, 'dev-1-arq', 22, 0.15, 0.1), // ~3 absences, 2 justified

    // Dev 2 - Pedro Martinez (103)
    ...generateStudentAttendance(103, 'dev-2-prog2', 30, 0.1, 0.05),
    ...generateStudentAttendance(103, 'dev-2-db', 28, 0.05, 0.05),
    ...generateStudentAttendance(103, 'dev-2-so', 25, 0.15, 0.0),
    
    // Design 1 - Lucia Fernandez (201)
    ...generateStudentAttendance(201, 'des-1-dg1', 28, 0.07, 0.1),
    ...generateStudentAttendance(201, 'des-1-img', 20, 0.0, 0.05),
    ...generateStudentAttendance(201, 'des-1-photo', 24, 0.12, 0.08),

    // Design 2 - Sofia Torres (203) - will be "libre" in AV
    ...generateStudentAttendance(203, 'des-2-av', 26, 0.40, 0.0), // high absence rate to fail
    ...generateStudentAttendance(203, 'des-2-video', 22, 0.1, 0.1),
    ...generateStudentAttendance(203, 'des-2-sound', 20, 0.05, 0.0),

    // Add some data for more students to make history view more populated
    // Dev 1 - Laura Vargas (104)
    ...generateStudentAttendance(104, 'dev-1-prog1', 25, 0.1, 0.1),
    ...generateStudentAttendance(104, 'dev-1-algo', 20, 0.15, 0.0),
    ...generateStudentAttendance(104, 'dev-1-arq', 22, 0.05, 0.05),

    // Design 1 - Diego Sanchez (202)
    ...generateStudentAttendance(202, 'des-1-dg1', 28, 0.05, 0.05),
    ...generateStudentAttendance(202, 'des-1-img', 20, 0.1, 0.0),
    ...generateStudentAttendance(202, 'des-1-photo', 24, 0.15, 0.1),
];

export const INITIAL_GRADES: Grade[] = [
  // Grades for Juan Perez (101) - Algoritmos (dev-1-algo) - Rinde Final
  { id: 'g-101-p1-algo', studentId: 101, subjectId: 'dev-1-algo', type: 'Parcial 1', value: '2' },
  { id: 'g-101-r1-algo', studentId: 101, subjectId: 'dev-1-algo', type: 'Recuperatorio 1', value: '6' },
  { id: 'g-101-tp-algo', studentId: 101, subjectId: 'dev-1-algo', type: 'TP', value: '7' },
  { id: 'g-101-n1c-algo', studentId: 101, subjectId: 'dev-1-algo', type: 'Nota 1er Cuatrimestre', value: '6' },
  // 2nd term
  { id: 'g-101-p2-algo', studentId: 101, subjectId: 'dev-1-algo', type: 'Parcial 2', value: '5' },
  { id: 'g-101-n2c-algo', studentId: 101, subjectId: 'dev-1-algo', type: 'Nota 2do Cuatrimestre', value: '5' },
  // Final
  { id: 'g-101-final-algo', studentId: 101, subjectId: 'dev-1-algo', type: 'Examen Final', value: '3' },
    
  // Grades for Programación II (dev-2-prog2) - Teacher: Silvia Kent (ID 601)
  // Javier Rios (112) - Promociona
  { id: 'g-112-p1', studentId: 112, subjectId: 'dev-2-prog2', type: 'Parcial 1', value: '8' },
  { id: 'g-112-tp11', studentId: 112, subjectId: 'dev-2-prog2', type: 'TP', value: '9' },
  { id: 'g-112-n1c', studentId: 112, subjectId: 'dev-2-prog2', type: 'Nota 1er Cuatrimestre', value: '8' },
  { id: 'g-112-p2', studentId: 112, subjectId: 'dev-2-prog2', type: 'Parcial 2', value: '7' },
  { id: 'g-112-n2c', studentId: 112, subjectId: 'dev-2-prog2', type: 'Nota 2do Cuatrimestre', value: '7' },

  // Florencia Juarez (113) - Rinde Final
  { id: 'g-113-p1', studentId: 113, subjectId: 'dev-2-prog2', type: 'Parcial 1', value: '3' },
  { id: 'g-113-r1', studentId: 113, subjectId: 'dev-2-prog2', type: 'Recuperatorio 1', value: '6' },
  { id: 'g-113-tp11', studentId: 113, subjectId: 'dev-2-prog2', type: 'TP', value: '5' },
  { id: 'g-113-n1c', studentId: 113, subjectId: 'dev-2-prog2', type: 'Nota 1er Cuatrimestre', value: '5' },
  { id: 'g-113-p2', studentId: 113, subjectId: 'dev-2-prog2', type: 'Parcial 2', value: '5' },
  { id: 'g-113-n2c', studentId: 113, subjectId: 'dev-2-prog2', type: 'Nota 2do Cuatrimestre', value: '5' },
  { id: 'g-113-final', studentId: 113, subjectId: 'dev-2-prog2', type: 'Examen Final', value: '6' },
  
  // Nicolas Vega (114) - In progress
  { id: 'g-114-p1', studentId: 114, subjectId: 'dev-2-prog2', type: 'Parcial 1', value: '9' },
  { id: 'g-114-tp11', studentId: 114, subjectId: 'dev-2-prog2', type: 'TP', value: '10' },
  { id: 'g-114-n1c', studentId: 114, subjectId: 'dev-2-prog2', type: 'Nota 1er Cuatrimestre', value: '9' },

  // Bautista Rojas (116) - Empty for teacher panel demo
  { id: 'g-116-p1-db', studentId: 116, subjectId: 'dev-2-db', type: 'Parcial 1', value: '' },

  // Grades for Bases de Datos (dev-2-db) - Teacher: Silvia Kent (ID 601)
  { id: 'g-115-p1', studentId: 115, subjectId: 'dev-2-db', type: 'Parcial 1', value: '6' },
  { id: 'g-115-n1c', studentId: 115, subjectId: 'dev-2-db', type: 'Nota 1er Cuatrimestre', value: '6' },
  { id: 'g-115-p2', studentId: 115, subjectId: 'dev-2-db', type: 'Parcial 2', value: '7' },
  { id: 'g-115-n2c', studentId: 115, subjectId: 'dev-2-db', type: 'Nota 2do Cuatrimestre', value: '7' },
];


export const NEWS_ITEMS: NewsItem[] = [
  // General News
  { id: 'n1', text: 'Semana de finales: ¡Mucha suerte a todos los estudiantes!', careerId: undefined, year: undefined },
  { id: 'n4', text: 'Inscripciones a materias del próximo cuatrimestre abiertas del 1 al 5 de Agosto.', careerId: undefined, year: undefined },
  
  // Subject-specific News
  { id: 'n2', text: 'Examen de Programación II: Miércoles 24 de Julio.', careerId: 'dev', year: 2, subjectId: 'dev-2-prog2' },
  { id: 'n3', text: 'Entrega final del proyecto de Animación 3D: Viernes 26 de Julio.', careerId: 'design', year: 3, subjectId: 'des-3-3d' },
  { id: 'n5', text: 'Taller de Fotografía: Sábado 27 de Julio en el aula magna.', careerId: 'design', year: 1, subjectId: 'des-1-photo' },
  { id: 'n6', text: 'Recordatorio: TP N°3 de Algoritmos debe entregarse el Lunes.', careerId: 'dev', year: 1, subjectId: 'dev-1-algo'},
  { id: 'n7', text: 'Consulta para el parcial de Bases de Datos: Jueves a las 18hs.', careerId: 'dev', year: 2, subjectId: 'dev-2-db'},
];


export const INITIAL_PRIVATE_MESSAGES: PrivateMessage[] = [];

export const INITIAL_FORUM_THREADS: ForumThread[] = [
  {
    id: 'thread-1',
    authorId: 101, // Juan Perez
    title: '¿Alguien tiene apuntes de la clase de Algoritmos del lunes?',
    content: 'Me perdí la última clase de Algoritmos y Estructuras de Datos y estoy un poco perdido con el tema de árboles binarios. ¿Alguien podría compartir sus apuntes o un resumen? ¡Gracias!',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: ForumThreadStatus.APPROVED,
    careerId: 'dev',
    year: 1,
  },
  {
    id: 'thread-2',
    authorId: 201, // Lucia Fernandez
    title: 'Recomendaciones de cámaras para la materia de Fotografía',
    content: 'Hola a todos, estoy buscando comprar una cámara para la materia de Fotografía pero no sé por dónde empezar. ¿Tienen alguna recomendación que no sea súper cara? ¿Qué es más importante, el lente o el cuerpo de la cámara para empezar?',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    status: ForumThreadStatus.APPROVED,
    careerId: 'design',
    year: 1,
  },
  {
    id: 'thread-3',
    authorId: 102, // Maria Lopez
    title: '¿Cómo instalar el entorno de desarrollo para Programación I?',
    content: 'Estoy teniendo problemas para instalar y configurar el entorno de desarrollo que pidió el profesor para Programación I. ¿Alguien podría explicarme los pasos o pasar algún tutorial? Me da error al compilar.',
    timestamp: new Date().toISOString(),
    status: ForumThreadStatus.PENDING,
    careerId: 'dev',
    year: 1,
  },
  {
    id: 'thread-4',
    authorId: 103, // Pedro Martinez
    title: 'Grupo de estudio para Bases de Datos',
    content: 'El parcial de Bases de Datos se viene complicado. ¿A alguien le gustaría armar un grupo de estudio? Podríamos juntarnos en la biblioteca los martes y jueves.',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: ForumThreadStatus.APPROVED,
    careerId: 'dev',
    year: 2,
  },
];

export const INITIAL_FORUM_REPLIES: ForumReply[] = [
  {
    id: 'reply-1-1',
    threadId: 'thread-1',
    authorId: 104, // Laura Vargas
    content: '¡Hola Juan! Yo tengo los apuntes. Te los paso por mail. El tema principal fue el recorrido de árboles (in-order, pre-order, post-order).',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 10 * 60 * 1000).toISOString(),
  },
  {
    id: 'reply-1-2',
    threadId: 'thread-1',
    authorId: 101, // Juan Perez
    content: '¡Genial, Laura! Muchísimas gracias, me salvaste.',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000).toISOString(),
  },
  {
    id: 'reply-2-1',
    threadId: 'thread-2',
    authorId: 202, // Diego Sanchez
    content: '¡Buena pregunta! Yo empecé con una Canon T7 usada y me funcionó de maravilla. Para empezar, un lente de kit 18-55mm es más que suficiente para aprender lo básico de composición y exposición.',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 20 * 60 * 1000).toISOString(),
  },
  {
    id: 'reply-4-1',
    threadId: 'thread-4',
    authorId: 112, // Javier Rios
    content: '¡Me sumo! Los jueves me viene perfecto.',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
  }
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
    // For Prototipo Alumno (Juan Perez, ID 101)
    { id: 'notif-101-1', userId: 101, type: NotificationType.ATTENDANCE_STATUS_LIBRE, text: 'Condición: Libre en Algoritmos y Estructuras de Datos', details: 'Has superado el límite de 8 faltas.', timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), read: false },
    { id: 'notif-101-2', userId: 101, type: NotificationType.ATTENDANCE_WARNING, text: 'Alerta de Asistencia en Programación I', details: 'Te quedan solo 3 faltas para alcanzar el límite.', timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), read: false },
    { id: 'notif-101-3', userId: 101, type: NotificationType.FORUM_THREAD_APPROVED, text: 'Tu publicación del foro ha sido aprobada.', details: 'Título: ¿Alguien tiene apuntes de la clase de Algoritmos del lunes?', timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), read: false },
    { id: 'notif-101-4', userId: 101, type: NotificationType.ANNOUNCEMENT, text: 'Nuevo anuncio', details: 'Inscripciones a materias del próximo cuatrimestre abiertas del 1 al 5 de Agosto.', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), read: false },
    { id: 'notif-101-5', userId: 101, type: NotificationType.JUSTIFICATION_REJECTED, text: 'Tu solicitud de justificación ha sido rechazada.', details: 'Materia: Arquitectura de Computadoras', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), read: true },
    
    // For Prototipo Preceptor (Carlos Gomez, ID 1)
    { id: 'notif-1-1', userId: 1, type: NotificationType.JUSTIFICATION_REQUEST, text: 'Maria Lopez ha solicitado una justificación.', details: 'Materia: Programación I', timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(), read: false },
];

export const INITIAL_PLANIFICACIONES: Planificacion[] = [
  // Mock data for teacher Silvia Kent (ID 601), subjects: ['dev-2-prog2', 'dev-2-db']
  {
    id: 'plan-1',
    subjectId: 'dev-2-prog2',
    title: 'Semana 10: Introducción a APIs REST',
    status: PlanificacionStatus.COMPLETADO,
    startDate: '2024-07-22',
    endDate: '2024-07-26',
    objectives: 'Comprender los principios de las APIs REST. Crear un endpoint básico.',
    content: 'Verbos HTTP (GET, POST, PUT, DELETE). Estructura de una petición. JSON. Postman.',
    activities: 'Clase teórica sobre REST. Taller práctico de creación de una API simple con Node.js/Express.',
    evaluations: 'Ejercicio práctico en clase. Avance del TP.',
    resources: [{ id: 'res-1-1', label: 'Documentación MDN', url: 'https://developer.mozilla.org/' }]
  },
  {
    id: 'plan-2',
    subjectId: 'dev-2-prog2',
    title: 'Semana 11: Conexión a Base de Datos',
    status: PlanificacionStatus.EN_CURSO,
    startDate: '2024-07-29',
    endDate: '2024-08-02',
    objectives: 'Conectar la API a una base de datos. Realizar operaciones CRUD.',
    content: 'ORM vs Query Builders. Conexión a PostgreSQL. Modelos y migraciones.',
    activities: 'Demostración en vivo. Ejercicios de CRUD.',
    evaluations: 'Entrega del TP N°2.',
    resources: [{ id: 'res-2-1', label: 'Documentación Sequelize', url: 'https://sequelize.org/' }]
  },
  {
    id: 'plan-3',
    subjectId: 'dev-2-db',
    title: 'Módulo 3: Normalización y Modelado',
    status: PlanificacionStatus.PENDIENTE,
    startDate: '2024-08-05',
    endDate: '2024-08-09',
    objectives: 'Aplicar las formas normales. Diseñar un modelo relacional eficiente.',
    content: 'Primera, Segunda y Tercera Forma Normal (1FN, 2FN, 3FN). Diagramas Entidad-Relación.',
    activities: 'Resolución de casos de estudio en grupo.',
    evaluations: 'Cuestionario sobre formas normales.',
    resources: []
  }
];

export const INITIAL_MATERIAL_DIDACTICO: Material[] = [
  // Mock data for teacher Silvia Kent (ID 601), subjects: ['dev-2-prog2', 'dev-2-db']
  // Programación II
  {
    id: 'mat-1',
    subjectId: 'dev-2-prog2',
    title: 'Guía de Estilo de Código',
    category: MaterialCategory.GUIAS,
    type: 'pdf',
    fileName: 'guia_estilo_codigo.pdf',
    fileType: 'application/pdf',
    content: 'JVBERi0xLjQKJdPr6eEKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovT3V0bGluZXMgMiAwIFIKL1BhZ2VzIDMgMCBSPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL091dGxpbmVzCi9Db3VudCAwPj4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFs0IDAgUl0KL0NvdW50IDE+PgplbmRvYmoKNCAwIG9iago8PAovVHlwZSAvUGFnZQovUGFyZW50IDMgMCBSCi9SZXNvdXJjZXMgPDwKL0ZvbnQgPDwKL0YxIDYgMCBSCj4+Ci9Qcm9jU2V0IFsvUERGL1RleHQvSW1hZ2VCL0ltYWdlQy9JbWFnZUldPj4KL01lZGlhQm94IFswIDAgNTk1IDg0Ml0KL0NvbnRlbnRzIDUgMCBSCi9Hcm9wIDw8Ci9UeXBlIC9Hcm9wCi9TIC9UcmFuc3BhcmVuY3kKL0NTIC9EZXZpY2VSR0IKPj4+PgplbmRvYmoKNSAwIG9iago8PAovTGVuZ3RoIDYyPj4Kc3RyZWFtCkJUCjcwIDc1MCBUZAovRjEgMTIgVGYKKFRoaXMgaXMgYSBzaW1wbGUgUERGLikgVGoKRVQKZW5kc3RyZWFtCmVuZG9iago2IDAgb2JqCjw8Ci9UeXBlIC9Gb250Ci9TdWJ0eXBlIC9UeXBlMQovQmFzZUZvbnQgL0hlbHZldGljYQo+PgplbmRvYmoKeHJlZgowIDcKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDE1IDY1NTM1IGYgCjAwMDAwMDAwNzQgNjU1MzUgZiAKMDAwMDAwMDA5MyA2NTUzNSBmIAowMDAwMDAwMTQyIDY1NTM1IGYgCjAwMDAwMDAzMjYgNjU1MzUgZiAKMDAwMDAwMzkzIDY1NTM1IGYgCnRyYWlsZXIKPDwKL1NpemUgNwovUm9vdCAxIDAgUgo+PgpzdGFydHhyZWYKNDQxCjUlRU9GCg==', // Dummy base64 for a simple PDF
    viewCount: 15,
    downloadCount: 12,
    createdAt: '2024-07-10T10:00:00Z',
  },
  {
    id: 'mat-2',
    subjectId: 'dev-2-prog2',
    title: 'Tutorial de APIs REST',
    category: MaterialCategory.EXTRA,
    type: 'link',
    url: 'https://www.youtube.com/watch?v=Q-B_j9_g_aE',
    viewCount: 22,
    downloadCount: 0,
    createdAt: '2024-07-12T11:30:00Z',
  },
  {
    id: 'mat-3',
    subjectId: 'dev-2-prog2',
    title: 'Enunciado TP N°2: API de Tareas',
    category: MaterialCategory.PRACTICAS,
    type: 'pdf',
    fileName: 'tp2_api_tareas.pdf',
    fileType: 'application/pdf',
    content: 'JVBERi0xLjQKJdPr6eEKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovT3V0bGluZXMgMiAwIFIKL1BhZ2VzIDMgMCBSPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL091dGxpbmVzCi9Db3VudCAwPj4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFs0IDAgUl0KL0NvdW50IDE+PgplbmRvYmoKNCAwIG9iago8PAovVHlwZSAvUGFnZQovUGFyZW50IDMgMCBSCi9SZXNvdXJjZXMgPDwKL0ZvbnQgPDwKL0YxIDYgMCBSCj4+Ci9Qcm9jU2V0IFsvUERGL1RleHQvSW1hZ2VCL0ltYWdlQy9JbWFnZUldPj4KL01lZGlhQm94IFswIDAgNTk1IDg0Ml0KL0NvbnRlbnRzIDUgMCBSCi9Hcm9wIDw8Ci9UeXBlIC9Hcm9wCi9TIC9UcmFuc3BhcmVuY3kKL0NTIC9EZXZpY2VSR0IKPj4+PgplbmRvYmoKNSAwIG9iago8PAovTGVuZ3RoIDYyPj4Kc3RyZWFtCkJUCjcwIDc1MCBUZAovRjEgMTIgVGYKKFRoaXMgaXMgYSBzaW1wbGUgUERGLikgVGoKRVQKZW5kc3RyZWFtCmVuZG9iago2IDAgb2JqCjw8Ci9UeXBlIC9Gb250Ci9TdWJ0eXBlIC9UeXBlMQovQmFzZUZvbnQgL0hlbHZldGljYQo+PgplbmRvYmoKeHJlZgowIDcKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDE1IDY1NTM1IGYgCjAwMDAwMDAwNzQgNjU1MzUgZiAKMDAwMDAwMDA5MyA2NTUzNSBmIAowMDAwMDAwMTQyIDY1NTM1IGYgCjAwMDAwMDAzMjYgNjU1MzUgZiAKMDAwMDAwMzkzIDY1NTM1IGYgCnRyYWlsZXIKPDwKL1NpemUgNwovUm9vdCAxIDAgUgo+PgpzdGFydHhyZWYKNDQxCjUlRU9GCg==', // Dummy base64
    viewCount: 18,
    downloadCount: 18,
    createdAt: '2024-07-29T09:00:00Z',
  },
  // Bases de Datos
  {
    id: 'mat-4',
    subjectId: 'dev-2-db',
    title: 'Modelo Entidad-Relación de Ejemplo',
    category: MaterialCategory.GUIAS,
    type: 'image',
    fileName: 'modelo_er.png',
    fileType: 'image/png',
    content: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', // 1x1 black pixel
    viewCount: 25,
    downloadCount: 20,
    createdAt: '2024-07-15T14:00:00Z',
  },
  {
    id: 'mat-5',
    subjectId: 'dev-2-db',
    title: 'Ejercicios de Normalización',
    category: MaterialCategory.PRACTICAS,
    type: 'pdf',
    fileName: 'ejercicios_normalizacion.pdf',
    fileType: 'application/pdf',
    content: 'JVBERi0xLjQKJdPr6eEKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovT3V0bGluZXMgMiAwIFIKL1BhZ2VzIDMgMCBSPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL091dGxpbmVzCi9Db3VudCAwPj4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFs0IDAgUl0KL0NvdW50IDE+PgplbmRvYmoKNCAwIG9iago8PAovVHlwZSAvUGFnZQovUGFyZW50IDMgMCBSCi9SZXNvdXJjZXMgPDwKL0ZvbnQgPDwKL0YxIDYgMCBSCj4+Ci9Qcm9jU2V0IFsvUERGL1RleHQvSW1hZ2VCL0ltYWdlQy9JbWFnZUldPj4KL01lZGlhQm94IFswIDAgNTk1IDg0Ml0KL0NvbnRlbnRzIDUgMCBSCi9Hcm9wIDw8Ci9UeXBlIC9Hcm9wCi9TIC9UcmFuc3BhcmVuY3kKL0NTIC9EZXZpY2VSR0IKPj4+PgplbmRvYmoKNSAwIG9iago8PAovTGVuZ3RoIDYyPj4Kc3RyZWFtCkJUCjcwIDc1MCBUZAovRjEgMTIgVGYKKFRoaXMgaXMgYSBzaW1wbGUgUERGLikgVGoKRVQKZW5kc3RyZWFtCmVuZG9iago2IDAgb2JqCjw8Ci9UeXBlIC9Gb250Ci9TdWJ0eXBlIC9UeXBlMQovQmFzZUZvbnQgL0hlbHZldGljYQo+PgplbmRvYmoKeHJlZgowIDcKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDE1IDY1NTM1IGYgCjAwMDAwMDAwNzQgNjU1MzUgZiAKMDAwMDAwMDA5MyA2NTUzNSBmIAowMDAwMDAwMTQyIDY1NTM1IGYgCjAwMDAwMDAzMjYgNjU1MzUgZiAKMDAwMDAwMzkzIDY1NTM1IGYgCnRyYWlsZXIKPDwKL1NpemUgNwovUm9vdCAxIDAgUgo+PgpzdGFydHhyZWYKNDQxCjUlRU9GCg==', // Dummy base64
    viewCount: 12,
    downloadCount: 10,
    createdAt: '2024-08-01T18:00:00Z',
  },
];

export const INITIAL_MAINTENANCE_HISTORY: MaintenanceHistoryItem[] = [
    { id: 'hist-1', date: '12/07/2024', task: 'Cambio de cerradura Aula 5', responsible: 'Roberto Carlos' },
    { id: 'hist-2', date: '10/07/2024', task: 'Reparación de pérdida en baño de hombres PB', responsible: 'Roberto Carlos' },
];

export const INITIAL_DAILY_TASKS: DailyTask[] = [
    { id: 'task-6', title: 'Apertura de puertas y activación de luces', startTime: '07:00', type: 'rutina', status: 'pendiente', location: 'Entrada Principal', details: 'Verificar que todas las luces de emergencia estén activas.' },
    { id: 'task-1', title: 'Limpieza profunda de baños planta baja', startTime: '08:00', type: 'limpieza', status: 'pendiente', location: 'Planta Baja - Baños', details: 'Usar desinfectante de alto espectro en todas las superficies.' },
    { id: 'task-2', title: 'Revisar proyector Aula 3', startTime: '09:30', type: 'mantenimiento', status: 'pendiente', location: 'Aula 3', details: 'El profesor reportó que la imagen se ve borrosa.' },
    { id: 'task-3', title: 'Limpieza de patio y recolección de residuos', startTime: '11:00', type: 'limpieza', status: 'pendiente', location: 'Patio Principal' },
    { id: 'task-4', title: 'Cambiar tubo de luz en Biblioteca', startTime: '14:00', type: 'mantenimiento', status: 'pendiente', location: 'Biblioteca', details: 'Usar tubo de luz LED de 18W.' },
    { id: 'task-5', title: 'Ronda de cierre y apagado de equipos', startTime: '22:00', type: 'rutina', status: 'pendiente', location: 'Todo el edificio' },
];

export const INITIAL_INSTALLATIONS: Installation[] = [
    { id: 'entrada', name: 'Entrada ISFDYT 168', status: 'ok', layout: { col: 6, row: 11, colSpan: 2, rowSpan: 2 }, details: { lastCleaned: 'N/A' } },
    { id: 'pasillo_entrada', name: 'Pasillo Entrada', status: 'ok', layout: { col: 3, row: 10, colSpan: 7, rowSpan: 1 }, details: { lastCleaned: 'Hoy 07:00hs' } },
    { id: 'biblioteca', name: 'Biblioteca', status: 'maintenance', layout: { col: 3, row: 11, colSpan: 2, rowSpan: 1 }, details: { lastCleaned: 'Hoy 09:00hs', nextTask: 'Cambiar tubo de luz' } },
    { id: 'aula_proyeccion', name: 'Aula Proyeccion', status: 'ok', layout: { col: 1, row: 10, colSpan: 2, rowSpan: 2 }, details: { lastCleaned: 'Hoy 10:00hs' } },
    { id: 'bano_auxiliares', name: 'Baño Auxiliares', status: 'ok', layout: { col: 11, row: 10, colSpan: 1, rowSpan: 1 }, details: { lastCleaned: 'Hoy 08:00hs' } },
    { id: 'auxiliares', name: 'Auxiliares / Porteros', status: 'ok', layout: { col: 6, row: 9, colSpan: 2, rowSpan: 1 }, details: { lastCleaned: 'Hoy 07:00hs' } },
    { id: 'preceptoria', name: 'Preceptoría/Dirección', status: 'ok', layout: { col: 6, row: 7, colSpan: 2, rowSpan: 2 }, details: { lastCleaned: 'Hoy 07:30hs' } },
    { id: 'patio_desc', name: 'Patio Descubierto', status: 'ok', layout: { col: 6, row: 5, colSpan: 2, rowSpan: 2 }, details: { lastCleaned: 'Hoy 11:30hs' } },
    { id: 'pasillo_pb_izq', name: 'Pasillo PB Izquierdo', status: 'ok', layout: { col: 5, row: 5, colSpan: 1, rowSpan: 5 }, details: { lastCleaned: 'Hoy 07:15hs' } },
    { id: 'pasillo_pb_der', name: 'Pasillo PB Derecho', status: 'maintenance', layout: { col: 8, row: 5, colSpan: 1, rowSpan: 5 }, details: { lastCleaned: 'Hoy 07:15hs', incident: 'Luz parpadeando' } },
    { id: 'aula_1', name: 'Aula 1', status: 'ok', layout: { col: 4, row: 9, colSpan: 1, rowSpan: 1 }, details: { lastCleaned: 'Hoy 10:00hs' } },
    { id: 'aula_2', name: 'Aula 2', status: 'maintenance', layout: { col: 4, row: 8, colSpan: 1, rowSpan: 1 }, details: { lastCleaned: 'Ayer 18:00hs' } },
    { id: 'aula_3', name: 'Aula 3', status: 'maintenance', layout: { col: 4, row: 7, colSpan: 1, rowSpan: 1 }, details: { lastCleaned: 'Ayer 17:00hs' } },
    { id: 'aula_4', name: 'Aula 4', status: 'ok', layout: { col: 4, row: 6, colSpan: 1, rowSpan: 1 }, details: { lastCleaned: 'Ayer 16:00hs' } },
    { id: 'aula_5', name: 'Aula 5', status: 'maintenance', layout: { col: 4, row: 5, colSpan: 1, rowSpan: 1 }, details: { lastCleaned: 'Hoy 09:30hs' } },
    { id: 'aula_8', name: 'Aula 8', status: 'ok', layout: { col: 9, row: 9, colSpan: 1, rowSpan: 1 }, details: { lastCleaned: 'Hoy 12:30hs' } },
    { id: 'aula_10', name: 'Aula 10', status: 'maintenance', layout: { col: 9, row: 8, colSpan: 1, rowSpan: 1 }, details: { lastCleaned: 'Hoy 12:00hs' } },
    { id: 'aula_9', name: 'Aula 9', status: 'maintenance', layout: { col: 9, row: 7, colSpan: 1, rowSpan: 1 }, details: { lastCleaned: 'Ayer 13:00hs' } },
    { id: 'aula_11', name: 'Aula 11', status: 'maintenance', layout: { col: 9, row: 6, colSpan: 1, rowSpan: 1 }, details: { lastCleaned: 'Ayer 14:00hs' } },
    { id: 'aula_12_right', name: 'Aula 12', status: 'maintenance', layout: { col: 9, row: 5, colSpan: 1, rowSpan: 1 }, details: { lastCleaned: 'Hoy 11:00hs' } },
    { id: 'patio_main', name: 'Patio', status: 'maintenance', layout: { col: 5, row: 3, colSpan: 4, rowSpan: 2 }, details: { lastCleaned: 'Hoy 11:00hs', nextTask: 'Recolección de residuos' } },
    { id: 'pasillo_derecho', name: 'Pasillo Derecho', status: 'ok', layout: { col: 9, row: 3, colSpan: 3, rowSpan: 1 }, details: { lastCleaned: 'Hoy 07:15hs' } },
    { id: 'banos_m', name: 'Baños M', status: 'out_of_service', layout: { col: 11, row: 4, colSpan: 1, rowSpan: 1 }, details: { lastCleaned: 'Ayer 18:00hs', incident: 'Inodoro tapado.' } },
    { id: 'aula_13', name: 'Aula 13', status: 'ok', layout: { col: 12, row: 3, colSpan: 1, rowSpan: 1 }, details: { lastCleaned: 'Hoy 11:00hs' } },
    { id: 'pasillo_izq_sup', name: 'Pasillo Izquierdo', status: 'maintenance', layout: { col: 2, row: 3, colSpan: 3, rowSpan: 1 }, details: { lastCleaned: 'Hoy 07:15hs' } },
    { id: 'aula_7', name: 'Aula 7', status: 'ok', layout: { col: 3, row: 4, colSpan: 1, rowSpan: 1 }, details: { lastCleaned: 'Hoy 09:00hs' } },
    { id: 'banos_f', name: 'Baños F', status: 'ok', layout: { col: 2, row: 4, colSpan: 1, rowSpan: 1 }, details: { lastCleaned: 'Hoy 08:00hs' } },
    { id: 'aula_12_left', name: 'Aula 12', status: 'ok', layout: { col: 1, row: 3, colSpan: 1, rowSpan: 1 }, details: { lastCleaned: 'Hoy 11:00hs' } },
    { id: 'aula_computacion', name: 'Aula Computacion', status: 'ok', layout: { col: 2, row: 2, colSpan: 1, rowSpan: 1 }, details: { lastCleaned: 'Hoy 09:00hs' } },
    { id: 'aula_maquinarias', name: 'Aula Maquinarias', status: 'ok', layout: { col: 3, row: 2, colSpan: 1, rowSpan: 1 }, details: { lastCleaned: 'Hoy 09:00hs' } }
];


export const INITIAL_INCIDENTS: Incident[] = [
    { id: 'inc-1', description: 'Inodoro tapado en baño de hombres.', priority: 'Alta', sector: 'Baños M', status: 'abierta', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
    { id: 'inc-2', description: 'Luz parpadeando en pasillo derecho.', priority: 'Media', sector: 'Pasillo PB Derecho', status: 'en_progreso', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
    { id: 'inc-3', description: 'Proyector con imagen borrosa.', priority: 'Baja', sector: 'Aula 3', status: 'resuelta', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
];

export const INITIAL_STUDENT_REP_EVENTS: StudentRepEvent[] = [
  {
    id: 'sre-1',
    title: 'Charla: Introducción a la Inteligencia Artificial',
    date: '2024-08-15',
    time: '19:00',
    location: 'Aula Magna',
    description: 'Una charla abierta a toda la comunidad estudiantil sobre los fundamentos de la IA y su impacto en el futuro profesional. Disertante: Dr. Alan Turing.',
    type: 'académico',
    organizer: 'Centro de Estudiantes',
  },
  {
    id: 'sre-2',
    title: 'Torneo de Fútbol 5',
    date: '2024-08-24',
    time: '10:00',
    location: 'Patio Principal',
    description: '¡Arma tu equipo e inscríbete! Torneo relámpago con premios para los ganadores. Inscripciones abiertas hasta el 20/08.',
    type: 'deportivo',
    organizer: 'Centro de Estudiantes',
  },
  {
    id: 'sre-3',
    title: 'Muestra de Cine Debate',
    date: '2024-09-05',
    time: '20:30',
    location: 'Microcine',
    description: 'Proyección de la película "Her" y posterior debate sobre las relaciones humanas en la era digital.',
    type: 'cultural',
    organizer: 'Centro de Estudiantes',
  },
  {
    id: 'sre-4',
    title: 'Reunión Abierta del Centro de Estudiantes',
    date: '2024-08-12',
    time: '18:30',
    location: 'SUM',
    description: 'Reunión mensual para tratar temas de interés, propuestas y planificar próximas actividades. ¡Tu voz es importante!',
    type: 'reunión',
    organizer: 'Centro de Estudiantes',
  },
];

export const INITIAL_STUDENT_REP_THREADS: StudentRepForumThread[] = [
    {
        id: 'srft-1',
        authorId: 801, // Felipe Melo
        title: 'Propuesta: Más enchufes en la Biblioteca',
        content: 'Hola a todos, como muchos sabrán, encontrar un enchufe libre en la biblioteca en época de parciales es casi imposible. Propongo que juntemos firmas para solicitar al instituto la instalación de más zapatillas y puestos de carga. ¿Qué opinan?',
        category: 'propuestas',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: 'srft-2',
        authorId: 203, // Sofia Torres
        title: '¿Alguien para armar grupo de estudio para el final de Diseño Audiovisual?',
        content: 'Estoy buscando compañeros/as para preparar el final de Diseño Audiovisual. La idea sería juntarnos dos veces por semana en el instituto. ¡Si a alguien le interesa, que comente!',
        category: 'general',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: 'srft-3',
        authorId: 802, // Carolina Peleritti
        title: 'Ideas para la próxima jornada solidaria',
        content: 'Desde el Centro de Estudiantes estamos empezando a organizar la jornada solidaria de fin de año. Queremos escuchar sus ideas. ¿Qué tipo de actividades les gustaría que hagamos? ¿A qué organización podríamos ayudar? Todas las propuestas son bienvenidas.',
        category: 'eventos',
        timestamp: new Date().toISOString(),
        isPinned: true,
    }
];

export const INITIAL_STUDENT_REP_REPLIES: StudentRepForumReply[] = [
    {
        id: 'srfr-1',
        threadId: 'srft-1',
        authorId: 215, // Daniel Sosa
        content: '¡Totalmente de acuerdo! Me sumo a la juntada de firmas. Siempre tengo que ir con la notebook cargada al 100% por las dudas.',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 10 * 60 * 1000).toISOString(),
    },
    {
        id: 'srfr-2',
        threadId: 'srft-1',
        authorId: 115, // Catalina Moreno
        content: 'Buena iniciativa. Podríamos sugerir que pongan puestos de carga con USB también, sería muy útil.',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 25 * 60 * 1000).toISOString(),
    },
    {
        id: 'srfr-3',
        threadId: 'srft-2',
        authorId: 212, // Ambar Carrizo
        content: '¡Hola Sofía! A mí me interesa. ¿Qué días y horarios tenías en mente?',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000).toISOString(),
    }
];

export const INITIAL_STUDENT_REP_ANNOUNCEMENTS: StudentRepAnnouncement[] = [
  {
    id: 'sra-1',
    title: 'Apertura de Inscripciones para Becas de Apuntes',
    content: 'Se informa a toda la comunidad estudiantil que a partir del Lunes 19/08 se abre la inscripción para las becas de apuntes correspondientes al segundo cuatrimestre. Los interesados deberán completar el formulario online disponible en el link de nuestra biografía de Instagram. Hay tiempo hasta el Viernes 30/08.\n\nRequisitos:\n- Ser alumno regular.\n- Haber aprobado al menos 2 materias en el último año.\n\n¡No dejes pasar esta oportunidad!',
    authorId: 802, // Carolina Peleritti
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    isPinned: true,
  },
  {
    id: 'sra-2',
    title: 'Campaña Solidaria: Colecta de Alimentos no Perecederos',
    content: 'Junto a la organización "Manos que Ayudan", estaremos realizando una colecta de alimentos no perecederos para comedores de la zona. Podrán acercar sus donaciones a la mesa del Centro de Estudiantes en el hall de entrada, de Lunes a Viernes de 18:00 a 21:00 hs. ¡Sumate a ayudar!',
    authorId: 801, // Felipe Melo
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'sra-3',
    title: 'Recordatorio: Elecciones del Centro de Estudiantes',
    content: 'Les recordamos que el próximo mes se llevarán a cabo las elecciones para la renovación de autoridades del Centro de Estudiantes. Pronto publicaremos el cronograma electoral completo y los requisitos para la presentación de listas. ¡Participar es fundamental para fortalecer la democracia estudiantil!',
    authorId: 802, // Carolina Peleritti
    timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

export const INITIAL_STUDENT_REP_CLAIMS: StudentRepClaim[] = [
  {
    id: 'src-1',
    authorId: 101, // Juan Perez
    category: 'infraestructura',
    description: 'El proyector del Aula 12 no funciona correctamente, la imagen se ve muy oscura y es difícil leer. Ya se reportó varias veces pero no hubo solución.',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'en revisión',
  },
  {
    id: 'src-2',
    authorId: 203, // Sofia Torres
    category: 'académico',
    description: 'Las fechas de finales para Diseño Audiovisual se superponen con las de Edición de Video. Sería posible re-programar una de las dos mesas?',
    file: { name: 'cronograma_finales.pdf', type: 'application/pdf', content: '' }, // Dummy content
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'resuelto',
  },
  {
    id: 'src-3',
    authorId: 115, // Catalina Moreno
    category: 'sugerencia',
    description: 'Sería muy útil tener más dispenser de agua fría en los pasillos, especialmente en verano. El único que hay suele tener mucha fila.',
    timestamp: new Date().toISOString(),
    status: 'pendiente',
  }
];