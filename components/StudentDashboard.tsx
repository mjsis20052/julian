import React, { useState, useEffect, useMemo, useRef } from 'react';
import { User, AttendanceRecord, AttendanceStatus, Subject, NewsItem, PrivateMessage, JustificationFile, Notification, UserProfileData, Note, Role, ForumThread, ForumReply, ForumThreadStatus, Coordinates, ClassSchedule, Grade, GradeType, CalendarEvent, Material, NotificationType, StudentRepEvent, StudentRepEventType, StudentRepForumThread, StudentRepForumReply, StudentRepForumCategory, StudentRepClaim, StudentRepClaimCategory, StudentRepClaimStatus } from '../types';
import { CheckCircleIcon, XCircleIcon, MinusCircleIcon, ClockIcon, NewspaperIcon, ChartBarIcon, MessageSquareIcon, SendIcon, SparklesIcon, HomeIcon, BellIcon, FileWarningIcon, AppearanceIcon, ShieldCheckIcon, TrendingUpIcon, InboxIcon, BookOpenIcon, UserIcon, ChevronDownIcon, LogoutIcon, CalendarIcon, StickyNoteIcon, UsersIcon, ChatBubbleIcon, QRIcon, ClipboardListIcon, SettingsIcon, ArrowLeftIcon, FootballIcon, PlusCircleIcon } from './Icons';
import { GoogleGenAI } from "@google/genai";
import { ABSENCE_LIMIT, MINIMUM_PRESENTISM, CLASS_COUNT_THRESHOLD_FOR_LIBRE } from '../constants';
import { Theme, BorderStyle, FontStyle } from '../App';
import { NotificationPanel } from './NotificationPanel';
import { AppearanceView } from './AppearanceModal';
import { ProfileView } from './ProfileView';
import { AgendaView } from './AgendaView';
import { NotesView } from './NotesView';
import { ForumsView } from './ForumsView';
import { StudentMaterialView } from './StudentMaterialView';

interface StudentDashboardProps {
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
  preceptor: User | null;
  attendanceRecords: AttendanceRecord[];
  grades: Grade[];
  subjects: Subject[];
  newsItems: NewsItem[];
  privateMessages: PrivateMessage[];
  notifications: Notification[];
  sendPrivateMessage: (senderId: number, receiverId: number, text: string) => void;
  markMessagesAsRead: (readerId: number, chatterId: number) => void;
  markNotificationsAsRead: (userId: number) => void;
  addNotification: (notificationData: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  requestJustification: (recordId: string, reason: string, file: JustificationFile) => void;
  onVerifyQRAttendance: (qrData: string, location: Coordinates) => Promise<string>;
  forumThreads: ForumThread[];
  forumReplies: ForumReply[];
  onAddForumThread: (thread: Omit<ForumThread, 'id' | 'timestamp' | 'status' | 'isLocked'>) => void;
  onEditForumThread: (threadId: string, title: string, content: string) => void;
  onAddForumReply: (reply: Omit<ForumReply, 'id' | 'timestamp'>) => void;
  onDeleteForumThread: (threadId: string) => void;
  onDeleteForumReply: (replyId: string) => void;
  onToggleLockThread: (threadId: string) => void;
  classSchedule: ClassSchedule[];
  customEvents: CalendarEvent[];
  onAddEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  materials: Material[];
  onUpdateMaterials: (materials: Material[]) => void;
  studentRepEvents: StudentRepEvent[];
  eventParticipants: Record<string, number[]>;
  onJoinEvent: (eventId: string, studentId: number) => void;
  studentRepThreads: StudentRepForumThread[];
  studentRepReplies: StudentRepForumReply[];
  onUpdateStudentRepReplies: (replies: StudentRepForumReply[] | ((prev: StudentRepForumReply[]) => StudentRepForumReply[])) => void;
  studentRepClaims: StudentRepClaim[];
  onAddStudentRepClaim: (claim: Omit<StudentRepClaim, 'id' | 'authorId' | 'timestamp' | 'status'>) => void;
}

const statusStyles: { [key in AttendanceStatus]: { icon: React.ReactNode; color: string; text: string } } = {
  [AttendanceStatus.PRESENT]: { icon: <CheckCircleIcon className="w-5 h-5 text-green-600" />, color: 'bg-green-500/10 text-green-600', text: 'Presente' },
  [AttendanceStatus.ABSENT]: { icon: <XCircleIcon className="w-5 h-5 text-red-600" />, color: 'bg-red-500/10 text-red-600', text: 'Ausente' },
  [AttendanceStatus.JUSTIFIED]: { icon: <MinusCircleIcon className="w-5 h-5 text-yellow-600" />, color: 'bg-yellow-500/10 text-yellow-600', text: 'Justificado' },
  [AttendanceStatus.PENDING_JUSTIFICATION]: { icon: <ClockIcon className="w-5 h-5 text-blue-600" />, color: 'bg-blue-500/10 text-blue-600', text: 'Pendiente' },
};

const JustificationModal: React.FC<{ record: AttendanceRecord; subjectName: string; onClose: () => void; onSubmit: (recordId: string, reason: string, file: JustificationFile) => void; }> = ({ record, subjectName, onClose, onSubmit }) => {
  const [reason, setReason] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
        if (selectedFile.size > 5 * 1024 * 1024) { setError('El archivo no debe superar los 5MB.'); return; }
        setError(''); setFile(selectedFile);
    }
  };
  
  const handleGenerate = async () => {
    if (!reason.trim()) { setError('Escribe algunas palabras clave sobre el motivo para generar una justificación.'); return; }
    setError(''); setIsGenerating(true);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: `Actúa como un asistente para un estudiante. Basado en las siguientes palabras clave, redacta un motivo formal y conciso para justificar una ausencia a clases: "${reason}". La respuesta debe ser solo el texto de la justificación, sin saludos ni despedidas adicionales.` });
        setReason(response.text);
    } catch (e) { console.error(e); setError('No se pudo generar la justificación. Inténtalo de nuevo.'); }
    finally { setIsGenerating(false); }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim() || !file) { setError('Por favor, complete el motivo y adjunte un archivo.'); return; }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
        const base64Content = (reader.result as string).split(',')[1];
        onSubmit(record.id, reason, { name: file.name, type: file.type, content: base64Content });
        onClose();
    };
    reader.onerror = () => { setError('Error al leer el archivo. Intente de nuevo.'); };
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in" style={{animationDuration: '0.3s'}} onClick={onClose}>
      <div className="glass-card w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-[--color-text-primary] mb-2">Justificar Ausencia</h2>
        <p className="text-[--color-text-secondary] mb-1">Materia: <span className="font-semibold text-[--color-text-primary]">{subjectName}</span></p>
        <p className="text-[--color-text-secondary] mb-4">Fecha: <span className="font-semibold text-[--color-text-primary]">{new Date(record.date + 'T00:00:00').toLocaleDateString('es-AR')}</span></p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
                <label htmlFor="reason" className="block text-sm font-medium text-[--color-text-secondary]">Motivo</label>
                <button type="button" onClick={handleGenerate} disabled={isGenerating} className="flex items-center gap-1.5 text-xs font-semibold text-[--color-accent] hover:text-[--color-accent-hover] disabled:opacity-50 transition-colors">
                    <SparklesIcon className="w-4 h-4" /> {isGenerating ? 'Generando...' : 'Generar con IA'}
                </button>
            </div>
            <textarea id="reason" value={reason} onChange={e => setReason(e.target.value)} rows={4} className="input-styled w-full" required placeholder="Escribe unas palabras clave (ej: 'cita médica, gripe') y usa la IA, o escribe el motivo completo." />
          </div>
          <div>
            <label htmlFor="certificate" className="block text-sm font-medium text-[--color-text-secondary] mb-1">Certificado (PDF, JPG, PNG)</label>
            <input type="file" id="certificate" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png" className="w-full text-sm text-[--color-text-secondary] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[--color-accent] file:text-white hover:file:bg-[--color-accent-hover] transition-colors" required />
            {file && <p className="text-xs text-[--color-text-secondary] mt-1">Archivo seleccionado: {file.name}</p>}
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancelar</button>
            <button type="submit" className="btn btn-primary">Enviar Justificación</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SubjectHistoryModal: React.FC<{ subject: Subject; records: AttendanceRecord[]; onClose: () => void; onJustify: (record: AttendanceRecord) => void; }> = ({ subject, records, onClose, onJustify }) => (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in" style={{animationDuration: '0.3s'}} onClick={onClose}>
        <div className="glass-card w-full max-w-2xl p-6 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h2 className="text-xl font-bold text-[--color-text-primary]">Historial de {subject.name}</h2>
                    <p className="text-[--color-text-secondary]">Resumen de todas tus asistencias en la materia.</p>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-[--color-text-primary] transition-colors text-3xl leading-none">&times;</button>
            </div>
            <div className="overflow-y-auto pr-2">
                <ul className="space-y-3">
                    {records.map(record => (
                        <li key={record.id} className="bg-[--color-secondary] p-3 rounded-lg flex items-center justify-between gap-4 border border-[--color-border]">
                            <div className="flex items-center gap-3">
                                {statusStyles[record.status].icon}
                                <div>
                                    <p className="font-semibold text-[--color-text-primary]">{new Date(record.date + 'T00:00:00').toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                    <p className="text-sm text-[--color-text-secondary]">{statusStyles[record.status].text}</p>
                                </div>
                            </div>
                            {record.status === AttendanceStatus.ABSENT && <button onClick={() => onJustify(record)} className="btn btn-outline text-sm py-1 px-3">Justificar</button>}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    </div>
);

const PieChart: React.FC<{ present: number; absent: number; justified: number; size: number }> = ({ present, absent, justified, size }) => {
    const radius = size / 2 - 10, circumference = 2 * Math.PI * radius;
    const pL = (present / 100) * circumference, jL = (justified / 100) * circumference, aL = (absent / 100) * circumference;
    const jO = -pL, aO = -(pL + jL);
    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
            <circle cx={size/2} cy={size/2} r={radius} fill="transparent" stroke="var(--color-border)" strokeWidth="10" />
            {present > 0 && <circle cx={size/2} cy={size/2} r={radius} fill="transparent" stroke="#22c55e" strokeWidth="10" strokeDasharray={`${pL} ${circumference}`} style={{ transition: 'stroke-dasharray 0.5s ease-out', strokeLinecap: 'round' }} />}
            {justified > 0 && <circle cx={size/2} cy={size/2} r={radius} fill="transparent" stroke="#eab308" strokeWidth="10" strokeDasharray={`${jL} ${circumference}`} style={{ transition: 'stroke-dasharray 0.5s ease-out, stroke-dashoffset 0.5s ease-out', strokeLinecap: 'round' }} strokeDashoffset={jO} />}
            {absent > 0 && <circle cx={size/2} cy={size/2} r={radius} fill="transparent" stroke="#ef4444" strokeWidth="10" strokeDasharray={`${aL} ${circumference}`} style={{ transition: 'stroke-dasharray 0.5s ease-out, stroke-dashoffset 0.5s ease-out', strokeLinecap: 'round' }} strokeDashoffset={aO} />}
        </svg>
    );
};

const AttendanceStats: React.FC<{ records: AttendanceRecord[]; subjects: Subject[]; onOpenSubjectHistory: (subject: Subject, records: AttendanceRecord[]) => void; }> = ({ records, subjects, onOpenSubjectHistory }) => {
    const statsBySubject = useMemo(() => {
        const stats: Record<string, { present: number; absent: number; justified: number; total: number }> = {};
        for (const record of records) {
            if (!stats[record.subjectId]) stats[record.subjectId] = { present: 0, absent: 0, justified: 0, total: 0 };
            stats[record.subjectId].total++;
            if (record.status === AttendanceStatus.PRESENT) stats[record.subjectId].present++;
            else if (record.status === AttendanceStatus.ABSENT) stats[record.subjectId].absent++;
            else if (record.status === AttendanceStatus.JUSTIFIED || record.status === AttendanceStatus.PENDING_JUSTIFICATION) stats[record.subjectId].justified++;
        }
        return stats;
    }, [records]);

    const subjectsWithStats = subjects.filter(s => statsBySubject[s.id] && statsBySubject[s.id].total > 0);

    if (subjectsWithStats.length === 0) {
        return (
            <div className="glass-card p-8 text-center animate-fade-in-up">
                <ChartBarIcon className="w-12 h-12 mx-auto text-[--color-text-secondary] opacity-50 mb-4" />
                <h3 className="text-xl font-bold text-[--color-text-primary]">Aún no hay estadísticas para mostrar</h3>
                <p className="text-[--color-text-secondary] mt-2">Todavía no se han cargado asistencias para tus materias. Vuelve a consultar más tarde.</p>
            </div>
        );
    }

    return (
        <div className="animate-fade-in-up">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subjectsWithStats.map((subject, index) => {
                    const data = statsBySubject[subject.id];
                    
                    const presentPercent = (data.present / data.total) * 100;
                    const justifiedPercent = (data.justified / data.total) * 100;
                    const absentPercent = (data.absent / data.total) * 100;
                    const remainingAbsences = Math.max(0, ABSENCE_LIMIT - data.absent);

                    const attendancePercent = data.total > 0 ? ((data.present + data.justified) / data.total) * 100 : 100;
                    const isOverAbsenceLimit = data.absent > ABSENCE_LIMIT;
                    const isBelowPercentageAfterThreshold = data.total >= CLASS_COUNT_THRESHOLD_FOR_LIBRE && attendancePercent < MINIMUM_PRESENTISM;
                    const isLibre = isOverAbsenceLimit || isBelowPercentageAfterThreshold;

                    return (
                        <div key={subject.id} className={`glass-card p-5 text-left transition-all duration-300 flex flex-col animate-fade-in-up ${isLibre ? 'border-red-500/50' : ''}`} style={{animationDelay: `${index * 50}ms`}}>
                            <div>
                                <h3 className="font-bold text-[--color-text-primary] text-lg">{subject.name}</h3>
                                <p className="text-sm text-[--color-text-secondary]">{data.total} clases registradas</p>
                            </div>
                            <div className="flex-grow flex items-center justify-center gap-4 my-4">
                                <div className="relative">
                                    <PieChart present={presentPercent} absent={absentPercent} justified={justifiedPercent} size={100} />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <span className={`text-2xl font-bold ${isLibre ? 'text-red-500' : 'text-[--color-text-primary]'}`}>{attendancePercent.toFixed(0)}%</span>
                                    </div>
                                </div>
                                <div className="text-xs flex flex-col gap-2 text-[--color-text-secondary]">
                                    <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-500"></span>Presente: {presentPercent.toFixed(0)}%</span>
                                    <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-yellow-500"></span>Justif.: {justifiedPercent.toFixed(0)}%</span>
                                    <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500"></span>Ausente: {absentPercent.toFixed(0)}%</span>
                                </div>
                            </div>
                            {isLibre ? (
                                <div className="text-center mt-2 bg-red-500/10 p-3 rounded-lg w-full">
                                    <p className="text-xl font-bold text-red-600">CONDICIÓN: LIBRE</p>
                                    <p className="text-xs text-red-500/80">Presentismo menor al {MINIMUM_PRESENTISM}% o límite de faltas superado.</p>
                                </div>
                            ) : (
                                <button onClick={() => onOpenSubjectHistory(subject, records.filter(r => r.subjectId === subject.id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()))} className="text-center mt-2 bg-black/5 p-3 rounded-lg hover:bg-black/10 transition-colors w-full cursor-pointer">
                                     <p className="text-2xl font-bold text-[--color-text-primary]">{remainingAbsences}</p>
                                     <p className="text-xs text-[--color-text-secondary]">Faltas restantes permitidas</p>
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const ChatModal: React.FC<{ user: User; preceptor: User; messages: PrivateMessage[]; onClose: () => void; onSendMessage: (text: string) => void; }> = ({ user, preceptor, messages, onClose, onSendMessage }) => {
    const [newMessage, setNewMessage] = useState('');
    const chatBodyRef = useRef<HTMLDivElement>(null);
    const conversation = useMemo(() => messages.filter(m => (m.senderId === user.id && m.receiverId === preceptor.id) || (m.senderId === preceptor.id && m.receiverId === user.id)).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()), [messages, user.id, preceptor.id]);
    useEffect(() => { if (chatBodyRef.current) chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight; }, [conversation]);
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); if (newMessage.trim()) { onSendMessage(newMessage.trim()); setNewMessage(''); } };
    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center sm:p-4 animate-fade-in" style={{animationDuration: '0.3s'}} onClick={onClose}>
            <div className="glass-card w-full max-w-lg rounded-t-2xl sm:rounded-2xl flex flex-col h-[80vh] sm:h-auto sm:max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b border-[--color-border] flex justify-between items-center">
                    <h2 className="text-xl font-bold text-[--color-text-primary]">Chat con el Preceptor {preceptor.name}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-800 transition-colors text-2xl">&times;</button>
                </header>
                <div ref={chatBodyRef} className="flex-1 p-4 space-y-4 overflow-y-auto">
                    {conversation.map(msg => (
                        <div key={msg.id} className={`flex items-end gap-2 ${msg.senderId === user.id ? 'justify-end' : ''}`}>
                            <div className={`max-w-xs md:max-w-md p-3 rounded-2xl ${msg.senderId === user.id ? 'bg-[--color-accent] text-white rounded-br-lg' : 'bg-[--color-secondary] text-[--color-text-primary] rounded-bl-lg'}`}>
                                <p>{msg.text}</p>
                                <p className={`text-xs mt-1 text-right ${msg.senderId === user.id ? 'opacity-70' : 'text-[--color-text-secondary]'}`}>{new Date(msg.timestamp).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <form onSubmit={handleSubmit} className="p-4 border-t border-[--color-border] flex items-center gap-2">
                    <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Escribe un mensaje..." className="w-full bg-[--color-secondary] text-[--color-text-primary] rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[--color-accent] border border-[--color-border]" />
                    <button type="submit" className="bg-[--color-accent] p-2 rounded-full text-white hover:bg-[--color-accent-hover] transition-colors shrink-0"><SendIcon className="w-6 h-6"/></button>
                </form>
            </div>
        </div>
    );
}

const Overview: React.FC<{ user: User; subjects: Subject[], newsItems: NewsItem[], forumThreads: ForumThread[], onNavigate: (view: string) => void; onViewSubjectMaterials: (subject: Subject) => void; }> = ({ user, subjects, newsItems, forumThreads, onNavigate, onViewSubjectMaterials }) => {
    const getSubjectNews = (subjectId: string) => newsItems.filter(item => item.subjectId === subjectId).sort((a,b) => b.id.localeCompare(a.id));
    const generalNews = useMemo(() => newsItems.filter(item => !item.subjectId && (item.careerId === undefined || item.careerId === user.careerId) && (item.year === undefined || user.year === (item.year as any))).sort((a, b) => b.id.localeCompare(a.id)), [newsItems, user.careerId, user.year]);
    
    const latestThreads = useMemo(() => {
        return forumThreads
            .filter(t => t.status === ForumThreadStatus.APPROVED && t.careerId === user.careerId && t.year === user.year)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 3);
    }, [forumThreads, user.careerId, user.year]);

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h2 className="text-3xl font-bold text-[--color-text-primary] mb-4">Mis Materias</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {subjects.map((subject, index) => (
                        <button key={subject.id} onClick={() => onViewSubjectMaterials(subject)} className="glass-card p-6 flex flex-col gap-4 animate-fade-in-up transform hover:-translate-y-1 transition-transform duration-300 text-left">
                            <h3 className="text-xl font-bold text-[--color-accent]">{subject.name}</h3>
                            {getSubjectNews(subject.id).length > 0 ? (
                                <div className="space-y-3">
                                    <p className="text-sm font-semibold text-[--color-text-secondary] flex items-center gap-2"><BellIcon className="w-4 h-4" /> Anuncios de la materia</p>
                                    <ul className="space-y-2">{getSubjectNews(subject.id).map(news => <li key={news.id} className="text-[--color-text-primary] text-sm bg-black/5 p-3 rounded-md border border-[--color-border]">{news.text}</li>)}</ul>
                                </div>
                            ) : <div className="flex-grow flex items-center justify-center min-h-[80px]"><p className="text-sm text-center text-[--color-text-secondary]">No hay anuncios para esta materia.</p></div>}
                        </button>
                    ))}
                </div>
            </div>
            {generalNews.length > 0 && (
                <div className="animate-fade-in-up">
                    <h2 className="text-3xl font-bold text-[--color-text-primary] mb-4">Anuncios Generales</h2>
                    <div className="glass-card p-6 space-y-4">
                        {generalNews.map(news => (
                             <div key={news.id} className="bg-[--color-secondary] border border-[--color-border] p-4 rounded-lg flex items-start gap-4 animate-fade-in-up">
                                 <NewspaperIcon className="w-6 h-6 text-[--color-accent] shrink-0 mt-1"/>
                                 <div><p className="text-[--color-text-primary]">{news.text}</p></div>
                             </div>
                        ))}
                    </div>
                </div>
            )}
             <div className="animate-fade-in-up">
                <h2 className="text-3xl font-bold text-[--color-text-primary] mb-4">Foros</h2>
                <div className="glass-card p-6 space-y-4">
                    {latestThreads.length > 0 ? (
                        <>
                            {latestThreads.map(thread => (
                                <div key={thread.id} className="bg-[--color-secondary] border border-[--color-border] p-4 rounded-lg flex items-start gap-4">
                                    <ChatBubbleIcon className="w-6 h-6 text-[--color-accent] shrink-0 mt-1"/>
                                    <div>
                                        <p className="font-semibold text-[--color-text-primary]">{thread.title}</p>
                                        <p className="text-sm text-[--color-text-secondary] line-clamp-2">{thread.content}</p>
                                    </div>
                                </div>
                            ))}
                             <button onClick={() => onNavigate('forums')} className="btn btn-primary w-full mt-4">
                                Ver todos los foros
                            </button>
                        </>
                    ) : (
                        <div className="text-center text-[--color-text-secondary] py-8">
                            <p>Aún no hay discusiones en el foro.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

interface WelcomeBannerProps {
  user: User;
  records: AttendanceRecord[];
  subjects: Subject[];
  unreadMessages: number;
  unreadNotifications: number;
  onBellClick: () => void;
  onNavigate: (view: string) => void;
  onOpenChat: () => void;
}

const WelcomeBanner: React.FC<WelcomeBannerProps> = ({ user, records, subjects, unreadMessages, unreadNotifications, onBellClick, onNavigate, onOpenChat }) => {
    const { mostCriticalSubject, presentism } = useMemo(() => {
        const absencesBySubject = subjects.map(subject => ({ subjectName: subject.name, remaining: Math.max(0, ABSENCE_LIMIT - records.filter(r => r.subjectId === subject.id && r.status === AttendanceStatus.ABSENT).length) }));
        const mostCritical = [...absencesBySubject].sort((a, b) => a.remaining - b.remaining)[0];
        const totalPresents = records.filter(r => r.status === AttendanceStatus.PRESENT).length;
        const overallPresentism = records.length > 0 ? (totalPresents / records.length) * 100 : 100;
        return { mostCriticalSubject: mostCritical, presentism: overallPresentism };
    }, [records, subjects]);

    const stats = [
        { label: `Faltas Restantes (${mostCriticalSubject?.subjectName || ''})`, value: mostCriticalSubject?.remaining.toString() || 'N/A', icon: <ShieldCheckIcon className="w-8 h-8 text-green-500" />, color: mostCriticalSubject?.remaining <= 2 ? "text-red-500" : (mostCriticalSubject?.remaining <= 4 ? "text-yellow-500" : "text-green-500"), action: () => onNavigate('absences') },
        { label: "Presentismo general", value: `${presentism.toFixed(0)}%`, icon: <TrendingUpIcon className="w-8 h-8 text-blue-500" />, color: "text-blue-500", action: () => onNavigate('stats') },
        { label: "Mensajes Nuevos", value: unreadMessages.toString(), icon: <InboxIcon className="w-8 h-8 text-yellow-500" />, color: "text-yellow-500", action: onOpenChat }
    ];

    return (
        <div className="welcome-banner animate-fade-in relative">
            <button onClick={onBellClick} className="absolute top-6 right-6 p-2 rounded-full hover:bg-black/10 transition-colors z-10" aria-label="Ver notificaciones">
                <BellIcon className="w-6 h-6 text-[--color-text-secondary]" />
                {unreadNotifications > 0 && <span className="absolute top-1 right-1 block h-3 w-3 rounded-full bg-red-500 ring-2 ring-[--color-primary]"><span className="sr-only">{unreadNotifications} notificaciones nuevas</span></span>}
            </button>
            <h1 className="text-4xl font-bold text-[--color-text-primary] mb-2">
              {user.id === 101 ? 'Hola!' : `Hola, ${user.name.split(' ')[0]}`}
            </h1>
            <p className="text-lg text-[--color-text-secondary] mb-8">Este es tu resumen de asistencia y novedades.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.map((stat, index) => (
                    <button
                        key={stat.label}
                        onClick={stat.action}
                        className="glass-card p-4 flex items-center gap-4 animate-fade-in-up text-left w-full transition-transform transform hover:scale-[1.03] focus:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[--color-accent] focus:ring-offset-[--color-background]"
                        style={{ animationDelay: `${index * 100 + 100}ms` }}
                    >
                        <div className="p-3 bg-black/5 rounded-full">{stat.icon}</div>
                        <div>
                            <p className="text-sm text-[--color-text-secondary]">{stat.label}</p>
                            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

const ClassmatesView: React.FC<{ user: User, allUsers: User[], userProfiles: Record<number, UserProfileData>, onViewProfile: (user: User) => void }> = ({ user, allUsers, userProfiles, onViewProfile }) => {
  const [filter, setFilter] = useState<'classmates' | 'preceptors'>('classmates');

  const displayedUsers = useMemo(() => {
    if (filter === 'classmates') {
      return allUsers.filter(u => u.id !== user.id && u.careerId === user.careerId && u.year === user.year && u.role === Role.STUDENT);
    }
    return allUsers.filter(u => u.role === Role.PRECEPTOR);
  }, [allUsers, user, filter]);
  
  const defaultAvatar = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGNsYXNzPSJ3LTYgaC02IiBmaWxsPSJub25lIiB2aWV3Qm94PSIwIDAgMjQgMjQiIHN0cm9rZT0iY3VycmVudENvbG9yIj48cGF0aCBzdHJva2VMaW5lY2FwPSJyb3VuZCIgc3Ryb2tlTGluZWpvaW49InJvdW5kIiBzdHJva2VWaWR0aD0iMiIgZD0iTTE2IDdhNCA0IDAgMTEtOCAwIDQgNCAwIDAxOCAwek0xMiAxNGE3IDcgMCAwMC03IDdoMTRhNyA3IDAgMDAtNy03eiIgLz48L3N2Zz4=';

  return (
    <div className="animate-fade-in-up">
      <div className="glass-card p-6">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
            <h2 className="text-2xl font-bold text-[--color-text-primary]">
              {filter === 'classmates' ? `Compañeros de ${user.year}° Año` : 'Preceptores'}
            </h2>
            <div className="flex items-center gap-2 p-1 bg-[--color-secondary] rounded-lg">
                <button 
                    onClick={() => setFilter('classmates')}
                    className={`py-1.5 px-4 font-semibold text-sm rounded-md transition-all duration-300 ${filter === 'classmates' ? 'bg-[--color-primary] shadow text-[--color-accent]' : 'text-[--color-text-secondary] hover:text-[--color-text-primary]'}`}
                >
                    Compañeros
                </button>
                <button
                    onClick={() => setFilter('preceptors')}
                    className={`py-1.5 px-4 font-semibold text-sm rounded-md transition-all duration-300 ${filter === 'preceptors' ? 'bg-[--color-primary] shadow text-[--color-accent]' : 'text-[--color-text-secondary] hover:text-[--color-text-primary]'}`}
                >
                    Preceptores
                </button>
            </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {displayedUsers.map(person => {
            const profile = userProfiles[person.id];
            return (
              <div key={person.id} className="solid-card text-center p-6 flex flex-col items-center gap-3 transform hover:-translate-y-1 transition-transform duration-300">
                <img 
                    src={profile?.profilePicture || defaultAvatar} 
                    onError={(e) => { e.currentTarget.src = defaultAvatar }} 
                    alt={person.name} 
                    className="w-24 h-24 rounded-full object-cover bg-[--color-secondary] text-[--color-text-secondary]" />
                <h3 className="font-bold text-lg text-[--color-text-primary]">{person.name}</h3>
                {person.role === Role.PRECEPTOR && <p className="text-sm text-[--color-text-secondary] -mt-2">{person.role}</p>}
                <button onClick={() => onViewProfile(person)} className="btn btn-outline text-sm w-full">
                  Ver Perfil
                </button>
              </div>
            );
          })}
          {displayedUsers.length === 0 && (
            <div className="col-span-full text-center py-12 text-[--color-text-secondary]">
                <p>No se encontraron {filter === 'classmates' ? 'compañeros' : 'preceptores'}.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
};

const QRAttendanceScanner: React.FC<{ onVerify: (qrData: string, location: Coordinates) => Promise<string> }> = ({ onVerify }) => {
    return (
        <div className="glass-card p-6 md:p-8 flex items-center justify-center min-h-[60vh]">
            <div className="text-center animate-fade-in">
                <QRIcon className="w-24 h-24 text-[--color-accent] mx-auto mb-4 opacity-70" />
                <h2 className="text-3xl font-bold text-[--color-text-primary]">Asistencia para Eventos</h2>
                <p className="text-[--color-text-secondary] mt-2 max-w-md mx-auto">
                    Esta función está pensada para eventos de gran escala, como Jornadas Estudiantiles.
                </p>
                <div className="mt-6 bg-[--color-secondary] p-4 rounded-lg border border-[--color-border]">
                    <p className="font-semibold text-[--color-text-primary]">
                        ¡Próximamente!
                    </p>
                    <p className="text-sm text-[--color-text-secondary]">
                        Se planea implementar esta funcionalidad más adelante en la App.
                    </p>
                </div>
            </div>
        </div>
    );
};

const GradeItem: React.FC<{ label: string; grade?: Grade }> = ({ label, grade }) => {
    const getGradeColor = (gradeValue: number) => {
        if (gradeValue < 4) return 'text-red-600';
        if (gradeValue >= 4 && gradeValue < 7) return 'text-blue-600';
        return 'text-green-600';
    }
    const valueIsNumeric = grade && grade.value && !isNaN(parseFloat(grade.value));
    const colorClass = valueIsNumeric ? getGradeColor(parseFloat(grade.value)) : 'text-[--color-text-primary]';
    
    let displayValue = '-';
    if (grade?.value) {
        displayValue = valueIsNumeric ? parseFloat(grade.value).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : grade.value;
    }

    return (
        <div className="text-center bg-[--color-secondary] p-3 rounded-lg">
            <p className="text-sm text-[--color-text-secondary]">{label}</p>
            <p className={`font-bold text-lg ${colorClass}`}>
                {displayValue}
            </p>
        </div>
    );
};

const GradesView: React.FC<{ user: User, subjects: Subject[], grades: Grade[] }> = ({ user, subjects, grades }) => {
    const mySubjects = useMemo(() => subjects.filter(s => s.careerId === user.careerId && s.year === user.year), [subjects, user.careerId, user.year]);
    
    const getGradeColor = (gradeValue: number) => {
        if (gradeValue < 4) return 'text-red-600';
        if (gradeValue >= 4 && gradeValue < 7) return 'text-blue-600';
        return 'text-green-600';
    }

    return (
        <div className="animate-fade-in-up">
            <h1 className="text-3xl font-bold text-[--color-text-primary] mb-2">Mis Calificaciones</h1>
            <p className="text-[--color-text-secondary] mb-8">Resumen de tu progreso académico.</p>
            <div className="space-y-6">
                {mySubjects.map(subject => {
                    const subjectGrades = grades.filter(g => g.studentId === user.id && g.subjectId === subject.id);
                    if (subjectGrades.length === 0) return null;

                    const findGrade = (type: GradeType) => subjectGrades.find(g => g.type === type);

                    const n1c = findGrade('Nota 1er Cuatrimestre');
                    const n2c = findGrade('Nota 2do Cuatrimestre');
                    const finalExam = findGrade('Examen Final');

                    let finalAverage: number | null = null;
                    let finalStatus = 'En Curso';
                    let statusColor = 'text-gray-500';

                    const n1c_val = n1c ? parseFloat(n1c.value) : null;
                    const n2c_val = n2c ? parseFloat(n2c.value) : null;
                    
                    if (n1c_val !== null && !isNaN(n1c_val) && n2c_val !== null && !isNaN(n2c_val)) {
                        finalAverage = (n1c_val + n2c_val) / 2;
                        if (n1c_val < 4 || n2c_val < 4) {
                            finalStatus = 'Recursando'; statusColor = 'text-red-600';
                        } else if (finalAverage >= 7) {
                            finalStatus = 'Promocionada'; statusColor = 'text-green-600';
                        } else {
                            finalStatus = 'A Final'; statusColor = 'text-blue-600';
                        }
                    }

                    if (finalStatus === 'A Final' && finalExam) {
                        const finalExamVal = parseFloat(finalExam.value);
                        if (!isNaN(finalExamVal)) {
                            if (finalExamVal >= 4) {
                                finalStatus = 'Aprobada'; statusColor = 'text-green-600';
                            } else {
                                finalStatus = 'Desaprobada'; statusColor = 'text-red-600';
                            }
                        }
                    }

                    return (
                        <div key={subject.id} className="solid-card p-6">
                            <h2 className="text-xl font-bold text-[--color-accent] mb-4">{subject.name}</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="font-bold text-lg text-[--color-text-secondary] mb-3">1er Cuatrimestre</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <GradeItem label="Parcial 1" grade={findGrade('Parcial 1')} />
                                        <GradeItem label="Recup. 1" grade={findGrade('Recuperatorio 1')} />
                                        <GradeItem label="TP" grade={findGrade('TP')} />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-[--color-text-secondary] mb-3">2do Cuatrimestre</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <GradeItem label="Parcial 2" grade={findGrade('Parcial 2')} />
                                        <GradeItem label="Recup. 2" grade={findGrade('Recuperatorio 2')} />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-[--color-border] grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                                <div>
                                    <p className="text-sm text-[--color-text-secondary]">Promedio Final</p>
                                    <p className={`font-bold text-2xl ${finalAverage ? getGradeColor(finalAverage) : ''}`}>{finalAverage ? finalAverage.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-[--color-text-secondary]">Estado</p>
                                    <p className={`font-bold text-xl ${statusColor}`}>{finalStatus}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-[--color-text-secondary]">Nota Final</p>
                                    <p className={`font-bold text-2xl ${finalExam && finalExam.value && !isNaN(parseFloat(finalExam.value)) ? getGradeColor(parseFloat(finalExam.value)) : ''}`}>{finalExam?.value || '-'}</p>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

const OpcionesView: React.FC<{
    profile: UserProfileData;
    onSave: (updatedProfile: UserProfileData) => void;
}> = ({ profile, onSave }) => {
    const notificationSettings = profile.notificationSettings || {};

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
                <p className="text-[--color-text-secondary] mb-8">Gestiona las alertas y otras configuraciones.</p>

                <section>
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

const TimeAgo: React.FC<{ date: string }> = ({ date }) => {
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diffInSeconds < 60) return <span>hace {diffInSeconds}s</span>;
    if (diffInSeconds < 3600) return <span>hace {Math.floor(diffInSeconds / 60)}m</span>;
    if (diffInSeconds < 86400) return <span>hace {Math.floor(diffInSeconds / 3600)}h</span>;
    return <span>hace {Math.floor(diffInSeconds / 86400)}d</span>;
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
                        <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={5} className="input-styled w-full" required placeholder="Describe detalladamente tu reclamo o sugerencia. Tu identidad se mantendrá anónima para el C.E." />
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

const StudentReclamosView: React.FC<{
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

const StudentCommunityView: React.FC<{
  currentUser: User;
  allUsers: User[];
  studentRepEvents: StudentRepEvent[];
  eventParticipants: Record<string, number[]>;
  onJoinEvent: (eventId: string, studentId: number) => void;
  threads: StudentRepForumThread[];
  replies: StudentRepForumReply[];
  onAddReply: (reply: Omit<StudentRepForumReply, 'id' | 'timestamp'>) => void;
  studentRepClaims: StudentRepClaim[];
  onAddStudentRepClaim: (claim: Omit<StudentRepClaim, 'id' | 'authorId' | 'timestamp' | 'status'>) => void;
}> = ({ currentUser, allUsers, studentRepEvents, eventParticipants, onJoinEvent, threads, replies, onAddReply, studentRepClaims, onAddStudentRepClaim }) => {
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

            {activeTab === 'eventos' && (
                <EventosView
                    events={studentRepEvents}
                    participants={eventParticipants}
                    currentUser={currentUser}
                    onJoinEvent={onJoinEvent}
                />
            )}
            {activeTab === 'foros' && (
                <StudentRepForumsView
                    currentUser={currentUser}
                    allUsers={allUsers}
                    threads={threads}
                    replies={replies}
                    onAddReply={onAddReply}
                />
            )}
            {activeTab === 'reclamos' && (
                 <StudentReclamosView 
                    currentUser={currentUser}
                    claims={studentRepClaims.filter(c => c.authorId === currentUser.id)}
                    onAddClaim={onAddStudentRepClaim}
                />
            )}
        </div>
    );
};

export const StudentDashboard: React.FC<StudentDashboardProps> = (props) => {
  const { user, onLogout, allUsers, userProfiles, onUpdateProfile, userNotes, onUpdateNotes, theme, setTheme, borderStyle, setBorderStyle, fontStyle, setFontStyle, preceptor, attendanceRecords, grades, subjects, newsItems, privateMessages, notifications, sendPrivateMessage, markMessagesAsRead, markNotificationsAsRead, addNotification, requestJustification, onVerifyQRAttendance, forumThreads, forumReplies, onAddForumThread, onEditForumThread, onAddForumReply, onDeleteForumThread, onDeleteForumReply, onToggleLockThread, classSchedule, customEvents, onAddEvent, materials, onUpdateMaterials, studentRepEvents, eventParticipants, onJoinEvent, studentRepThreads, studentRepReplies, onUpdateStudentRepReplies, studentRepClaims, onAddStudentRepClaim } = props;
  
  const [activeView, setActiveView] = useState('overview');
  const [viewingProfile, setViewingProfile] = useState<User | null>(null);
  const [forumsKey, setForumsKey] = useState(Date.now());
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const [selectedJustificationRecord, setSelectedJustificationRecord] = useState<AttendanceRecord | null>(null);
  const [selectedSubjectHistory, setSelectedSubjectHistory] = useState<{ subject: Subject; records: AttendanceRecord[] } | null>(null);
  const [chattingWithPreceptor, setChattingWithPreceptor] = useState(false);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [viewingMaterialsFor, setViewingMaterialsFor] = useState<Subject | null>(null);

  const userProfile = userProfiles[user.id] || {};
  const permissions = userProfile.viewPermissions || {};
  const isViewAllowed = (view: string) => permissions[view as keyof typeof permissions] !== false;

  const handleNavigate = (view: string) => {
    // If clicking the current tab again, reset its detail/sub view to return to the list
    if (activeView === view) {
      if (view === 'classmates') {
        setViewingProfile(null);
      }
      if (view === 'forums') {
        setForumsKey(Date.now()); // Force remount of ForumsView to reset its internal state
      }
    } else {
        // Always close the profile view when navigating away to a different section to avoid getting "stuck"
        setViewingProfile(null);
    }
    
    setActiveView(view);
  };
  
  useEffect(() => {
    if (!isViewAllowed(activeView)) {
        setActiveView('overview');
    }
  }, [activeView, permissions]);

  useEffect(() => {
    setIsNotificationPanelOpen(false);
    setIsUserMenuOpen(false);
  }, [activeView, viewingProfile]);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) setIsUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const myAttendanceRecords = useMemo(() => attendanceRecords.filter(r => r.studentId === user.id), [attendanceRecords, user.id]);
  const mySubjects = useMemo(() => subjects.filter(s => s.careerId === user.careerId && s.year === user.year), [subjects, user.careerId, user.year]);
  const unreadMessages = useMemo(() => preceptor ? privateMessages.filter(m => m.receiverId === user.id && m.senderId === preceptor.id && !m.read).length : 0, [privateMessages, user.id, preceptor]);
  const myNotifications = useMemo(() => notifications.filter(n => n.userId === user.id).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()), [notifications, user.id]);
  const unreadNotifications = useMemo(() => myNotifications.filter(n => !n.read).length, [myNotifications]);
  const myGrades = useMemo(() => grades.filter(g => g.studentId === user.id), [grades, user.id]);

  useEffect(() => { if (chattingWithPreceptor && preceptor) markMessagesAsRead(user.id, preceptor.id); }, [chattingWithPreceptor, preceptor, user.id, markMessagesAsRead]);
  
  const handleOpenJustificationModal = (record: AttendanceRecord) => { setSelectedJustificationRecord(record); setSelectedSubjectHistory(null); };
  const absences = useMemo(() => myAttendanceRecords.filter(r => r.status === AttendanceStatus.ABSENT).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [myAttendanceRecords]);
  const allHistory = useMemo(() => [...myAttendanceRecords].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [myAttendanceRecords]);
  
  const handleAddStudentRepReply = (replyData: Omit<StudentRepForumReply, 'id' | 'timestamp'>) => {
    onUpdateStudentRepReplies(prev => [...prev, {
        ...replyData,
        id: `srfr-${Date.now()}`,
        timestamp: new Date().toISOString()
    }]);
  };

  const renderTabButton = (view: string, label: string, icon: React.ReactNode) => {
    if (!isViewAllowed(view)) return null;
    return (
        <button onClick={() => handleNavigate(view)} className={`flex items-center gap-2 whitespace-nowrap py-4 px-3 border-b-2 font-semibold text-base transition-all duration-300 ${activeView === view ? 'border-[--color-accent] text-[--color-accent]' : 'border-transparent text-[--color-text-secondary] hover:text-[--color-text-primary] hover:border-gray-400'}`}>
        {icon} <span>{label}</span>
        </button>
    );
  };

  const renderBottomNavButton = (view: string, label: string, icon: React.ReactNode) => {
    if (!isViewAllowed(view)) return null;
    return (
        <button onClick={() => handleNavigate(view)} className={`flex flex-col items-center justify-center gap-1 w-full pt-3 pb-2 text-sm transition-colors duration-300 relative ${activeView === view ? 'text-[--color-accent]' : 'text-[--color-text-secondary] hover:text-[--color-text-primary]'}`}>
        {icon}
        <span className="text-xs font-medium">{label}</span>
        {activeView === view && <div className="absolute bottom-0 w-10 h-1 bg-[--color-accent] rounded-full"></div>}
        </button>
    );
  };

  const renderCurrentView = () => {
    if (!isViewAllowed(activeView)) {
        if(isViewAllowed('overview')) return <WelcomeBanner user={user} records={myAttendanceRecords} subjects={mySubjects} unreadMessages={unreadMessages} unreadNotifications={unreadNotifications} onBellClick={() => { setIsNotificationPanelOpen(prev => !prev); setIsUserMenuOpen(false); }} onNavigate={handleNavigate} onOpenChat={() => setChattingWithPreceptor(true)} />;
        return (
            <div className="glass-card p-8 text-center">
                <h3 className="text-xl font-bold">Acceso Denegado</h3>
                <p className="text-[--color-text-secondary] mt-2">No tienes permiso para ver esta sección.</p>
            </div>
        );
    }
    switch (activeView) {
      case 'overview': return <Overview user={user} subjects={mySubjects} newsItems={newsItems} forumThreads={forumThreads} onNavigate={handleNavigate} onViewSubjectMaterials={setViewingMaterialsFor}/>;
      case 'qr-attendance': return <QRAttendanceScanner onVerify={onVerifyQRAttendance} />;
      case 'calificaciones': return <GradesView user={user} subjects={mySubjects} grades={myGrades} />;
      case 'absences': return (
          <div className="animate-fade-in-up">
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold mb-4 text-[--color-text-primary]">Mis Faltas</h2>
              {myAttendanceRecords.length === 0 ? (
                  <div className="text-center text-[--color-text-secondary] py-12">
                    <FileWarningIcon className="w-12 h-12 mx-auto opacity-50 mb-4" />
                    <h3 className="text-xl font-bold text-[--color-text-primary]">Sin registros</h3>
                    <p>Aún no se han cargado asistencias. Tus faltas aparecerán aquí.</p>
                  </div>
              ) : absences.length > 0 ? (
                <ul className="space-y-3">
                  {absences.map(record => (
                      <li key={record.id} className="bg-[--color-secondary] p-4 rounded-lg flex items-center justify-between gap-4 border border-[--color-border]">
                        <div>
                          <p className="font-semibold text-[--color-text-primary]">{mySubjects.find(s => s.id === record.subjectId)?.name}</p>
                          <p className="text-sm text-[--color-text-secondary]">{new Date(record.date + 'T00:00:00').toLocaleDateString('es-AR')}</p>
                        </div>
                        <button onClick={() => handleOpenJustificationModal(record)} className="btn btn-primary">Justificar</button>
                      </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center text-[--color-text-secondary] py-12">
                  <CheckCircleIcon className="w-12 h-12 mx-auto text-green-500 mb-4"/>
                  <h3 className="text-xl font-bold text-green-600">¡Felicitaciones!</h3>
                  <p>No tienes faltas registradas.</p>
                </div>
              )}
            </div>
          </div>
        );
      case 'history': return (
            <div className="animate-fade-in-up">
                <div className="glass-card p-6">
                    <h2 className="text-xl font-bold mb-4 text-[--color-text-primary]">Historial Completo</h2>
                    {allHistory.length > 0 ? (
                      <ul className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
                          {allHistory.map(record => {
                              const subject = mySubjects.find(s => s.id === record.subjectId); if (!subject) return null;
                              const style = statusStyles[record.status];
                              return (
                                  <li key={record.id} className={`${style.color} bg-opacity-30 p-4 rounded-lg flex items-center justify-between gap-4 border border-current`}>
                                      <div className="flex items-center gap-3">
                                          <div className="text-current">{style.icon}</div>
                                          <div>
                                              <p className="font-semibold text-current">{subject.name}</p>
                                              <p className="text-sm text-current/80">{new Date(record.date + 'T00:00:00').toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                          </div>
                                      </div>
                                      <span className={`font-bold text-sm text-current`}>{style.text}</span>
                                  </li>
                              );
                          })}
                      </ul>
                    ) : (
                      <div className="text-center text-[--color-text-secondary] py-12">
                        <ClockIcon className="w-12 h-12 mx-auto opacity-50 mb-4" />
                        <h3 className="text-xl font-bold text-[--color-text-primary]">Tu historial está vacío</h3>
                        <p>Cuando se registren tus asistencias, aparecerán aquí.</p>
                      </div>
                    )}
                </div>
            </div>
        );
      case 'stats': return <AttendanceStats records={myAttendanceRecords} subjects={mySubjects} onOpenSubjectHistory={(subject, records) => setSelectedSubjectHistory({ subject, records })} />;
      case 'classmates': return <ClassmatesView user={user} allUsers={allUsers} userProfiles={userProfiles} onViewProfile={setViewingProfile} />;
      case 'forums': return <ForumsView key={forumsKey} currentUser={user} allUsers={allUsers} threads={forumThreads} replies={forumReplies} onAddThread={onAddForumThread} onAddReply={onAddForumReply} onEditThread={onEditForumThread} onDeleteThread={onDeleteForumThread} onDeleteReply={onDeleteForumReply} onToggleLockThread={onToggleLockThread}/>;
      case 'profile': return <ProfileView viewedUser={user} currentUser={user} profileData={userProfiles[user.id] || {}} onUpdateProfile={(data) => onUpdateProfile(user.id, data)} onBack={() => handleNavigate('overview')} />;
      case 'agenda': return <AgendaView user={user} newsItems={newsItems} subjects={subjects} classSchedule={classSchedule} customEvents={customEvents} onAddEvent={onAddEvent} addNotification={addNotification} userProfile={userProfile} />;
      case 'notes': return <NotesView notes={userNotes} onUpdateNotes={onUpdateNotes} />;
      case 'opciones': return <OpcionesView profile={userProfile} onSave={(data) => onUpdateProfile(user.id, data)} />;
      case 'appearance': return <AppearanceView currentTheme={theme} onSetTheme={setTheme} currentBorderStyle={borderStyle} onSetBorderStyle={setBorderStyle} currentFontStyle={fontStyle} onSetFontStyle={setFontStyle} />;
      case 'comunidad': return <StudentCommunityView 
            currentUser={user} 
            allUsers={allUsers} 
            studentRepEvents={studentRepEvents}
            eventParticipants={eventParticipants}
            onJoinEvent={onJoinEvent}
            threads={studentRepThreads} 
            replies={studentRepReplies} 
            onAddReply={handleAddStudentRepReply} 
            studentRepClaims={studentRepClaims}
            onAddStudentRepClaim={onAddStudentRepClaim}
        />;
      default: return null;
    }
  };

  const profilePic = userProfiles[user.id]?.profilePicture;

  if (viewingMaterialsFor) {
    return <StudentMaterialView 
        subject={viewingMaterialsFor} 
        materials={materials.filter(m => m.subjectId === viewingMaterialsFor.id)}
        allMaterials={materials}
        onUpdateMaterials={onUpdateMaterials}
        onBack={() => setViewingMaterialsFor(null)} 
    />;
  }

  return (
    <>
      <header className="bg-[--color-header-bg] backdrop-blur-lg sticky top-0 z-30 border-b border-black/10 transition-colors duration-500">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            <button onClick={() => handleNavigate('overview')} className="flex items-center gap-3 cursor-pointer">
              <BookOpenIcon className="h-12 w-12 text-[--color-accent]" />
              <span className="text-xl font-bold">Asistencia Terciario</span>
            </button>
            <div className="relative z-50" ref={userMenuRef}>
              <button onClick={() => { setIsUserMenuOpen(prev => !prev); setIsNotificationPanelOpen(false); }} className="flex items-center gap-2 p-2 rounded-lg hover:bg-black/5 transition-colors">
                  {profilePic ? <img src={profilePic} alt="Perfil" className="w-8 h-8 rounded-full object-cover bg-[--color-secondary]"/> : <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[--color-secondary]"><UserIcon className="w-5 h-5 text-[--color-accent]"/></div>}
                  <div className="text-left hidden sm:block">
                      <p className="font-semibold leading-tight text-[--color-text-primary]">{user.name}</p>
                      <p className="text-sm text-[--color-text-secondary] leading-tight">{user.role}</p>
                  </div>
                  <ChevronDownIcon className={`w-5 h-5 text-[--color-text-secondary] transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`}/>
              </button>
              {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-72 solid-card animate-fade-in-up p-2" style={{animationDuration: '0.2s'}}>
                    <div className="p-2 border-b border-[--color-border] mb-2">
                        <p className="font-bold text-[--color-text-primary]">{user.name}</p>
                        <p className="text-sm text-[--color-text-secondary]">{user.email}</p>
                    </div>
                    <div className="space-y-1">
                        {isViewAllowed('profile') && <button onClick={() => { handleNavigate('profile'); setIsUserMenuOpen(false); }} className="w-full flex items-center gap-3 text-left px-3 py-2 text-[--color-text-primary] hover:bg-black/5 rounded-lg transition-colors"><UserIcon className="w-5 h-5 text-[--color-text-secondary]" /> <span className="font-semibold">Mi Perfil</span></button>}
                        {isViewAllowed('agenda') && <button onClick={() => { handleNavigate('agenda'); setIsUserMenuOpen(false); }} className="w-full flex items-center gap-3 text-left px-3 py-2 text-[--color-text-primary] hover:bg-black/5 rounded-lg transition-colors"><CalendarIcon className="w-5 h-5 text-[--color-text-secondary]" /> <span className="font-semibold">Agenda Académica</span></button>}
                        {isViewAllowed('notes') && <button onClick={() => { handleNavigate('notes'); setIsUserMenuOpen(false); }} className="w-full flex items-center gap-3 text-left px-3 py-2 text-[--color-text-primary] hover:bg-black/5 rounded-lg transition-colors"><StickyNoteIcon className="w-5 h-5 text-[--color-text-secondary]" /> <span className="font-semibold">Mis Notas</span></button>}
                        <button onClick={() => { handleNavigate('comunidad'); setIsUserMenuOpen(false); }} className="w-full flex items-center gap-3 text-left px-3 py-2 text-[--color-text-primary] hover:bg-black/5 rounded-lg transition-colors"><UsersIcon className="w-5 h-5 text-[--color-text-secondary]" /> <span className="font-semibold">Comunidad</span></button>
                        <button onClick={() => { handleNavigate('opciones'); setIsUserMenuOpen(false); }} className="w-full flex items-center gap-3 text-left px-3 py-2 text-[--color-text-primary] hover:bg-black/5 rounded-lg transition-colors"><SettingsIcon className="w-5 h-5 text-[--color-text-secondary]" /> <span className="font-semibold">Opciones</span></button>
                        <button onClick={() => { handleNavigate('appearance'); setIsUserMenuOpen(false); }} className="w-full flex items-center gap-3 text-left px-3 py-2 text-[--color-text-primary] hover:bg-black/5 rounded-lg transition-colors"><AppearanceIcon className="w-5 h-5 text-[--color-text-secondary]" /> <span className="font-semibold">Apariencia</span></button>
                        {isViewAllowed('qrAttendance') && <button onClick={() => { handleNavigate('qr-attendance'); setIsUserMenuOpen(false); }} className="w-full flex items-center gap-3 text-left px-3 py-2 text-[--color-text-primary] hover:bg-black/5 rounded-lg transition-colors"><QRIcon className="w-5 h-5 text-[--color-text-secondary]" /> <span className="font-semibold">Asistencia QR</span></button>}
                    </div>
                    <div className="p-2 mt-2 border-t border-[--color-border]"><button onClick={onLogout} className="w-full flex items-center gap-3 text-left px-3 py-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"><LogoutIcon className="w-5 h-5" /><span className="font-semibold">Cerrar Sesión</span></button></div>
                  </div>
              )}
            </div>
        </nav>
      </header>

      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="pb-24 md:pb-0 relative">
            {viewingProfile ? (
              <ProfileView
                viewedUser={viewingProfile}
                currentUser={user}
                profileData={userProfiles[viewingProfile.id] || {}}
                onUpdateProfile={(data) => onUpdateProfile(viewingProfile.id, data)}
                onBack={() => setViewingProfile(null)}
              />
            ) : (
              <>
                {activeView === 'overview' && isViewAllowed('overview') && <WelcomeBanner user={user} records={myAttendanceRecords} subjects={mySubjects} unreadMessages={unreadMessages} unreadNotifications={unreadNotifications} onBellClick={() => { setIsNotificationPanelOpen(prev => !prev); setIsUserMenuOpen(false); }} onNavigate={handleNavigate} onOpenChat={() => setChattingWithPreceptor(true)} />}
                {isNotificationPanelOpen && <NotificationPanel notifications={myNotifications} onClose={() => setIsNotificationPanelOpen(false)} onMarkAllRead={() => markNotificationsAsRead(user.id)} />}
                <div className="mt-8 hidden md:block">
                    <div className="border-b border-[--color-border]">
                        <nav className="-mb-px flex space-x-2 sm:space-x-6 overflow-x-auto" aria-label="Tabs">
                            {renderTabButton('overview', 'Materias', <HomeIcon className="w-5 h-5"/>)}
                            {renderTabButton('calificaciones', 'Calificaciones', <ClipboardListIcon className="w-5 h-5" />)}
                            {renderTabButton('classmates', 'Compañeros', <UsersIcon className="w-5 h-5"/>)}
                             {renderTabButton('forums', 'Foros', <ChatBubbleIcon className="w-5 h-5"/>)}
                            {renderTabButton('absences', 'Mis Faltas', <FileWarningIcon className="w-5 h-5"/>)}
                            {renderTabButton('history', 'Historial Completo', <ClockIcon className="w-5 h-5"/>)}
                            {renderTabButton('stats', 'Estadísticas', <ChartBarIcon className="w-5 h-5"/>)}
                        </nav>
                    </div>
                </div>
                <div className="md:mt-8">{renderCurrentView()}</div>
              </>
            )}
        </div>

        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[--color-primary] border-t border-[--color-border] z-40 shadow-[0_-2px_10px_rgba(var(--color-shadow-rgb),0.1)]">
            <nav className="flex justify-around items-center">
                {renderBottomNavButton('overview', 'Materias', <HomeIcon className="w-6 h-6"/>)}
                {renderBottomNavButton('calificaciones', 'Calif.', <ClipboardListIcon className="w-6 h-6" />)}
                {renderBottomNavButton('forums', 'Foros', <ChatBubbleIcon className="w-6 h-6"/>)}
                {renderBottomNavButton('absences', 'Faltas', <FileWarningIcon className="w-6 h-6"/>)}
                {renderBottomNavButton('stats', 'Stats', <ChartBarIcon className="w-6 h-6"/>)}
            </nav>
        </div>
      </main>

      {preceptor && <button onClick={() => setChattingWithPreceptor(true)} className="fixed bottom-24 right-6 md:bottom-6 z-40 btn btn-primary py-3 px-4 rounded-full shadow-lg transform hover:scale-105 transition-transform"><MessageSquareIcon className="w-6 h-6"/>{unreadMessages > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">{unreadMessages}</span>}</button>}
      {chattingWithPreceptor && preceptor && <ChatModal user={user} preceptor={preceptor} messages={privateMessages} onClose={() => setChattingWithPreceptor(false)} onSendMessage={(text) => sendPrivateMessage(user.id, preceptor.id, text)} />}
      {selectedJustificationRecord && <JustificationModal record={selectedJustificationRecord} subjectName={mySubjects.find(s => s.id === selectedJustificationRecord.subjectId)?.name || ''} onClose={() => setSelectedJustificationRecord(null)} onSubmit={requestJustification} />}
      {selectedSubjectHistory && <SubjectHistoryModal subject={selectedSubjectHistory.subject} records={selectedSubjectHistory.records} onClose={() => setSelectedSubjectHistory(null)} onJustify={handleOpenJustificationModal} />}
    </>
  );
};