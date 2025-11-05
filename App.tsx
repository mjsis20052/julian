import React, { useState, useEffect } from 'react';
import { Role, User, AttendanceRecord, Subject, NewsItem, PrivateMessage, AttendanceStatus, JustificationFile, Notification, NotificationType, UserProfileData, Note, ForumThread, ForumReply, ForumThreadStatus, QRAttendanceSession, Coordinates, ClassSchedule, Grade, GradeType, CalendarEvent, Planificacion, Material, DailyTask, MaintenanceHistoryItem, Installation, Incident, StudentRepEvent, StudentRepForumThread, StudentRepForumReply, StudentRepAnnouncement, StudentRepClaim } from './types';
import { CAREERS, SUBJECTS, ABSENCE_LIMIT, MINIMUM_PRESENTISM, CLASS_COUNT_THRESHOLD_FOR_LIBRE, CLASS_SCHEDULE, INITIAL_PLANIFICACIONES, INITIAL_MATERIAL_DIDACTICO, INITIAL_DAILY_TASKS, INITIAL_MAINTENANCE_HISTORY, INITIAL_INSTALLATIONS, INITIAL_INCIDENTS, INITIAL_STUDENT_REP_THREADS, INITIAL_STUDENT_REP_REPLIES, INITIAL_STUDENT_REP_ANNOUNCEMENTS, INITIAL_STUDENT_REP_CLAIMS } from './constants';
import { AuthForm } from './components/AuthForm';
import { StudentDashboard } from './components/StudentDashboard';
import { PreceptorDashboard } from './components/PreceptorDashboard';
import { TeacherDashboard } from './components/TeacherDashboard';
import { StaffDashboard } from './components/StaffDashboard';
import { StudentRepDashboard } from './components/StudentRepDashboard';
import InteractiveConstellation from './components/InteractiveConstellation';
import { useSupabaseData } from './hooks/useSupabaseData';
import * as supabaseServices from './lib/supabase-services';

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
    
    // Usar hook de Supabase para cargar datos
    const {
        loading: dataLoading,
        error: dataError,
        users,
        setUsers,
        attendanceRecords,
        setAttendanceRecords,
        grades,
        setGrades,
        newsItems,
        setNewsItems,
        privateMessages,
        setPrivateMessages,
        notifications,
        setNotifications,
        forumThreads,
        setForumThreads,
        forumReplies,
        setForumReplies,
        calendarEvents: customEvents,
        setCalendarEvents: setCustomEvents,
        studentRepEvents,
        setStudentRepEvents,
        eventParticipants,
        setEventParticipants,
        loadNotifications,
        refreshAttendance,
        refreshNews,
        refreshMessages,
        refreshForumThreads,
        refreshForumReplies,
        refreshCalendarEvents,
        refreshStudentRepEvents
    } = useSupabaseData();
    
    // Estados locales (aún no migrados a Supabase o datos que no requieren persistencia)
    const [userProfiles, setUserProfiles] = useState<Record<number, UserProfileData>>({});
    const [userNotes, setUserNotes] = useState<Record<number, Note[]>>({});
    const [planificaciones, setPlanificaciones] = useState<Planificacion[]>(INITIAL_PLANIFICACIONES);
    const [materials, setMaterials] = useState<Material[]>(INITIAL_MATERIAL_DIDACTICO);
    const [dailyTasks, setDailyTasks] = useState<DailyTask[]>(INITIAL_DAILY_TASKS);
    const [maintenanceHistory, setMaintenanceHistory] = useState<MaintenanceHistoryItem[]>(INITIAL_MAINTENANCE_HISTORY);
    const [installations, setInstallations] = useState<Installation[]>(INITIAL_INSTALLATIONS);
    const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS);
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

    // Cargar notificaciones cuando el usuario cambia
    useEffect(() => {
        if (currentUser) {
            loadNotifications(currentUser.id);
        }
    }, [currentUser, loadNotifications]);

    // Handler functions actualizadas para usar Supabase
    const handleLogin = (user: User) => {
        setCurrentUser(user);
        loadNotifications(user.id);
    };
    
    const handleRegister = async (user: User) => {
        try {
            const newUser = await supabaseServices.createUser(user);
            setUsers(prev => [...prev, newUser]);
            setCurrentUser(newUser);
            loadNotifications(newUser.id);
        } catch (error) {
            console.error('Error registering user:', error);
        }
    };
    
    const handleLogout = () => {
        setCurrentUser(null);
        setNotifications([]);
    };
    
    const handleUpdateProfile = (userId: number, data: UserProfileData) => {
        setUserProfiles(prev => ({ ...prev, [userId]: data }));
    };
    
    const handleUpdateNotes = (notes: Note[]) => {
        if (currentUser) {
            setUserNotes(prev => ({...prev, [currentUser.id]: notes}));
        }
    };
    
    const handleAddNotification = async (notificationData: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
        try {
            const newNotification = await supabaseServices.createNotification(notificationData);
            setNotifications(prev => [newNotification, ...prev]);
        } catch (error) {
            console.error('Error creating notification:', error);
            // Fallback local si falla Supabase
            const fallbackNotification: Notification = {
                ...notificationData,
                id: `notif-${Date.now()}`,
                timestamp: new Date().toISOString(),
                read: false,
            };
            setNotifications(prev => [fallbackNotification, ...prev]);
        }
    };
    
    const handleAddEvent = async (event: Omit<CalendarEvent, 'id'>) => {
        try {
            const newEvent = await supabaseServices.createCalendarEvent(event);
            setCustomEvents(prev => [...prev, newEvent]);
            refreshCalendarEvents();
        } catch (error) {
            console.error('Error creating event:', error);
            // Fallback local
            setCustomEvents(prev => [...prev, {...event, id: `custom-${Date.now()}`}]);
        }
    };
    
    const handleJoinEvent = async (eventId: string, userId: number) => {
        try {
            await supabaseServices.joinEvent(eventId, userId);
            const currentParticipants = eventParticipants[eventId] || [];
            if (!currentParticipants.includes(userId)) {
                setEventParticipants(prev => ({ ...prev, [eventId]: [...currentParticipants, userId] }));
                
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
                        });
                    });
                }
            }
        } catch (error) {
            console.error('Error joining event:', error);
        }
    };

    const handleAddStudentRepClaim = async (claimData: Omit<StudentRepClaim, 'id' | 'authorId' | 'timestamp' | 'status'>) => {
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
                type: NotificationType.ANNOUNCEMENT,
                text: 'Nuevo reclamo/sugerencia recibido',
                details: `Categoría: ${newClaim.category}`
            });
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
        markNotificationsAsRead: async (userId: number) => {
            try {
                await supabaseServices.markNotificationsAsRead(userId);
                setNotifications(prev => prev.map(n => n.userId === userId ? {...n, read: true} : n));
            } catch (error) {
                console.error('Error marking notifications as read:', error);
                // Fallback local
                setNotifications(prev => prev.map(n => n.userId === userId ? {...n, read: true} : n));
            }
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
                sendPrivateMessage={async (senderId, receiverId, text) => {
                    try {
                        const newMessage = await supabaseServices.createPrivateMessage({ senderId, receiverId, text });
                        setPrivateMessages(p => [newMessage, ...p]);
                        refreshMessages();
                    } catch (error) {
                        console.error('Error sending message:', error);
                        // Fallback local
                        setPrivateMessages(p => [...p, {id: `msg-${Date.now()}`, senderId, receiverId, text, timestamp: new Date().toISOString(), read: false}]);
                    }
                }}
                markMessagesAsRead={async (readerId, chatterId) => {
                    try {
                        await supabaseServices.markMessagesAsRead(readerId, chatterId);
                        setPrivateMessages(p => p.map(m => (m.receiverId === readerId && m.senderId === chatterId ? {...m, read: true} : m)));
                    } catch (error) {
                        console.error('Error marking messages as read:', error);
                        setPrivateMessages(p => p.map(m => (m.receiverId === readerId && m.senderId === chatterId ? {...m, read: true} : m)));
                    }
                }}
                requestJustification={async (recordId, reason, file) => {
                    try {
                        await supabaseServices.updateAttendanceRecord(recordId, {
                            status: AttendanceStatus.PENDING_JUSTIFICATION,
                            justificationReason: reason,
                            justificationFile: file
                        });
                        setAttendanceRecords(prev => prev.map(r => r.id === recordId ? {...r, status: AttendanceStatus.PENDING_JUSTIFICATION, justificationReason: reason, justificationFile: file} : r));
                        refreshAttendance();
                    } catch (error) {
                        console.error('Error requesting justification:', error);
                        setAttendanceRecords(prev => prev.map(r => r.id === recordId ? {...r, status: AttendanceStatus.PENDING_JUSTIFICATION, justificationReason: reason, justificationFile: file} : r));
                    }
                }}
                onVerifyQRAttendance={async () => "Not implemented yet"}
                forumThreads={forumThreads}
                forumReplies={forumReplies}
                onAddForumThread={async (thread) => {
                    try {
                        const newThread = await supabaseServices.createForumThread(thread);
                        setForumThreads(prev => [newThread, ...prev]);
                        refreshForumThreads();
                    } catch (error) {
                        console.error('Error creating forum thread:', error);
                        setForumThreads(prev => [{...thread, id: `thread-${Date.now()}`, timestamp: new Date().toISOString(), status: ForumThreadStatus.PENDING}, ...prev]);
                    }
                }}
                onAddForumReply={async (reply) => {
                    try {
                        const newReply = await supabaseServices.createForumReply(reply);
                        setForumReplies(prev => [...prev, newReply]);
                        refreshForumReplies();
                    } catch (error) {
                        console.error('Error creating forum reply:', error);
                        setForumReplies(prev => [...prev, {...reply, id: `reply-${Date.now()}`, timestamp: new Date().toISOString()}]);
                    }
                }}
                onEditForumThread={async (threadId, title, content) => {
                    try {
                        await supabaseServices.updateForumThread(threadId, { title, content, status: ForumThreadStatus.PENDING });
                        setForumThreads(prev => prev.map(t => t.id === threadId ? {...t, title, content, status: ForumThreadStatus.PENDING} : t));
                        refreshForumThreads();
                    } catch (error) {
                        console.error('Error updating forum thread:', error);
                        setForumThreads(prev => prev.map(t => t.id === threadId ? {...t, title, content, status: ForumThreadStatus.PENDING} : t));
                    }
                }}
                onDeleteForumThread={async (threadId) => {
                    try {
                        await supabaseServices.deleteForumThread(threadId);
                        setForumThreads(prev => prev.filter(t => t.id !== threadId));
                        refreshForumThreads();
                    } catch (error) {
                        console.error('Error deleting forum thread:', error);
                        setForumThreads(prev => prev.filter(t => t.id !== threadId));
                    }
                }}
                onDeleteForumReply={async (replyId) => {
                    try {
                        await supabaseServices.deleteForumReply(replyId);
                        setForumReplies(prev => prev.filter(r => r.id !== replyId));
                        refreshForumReplies();
                    } catch (error) {
                        console.error('Error deleting forum reply:', error);
                        setForumReplies(prev => prev.filter(r => r.id !== replyId));
                    }
                }}
                onToggleLockThread={async (threadId) => {
                    try {
                        const thread = forumThreads.find(t => t.id === threadId);
                        if (thread) {
                            await supabaseServices.updateForumThread(threadId, { isLocked: !thread.isLocked });
                            setForumThreads(prev => prev.map(t => t.id === threadId ? {...t, isLocked: !t.isLocked} : t));
                            refreshForumThreads();
                        }
                    } catch (error) {
                        console.error('Error toggling thread lock:', error);
                        setForumThreads(prev => prev.map(t => t.id === threadId ? {...t, isLocked: !t.isLocked} : t));
                    }
                }}
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
                addAttendanceRecord={async (updates, date, subjectId, actorRole) => {
                    try {
                        const newRecords = updates.map(u => ({ id: `att-${u.studentId}-${subjectId}-${date}`, studentId: u.studentId, subjectId, date, status: u.status }));
                        // Crear registros en Supabase
                        for (const record of newRecords) {
                            await supabaseServices.createAttendanceRecord(record);
                        }
                        setAttendanceRecords(prev => [...prev.filter(r => !(r.date === date && r.subjectId === subjectId && newRecords.some(nr => nr.studentId === r.studentId))), ...newRecords]);
                        refreshAttendance();
                    } catch (error) {
                        console.error('Error adding attendance records:', error);
                        const newRecords = updates.map(u => ({ id: `att-${u.studentId}-${subjectId}-${date}`, studentId: u.studentId, subjectId, date, status: u.status }));
                        setAttendanceRecords(prev => [...prev.filter(r => !(r.date === date && r.subjectId === subjectId && newRecords.some(nr => nr.studentId === r.studentId))), ...newRecords]);
                    }
                }}
                updateAttendanceStatus={async (recordId, newStatus) => {
                    try {
                        await supabaseServices.updateAttendanceRecord(recordId, { status: newStatus });
                        setAttendanceRecords(prev => prev.map(r => r.id === recordId ? {...r, status: newStatus} : r));
                        refreshAttendance();
                    } catch (error) {
                        console.error('Error updating attendance status:', error);
                        setAttendanceRecords(prev => prev.map(r => r.id === recordId ? {...r, status: newStatus} : r));
                    }
                }}
                resolveJustificationRequest={async (recordId, approved) => {
                    try {
                        await supabaseServices.updateAttendanceRecord(recordId, {
                            status: approved ? AttendanceStatus.JUSTIFIED : AttendanceStatus.ABSENT,
                            justificationReason: undefined,
                            justificationFile: undefined
                        });
                        setAttendanceRecords(prev => prev.map(r => r.id === recordId ? {...r, status: approved ? AttendanceStatus.JUSTIFIED : AttendanceStatus.ABSENT, justificationReason: undefined, justificationFile: undefined} : r));
                        refreshAttendance();
                    } catch (error) {
                        console.error('Error resolving justification:', error);
                        setAttendanceRecords(prev => prev.map(r => r.id === recordId ? {...r, status: approved ? AttendanceStatus.JUSTIFIED : AttendanceStatus.ABSENT, justificationReason: undefined, justificationFile: undefined} : r));
                    }
                }}
                subjects={SUBJECTS}
                newsItems={newsItems}
                addNewsItem={async (item) => {
                    try {
                        const newItem = await supabaseServices.createNewsItem(item);
                        setNewsItems(prev => [newItem, ...prev]);
                        refreshNews();
                    } catch (error) {
                        console.error('Error creating news item:', error);
                        setNewsItems(prev => [{...item, id: `news-${Date.now()}`}, ...prev]);
                    }
                }}
                deleteNewsItem={async (id) => {
                    try {
                        await supabaseServices.deleteNewsItem(id);
                        setNewsItems(prev => prev.filter(item => item.id !== id));
                        refreshNews();
                    } catch (error) {
                        console.error('Error deleting news item:', error);
                        setNewsItems(prev => prev.filter(item => item.id !== id));
                    }
                }}
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
                addAttendanceRecord={async (updates, date, subjectId, actorRole) => {
                    try {
                        const newRecords = updates.map(u => ({ id: `att-${u.studentId}-${subjectId}-${date}`, studentId: u.studentId, subjectId, date, status: u.status }));
                        // Crear registros en Supabase
                        for (const record of newRecords) {
                            await supabaseServices.createAttendanceRecord(record);
                        }
                        setAttendanceRecords(prev => [...prev.filter(r => !(r.date === date && r.subjectId === subjectId && newRecords.some(nr => nr.studentId === r.studentId))), ...newRecords]);
                        refreshAttendance();
                    } catch (error) {
                        console.error('Error adding attendance records:', error);
                        const newRecords = updates.map(u => ({ id: `att-${u.studentId}-${subjectId}-${date}`, studentId: u.studentId, subjectId, date, status: u.status }));
                        setAttendanceRecords(prev => [...prev.filter(r => !(r.date === date && r.subjectId === subjectId && newRecords.some(nr => nr.studentId === r.studentId))), ...newRecords]);
                    }
                }}
                grades={grades}
                onUpdateGrades={async (studentId, subjectId, newGrades) => {
                  try {
                    const otherGrades = grades.filter(g => g.studentId !== studentId || g.subjectId !== subjectId);
                    const updatedGradesForStudent = newGrades.map(ng => ({
                      id: `g-${studentId}-${ng.type}-${subjectId}`,
                      studentId,
                      subjectId,
                      type: ng.type,
                      value: ng.value
                    }));
                    await supabaseServices.upsertGrades(updatedGradesForStudent);
                    setGrades([...otherGrades, ...updatedGradesForStudent]);
                  } catch (error) {
                    console.error('Error updating grades:', error);
                    const otherGrades = grades.filter(g => g.studentId !== studentId || g.subjectId !== subjectId);
                    const updatedGradesForStudent = newGrades.map(ng => ({
                      id: `g-${studentId}-${ng.type}-${subjectId}`,
                      studentId,
                      subjectId,
                      type: ng.type,
                      value: ng.value
                    }));
                    setGrades([...otherGrades, ...updatedGradesForStudent]);
                  }
                }}
                newsItems={newsItems}
                addNewsItem={async (item) => {
                    try {
                        const newItem = await supabaseServices.createNewsItem(item);
                        setNewsItems(prev => [newItem, ...prev]);
                        refreshNews();

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
                    } catch (error) {
                        console.error('Error creating news item:', error);
                        const fallbackItem = { ...item, id: `news-${Date.now()}` };
                        setNewsItems(prev => [fallbackItem, ...prev]);
                    }
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