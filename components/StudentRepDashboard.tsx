import React, { useState, useMemo, useRef, useEffect } from 'react';
import { User, UserProfileData, Note, StudentRepEvent, StudentRepEventType, StudentRepForumCategory, StudentRepForumThread, StudentRepForumReply, StudentRepAnnouncement, StudentRepClaim, StudentRepClaimStatus, StudentRepClaimCategory, JustificationFile, Role } from '../types';
import { HomeIcon, CalendarIcon, UsersIcon, MegaphoneIcon, InboxIcon, BellIcon, UserIcon as ProfileIcon, ChevronDownIcon, LogoutIcon, AppearanceIcon, BookOpenIcon, NewspaperIcon, SparklesIcon, FootballIcon, PlusCircleIcon, PencilIcon, TrashIcon, XCircleIcon, MessageSquareIcon, SendIcon, ArrowLeftIcon, DownloadIcon, LinkIcon, ClockIcon, EyeIcon, FileTextIcon } from './Icons';
import { Theme, BorderStyle, FontStyle } from '../App';
import { NotificationPanel } from './NotificationPanel';
import { ProfileView } from './ProfileView';
import { AppearanceView } from './AppearanceModal';

interface DashboardProps {
  user: User;
  onLogout: () => void;
  allUsers: User[];
  userProfiles: Record<string, UserProfileData>;
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
  studentRepEvents?: StudentRepEvent[];
  onUpdateStudentRepEvents?: (events: StudentRepEvent[] | ((prev: StudentRepEvent[]) => StudentRepEvent[])) => void;
  studentRepThreads?: StudentRepForumThread[];
  onUpdateStudentRepThreads?: (threads: StudentRepForumThread[] | ((prev: StudentRepForumThread[]) => StudentRepForumThread[])) => void;
  studentRepReplies?: StudentRepForumReply[];
  onUpdateStudentRepReplies?: (replies: StudentRepForumReply[] | ((prev: StudentRepForumReply[]) => StudentRepForumReply[])) => void;
  studentRepAnnouncements?: StudentRepAnnouncement[];
  onUpdateStudentRepAnnouncements?: (announcements: StudentRepAnnouncement[] | ((prev: StudentRepAnnouncement[]) => StudentRepAnnouncement[])) => void;
  studentRepClaims?: StudentRepClaim[];
  onUpdateStudentRepClaims?: (claims: StudentRepClaim[] | ((prev: StudentRepClaim[]) => StudentRepClaim[])) => void;
  eventParticipants?: Record<string, number[]>;
}

// FIX: Hoisted TimeAgo component to the top-level scope to avoid redeclaration issues.
const TimeAgo: React.FC<{ date: string }> = ({ date }) => {
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diffInSeconds < 60) return <span>hace {diffInSeconds}s</span>;
    if (diffInSeconds < 3600) return <span>hace {Math.floor(diffInSeconds / 60)}m</span>;
    if (diffInSeconds < 86400) return <span>hace {Math.floor(diffInSeconds / 3600)}h</span>;
    return <span>hace {Math.floor(diffInSeconds / 86400)}d</span>;
}

const WelcomeBanner: React.FC<{ user: User, unreadNotifications: number, onBellClick: () => void }> = ({ user, unreadNotifications, onBellClick }) => (
    <div className="welcome-banner animate-fade-in relative">
        <button onClick={onBellClick} className="absolute top-6 right-6 p-2 rounded-full hover:bg-black/10 transition-colors z-10">
            <BellIcon className="w-6 h-6 text-[--color-text-secondary]" />
            {unreadNotifications > 0 && <span className="absolute top-1 right-1 block h-3 w-3 rounded-full bg-red-500 ring-2 ring-[--color-primary]"></span>}
        </button>
        <h1 className="text-4xl font-bold text-[--color-text-primary] mb-2">Hola, {user.name.split(' ')[0]}</h1>
        <p className="text-lg text-[--color-text-secondary]">La voz de los estudiantes.</p>
    </div>
);

const BottomNavButton: React.FC<{label: string, icon: React.ReactNode, active: boolean, onClick: () => void}> = ({ label, icon, active, onClick}) => (
    <button onClick={onClick} className={`flex flex-col items-center justify-center gap-1 w-full pt-3 pb-2 text-sm transition-colors duration-300 relative ${active ? 'text-[--color-accent]' : 'text-[--color-text-secondary] hover:text-[--color-text-primary]'}`}>
      {icon}
      <span className="text-xs font-medium text-center">{label}</span>
      {active && <div className="absolute bottom-0 w-10 h-1 bg-[--color-accent] rounded-full"></div>}
    </button>
);

const InicioView: React.FC<{
    user: User;
    onNavigate: (view: string) => void;
    events: StudentRepEvent[];
    announcements: StudentRepAnnouncement[];
}> = ({ user, onNavigate, events, announcements }) => {
    
    const nextEvent = useMemo(() => {
        const upcomingEvents = (events || [])
            .filter(e => new Date(e.date) >= new Date())
            .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        return upcomingEvents[0] || null;
    }, [events]);

    const latestAnnouncement = useMemo(() => {
        return (announcements || []).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0] || null;
    }, [announcements]);

    return (
        <div className="space-y-6 animate-fade-in-up">
            {/* Next Event Card */}
            {nextEvent && (
                <button onClick={() => onNavigate('eventos')} className="solid-card p-6 text-left w-full transform hover:-translate-y-1 transition-transform">
                    <h2 className="text-xl font-bold text-[--color-text-primary] mb-2">Próximo Evento</h2>
                    <div className="flex items-center gap-4">
                        <CalendarIcon className="w-8 h-8 text-[--color-accent] shrink-0"/>
                        <div>
                            <p className="font-semibold text-[--color-text-primary]">{nextEvent.title}</p>
                            <p className="text-sm text-[--color-text-secondary]">
                                {new Date(nextEvent.date + 'T00:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
                                {nextEvent.time && ` a las ${nextEvent.time}hs`}
                            </p>
                        </div>
                    </div>
                </button>
            )}

            {/* Latest Announcement Card */}
            {latestAnnouncement && (
                 <button onClick={() => onNavigate('anuncios')} className="solid-card p-6 text-left w-full transform hover:-translate-y-1 transition-transform">
                    <h2 className="text-xl font-bold text-[--color-text-primary] mb-2">Último Comunicado</h2>
                    <div className="flex items-center gap-4">
                         <NewspaperIcon className="w-8 h-8 text-[--color-accent] shrink-0"/>
                         <div>
                            <p className="font-semibold text-[--color-text-primary]">{latestAnnouncement.title}</p>
                            <p className="text-sm text-[--color-text-secondary] line-clamp-2">{latestAnnouncement.content}</p>
                         </div>
                    </div>
                </button>
            )}

            {/* Miembros del Centro Card */}
            <button onClick={() => onNavigate('miembros_centro')} className="solid-card p-6 text-left w-full transform hover:-translate-y-1 transition-transform">
                <div className="flex items-center gap-4">
                    <UsersIcon className="w-8 h-8 text-[--color-accent] shrink-0"/>
                    <div>
                        <h2 className="text-xl font-bold text-[--color-text-primary]">Miembros del Centro</h2>
                        <p className="text-[--color-text-secondary] mt-1">Conoce a tus representantes.</p>
                    </div>
                </div>
            </button>
        </div>
    );
};


// --- Crear Comunicado View Components ---

const PreviewModal: React.FC<{
    title: string;
    content: string;
    files: JustificationFile[];
    onClose: () => void;
}> = ({ title, content, files, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="glass-card w-full max-w-2xl p-6 max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-start mb-4">
                    <h2 className="text-2xl font-bold text-[--color-text-primary]">Vista Previa del Comunicado</h2>
                    <button onClick={onClose} className="text-3xl text-[--color-text-secondary] hover:text-[--color-text-primary]">&times;</button>
                </div>
                <div className="overflow-y-auto pr-2">
                    <h3 className="text-xl font-bold text-[--color-accent] mb-2">{title}</h3>
                    <p className="whitespace-pre-wrap text-[--color-text-primary]">{content}</p>
                    {files.length > 0 && (
                        <div className="mt-6">
                            <h4 className="font-semibold text-[--color-text-secondary] mb-2">Archivos Adjuntos:</h4>
                            <ul className="space-y-2">
                                {files.map(file => (
                                    <li key={file.name} className="flex items-center gap-2 text-sm text-[--color-text-secondary]">
                                        <LinkIcon className="w-4 h-4" /> {file.name}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
                <button onClick={onClose} className="btn btn-secondary mt-6 w-full">Cerrar</button>
            </div>
        </div>
    );
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

const CrearComunicadoView: React.FC<{
    user: User;
    onSave: (announcement: Omit<StudentRepAnnouncement, 'id' | 'authorId' | 'timestamp'>) => void;
    onCancel: () => void;
}> = ({ user, onSave, onCancel }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [files, setFiles] = useState<JustificationFile[]>([]);
    const [isScheduled, setIsScheduled] = useState(false);
    const [publishDate, setPublishDate] = useState(new Date().toISOString().split('T')[0]);
    const [publishTime, setPublishTime] = useState('09:00');
    const [showPreview, setShowPreview] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [error, setError] = useState('');

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const selectedFiles = Array.from(e.target.files);
        if (files.length + selectedFiles.length > 5) {
            setError('Puedes adjuntar un máximo de 5 archivos.');
            return;
        }
        try {
            const newFiles = await Promise.all(selectedFiles.map(fileToBase64));
            setFiles(prev => [...prev, ...newFiles]);
            setError('');
        } catch (err) {
            setError('Error al procesar los archivos.');
        }
    };

    const handleRemoveFile = (fileName: string) => {
        setFiles(prev => prev.filter(f => f.name !== fileName));
    };

    const handleSubmit = () => {
        if (!title.trim() || !content.trim()) {
            setError('El título y el contenido son obligatorios.');
            return;
        }
        setError('');
        let finalPublishDate: string | undefined = undefined;
        if (isScheduled) {
            finalPublishDate = new Date(`${publishDate}T${publishTime}`).toISOString();
        }
        onSave({ title, content, files, publishDate: finalPublishDate });
    };

    return (
        <div className="animate-fade-in-up max-w-3xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                 <button onClick={onCancel} className="btn btn-secondary !p-2"><ArrowLeftIcon className="w-5 h-5"/></button>
                 <div>
                    <h1 className="text-3xl font-bold text-[--color-text-primary]">Crear Comunicado</h1>
                    <p className="text-[--color-text-secondary]">Redacta y publica anuncios para la comunidad.</p>
                </div>
            </div>
            <div className="solid-card p-6 space-y-6">
                <div>
                    <label htmlFor="comm-title" className="block text-sm font-medium text-[--color-text-secondary] mb-1">Título</label>
                    <input id="comm-title" type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Ej: Convocatoria para el torneo de fútbol" className="input-styled w-full"/>
                </div>
                <div>
                    <label htmlFor="comm-content" className="block text-sm font-medium text-[--color-text-secondary] mb-1">Contenido del Comunicado</label>
                    <textarea id="comm-content" value={content} onChange={e => setContent(e.target.value)} rows={10} placeholder="Escribe aquí los detalles del anuncio..." className="input-styled w-full"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-[--color-text-secondary] mb-2">Archivos Adjuntos</label>
                    <input type="file" multiple ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
                    <button onClick={() => fileInputRef.current?.click()} className="btn btn-secondary w-full"><LinkIcon className="w-5 h-5"/> Adjuntar Archivos</button>
                    <div className="mt-3 space-y-2">
                        {files.map(file => (
                            <div key={file.name} className="flex justify-between items-center bg-[--color-secondary] p-2 rounded-md text-sm">
                                <span className="text-[--color-text-primary] truncate">{file.name}</span>
                                <button onClick={() => handleRemoveFile(file.name)} className="text-red-500 hover:text-red-700 p-1"><TrashIcon className="w-4 h-4"/></button>
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-[--color-text-secondary] mb-2">Opciones de Publicación</label>
                    <div className="grid grid-cols-2 gap-2 p-1 bg-[--color-secondary] rounded-lg">
                        <button onClick={() => setIsScheduled(false)} className={`py-2 px-4 font-semibold text-sm rounded-md transition-all ${!isScheduled ? 'bg-[--color-primary] shadow text-[--color-accent]' : 'text-[--color-text-secondary]'}`}>Publicar Ahora</button>
                        <button onClick={() => setIsScheduled(true)} className={`py-2 px-4 font-semibold text-sm rounded-md transition-all ${isScheduled ? 'bg-[--color-primary] shadow text-[--color-accent]' : 'text-[--color-text-secondary]'}`}>Programar</button>
                    </div>
                    {isScheduled && (
                        <div className="grid grid-cols-2 gap-4 mt-3 animate-fade-in">
                            <input type="date" value={publishDate} onChange={e => setPublishDate(e.target.value)} className="input-styled w-full"/>
                            <input type="time" value={publishTime} onChange={e => setPublishTime(e.target.value)} className="input-styled w-full"/>
                        </div>
                    )}
                </div>
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-[--color-border]">
                    <button onClick={() => setShowPreview(true)} className="btn btn-secondary"><EyeIcon className="w-5 h-5"/> Vista Previa</button>
                    <button onClick={handleSubmit} className="btn btn-primary"><MegaphoneIcon className="w-5 h-5"/> {isScheduled ? 'Programar' : 'Publicar'}</button>
                </div>
            </div>
            {showPreview && <PreviewModal title={title} content={content} files={files} onClose={() => setShowPreview(false)} />}
        </div>
    );
};


// --- Eventos View Components ---

const eventTypeDetails: Record<StudentRepEventType, { label: string; icon: React.ReactNode; color: string }> = {
    'académico': { label: 'Académico', icon: <BookOpenIcon className="w-5 h-5" />, color: 'text-blue-500' },
    'cultural': { label: 'Cultural', icon: <SparklesIcon className="w-5 h-5" />, color: 'text-purple-500' },
    'deportivo': { label: 'Deportivo', icon: <FootballIcon className="w-5 h-5" />, color: 'text-green-500' },
    'reunión': { label: 'Reunión', icon: <UsersIcon className="w-5 h-5" />, color: 'text-yellow-600' },
};

const EventEditorModal: React.FC<{
    event?: StudentRepEvent | null;
    onClose: () => void;
    onSave: (event: Omit<StudentRepEvent, 'id' | 'organizer'> & { id?: string }) => void;
}> = ({ event, onClose, onSave }) => {
    const [title, setTitle] = useState(event?.title || '');
    const [date, setDate] = useState(event?.date || new Date().toISOString().split('T')[0]);
    const [time, setTime] = useState(event?.time || '');
    const [location, setLocation] = useState(event?.location || '');
    const [type, setType] = useState<StudentRepEventType>(event?.type || 'académico');
    const [description, setDescription] = useState(event?.description || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!title.trim() || !date.trim()) return;
        onSave({ id: event?.id, title, date, time, location, type, description });
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <form onSubmit={handleSubmit} className="glass-card w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-[--color-text-primary] mb-6">{event ? 'Editar Evento' : 'Crear Evento'}</h2>
                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    <input type="text" placeholder="Título" value={title} onChange={e => setTitle(e.target.value)} className="input-styled w-full" required />
                    <div className="grid grid-cols-2 gap-4">
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="input-styled w-full" required />
                        <input type="time" value={time} onChange={e => setTime(e.target.value)} className="input-styled w-full" />
                    </div>
                    <input type="text" placeholder="Ubicación" value={location} onChange={e => setLocation(e.target.value)} className="input-styled w-full" />
                    <select value={type} onChange={e => setType(e.target.value as StudentRepEventType)} className="input-styled w-full">
                        {Object.entries(eventTypeDetails).map(([key, details]) => <option key={key} value={key}>{details.label}</option>)}
                    </select>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} placeholder="Descripción del evento..." className="input-styled w-full" required />
                </div>
                <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-[--color-border]">
                    <button type="button" onClick={onClose} className="btn btn-secondary">Cancelar</button>
                    <button type="submit" className="btn btn-primary">Guardar</button>
                </div>
            </form>
        </div>
    );
};

const EventDetailModal: React.FC<{
    event: StudentRepEvent;
    onClose: () => void;
    onEdit: () => void;
    onDelete: () => void;
    participants: number[];
    userMap: Map<number, string>;
}> = ({ event, onClose, onEdit, onDelete, participants, userMap }) => {
    const details = eventTypeDetails[event.type];
    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="glass-card w-full max-w-lg p-6 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                 <div className="flex justify-between items-start">
                    <div>
                        <div className={`flex items-center gap-2 font-bold text-sm ${details.color}`}>{details.icon} {details.label}</div>
                        <h2 className="text-2xl font-bold text-[--color-text-primary] mt-2">{event.title}</h2>
                    </div>
                    <button onClick={onClose} className="text-3xl text-[--color-text-secondary] hover:text-[--color-text-primary]">&times;</button>
                 </div>
                <div className="text-[--color-text-secondary] text-sm mt-4 space-y-2">
                    <p className="flex items-center gap-2"><CalendarIcon className="w-5 h-5"/> {new Date(event.date + 'T00:00:00').toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })} {event.time && `a las ${event.time} hs`}</p>
                    {event.location && <p className="flex items-center gap-2"><MegaphoneIcon className="w-5 h-5"/> {event.location}</p>}
                </div>
                <p className="mt-4 text-[--color-text-primary] whitespace-pre-wrap">{event.description}</p>
                <div className="mt-4 pt-4 border-t border-[--color-border]">
                    <h4 className="font-bold text-[--color-text-primary] mb-2">Asistentes ({participants.length})</h4>
                    {participants.length > 0 ? (
                        <div className="max-h-40 overflow-y-auto bg-[--color-secondary] p-3 rounded-lg">
                            <ul className="space-y-2">
                                {participants.map(userId => (
                                    <li key={userId} className="text-sm text-[--color-text-primary]">{userMap.get(userId) || `ID: ${userId}`}</li>
                                ))}
                            </ul>
                        </div>
                    ) : (
                        <p className="text-sm text-center text-[--color-text-secondary] p-4 bg-[--color-secondary] rounded-lg">Aún no hay inscriptos.</p>
                    )}
                </div>
                <div className="flex justify-end gap-3 pt-6 mt-auto">
                    <button onClick={onDelete} className="btn btn-danger"><TrashIcon className="w-5 h-5"/> Eliminar</button>
                    <button onClick={onEdit} className="btn btn-primary"><PencilIcon className="w-5 h-5"/> Editar</button>
                </div>
            </div>
        </div>
    );
}

const EventosView: React.FC<{
    events: StudentRepEvent[],
    onUpdateEvents: (events: StudentRepEvent[] | ((prev: StudentRepEvent[]) => StudentRepEvent[])) => void,
    participants: Record<string, number[]>,
    allUsers: User[],
}> = ({ events, onUpdateEvents, participants, allUsers }) => {
    const [filter, setFilter] = useState<'todos' | StudentRepEventType>('todos');
    const [selectedEvent, setSelectedEvent] = useState<StudentRepEvent | null>(null);
    const [editingEvent, setEditingEvent] = useState<StudentRepEvent | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    const userMap = useMemo(() => new Map(allUsers.map(u => [u.id, u.name])), [allUsers]);

    const filteredEvents = useMemo(() => {
        return (filter === 'todos' ? events : events.filter(e => e.type === filter))
            .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [events, filter]);

    const handleSaveEvent = (eventData: Omit<StudentRepEvent, 'id' | 'organizer'> & { id?: string }) => {
        if (eventData.id) { // Editing existing
            onUpdateEvents(prev => prev.map(e => e.id === eventData.id ? { ...e, ...eventData } : e));
        } else { // Creating new
            const newEvent: StudentRepEvent = {
                ...eventData,
                id: `sre-${Date.now()}`,
                organizer: 'Centro de Estudiantes',
            };
            onUpdateEvents(prev => [...prev, newEvent]);
        }
        setEditingEvent(null);
        setIsCreating(false);
        setSelectedEvent(null);
    };

    const handleDeleteEvent = (id: string) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este evento?')) {
            onUpdateEvents(prev => prev.filter(e => e.id !== id));
            setSelectedEvent(null);
        }
    }

    return (
        <div className="animate-fade-in-up">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-[--color-text-primary]">Agenda de Actividades</h2>
                    <p className="text-[--color-text-secondary]">Creación y gestión de eventos estudiantiles.</p>
                </div>
                <button onClick={() => setIsCreating(true)} className="btn btn-primary self-start md:self-center"><PlusCircleIcon className="w-5 h-5"/> Crear Evento</button>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 p-1 bg-[--color-secondary] rounded-lg mb-6 self-start">
                <button onClick={() => setFilter('todos')} className={`py-1.5 px-4 font-semibold text-sm rounded-md transition-all ${filter === 'todos' ? 'bg-[--color-primary] shadow text-[--color-accent]' : 'text-[--color-text-secondary]'}`}>Todos</button>
                {Object.entries(eventTypeDetails).map(([key, details]) => (
                    <button key={key} onClick={() => setFilter(key as StudentRepEventType)} className={`py-1.5 px-4 font-semibold text-sm rounded-md transition-all ${filter === key ? 'bg-[--color-primary] shadow text-[--color-accent]' : 'text-[--color-text-secondary]'}`}>{details.label}</button>
                ))}
            </div>

            <div className="space-y-4">
                {filteredEvents.map(event => {
                    const details = eventTypeDetails[event.type];
                    const eventParticipants = participants[event.id] || [];
                    return (
                        <button key={event.id} onClick={() => setSelectedEvent(event)} className="solid-card p-4 w-full text-left transform hover:-translate-y-1 transition-transform">
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                <div className="flex items-start gap-4">
                                    <div className={`mt-1 ${details.color}`}>{React.cloneElement(details.icon as React.ReactElement, { className: "w-8 h-8" })}</div>
                                    <div>
                                        <p className="font-bold text-lg text-[--color-text-primary]">{event.title}</p>
                                        <p className="text-sm text-[--color-text-secondary]">{event.location}</p>
                                        <div className="flex items-center gap-1 mt-2 text-sm text-[--color-text-secondary]">
                                            <UsersIcon className="w-5 h-5"/>
                                            <span>{eventParticipants.length} asistirán</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right shrink-0 self-center sm:self-auto">
                                    <p className="font-bold text-lg text-[--color-text-primary]">{new Date(event.date + 'T00:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}</p>
                                    <p className="text-sm text-[--color-text-secondary]">{event.time}</p>
                                </div>
                            </div>
                        </button>
                    )
                })}
                 {filteredEvents.length === 0 && (
                    <div className="text-center text-[--color-text-secondary] py-16 solid-card">
                        <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-50"/>
                        <p>No hay eventos en esta categoría.</p>
                    </div>
                 )}
            </div>
            
            {selectedEvent && <EventDetailModal event={selectedEvent} onClose={() => setSelectedEvent(null)} onEdit={() => { setEditingEvent(selectedEvent); setSelectedEvent(null); }} onDelete={() => handleDeleteEvent(selectedEvent.id)} participants={participants[selectedEvent.id] || []} userMap={userMap} />}
            {(isCreating || editingEvent) && <EventEditorModal event={editingEvent} onClose={() => { setIsCreating(false); setEditingEvent(null); }} onSave={handleSaveEvent} />}
        </div>
    );
};

const ComunidadView: React.FC<{
    currentUser: User;
    allUsers: User[];
    userProfiles: Record<number, UserProfileData>;
    threads: StudentRepForumThread[];
    onUpdateThreads: (threads: StudentRepForumThread[] | ((prev: StudentRepForumThread[]) => StudentRepForumThread[])) => void;
    replies: StudentRepForumReply[];
    onUpdateReplies: (replies: StudentRepForumReply[] | ((prev: StudentRepForumReply[]) => StudentRepForumReply[])) => void;
}> = ({ currentUser, allUsers, userProfiles, threads, onUpdateThreads, replies, onUpdateReplies }) => {
    const [filter, setFilter] = useState<'all' | StudentRepForumCategory>('all');
    const [selectedThread, setSelectedThread] = useState<StudentRepForumThread | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [newReply, setNewReply] = useState('');
    
    const userMap = useMemo(() => new Map(allUsers.map(u => [u.id, u.name])), [allUsers]);

    const filteredThreads = useMemo(() => {
        return (filter === 'all' ? threads : threads.filter(t => t.category === filter))
            .sort((a, b) => (b.isPinned ? 1 : -1) - (a.isPinned ? 1 : -1) || new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [threads, filter]);
    
    const handleSaveThread = (data: Omit<StudentRepForumThread, 'id' | 'authorId' | 'timestamp'> & {id?: string}) => {
        if(data.id) { // Editing
            onUpdateThreads(prev => prev.map(t => t.id === data.id ? {...t, ...data} : t));
        } else { // Creating
            const newThread: StudentRepForumThread = {
                ...data,
                id: `srft-${Date.now()}`,
                authorId: currentUser.id,
                timestamp: new Date().toISOString(),
            };
            onUpdateThreads(prev => [newThread, ...prev]);
        }
        setIsCreating(false);
    };
    
    const handleAddReply = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newReply.trim() || !selectedThread) return;
        const newReplyData: StudentRepForumReply = {
            id: `srfr-${Date.now()}`,
            threadId: selectedThread.id,
            authorId: currentUser.id,
            content: newReply,
            timestamp: new Date().toISOString(),
        };
        onUpdateReplies(prev => [...prev, newReplyData]);
        setNewReply('');
    };
    
    if (isCreating) {
        return <PostEditor onSave={handleSaveThread} onClose={() => setIsCreating(false)} />;
    }
    
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
                            <ProfileIcon className="w-8 h-8 rounded-full bg-[--color-secondary] p-1 text-[--color-text-secondary] shrink-0"/>
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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-[--color-text-primary]">Comunidad</h2>
                    <p className="text-[--color-text-secondary]">Foros y espacios de discusión para estudiantes.</p>
                </div>
                <button onClick={() => setIsCreating(true)} className="btn btn-primary self-start md:self-center"><PencilIcon className="w-5 h-5"/> Crear Publicación</button>
            </div>
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
                            <ProfileIcon className="w-10 h-10 rounded-full bg-[--color-secondary] p-2 text-[--color-text-secondary] shrink-0"/>
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

const PostEditor: React.FC<{
    initialPost?: StudentRepForumThread;
    onSave: (post: Omit<StudentRepForumThread, 'id' | 'authorId' | 'timestamp'> & {id?: string}) => void;
    onClose: () => void;
}> = ({initialPost, onSave, onClose}) => {
    const [title, setTitle] = useState(initialPost?.title || '');
    const [content, setContent] = useState(initialPost?.content || '');
    const [category, setCategory] = useState<StudentRepForumCategory>(initialPost?.category || 'general');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!title.trim() || !content.trim()) return;
        onSave({ id: initialPost?.id, title, content, category });
    };

    return(
        <form onSubmit={handleSubmit} className="animate-fade-in">
             <button onClick={onClose} className="btn btn-secondary mb-6"><ArrowLeftIcon className="w-5 h-5"/> Volver al foro</button>
             <div className="solid-card p-6">
                <h2 className="text-2xl font-bold mb-4">{initialPost ? 'Editar' : 'Nueva'} Publicación</h2>
                <div className="space-y-4">
                    <input type="text" placeholder="Título" value={title} onChange={e=>setTitle(e.target.value)} className="input-styled w-full text-lg" required />
                    <select value={category} onChange={e => setCategory(e.target.value as StudentRepForumCategory)} className="input-styled w-full">
                        <option value="general">General</option>
                        <option value="propuestas">Propuestas</option>
                        <option value="eventos">Eventos</option>
                    </select>
                    <textarea value={content} onChange={e=>setContent(e.target.value)} placeholder="Escribe tu mensaje..." rows={8} className="input-styled w-full" required />
                </div>
                <div className="flex justify-end mt-4">
                    <button type="submit" className="btn btn-primary">Publicar</button>
                </div>
             </div>
        </form>
    );
}

const AnunciosView: React.FC<{
    announcements: StudentRepAnnouncement[],
    onUpdateAnnouncements: (announcements: StudentRepAnnouncement[] | ((prev: StudentRepAnnouncement[]) => StudentRepAnnouncement[])) => void;
    user: User,
    allUsers: User[],
}> = ({ announcements, onUpdateAnnouncements, user, allUsers }) => {
    const [selected, setSelected] = useState<StudentRepAnnouncement | null>(null);
    const [isEditing, setIsEditing] = useState<StudentRepAnnouncement | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const userMap = useMemo(() => new Map(allUsers.map(u => [u.id, u.name])), [allUsers]);

    const sortedAnnouncements = useMemo(() => {
        return [...announcements].sort((a, b) => (b.isPinned ? 1 : -1) - (a.isPinned ? 1 : -1) || new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [announcements]);

    const handleSave = (data: Omit<StudentRepAnnouncement, 'id' | 'authorId' | 'timestamp'> & {id?: string}) => {
        if (data.id) { // Editing
            onUpdateAnnouncements(prev => prev.map(a => a.id === data.id ? {...a, ...data, timestamp: new Date().toISOString()} : a));
        } else { // Creating
            const newAnnouncement: StudentRepAnnouncement = { ...data, id: `sra-${Date.now()}`, authorId: user.id, timestamp: new Date().toISOString() };
            onUpdateAnnouncements(prev => [newAnnouncement, ...prev]);
        }
        setIsEditing(null);
        setIsCreating(false);
        setSelected(null);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('¿Seguro que quieres eliminar este anuncio?')) {
            onUpdateAnnouncements(prev => prev.filter(a => a.id !== id));
            setSelected(null);
        }
    };

    return (
        <div className="animate-fade-in-up">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-[--color-text-primary]">Anuncios</h2>
                    <p className="text-[--color-text-secondary]">Publica comunicados para todos los alumnos.</p>
                </div>
                <button onClick={() => setIsCreating(true)} className="btn btn-primary self-start md:self-center"><PlusCircleIcon className="w-5 h-5"/> Crear Anuncio</button>
            </div>

            <div className="space-y-4">
                {sortedAnnouncements.map(announcement => (
                    <div key={announcement.id} className="solid-card p-5">
                        <h3 className="font-bold text-xl text-[--color-text-primary]">{announcement.title}</h3>
                        <p className="text-sm text-[--color-text-secondary] mt-1">por {userMap.get(announcement.authorId)} - <TimeAgo date={announcement.timestamp}/></p>
                        <p className="text-[--color-text-primary] mt-3 line-clamp-2">{announcement.content}</p>
                        <div className="flex justify-end mt-4">
                            <button onClick={() => setSelected(announcement)} className="btn btn-outline text-sm">Ver más</button>
                        </div>
                    </div>
                ))}
            </div>

            {selected && <AnnouncementDetailModal announcement={selected} userMap={userMap} onClose={() => setSelected(null)} onEdit={() => { setIsEditing(selected); setSelected(null); }} onDelete={() => handleDelete(selected.id)} />}
            {(isCreating || isEditing) && <AnnouncementEditorModal announcement={isEditing} onClose={() => { setIsCreating(false); setIsEditing(null); }} onSave={handleSave} />}
        </div>
    );
};

const AnnouncementDetailModal: React.FC<{announcement: StudentRepAnnouncement, userMap: Map<number, string>, onClose: () => void, onEdit: () => void, onDelete: () => void}> = ({ announcement, userMap, onClose, onEdit, onDelete }) => (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="glass-card w-full max-w-2xl p-6 max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-[--color-text-primary]">{announcement.title}</h2>
                <button onClick={onClose} className="text-3xl text-[--color-text-secondary] hover:text-[--color-text-primary]">&times;</button>
            </div>
            <p className="text-sm text-[--color-text-secondary] mb-4">Publicado por {userMap.get(announcement.authorId)} - <TimeAgo date={announcement.timestamp}/></p>
            <div className="overflow-y-auto pr-2">
                <p className="whitespace-pre-wrap text-[--color-text-primary]">{announcement.content}</p>
            </div>
            <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-[--color-border]">
                <button onClick={onDelete} className="btn btn-danger"><TrashIcon className="w-5 h-5"/> Eliminar</button>
                <button onClick={onEdit} className="btn btn-primary"><PencilIcon className="w-5 h-5"/> Editar</button>
            </div>
        </div>
    </div>
);

const AnnouncementEditorModal: React.FC<{announcement: StudentRepAnnouncement | null, onClose: () => void, onSave: (data: any) => void}> = ({ announcement, onClose, onSave }) => {
    const [title, setTitle] = useState(announcement?.title || '');
    const [content, setContent] = useState(announcement?.content || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!title.trim() || !content.trim()) return;
        onSave({ id: announcement?.id, title, content });
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <form onSubmit={handleSubmit} className="glass-card w-full max-w-2xl p-6" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-4">{announcement ? 'Editar' : 'Nuevo'} Anuncio</h2>
                <div className="space-y-4">
                    <input type="text" placeholder="Título" value={title} onChange={e=>setTitle(e.target.value)} className="input-styled w-full text-lg" required />
                    <textarea value={content} onChange={e=>setContent(e.target.value)} placeholder="Escribe el contenido del anuncio..." rows={10} className="input-styled w-full" required />
                </div>
                 <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-[--color-border]">
                    <button type="button" onClick={onClose} className="btn btn-secondary">Cancelar</button>
                    <button type="submit" className="btn btn-primary">Guardar</button>
                </div>
            </form>
        </div>
    );
};

const ReclamosView: React.FC<{
    claims: StudentRepClaim[];
    onUpdateClaims: (claims: StudentRepClaim[] | ((prev: StudentRepClaim[]) => StudentRepClaim[])) => void;
    allUsers: User[];
}> = ({ claims, onUpdateClaims, allUsers }) => {
    const [filter, setFilter] = useState<'todos' | StudentRepClaimStatus>('todos');
    const [selectedClaim, setSelectedClaim] = useState<StudentRepClaim | null>(null);
    const userMap = useMemo(() => new Map(allUsers.map(u => [u.id, u.name])), [allUsers]);

    const filteredClaims = useMemo(() => {
        return (filter === 'todos' ? claims : claims.filter(c => c.status === filter))
            .sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [claims, filter]);

    const handleStatusChange = (id: string, status: StudentRepClaimStatus) => {
        onUpdateClaims(prev => prev.map(c => c.id === id ? {...c, status} : c));
    };

    const statusStyles: Record<StudentRepClaimStatus, string> = {
        'pendiente': 'bg-yellow-500/20 text-yellow-700',
        'en revisión': 'bg-blue-500/20 text-blue-700',
        'resuelto': 'bg-green-500/20 text-green-700',
        'archivado': 'bg-gray-500/20 text-gray-600',
    };

    return (
        <div className="animate-fade-in-up">
            <h2 className="text-3xl font-bold text-[--color-text-primary] mb-2">Gestión de Reclamos</h2>
            <p className="text-[--color-text-secondary] mb-6">Gestiona sugerencias y reclamos de los estudiantes.</p>

            <div className="flex flex-wrap items-center gap-2 p-1 bg-[--color-secondary] rounded-lg mb-6 self-start">
                <button onClick={() => setFilter('todos')} className={`py-1.5 px-4 font-semibold text-sm rounded-md transition-all ${filter === 'todos' ? 'bg-[--color-primary] shadow text-[--color-accent]' : 'text-[--color-text-secondary]'}`}>Todos</button>
                <button onClick={() => setFilter('pendiente')} className={`py-1.5 px-4 font-semibold text-sm rounded-md transition-all ${filter === 'pendiente' ? 'bg-[--color-primary] shadow text-[--color-accent]' : 'text-[--color-text-secondary]'}`}>Pendientes</button>
                <button onClick={() => setFilter('en revisión')} className={`py-1.5 px-4 font-semibold text-sm rounded-md transition-all ${filter === 'en revisión' ? 'bg-[--color-primary] shadow text-[--color-accent]' : 'text-[--color-text-secondary]'}`}>En Revisión</button>
                <button onClick={() => setFilter('resuelto')} className={`py-1.5 px-4 font-semibold text-sm rounded-md transition-all ${filter === 'resuelto' ? 'bg-[--color-primary] shadow text-[--color-accent]' : 'text-[--color-text-secondary]'}`}>Resueltos</button>
            </div>

            <div className="space-y-4">
                {filteredClaims.map(claim => (
                    <div key={claim.id} className="solid-card p-5">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                            <div>
                                <span className="text-xs font-bold uppercase text-[--color-text-secondary]">{claim.category}</span>
                                <p className="font-bold text-lg text-[--color-text-primary] mt-1">{claim.description}</p>
                                <p className="text-sm text-[--color-text-secondary] mt-1">Enviado por {userMap.get(claim.authorId)} - <TimeAgo date={claim.timestamp}/></p>
                            </div>
                            <select value={claim.status} onChange={e => handleStatusChange(claim.id, e.target.value as StudentRepClaimStatus)} className={`input-styled text-sm py-1 font-semibold border-2 ${statusStyles[claim.status].replace('bg-', 'border-').replace('/20', '/40')}`}>
                                <option value="pendiente">Pendiente</option>
                                <option value="en revisión">En Revisión</option>
                                <option value="resuelto">Resuelto</option>
                                <option value="archivado">Archivado</option>
                            </select>
                        </div>
                        {claim.file && <button onClick={() => setSelectedClaim(claim)} className="btn btn-secondary text-sm mt-4">Ver Adjunto</button>}
                    </div>
                ))}
            </div>
            {selectedClaim && <ClaimDetailModal claim={selectedClaim} userMap={userMap} onClose={() => setSelectedClaim(null)} />}
        </div>
    );
};

const ClaimDetailModal: React.FC<{claim: StudentRepClaim, userMap: Map<number, string>, onClose: () => void}> = ({claim, userMap, onClose}) => {
    // Dummy download function for prototype
    const handleDownload = () => alert(`Descargando ${claim.file?.name}...`);
    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="glass-card w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-[--color-text-primary] mb-2">Detalle del Reclamo</h2>
                <p className="text-sm text-[--color-text-secondary] mb-4">De {userMap.get(claim.authorId)} - {claim.category}</p>
                <p className="whitespace-pre-wrap bg-[--color-secondary] p-4 rounded-lg border border-[--color-border]">{claim.description}</p>
                {claim.file && <button onClick={handleDownload} className="btn btn-primary mt-4 w-full"><DownloadIcon className="w-5 h-5"/> Descargar Adjunto ({claim.file.name})</button>}
                <button onClick={onClose} className="btn btn-secondary mt-2 w-full">Cerrar</button>
            </div>
        </div>
    );
}

const MiembrosCentroView: React.FC<{
  allUsers: User[];
  userProfiles: Record<number, UserProfileData>;
  onViewProfile: (user: User) => void;
}> = ({ allUsers, userProfiles, onViewProfile }) => {

    const studentReps = useMemo(() => {
        return allUsers.filter(u => u.role === Role.STUDENT_REP);
    }, [allUsers]);
    
    // Mock data for prototype as constants/app cannot be changed.
    const mockData: Record<number, Partial<UserProfileData>> = {
        801: { studentRepPosition: 'Presidente', bio: 'Comprometido con mejorar la vida estudiantil y crear un ambiente inclusivo para todos.' },
        802: { studentRepPosition: 'Secretaria de Cultura', bio: 'Apasionada por el arte y la cultura, organizando eventos que nos unan como comunidad.' },
        803: { studentRepPosition: 'Vicepresidente', bio: 'Trabajando para que la voz de cada estudiante sea escuchada y valorada.' },
        804: { studentRepPosition: 'Tesorera', bio: 'Gestionando los recursos del centro con transparencia y eficiencia para financiar nuestros proyectos.' },
        805: { studentRepPosition: 'Vocero Titular', bio: 'Comunicando las novedades y decisiones del centro a toda la comunidad estudiantil.' },
        806: { studentRepPosition: 'Vocera Suplente', bio: 'Apoyando en la comunicación y representando a los estudiantes de primer año.' },
        807: { studentRepPosition: 'Secretario de Deportes', bio: 'Fomentando la actividad física y organizando torneos y competencias para todos.' },
        808: { studentRepPosition: 'Secretaria de Asuntos Académicos', bio: 'Canalizando las inquietudes académicas de los estudiantes y buscando soluciones.' },
        809: { studentRepPosition: 'Vocal Titular 1', bio: 'Participando activamente en las decisiones y proyectos del Centro de Estudiantes.' },
        810: { studentRepPosition: 'Vocal Titular 2', bio: 'Representando las ideas y necesidades de mis compañeros en cada reunión.' }
    };
    
    return (
        <div className="animate-fade-in-up">
            <h2 className="text-3xl font-bold text-[--color-text-primary] mb-2">Miembros del Centro</h2>
            <p className="text-[--color-text-secondary] mb-6">Conoce a las personas que te representan.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {studentReps.map(member => {
                    const profile = { ...userProfiles[member.id], ...mockData[member.id] };
                    return (
                        <div key={member.id} className="solid-card p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6">
                            <img 
                                src={profile.profilePicture || `https://ui-avatars.com/api/?name=${member.name.replace(' ', '+')}&background=random`} 
                                alt={member.name} 
                                className="w-24 h-24 rounded-full object-cover bg-[--color-secondary] shrink-0" 
                            />
                            <div className="text-center sm:text-left">
                                <h3 className="text-xl font-bold text-[--color-text-primary]">{member.name}</h3>
                                <p className="font-semibold text-[--color-accent]">{profile.studentRepPosition || 'Miembro'}</p>
                                <p className="text-sm text-[--color-text-secondary] mt-2">{profile.bio || 'Representante estudiantil.'}</p>
                                <div className="flex gap-2 mt-4 justify-center sm:justify-start">
                                    <button onClick={() => onViewProfile(member)} className="btn btn-secondary text-sm">Ver Perfil</button>
                                    <a href={`mailto:${member.email}`} className="btn btn-outline text-sm">Contactar</a>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export const StudentRepDashboard: React.FC<DashboardProps> = (props) => {
  const { user, onLogout, allUsers, userProfiles, onUpdateProfile, userNotes, onUpdateNotes, theme, setTheme, borderStyle, setBorderStyle, fontStyle, setFontStyle, notifications, markNotificationsAsRead, studentRepEvents, onUpdateStudentRepEvents, studentRepThreads, onUpdateStudentRepThreads, studentRepReplies, onUpdateStudentRepReplies, studentRepAnnouncements, onUpdateStudentRepAnnouncements, studentRepClaims, onUpdateStudentRepClaims, eventParticipants } = props;
  
  const [activeView, setActiveView] = useState('inicio');
  const [viewingProfile, setViewingProfile] = useState<User | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const myNotifications = useMemo(() => notifications.filter(n => n.userId === user.id).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()), [notifications, user.id]);
  const unreadNotifications = useMemo(() => myNotifications.filter(n => !n.read).length, [myNotifications]);

  const renderCurrentView = () => {
    switch(activeView) {
      case 'inicio': return <InicioView user={user} onNavigate={setActiveView} events={studentRepEvents || []} announcements={studentRepAnnouncements || []} />;
      case 'crear_comunicado': return <CrearComunicadoView 
          user={user} 
          onSave={(data) => {
              if (onUpdateStudentRepAnnouncements) {
                  const newAnnouncement: StudentRepAnnouncement = { ...data, id: `sra-${Date.now()}`, authorId: user.id, timestamp: new Date().toISOString() };
                  onUpdateStudentRepAnnouncements(prev => [newAnnouncement, ...(prev || [])]);
              }
              setActiveView('anuncios');
          }} 
          onCancel={() => setActiveView('inicio')} />;
      case 'eventos': return <EventosView events={studentRepEvents || []} onUpdateEvents={onUpdateStudentRepEvents!} participants={eventParticipants || {}} allUsers={allUsers} />;
      case 'comunidad': return <ComunidadView currentUser={user} allUsers={allUsers} userProfiles={userProfiles as any} threads={studentRepThreads!} onUpdateThreads={onUpdateStudentRepThreads!} replies={studentRepReplies!} onUpdateReplies={onUpdateStudentRepReplies!} />;
      case 'anuncios': return <AnunciosView announcements={studentRepAnnouncements || []} onUpdateAnnouncements={onUpdateStudentRepAnnouncements!} user={user} allUsers={allUsers} />;
      case 'reclamos': return <ReclamosView claims={studentRepClaims || []} onUpdateClaims={onUpdateStudentRepClaims!} allUsers={allUsers} />;
      case 'miembros_centro': return <MiembrosCentroView allUsers={allUsers} userProfiles={userProfiles as any} onViewProfile={setViewingProfile} />;
      case 'profile': return <ProfileView viewedUser={user} currentUser={user} profileData={userProfiles[user.id] || {}} onUpdateProfile={(data) => onUpdateProfile(user.id, data)} onBack={() => setActiveView('inicio')} />;
      case 'appearance': return <AppearanceView currentTheme={theme} onSetTheme={setTheme} currentBorderStyle={borderStyle} onSetBorderStyle={setBorderStyle} currentFontStyle={fontStyle} onSetFontStyle={setFontStyle} />;
      default: return null;
    }
  };

  const profilePic = userProfiles[user.id]?.profilePicture;
  
  return (
    <>
      <header className="bg-[--color-header-bg] backdrop-blur-lg sticky top-0 z-30 border-b border-black/10 transition-colors duration-500">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <button onClick={() => setActiveView('inicio')} className="flex items-center gap-3 cursor-pointer"><BookOpenIcon className="h-12 w-12 text-[--color-accent]" /><span className="text-xl font-bold">Centro de Estudiantes</span></button>
          <div className="relative z-50" ref={userMenuRef}>
            <button onClick={() => setIsUserMenuOpen(p => !p)} className="flex items-center gap-2 p-2 rounded-lg hover:bg-black/5 transition-colors">
              {profilePic ? <img src={profilePic} alt="Perfil" className="w-8 h-8 rounded-full object-cover bg-[--color-secondary]"/> : <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[--color-secondary]"><ProfileIcon className="w-5 h-5 text-[--color-accent]"/></div>}
              <ChevronDownIcon className={`w-5 h-5 text-[--color-text-secondary] transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`}/>
            </button>
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 solid-card animate-fade-in-up p-2" style={{animationDuration: '0.2s'}}>
                <div className="space-y-1">
                  <button onClick={() => { setActiveView('profile'); setIsUserMenuOpen(false); }} className="w-full flex items-center gap-3 text-left px-3 py-2 text-[--color-text-primary] hover:bg-black/5 rounded-lg transition-colors"><ProfileIcon className="w-5 h-5 text-[--color-text-secondary]"/>Mi Perfil</button>
                  <button onClick={() => { setActiveView('crear_comunicado'); setIsUserMenuOpen(false); }} className="w-full flex items-center gap-3 text-left px-3 py-2 text-[--color-text-primary] hover:bg-black/5 rounded-lg transition-colors"><FileTextIcon className="w-5 h-5 text-[--color-text-secondary]"/>Crear Comunicado</button>
                  <button onClick={() => { setActiveView('eventos'); setIsUserMenuOpen(false); }} className="w-full flex items-center gap-3 text-left px-3 py-2 text-[--color-text-primary] hover:bg-black/5 rounded-lg transition-colors"><CalendarIcon className="w-5 h-5 text-[--color-text-secondary]"/>Agenda de Actividades</button>
                  <button onClick={() => { setActiveView('reclamos'); setIsUserMenuOpen(false); }} className="w-full flex items-center gap-3 text-left px-3 py-2 text-[--color-text-primary] hover:bg-black/5 rounded-lg transition-colors"><InboxIcon className="w-5 h-5 text-[--color-text-secondary]"/>Solicitudes Recibidas</button>
                  <button onClick={() => { setActiveView('miembros_centro'); setIsUserMenuOpen(false); }} className="w-full flex items-center gap-3 text-left px-3 py-2 text-[--color-text-primary] hover:bg-black/5 rounded-lg transition-colors"><UsersIcon className="w-5 h-5 text-[--color-text-secondary]"/>Miembros del Centro</button>
                  <button onClick={() => { setActiveView('appearance'); setIsUserMenuOpen(false); }} className="w-full flex items-center gap-3 text-left px-3 py-2 text-[--color-text-primary] hover:bg-black/5 rounded-lg transition-colors"><AppearanceIcon className="w-5 h-5 text-[--color-text-secondary]"/>Apariencia / Tema</button>
                </div>
                 <div className="p-2 mt-2 border-t border-[--color-border]"><button onClick={onLogout} className="w-full flex items-center gap-3 text-left px-3 py-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"><LogoutIcon className="w-5 h-5"/>Cerrar Sesión</button></div>
              </div>
            )}
          </div>
        </nav>
      </header>
      
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="pb-24 md:pb-0 relative">
          {activeView === 'inicio' && <WelcomeBanner user={user} unreadNotifications={unreadNotifications} onBellClick={() => setIsNotificationPanelOpen(p => !p)} />}
          {isNotificationPanelOpen && <NotificationPanel notifications={myNotifications} onClose={() => setIsNotificationPanelOpen(false)} onMarkAllRead={() => markNotificationsAsRead(user.id)} />}
          
          {viewingProfile ? (
            <ProfileView
                viewedUser={viewingProfile}
                currentUser={user}
                profileData={userProfiles[viewingProfile.id] || {}}
                onUpdateProfile={(data) => onUpdateProfile(viewingProfile.id, data)}
                onBack={() => setViewingProfile(null)}
            />
          ) : (
            <div className={activeView === 'inicio' ? 'mt-8' : ''}>
                {renderCurrentView()}
            </div>
          )}
        </div>
      </main>
      
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[--color-primary] border-t border-[--color-border] z-40 shadow-[0_-2px_10px_rgba(var(--color-shadow-rgb),0.1)]">
        <nav className="flex justify-around items-center">
          <BottomNavButton label="Inicio" icon={<HomeIcon className="w-6 h-6"/>} active={activeView === 'inicio'} onClick={() => setActiveView('inicio')}/>
          <BottomNavButton label="Eventos" icon={<CalendarIcon className="w-6 h-6"/>} active={activeView === 'eventos'} onClick={() => setActiveView('eventos')}/>
          <BottomNavButton label="Comunidad" icon={<UsersIcon className="w-6 h-6"/>} active={activeView === 'comunidad'} onClick={() => setActiveView('comunidad')}/>
          <BottomNavButton label="Anuncios" icon={<MegaphoneIcon className="w-6 h-6"/>} active={activeView === 'anuncios'} onClick={() => setActiveView('anuncios')}/>
          <BottomNavButton label="Reclamos" icon={<InboxIcon className="w-6 h-6"/>} active={activeView === 'reclamos'} onClick={() => setActiveView('reclamos')}/>
        </nav>
      </div>
    </>
  );
};