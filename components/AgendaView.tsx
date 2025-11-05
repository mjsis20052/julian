import React, { useState, useMemo, useEffect } from 'react';
import { User, NewsItem, Subject, ClassSchedule, CalendarEvent, EventType, NotificationType, UserProfileData, Notification } from '../types';
import { PlusCircleIcon, CalendarIcon, ClockIcon } from './Icons';

// --- Helper Functions ---
const getSubjectColor = (subjectId: string, subjects: Subject[]): string => {
    const PALETTE = ['#3498db', '#2ecc71', '#9b59b6', '#f1c40f', '#e74c3c', '#1abc9c', '#d35400', '#2980b9'];
    const subject = subjects.find(s => s.id === subjectId);
    if (!subject) return '#7f8c8d'; // Default color
    let hash = 0;
    for (let i = 0; i < subject.name.length; i++) {
        hash = subject.name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash % PALETTE.length);
    return PALETTE[index];
};

const EVENT_TYPE_DETAILS: Record<EventType, { label: string, color: string }> = {
  class: { label: 'Clase', color: '#3498db' }, // Will be overridden by subject color
  exam: { label: 'Examen', color: '#e74c3c' },
  assignment: { label: 'Entrega', color: '#9b59b6' },
  event: { label: 'Evento', color: '#2ecc71' },
  custom: { label: 'Personal', color: '#f1c40f' },
};

// --- Sub-components ---

const AddEventModal: React.FC<{
  onClose: () => void;
  onSave: (event: Omit<CalendarEvent, 'id'>) => void;
  subjects: Subject[];
  user: User;
}> = ({ onClose, onSave, subjects, user }) => {
    const [title, setTitle] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [time, setTime] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<EventType>('custom');
    const [subjectId, setSubjectId] = useState('');

    const mySubjects = useMemo(() => {
        if (user.role === 'Profesor' && user.assignedSubjects) {
            return subjects.filter(s => user.assignedSubjects?.includes(s.id));
        }
        const userYears = Array.isArray(user.year) ? user.year : (user.year ? [user.year] : []);
        if (user.careerId && userYears.length > 0) {
            return subjects.filter(s => s.careerId === user.careerId && userYears.includes(s.year as number));
        }
        return [];
    }, [subjects, user]);

    useEffect(() => {
        const isAcademic = type === 'class' || type === 'exam' || type === 'assignment';
        if (isAcademic && mySubjects.length > 0) {
            setSubjectId(mySubjects[0].id);
        } else {
            setSubjectId('');
        }
    }, [type, mySubjects]);


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !date.trim()) return;
        const isAcademic = type === 'class' || type === 'exam' || type === 'assignment';
        onSave({
            title, date,
            startTime: time || undefined,
            type, description,
            isAllDay: !time,
            subjectId: isAcademic ? subjectId : undefined,
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <form onSubmit={handleSubmit} className="glass-card w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-[--color-text-primary] mb-6">Añadir Nuevo Evento</h2>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="event-title" className="block text-sm font-medium text-[--color-text-secondary]">Título</label>
                        <input type="text" id="event-title" value={title} onChange={e => setTitle(e.target.value)} className="input-styled w-full mt-1" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="event-date" className="block text-sm font-medium text-[--color-text-secondary]">Fecha</label>
                            <input type="date" id="event-date" value={date} onChange={e => setDate(e.target.value)} className="input-styled w-full mt-1" required />
                        </div>
                        <div>
                            <label htmlFor="event-time" className="block text-sm font-medium text-[--color-text-secondary]">Hora (Opcional)</label>
                            <input type="time" id="event-time" value={time} onChange={e => setTime(e.target.value)} className="input-styled w-full mt-1" />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="event-type" className="block text-sm font-medium text-[--color-text-secondary]">Tipo de Evento</label>
                        <select id="event-type" value={type} onChange={e => setType(e.target.value as EventType)} className="input-styled w-full mt-1">
                            {Object.entries(EVENT_TYPE_DETAILS).map(([key, details]) => (
                                <option key={key} value={key}>{details.label}</option>
                            ))}
                        </select>
                    </div>
                     {(type === 'class' || type === 'exam' || type === 'assignment') && mySubjects.length > 0 && (
                        <div>
                            <label htmlFor="event-subject" className="block text-sm font-medium text-[--color-text-secondary]">Materia</label>
                            <select id="event-subject" value={subjectId} onChange={e => setSubjectId(e.target.value)} className="input-styled w-full mt-1">
                                {mySubjects.map(subject => (
                                    <option key={subject.id} value={subject.id}>{subject.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    <div>
                        <label htmlFor="event-description" className="block text-sm font-medium text-[--color-text-secondary]">Descripción</label>
                        <textarea id="event-description" value={description} onChange={e => setDescription(e.target.value)} rows={3} className="input-styled w-full mt-1"></textarea>
                    </div>
                </div>
                <div className="flex justify-end gap-3 pt-6 mt-2 border-t border-[--color-border]">
                    <button type="button" onClick={onClose} className="btn btn-secondary">Cancelar</button>
                    <button type="submit" className="btn btn-primary">Guardar Evento</button>
                </div>
            </form>
        </div>
    );
};

const WeeklyAgenda: React.FC<{
    currentDate: Date;
    events: CalendarEvent[];
    subjects: Subject[];
    onPrevWeek: () => void;
    onNextWeek: () => void;
}> = ({ currentDate, events, subjects, onPrevWeek, onNextWeek }) => {
    const { weekStart, weekEnd } = useMemo(() => {
        const start = new Date(currentDate);
        const day = start.getDay();
        const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
        const weekStart = new Date(start.setDate(diff));
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 4); // Mon to Fri
        return { weekStart, weekEnd };
    }, [currentDate]);

    const weekDays = useMemo(() => {
        const days = [];
        for (let i = 0; i < 5; i++) {
            const day = new Date(weekStart);
            day.setDate(day.getDate() + i);
            days.push(day);
        }
        return days;
    }, [weekStart]);
    
    return (
        <div className="animate-fade-in-up">
            <div className="flex justify-between items-center mb-4">
                <button onClick={onPrevWeek} className="btn btn-secondary text-sm">&lt; Anterior</button>
                <p className="font-semibold text-[--color-text-secondary] text-center">
                    Semana del {weekStart.toLocaleDateString('es-AR', {day: 'numeric'})} al {weekEnd.toLocaleDateString('es-AR', {day: 'numeric', month: 'long'})}
                </p>
                <button onClick={onNextWeek} className="btn btn-secondary text-sm">Siguiente &gt;</button>
            </div>
            <div className="space-y-4">
                {weekDays.map(day => {
                    const dayKey = day.toISOString().split('T')[0];
                    const dayEvents = events.filter(e => e.date === dayKey).sort((a,b) => (a.startTime || '23:59').localeCompare(b.startTime || '23:59'));
                    const isToday = new Date().toDateString() === day.toDateString();
                    return(
                        <div key={dayKey} className={`solid-card p-4 rounded-lg ${isToday ? 'border-2 border-[--color-accent]' : ''}`}>
                            <h3 className={`font-bold text-lg ${isToday ? 'text-[--color-accent]' : 'text-[--color-text-primary]'}`}>{day.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric'})}</h3>
                            {dayEvents.length > 0 ? (
                                <div className="mt-2 space-y-2">
                                {dayEvents.map(event => (
                                    <div key={event.id} className="flex items-start gap-3 p-3 bg-[--color-secondary] rounded-md">
                                        <div className="w-1.5 h-full rounded-full" style={{backgroundColor: event.subjectId ? getSubjectColor(event.subjectId, subjects) : EVENT_TYPE_DETAILS[event.type].color}}></div>
                                        <div className="w-16 shrink-0 text-sm font-semibold text-[--color-text-secondary]">
                                            {event.isAllDay ? 'Todo el día' : event.startTime}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-[--color-text-primary]">{event.title}</p>
                                            <p className="text-xs text-[--color-text-secondary]">{EVENT_TYPE_DETAILS[event.type].label}</p>
                                        </div>
                                    </div>
                                ))}
                                </div>
                            ) : (
                                <p className="text-sm text-[--color-text-secondary] mt-2 pl-3">No hay eventos para este día.</p>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export const AgendaView: React.FC<{ user: User; userProfile: UserProfileData, newsItems: NewsItem[]; subjects: Subject[]; classSchedule: ClassSchedule[]; customEvents: CalendarEvent[]; onAddEvent: (event: Omit<CalendarEvent, 'id'>) => void; addNotification: (notificationData: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void; }> = ({ user, userProfile, newsItems, subjects, classSchedule, customEvents, onAddEvent, addNotification }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
    
    const allEvents = useMemo(() => {
        const events: CalendarEvent[] = [];
        const userSubjects = subjects.filter(s => (Array.isArray(user.year) ? user.year.includes(s.year) : s.year === user.year) && s.careerId === user.careerId);
        const userSubjectIds = new Set(userSubjects.map(s => s.id));

        classSchedule.forEach(item => {
            if(!userSubjectIds.has(item.subjectId)) return;
            const subject = subjects.find(s => s.id === item.subjectId);
            if (!subject) return;

            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();
            const daysInMonth = new Date(year, month + 1, 0).getDate();

            for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(year, month, day);
                if (date.getDay() === (item.dayOfWeek === 7 ? 0 : item.dayOfWeek)) {
                     events.push({
                        id: `class-${item.subjectId}-${date.toISOString()}`,
                        date: date.toISOString().split('T')[0],
                        startTime: item.startTime,
                        endTime: item.endTime,
                        title: subject.name,
                        type: 'class',
                        subjectId: item.subjectId,
                        description: `Aula: ${item.classroom}`,
                        isAllDay: false,
                    });
                }
            }
        });

        newsItems.forEach(item => {
            const match = item.text.match(/(Examen|Entrega final|Entrega) de (.*?): (.*? (\d+) de (\w+))/i);
            if(match && item.subjectId && userSubjectIds.has(item.subjectId)) {
                // Simplified date parsing
                const months: {[key: string]: number} = { 'enero':0, 'febrero':1, 'marzo':2, 'abril':3, 'mayo':4, 'junio':5, 'julio':6, 'agosto':7, 'septiembre':8, 'octubre':9, 'noviembre':10, 'diciembre':11 };
                const day = parseInt(match[4]);
                const month = months[match[5].toLowerCase()];
                if(!isNaN(day) && month !== undefined) {
                    const year = new Date().getFullYear();
                    const eventDate = new Date(year, month, day);
                    const type: EventType = match[1].toLowerCase().includes('examen') ? 'exam' : 'assignment';
                    events.push({
                        id: `news-${item.id}`,
                        date: eventDate.toISOString().split('T')[0],
                        title: `${type === 'exam' ? 'Examen' : 'Entrega'}: ${match[2]}`,
                        type: type,
                        isAllDay: true,
                        subjectId: item.subjectId,
                    });
                }
            }
        });
        
        events.push(...customEvents);

        return events.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime() || (a.startTime || '').localeCompare(b.startTime || ''));
    }, [classSchedule, newsItems, customEvents, subjects, user.careerId, user.year, currentDate]);
    
    const { nextEvent, timeUntil } = useMemo(() => {
        const now = new Date();
        const upcoming = allEvents.filter(e => {
            const eventDate = new Date(`${e.date}T${e.startTime || '00:00:00'}`);
            return eventDate >= now;
        });
        if (upcoming.length === 0) return { nextEvent: null, timeUntil: null };

        const next = upcoming[0];
        const eventTime = new Date(`${next.date}T${next.startTime || '00:00:00'}`).getTime();
        const diff = eventTime - now.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
        let timeString = '';
        if (days > 1) timeString = `en ${days} días`;
        else if (days === 1) timeString = 'mañana';
        else if (hours > 1) timeString = `en ${hours} horas`;
        else timeString = 'en menos de una hora';

        return { nextEvent: next, timeUntil: timeString };
    }, [allEvents]);

     // Notification logic
    useEffect(() => {
        if (!userProfile?.notificationSettings?.upcomingEvents) return;
        
        const now = new Date();
        const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        const upcomingEventsIn24h = allEvents.filter(e => {
            const eventDate = new Date(`${e.date}T${e.startTime || '00:00:00'}`);
            return eventDate >= now && eventDate <= oneDayFromNow;
        });

        if (upcomingEventsIn24h.length > 0) {
            const nextEventIn24h = upcomingEventsIn24h[0];
            const notificationId = `event-${nextEventIn24h.id}`;
            const sentNotifications = JSON.parse(localStorage.getItem('sent-event-notifications') || '{}');
            
            // Notify once per day for an event
            const todayKey = new Date().toISOString().split('T')[0];
            if (sentNotifications[notificationId] !== todayKey) {
                addNotification({
                    userId: user.id,
                    type: NotificationType.UPCOMING_EVENT,
                    text: `Próximo evento: ${nextEventIn24h.title}`,
                    details: `Comienza ${new Date(nextEventIn24h.date + 'T' + (nextEventIn24h.startTime || '00:00')).toLocaleString('es-AR', { weekday: 'long', hour: '2-digit', minute: '2-digit' })}`
                });
                sentNotifications[notificationId] = todayKey;
                localStorage.setItem('sent-event-notifications', JSON.stringify(sentNotifications));
            }
        }
    }, [allEvents, userProfile, addNotification, user.id]);

    const { daysInMonth, firstDayOfMonth, month, year } = useMemo(() => {
        const d = new Date(currentDate);
        const y = d.getFullYear();
        const m = d.getMonth();
        return {
            daysInMonth: new Date(y, m + 1, 0).getDate(),
            firstDayOfMonth: (new Date(y, m, 1).getDay() + 6) % 7,
            month: m,
            year: y,
        }
    }, [currentDate]);

    const eventsByDate = useMemo(() => {
        const map = new Map<string, CalendarEvent[]>();
        allEvents.forEach(event => {
            const dateKey = event.date;
            if (!map.has(dateKey)) map.set(dateKey, []);
            map.get(dateKey)!.push(event);
        });
        return map;
    }, [allEvents]);

    return (
        <div className="animate-fade-in-up">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[--color-text-primary]">Agenda Académica</h1>
                    <p className="text-[--color-text-secondary]">Tu centro de organización para clases, exámenes y eventos.</p>
                </div>
                <div className="flex gap-2 self-stretch sm:self-auto">
                    <button onClick={() => setIsAddModalOpen(true)} className="btn btn-primary flex-1"><PlusCircleIcon className="w-5 h-5"/> Añadir</button>
                </div>
            </div>

            <div className="solid-card p-4 sm:p-6 relative overflow-hidden">
                <div className="flex items-center gap-2 p-1 bg-[--color-secondary] rounded-lg mb-4 self-start mx-auto">
                    <button onClick={() => setViewMode('month')} className={`py-1.5 px-4 font-semibold text-sm rounded-md transition-all duration-300 ${viewMode === 'month' ? 'bg-[--color-primary] shadow text-[--color-accent]' : 'text-[--color-text-secondary] hover:text-[--color-text-primary]'}`}>Mensual</button>
                    <button onClick={() => setViewMode('week')} className={`py-1.5 px-4 font-semibold text-sm rounded-md transition-all duration-300 ${viewMode === 'week' ? 'bg-[--color-primary] shadow text-[--color-accent]' : 'text-[--color-text-secondary] hover:text-[--color-text-primary]'}`}>Semanal</button>
                </div>

                {viewMode === 'month' ? (
                     <div className="animate-fade-in-up">
                        <div className="flex items-center gap-4 mb-4 justify-center">
                            <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))}>&lt;</button>
                            <h2 className="text-xl font-bold text-center w-48">{currentDate.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase())}</h2>
                            <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))}>&gt;</button>
                        </div>

                        <div className="grid grid-cols-7 gap-1 text-center">
                            {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(d => <div key={d} className="font-bold text-[--color-text-secondary] py-2 text-xs sm:text-base">{d}</div>)}
                            {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} className="border border-[--color-border] rounded-md h-16 sm:h-24"></div>)}
                            {Array.from({ length: daysInMonth }).map((_, day) => {
                                const date = new Date(year, month, day + 1);
                                const dateKey = date.toISOString().split('T')[0];
                                const todaysEvents = eventsByDate.get(dateKey) || [];
                                const isToday = new Date().toDateString() === date.toDateString();
                                return (
                                    <div key={day} className={`border border-[--color-border] rounded-md h-16 sm:h-24 p-1.5 flex flex-col transition-colors ${isToday ? 'bg-[--color-accent]/10' : ''}`}>
                                        <span className={`font-semibold text-xs sm:text-base ${isToday ? 'text-[--color-accent]' : ''}`}>{day + 1}</span>
                                        <div className="flex-grow overflow-y-auto">
                                            <div className="flex flex-wrap gap-1 mt-1">
                                            {todaysEvents.map(event => (
                                                <div key={event.id} className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full" style={{ backgroundColor: event.subjectId ? getSubjectColor(event.subjectId, subjects) : EVENT_TYPE_DETAILS[event.type].color }}></div>
                                            ))}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-4 justify-center">
                            {Object.entries(EVENT_TYPE_DETAILS).map(([key, details]) => (
                                <div key={key} className="flex items-center gap-2 text-xs">
                                    <span className="w-3 h-3 rounded-full" style={{backgroundColor: details.color}}></span>{details.label}
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <WeeklyAgenda 
                        currentDate={currentDate}
                        events={allEvents}
                        subjects={subjects}
                        onPrevWeek={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 7)))}
                        onNextWeek={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 7)))}
                    />
                )}
            </div>

            {nextEvent && (
                <div className="solid-card p-4 mt-6 animate-fade-in-up">
                    <div className="flex items-center gap-3">
                        <ClockIcon className="w-6 h-6 text-[--color-accent]" />
                        <div>
                            <p className="text-sm font-semibold text-[--color-text-secondary]">Próximo evento:</p>
                            <p className="font-bold text-[--color-text-primary]">{nextEvent.title} <span className="font-normal text-[--color-text-secondary]">({timeUntil})</span></p>
                        </div>
                    </div>
                </div>
            )}
            {isAddModalOpen && <AddEventModal onClose={() => setIsAddModalOpen(false)} onSave={onAddEvent} subjects={subjects} user={user} />}
        </div>
    );
};
