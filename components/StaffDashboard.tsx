import React, { useState, useMemo, useRef, useEffect } from 'react';
// FIX: Import 'Notification' type to avoid conflict with the browser's global 'Notification' type.
import { User, UserProfileData, Note, DailyTask, TaskType, TaskStatus, StaffSchedule, ShiftType, Installation, InstallationStatus, InstallationLayout, Incident, IncidentStatus, IncidentPriority, MaintenanceHistoryItem, ShiftChangeRequest, Role, NotificationType, Notification as AppNotification } from '../types';
// FIX: Remove duplicate import of 'CheckCircleIcon' and its alias 'TasksIcon' to prevent type resolution issues.
import { BellIcon, UserIcon as ProfileIcon, ChevronDownIcon, LogoutIcon, AppearanceIcon, BookOpenIcon, AlertTriangleIcon, BuildingIcon, CalendarIcon, FileTextIcon, PencilIcon, ClockIcon, PlusCircleIcon, CheckCircleIcon, SparklesIcon, ClipboardListIcon, CameraIcon, TrashIcon, FullscreenEnterIcon, FullscreenExitIcon, XCircleIcon, UsersIcon } from './Icons';
import { Theme, BorderStyle, FontStyle } from '../App';
import { NotificationPanel } from './NotificationPanel';
import { ProfileView } from './ProfileView';
import { AppearanceView } from './AppearanceModal';

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
  addNotification: (notificationData: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
  dailyTasks: DailyTask[];
  onUpdateTasks: (tasks: DailyTask[] | ((prevTasks: DailyTask[]) => DailyTask[])) => void;
  maintenanceHistory: MaintenanceHistoryItem[];
  onUpdateMaintenanceHistory: (history: MaintenanceHistoryItem[] | ((prevHistory: MaintenanceHistoryItem[]) => MaintenanceHistoryItem[])) => void;
  installations: Installation[];
  onUpdateInstallations: (installations: Installation[] | ((prev: Installation[]) => Installation[])) => void;
  incidents: Incident[];
  onUpdateIncidents: (incidents: Incident[] | ((prev: Incident[]) => Incident[])) => void;
}

const staffScheduleData: StaffSchedule[] = [
  { id: 'sch-1', day: 'Lunes', date: '15/07', time: '08:00 - 16:30', type: 'Normal' },
  { id: 'sch-2', day: 'Martes', date: '16/07', time: '08:00 - 16:30', type: 'Normal' },
  { id: 'sch-3', day: 'Miércoles', date: '17/07', time: '14:00 - 22:30', type: 'Cambio' },
  { id: 'sch-4', day: 'Jueves', date: '18/07', time: 'Día Libre', type: 'Libre' },
  { id: 'sch-5', day: 'Viernes', date: '19/07', time: '08:00 - 16:30', type: 'Normal' },
  { id: 'sch-6', day: 'Sábado', date: '20/07', time: '09:00 - 13:00', type: 'Feriado' },
  { id: 'sch-7', day: 'Domingo', date: '21/07', time: 'Día Libre', type: 'Libre' },
];

const TimeAgo: React.FC<{ date: string }> = ({ date }) => {
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diffInSeconds < 60) return <span>hace {diffInSeconds}s</span>;
    if (diffInSeconds < 3600) return <span>hace {Math.floor(diffInSeconds / 60)}m</span>;
    if (diffInSeconds < 86400) return <span>hace {Math.floor(diffInSeconds / 3600)}h</span>;
    return <span>hace {Math.floor(diffInSeconds / 86400)}d</span>;
}

const InstalacionesView: React.FC<{
    installations: Installation[];
    onUpdateInstallations: (installations: Installation[] | ((prev: Installation[]) => Installation[])) => void;
    onAddIncident: (incident: Omit<Incident, 'id' | 'timestamp' | 'status'>) => void;
    onResolveIncidentsForSector: (sectorName: string) => void;
}> = ({ installations, onUpdateInstallations, onAddIncident, onResolveIncidentsForSector }) => {
    const [selectedSector, setSelectedSector] = useState<Installation | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const mapContainerRef = useRef<HTMLDivElement>(null);

    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            mapContainerRef.current?.requestFullscreen().catch(err => {
                alert(`Error al activar pantalla completa: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    useEffect(() => {
        const handleFullScreenChange = () => {
            setIsFullScreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullScreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
    }, []);

    const statusStyles: Record<InstallationStatus, { classes: string; label: string; }> = {
        ok: { classes: 'bg-green-100 border-green-300 text-green-800', label: 'Limpio' },
        maintenance: { classes: 'bg-yellow-100 border-yellow-300 text-yellow-800', label: 'En Mantenimiento' },
        out_of_service: { classes: 'bg-red-100 border-red-300 text-red-800', label: 'Fuera de Servicio' },
    };
    
    const handleUpdateSector = (updatedSector: Installation) => {
        onUpdateInstallations(prev => prev.map(inst => inst.id === updatedSector.id ? updatedSector : inst));
        setSelectedSector(updatedSector);
    };
    
    const handleDeleteSector = (id: string) => {
        onUpdateInstallations(prev => prev.filter(inst => inst.id !== id));
        setSelectedSector(null);
    };

    const handleAddSector = () => {
        const newSector: Installation = {
            id: `sector-${Date.now()}`, name: 'Nuevo Sector', status: 'ok',
            layout: { col: 1, row: 1, colSpan: 1, rowSpan: 1 },
            details: { lastCleaned: new Date().toLocaleDateString() }
        };
        onUpdateInstallations(prev => [...prev, newSector]);
        setSelectedSector(newSector);
    };

    return (
      <div className="animate-fade-in-up">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h1 className="text-3xl font-bold text-[--color-text-primary]">Estado de Instalaciones</h1>
            <div className="flex gap-2">
                <button onClick={toggleFullScreen} className="btn btn-secondary">
                    {isFullScreen ? <FullscreenExitIcon className="w-5 h-5"/> : <FullscreenEnterIcon className="w-5 h-5"/>}
                    <span className="hidden sm:inline">{isFullScreen ? 'Salir' : 'P. Completa'}</span>
                </button>
                <button onClick={() => { setIsEditMode(!isEditMode); setSelectedSector(null); }} className={`btn ${isEditMode ? 'btn-success' : 'btn-secondary'}`}>
                    {isEditMode ? <CheckCircleIcon className="w-5 h-5"/> : <PencilIcon className="w-5 h-5"/>}
                    <span className="hidden sm:inline">{isEditMode ? 'Finalizar Edición' : 'Editar Plano'}</span>
                </button>
            </div>
        </div>
        
        {isEditMode && 
            <div className="solid-card p-4 mb-6 flex items-center justify-center gap-4">
                 <p className="text-sm text-[--color-text-secondary]">Haz clic en un sector para editarlo.</p>
                 <button onClick={handleAddSector} className="btn btn-primary text-sm"><PlusCircleIcon className="w-5 h-5"/>Añadir Sector</button>
            </div>
        }

        <div className="solid-card p-4 md:p-6" ref={mapContainerRef}>
            <p className="md:hidden text-center text-sm text-[--color-text-secondary] mb-2">‹ Desliza para ver el plano completo ›</p>
            <div className="overflow-x-auto">
                 <div className="installation-map">
                    {installations.map(inst => {
                        const style = statusStyles[inst.status];
                        const isSelected = selectedSector?.id === inst.id;
                        const isEntrada = inst.id === 'entrada';
                        const isBiblioteca = inst.id === 'biblioteca';
                        const specialBorder = (isEntrada || isBiblioteca) && !isSelected ? 'border-[--color-accent]' : '';
                        return (
                            <button
                                key={inst.id}
                                onClick={() => setSelectedSector(inst)}
                                className={`sector p-2 rounded-lg flex items-center justify-center font-bold text-center transition-all duration-200 border-2 ${style.classes} ${isSelected ? '!border-[--color-accent] ring-2 ring-[--color-accent]' : specialBorder} ${isEditMode ? 'hover:border-blue-400' : 'hover:scale-[1.03]'}`}
                                style={{ gridColumn: `${inst.layout.col} / span ${inst.layout.colSpan}`, gridRow: `${inst.layout.row} / span ${inst.layout.rowSpan}` }}
                            >
                                <span className="text-xs md:text-sm">{inst.name}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>

        <div className="solid-card p-6 mt-6">
            {!selectedSector ? (
                <div className="text-center text-[--color-text-secondary]">
                    <h3 className="font-bold text-lg text-[--color-text-primary]">Selecciona un sector</h3>
                    <p className="text-sm">Haz clic en un área del plano para ver sus detalles {isEditMode && 'o para editarlo'}.</p>
                </div>
            ) : isEditMode ? (
                 <EditPanel
                    key={selectedSector.id} 
                    sector={selectedSector} 
                    onUpdate={handleUpdateSector} 
                    onDelete={handleDeleteSector} 
                />
            ) : (
                <DetailsPanel 
                    sector={selectedSector} 
                    statusStyles={statusStyles} 
                    onAddIncident={onAddIncident}
                    onResolveIncidentsForSector={onResolveIncidentsForSector}
                />
            )}
        </div>
        <style>{`
            .installation-map { display: grid; gap: 0.75rem; grid-template-columns: repeat(9, 1fr); grid-auto-rows: 70px; min-width: 900px; }
            div:fullscreen {
                background-color: var(--color-background);
                padding: 2rem;
                overflow: auto;
            }
            div:fullscreen .installation-map {
                min-width: 1200px;
                min-height: 80vh;
                gap: 1rem;
                grid-auto-rows: 120px;
            }
        `}</style>
      </div>
    );
};

const DetailsPanel: React.FC<{
    sector: Installation, 
    statusStyles: any, 
    onAddIncident: (incident: Omit<Incident, 'id' | 'timestamp' | 'status'>) => void,
    onResolveIncidentsForSector: (sectorName: string) => void
}> = ({ sector, statusStyles, onAddIncident, onResolveIncidentsForSector }) => {
    const [isCreatingIncident, setIsCreatingIncident] = useState<InstallationStatus | null>(null);
    const [incidentReason, setIncidentReason] = useState('');

    const handleCreateIncident = () => {
        if (!incidentReason.trim() || !isCreatingIncident) return;
        
        const priority: IncidentPriority = isCreatingIncident === 'out_of_service' ? 'Alta' : 'Media';
        onAddIncident({
            description: incidentReason,
            sector: sector.name,
            priority,
        });

        setIsCreatingIncident(null);
        setIncidentReason('');
    };
    
    if (isCreatingIncident) {
        return (
             <div className="animate-fade-in">
                <h3 className="text-xl font-bold text-[--color-text-primary] mb-2">Reportar Incidencia en {sector.name}</h3>
                <p className="text-sm text-[--color-text-secondary] mb-4">Describe el problema para crear un nuevo reporte.</p>
                <textarea
                    value={incidentReason}
                    onChange={e => setIncidentReason(e.target.value)}
                    rows={3}
                    className="input-styled w-full"
                    placeholder="Ej: Canilla pierde agua, luz no enciende..."
                    autoFocus
                />
                <div className="flex gap-2 justify-end mt-4">
                    <button onClick={() => setIsCreatingIncident(null)} className="btn btn-secondary">Cancelar</button>
                    <button onClick={handleCreateIncident} className="btn btn-primary">Confirmar</button>
                </div>
            </div>
        )
    }

    return (
        <div className="animate-fade-in">
            <h3 className="text-2xl font-bold text-[--color-text-primary] mb-1">{sector.name}</h3>
            <p className={`font-semibold mb-4 ${statusStyles[sector.status].classes}`}>{statusStyles[sector.status].label}</p>
            <div className="text-sm text-[--color-text-secondary] space-y-2 mb-6">
                <p><span className="font-semibold text-[--color-text-primary]">Última limpieza:</span> {sector.details.lastCleaned}</p>
                {sector.details.nextTask && <p><span className="font-semibold text-[--color-text-primary]">Próxima tarea:</span> {sector.details.nextTask}</p>}
                {sector.details.incident && <p><span className="font-semibold text-[--color-text-primary]">Incidencia:</span> {sector.details.incident}</p>}
            </div>
            <div className="flex flex-wrap gap-2 pt-4 border-t border-[--color-border]">
                <button onClick={() => onResolveIncidentsForSector(sector.name)} className="btn btn-sm bg-green-100 text-green-800 hover:bg-green-200">Marcar Limpio</button>
                <button onClick={() => setIsCreatingIncident('maintenance')} className="btn btn-sm bg-yellow-100 text-yellow-800 hover:bg-yellow-200">En Mantenimiento</button>
                <button onClick={() => setIsCreatingIncident('out_of_service')} className="btn btn-sm bg-red-100 text-red-800 hover:bg-red-200">Fuera de Servicio</button>
            </div>
        </div>
    );
};

type FormData = {
    name: string;
    layout: { [key in keyof InstallationLayout]: number | string };
};

const EditPanel: React.FC<{sector: Installation, onUpdate: (sector: Installation) => void, onDelete: (id: string) => void}> = ({ sector, onUpdate, onDelete }) => {
    const [formData, setFormData] = useState<FormData>({ name: sector.name, layout: sector.layout });

    useEffect(() => {
        setFormData({ name: sector.name, layout: sector.layout });
    }, [sector]);

    const handleInputChange = (field: keyof FormData, value: string) => {
        if (field === 'name') {
            setFormData(prev => ({ ...prev, name: value }));
        }
    };
    
    const handleLayoutInputChange = (field: keyof InstallationLayout, value: string) => {
        setFormData(prev => ({
            ...prev,
            layout: { ...prev.layout, [field]: value }
        }));
    };
    
    const handleBlur = () => {
        const finalLayout: InstallationLayout = {
            col: Math.max(1, parseInt(formData.layout.col as string, 10) || 1),
            row: Math.max(1, parseInt(formData.layout.row as string, 10) || 1),
            colSpan: Math.max(1, parseInt(formData.layout.colSpan as string, 10) || 1),
            rowSpan: Math.max(1, parseInt(formData.layout.rowSpan as string, 10) || 1),
        };
        onUpdate({ ...sector, name: formData.name || 'Sin Nombre', layout: finalLayout });
    };
    
    const handleShapePreset = (shape: string) => {
        const { col, row } = sector.layout;
        let newLayout = { ...sector.layout };
        switch(shape) {
            case '1x1': newLayout = { ...newLayout, colSpan: 1, rowSpan: 1 }; break;
            case '2x1': newLayout = { ...newLayout, colSpan: 2, rowSpan: 1 }; break;
            case '1x2': newLayout = { ...newLayout, colSpan: 1, rowSpan: 2 }; break;
            case '2x2': newLayout = { ...newLayout, colSpan: 2, rowSpan: 2 }; break;
            default: return; // Do nothing if custom
        }
        onUpdate({ ...sector, layout: newLayout });
    };

    return (
        <div className="animate-fade-in space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-[--color-text-primary]">Editar Sector</h3>
                <button onClick={() => window.confirm('¿Seguro que quieres eliminar este sector?') && onDelete(sector.id)} className="btn btn-danger !p-2"><TrashIcon className="w-5 h-5"/></button>
            </div>
            <div>
                <label className="text-sm font-medium text-[--color-text-secondary]">Nombre</label>
                <input type="text" value={formData.name} onChange={e => handleInputChange('name', e.target.value)} onBlur={handleBlur} className="input-styled w-full mt-1"/>
            </div>
             <div>
                <label className="text-sm font-medium text-[--color-text-secondary]">Forma (Tamaño Rápido)</label>
                <select onChange={e => handleShapePreset(e.target.value)} className="input-styled w-full mt-1">
                    <option value="">Personalizado</option>
                    <option value="1x1">Cuadrado (1x1)</option>
                    <option value="2x1">Ancho (2x1)</option>
                    <option value="1x2">Alto (1x2)</option>
                    <option value="2x2">Grande (2x2)</option>
                </select>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                    <label className="text-sm font-medium text-[--color-text-secondary]">Columna</label>
                    <input type="number" value={formData.layout.col} onChange={e => handleLayoutInputChange('col', e.target.value)} onBlur={handleBlur} min="1" className="input-styled w-full mt-1"/>
                </div>
                 <div>
                    <label className="text-sm font-medium text-[--color-text-secondary]">Ancho (cols)</label>
                    <input type="number" value={formData.layout.colSpan} onChange={e => handleLayoutInputChange('colSpan', e.target.value)} onBlur={handleBlur} min="1" className="input-styled w-full mt-1"/>
                </div>
                 <div>
                    <label className="text-sm font-medium text-[--color-text-secondary]">Fila</label>
                    <input type="number" value={formData.layout.row} onChange={e => handleLayoutInputChange('row', e.target.value)} onBlur={handleBlur} min="1" className="input-styled w-full mt-1"/>
                </div>
                <div>
                    <label className="text-sm font-medium text-[--color-text-secondary]">Alto (filas)</label>
                    <input type="number" value={formData.layout.rowSpan} onChange={e => handleLayoutInputChange('rowSpan', e.target.value)} onBlur={handleBlur} min="1" className="input-styled w-full mt-1"/>
                </div>
            </div>
        </div>
    );
}

const HorariosView: React.FC = () => {
    const shiftStyles: Record<ShiftType, { border: string; text: string }> = {
        Normal: { border: 'border-blue-400', text: 'text-blue-400' },
        Cambio: { border: 'border-purple-400', text: 'text-purple-400' },
        Libre: { border: 'border-gray-500', text: 'text-gray-500' },
        Feriado: { border: 'border-green-400', text: 'text-green-400' },
    };

    return (
        <div className="animate-fade-in-up max-w-md mx-auto">
            <h1 className="text-3xl font-bold text-[--color-text-primary] mb-6 text-center sm:text-left">Mis Horarios y Turnos</h1>
            <div className="space-y-4">
                {staffScheduleData.map(shift => {
                    const styles = shiftStyles[shift.type];
                    return (
                        <div key={shift.id} className={`solid-card p-5 flex flex-col gap-1 border-l-4 ${styles.border}`}>
                            <p className="text-sm text-[--color-text-secondary]">{shift.day} {shift.date}</p>
                            <p className="text-2xl font-bold text-[--color-text-primary]">{shift.time}</p>
                            <p className={`text-sm font-semibold ${styles.text}`}>{shift.type}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

interface JustificacionesViewProps {
    user: User;
    allUsers: User[];
    addNotification: (notificationData: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
    shiftChangeRequests: ShiftChangeRequest[];
    onAddShiftChangeRequest: (request: Omit<ShiftChangeRequest, 'id' | 'status'>) => void;
    onUpdateRequestStatus: (requestId: string, status: 'accepted' | 'rejected') => void;
}

const JustificacionesView: React.FC<JustificacionesViewProps> = ({ user, allUsers, addNotification, shiftChangeRequests, onAddShiftChangeRequest, onUpdateRequestStatus }) => {
    // State for absence form
    const [absenceDate, setAbsenceDate] = useState('');
    const [absenceReason, setAbsenceReason] = useState('');
    const [absenceFile, setAbsenceFile] = useState<File | null>(null);
    const [absenceSubmitted, setAbsenceSubmitted] = useState(false);

    // State for shift change form
    const [changeMyTurno, setChangeMyTurno] = useState('');
    const [changeRequestTurno, setChangeRequestTurno] = useState('');
    const [changeColleague, setChangeColleague] = useState('');
    const [changeReason, setChangeReason] = useState('');
    const [changeSubmitted, setChangeSubmitted] = useState(false);
    
    const colleagues = useMemo(() => allUsers.filter(u => u.role === 'Auxiliar' && u.id !== user.id), [allUsers, user.id]);
    const userMap = useMemo(() => new Map(allUsers.map(u => [u.id, u.name])), [allUsers]);

    const incomingRequests = useMemo(() => shiftChangeRequests.filter(req => req.colleagueId === user.id && req.status === 'pending'), [shiftChangeRequests, user.id]);
    const outgoingRequests = useMemo(() => shiftChangeRequests.filter(req => req.requesterId === user.id).sort((a,b) => b.id.localeCompare(a.id)), [shiftChangeRequests, user.id]);

    const handleAbsenceSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!absenceDate || !absenceReason) return;
        setAbsenceSubmitted(true);
        setTimeout(() => {
            setAbsenceSubmitted(false);
            setAbsenceDate('');
            setAbsenceReason('');
            setAbsenceFile(null);
        }, 3000);
    };

    const handleChangeSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!changeMyTurno || !changeRequestTurno || !changeColleague) return;
        onAddShiftChangeRequest({
            requesterId: user.id,
            colleagueId: Number(changeColleague),
            requesterTurno: changeMyTurno,
            colleagueTurno: changeRequestTurno,
            reason: changeReason
        });
        setChangeSubmitted(true);
        setTimeout(() => {
            setChangeSubmitted(false);
            setChangeMyTurno('');
            setChangeRequestTurno('');
            setChangeColleague('');
            setChangeReason('');
        }, 3000);
    };
    
    const handleRequestResponse = (request: ShiftChangeRequest, accepted: boolean) => {
        const status = accepted ? 'accepted' : 'rejected';
        onUpdateRequestStatus(request.id, status);
        
        const requester = allUsers.find(u => u.id === request.requesterId);
        if (requester) {
            addNotification({
                userId: requester.id,
                type: accepted ? NotificationType.SHIFT_CHANGE_ACCEPTED : NotificationType.SHIFT_CHANGE_REJECTED,
                text: `Tu solicitud de cambio fue ${accepted ? 'aceptada' : 'rechazada'}`,
                details: `Por ${user.name} para el turno del ${new Date(request.requesterTurno + 'T00:00:00').toLocaleDateString('es-AR')}.`,
            });
        }
    };

    const getStatusPill = (status: ShiftChangeRequest['status']) => {
        const styles = {
            pending: 'bg-yellow-500/20 text-yellow-700',
            accepted: 'bg-green-500/20 text-green-700',
            rejected: 'bg-red-500/20 text-red-700',
        };
        return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>{status}</span>
    }

    return (
        <div className="animate-fade-in-up space-y-6">
            <h1 className="text-3xl font-bold text-[--color-text-primary]">Gestionar Ausencias y Cambios</h1>
            
            <div className="solid-card p-6">
                <h2 className="text-xl font-bold text-[--color-text-primary] mb-4">Justificar Ausencia</h2>
                {absenceSubmitted ? (
                    <div className="text-center p-8 bg-green-500/10 rounded-lg text-green-700">
                        <CheckCircleIcon className="w-12 h-12 mx-auto mb-2" />
                        <p className="font-semibold">Justificación enviada correctamente.</p>
                    </div>
                ) : (
                    <form onSubmit={handleAbsenceSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-[--color-text-secondary] mb-1">Fecha de Ausencia</label>
                            <input type="date" value={absenceDate} onChange={e => setAbsenceDate(e.target.value)} className="input-styled w-full" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[--color-text-secondary] mb-1">Motivo</label>
                            <textarea value={absenceReason} onChange={e => setAbsenceReason(e.target.value)} rows={3} className="input-styled w-full" placeholder="Ej: Cita médica, asunto personal..." required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[--color-text-secondary] mb-1">Adjuntar Certificado (Opcional)</label>
                            <input type="file" onChange={e => setAbsenceFile(e.target.files ? e.target.files[0] : null)} className="w-full text-sm text-[--color-text-secondary] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[--color-accent] file:text-white hover:file:bg-[--color-accent-hover] transition-colors" />
                        </div>
                        <div className="flex justify-end">
                            <button type="submit" className="btn btn-primary">Enviar Justificación</button>
                        </div>
                    </form>
                )}
            </div>

            <div className="solid-card p-6">
                <h2 className="text-xl font-bold text-[--color-text-primary] mb-4">Solicitar Cambio de Turno</h2>
                {changeSubmitted ? (
                     <div className="text-center p-8 bg-green-500/10 rounded-lg text-green-700">
                        <CheckCircleIcon className="w-12 h-12 mx-auto mb-2" />
                        <p className="font-semibold">Solicitud de cambio enviada.</p>
                    </div>
                ) : (
                    <form onSubmit={handleChangeSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-[--color-text-secondary] mb-1">Mi Turno a Cambiar</label>
                                <input type="date" value={changeMyTurno} onChange={e => setChangeMyTurno(e.target.value)} className="input-styled w-full" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[--color-text-secondary] mb-1">Turno Deseado</label>
                                <input type="date" value={changeRequestTurno} onChange={e => setChangeRequestTurno(e.target.value)} className="input-styled w-full" required />
                            </div>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-[--color-text-secondary] mb-1">Cambiar con</label>
                            <select value={changeColleague} onChange={e => setChangeColleague(e.target.value)} className="input-styled w-full" required>
                                <option value="" disabled>Seleccionar compañero...</option>
                                {colleagues.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-[--color-text-secondary] mb-1">Motivo del Cambio</label>
                            <textarea value={changeReason} onChange={e => setChangeReason(e.target.value)} rows={2} className="input-styled w-full" placeholder="Opcional" />
                        </div>
                         <div className="flex justify-end">
                            <button type="submit" className="btn btn-primary">Solicitar Cambio</button>
                        </div>
                    </form>
                )}
            </div>

             <div className="solid-card p-6">
                <h2 className="text-xl font-bold text-[--color-text-primary] mb-4">Solicitudes de Cambio Recibidas</h2>
                 {incomingRequests.length > 0 ? (
                    <div className="space-y-4">
                        {incomingRequests.map(req => (
                            <div key={req.id} className="bg-[--color-secondary] p-4 rounded-lg border border-[--color-border]">
                                <p className="font-semibold text-[--color-text-primary]">{userMap.get(req.requesterId)} quiere cambiar su turno del {new Date(req.requesterTurno+'T00:00:00').toLocaleDateString('es-AR')} por el tuyo del {new Date(req.colleagueTurno+'T00:00:00').toLocaleDateString('es-AR')}.</p>
                                {req.reason && <p className="text-sm text-[--color-text-secondary] mt-1">Motivo: {req.reason}</p>}
                                <div className="flex gap-2 justify-end mt-3">
                                    <button onClick={() => handleRequestResponse(req, false)} className="btn btn-danger text-sm">Rechazar</button>
                                    <button onClick={() => handleRequestResponse(req, true)} className="btn btn-success text-sm">Aceptar</button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : <p className="text-sm text-center text-[--color-text-secondary]">No tienes solicitudes pendientes.</p>}
            </div>

            <div className="solid-card p-6">
                <h2 className="text-xl font-bold text-[--color-text-primary] mb-4">Mis Solicitudes Enviadas</h2>
                {outgoingRequests.length > 0 ? (
                    <div className="space-y-3">
                        {outgoingRequests.map(req => (
                            <div key={req.id} className="flex justify-between items-center bg-[--color-secondary] p-3 rounded-lg">
                                <p className="text-sm text-[--color-text-primary]">Solicitud a {userMap.get(req.colleagueId)} para cambiar el {new Date(req.requesterTurno+'T00:00:00').toLocaleDateString('es-AR')}</p>
                                {getStatusPill(req.status)}
                            </div>
                        ))}
                    </div>
                ): <p className="text-sm text-center text-[--color-text-secondary]">No has enviado solicitudes.</p>}
            </div>

        </div>
    );
};

const ReportarIncidenciaView: React.FC<{
    onAddIncident: (incident: Omit<Incident, 'id' | 'timestamp' | 'status'>) => void;
    installations: Installation[];
}> = ({ onAddIncident, installations }) => {
    const [image, setImage] = useState<string | null>(null);
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState<IncidentPriority>('Baja');
    const [sector, setSector] = useState(installations[0]?.name || '');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError('El archivo no debe superar los 5MB.');
                return;
            }
            const reader = new FileReader();
            reader.onload = () => {
                setImage(reader.result as string);
                setError('');
            };
            reader.onerror = () => {
                setError('Error al leer el archivo.');
            }
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!description.trim()) {
            setError('La descripción no puede estar vacía.');
            return;
        }
        setError('');
        onAddIncident({ description, priority, sector, image: image || undefined });
        setIsSubmitted(true);
    };

    if (isSubmitted) {
        return (
            <div className="glass-card max-w-md mx-auto p-8 text-center animate-fade-in-up">
                <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-[--color-text-primary]">Incidencia Registrada</h2>
                <p className="text-[--color-text-secondary] mt-2">Tu reporte ha sido enviado correctamente. Gracias por tu colaboración.</p>
                <button
                    onClick={() => {
                        setIsSubmitted(false);
                        setImage(null);
                        setDescription('');
                        setPriority('Baja');
                        setSector(installations[0]?.name || '');
                    }}
                    className="btn btn-primary mt-6"
                >
                    Reportar otra incidencia
                </button>
            </div>
        )
    }

    return (
        <div className="animate-fade-in-up max-w-md mx-auto">
            <h1 className="text-3xl font-bold text-[--color-text-primary] mb-6 text-center sm:text-left">Reportar Incidencia</h1>
            <form onSubmit={handleSubmit} className="glass-card p-6 space-y-6">
                <div>
                    <input type="file" accept="image/*" capture="environment" ref={fileInputRef} onChange={handleImageChange} className="hidden" />
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full aspect-[4/3] bg-[--color-secondary] rounded-lg border-2 border-dashed border-[--color-border] flex flex-col items-center justify-center cursor-pointer hover:border-[--color-accent] transition-colors relative overflow-hidden"
                    >
                        {image ? (
                            <img src={image} alt="Vista previa" className="w-full h-full object-cover" />
                        ) : (
                            <>
                                <CameraIcon className="w-12 h-12 text-[--color-text-secondary] opacity-50" />
                                <p className="text-[--color-text-secondary] mt-2 font-semibold">Subir o tomar foto</p>
                            </>
                        )}
                    </div>
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-[--color-text-secondary] mb-1">Descripción breve del problema</label>
                    <textarea
                        id="description"
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="input-styled w-full"
                        placeholder="Ej: La canilla del baño de hombres pierde agua."
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-[--color-text-secondary] mb-2">Prioridad</label>
                    <div className="grid grid-cols-3 gap-2">
                        {(['Alta', 'Media', 'Baja'] as const).map(p => (
                            <button
                                type="button"
                                key={p}
                                onClick={() => setPriority(p)}
                                className={`py-3 px-4 font-semibold text-sm rounded-lg transition-all duration-200 ${priority === p ? 'bg-[--color-accent] text-white shadow-md' : 'bg-[--color-secondary] hover:bg-[--color-border]'}`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>
                
                <div>
                     <label htmlFor="sector" className="block text-sm font-medium text-[--color-text-secondary] mb-1">Sector del edificio</label>
                     <select id="sector" value={sector} onChange={(e) => setSector(e.target.value)} className="input-styled w-full">
                         {installations.sort((a,b) => a.name.localeCompare(b.name)).map(inst => (
                            <option key={inst.id} value={inst.name}>{inst.name}</option>
                         ))}
                     </select>
                </div>
                
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                <button type="submit" className="btn btn-primary w-full py-3 font-bold text-base">Enviar Reporte</button>
            </form>
        </div>
    );
};

const IncidenciasView: React.FC<{
    incidents: Incident[];
    onUpdateStatus: (id: string, status: IncidentStatus) => void;
}> = ({ incidents, onUpdateStatus }) => {
    const priorityStyles: Record<IncidentPriority, string> = {
        'Alta': 'bg-red-500/10 text-red-600 border-red-500/20',
        'Media': 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
        'Baja': 'bg-gray-500/10 text-gray-600 border-gray-500/20',
    };

    const statusStyles: Record<IncidentStatus, string> = {
        'abierta': 'bg-blue-500/10 text-blue-600',
        'en_progreso': 'bg-purple-500/10 text-purple-600',
        'resuelta': 'bg-green-500/10 text-green-600',
    };
    
    const sortedIncidents = useMemo(() => 
        [...incidents].sort((a, b) => {
            const statusOrder = { 'abierta': 1, 'en_progreso': 2, 'resuelta': 3 };
            return statusOrder[a.status] - statusOrder[b.status] || new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        }), [incidents]);

    return (
        <div className="animate-fade-in-up">
            <h1 className="text-3xl font-bold text-[--color-text-primary] mb-6">Registro de Incidencias</h1>
            <div className="space-y-4">
                {sortedIncidents.map(inc => (
                    <div key={inc.id} className="solid-card p-5">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                            <div>
                                <div className="flex items-center gap-3 mb-2 flex-wrap">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${priorityStyles[inc.priority]}`}>{inc.priority}</span>
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusStyles[inc.status]}`}>{inc.status.replace('_', ' ')}</span>
                                </div>
                                <p className="font-bold text-lg text-[--color-text-primary]">{inc.description}</p>
                                <p className="text-sm text-[--color-text-secondary]">{inc.sector} - Reportado <TimeAgo date={inc.timestamp} /></p>
                            </div>
                            <div className="flex gap-2 self-end sm:self-center shrink-0">
                                <select 
                                    value={inc.status} 
                                    onChange={(e) => onUpdateStatus(inc.id, e.target.value as IncidentStatus)}
                                    className="input-styled text-sm py-1"
                                >
                                    <option value="abierta">Abierta</option>
                                    <option value="en_progreso">En Progreso</option>
                                    <option value="resuelta">Resuelta</option>
                                </select>
                            </div>
                        </div>
                        {inc.image && (
                            <details className="mt-4">
                                <summary className="cursor-pointer text-sm font-semibold text-[--color-accent]">Ver imagen adjunta</summary>
                                <img src={inc.image} alt="Incidencia" className="mt-2 rounded-lg max-h-64 border border-[--color-border]" />
                            </details>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

const HistorialMantenimientoView: React.FC<{ history: MaintenanceHistoryItem[] }> = ({ history }) => {
    const sortedHistory = useMemo(() => {
        return [...history].sort((a, b) => {
            const [dayA, monthA, yearA] = a.date.split('/');
            const [dayB, monthB, yearB] = b.date.split('/');
            const dateA = new Date(`${yearA}-${monthA}-${dayA}`).getTime();
            const dateB = new Date(`${yearB}-${monthB}-${dayB}`).getTime();
            return dateB - dateA;
        });
    }, [history]);

    return (
        <div className="animate-fade-in-up max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-[--color-text-primary] mb-6">Historial de Mantenimiento</h1>
            <div className="solid-card p-6">
                {sortedHistory.length > 0 ? (
                    <ul className="space-y-4">
                        {sortedHistory.map(item => (
                            <li key={item.id} className="bg-[--color-secondary] p-4 rounded-lg border border-[--color-border]">
                                <p className="font-bold text-[--color-text-primary]">{item.task}</p>
                                <p className="text-sm text-[--color-text-secondary]">
                                    <span className="font-semibold">Fecha:</span> {item.date} | <span className="font-semibold">Responsable:</span> {item.responsible}
                                </p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-center text-[--color-text-secondary]">El historial de mantenimiento está vacío.</p>
                )}
            </div>
        </div>
    );
};

interface CreateTaskModalProps {
    onClose: () => void;
    onAddTask: (task: Omit<DailyTask, 'id' | 'status'>) => void;
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ onClose, onAddTask }) => {
    const [title, setTitle] = useState('');
    const [location, setLocation] = useState('');
    const [type, setType] = useState<TaskType>('limpieza');
    const [startTime, setStartTime] = useState('08:00');
    const [details, setDetails] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !location.trim()) return;
        
        onAddTask({ title, location, type, startTime, details });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <form onSubmit={handleSubmit} className="glass-card w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-[--color-text-primary] mb-6">Crear Nueva Tarea</h2>
                <div className="space-y-4">
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Título de la Tarea" className="input-styled w-full" required />
                    <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="Ubicación (ej: Aula 5, Patio)" className="input-styled w-full" required />
                    <div className="grid grid-cols-2 gap-4">
                        <select value={type} onChange={e => setType(e.target.value as TaskType)} className="input-styled w-full">
                            <option value="limpieza">Limpieza</option>
                            <option value="mantenimiento">Mantenimiento</option>
                            <option value="rutina">Rutina</option>
                        </select>
                        <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="input-styled w-full" required />
                    </div>
                    <textarea value={details} onChange={e => setDetails(e.target.value)} rows={3} placeholder="Detalles adicionales (opcional)" className="input-styled w-full" />
                </div>
                 <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-[--color-border]">
                    <button type="button" onClick={onClose} className="btn btn-secondary">Cancelar</button>
                    <button type="submit" className="btn btn-primary">Añadir Tarea</button>
                </div>
            </form>
        </div>
    );
};

const AdministrativeChart: React.FC<{ completed: number; pending: number }> = ({ completed, pending }) => {
    const total = completed + pending;
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    const [displayPercentage, setDisplayPercentage] = useState(0);

    const size = 180;
    const strokeWidth = 16;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (displayPercentage / 100) * circumference;

    useEffect(() => {
        const animation = setTimeout(() => setDisplayPercentage(percentage), 100); // Small delay to trigger transition
        return () => clearTimeout(animation);
    }, [percentage]);

    return (
        <div className="solid-card p-6 flex flex-col items-center animate-fade-in-up mb-6">
            <h3 className="text-lg font-bold text-[--color-text-primary] mb-4">Resumen Administrativo</h3>
            <div className="relative" style={{ width: size, height: size }}>
                <svg className="w-full h-full" viewBox={`0 0 ${size} ${size}`}>
                    <defs>
                        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#6EE7B7" />
                            <stop offset="100%" stopColor="#10B981" />
                        </linearGradient>
                    </defs>
                    <circle
                        className="text-[--color-secondary]"
                        stroke="currentColor"
                        strokeWidth={strokeWidth}
                        fill="transparent"
                        r={radius}
                        cx={size / 2}
                        cy={size / 2}
                    />
                    <circle
                        stroke="url(#progressGradient)"
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        fill="transparent"
                        r={radius}
                        cx={size / 2}
                        cy={size / 2}
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        className="-rotate-90 origin-center"
                        style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold text-[--color-text-primary]">
                        {Math.round(displayPercentage)}%
                    </span>
                </div>
            </div>
            <div className="flex gap-6 mt-4 text-sm">
                <div className="text-center">
                    <p className="font-semibold text-green-500">Completadas</p>
                    <p className="font-bold text-lg text-[--color-text-primary]">{completed}</p>
                </div>
                <div className="text-center">
                    <p className="font-semibold text-gray-400">Pendientes</p>
                    <p className="font-bold text-lg text-[--color-text-primary]">{pending}</p>
                </div>
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

const WelcomeBanner: React.FC<{
  user: User;
  pendingTasksCount: number;
  openIncidentsCount: number;
  nextShift: StaffSchedule | undefined;
  unreadNotifications: number;
  onBellClick: () => void;
  onNavigate: (view: string) => void;
}> = ({ user, pendingTasksCount, openIncidentsCount, nextShift, unreadNotifications, onBellClick, onNavigate }) => {

    const stats = [
        { label: "Tareas Pendientes", value: pendingTasksCount, icon: <ClipboardListIcon className="w-8 h-8 text-[--color-accent]"/>, action: () => onNavigate('tareas') },
        { label: "Incidencias Abiertas", value: openIncidentsCount, icon: <AlertTriangleIcon className="w-8 h-8 text-red-500"/>, action: () => onNavigate('incidencias') },
        { label: "Turno de Hoy", value: nextShift?.time || 'Día Libre', icon: <CalendarIcon className="w-8 h-8 text-blue-500"/>, action: () => onNavigate('horarios') },
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
            <p className="text-lg text-[--color-text-secondary] mb-8">Este es tu resumen de hoy.</p>
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
                            <p className="text-3xl font-bold">{stat.value}</p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export const StaffDashboard: React.FC<DashboardProps> = (props) => {
  const { user, onLogout, allUsers, userProfiles, onUpdateProfile, userNotes, onUpdateNotes, theme, setTheme, borderStyle, setBorderStyle, fontStyle, setFontStyle, notifications, markNotificationsAsRead, addNotification, dailyTasks: tasks, onUpdateTasks: setTasks, maintenanceHistory, onUpdateMaintenanceHistory, installations, onUpdateInstallations, incidents, onUpdateIncidents } = props;
  
  const [activeView, setActiveView] = useState('tareas');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  
  const [shiftChangeRequests, setShiftChangeRequests] = useState<ShiftChangeRequest[]>([]);

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
        if (a.status === b.status) return a.startTime.localeCompare(b.startTime);
        return a.status === 'pendiente' ? -1 : 1;
    });
  }, [tasks]);

  const handleCompleteTask = (taskId: string) => {
    const taskToComplete = tasks.find(task => task.id === taskId && task.status === 'pendiente');

    if (taskToComplete) {
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId ? { ...task, status: 'completada' } : task
        )
      );

      const newHistoryItem: MaintenanceHistoryItem = {
        id: `hist-${Date.now()}`,
        date: new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        task: taskToComplete.title,
        responsible: user.name,
      };
      onUpdateMaintenanceHistory(prev => [newHistoryItem, ...prev]);

      const staffUsers = allUsers.filter(u => u.role === Role.STAFF && u.id !== user.id);
      const completionTime = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
      staffUsers.forEach(staff => {
          addNotification({
              userId: staff.id,
              type: NotificationType.TASK_COMPLETED,
              text: `Tarea completada por ${user.name}`,
              details: `'${taskToComplete.title}' a las ${completionTime} hs.`
          });
      });
    }
  };

  const handleAddTask = (newTaskData: Omit<DailyTask, 'id' | 'status'>) => {
    const newTask: DailyTask = {
        ...newTaskData,
        id: `task-${Date.now()}`,
        status: 'pendiente',
    };
    setTasks(prev => [...prev, newTask]);
    
    const staffUsers = allUsers.filter(u => u.role === Role.STAFF && u.id !== user.id);
    staffUsers.forEach(staff => {
        addNotification({
            userId: staff.id,
            type: NotificationType.NEW_ASSIGNMENT,
            text: `Nueva tarea creada por ${user.name}`,
            details: `'${newTaskData.title}' a las ${newTaskData.startTime}`
        });
    });
  };

  const handleAddIncident = (newIncidentData: Omit<Incident, 'id' | 'timestamp' | 'status'>) => {
    const newIncident: Incident = {
        ...newIncidentData,
        id: `inc-${Date.now()}`,
        timestamp: new Date().toISOString(),
        status: 'abierta',
    };
    onUpdateIncidents(prev => [newIncident, ...prev]);

    // Update installation status
    const newStatus: InstallationStatus = newIncident.priority === 'Alta' ? 'out_of_service' : 'maintenance';
    onUpdateInstallations(prev => prev.map(inst => 
        inst.name === newIncident.sector ? { ...inst, status: newStatus, details: { ...inst.details, incident: newIncident.description } } : inst
    ));

    const staffUsers = allUsers.filter(u => u.role === Role.STAFF && u.id !== user.id);
    staffUsers.forEach(staff => {
        addNotification({
            userId: staff.id,
            type: NotificationType.NEW_INCIDENT,
            text: `Nueva incidencia reportada por ${user.name}`,
            details: `'${newIncidentData.description}' en ${newIncidentData.sector}`
        });
    });
  };

  const handleUpdateIncidentStatus = (id: string, status: IncidentStatus) => {
    const incident = incidents.find(inc => inc.id === id);
    if (!incident) return;

    if (incident.status !== 'resuelta' && status === 'resuelta') {
        const staffUsers = allUsers.filter(u => u.role === Role.STAFF && u.id !== user.id);
        staffUsers.forEach(staff => {
            addNotification({
                userId: staff.id,
                type: NotificationType.INCIDENT_RESOLVED,
                text: `Incidencia resuelta por ${user.name}`,
                details: `'${incident.description}'`
            });
        });
        // Update installation to 'ok'
        onUpdateInstallations(prev => prev.map(inst => 
            inst.name === incident.sector ? { ...inst, status: 'ok', details: { ...inst.details, incident: undefined } } : inst
        ));
    }
    onUpdateIncidents(prev => prev.map(inc => inc.id === id ? { ...inc, status } : inc));
  };

  const handleResolveIncidentsForSector = (sectorName: string) => {
      const openIncidents = incidents.filter(i => i.sector === sectorName && i.status !== 'resuelta');
      if (openIncidents.length > 0) {
        openIncidents.forEach(inc => handleUpdateIncidentStatus(inc.id, 'resuelta'));
      } else {
        // If no incident, just update the status
        onUpdateInstallations(prev => prev.map(inst => 
            inst.name === sectorName ? { ...inst, status: 'ok', details: { ...inst.details, incident: undefined } } : inst
        ));
      }
  };
  
  const handleAddShiftChangeRequest = (requestData: Omit<ShiftChangeRequest, 'id' | 'status'>) => {
    const newRequest: ShiftChangeRequest = {
        ...requestData,
        id: `shift-${Date.now()}`,
        status: 'pending'
    };
    setShiftChangeRequests(prev => [...prev, newRequest]);
    
    addNotification({
        userId: newRequest.colleagueId,
        type: NotificationType.SHIFT_CHANGE_REQUEST,
        text: `${user.name} solicita un cambio de turno`,
        details: `Quiere cambiar su turno del ${new Date(newRequest.requesterTurno+'T00:00:00').toLocaleDateString('es-AR')} por tu turno del ${new Date(newRequest.colleagueTurno+'T00:00:00').toLocaleDateString('es-AR')}. Revisa la sección 'Justificar'.`
    });
  };

  const handleUpdateRequestStatus = (requestId: string, status: 'accepted' | 'rejected') => {
    setShiftChangeRequests(prev => prev.map(req => req.id === requestId ? {...req, status} : req));
  };

  const myNotifications = useMemo(() => notifications.filter(n => n.userId === user.id).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()), [notifications, user.id]);
  const unreadNotifications = useMemo(() => myNotifications.filter(n => !n.read).length, [myNotifications]);
  const pendingTasksCount = useMemo(() => tasks.filter(t => t.status === 'pendiente').length, [tasks]);

  // FIX: Pass className prop to icon components by storing component types instead of instances and rendering them directly.
  const TareasView: React.FC<{}> = () => {
    const taskIcons: Record<TaskType, { icon: React.FC<{ className?: string }>; color: string }> = {
      limpieza: { icon: SparklesIcon, color: 'text-green-400' },
      mantenimiento: { icon: PencilIcon, color: 'text-blue-400' },
      rutina: { icon: ClockIcon, color: 'text-gray-400' },
    };

    const completedTasksCount = tasks.filter(t => t.status === 'completada').length;

    return (
      <div className="animate-fade-in-up">
        <AdministrativeChart completed={completedTasksCount} pending={pendingTasksCount} />
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-[--color-text-primary]">Tareas del Día</h2>
            <button onClick={() => setIsCreateTaskModalOpen(true)} className="btn btn-primary"><PlusCircleIcon className="w-5 h-5"/> Crear Tarea</button>
        </div>
        <div className="space-y-4 max-w-3xl mx-auto">
          {sortedTasks.map(task => {
            const IconComponent = taskIcons[task.type].icon;
            return (
              <div key={task.id} className={`glass-card p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-opacity ${task.status === 'completada' ? 'opacity-60' : ''}`}>
                <div className="flex items-start gap-4">
                  <div className={`mt-1 ${taskIcons[task.type].color}`}>
                    <IconComponent className="w-6 h-6 shrink-0" />
                  </div>
                  <div>
                    <h2 className={`text-xl font-bold ${task.status === 'completada' ? 'line-through text-[--color-text-secondary]' : 'text-[--color-text-primary]'}`}>
                      {task.title}
                    </h2>
                    <p className="text-[--color-text-secondary] text-sm"><span className="font-semibold">Lugar:</span> {task.location} | <span className="font-semibold">Hora:</span> {task.startTime}</p>
                    {task.details && <p className="text-xs text-[--color-text-secondary] mt-1 bg-black/5 p-2 rounded-md">{task.details}</p>}
                  </div>
                </div>
                <button
                  onClick={() => handleCompleteTask(task.id)}
                  disabled={task.status === 'completada'}
                  className={`btn mt-4 sm:mt-0 w-full sm:w-auto shrink-0 ${task.status === 'completada' ? 'btn-success cursor-default' : 'btn-primary'}`}
                >
                  <CheckCircleIcon className="w-5 h-5"/> {task.status === 'completada' ? 'Completado' : 'Completar'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderCurrentView = () => {
    switch(activeView) {
      case 'tareas': return <TareasView />;
      case 'incidencias': return <IncidenciasView incidents={incidents} onUpdateStatus={handleUpdateIncidentStatus} />;
      case 'justificaciones': return <JustificacionesView user={user} allUsers={allUsers} addNotification={addNotification} shiftChangeRequests={shiftChangeRequests} onAddShiftChangeRequest={handleAddShiftChangeRequest} onUpdateRequestStatus={handleUpdateRequestStatus} />;
      case 'reportar_incidencia': return <ReportarIncidenciaView onAddIncident={handleAddIncident} installations={installations} />;
      case 'horarios': return <HorariosView />;
      case 'instalaciones': return <InstalacionesView installations={installations} onUpdateInstallations={onUpdateInstallations} onAddIncident={handleAddIncident} onResolveIncidentsForSector={handleResolveIncidentsForSector} />;
      case 'historial_mantenimiento': return <HistorialMantenimientoView history={maintenanceHistory} />;
      case 'profile': return <ProfileView viewedUser={user} currentUser={user} profileData={userProfiles[user.id] || {}} onUpdateProfile={(data) => onUpdateProfile(user.id, data)} onBack={() => setActiveView('tareas')} />;
      case 'appearance': return <AppearanceView currentTheme={theme} onSetTheme={setTheme} currentBorderStyle={borderStyle} onSetBorderStyle={setBorderStyle} currentFontStyle={fontStyle} onSetFontStyle={setFontStyle} />;
      case 'comunidad': return <div className="glass-card p-8 text-center"><h2 className="text-2xl font-bold">Comunidad</h2><p className="text-[--color-text-secondary]">Esta sección está en construcción.</p></div>;
      default: return <TareasView />;
    }
  };

  const profilePic = userProfiles[user.id]?.profilePicture;
  const openIncidentsCount = useMemo(() => incidents.filter(i => i.status === 'abierta').length, [incidents]);
  const nextShift = useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.toLocaleDateString('es-AR', { weekday: 'long' });
    return staffScheduleData.find(s => s.day.toLowerCase() === dayOfWeek.toLowerCase());
  }, []);
  
  return (
    <>
      <header className="bg-[--color-header-bg] backdrop-blur-lg sticky top-0 z-30 border-b border-black/10 transition-colors duration-500">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <button onClick={() => setActiveView('tareas')} className="flex items-center gap-3 cursor-pointer"><BookOpenIcon className="h-12 w-12 text-[--color-accent]" /><span className="text-xl font-bold">Panel Auxiliar</span></button>
          <div className="relative z-50 flex items-center gap-2">
            <div ref={userMenuRef}>
                <button onClick={() => setIsUserMenuOpen(p => !p)} className="flex items-center gap-2 p-2 rounded-full hover:bg-black/5 transition-colors">
                  {profilePic ? <img src={profilePic} alt="Perfil" className="w-8 h-8 rounded-full object-cover bg-[--color-secondary]"/> : <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[--color-secondary]"><ProfileIcon className="w-5 h-5 text-[--color-accent]"/></div>}
                  <ChevronDownIcon className={`w-5 h-5 text-[--color-text-secondary] transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`}/>
                </button>
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-72 solid-card animate-fade-in-up p-2" style={{animationDuration: '0.2s'}}>
                    <div className="space-y-1">
                      <button onClick={() => { setActiveView('profile'); setIsUserMenuOpen(false); }} className="w-full flex items-center gap-3 text-left px-3 py-2 text-[--color-text-primary] hover:bg-black/5 rounded-lg transition-colors">
                        <ProfileIcon className="w-5 h-5 text-[--color-text-secondary]" />
                        <span className="font-semibold">Mi Perfil</span>
                      </button>
                      <button onClick={() => { setActiveView('reportar_incidencia'); setIsUserMenuOpen(false); }} className="w-full flex items-center gap-3 text-left px-3 py-2 text-[--color-text-primary] hover:bg-black/5 rounded-lg transition-colors">
                        <AlertTriangleIcon className="w-5 h-5 text-[--color-text-secondary]" />
                        <span className="font-semibold">Reportar Incidencia</span>
                      </button>
                      <button onClick={() => { setActiveView('horarios'); setIsUserMenuOpen(false); }} className="w-full flex items-center gap-3 text-left px-3 py-2 text-[--color-text-primary] hover:bg-black/5 rounded-lg transition-colors">
                        <CalendarIcon className="w-5 h-5 text-[--color-text-secondary]" />
                        <span className="font-semibold">Horarios y Turnos</span>
                      </button>
                      <button onClick={() => { setActiveView('instalaciones'); setIsUserMenuOpen(false); }} className="w-full flex items-center gap-3 text-left px-3 py-2 text-[--color-text-primary] hover:bg-black/5 rounded-lg transition-colors">
                        <BuildingIcon className="w-5 h-5 text-[--color-text-secondary]" />
                        <span className="font-semibold">Instalaciones</span>
                      </button>
                      <button onClick={() => { setActiveView('historial_mantenimiento'); setIsUserMenuOpen(false); }} className="w-full flex items-center gap-3 text-left px-3 py-2 text-[--color-text-primary] hover:bg-black/5 rounded-lg transition-colors">
                        <FileTextIcon className="w-5 h-5 text-[--color-text-secondary]" />
                        <span className="font-semibold">Historial de Mantenimiento</span>
                      </button>
                      <button onClick={() => { setActiveView('comunidad'); setIsUserMenuOpen(false); }} className="w-full flex items-center gap-3 text-left px-3 py-2 text-[--color-text-primary] hover:bg-black/5 rounded-lg transition-colors">
                        <UsersIcon className="w-5 h-5 text-[--color-text-secondary]" />
                        <span className="font-semibold">Comunidad</span>
                      </button>
                      <button onClick={() => { setActiveView('appearance'); setIsUserMenuOpen(false); }} className="w-full flex items-center gap-3 text-left px-3 py-2 text-[--color-text-primary] hover:bg-black/5 rounded-lg transition-colors">
                        <AppearanceIcon className="w-5 h-5 text-[--color-text-secondary]" />
                        <span className="font-semibold">Apariencia / Tema</span>
                      </button>
                    </div>
                    <div className="p-2 mt-2 border-t border-[--color-border]">
                      <button onClick={onLogout} className="w-full flex items-center gap-3 text-left px-3 py-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                        <LogoutIcon className="w-5 h-5" />
                        <span className="font-semibold">Cerrar Sesión</span>
                      </button>
                    </div>
                  </div>
                )}
            </div>
          </div>
        </nav>
      </header>
      
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="pb-24 md:pb-0 relative">
          {isNotificationPanelOpen && <NotificationPanel notifications={myNotifications} onClose={() => setIsNotificationPanelOpen(false)} onMarkAllRead={() => markNotificationsAsRead(user.id)} />}
          {activeView === 'tareas' && 
            <WelcomeBanner 
                user={user}
                pendingTasksCount={pendingTasksCount}
                openIncidentsCount={openIncidentsCount}
                nextShift={nextShift}
                unreadNotifications={unreadNotifications}
                onBellClick={() => setIsNotificationPanelOpen(p => !p)}
                onNavigate={setActiveView}
            />
          }
          <div className={activeView === 'tareas' ? 'mt-8' : ''}>
            {renderCurrentView()}
          </div>
        </div>
      </main>
      
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[--color-primary] border-t border-[--color-border] z-40 shadow-[0_-2px_10px_rgba(var(--color-shadow-rgb),0.1)]">
        <nav className="flex justify-around items-center">
          <BottomNavButton label="Tareas" icon={<CheckCircleIcon className="w-6 h-6"/>} active={['inicio', 'tareas'].includes(activeView)} onClick={() => setActiveView('tareas')}/>
          <BottomNavButton label="Incidencias" icon={<AlertTriangleIcon className="w-6 h-6"/>} active={activeView === 'incidencias'} onClick={() => setActiveView('incidencias')}/>
          <BottomNavButton label="Justificar" icon={<ClipboardListIcon className="w-6 h-6"/>} active={activeView === 'justificaciones'} onClick={() => setActiveView('justificaciones')}/>
          <BottomNavButton label="Horarios" icon={<CalendarIcon className="w-6 h-6"/>} active={activeView === 'horarios'} onClick={() => setActiveView('horarios')}/>
          <BottomNavButton label="Instalac." icon={<BuildingIcon className="w-6 h-6"/>} active={activeView === 'instalaciones'} onClick={() => setActiveView('instalaciones')}/>
        </nav>
      </div>
      {isCreateTaskModalOpen && <CreateTaskModal onClose={() => setIsCreateTaskModalOpen(false)} onAddTask={handleAddTask} />}
    </>
  );
};