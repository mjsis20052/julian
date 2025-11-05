import React, { useState, useEffect } from 'react';
import { Role, User, AttendanceRecord, Subject, NewsItem, PrivateMessage, AttendanceStatus, JustificationFile, Notification, NotificationType, UserProfileData, Note, ForumThread, ForumReply, ForumThreadStatus, QRAttendanceSession, Coordinates, ClassSchedule, Grade, GradeType, CalendarEvent, Planificacion, Material, DailyTask, MaintenanceHistoryItem, Installation, Incident, StudentRepEvent, StudentRepForumThread, StudentRepForumReply, StudentRepAnnouncement, StudentRepClaim } from './types';
import { CAREERS, INITIAL_USERS, INITIAL_ATTENDANCE, SUBJECTS, NEWS_ITEMS, INITIAL_PRIVATE_MESSAGES, INITIAL_FORUM_THREADS, INITIAL_FORUM_REPLIES, ABSENCE_LIMIT, MINIMUM_PRESENTISM, CLASS_COUNT_THRESHOLD_FOR_LIBRE, CLASS_SCHEDULE, INITIAL_NOTIFICATIONS, INITIAL_GRADES, INITIAL_PLANIFICACIONES, INITIAL_MATERIAL_DIDACTICO, INITIAL_DAILY_TASKS, INITIAL_MAINTENANCE_HISTORY, INITIAL_INSTALLATIONS, INITIAL_INCIDENTS, INITIAL_STUDENT_REP_EVENTS, INITIAL_STUDENT_REP_THREADS, INITIAL_STUDENT_REP_REPLIES, INITIAL_STUDENT_REP_ANNOUNCEMENTS, INITIAL_STUDENT_REP_CLAIMS } from './constants';
import { AuthForm } from './components/AuthForm';
import { StudentDashboard } from './components/StudentDashboard';
import { PreceptorDashboard } from './components/PreceptorDashboard';
import { TeacherDashboard } from './components/TeacherDashboard';
import { StaffDashboard } from './components/StaffDashboard';
import { StudentRepDashboard } from './components/StudentRepDashboard';
import InteractiveConstellation from './components/InteractiveConstellation';

export type Theme = 'celestial' | 'oscuro' | 'ensoñacion' | 'moderno' | 'fantasma' | 'rebelde';
export type BorderStyle = 'sencillo' | 'refinado' | 'gradiente' | 'neon' | 'acentuado' | 'doble';
export type FontStyle = 'predeterminado' | 'clasico' | 'moderno' | 'elegante' | 'tecnico' | 'amigable';


export const THEMES: Record<Theme, { name: string; accent: string; colors: { bg: string; primary: string; accent: string; } }> = {
  celestial: { name: 'Celestial', accent: '#c09a58', colors: { bg: '#f3f4f6', primary: '#ffffff', accent: '#c09a58' } },
  oscuro: { name: 'Oscuro', accent: '#c09a58', colors: { bg: '#111827', primary: '#1f2937', accent: '#c09a58' } },
  ensoñacion: { name: 'Ensoñación', accent: '#db2777', colors: { bg: '#fdf2f8', primary: '#fce7f3', accent: '#db2777' } },
  moderno: { name: 'Moderno', accent: '#22d3ee', colors: { bg: '#0f2e2b', primary: '#134e4a', accent: '#22d3ee' } },
  fantasma: { name: 'Fantasma', accent: '#e60060', colors: { bg: '#161625', primary: '#1e1e3f', accent: '#e60060' } },
  rebelde: { name: 'Rebelde', accent: '#f5d142', colors: { bg: '#100f1c', primary: '#1c1b29', accent: '#f5d142' } },
};

export const App: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [users, setUsers] = useState<User[]>(INITIAL_USERS);
    const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE);
    const [newsItems, setNewsItems] = useState<NewsItem[]>(NEWS_ITEMS);
    const [privateMessages, setPrivateMessages] = useState<PrivateMessage[]>(INITIAL_PRIVATE_MESSAGES);
    const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
    const [grades, setGrades] = useState<Grade[]>(INITIAL_GRADES);
    const [forumThreads, setForumThreads] = useState<ForumThread[]>(INITIAL_FORUM_THREADS);
    const [forumReplies, setForumReplies] = useState<ForumReply[]>(INITIAL_FORUM_REPLIES);
    const [userProfiles, setUserProfiles] = useState<Record<number, UserProfileData>>({});
    const [userNotes, setUserNotes] = useState<Record<number, Note[]>>({});
    const [customEvents, setCustomEvents] = useState<CalendarEvent[]>([]);
    const [planificaciones, setPlanificaciones] = useState<Planificacion[]>(INITIAL_PLANIFICACIONES);
    const [materials, setMaterials] = useState<Material[]>(INITIAL_MATERIAL_DIDACTICO);
    const [dailyTasks, setDailyTasks] = useState<DailyTask[]>(INITIAL_DAILY_TASKS);
    const [maintenanceHistory, setMaintenanceHistory] = useState<MaintenanceHistoryItem[]>(INITIAL_MAINTENANCE_HISTORY);
    const [installations, setInstallations] = useState<Installation[]>(INITIAL_INSTALLATIONS);
    const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS);
    const [studentRepEvents, setStudentRepEvents] = useState<StudentRepEvent[]>(INITIAL_STUDENT_REP_EVENTS);
    const [eventParticipants, setEventParticipants] = useState<Record<string, number[]>>({});
    const [studentRepThreads, setStudentRepThreads] = useState<StudentRepForumThread[]>(INITIAL_STUDENT_REP_THREADS);
    const [studentRepReplies, setStudentRepReplies] = useState<StudentRepForumReply[]>(INITIAL_STUDENT_REP_REPLIES);
    const [studentRepAnnouncements, setStudentRepAnnouncements] = useState<StudentRepAnnouncement[]>(INITIAL_STUDENT_REP_ANNOUNCEMENTS);
    const [studentRepClaims, setStudentRepClaims] = useState<StudentRepClaim[]>(INITIAL_STUDENT_REP_CLAIMS);

    const [theme, setTheme] = useState<Theme>('celestial');
    const [borderStyle, setBorderStyle] = useState<BorderStyle>('sencillo');
    const [fontStyle, setFontStyle] = useState<FontStyle>('predeterminado');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        document.documentElement.setAttribute('data-border-style', borderStyle);
        document.documentElement.setAttribute('data-font-style', fontStyle);
    }, [theme, borderStyle, fontStyle]);

    // Simple handler functions to be passed as props
    const handleLogin = (user: User) => setCurrentUser(user);
    const handleRegister = (user: User) => { setUsers(prev => [...prev, user]); setCurrentUser(user); };
    const handleLogout = () => setCurrentUser(null);
    const handleUpdateProfile = (userId: number, data: UserProfileData) => setUserProfiles(prev => ({ ...prev, [userId]: data }));
    const handleUpdateNotes = (notes: Note[]) => {
      if (currentUser) {
        setUserNotes(prev => ({...prev, [currentUser.id]: notes}));
      }
    };
    const handleAddNotification = (notificationData: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
        const newNotification: Notification = {
            ...notificationData,
            id: `notif-${Date.now()}`,
            timestamp: new Date().toISOString(),
            read: false,
        };
        setNotifications(prev => [newNotification, ...prev]);
    };
    const handleAddEvent = (event: Omit<CalendarEvent, 'id'>) => {
      setCustomEvents(prev => [...prev, {...event, id: `custom-${Date.now()}`}]);
    }
    const handleJoinEvent = (eventId: string, userId: number) => {
        setEventParticipants(prev => {
            const currentParticipants = prev[eventId] || [];
            if (!currentParticipants.includes(userId)) {
                // ADD NOTIFICATION TO STUDENT REPS
                const studentReps = users.filter(u => u.role === Role.STUDENT_REP);
                const event = studentRepEvents.find(e => e.id === eventId);
                const student = users.find(u => u.id === userId);
                if(event && student) {
                    studentReps.forEach(rep => {
                        handleAddNotification({
                            userId: rep.id,
                            type: NotificationType.NEW_EVENT_PARTICIPANT,
                            text: `${student.name} se unió a un evento`,
                            details: `Nuevo participante en: "${event.title}"`
                        })
                    })
                }
                return { ...prev, [eventId]: [...currentParticipants, userId] };
            }
            return prev;
        });
    }

    const handleAddStudentRepClaim = (claimData: Omit<StudentRepClaim, 'id' | 'authorId' | 'timestamp' | 'status'>) => {
        if (!currentUser) return;
        const newClaim: StudentRepClaim = {
            ...claimData,
            id: `src-${Date.now()}`,
            authorId: currentUser.id,
            timestamp: new Date().toISOString(),
            status: 'pendiente'
        };
        setStudentRepClaims(prev => [newClaim, ...prev]);
        
        // Notify all student reps
        const studentReps = users.filter(u => u.role === Role.STUDENT_REP);
        studentReps.forEach(rep => {
            handleAddNotification({
                userId: rep.id,
                type: NotificationType.ANNOUNCEMENT, // Using a generic one for now
                text: 'Nuevo reclamo/sugerencia recibido',
                details: `Categoría: ${newClaim.category}`
            })
        });
    };

    if (!currentUser) {
        return (
            <>
                <InteractiveConstellation accentColor={THEMES[theme].accent} />
                <AuthForm onLogin={handleLogin} onRegister={handleRegister} />
            </>
        );
    }
    
    const dashboardProps = {
        user: currentUser,
        onLogout: handleLogout,
        allUsers: users,
        userProfiles,
        onUpdateProfile: handleUpdateProfile,
        userNotes: userNotes[currentUser.id] || [],
        onUpdateNotes: handleUpdateNotes,
        theme, setTheme,
        borderStyle, setBorderStyle,
        fontStyle, setFontStyle,
        notifications,
        markNotificationsAsRead: (userId: number) => {
            setNotifications(prev => prev.map(n => n.userId === userId ? {...n, read: true} : n));
        },
        addNotification: handleAddNotification,
    };
    
    switch (currentUser.role) {
        case Role.STUDENT:
            return <StudentDashboard
                {...dashboardProps}
                preceptor={users.find(u => u.role === Role.PRECEPTOR && u.careerId === currentUser.careerId) || null}
                attendanceRecords={attendanceRecords}
                subjects={SUBJECTS.filter(s => s.careerId === currentUser.careerId && s.year === currentUser.year)}
                grades={grades}
                newsItems={newsItems}
                privateMessages={privateMessages}
                sendPrivateMessage={(senderId, receiverId, text) => setPrivateMessages(p => [...p, {id: `msg-${Date.now()}`, senderId, receiverId, text, timestamp: new Date().toISOString(), read: false}])}
                markMessagesAsRead={(readerId, chatterId) => setPrivateMessages(p => p.map(m => (m.receiverId === readerId && m.senderId === chatterId ? {...m, read: true} : m)))}
                requestJustification={(recordId, reason, file) => {
                    setAttendanceRecords(prev => prev.map(r => r.id === recordId ? {...r, status: AttendanceStatus.PENDING_JUSTIFICATION, justificationReason: reason, justificationFile: file} : r));
                }}
                onVerifyQRAttendance={async () => "Not implemented yet"}
                forumThreads={forumThreads}
                forumReplies={forumReplies}
                onAddForumThread={(thread) => setForumThreads(prev => [{...thread, id: `thread-${Date.now()}`, timestamp: new Date().toISOString(), status: ForumThreadStatus.PENDING}, ...prev])}
                onAddForumReply={(reply) => setForumReplies(prev => [{...reply, id: `reply-${Date.now()}`, timestamp: new Date().toISOString()}, ...prev])}
                onEditForumThread={(threadId, title, content) => setForumThreads(prev => prev.map(t => t.id === threadId ? {...t, title, content, status: ForumThreadStatus.PENDING} : t))}
                onDeleteForumThread={(threadId) => setForumThreads(prev => prev.filter(t => t.id !== threadId))}
                onDeleteForumReply={(replyId) => setForumReplies(prev => prev.filter(r => r.id !== replyId))}
                onToggleLockThread={(threadId) => setForumThreads(prev => prev.map(t => t.id === threadId ? {...t, isLocked: !t.isLocked} : t))}
                classSchedule={CLASS_SCHEDULE}
                customEvents={customEvents}
                onAddEvent={handleAddEvent}
                materials={materials}
                onUpdateMaterials={setMaterials}
                studentRepEvents={studentRepEvents}
                eventParticipants={eventParticipants}
                onJoinEvent={handleJoinEvent}
                studentRepThreads={studentRepThreads}
                studentRepReplies={studentRepReplies}
                onUpdateStudentRepReplies={setStudentRepReplies}
                studentRepClaims={studentRepClaims}
                onAddStudentRepClaim={handleAddStudentRepClaim}
             />;
        case Role.PRECEPTOR:
            return <PreceptorDashboard
                {...dashboardProps}
                students={users.filter(u => u.role === Role.STUDENT)}
                attendanceRecords={attendanceRecords}
                addAttendanceRecord={(updates, date, subjectId, actorRole) => {
                    const newRecords = updates.map(u => ({ id: `att-${u.studentId}-${subjectId}-${date}`, studentId: u.studentId, subjectId, date, status: u.status }));
                    setAttendanceRecords(prev => [...prev.filter(r => !(r.date === date && r.subjectId === subjectId && newRecords.some(nr => nr.studentId === r.studentId))), ...newRecords]);
                }}
                updateAttendanceStatus={(recordId, newStatus) => setAttendanceRecords(prev => prev.map(r => r.id === recordId ? {...r, status: newStatus} : r))}
                resolveJustificationRequest={(recordId, approved) => setAttendanceRecords(prev => prev.map(r => r.id === recordId ? {...r, status: approved ? AttendanceStatus.JUSTIFIED : AttendanceStatus.ABSENT, justificationReason: undefined, justificationFile: undefined} : r))}
                subjects={SUBJECTS}
                newsItems={newsItems}
                addNewsItem={(item) => setNewsItems(prev => [{...item, id: `news-${Date.now()}`}, ...prev])}
                deleteNewsItem={(id) => setNewsItems(prev => prev.filter(item => item.id !== id))}
                privateMessages={privateMessages}
                sendPrivateMessage={(senderId, receiverId, text) => setPrivateMessages(p => [...p, {id: `msg-${Date.now()}`, senderId, receiverId, text, timestamp: new Date().toISOString(), read: false}])}
                markMessagesAsRead={(readerId, chatterId) => setPrivateMessages(p => p.map(m => (m.receiverId === readerId && m.senderId === chatterId ? {...m, read: true} : m)))}
                onCreateQRSession={async (subjectId) => ({ id: `qr-${Date.now()}`, subjectId, preceptorId: currentUser.id, createdAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(), location: {latitude:0, longitude:0}, radius: 100})}
                forumThreads={forumThreads}
                forumReplies={forumReplies}
                onUpdateForumThreadStatus={(threadId, status, reason) => setForumThreads(prev => prev.map(t => t.id === threadId ? {...t, status, rejectionReason: reason} : t))}
                onAddForumReply={(reply) => setForumReplies(prev => [{...reply, id: `reply-${Date.now()}`, timestamp: new Date().toISOString()}, ...prev])}
                onDeleteForumThread={(threadId) => setForumThreads(prev => prev.filter(t => t.id !== threadId))}
                onDeleteForumReply={(replyId) => setForumReplies(prev => prev.filter(r => r.id !== replyId))}
                onEditThread={(threadId, title, content) => setForumThreads(prev => prev.map(t => t.id === threadId ? {...t, title, content, status: ForumThreadStatus.PENDING} : t))}
                onToggleLockThread={(threadId) => setForumThreads(prev => prev.map(t => t.id === threadId ? {...t, isLocked: !t.isLocked} : t))}
                classSchedule={CLASS_SCHEDULE}
                customEvents={customEvents}
                onAddEvent={handleAddEvent}
                studentRepEvents={studentRepEvents}
                eventParticipants={eventParticipants}
                onJoinEvent={handleJoinEvent}
                studentRepThreads={studentRepThreads}
                studentRepReplies={studentRepReplies}
                onUpdateStudentRepReplies={setStudentRepReplies}
                studentRepClaims={studentRepClaims}
                onAddStudentRepClaim={handleAddStudentRepClaim}
            />;
        case Role.TEACHER:
            return <TeacherDashboard
                {...dashboardProps}
                subjects={SUBJECTS}
                students={users.filter(u => u.role === Role.STUDENT)}
                attendanceRecords={attendanceRecords}
                addAttendanceRecord={(updates, date, subjectId, actorRole) => {
                    const newRecords = updates.map(u => ({ id: `att-${u.studentId}-${subjectId}-${date}`, studentId: u.studentId, subjectId, date, status: u.status }));
                    setAttendanceRecords(prev => [...prev.filter(r => !(r.date === date && r.subjectId === subjectId && newRecords.some(nr => nr.studentId === r.studentId))), ...newRecords]);
                }}
                grades={grades}
                onUpdateGrades={(studentId, subjectId, newGrades) => {
                  const otherGrades = grades.filter(g => g.studentId !== studentId || g.subjectId !== subjectId);
                  const updatedGradesForStudent = newGrades.map(ng => ({
                    id: `g-${studentId}-${ng.type}-${subjectId}`,
                    studentId,
                    subjectId,
                    type: ng.type,
                    value: ng.value
                  }));
                  setGrades([...otherGrades, ...updatedGradesForStudent]);
                }}
                newsItems={newsItems}
                addNewsItem={(item) => {
                    const newItem = { ...item, id: `news-${Date.now()}` };
                    setNewsItems(prev => [newItem, ...prev]);

                    const targetStudents = users.filter(student => {
                        if (student.role !== Role.STUDENT) return false;
                        if (newItem.careerId && student.careerId !== newItem.careerId) return false;
                        if (newItem.year && (Array.isArray(student.year) ? !student.year.includes(newItem.year) : student.year !== newItem.year)) return false;
                        if (newItem.subjectId) {
                            const studentSubjects = SUBJECTS.filter(s => s.careerId === student.careerId && (Array.isArray(student.year) ? !student.year.includes(s.year) : s.year === student.year));
                            if (!studentSubjects.find(s => s.id === newItem.subjectId)) return false;
                        }
                        return true;
                    });
            
                    targetStudents.forEach(student => {
                        handleAddNotification({
                            userId: student.id,
                            type: NotificationType.NEW_ASSIGNMENT,
                            text: `Nuevo comunicado en ${SUBJECTS.find(s => s.id === newItem.subjectId)?.name || 'Anuncios Generales'}`,
                            details: newItem.text,
                        });
                    });
                }}
                classSchedule={CLASS_SCHEDULE}
                customEvents={customEvents}
                onAddEvent={handleAddEvent}
                planificaciones={planificaciones}
                onUpdatePlanificaciones={setPlanificaciones}
                materials={materials}
                onUpdateMaterials={setMaterials}
                studentRepThreads={studentRepThreads}
                studentRepReplies={studentRepReplies}
                onUpdateStudentRepReplies={setStudentRepReplies}
                studentRepEvents={studentRepEvents}
                eventParticipants={eventParticipants}
                onJoinEvent={handleJoinEvent}
                studentRepClaims={studentRepClaims}
                onAddStudentRepClaim={handleAddStudentRepClaim}
            />;
        case Role.STAFF:
            return <StaffDashboard 
                {...dashboardProps}
                dailyTasks={dailyTasks}
                onUpdateTasks={setDailyTasks}
                maintenanceHistory={maintenanceHistory}
                onUpdateMaintenanceHistory={setMaintenanceHistory}
                installations={installations}
                onUpdateInstallations={setInstallations}
                incidents={incidents}
                onUpdateIncidents={setIncidents}
             />;
        case Role.STUDENT_REP:
            return <StudentRepDashboard 
                {...dashboardProps} 
                studentRepEvents={studentRepEvents}
                onUpdateStudentRepEvents={setStudentRepEvents}
                studentRepThreads={studentRepThreads}
                onUpdateStudentRepThreads={setStudentRepThreads}
                studentRepReplies={studentRepReplies}
                onUpdateStudentRepReplies={setStudentRepReplies}
                studentRepAnnouncements={studentRepAnnouncements}
                onUpdateStudentRepAnnouncements={setStudentRepAnnouncements}
                studentRepClaims={studentRepClaims}
                onUpdateStudentRepClaims={setStudentRepClaims}
                eventParticipants={eventParticipants}
            />;
        default:
            return <div>Error: Role not supported</div>;
    }
};