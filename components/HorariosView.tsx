import React, { useState, useMemo, useEffect, useRef } from 'react';
import { User, Subject, ClassSchedule, UserProfileData, AvailabilitySlot, Notification, NotificationType } from '../types';
import { CalendarIcon, ClipboardListIcon, DownloadIcon, AlertTriangleIcon, ClockIcon, UsersIcon, SparklesIcon, PlusCircleIcon, TrashIcon, CheckIcon, PencilIcon, XCircleIcon } from './Icons';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Helper Functions
const timeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
};

const minutesToTime = (minutes: number) => {
    const h = Math.floor(minutes / 60).toString().padStart(2, '0');
    const m = (minutes % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
}

const getSubjectColor = (subjectId: string, subjects: Subject[]): string => {
    const PALETTE = ['#e97777', '#fcd66c', '#c3e977', '#87d2e9', '#9b59b6', '#1abc9c', '#d35400', '#2980b9'];
    const subject = subjects.find(s => s.id === subjectId);
    if (!subject) return '#7f8c8d';
    let hash = 0;
    for (let i = 0; i < subject.name.length; i++) {
        hash = subject.name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash % PALETTE.length);
    return PALETTE[index];
};

const useMediaQuery = (query: string) => {
    const [matches, setMatches] = useState(false);
    useEffect(() => {
        const media = window.matchMedia(query);
        if (media.matches !== matches) {
            setMatches(media.matches);
        }
        const listener = () => setMatches(media.matches);
        window.addEventListener('resize', listener);
        return () => window.removeEventListener('resize', listener);
    }, [matches, query]);
    return matches;
};

const DesktopScheduleView: React.FC<{
    subjects: Subject[], 
    classSchedule: ClassSchedule[],
    availabilitySlots: AvailabilitySlot[],
    conflictingItemIds: Set<string>,
    userProfile: UserProfileData,
    onUpdateProfile: (data: UserProfileData) => void
}> = ({ subjects, classSchedule, availabilitySlots, conflictingItemIds, userProfile, onUpdateProfile }) => {
    
    const [isEditing, setIsEditing] = useState(false);
    const [localSlots, setLocalSlots] = useState(availabilitySlots);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [ghostSlot, setGhostSlot] = useState<{dayOfWeek: number, startTime: string, endTime: string} | null>(null);
    const [editingSlot, setEditingSlot] = useState<AvailabilitySlot | null>(null);

    const scheduleRef = useRef<HTMLDivElement>(null);
    const interactionRef = useRef<{isDragging: boolean, startY: number, startDay: number}>({isDragging: false, startY: 0, startDay: 0 });

    const allItems = useMemo(() => [
        ...classSchedule.map(cs => ({...cs, type: 'class', id: cs.subjectId + cs.startTime})),
        ...localSlots.map(as => ({...as, type: 'availability', classroom: 'Consultas', subjectId: 'disponibilidad'}))
    ], [classSchedule, localSlots]);
    
    useEffect(() => { setLocalSlots(availabilitySlots) }, [availabilitySlots]);


    const handleSave = () => {
        const teacherSettings = userProfile.teacherSettings || { autoAttendance: false };
        onUpdateProfile({ ...userProfile, teacherSettings: { ...teacherSettings, availabilitySlots: localSlots } });
        setIsEditing(false);
    };

    const handleCancel = () => {
        setLocalSlots(availabilitySlots);
        setIsEditing(false);
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>, day: number) => {
        if(!isEditing || !scheduleRef.current) return;
        const rect = scheduleRef.current.getBoundingClientRect();
        const startY = e.clientY - rect.top;
        interactionRef.current = { isDragging: true, startY, startDay: day };
        
        const handleMouseMove = (ev: MouseEvent) => {
            if(!interactionRef.current.isDragging || !scheduleRef.current) return;
            const currentRect = scheduleRef.current.getBoundingClientRect();
            const currentY = ev.clientY - currentRect.top;
            const { startY: initialY, startDay: initialDay } = interactionRef.current;
            
            const totalMinutesInView = 6 * 60;
            const startMinute = (initialY / currentRect.height) * totalMinutesInView;
            const currentMinute = (currentY / currentRect.height) * totalMinutesInView;

            const snappedStart = Math.round(startMinute / 15) * 15;
            const snappedCurrent = Math.round(currentMinute / 15) * 15;

            const startTime = minutesToTime(18*60 + Math.min(snappedStart, snappedCurrent));
            const endTime = minutesToTime(18*60 + Math.max(snappedStart, snappedCurrent));

            setGhostSlot({ dayOfWeek: initialDay, startTime, endTime });
        };
        
        const handleMouseUp = () => {
            if (ghostSlot && timeToMinutes(ghostSlot.endTime) - timeToMinutes(ghostSlot.startTime) >= 15) {
                 const newSlot: AvailabilitySlot = { id: `slot-${Date.now()}`, ...ghostSlot };
                 setLocalSlots(prev => [...prev, newSlot]);
            }
            setGhostSlot(null);
            interactionRef.current = { isDragging: false, startY: 0, startDay: 0 };
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };
    
    const handleDeleteSlot = (id: string) => {
        setLocalSlots(prev => prev.filter(s => s.id !== id));
        setEditingSlot(null);
    };

    const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
    const timeLabels = ['18:00', '19:00', '20:00', '21:00', '22:00', '23:00'];
    const startHour = 18;
    const totalHours = 6;

    return (
        <div className="solid-card p-4 sm:p-6">
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                <h3 className="font-bold text-lg">Calendario Semanal</h3>
                {!isEditing ? (
                    <button onClick={() => setIsEditing(true)} className="btn btn-secondary text-sm"><PencilIcon className="w-4 h-4"/> Gestionar Disponibilidad</button>
                ) : (
                    <div className="flex gap-2">
                        <button onClick={handleCancel} className="btn btn-secondary text-sm"><XCircleIcon className="w-4 h-4"/> Cancelar</button>
                        <button onClick={handleSave} className="btn btn-primary text-sm"><CheckIcon className="w-4 h-4"/> Guardar Cambios</button>
                    </div>
                )}
            </div>
            {isEditing && <p className="text-sm text-[--color-text-secondary] text-center mb-4 animate-pulse">Arrastra en los espacios vacíos para crear nuevos horarios de consulta.</p>}
            
            <div className="flex relative">
                {/* Timeline */}
                <div className="pr-2">
                    <div className="h-8"></div> {/* Header space */}
                    {timeLabels.map(time => <div key={time} className="h-24 flex items-start text-xs text-[--color-text-secondary]">{time}</div>)}
                </div>

                {/* Grid */}
                <div className="grid grid-cols-5 flex-grow" ref={scheduleRef}>
                    {/* Headers */}
                    {days.map(day => <div key={day} className="text-center font-semibold text-sm h-8">{day}</div>)}
                    
                    {/* Columns */}
                    {days.map((day, dayIndex) => (
                        <div 
                            key={day} 
                            className="relative border-l border-[--color-border]"
                            onMouseDown={(e) => handleMouseDown(e, dayIndex + 1)}
                        >
                            {[...Array(totalHours * 2)].map((_, i) => (
                                <div key={i} className="h-12 border-t border-dashed border-[--color-border]/50"></div>
                            ))}

                            {/* Ghost Slot */}
                            {ghostSlot && ghostSlot.dayOfWeek === dayIndex + 1 && (
                                <div className="absolute w-[calc(100%-4px)] left-0.5 rounded-md bg-blue-500/30"
                                    style={{
                                        top: `${((timeToMinutes(ghostSlot.startTime) - startHour*60) / (totalHours*60))*100}%`,
                                        height: `${((timeToMinutes(ghostSlot.endTime) - timeToMinutes(ghostSlot.startTime))/(totalHours*60))*100}%`
                                    }}
                                />
                            )}

                            {/* Events in column */}
                            {allItems.filter(item => item.dayOfWeek === dayIndex + 1).map((item) => {
                                const startMinutes = timeToMinutes(item.startTime) - startHour * 60;
                                const endMinutes = timeToMinutes(item.endTime) - startHour * 60;
                                const top = (startMinutes / (totalHours * 60)) * 100;
                                const height = ((endMinutes - startMinutes) / (totalHours * 60)) * 100;
                                const isClass = item.type === 'class';
                                const subject = isClass ? subjects.find(s => s.id === item.subjectId) : null;
                                const isConflict = conflictingItemIds.has(item.id);
                                const isBeingEdited = editingSlot?.id === item.id;

                                return (
                                    <div
                                        key={item.id}
                                        className={`absolute w-[calc(100%-4px)] left-0.5 rounded-md text-white text-xs text-left overflow-hidden transition-all duration-300 ${isConflict ? 'ring-2 ring-red-500' : ''} ${isEditing && isClass ? 'opacity-30 cursor-default' : 'cursor-pointer'}`}
                                        style={{ top: `${top}%`, height: `${height}%`, backgroundColor: isClass ? getSubjectColor(item.subjectId, subjects) : 'rgb(96 165 250)', boxShadow: '0 2px 5px rgba(var(--color-shadow-rgb), 0.2)' }}
                                    >
                                        <button className="w-full h-full p-1.5" onClick={() => isEditing && !isClass ? setEditingSlot(item) : !isEditing && setSelectedItem(item)}>
                                            <p className="font-bold leading-tight">{isClass ? subject?.name : 'Disponible'}</p>
                                            <p className="opacity-80 leading-tight">{item.startTime} - {item.endTime}</p>
                                            {isClass && <p className="opacity-80 leading-tight">{item.classroom}</p>}
                                        </button>
                                        {isBeingEdited && (
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center animate-fade-in">
                                                <button onClick={() => handleDeleteSlot(item.id)} className="btn btn-danger !p-2"><TrashIcon className="w-4 h-4"/></button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
            {selectedItem && <ItemDetailModal item={selectedItem} subject={subjects.find(s=>s.id === selectedItem.subjectId)} onClose={() => setSelectedItem(null)} />}
        </div>
    );
};

const MobileScheduleView: React.FC<Parameters<typeof WeeklySchedule>[0]> = (props) => {
    const { subjects, classSchedule, availabilitySlots, conflictingItemIds } = props;
    const [activeDay, setActiveDay] = useState(new Date().getDay()); // 1=Mon, 5=Fri
    const days = ['L', 'M', 'X', 'J', 'V'];
    const allItems = useMemo(() => [
        ...classSchedule.map(cs => ({...cs, type: 'class', id: cs.subjectId + cs.startTime})),
        ...availabilitySlots.map(as => ({...as, type: 'availability', classroom: 'Consultas', subjectId: 'disponibilidad'}))
    ], [classSchedule, availabilitySlots]);
    
    return(
        <div className="solid-card p-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">Calendario Semanal</h3>
                 {/* TODO: Add mobile editing later */}
            </div>
            <div className="flex justify-around items-center bg-[--color-secondary] rounded-lg p-1 mb-4">
                {days.map((day, index) => (
                    <button key={day} onClick={() => setActiveDay(index + 1)} className={`py-2 px-4 font-semibold text-sm rounded-md transition-all ${activeDay === index + 1 ? 'bg-[--color-primary] text-[--color-accent] shadow' : 'text-[--color-text-secondary]'}`}>
                        {day}
                    </button>
                ))}
            </div>

            <div key={activeDay} className="relative animate-fade-in" style={{height: `${6*4}rem`}}>
                {/* Timeline */}
                 <div className="absolute top-0 left-0 h-full">
                    {['18:00', '19:00', '20:00', '21:00', '22:00', '23:00'].map(time => (
                        <div key={time} className="h-16 flex items-start text-xs text-[--color-text-secondary] pr-2">{time}</div>
                    ))}
                </div>
                {/* Grid Lines & Content */}
                <div className="ml-10 h-full relative">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-16 border-t border-dashed border-[--color-border]/50"></div>
                    ))}
                    {allItems
                        .filter(item => item.dayOfWeek === activeDay)
                        .map(item => {
                            const isClass = item.type === 'class';
                            const startMinutes = timeToMinutes(item.startTime) - 18 * 60;
                            const endMinutes = timeToMinutes(item.endTime) - 18 * 60;
                            const top = (startMinutes / (6 * 60)) * 100;
                            const height = ((endMinutes - startMinutes) / (6 * 60)) * 100;
                            const subject = isClass ? subjects.find(s => s.id === item.subjectId) : null;
                            const isConflict = conflictingItemIds.has(item.id);

                            return (
                                <div key={item.id} className={`absolute w-full rounded-md p-1.5 text-white text-xs overflow-hidden ${isConflict ? 'ring-2 ring-red-500' : ''}`} style={{
                                    top: `${top}%`,
                                    height: `${height}%`,
                                    backgroundColor: isClass ? getSubjectColor(item.subjectId, subjects) : 'rgb(96 165 250)',
                                    left: '4px',
                                    width: 'calc(100% - 8px)'
                                }}>
                                    <p className="font-bold leading-tight">{isClass ? subject?.name : 'Disponible'}</p>
                                    <p className="opacity-80 leading-tight">{item.startTime} - {item.endTime}</p>
                                    <p className="opacity-80 leading-tight">{item.classroom}</p>
                                </div>
                            );
                        })}
                </div>
            </div>
        </div>
    )
}

const WeeklySchedule: React.FC<{
    subjects: Subject[], 
    classSchedule: ClassSchedule[],
    availabilitySlots: AvailabilitySlot[],
    conflictingItemIds: Set<string>,
    userProfile: UserProfileData,
    onUpdateProfile: (data: UserProfileData) => void
}> = (props) => {
    const isMobile = useMediaQuery('(max-width: 768px)');
    
    return isMobile ? <MobileScheduleView {...props} /> : <DesktopScheduleView {...props} />;
};

const ItemDetailModal: React.FC<{ item: any; subject?: Subject; onClose: () => void; }> = ({ item, subject, onClose }) => {
    const isClass = item.type === 'class';
    return (
         <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="glass-card w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
                <div className="flex items-start gap-4">
                    <div className="w-1.5 h-16 rounded-full" style={{backgroundColor: isClass ? getSubjectColor(subject?.id || '', [subject!]) : 'rgb(96 165 250)'}}></div>
                    <div>
                        <h3 className="font-bold text-xl text-[--color-text-primary]">{isClass ? subject?.name : 'Disponibilidad para Consultas'}</h3>
                        <p className="text-sm text-[--color-text-secondary]">{isClass ? `Clase - ${subject?.year}° Año` : 'Horario de Consulta'}</p>
                        <p className="font-semibold text-[--color-text-primary] mt-2">{['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'][item.dayOfWeek-1]}, {item.startTime} - {item.endTime}</p>
                        {isClass && <p className="text-sm text-[--color-text-secondary]">Aula: {item.classroom}</p>}
                    </div>
                </div>
                <button onClick={onClose} className="btn btn-primary w-full mt-6">Cerrar</button>
            </div>
         </div>
    );
}


const DetailedListView: React.FC<{classSchedule: ClassSchedule[], subjects: Subject[], availability: AvailabilitySlot[], conflictingItemIds: Set<string>}> = ({ classSchedule, subjects, availability, conflictingItemIds }) => {
    const allItems = [
        ...classSchedule.map(i => ({ ...i, type: 'Clase', id: i.subjectId + i.startTime })),
        ...availability.map(i => ({ ...i, subjectId: 'disponible', classroom: 'Consultas', type: 'Disponibilidad', id: i.id }))
    ].sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.startTime.localeCompare(b.startTime));

    return (
        <div className="animate-fade-in">
             <div className="solid-card p-4 md:p-6">
                <h3 className="font-bold text-lg mb-4">Lista Detallada de Clases y Horarios</h3>
                
                {/* Mobile View: Cards */}
                <div className="md:hidden space-y-4">
                     {allItems.map((item, index) => {
                        const subject = subjects.find(s => s.id === item.subjectId);
                        const duration = (timeToMinutes(item.endTime) - timeToMinutes(item.startTime));
                        const isClass = item.type === 'Clase';
                        const isConflict = conflictingItemIds.has(item.id);
                        return(
                            <div key={index} className={`bg-[--color-secondary] p-4 rounded-lg border ${isConflict ? 'border-red-500' : 'border-[--color-border]'}`}>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-[--color-text-primary]">{isClass ? subject?.name : <strong>Disponibilidad</strong>}</p>
                                        <p className="text-sm text-[--color-text-secondary]">{['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'][item.dayOfWeek-1]}</p>
                                    </div>
                                    {isConflict && <AlertTriangleIcon className="w-5 h-5 text-red-500" />}
                                </div>
                                <div className="mt-2 text-sm grid grid-cols-2 gap-x-4 gap-y-1">
                                    <p className="flex items-center gap-2"><ClockIcon className="w-4 h-4 text-[--color-text-secondary]"/> {item.startTime} - {item.endTime}</p>
                                    <p className="text-[--color-text-secondary]">Duración: {Math.floor(duration/60)}h {duration % 60}m</p>
                                    <p className="text-[--color-text-secondary]">Aula: {item.classroom}</p>
                                    {isClass && <p className="text-[--color-text-secondary]">Curso: {subject?.year}° Año</p>}
                                </div>
                            </div>
                        );
                     })}
                </div>

                {/* Desktop View: Table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b-2 border-[--color-border]">
                            <tr>
                                <th className="p-3 font-semibold text-sm">Materia/Actividad</th>
                                <th className="p-3 font-semibold text-sm">Día</th>
                                <th className="p-3 font-semibold text-sm">Hora</th>
                                <th className="p-3 font-semibold text-sm">Aula</th>
                                <th className="p-3 font-semibold text-sm">Curso</th>
                                <th className="p-3 font-semibold text-sm">Duración</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allItems.map((item, index) => {
                                 const subject = subjects.find(s => s.id === item.subjectId);
                                 const duration = (timeToMinutes(item.endTime) - timeToMinutes(item.startTime));
                                 const isClass = item.type === 'Clase';
                                 const isConflict = conflictingItemIds.has(item.id);
                                 return (
                                    <tr key={index} className={`border-b border-[--color-border] last:border-b-0 ${isConflict ? 'bg-red-500/10' : ''}`}>
                                        <td className="p-3 font-medium text-[--color-text-primary]">{isClass ? subject?.name : <strong>Disponibilidad</strong>}</td>
                                        <td className="p-3">{['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'][item.dayOfWeek-1]}</td>
                                        <td className="p-3">{item.startTime} - {item.endTime}</td>
                                        <td className="p-3">{item.classroom}</td>
                                        <td className="p-3">{isClass ? `${subject?.year}° Año` : 'N/A'}</td>
                                        <td className="p-3">{Math.floor(duration/60)}h {duration % 60}m</td>
                                    </tr>
                                 );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// Main Component
interface HorariosViewProps {
    user: User;
    userProfile: UserProfileData;
    onUpdateProfile: (data: UserProfileData) => void;
    subjects: Subject[];
    classSchedule: ClassSchedule[];
    addNotification: (notificationData: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
}

export const HorariosView: React.FC<HorariosViewProps> = (props) => {
    const { user, userProfile, onUpdateProfile, subjects, classSchedule } = props;
    
    type ViewMode = 'semanal' | 'lista';
    const [viewMode, setViewMode] = useState<ViewMode>('semanal');

    const availabilitySlots = useMemo(() => userProfile.teacherSettings?.availabilitySlots || [], [userProfile]);
    
    const allWeeklyItems = useMemo(() => {
        const items: (ClassSchedule & { type: 'class'; id: string } | AvailabilitySlot & { type: 'availability'; classroom: string, subjectId: string, endTime: string })[] = [
            ...classSchedule.map(cs => ({...cs, type: 'class' as const, id: cs.subjectId + cs.startTime})),
            ...availabilitySlots.map(as => ({...as, type: 'availability' as const, classroom: 'Consultas', subjectId: 'disponibilidad'}))
        ];
        return items.sort((a,b) => a.startTime.localeCompare(b.startTime));
    }, [classSchedule, availabilitySlots]);

    const conflictingItemIds = useMemo(() => {
        const conflicts = new Set<string>();
        for (let day = 1; day <= 5; day++) {
            const dayItems = allWeeklyItems.filter(item => item.dayOfWeek === day);
            for (let i = 0; i < dayItems.length; i++) {
                for (let j = i + 1; j < dayItems.length; j++) {
                    const item1 = dayItems[i];
                    const item2 = dayItems[j];
                    if (timeToMinutes(item1.startTime) < timeToMinutes(item2.endTime) && timeToMinutes(item1.endTime) > timeToMinutes(item2.startTime)) {
                        conflicts.add(item1.id);
                        conflicts.add(item2.id);
                    }
                }
            }
        }
        return conflicts;
    }, [allWeeklyItems]);

    const weeklySummary = useMemo(() => {
        const totalClassMinutes = classSchedule.reduce((total, item) => {
            return total + (timeToMinutes(item.endTime) - timeToMinutes(item.startTime));
        }, 0);
        const totalAvailabilityMinutes = availabilitySlots.reduce((total, item) => {
            return total + (timeToMinutes(item.endTime) - timeToMinutes(item.startTime));
        }, 0);
        const totalWorkMinutes = (totalClassMinutes + totalAvailabilityMinutes);
        const freeMinutes = (40*60) - totalWorkMinutes;
        
        return {
            classHours: (totalClassMinutes / 60).toFixed(1),
            availabilityHours: (totalAvailabilityMinutes / 60).toFixed(1),
            freeHours: (freeMinutes / 60).toFixed(1)
        };
    }, [classSchedule, availabilitySlots]);

    const handleExportPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text(`Horario Semanal - Prof. ${user.name}`, 14, 22);
        
        const tableData = classSchedule.map(item => {
            const subject = subjects.find(s => s.id === item.subjectId);
            const duration = (timeToMinutes(item.endTime) - timeToMinutes(item.startTime)) / 60;
            return [
                subject?.name || 'N/A',
                ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'][item.dayOfWeek - 1],
                `${item.startTime} - ${item.endTime}`,
                item.classroom,
                `${subject?.year}° Año`,
                `${duration.toFixed(1)} hs`
            ];
        });

        (doc as any).autoTable({
            startY: 30,
            head: [['Materia', 'Día', 'Hora', 'Aula', 'Curso', 'Duración']],
            body: tableData,
            theme: 'grid',
        });
        
        doc.save(`horario_${user.name.replace(/ /g, '_')}.pdf`);
    };
    
    return (
        <div className="animate-fade-in-up space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[--color-text-primary]">Mis Horarios</h1>
                    <p className="text-[--color-text-secondary]">Tu centro de organización para clases y consultas.</p>
                </div>
                <div className="flex items-center gap-2 p-1 bg-[--color-secondary] rounded-lg self-stretch sm:self-auto">
                    <button onClick={() => setViewMode('semanal')} className={`py-1.5 px-4 font-semibold text-sm rounded-md transition-all ${viewMode === 'semanal' ? 'bg-[--color-primary] shadow text-[--color-accent]' : 'text-gray-500'}`}>Semanal</button>
                    <button onClick={() => setViewMode('lista')} className={`py-1.5 px-4 font-semibold text-sm rounded-md transition-all ${viewMode === 'lista' ? 'bg-[--color-primary] shadow text-[--color-accent]' : 'text-gray-500'}`}>Lista Detallada</button>
                </div>
            </div>

            {conflictingItemIds.size > 0 && (
                <div className="solid-card p-4 bg-red-500/10 border border-red-500/20 text-red-600">
                    <div className="flex items-center gap-3">
                        <AlertTriangleIcon className="w-6 h-6"/>
                        <h3 className="font-bold">¡Alerta de Superposición!</h3>
                    </div>
                    <p className="text-sm mt-2 pl-9">Hemos detectado {conflictingItemIds.size} entrada(s) con conflictos en tu horario. Revisa las entradas resaltadas.</p>
                </div>
            )}

            {viewMode === 'semanal' ? (
                <div className="animate-fade-in">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                         <div className="lg:col-span-1 space-y-6">
                            <div className="solid-card p-6">
                                <h3 className="font-bold text-lg mb-4">Resumen Semanal</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center"><span className="text-sm">Horas de Clase</span><span className="font-bold text-xl">{weeklySummary.classHours} hs</span></div>
                                    <div className="flex justify-between items-center"><span className="text-sm">Horas de Consulta</span><span className="font-bold text-xl">{weeklySummary.availabilityHours} hs</span></div>
                                    <div className="flex justify-between items-center"><span className="text-sm">Horas Libres (Estimado)</span><span className="font-bold text-xl">{weeklySummary.freeHours} hs</span></div>
                                </div>
                            </div>
                             <div className="solid-card p-6">
                                <h3 className="font-bold text-lg mb-4">Sincronización</h3>
                                <div className="space-y-3">
                                   <button className="btn btn-outline w-full" disabled><UsersIcon className="w-5 h-5"/> Exportar a Google Calendar</button>
                                   <button onClick={handleExportPDF} className="btn btn-primary w-full"><DownloadIcon className="w-5 h-5"/> Descargar PDF</button>
                                </div>
                             </div>
                        </div>
                        <div className="lg:col-span-3">
                           <WeeklySchedule
                                subjects={subjects}
                                classSchedule={classSchedule}
                                availabilitySlots={availabilitySlots}
                                conflictingItemIds={conflictingItemIds}
                                userProfile={userProfile}
                                onUpdateProfile={onUpdateProfile}
                           />
                        </div>
                    </div>
                </div>
            ) : (
                <DetailedListView
                    classSchedule={classSchedule}
                    subjects={subjects}
                    availability={availabilitySlots}
                    conflictingItemIds={conflictingItemIds}
                />
            )}
        </div>
    );
};