import React, { useState, useMemo, useEffect, useRef } from 'react';
import { User, AttendanceRecord, AttendanceStatus, Role, Subject, UserProfileData, Note, Grade, NewsItem, ClassSchedule, GradeType, CalendarEvent, Planificacion, Material, Notification, StudentRepForumThread, StudentRepForumReply, StudentRepForumCategory, StudentRepEvent, StudentRepEventType, StudentRepClaim, StudentRepClaimStatus, JustificationFile, StudentRepClaimCategory } from '../types';
import { BookOpenIcon, MessageSquareIcon, CalendarIcon, CheckIcon, BellIcon, UserIcon, ChevronDownIcon, LogoutIcon, AppearanceIcon, ChartBarIcon, FileTextIcon, ClipboardListIcon, FolderIcon, ClockIcon, DownloadIcon, XCircleIcon, MinusCircleIcon, SettingsIcon, CheckCircleIcon, UsersIcon, ArrowLeftIcon, MegaphoneIcon, SendIcon, SparklesIcon, FootballIcon, PlusCircleIcon } from './Icons';
import { Theme, BorderStyle, FontStyle } from '../App';
import { NotificationPanel } from './NotificationPanel';
import { ProfileView } from './ProfileView';
import { AgendaView } from './AgendaView';
import { AppearanceView } from './AppearanceModal';
import { PlanificacionesView } from './PlanificacionesView';
import { ReportesView } from './ReportesView';
import { MaterialDidacticoView } from './MaterialDidacticoView';
import { HorariosView } from './HorariosView';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface DashboardProps {
  user: User;
  onLogout: () => void;
  allUsers: User[];
  userProfiles: Record<number, UserProfileData>;
  onUpdateProfile: (userId: number, data: UserProfileData) => void;
  userNotes: Note[];
  onUpdateNotes: (notes: Note[]) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  borderStyle: BorderStyle;
  setBorderStyle: (style: BorderStyle) => void;
  fontStyle: FontStyle;
  setFontStyle: (style: FontStyle) => void;
  notifications: any[];
  markNotificationsAsRead: (userId: number) => void;
}

interface TeacherDashboardProps extends DashboardProps {
    subjects: Subject[];
    students: User[];
    attendanceRecords: AttendanceRecord[];
    addAttendanceRecord: (updates: { studentId: number; status: AttendanceStatus }[], date: string, subjectId: string, actorRole: Role) => void;
    grades: Grade[];
    onUpdateGrades: (studentId: number, subjectId: string, newGrades: { type: GradeType, value: string }[]) => void;
    newsItems: NewsItem[];
    addNewsItem: (item: Omit<NewsItem, 'id'>) => void;
    classSchedule: ClassSchedule[];
    customEvents: CalendarEvent[];
    onAddEvent: (event: Omit<CalendarEvent, 'id'>) => void;
    planificaciones: Planificacion[];
    onUpdatePlanificaciones: (planificaciones: Planificacion[]) => void;
    materials: Material[];
    onUpdateMaterials: (materials: Material[]) => void;
    addNotification: (notificationData: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
    studentRepThreads: StudentRepForumThread[];
    studentRepReplies: StudentRepForumReply[];
    onUpdateStudentRepReplies: (replies: StudentRepForumReply[] | ((prev: StudentRepForumReply[]) => StudentRepForumReply[])) => void;
    studentRepEvents: StudentRepEvent[];
    eventParticipants: Record<string, number[]>;
    onJoinEvent: (eventId: string, userId: number) => void;
    studentRepClaims: StudentRepClaim[];
    onAddStudentRepClaim: (claim: Omit<StudentRepClaim, 'id' | 'authorId' | 'timestamp' | 'status'>) => void;
}

const TimeAgo: React.FC<{ date: string }> = ({ date }) => {
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diffInSeconds < 60) return <span>hace {diffInSeconds}s</span>;
    if (diffInSeconds < 3600) return <span>hace {Math.floor(diffInSeconds / 60)}m</span>;
    if (diffInSeconds < 86400) return <span>hace {Math.floor(diffInSeconds / 3600)}h</span>;
    return <span>hace {Math.floor(diffInSeconds / 86400)}d</span>;
};

const ReclamoModal: React.FC<{
    onClose: () => void;
    onAddClaim: (claim: Omit<StudentRepClaim, 'id' | 'authorId' | 'timestamp' | 'status'>) => void;
}> = ({ onClose, onAddClaim }) => {
    const [category, setCategory] = useState<StudentRepClaimCategory>('sugerencia');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.size > 5 * 1024 * 1024) { setError('El archivo no debe superar los 5MB.'); return; }
            setError('');
            setFile(selectedFile);
        }
    };
    
    const fileToBase64 = (file: File): Promise<JustificationFile> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const base64Content = (reader.result as string).split(',')[1];
                resolve({ name: file.name, type: file.type, content: base64Content });
            };
            reader.onerror = error => reject(error);
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!description.trim()) { setError('Por favor, describe tu reclamo o sugerencia.'); return; }
        
        let justificationFile: JustificationFile | undefined = undefined;
        if (file) {
            justificationFile = await fileToBase64(file);
        }
        
        onAddClaim({ category, description, file: justificationFile });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in" style={{ animationDuration: '0.3s' }} onClick={onClose}>
            <div className="glass-card w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-[--color-text-primary] mb-4">Enviar Reclamo o Sugerencia</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-[--color-text-secondary] mb-1">Categoría</label>
                        <select id="category" value={category} onChange={e => setCategory(e.target.value as StudentRepClaimCategory)} className="input-styled w-full capitalize">
                            <option value="sugerencia">Sugerencia</option>
                            <option value="infraestructura">Infraestructura</option>
                            <option value="académico">Académico</option>
                            <option value="administrativo">Administrativo</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-[--color-text-secondary] mb-1">Descripción</label>
                        <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={5} className="input-styled w-full" required placeholder="Describe detalladamente tu reclamo o sugerencia." />
                    </div>
                    <div>
                        <label htmlFor="file" className="block text-sm font-medium text-[--color-text-secondary] mb-1">Adjuntar Archivo (Opcional)</label>
                        <input type="file" id="file" onChange={handleFileChange} className="w-full text-sm text-[--color-text-secondary] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[--color-accent] file:text-white hover:file:bg-[--color-accent-hover] transition-colors" />
                        {file && <p className="text-xs text-[--color-text-secondary] mt-1">Archivo: {file.name}</p>}
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="btn btn-secondary">Cancelar</button>
                        <button type="submit" className="btn btn-primary">Enviar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ReclamosView: React.FC<{
    currentUser: User;
    claims: StudentRepClaim[];
    onAddClaim: (claim: Omit<StudentRepClaim, 'id' | 'authorId' | 'timestamp' | 'status'>) => void;
}> = ({ currentUser, claims, onAddClaim }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const statusPill: Record<StudentRepClaimStatus, { text: string, classes: string }> = {
        'pendiente': { text: 'Pendiente', classes: 'bg-yellow-500/20 text-yellow-700' },
        'en revisión': { text: 'En Revisión', classes: 'bg-blue-500/20 text-blue-700' },
        'resuelto': { text: 'Resuelto', classes: 'bg-green-500/20 text-green-700' },
        'archivado': { text: 'Archivado', classes: 'bg-gray-500/20 text-gray-600' },
    };
    
    return (
        <div className="animate-fade-in-up">
            <button onClick={() => setIsModalOpen(true)} className="btn btn-primary w-full mb-6 py-3">
                <PlusCircleIcon className="w-5 h-5"/> Enviar Nuevo Reclamo o Sugerencia
            </button>
            <div className="space-y-4">
                <h3 className="text-xl font-bold text-[--color-text-primary]">Mis Reclamos Enviados</h3>
                {claims.length > 0 ? (
                    claims.map(claim => (
                        <div key={claim.id} className="solid-card p-5">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-xs font-bold uppercase text-[--color-text-secondary]">{claim.category}</p>
                                    <p className="text-[--color-text-primary] mt-1">{claim.description}</p>
                                </div>
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${statusPill[claim.status].classes}`}>
                                    {statusPill[claim.status].text}
                                </span>
                            </div>
                             <p className="text-xs text-[--color-text-secondary] mt-3"><TimeAgo date={claim.timestamp} /></p>
                        </div>
                    ))
                ) : (
                    <div className="solid-card p-8 text-center text-[--color-text-secondary]">
                        <p>Aún no has enviado ningún reclamo.</p>
                    </div>
                )}
            </div>
            {isModalOpen && <ReclamoModal onClose={() => setIsModalOpen(false)} onAddClaim={onAddClaim} />}
        </div>
    );
};

const eventTypeIcons: Record<StudentRepEventType, React.ReactNode> = {
    'académico': <BookOpenIcon className="w-6 h-6" />,
    'cultural': <SparklesIcon className="w-6 h-6" />,
    'deportivo': <FootballIcon className="w-6 h-6" />,
    'reunión': <UsersIcon className="w-6 h-6" />,
};

const EventDetailModal: React.FC<{
    event: StudentRepEvent;
    participants: number;
    isParticipating: boolean;
    onClose: () => void;
    onParticipate: () => void;
}> = ({ event, participants, isParticipating, onClose, onParticipate }) => {
    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in" style={{ animationDuration: '0.3s' }} onClick={onClose}>
            <div className="glass-card w-full max-w-md p-6 relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-[--color-text-primary] transition-colors text-3xl leading-none">&times;</button>
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-[--color-secondary] rounded-lg text-[--color-accent]">
                        {eventTypeIcons[event.type]}
                    </div>
                    <div>
                        <p className="font-semibold capitalize text-sm text-[--color-text-secondary]">{event.type}</p>
                        <h2 className="text-2xl font-bold text-[--color-text-primary] leading-tight">{event.title}</h2>
                    </div>
                </div>

                <div className="space-y-2 text-[--color-text-secondary] text-sm my-4">
                    <p className="flex items-center gap-2"><CalendarIcon className="w-5 h-5"/> {new Date(event.date + 'T' + (event.time || '00:00')).toLocaleString('es-AR', { dateStyle: 'full', timeStyle: 'short' })} hs</p>
                    {event.location && <p className="flex items-center gap-2"><UserIcon className="w-5 h-5"/> {event.location}</p>}
                    <p className="flex items-center gap-2"><UsersIcon className="w-5 h-5"/> {participants} confirmado{participants !== 1 && 's'}</p>
                </div>
                
                <p className="text-[--color-text-primary] my-4">{event.description}</p>
                
                <button
                    onClick={onParticipate}
                    disabled={isParticipating}
                    className="btn btn-primary w-full text-lg py-3 mt-4"
                >
                    {isParticipating ? '¡Ya estás inscripto!' : '¡Quiero participar!'}
                </button>
            </div>
        </div>
    );
};

const EventosView: React.FC<{
    events: StudentRepEvent[];
    participants: Record<string, number[]>;
    currentUser: User;
    onJoinEvent: (eventId: string, studentId: number) => void;
}> = ({ events, participants, currentUser, onJoinEvent }) => {
    const [filter, setFilter] = useState<'Todos' | StudentRepEventType>('Todos');
    const [selectedEvent, setSelectedEvent] = useState<StudentRepEvent | null>(null);

    const filteredEvents = useMemo(() => {
        return (filter === 'Todos' ? events : events.filter(e => e.type === filter))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [events, filter]);

    return (
        <div className="animate-fade-in-up">
            <div className="flex flex-wrap items-center gap-2 p-1 bg-[--color-secondary] rounded-lg mb-6 self-start">
                <button onClick={() => setFilter('Todos')} className={`py-1.5 px-4 font-semibold text-sm rounded-md transition-all ${filter === 'Todos' ? 'bg-[--color-primary] shadow text-[--color-accent]' : 'text-[--color-text-secondary]'}`}>Todos</button>
                {(Object.keys(eventTypeIcons) as StudentRepEventType[]).map(type => (
                     <button key={type} onClick={() => setFilter(type)} className={`py-1.5 px-4 font-semibold text-sm rounded-md transition-all capitalize ${filter === type ? 'bg-[--color-primary] shadow text-[--color-accent]' : 'text-[--color-text-secondary]'}`}>{type}</button>
                ))}
            </div>
            <div className="space-y-4">
                {filteredEvents.map(event => {
                    const eventParticipants = participants[event.id] || [];
                    const isParticipating = eventParticipants.includes(currentUser.id);
                    return (
                        <div key={event.id} className="solid-card p-5">
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="mt-1 text-[--color-accent]">{eventTypeIcons[event.type]}</div>
                                    <div>
                                        <h3 className="font-bold text-lg text-[--color-text-primary]">{event.title}</h3>
                                        <p className="text-sm text-[--color-text-secondary]">{event.location}</p>
                                        <div className="flex items-center gap-2 mt-2 text-sm">
                                            {isParticipating ? (
                                                <span className="flex items-center gap-1 font-semibold text-green-600">
                                                    <CheckCircleIcon className="w-5 h-5"/> Asistirás
                                                </span>
                                            ) : (
                                                 <span className="flex items-center gap-1 text-[--color-text-secondary]">
                                                    <UsersIcon className="w-5 h-5"/> {eventParticipants.length} Asistirán
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right shrink-0 self-center sm:self-auto w-full sm:w-auto flex sm:flex-col items-center justify-between">
                                    <div className="text-right">
                                        <p className="font-bold text-lg text-[--color-text-primary]">{new Date(event.date + 'T00:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}</p>
                                        <p className="text-sm text-[--color-text-secondary]">{event.time}</p>
                                    </div>
                                    <button onClick={() => setSelectedEvent(event)} className="btn btn-outline text-sm mt-2">Ver detalles</button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            {selectedEvent && (
                <EventDetailModal 
                    event={selectedEvent}
                    participants={(participants[selectedEvent.id] || []).length}
                    isParticipating={(participants[selectedEvent.id] || []).includes(currentUser.id)}
                    onClose={() => setSelectedEvent(null)}
                    onParticipate={() => onJoinEvent(selectedEvent.id, currentUser.id)}
                />
            )}
        </div>
    );
};

const StudentRepForumsView: React.FC<{
  currentUser: User;
  allUsers: User[];
  threads: StudentRepForumThread[];
  replies: StudentRepForumReply[];
  onAddReply: (reply: Omit<StudentRepForumReply, 'id' | 'timestamp'>) => void;
}> = ({ currentUser, allUsers, threads, replies, onAddReply }) => {
    const [filter, setFilter] = useState<'all' | StudentRepForumCategory>('all');
    const [selectedThread, setSelectedThread] = useState<StudentRepForumThread | null>(null);
    const [newReply, setNewReply] = useState('');
    
    const userMap = useMemo(() => new Map(allUsers.map(u => [u.id, u.name])), [allUsers]);

    const filteredThreads = useMemo(() => {
        return (filter === 'all' ? threads : threads.filter(t => t.category === filter))
            .sort((a, b) => (b.isPinned ? 1 : -1) - (a.isPinned ? 1 : -1) || new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [threads, filter]);
    
    const handleAddReply = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newReply.trim() || !selectedThread) return;
        onAddReply({
            threadId: selectedThread.id,
            authorId: currentUser.id,
            content: newReply,
        });
        setNewReply('');
    };

    if (selectedThread) {
        const threadReplies = replies.filter(r => r.threadId === selectedThread.id).sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        return (
            <div className="animate-fade-in">
                <button onClick={() => setSelectedThread(null)} className="btn btn-secondary mb-6"><ArrowLeftIcon className="w-5 h-5"/> Volver al foro</button>
                <div className="solid-card p-6 mb-6">
                    <h2 className="text-2xl font-bold text-[--color-text-primary]">{selectedThread.title}</h2>
                    <p className="text-sm text-[--color-text-secondary] mt-1">por {userMap.get(selectedThread.authorId)} - <TimeAgo date={selectedThread.timestamp}/></p>
                    <p className="mt-4 whitespace-pre-wrap text-[--color-text-primary]">{selectedThread.content}</p>
                </div>
                <h3 className="text-xl font-bold mb-4">Respuestas ({threadReplies.length})</h3>
                <div className="space-y-4">
                    {threadReplies.map(reply => (
                        <div key={reply.id} className="solid-card p-4 flex gap-4">
                            <UserIcon className="w-8 h-8 rounded-full bg-[--color-secondary] p-1 text-[--color-text-secondary] shrink-0"/>
                            <div>
                                <p className="font-semibold text-[--color-text-primary]">{userMap.get(reply.authorId)}</p>
                                <p className="text-sm text-[--color-text-secondary]">{reply.content}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <form onSubmit={handleAddReply} className="solid-card p-4 mt-6 flex gap-2">
                    <input type="text" value={newReply} onChange={e => setNewReply(e.target.value)} placeholder="Escribe un comentario..." className="input-styled w-full" />
                    <button type="submit" className="btn btn-primary"><SendIcon className="w-5 h-5"/></button>
                </form>
            </div>
        );
    }
    
    return (
        <div className="animate-fade-in-up">
             <div className="flex flex-wrap items-center gap-2 p-1 bg-[--color-secondary] rounded-lg mb-6 self-start">
                <button onClick={() => setFilter('all')} className={`py-1.5 px-4 font-semibold text-sm rounded-md transition-all ${filter === 'all' ? 'bg-[--color-primary] shadow text-[--color-accent]' : 'text-[--color-text-secondary]'}`}>Todos</button>
                <button onClick={() => setFilter('general')} className={`py-1.5 px-4 font-semibold text-sm rounded-md transition-all ${filter === 'general' ? 'bg-[--color-primary] shadow text-[--color-accent]' : 'text-[--color-text-secondary]'}`}>General</button>
                <button onClick={() => setFilter('propuestas')} className={`py-1.5 px-4 font-semibold text-sm rounded-md transition-all ${filter === 'propuestas' ? 'bg-[--color-primary] shadow text-[--color-accent]' : 'text-[--color-text-secondary]'}`}>Propuestas</button>
                <button onClick={() => setFilter('eventos')} className={`py-1.5 px-4 font-semibold text-sm rounded-md transition-all ${filter === 'eventos' ? 'bg-[--color-primary] shadow text-[--color-accent]' : 'text-[--color-text-secondary]'}`}>Eventos</button>
            </div>
            <div className="space-y-4">
                {filteredThreads.map(thread => (
                    <button key={thread.id} onClick={() => setSelectedThread(thread)} className="solid-card p-5 w-full text-left transform hover:-translate-y-1 transition-transform">
                        <div className="flex gap-4">
                            <UserIcon className="w-10 h-10 rounded-full bg-[--color-secondary] p-2 text-[--color-text-secondary] shrink-0"/>
                            <div>
                                <h3 className="font-bold text-lg text-[--color-text-primary]">{thread.title}</h3>
                                <p className="text-xs text-[--color-text-secondary]">por {userMap.get(thread.authorId)} - <TimeAgo date={thread.timestamp}/></p>
                                <p className="text-sm text-[--color-text-secondary] mt-2 line-clamp-2">{thread.content}</p>
                            </div>
                        </div>
                         <div className="flex justify-end items-center gap-2 text-sm text-[--color-text-secondary] mt-2">
                            <MessageSquareIcon className="w-4 h-4"/> {replies.filter(r => r.threadId === thread.id).length} respuestas
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

const CommunityView: React.FC<{
  currentUser: User;
  allUsers: User[];
  studentRepEvents: StudentRepEvent[];
  eventParticipants: Record<string, number[]>;
  onJoinEvent: (eventId: string, userId: number) => void;
  threads: StudentRepForumThread[];
  replies: StudentRepForumReply[];
  onAddReply: (reply: Omit<StudentRepForumReply, 'id' | 'timestamp'>) => void;
  studentRepClaims: StudentRepClaim[];
  subjects: Subject[];
  students: User[];
  onAddStudentRepClaim: (claim: Omit<StudentRepClaim, 'id' | 'authorId' | 'timestamp' | 'status'>) => void;
}> = ({ currentUser, allUsers, studentRepEvents, eventParticipants, onJoinEvent, threads, replies, onAddReply, studentRepClaims, subjects, students, onAddStudentRepClaim }) => {
    const [activeTab, setActiveTab] = useState<'eventos' | 'foros' | 'reclamos'>('eventos');

    return (
        <div className="animate-fade-in-up">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-[--color-text-primary]">Comunidad</h2>
                    <p className="text-[--color-text-secondary]">Eventos y foros del Centro de Estudiantes.</p>
                </div>
            </div>

            <div className="flex items-center gap-2 p-1 bg-[--color-secondary] rounded-lg mb-6 self-start">
                <button onClick={() => setActiveTab('eventos')} className={`py-1.5 px-4 font-semibold text-sm rounded-md transition-all ${activeTab === 'eventos' ? 'bg-[--color-primary] shadow text-[--color-accent]' : 'text-[--color-text-secondary]'}`}>Eventos</button>
                <button onClick={() => setActiveTab('foros')} className={`py-1.5 px-4 font-semibold text-sm rounded-md transition-all ${activeTab === 'foros' ? 'bg-[--color-primary] shadow text-[--color-accent]' : 'text-[--color-text-secondary]'}`}>Foros</button>
                <button onClick={() => setActiveTab('reclamos')} className={`py-1.5 px-4 font-semibold text-sm rounded-md transition-all ${activeTab === 'reclamos' ? 'bg-[--color-primary] shadow text-[--color-accent]' : 'text-[--color-text-secondary]'}`}>Reclamos</button>
            </div>

            {activeTab === 'eventos' ? (
                <EventosView
                    events={studentRepEvents}
                    participants={eventParticipants}
                    currentUser={currentUser}
                    onJoinEvent={onJoinEvent}
                />
            ) : activeTab === 'foros' ? (
                <StudentRepForumsView
                    currentUser={currentUser}
                    allUsers={allUsers}
                    threads={threads}
                    replies={replies}
                    onAddReply={onAddReply}
                />
            ) : (
                <ReclamosView 
                    currentUser={currentUser}
                    claims={studentRepClaims.filter(c => c.authorId === currentUser.id)}
                    onAddClaim={onAddStudentRepClaim}
                />
            )}
        </div>
    );
};


interface WelcomeBannerProps {
  user: User;
  subjects: Subject[];
  students: User[];
  classSchedule: ClassSchedule[];
  unreadNotifications: number;
  onBellClick: () => void;
  onNavigate: (view: string, context?: any) => void;
}

const WelcomeBanner: React.FC<WelcomeBannerProps> = ({ user, subjects, students, classSchedule, unreadNotifications, onBellClick, onNavigate }) => {
    
    const nextClass = useMemo(() => {
        const now = new Date();
        const dayOfWeek = now.getDay() === 0 ? 7 : now.getDay(); // Sunday - 7, Monday - 1
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

        const mySubjectIds = new Set(subjects.map(s => s.id));

        const todayClasses = classSchedule
            .filter(c => mySubjectIds.has(c.subjectId) && c.dayOfWeek === dayOfWeek)
            .sort((a,b) => a.startTime.localeCompare(b.startTime));
            
        const upcomingClass = todayClasses.find(c => c.startTime > currentTime);

        if(upcomingClass) {
            const subject = subjects.find(s => s.id === upcomingClass.subjectId);
            return {
                subjectName: subject?.name || 'N/A',
                time: upcomingClass.startTime,
                classroom: upcomingClass.classroom,
            }
        }

        // Check for next days
        for (let i = 1; i <= 7; i++) {
            const nextDay = (dayOfWeek + i -1) % 7 + 1;
            if (nextDay === 7 || nextDay === 6) continue; // Skip weekends
            const daySchedule = classSchedule
                .filter(c => mySubjectIds.has(c.subjectId) && c.dayOfWeek === nextDay)
                .sort((a,b) => a.startTime.localeCompare(b.startTime));
            if (daySchedule.length > 0) {
                const subject = subjects.find(s => s.id === daySchedule[0].subjectId);
                const dayName = new Date();
                dayName.setDate(dayName.getDate() + i);
                const dayString = dayName.toLocaleDateString('es-AR', { weekday: 'long'});

                return {
                    subjectName: subject?.name || 'N/A',
                    time: daySchedule[0].startTime,
                    classroom: `${dayString.charAt(0).toUpperCase() + dayString.slice(1)}`,
                }
            }
        }

        return null;
    }, [classSchedule, subjects]);

    const totalStudents = useMemo(() => {
        const studentIds = new Set<number>();
        subjects.forEach(subject => {
            students
                .filter(s => s.careerId === subject.careerId && (Array.isArray(s.year) ? s.year.includes(subject.year) : s.year === subject.year))
                .forEach(s => studentIds.add(s.id));
        });
        return studentIds.size;
    }, [subjects, students]);

    const stats = [
        { label: "Próxima Clase", value: nextClass ? `${nextClass.subjectName}` : "Sin clases programadas", subtitle: nextClass ? `${nextClass.classroom} a las ${nextClass.time}` : '', icon: <ClockIcon className="w-8 h-8 text-blue-500" />, action: () => onNavigate('agenda') },
        { label: "Materias Asignadas", value: subjects.length, subtitle: `en ${new Set(subjects.map(s=>s.year)).size} año(s)`, icon: <BookOpenIcon className="w-8 h-8 text-green-500" />, action: () => onNavigate('materias_overview') },
        { label: "Total de Alumnos", value: totalStudents, subtitle: 'bajo tu cargo', icon: <UsersIcon className="w-8 h-8 text-yellow-500" />, action: () => onNavigate('alumnos_overview') }
    ];

    return (
        <div className="welcome-banner animate-fade-in relative">
            <button onClick={onBellClick} className="absolute top-6 right-6 p-2 rounded-full hover:bg-black/10 transition-colors z-10" aria-label="Ver notificaciones">
                <BellIcon className="w-6 h-6 text-[--color-text-secondary]" />
                {unreadNotifications > 0 && <span className="absolute top-1 right-1 block h-3 w-3 rounded-full bg-red-500 ring-2 ring-[--color-primary]"><span className="sr-only">{unreadNotifications} notificaciones nuevas</span></span>}
            </button>
            <h1 className="text-4xl font-bold text-[--color-text-primary] mb-2">
              Bienvenido, {user.name.split(' ')[0]}
            </h1>
            <p className="text-lg text-[--color-text-secondary] mb-8">Aquí está el resumen de tus clases para hoy.</p>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.map((stat, index) => (
                    <button
                        key={stat.label}
                        onClick={stat.action}
                        className="glass-card p-4 flex items-center gap-4 animate-fade-in-up text-left w-full transition-transform transform hover:scale-[1.03] focus:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[--color-accent] focus:ring-offset-[--color-background]"
                        style={{animationDelay: `${index * 100 + 100}ms`}}
                    >
                        <div className="p-3 bg-black/5 rounded-full">{stat.icon}</div>
                        <div>
                            <p className="text-sm text-[--color-text-secondary]">{stat.label}</p>
                            <p className={`text-xl font-bold text-[--color-text-primary]`}>{stat.value}</p>
                            {stat.subtitle && <p className="text-xs text-[--color-text-secondary]">{stat.subtitle}</p>}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};


const MateriasView: React.FC<{ subjects: Subject[], students: User[], onNavigate: (view: string, context: any) => void }> = ({ subjects, students, onNavigate }) => {
    return (
        <div className="space-y-8 animate-fade-in-up">
            <div>
                <h2 className="text-3xl font-bold text-[--color-text-primary] mb-4">Mis Materias</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {subjects.map((subject) => (
                        <div key={subject.id} className="glass-card p-6 transform hover:-translate-y-1 transition-transform duration-300">
                            <h3 className="text-xl font-bold text-[--color-accent]">{subject.name}</h3>
                            <p className="text-sm text-[--color-text-secondary] mt-1">{subject.year}° Año - {subject.careerId === 'dev' ? 'Software' : 'Diseño'}</p>
                            <div className="mt-4 flex justify-end gap-2">
                                <button onClick={() => onNavigate('asistencia', subject)} className="btn btn-secondary text-xs">Asistencia</button>
                                <button onClick={() => onNavigate('calificaciones', subject)} className="btn btn-primary text-xs">Calificaciones</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const StudentAttendanceCard: React.FC<{ student: User; status: AttendanceStatus | null; onSetStatus: (status: AttendanceStatus) => void; }> = ({ student, status, onSetStatus }) => {
    const getButtonClass = (buttonStatus: AttendanceStatus) => {
        if (status === buttonStatus) {
            if (status === AttendanceStatus.PRESENT) return 'bg-green-500 text-white scale-110 ring-2 ring-green-400';
            if (status === AttendanceStatus.ABSENT) return 'bg-red-500 text-white scale-110 ring-2 ring-red-400';
            if (status === AttendanceStatus.JUSTIFIED) return 'bg-yellow-500 text-white scale-110 ring-2 ring-yellow-400';
        }
        return 'bg-[--color-secondary] hover:bg-[--color-border] text-[--color-text-primary]';
    };
    return (
        <div className="solid-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
                <p className="font-bold text-lg text-[--color-text-primary]">{student.name}</p>
                <p className="text-sm text-[--color-text-secondary]">{student.email}</p>
            </div>
            <div className="flex gap-2">
                <button onClick={() => onSetStatus(AttendanceStatus.PRESENT)} className={`w-12 h-12 flex items-center justify-center rounded-full transition-all duration-200 ${getButtonClass(AttendanceStatus.PRESENT)}`} aria-label="Marcar Presente"><CheckCircleIcon className="w-7 h-7" /></button>
                <button onClick={() => onSetStatus(AttendanceStatus.ABSENT)} className={`w-12 h-12 flex items-center justify-center rounded-full transition-all duration-200 ${getButtonClass(AttendanceStatus.ABSENT)}`} aria-label="Marcar Ausente"><XCircleIcon className="w-7 h-7" /></button>
                <button onClick={() => onSetStatus(AttendanceStatus.JUSTIFIED)} className={`w-12 h-12 flex items-center justify-center rounded-full transition-all duration-200 ${getButtonClass(AttendanceStatus.JUSTIFIED)}`} aria-label="Marcar Justificado"><MinusCircleIcon className="w-7 h-7" /></button>
            </div>
        </div>
    );
};

const AsistenciaView: React.FC<{
    initialSubject?: Subject;
    subjects: Subject[];
    students: User[];
    attendanceRecords: AttendanceRecord[];
    addAttendanceRecord: (updates: { studentId: number; status: AttendanceStatus }[], date: string, subjectId: string, actorRole: Role) => void;
    currentUser: User;
}> = ({ initialSubject, subjects, students, attendanceRecords, addAttendanceRecord, currentUser }) => {
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(initialSubject || null);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [dailyAttendance, setDailyAttendance] = useState<Record<number, AttendanceStatus>>({});
    const [saved, setSaved] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

    const relevantStudents = useMemo(() => {
        if (!selectedSubject) return [];
        return students.filter(s => s.careerId === selectedSubject.careerId && (Array.isArray(s.year) ? s.year.includes(selectedSubject.year) : s.year === selectedSubject.year));
    }, [students, selectedSubject]);
    
    useEffect(() => {
        if (!selectedSubject) return;
        const recordsForDate = attendanceRecords.filter(r => r.date === selectedDate && r.subjectId === selectedSubject.id);
        const initialAttendance: Record<number, AttendanceStatus> = {};
        relevantStudents.forEach(student => {
            const record = recordsForDate.find(r => r.studentId === student.id);
            if (record) initialAttendance[student.id] = record.status;
        });
        setDailyAttendance(initialAttendance);
        setSaved(false);
        setIsDirty(false);
    }, [selectedDate, relevantStudents, attendanceRecords, selectedSubject]);

    if (!selectedSubject) {
        return (
            <div className="solid-card p-6 animate-fade-in-up">
                <h2 className="text-2xl font-bold text-[--color-text-primary] mb-4">Tomar Asistencia</h2>
                <p className="text-[--color-text-secondary] mb-6">Selecciona una materia para continuar.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {subjects.map(s => (
                        <button key={s.id} onClick={() => setSelectedSubject(s)} className="btn btn-secondary text-left justify-start p-4 h-auto">
                            <div className="flex flex-col">
                                <span className="font-bold text-base">{s.name}</span>
                                <span className="text-sm font-normal">{s.year}° Año</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    const handleStatusChange = (studentId: number, status: AttendanceStatus) => {
        setDailyAttendance(prev => ({ ...prev, [studentId]: status }));
        setSaved(false);
        setIsDirty(true);
    };

    const handleSaveAttendance = () => {
        const updates = Object.entries(dailyAttendance).map(([studentId, status]) => ({ studentId: Number(studentId), status }));
        addAttendanceRecord(updates, selectedDate, selectedSubject.id, currentUser.role);
        setSaved(true);
        setIsDirty(false);
        setTimeout(() => setSaved(false), 3000);
    };

    const handleExportCSV = () => {
        const headers = ['ID Alumno', 'Nombre', 'Email', 'Fecha', 'Materia', 'Estado'];
        const rows = relevantStudents.map(student => {
            const status = dailyAttendance[student.id] || 'No Marcado';
            return [student.id, `"${student.name}"`, student.email, selectedDate, `"${selectedSubject.name}"`, status].join(',');
        });
        const csvContent = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', `asistencia_${selectedSubject.id}_${selectedDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    };
    
    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="solid-card p-6">
                <div className="flex items-center gap-4">
                     <button onClick={() => setSelectedSubject(null)} className="btn btn-secondary !p-2"><ArrowLeftIcon className="w-5 h-5"/></button>
                     <div>
                        <h2 className="text-2xl font-bold text-[--color-text-primary]">Tomar Asistencia</h2>
                        <p className="text-[--color-text-secondary]">Materia: <span className="font-semibold">{selectedSubject.name}</span></p>
                    </div>
                </div>
                <div className="mt-4">
                    <label htmlFor="date-select" className="block text-sm font-medium text-[--color-text-secondary] mb-1">Fecha</label>
                    <input type="date" id="date-select" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="input-styled w-full max-w-xs" />
                </div>
            </div>

            <div className="solid-card p-6">
                <h3 className="text-xl font-bold text-[--color-text-primary] mb-4">Lista de Alumnos</h3>
                 {relevantStudents.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {relevantStudents.map(student => (
                                <StudentAttendanceCard key={student.id} student={student} status={dailyAttendance[student.id] || null} onSetStatus={(status) => handleStatusChange(student.id, status)} />
                            ))}
                        </div>
                        <div className="mt-8 flex flex-wrap justify-end items-center gap-4">
                            {saved && <p className="text-green-500 flex items-center gap-2 animate-pulse font-semibold"><CheckCircleIcon className="w-5 h-5" /> ¡Guardado!</p>}
                            {isDirty && !saved && <p className="text-yellow-500 text-sm font-medium">Cambios sin guardar</p>}
                            <button onClick={handleExportCSV} disabled={!relevantStudents.every(s => dailyAttendance[s.id])} className="btn btn-secondary"><DownloadIcon className="w-5 h-5" /> Exportar</button>
                            <button onClick={handleSaveAttendance} disabled={!relevantStudents.every(s => dailyAttendance[s.id]) || !isDirty} className="btn btn-primary font-bold">Guardar Asistencia</button>
                        </div>
                    </>
                ) : (
                    <p className="text-[--color-text-secondary] text-center py-8">No hay alumnos en este curso.</p>
                )}
            </div>
        </div>
    );
};

const gradeTypes1: GradeType[] = ['Parcial 1', 'Recuperatorio 1', 'TP'];
const gradeTypes2: GradeType[] = ['Parcial 2', 'Recuperatorio 2'];

const CalificacionesView: React.FC<{
    initialSubject?: Subject;
    subjects: Subject[];
    students: User[];
    grades: Grade[];
    onUpdateGrades: (studentId: number, subjectId: string, newGrades: { type: GradeType, value: string }[]) => void;
    profile: UserProfileData;
}> = ({ initialSubject, subjects, students, grades, onUpdateGrades, profile }) => {
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(initialSubject || subjects.length === 1 ? subjects[0] : null);
    
    const relevantStudents = useMemo(() => {
        if (!selectedSubject) return [];
        // FIX: Handle student year being an array when comparing with filterYear.
        return students.filter(s => {
            if (s.careerId !== selectedSubject.careerId) return false;
            if (typeof s.year === 'number') return s.year === selectedSubject.year;
            if (Array.isArray(s.year)) return s.year.includes(selectedSubject.year);
            return false;
        }).sort((a, b) => a.name.localeCompare(b.name));
    }, [students, selectedSubject]);

    const initialGradesState = useMemo(() => {
        const state: Record<number, { [key in GradeType]?: string }> = {};
        relevantStudents.forEach(student => {
            state[student.id] = {};
            if (selectedSubject) {
                const studentGrades = grades.filter(g => g.studentId === student.id && g.subjectId === selectedSubject.id);
                studentGrades.forEach(grade => {
                    state[student.id][grade.type] = grade.value;
                });
            }
        });
        return state;
    }, [relevantStudents, grades, selectedSubject]);
    
    const [gradesState, setGradesState] = useState(initialGradesState);
    const teacherSettings = profile.teacherSettings || { autoAttendance: false };
    const autoAverageEnabled = selectedSubject ? teacherSettings.autoAverage?.[selectedSubject.id] === true : false;
    
    useEffect(() => {
        setGradesState(initialGradesState);
    }, [initialGradesState, selectedSubject]);

    useEffect(() => {
        if (autoAverageEnabled) {
            setGradesState(currentGrades => {
                const newGrades = JSON.parse(JSON.stringify(currentGrades));
                let changed = false;
                Object.keys(newGrades).forEach(studentIdStr => {
                    const studentId = Number(studentIdStr);
                    const studentGrades = newGrades[studentId];

                    const p1 = parseFloat(studentGrades['Parcial 1'] || '');
                    const r1 = parseFloat(studentGrades['Recuperatorio 1'] || '');
                    const tp = parseFloat(studentGrades['TP'] || '');
                    
                    const p2 = parseFloat(studentGrades['Parcial 2'] || '');
                    const r2 = parseFloat(studentGrades['Recuperatorio 2'] || '');
                    
                    const term1Grade = !isNaN(r1) && r1 >= 4 ? r1 : p1;
                    if (!isNaN(term1Grade) && term1Grade >= 4 && !isNaN(tp) && tp >= 4) {
                        const newN1C = Math.round((Number(term1Grade) + Number(tp)) / 2).toString();
                        if (studentGrades['Nota 1er Cuatrimestre'] !== newN1C) {
                            newGrades[studentId]['Nota 1er Cuatrimestre'] = newN1C;
                            changed = true;
                        }
                    }

                    const term2Grade = !isNaN(r2) && r2 >= 4 ? r2 : p2;
                    if (!isNaN(term2Grade) && term2Grade >= 4) {
                        const newN2C = term2Grade.toString();
                         if (studentGrades['Nota 2do Cuatrimestre'] !== newN2C) {
                            newGrades[studentId]['Nota 2do Cuatrimestre'] = newN2C;
                            changed = true;
                        }
                    }
                });
                return changed ? newGrades : currentGrades;
            });
        }
    }, [gradesState, autoAverageEnabled]);

    const handleGradeChange = (studentId: number, type: GradeType, value: string) => {
        setGradesState(prev => ({
            ...prev,
            [studentId]: { ...prev[studentId], [type]: value }
        }));
    };
    
    const handleSaveForStudent = (studentId: number) => {
        const newGrades = Object.entries(gradesState[studentId]).map(([type, value]) => ({ type: type as GradeType, value: value as string }));
        onUpdateGrades(studentId, selectedSubject!.id, newGrades);
    };

    const getGradeInputStyle = (value: string) => {
        const num = parseFloat(value);
        if (isNaN(num)) return 'border-[--color-border]';
        if (num < 4) return 'border-red-500 bg-red-500/10 text-red-500';
        if (num < 7) return 'border-blue-500 bg-blue-500/10 text-blue-500';
        return 'border-green-500 bg-green-500/10 text-green-500';
    };

    return (
        <div className="animate-fade-in-up">
            <div className="solid-card p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-[--color-text-primary]">Gestionar Calificaciones</h2>
                    </div>
                    <div className="w-full sm:w-auto">
                        <label htmlFor="subject-select-grades" className="sr-only">Materia</label>
                        <select
                            id="subject-select-grades"
                            value={selectedSubject?.id || ''}
                            onChange={(e) => setSelectedSubject(subjects.find(s => s.id === e.target.value) || null)}
                            className="input-styled w-full"
                        >
                             <option value="" disabled>Selecciona una materia</option>
                            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                </div>
                {selectedSubject ? (
                     <div className="space-y-6">
                        {relevantStudents.map(student => (
                            <div key={student.id} className="solid-card p-6 border border-[--color-border]">
                                <h3 className="text-xl font-bold text-[--color-accent] mb-4">{student.name}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                    <div>
                                        <h4 className="font-semibold text-[--color-text-secondary] mb-2">1er Cuatrimestre</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            {gradeTypes1.map(type => (
                                                <div key={type}>
                                                    <label className="block text-sm text-[--color-text-secondary] mb-1">{type}</label>
                                                    <input
                                                        type="text"
                                                        value={gradesState[student.id]?.[type] || ''}
                                                        onChange={(e) => handleGradeChange(student.id, type, e.target.value)}
                                                        className={`input-styled w-full text-center font-bold ${getGradeInputStyle(gradesState[student.id]?.[type] || '')}`}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                         <div className="mt-4">
                                            <label className="block text-sm text-[--color-text-secondary] mb-1">Nota 1er Cuat.</label>
                                            <input
                                                type="text"
                                                value={gradesState[student.id]?.['Nota 1er Cuatrimestre'] || ''}
                                                onChange={(e) => handleGradeChange(student.id, 'Nota 1er Cuatrimestre', e.target.value)}
                                                className={`input-styled w-full text-center font-bold text-lg p-3 border-2 ${autoAverageEnabled ? 'bg-gray-200 border-yellow-400' : 'border-yellow-400'}`}
                                                readOnly={autoAverageEnabled}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-[--color-text-secondary] mb-2">2do Cuatrimestre</h4>
                                         <div className="grid grid-cols-2 gap-4">
                                            {gradeTypes2.map(type => (
                                                <div key={type}>
                                                    <label className="block text-sm text-[--color-text-secondary] mb-1">{type}</label>
                                                    <input
                                                        type="text"
                                                        value={gradesState[student.id]?.[type] || ''}
                                                        onChange={(e) => handleGradeChange(student.id, type, e.target.value)}
                                                        className={`input-styled w-full text-center font-bold ${getGradeInputStyle(gradesState[student.id]?.[type] || '')}`}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                         <div className="mt-4">
                                            <label className="block text-sm text-[--color-text-secondary] mb-1">Nota 2do Cuat.</label>
                                            <input
                                                type="text"
                                                value={gradesState[student.id]?.['Nota 2do Cuatrimestre'] || ''}
                                                onChange={(e) => handleGradeChange(student.id, 'Nota 2do Cuatrimestre', e.target.value)}
                                                className={`input-styled w-full text-center font-bold text-lg p-3 border-2 ${autoAverageEnabled ? 'bg-gray-200 border-yellow-400' : 'border-yellow-400'}`}
                                                readOnly={autoAverageEnabled}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6 flex justify-end">
                                    <button onClick={() => handleSaveForStudent(student.id)} className="btn btn-primary">Guardar Notas</button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-[--color-text-secondary] py-16">
                        <p>Por favor, selecciona una materia para ver y gestionar las calificaciones de los alumnos.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const OpcionesView: React.FC<{
    user: User;
    subjects: Subject[];
    profile: UserProfileData;
    onSave: (updatedProfile: UserProfileData) => void;
}> = ({ user, subjects, profile, onSave }) => {
    const teacherSettings = profile.teacherSettings || { autoAttendance: false };
    const syncAttendanceSettings = teacherSettings.syncAttendance || {};
    const autoAverageSettings = teacherSettings.autoAverage || {};
    const notificationSettings = profile.notificationSettings || {};
    
    const handleToggle = (type: 'sync' | 'average', subjectId: string) => {
        const newSettings = JSON.parse(JSON.stringify(teacherSettings));
        if (type === 'sync') {
            if (!newSettings.syncAttendance) newSettings.syncAttendance = {};
            newSettings.syncAttendance[subjectId] = !newSettings.syncAttendance[subjectId];
        } else {
            if (!newSettings.autoAverage) newSettings.autoAverage = {};
            newSettings.autoAverage[subjectId] = !newSettings.autoAverage[subjectId];
        }
        onSave({ ...profile, teacherSettings: newSettings });
    };

    const handleNotificationToggle = (key: 'upcomingEvents' | 'communityPosts') => {
        const newSettings = { 
            ...profile.notificationSettings, 
            [key]: !(profile.notificationSettings?.[key])
        };
        onSave({ ...profile, notificationSettings: newSettings });
    };

    return (
        <div className="animate-fade-in-up">
            <div className="solid-card w-full max-w-3xl p-6 md:p-8 mx-auto">
                <h2 className="text-2xl font-bold text-[--color-text-primary] mb-2">Opciones y Notificaciones</h2>
                <p className="text-[--color-text-secondary] mb-8">Gestiona la automatización, sincronización y las alertas para tus materias.</p>
                
                <section>
                    <h3 className="text-xl font-semibold text-[--color-text-primary] mb-2">Promedio Automático</h3>
                    <p className="text-[--color-text-secondary] mb-4">Activa para que la nota del cuatrimestre se calcule sola basándose en parciales, recuperatorios y TPs.</p>
                    <div className="space-y-4">
                        {subjects.map(subject => {
                            const isEnabled = autoAverageSettings[subject.id] === true;
                            return (
                                <div key={subject.id} className="flex items-center justify-between bg-[--color-secondary] p-4 rounded-lg">
                                    <div>
                                        <span className="font-semibold text-[--color-text-primary]">{subject.name}</span>
                                        <p className="text-xs text-[--color-text-secondary]">Promedio automático {isEnabled ? 'activado' : 'desactivado'}</p>
                                    </div>
                                    <button onClick={() => handleToggle('average', subject.id)} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${isEnabled ? 'bg-[--color-accent]' : 'bg-gray-400'}`}>
                                        <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${isEnabled ? 'translate-x-6' : 'translate-x-1'}`}/>
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </section>
                
                <section className="mt-8 pt-8 border-t border-[--color-border]">
                    <h3 className="text-xl font-semibold text-[--color-text-primary] mb-2">Asistencia Sincronizada</h3>
                    <p className="text-[--color-text-secondary] mb-4">Si está activa, cuando un preceptor tome asistencia en esta materia, se registrará automáticamente en tu panel (y viceversa).</p>
                    <div className="space-y-4">
                        {subjects.map(subject => {
                            const isEnabled = syncAttendanceSettings[subject.id] === true;
                            return (
                                <div key={subject.id} className="flex items-center justify-between bg-[--color-secondary] p-4 rounded-lg">
                                    <div>
                                        <span className="font-semibold text-[--color-text-primary]">{subject.name}</span>
                                        <p className="text-xs text-[--color-text-secondary]">Sincronización {isEnabled ? 'activada' : 'desactivada'}</p>
                                    </div>
                                    <button onClick={() => handleToggle('sync', subject.id)} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${isEnabled ? 'bg-[--color-accent]' : 'bg-gray-400'}`}>
                                        <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${isEnabled ? 'translate-x-6' : 'translate-x-1'}`}/>
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </section>

                <section className="mt-8 pt-8 border-t border-[--color-border]">
                    <h3 className="text-xl font-semibold text-[--color-text-primary] mb-2">Notificaciones de Agenda</h3>
                    <p className="text-[--color-text-secondary] mb-4">Gestiona las alertas que recibes en la aplicación sobre tu agenda.</p>
                    <div className="flex items-center justify-between bg-[--color-secondary] p-4 rounded-lg">
                        <div>
                            <span className="font-semibold text-[--color-text-primary]">Alertas de próximos eventos</span>
                            <p className="text-xs text-[--color-text-secondary]">Recibir un aviso en la campana sobre clases, entregas o exámenes cercanos.</p>
                        </div>
                        <button
                            onClick={() => handleNotificationToggle('upcomingEvents')}
                            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${notificationSettings.upcomingEvents === true ? 'bg-[--color-accent]' : 'bg-gray-400'}`}
                        >
                            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${notificationSettings.upcomingEvents === true ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>
                </section>

                <section className="mt-8 pt-8 border-t border-[--color-border]">
                    <h3 className="text-xl font-semibold text-[--color-text-primary] mb-2">Notificaciones de Comunidad</h3>
                    <p className="text-[--color-text-secondary] mb-4">Activa o desactiva las notificaciones sobre nuevas publicaciones del Centro de Estudiantes.</p>
                    <div className="flex items-center justify-between bg-[--color-secondary] p-4 rounded-lg">
                        <div>
                            <span className="font-semibold text-[--color-text-primary]">Nuevas publicaciones del C.E.</span>
                            <p className="text-xs text-[--color-text-secondary]">Recibir un aviso cuando haya nuevas publicaciones o respuestas importantes.</p>
                        </div>
                        <button
                            onClick={() => handleNotificationToggle('communityPosts')}
                            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${notificationSettings.communityPosts !== false ? 'bg-[--color-accent]' : 'bg-gray-400'}`}
                        >
                            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${notificationSettings.communityPosts !== false ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
};

const ComunicacionesView: React.FC<{
    newsItems: NewsItem[];
    addNewsItem: (item: Omit<NewsItem, 'id'>) => void;
    subjects: Subject[];
}> = ({ newsItems, addNewsItem, subjects }) => {
    const [text, setText] = useState('');
    const [subjectId, setSubjectId] = useState('general');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim()) return;
        const subject = subjects.find(s => s.id === subjectId);
        addNewsItem({ text, subjectId: subject ? subject.id : undefined, careerId: subject ? subject.careerId : undefined, year: subject ? subject.year : undefined });
        setText('');
        setSubjectId('general');
    };
    
    const mySubjectIds = new Set(subjects.map(s => s.id));
    const relevantNews = newsItems.filter(item => !item.subjectId || mySubjectIds.has(item.subjectId)).sort((a,b) => b.id.localeCompare(a.id));

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="solid-card p-6">
                <h2 className="text-2xl font-bold text-[--color-text-primary] mb-4">Enviar Comunicado</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="news-text" className="block text-sm font-medium text-[--color-text-secondary]">Mensaje</label>
                        <textarea id="news-text" value={text} onChange={e => setText(e.target.value)} rows={4} className="input-styled w-full mt-1" placeholder="Escribe tu anuncio o comunicado..."/>
                    </div>
                    <div>
                        <label htmlFor="news-subject" className="block text-sm font-medium text-[--color-text-secondary]">Dirigido a</label>
                        <select id="news-subject" value={subjectId} onChange={e => setSubjectId(e.target.value)} className="input-styled w-full mt-1">
                            <option value="general">Anuncio General (para todos mis alumnos)</option>
                            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                    <button type="submit" className="btn btn-primary w-full">Enviar</button>
                </form>
            </div>
             <div className="solid-card p-6">
                <h3 className="text-xl font-bold text-[--color-text-primary] mb-4">Historial de Comunicados</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                    {relevantNews.length > 0 ? relevantNews.map(item => (
                        <div key={item.id} className="bg-[--color-secondary] p-4 rounded-lg border border-[--color-border]">
                           <p className="text-[--color-text-primary]">{item.text}</p>
                           <p className="text-xs text-[--color-text-secondary] mt-1 font-semibold">{subjects.find(s => s.id === item.subjectId)?.name || 'General'}</p>
                        </div>
                    )) : <p className="text-center text-[--color-text-secondary] py-8">No has enviado comunicados.</p>}
                </div>
            </div>
        </div>
    );
};

const DoughnutChart: React.FC<{ progress: number; size?: number }> = ({ progress, size = 80 }) => {
    const strokeWidth = 8;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;
    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
                <circle className="text-[--color-secondary]" stroke="currentColor" strokeWidth={strokeWidth} fill="transparent" r={radius} cx={size/2} cy={size/2}/>
                <circle
                    className="text-[--color-accent]"
                    stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" fill="transparent"
                    r={radius} cx={size/2} cy={size/2}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
                />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">{progress}%</span>
        </div>
    );
};

const RadarChart: React.FC<{ data: {subject: string, [key: string]: string | number}[], labels: string[]}> = ({ data, labels }) => {
    const size = 250;
    const center = size / 2;
    const numLevels = 5;
    const radius = size * 0.4;
    const angleSlice = (Math.PI * 2) / labels.length;

    const points = data.map(item =>
        labels.map((label, i) => {
            const value = (Number(item[label.toLowerCase().replace(/ /g, '')]) || 0) / 100;
            const x = center + radius * value * Math.cos((angleSlice * i) - (Math.PI / 2));
            const y = center + radius * value * Math.sin((angleSlice * i) - (Math.PI / 2));
            return `${x},${y}`;
        }).join(' ')
    );
    
    return (
        <svg viewBox={`0 0 ${size} ${size}`} className="max-w-xs w-full">
            {[...Array(numLevels)].map((_, level) => (
                <polygon
                    key={level}
                    points={labels.map((_, i) => {
                        const r = radius * ((numLevels - level) / numLevels);
                        const x = center + r * Math.cos(angleSlice * i - Math.PI / 2);
                        const y = center + r * Math.sin(angleSlice * i - Math.PI / 2);
                        return `${x},${y}`;
                    }).join(' ')}
                    fill="none" stroke="var(--color-border)"
                />
            ))}
            {labels.map((_, i) => {
                const x = center + radius * Math.cos(angleSlice * i - Math.PI / 2);
                const y = center + radius * Math.sin(angleSlice * i - Math.PI / 2);
                return <line key={i} x1={center} y1={center} x2={x} y2={y} stroke="var(--color-border)" />;
            })}
            {labels.map((label, i) => {
                const x = center + radius * 1.1 * Math.cos(angleSlice * i - Math.PI / 2);
                const y = center + radius * 1.1 * Math.sin(angleSlice * i - Math.PI / 2);
                return <text key={label} x={x} y={y} textAnchor="middle" dy="0.3em" fontSize="8" fill="var(--color-text-secondary)">{label.split(' ')[0]}</text>;
            })}
            {points.map((p, i) => (
                <polygon
                    key={i}
                    points={p}
                    fill={['var(--color-accent)', '#3498db', '#e74c3c'][i % 3]}
                    fillOpacity="0.5"
                    stroke={['var(--color-accent)', '#3498db', '#e74c3c'][i % 3]}
                    strokeWidth="2"
                />
            ))}
        </svg>
    );
};

const TabButton: React.FC<{label: string, isActive: boolean, onClick: () => void}> = ({label, isActive, onClick}) => (
    <button onClick={onClick} className={`py-2 px-4 font-semibold text-sm rounded-md transition-all duration-300 ${isActive ? 'bg-[--color-primary] shadow text-[--color-accent]' : 'text-[--color-text-secondary] hover:text-[--color-text-primary]'}`}>
        {label}
    </button>
);

const GaugeChart: React.FC<{ value: number, size?: number }> = (props) => {
    const { value, size = 150 } = props;
    const strokeWidth = 15;
    const radius = (size - strokeWidth) / 2;
    const circumference = Math.PI * radius; // Half circle
    const offset = circumference - (value / 100) * circumference;
    const color = value >= 85 ? '#27ae60' : value >= 70 ? '#f39c12' : '#e74c3c';

    return (
        <div className="relative" style={{ width: size, height: size / 2 }}>
            <svg className="w-full h-full" viewBox={`0 0 ${size} ${size/2}`}>
                <path d={`M ${strokeWidth/2} ${size/2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth/2} ${size/2}`} stroke="var(--color-secondary)" strokeWidth={strokeWidth} fill="none" />
                <path d={`M ${strokeWidth/2} ${size/2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth/2} ${size/2}`} stroke={color} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} style={{transition: 'stroke-dashoffset 0.5s ease-out'}}/>
            </svg>
            <div className="absolute bottom-0 w-full text-center">
                <span className="text-3xl font-bold" style={{color}}>{value.toFixed(1)}%</span>
                <p className="text-xs text-[--color-text-secondary]">Asistencia General</p>
            </div>
        </div>
    );
};

const AlumnosOverview: React.FC<{
    user: User;
    allSubjects: Subject[];
    students: User[];
    attendanceRecords: AttendanceRecord[];
    grades: Grade[];
    classSchedule: ClassSchedule[];
    onClose: () => void;
}> = ({ user, allSubjects, students, attendanceRecords, grades, classSchedule, onClose }) => {
    const mySubjects = useMemo(() => {
      return allSubjects.filter(s => user.assignedSubjects?.includes(s.id));
    }, [allSubjects, user.assignedSubjects]);

    const [selectedSubjectId, setSelectedSubjectId] = useState('all');
    
    const { myStudents, studentAverages } = useMemo(() => {
        let studentSet = new Set<User>();
        const subjectFilter = selectedSubjectId === 'all' ? mySubjects : mySubjects.filter(s => s.id === selectedSubjectId);
        
        subjectFilter.forEach(subject => {
            students
                .filter(s => {
                    if (s.careerId !== subject.careerId) {
                        return false;
                    }
                    
                    if (typeof s.year === 'number') {
                        return s.year === subject.year;
                    }
                    if (Array.isArray(s.year)) {
                        return s.year.includes(subject.year);
                    }
                    return false;
                })
                .forEach(s => studentSet.add(s));
        });
        const studentList = Array.from(studentSet);
        
        const averages = new Map<number, number>();
        studentList.forEach(student => {
            const relevantGrades = grades.filter(g => {
                const subjectMatch = selectedSubjectId === 'all' || g.subjectId === selectedSubjectId;
                return g.studentId === student.id && subjectMatch;
            });
            if (relevantGrades.length > 0) {
                const numericGrades = relevantGrades.map(g => parseFloat(g.value)).filter(v => !isNaN(v));
                if (numericGrades.length > 0) {
                    const sum = numericGrades.reduce((acc, val) => acc + val, 0);
                    averages.set(student.id, sum / numericGrades.length);
                } else {
                    averages.set(student.id, 0);
                }
            } else {
                averages.set(student.id, 0);
            }
        });
        
        return { myStudents: studentList, studentAverages: averages };
    }, [mySubjects, students, grades, selectedSubjectId]);
    
    const headerStats = useMemo(() => {
        const totalAlumnos = myStudents.length;
        const promedioPorMateria = totalAlumnos / (mySubjects.length || 1);
        const overallAverage = totalAlumnos > 0 ? Array.from(studentAverages.values()).reduce((sum: number, avg: number) => sum + avg, 0) / studentAverages.size : 0;
        const lowPerformanceCount = Array.from(studentAverages.values()).filter((avg: number) => avg > 0 && avg < 4).length;
        const finalGrades = grades.filter(g => g.type.startsWith('Nota') && myStudents.some(s => s.id === g.studentId));
        const approvalRate = finalGrades.length > 0 ? (finalGrades.filter(g => parseFloat(g.value) >= 4).length / finalGrades.length) * 100 : 0;


        return { totalAlumnos, promedioPorMateria, overallAverage, lowPerformanceCount, approvalRate };
    }, [myStudents, mySubjects, studentAverages, selectedSubjectId, grades]);
    
    const studentDistribution = useMemo(() => {
        if (selectedSubjectId !== 'all') return [];
        return mySubjects.map(subject => ({
            name: subject.name,
            value: students.filter(s => {
                // Fix: Refactored the filtering logic to be more explicit for the TypeScript type checker, to resolve a potential type error when matching student and subject years.
                if (s.careerId !== subject.careerId) {
                    return false;
                }
                
                if (typeof s.year === 'number') {
                    return s.year === subject.year;
                }
                if (Array.isArray(s.year)) {
                    return s.year.includes(subject.year);
                }
                return false;
            }).length
        })).sort((a, b) => b.value - a.value);
    }, [mySubjects, students, selectedSubjectId]);
    
    const generalAttendance = useMemo(() => {
        const studentIds = new Set(myStudents.map(s => s.id));
        const relevantRecords = attendanceRecords.filter(r => {
             const subjectMatch = selectedSubjectId === 'all' || r.subjectId === selectedSubjectId;
             return studentIds.has(r.studentId) && subjectMatch;
        });
        if (relevantRecords.length === 0) return 0;
        const presentCount = relevantRecords.filter(r => r.status === 'Presente' || r.status === 'Justificado').length;
        return (presentCount / relevantRecords.length) * 100;
    }, [myStudents, attendanceRecords, selectedSubjectId]);
    
    const studentRankings = useMemo(() => {
        const rankedStudents = myStudents
            .map(s => ({ student: s, avg: studentAverages.get(s.id) || 0 }))
            .filter(s => s.avg > 0);
        
        const top = [...rankedStudents].sort((a,b) => b.avg - a.avg).slice(0, 5);
        
        // FIX: Corrected typo in sort function `a.avg - a.avg` to `a.avg - b.avg`.
        const bottom = [...rankedStudents].filter(s => s.avg < 7).sort((a,b) => a.avg - b.avg).slice(0, 5);
        
        return { top, bottom };
    }, [myStudents, studentAverages]);

    const handleExportPDF = () => {
        const doc = new jsPDF();
        const subjectName = selectedSubjectId === 'all' ? 'Todos_los_Cursos' : mySubjects.find(s => s.id === selectedSubjectId)?.name.replace(/ /g, '_');

        doc.setFontSize(18);
        doc.text(`Reporte de Alumnos - ${subjectName?.replace(/_/g, ' ')}`, 14, 22);
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Fecha: ${new Date().toLocaleDateString('es-AR')}`, 14, 28);
        
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text(`Promedio General: ${headerStats.overallAverage.toFixed(2)}`, 14, 40);
        doc.text(`Tasa de Aprobación: ${headerStats.approvalRate.toFixed(1)}%`, 14, 46);
        doc.text(`Alumnos en Riesgo: ${headerStats.lowPerformanceCount}`, 14, 52);
        
        const head = [['Ranking', 'Alumno', 'Promedio']];

        (doc as any).autoTable({
            startY: 60,
            head: [['Ranking', 'Alumno', 'Promedio']],
            body: studentRankings.top.map((s, i) => [String(i + 1), s.student.name, s.avg.toFixed(2)]),
            theme: 'grid',
        });
        
        doc.addPage();
        doc.setFontSize(14);
        doc.text('Alumnos con Bajo Rendimiento', 14, 22);
        (doc as any).autoTable({ startY: 27, head, body: studentRankings.bottom.map((s, i) => [String(i + 1), s.student.name, s.avg.toFixed(2)]), theme: 'grid' });

        doc.save(`reporte_alumnos_${subjectName}.pdf`);
    };

    
    const getGradeColor = (grade: number) => {
        if (grade >= 7) return 'text-green-600';
        if (grade >= 4) return 'text-blue-600';
        return 'text-red-600';
    }

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                   <h2 className="text-2xl sm:text-3xl font-bold text-[--color-text-primary]">Total de Alumnos</h2>
                   <p className="text-sm text-[--color-text-secondary]">Estadísticas del alumnado bajo tu cargo.</p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button onClick={onClose} className="btn btn-secondary !px-3"><ArrowLeftIcon className="w-5 h-5"/> <span className="hidden sm:inline">Volver</span></button>
                    <button onClick={handleExportPDF} className="btn btn-outline !px-3"><DownloadIcon className="w-5 h-5"/> <span className="hidden sm:inline">Exportar</span></button>
                </div>
            </div>

            <div className="w-full sm:w-1/2 md:w-1/3">
                <label htmlFor="subject-filter-students" className="sr-only">Filtrar por materia</label>
                <select id="subject-filter-students" onChange={(e) => setSelectedSubjectId(e.target.value)} value={selectedSubjectId} className="input-styled w-full">
                    <option value="all">Todas las materias</option>
                    {mySubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="solid-card p-4 bg-gradient-to-br from-[--color-secondary] to-[--color-primary]"><p className="text-sm text-[--color-text-secondary]">Total Alumnos</p><p className="text-3xl font-bold">{headerStats.totalAlumnos}</p></div>
                <div className="solid-card p-4 bg-gradient-to-br from-[--color-secondary] to-[--color-primary]"><p className="text-sm text-[--color-text-secondary]">Alumnos/Materia</p><p className="text-3xl font-bold">{headerStats.promedioPorMateria.toFixed(1)}</p></div>
                <div className="solid-card p-4 bg-gradient-to-br from-[--color-secondary] to-[--color-primary]"><p className="text-sm text-[--color-text-secondary]">Promedio Gral.</p><p className="text-3xl font-bold">{headerStats.overallAverage.toFixed(2)}</p></div>
                <div className="solid-card p-4 bg-gradient-to-br from-red-500/5 to-[--color-primary]"><p className="text-sm text-red-500">Alumnos en Alerta</p><p className="text-3xl font-bold text-red-500">{headerStats.lowPerformanceCount}</p></div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {selectedSubjectId === 'all' && (
                    <div className="lg:col-span-1 solid-card p-4">
                        <h3 className="font-semibold mb-4">Distribución de Alumnos</h3>
                        <div className="space-y-3">
                            {studentDistribution.map(item => (
                                <div key={item.name}>
                                    <div className="flex justify-between text-sm mb-1"><span className="font-semibold">{item.name}</span><span>{item.value}</span></div>
                                    <div className="w-full bg-[--color-secondary] rounded-full h-2.5"><div className="bg-[--color-accent] h-2.5 rounded-full animate-bar-fill" style={{width: `${headerStats.totalAlumnos > 0 ? (item.value / headerStats.totalAlumnos) * 100 : 0}%`}}></div></div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                <div className="solid-card p-4 flex flex-col items-center justify-center min-h-[150px]">
                    <GaugeChart value={generalAttendance} />
                </div>
                <div className="hidden lg:block solid-card p-4">
                     <h3 className="font-semibold mb-4">Rendimiento (Evolución)</h3>
                     <p className="text-center text-sm text-[--color-text-secondary] pt-8">Gráfico de líneas en desarrollo.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="solid-card p-4">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">🏅 Mejores Promedios</h3>
                    <ul className="space-y-2">
                       {studentRankings.top.map(s => (
                           <li key={s.student.id} className="flex justify-between items-center bg-[--color-secondary] p-3 rounded-lg">
                               <span className="font-semibold">{s.student.name}</span>
                               <span className={`font-bold ${getGradeColor(s.avg)}`}>{s.avg.toFixed(2)}</span>
                           </li>
                       ))}
                    </ul>
                </div>
                <div className="solid-card p-4">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">🔔 Rendimiento Bajo</h3>
                     <ul className="space-y-2">
                       {studentRankings.bottom.map(s => (
                           <li key={s.student.id} className="flex justify-between items-center bg-[--color-secondary] p-3 rounded-lg">
                               <span className="font-semibold">{s.student.name}</span>
                               <span className={`font-bold ${getGradeColor(s.avg)}`}>{s.avg.toFixed(2)}</span>
                           </li>
                       ))}
                    </ul>
                </div>
            </div>
             <style>{`
                @keyframes bar-fill {
                    from { width: 0%; }
                    to { /* The width is set by inline style */ }
                }
                .animate-bar-fill {
                    animation: bar-fill 0.8s ease-out forwards;
                }
            `}</style>
        </div>
    )
}

const MateriasOverview: React.FC<{
    user: User;
    allSubjects: Subject[];
    students: User[];
    attendanceRecords: AttendanceRecord[];
    grades: Grade[];
    classSchedule: ClassSchedule[];
    onClose: () => void;
}> = ({ user, allSubjects, students, attendanceRecords, grades, classSchedule, onClose }) => {
    const mySubjects = useMemo(() => {
      return allSubjects.filter(s => user.assignedSubjects?.includes(s.id));
    }, [allSubjects, user.assignedSubjects]);

    const [selectedSubjectId, setSelectedSubjectId] = useState('all');
    const [activeTab, setActiveTab] = useState<'resumen' | 'rendimiento' | 'tabla'>('resumen');
    const [animationKey, setAnimationKey] = useState(0);

    const handleSetTab = (tab: 'resumen' | 'rendimiento' | 'tabla') => {
        setAnimationKey(prev => prev + 1); // Reset animation on tab change
        setActiveTab(tab);
    }

    const filteredSubjects = useMemo(() => {
        return selectedSubjectId === 'all' 
            ? mySubjects 
            : mySubjects.filter(s => s.id === selectedSubjectId);
    }, [mySubjects, selectedSubjectId]);

    const summaryStats = useMemo(() => {
        const subjectIds = new Set(filteredSubjects.map(s => s.id));
        const weeklyHours = classSchedule
            .filter(c => subjectIds.has(c.subjectId))
            .reduce((total: number, schedule) => {
                const start = new Date(`1970-01-01T${schedule.startTime}:00`);
                const end = new Date(`1970-01-01T${schedule.endTime}:00`);
                return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
            }, 0);

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        let classCount = 0;
        const weeklySchedule = classSchedule.filter(c => subjectIds.has(c.subjectId));
        for (let d = startOfMonth; d <= endOfMonth; d.setDate(d.getDate() + 1)) {
            const dayOfWeek = d.getDay() === 0 ? 7 : d.getDay();
            classCount += weeklySchedule.filter(c => c.dayOfWeek === dayOfWeek).length;
        }
        
        const studentSet = new Set<number>();
        filteredSubjects.forEach(subject => {
            students
                .filter(s => s.careerId === subject.careerId && (Array.isArray(s.year) ? s.year.includes(subject.year) : s.year === subject.year))
                .forEach(s => studentSet.add(s.id));
        });
        const totalAlumnos = studentSet.size;
        
        return {
            totalMaterias: filteredSubjects.length,
            promedioHoras: weeklyHours,
            clasesMes: classCount,
            lastUpdate: new Date().toLocaleString('es-AR'),
            totalAlumnos,
        };
    }, [filteredSubjects, classSchedule, students]);

    const weeklyHoursBySubject = useMemo(() => {
        return filteredSubjects.map(subject => ({
            id: subject.id,
            name: subject.name,
            hours: classSchedule.filter(c => c.subjectId === subject.id).reduce((total: number, schedule) => {
                const start = new Date(`1970-01-01T${schedule.startTime}:00`);
                const end = new Date(`1970-01-01T${schedule.endTime}:00`);
                return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
            }, 0)
        }));
    }, [filteredSubjects, classSchedule]);

    const progressData = useMemo(() => {
        return filteredSubjects.map(s => ({ id: s.id, name: s.name, progress: Math.floor(s.id.charCodeAt(3) * s.name.length % 50) + 40 })); // Consistent mock
    }, [filteredSubjects]);

    const performanceData = useMemo(() => {
        return filteredSubjects.map(subject => {
            const subjectStudents = students.filter(s => s.careerId === subject.careerId && (Array.isArray(s.year) ? s.year.includes(subject.year) : s.year === subject.year));
            const studentIds = new Set(subjectStudents.map(s => s.id));
            const subjectGrades = grades.filter(g => g.subjectId === subject.id && studentIds.has(g.studentId) && !isNaN(parseFloat(g.value)));
            const avgGrade = subjectGrades.length > 0 ? subjectGrades.reduce((sum: number, g) => sum + parseFloat(g.value), 0) / subjectGrades.length : 0;
            const subjectAttendance = attendanceRecords.filter(r => studentIds.has(r.studentId) && r.subjectId === subject.id);
            const present = subjectAttendance.filter(r => r.status === AttendanceStatus.PRESENT || r.status === AttendanceStatus.JUSTIFIED).length;
            const avgAttendance = subjectAttendance.length > 0 ? (present / subjectAttendance.length) * 100 : 0;
            return { subject: subject.name, subjectId: subject.id, evaluaciones: avgGrade * 10, asistencia: avgAttendance, participacion: (subject.id.charCodeAt(4) % 40) + 50, 'entregadetrabajos': (subject.id.charCodeAt(5) % 30) + 60 };
        });
    }, [filteredSubjects, students, grades, attendanceRecords]);
    
    const tableData = useMemo(() => {
         return filteredSubjects.map(subject => {
             const perf = performanceData.find(p => p.subjectId === subject.id) || { evaluaciones: 0, asistencia: 0 };
             const scheduleInfo = classSchedule.filter(c => c.subjectId === subject.id).map(c => `${['Lu','Ma','Mi','Ju','Vi','Sá','Do'][c.dayOfWeek-1]} ${c.startTime} (${c.classroom})`).join(', ');
             return { materia: subject.name, comision: `${subject.year}° Año`, horario: scheduleInfo, promedioGeneral: (Number(perf.evaluaciones) / 10).toFixed(2), asistencia: `${Number(perf.asistencia).toFixed(0)}%` }
         });
    }, [filteredSubjects, performanceData, classSchedule]);

    return (
        <div className="solid-card w-full flex flex-col p-4 sm:p-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 shrink-0 gap-4">
                <div>
                   <h2 className="text-2xl sm:text-3xl font-bold text-[--color-text-primary]">Materias Asignadas</h2>
                   <p className="text-sm text-[--color-text-secondary]">Un resumen interactivo de tus cursos.</p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <select onChange={(e) => setSelectedSubjectId(e.target.value)} value={selectedSubjectId} className="input-styled w-full sm:w-auto flex-grow">
                        <option value="all">Todas las materias</option>
                        {mySubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <button onClick={onClose} className="btn btn-secondary !px-3"><ArrowLeftIcon className="w-5 h-5"/> <span className="hidden sm:inline">Volver</span></button>
                </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 shrink-0">
                <div className="solid-card p-3 sm:p-4"><p className="text-xs sm:text-sm text-[--color-text-secondary]">Materias</p><p className="text-xl sm:text-2xl font-bold">{summaryStats.totalMaterias}</p></div>
                <div className="solid-card p-3 sm:p-4"><p className="text-xs sm:text-sm text-[--color-text-secondary]">Horas Semanales</p><p className="text-xl sm:text-2xl font-bold">{summaryStats.promedioHoras.toFixed(1)}</p></div>
                <div className="solid-card p-3 sm:p-4"><p className="text-xs sm:text-sm text-[--color-text-secondary]">Clases/Mes</p><p className="text-xl sm:text-2xl font-bold">{summaryStats.clasesMes}</p></div>
                <div className="solid-card p-3 sm:p-4"><p className="text-xs sm:text-sm text-[--color-text-secondary]">Actualizado</p><p className="text-xs sm:text-sm font-bold">{summaryStats.lastUpdate}</p></div>
            </div>
            
            <div className="flex items-center gap-2 p-1 bg-[--color-secondary] rounded-lg mb-4 shrink-0 self-center">
                <TabButton label="Resumen Gráfico" isActive={activeTab === 'resumen'} onClick={() => handleSetTab('resumen')} />
                <TabButton label="Rendimiento" isActive={activeTab === 'rendimiento'} onClick={() => handleSetTab('rendimiento')} />
                <TabButton label="Tabla Detallada" isActive={activeTab === 'tabla'} onClick={() => handleSetTab('tabla')} />
            </div>

            <div key={animationKey} className="animate-fade-in-up">
                {activeTab === 'resumen' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1 solid-card p-4">
                            <h3 className="font-semibold mb-4">Distribución de horas</h3>
                            <div className="space-y-3">
                                {weeklyHoursBySubject.map(item => (
                                    <div key={item.id} onClick={() => setSelectedSubjectId(item.id)} className="cursor-pointer group">
                                        <div className="flex justify-between text-sm mb-1"><span className="font-semibold">{item.name}</span><span>{item.hours} hs</span></div>
                                        <div className="w-full bg-[--color-secondary] rounded-full h-2.5 group-hover:opacity-80 transition-opacity"><div className="bg-[--color-accent] h-2.5 rounded-full" style={{width: `${summaryStats.promedioHoras > 0 ? (item.hours / summaryStats.promedioHoras) * 100 : 0}%`}}></div></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="lg:col-span-2 solid-card p-4">
                            <h3 className="font-semibold mb-2">Progreso académico</h3>
                            <div className="flex flex-wrap justify-around items-center gap-4">
                                {progressData.map(item => (
                                    <div key={item.id} onClick={() => setSelectedSubjectId(item.id)} className="flex flex-col items-center cursor-pointer group p-2 rounded-lg hover:bg-[--color-secondary] transition-colors">
                                        <DoughnutChart progress={item.progress} />
                                        <span className="text-xs font-semibold mt-2 text-center max-w-[100px]">{item.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                 {activeTab === 'rendimiento' && (
                    <div className="solid-card p-4 flex flex-col items-center">
                        <h3 className="font-semibold mb-2 self-start">Rendimiento promedio por materia</h3>
                        <RadarChart data={performanceData} labels={['Evaluaciones', 'Asistencia', 'Participacion', 'Entrega de Trabajos']} />
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs mt-2">
                            {performanceData.map((d,i) => (
                                <button key={d.subjectId} onClick={() => setSelectedSubjectId(d.subjectId)} className="flex items-center gap-1.5 p-1 rounded-md hover:bg-[--color-secondary] transition-colors">
                                    <span className="w-3 h-3 rounded-full" style={{backgroundColor: ['var(--color-accent)', '#3498db', '#e74c3c'][i % 3]}}></span>{d.subject}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                {activeTab === 'tabla' && (
                     <div className="space-y-4">
                        <h3 className="font-semibold">Tabla resumen</h3>
                        {tableData.map(row => {
                            const avgGrade = parseFloat(row.promedioGeneral);
                            const gradeColor = avgGrade >= 7 ? 'text-green-600' : avgGrade >= 4 ? 'text-blue-600' : 'text-red-600';
                            const attendance = parseFloat(row.asistencia);
                            const attendanceColor = attendance >= 85 ? 'text-green-600' : attendance >= 70 ? 'text-yellow-500' : 'text-red-500';
                            
                            return (
                                <div key={row.materia} className="solid-card p-4 rounded-lg">
                                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                                        <div className="flex-1">
                                            <h4 className="font-bold text-lg text-[--color-accent]">{row.materia}</h4>
                                            <p className="text-sm text-[--color-text-secondary]">{row.comision}</p>
                                            <p className="text-xs text-[--color-text-secondary] mt-1">{row.horario}</p>
                                        </div>
                                        <div className="flex gap-4 sm:gap-6 text-center sm:text-right shrink-0">
                                            <div>
                                                <p className="text-xs text-[--color-text-secondary]">Prom. Gral.</p>
                                                <p className={`text-2xl font-bold ${gradeColor}`}>{row.promedioGeneral}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-[--color-text-secondary]">% Asist.</p>
                                                <p className={`text-2xl font-bold ${attendanceColor}`}>{row.asistencia}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

const BottomNavButton: React.FC<{label: string, icon: React.ReactNode, active: boolean, onClick: () => void}> = ({ label, icon, active, onClick}) => (
    <button onClick={onClick} className={`flex flex-col items-center justify-center gap-1 w-full pt-3 pb-2 text-sm transition-colors duration-300 relative ${active ? 'text-[--color-accent]' : 'text-[--color-text-secondary] hover:text-[--color-text-primary]'}`}>
      {icon}
      <span className="text-xs font-medium text-center">{label}</span>
      {active && <div className="absolute bottom-0 w-10 h-1 bg-[--color-accent] rounded-full"></div>}
    </button>
);

export const TeacherDashboard: React.FC<TeacherDashboardProps> = (props) => {
  const { user, onLogout, allUsers, userProfiles, onUpdateProfile, userNotes, onUpdateNotes, theme, setTheme, borderStyle, setBorderStyle, fontStyle, setFontStyle, notifications, markNotificationsAsRead, subjects, students, attendanceRecords, addAttendanceRecord, grades, onUpdateGrades, newsItems, addNewsItem, classSchedule, customEvents, onAddEvent, planificaciones, onUpdatePlanificaciones, materials, onUpdateMaterials, addNotification, studentRepThreads, studentRepReplies, onUpdateStudentRepReplies, studentRepEvents, eventParticipants, onJoinEvent, studentRepClaims, onAddStudentRepClaim } = props;
  
  const [activeView, setActiveView] = useState('inicio');
  const [viewContext, setViewContext] = useState<any>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const mySubjects = useMemo(() => {
    return subjects.filter(s => user.assignedSubjects?.includes(s.id));
  }, [subjects, user.assignedSubjects]);

  const myNotifications = useMemo(() => notifications.filter(n => n.userId === user.id).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()), [notifications, user.id]);
  const unreadNotifications = useMemo(() => myNotifications.filter(n => !n.read).length, [myNotifications]);

  const handleNavigate = (view: string, context: any = null) => {
    setActiveView(view);
    setViewContext(context);
  };
  
  const handleAddStudentRepReply = (replyData: Omit<StudentRepForumReply, 'id' | 'timestamp'>) => {
    onUpdateStudentRepReplies(prev => [...prev, {
        ...replyData,
        id: `srfr-${Date.now()}`,
        timestamp: new Date().toISOString()
    }]);
  };

  const renderCurrentView = () => {
    const userProfile = userProfiles[user.id] || {};
    const myClassSchedule = classSchedule.filter(cs => user.assignedSubjects?.includes(cs.subjectId));
    
    switch(activeView) {
      case 'inicio': return <MateriasView subjects={mySubjects} students={students} onNavigate={handleNavigate} />;
      case 'comunicaciones': return <ComunicacionesView newsItems={newsItems} addNewsItem={addNewsItem} subjects={mySubjects} />;
      case 'asistencia': return <AsistenciaView initialSubject={viewContext} subjects={mySubjects} students={students} attendanceRecords={attendanceRecords} addAttendanceRecord={addAttendanceRecord} currentUser={user} />;
      case 'calificaciones': return <CalificacionesView initialSubject={viewContext} subjects={mySubjects} students={students} grades={grades} onUpdateGrades={onUpdateGrades} profile={userProfile} />;
      case 'agenda': return <AgendaView user={user} userProfile={userProfile} newsItems={newsItems} subjects={mySubjects} classSchedule={classSchedule} customEvents={customEvents} onAddEvent={onAddEvent} addNotification={addNotification} />;
      case 'horarios': return <HorariosView user={user} userProfile={userProfile} onUpdateProfile={(data) => onUpdateProfile(user.id, data)} subjects={mySubjects} classSchedule={myClassSchedule} addNotification={addNotification} />;
      case 'materias_overview': return <MateriasOverview user={user} allSubjects={subjects} students={students} attendanceRecords={attendanceRecords} grades={grades} classSchedule={classSchedule} onClose={() => handleNavigate('inicio')} />;
      case 'alumnos_overview': return <AlumnosOverview user={user} allSubjects={subjects} students={students} attendanceRecords={attendanceRecords} grades={grades} classSchedule={classSchedule} onClose={() => handleNavigate('inicio')} />;
      case 'planificaciones': return <PlanificacionesView user={user} subjects={mySubjects} planificaciones={planificaciones.filter(p => mySubjects.some(s => s.id === p.subjectId))} onUpdatePlanificaciones={onUpdatePlanificaciones} />;
      case 'material': return <MaterialDidacticoView subjects={mySubjects} materials={materials} onUpdateMaterials={onUpdateMaterials} addNotification={addNotification} allUsers={allUsers}/>;
      case 'reportes': return <ReportesView user={user} subjects={mySubjects} students={students} grades={grades} attendanceRecords={attendanceRecords} />;
      case 'opciones': return <OpcionesView user={user} subjects={mySubjects} profile={userProfile} onSave={(data) => onUpdateProfile(user.id, data)} />;
      case 'profile': return <ProfileView viewedUser={user} currentUser={user} profileData={userProfiles[user.id] || {}} onUpdateProfile={(data) => onUpdateProfile(user.id, data)} onBack={() => setActiveView('inicio')} />;
      case 'appearance': return <AppearanceView currentTheme={theme} onSetTheme={setTheme} currentBorderStyle={borderStyle} onSetBorderStyle={setBorderStyle} currentFontStyle={fontStyle} onSetFontStyle={setFontStyle} />;
      case 'comunidad': return <CommunityView 
        currentUser={user}
        allUsers={allUsers}
        studentRepEvents={studentRepEvents}
        eventParticipants={eventParticipants}
        onJoinEvent={onJoinEvent}
        threads={studentRepThreads}
        replies={studentRepReplies}
        onAddReply={handleAddStudentRepReply}
        studentRepClaims={studentRepClaims}
        subjects={subjects}
        students={students}
        onAddStudentRepClaim={onAddStudentRepClaim}
      />;
      default: return null;
    }
  };

  const profilePic = userProfiles[user.id]?.profilePicture;
  
  return (
    <>
      <header className="bg-[--color-header-bg] backdrop-blur-lg sticky top-0 z-30 border-b border-black/10 transition-colors duration-500">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            <button onClick={() => handleNavigate('inicio')} className="flex items-center gap-3 cursor-pointer"><BookOpenIcon className="h-12 w-12 text-[--color-accent]" /><span className="text-xl font-bold">Panel Docente</span></button>
            <div className="relative z-50" ref={userMenuRef}>
              <button onClick={() => setIsUserMenuOpen(p => !p)} className="flex items-center gap-2 p-2 rounded-lg hover:bg-black/5 transition-colors">
                  {profilePic ? <img src={profilePic} alt="Perfil" className="w-8 h-8 rounded-full object-cover bg-[--color-secondary]"/> : <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[--color-secondary]"><UserIcon className="w-5 h-5 text-[--color-accent]"/></div>}
                  <ChevronDownIcon className={`w-5 h-5 text-[--color-text-secondary] transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`}/>
              </button>
              {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-72 solid-card animate-fade-in-up p-2" style={{animationDuration: '0.2s'}}>
                    <div className="space-y-1">
                        <button onClick={() => handleNavigate('profile')} className="w-full flex items-center gap-3 text-left px-3 py-2 text-[--color-text-primary] hover:bg-black/5 rounded-lg transition-colors"><UserIcon/>Mi Perfil</button>
                        <button onClick={() => handleNavigate('comunicaciones')} className="w-full flex items-center gap-3 text-left px-3 py-2 text-[--color-text-primary] hover:bg-black/5 rounded-lg transition-colors"><MegaphoneIcon/>Comunicaciones</button>
                        <button onClick={() => handleNavigate('horarios')} className="w-full flex items-center gap-3 text-left px-3 py-2 text-[--color-text-primary] hover:bg-black/5 rounded-lg transition-colors"><ClockIcon/>Mis Horarios</button>
                        <button onClick={() => handleNavigate('comunidad')} className="w-full flex items-center gap-3 text-left px-3 py-2 text-[--color-text-primary] hover:bg-black/5 rounded-lg transition-colors"><UsersIcon/>Comunidad</button>
                        <button onClick={() => handleNavigate('opciones')} className="w-full flex items-center gap-3 text-left px-3 py-2 text-[--color-text-primary] hover:bg-black/5 rounded-lg transition-colors"><SettingsIcon/>Opciones</button>
                        <button onClick={() => handleNavigate('appearance')} className="w-full flex items-center gap-3 text-left px-3 py-2 text-[--color-text-primary] hover:bg-black/5 rounded-lg transition-colors"><AppearanceIcon/>Apariencia</button>
                    </div>
                    <div className="p-2 mt-2 border-t border-[--color-border]"><button onClick={onLogout} className="w-full flex items-center gap-3 text-left px-3 py-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"><LogoutIcon/>Cerrar Sesión</button></div>
                  </div>
              )}
            </div>
        </nav>
      </header>
      
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
          <div className="pb-24 md:pb-0 relative">
            {activeView === 'inicio' && <WelcomeBanner user={user} subjects={mySubjects} students={students} classSchedule={classSchedule} unreadNotifications={unreadNotifications} onBellClick={() => setIsNotificationPanelOpen(p => !p)} onNavigate={handleNavigate} />}
            {isNotificationPanelOpen && <NotificationPanel notifications={myNotifications} onClose={() => setIsNotificationPanelOpen(false)} onMarkAllRead={() => markNotificationsAsRead(user.id)} />}
            <div className={activeView === 'inicio' ? "mt-8" : ""}>{renderCurrentView()}</div>
          </div>
      </main>
      
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[--color-primary] border-t border-[--color-border] z-40 shadow-[0_-2px_10px_rgba(var(--color-shadow-rgb),0.1)]">
        <nav className="flex justify-around items-center">
            <BottomNavButton label="Materias" icon={<BookOpenIcon className="w-6 h-6"/>} active={activeView === 'inicio'} onClick={() => handleNavigate('inicio')}/>
            <BottomNavButton label="Planif." icon={<FileTextIcon className="w-6 h-6"/>} active={activeView === 'planificaciones'} onClick={() => handleNavigate('planificaciones')}/>
            <BottomNavButton label="Material" icon={<FolderIcon className="w-6 h-6"/>} active={activeView === 'material'} onClick={() => handleNavigate('material')}/>
            <BottomNavButton label="Reportes" icon={<ChartBarIcon className="w-6 h-6"/>} active={activeView === 'reportes'} onClick={() => handleNavigate('reportes')}/>
            <BottomNavButton label="Agenda" icon={<CalendarIcon className="w-6 h-6"/>} active={activeView === 'agenda'} onClick={() => handleNavigate('agenda')}/>
        </nav>
      </div>
    </>
  );
};
