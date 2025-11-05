import React, { useState, useMemo } from 'react';
import { User, Subject, Planificacion, PlanificacionStatus, PlanificacionResource } from '../types';
import { PlusCircleIcon, CalendarIcon, ChartBarIcon, ClipboardListIcon, FileTextIcon, PencilIcon, TrashIcon, LinkIcon, DownloadIcon } from './Icons';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const getSubjectColor = (subjectId: string, subjects: Subject[]): string => {
    const PALETTE = ['#3498db', '#2ecc71', '#9b59b6', '#f1c40f', '#e74c3c', '#1abc9c', '#d35400', '#2980b9'];
    const subject = subjects.find(s => s.id === subjectId);
    if (!subject) return '#7f8c8d';
    let hash = 0;
    for (let i = 0; i < subject.name.length; i++) {
        hash = subject.name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash % PALETTE.length);
    return PALETTE[index];
};

const STATUS_STYLES: Record<PlanificacionStatus, { color: string, text: string }> = {
    [PlanificacionStatus.PENDIENTE]: { color: 'bg-yellow-500/20 text-yellow-700', text: 'Pendiente' },
    [PlanificacionStatus.EN_CURSO]: { color: 'bg-blue-500/20 text-blue-700', text: 'En Curso' },
    [PlanificacionStatus.COMPLETADO]: { color: 'bg-green-500/20 text-green-700', text: 'Completado' },
};


interface PlanificacionesViewProps {
    user: User;
    subjects: Subject[];
    planificaciones: Planificacion[];
    onUpdatePlanificaciones: (planificaciones: Planificacion[]) => void;
}

const TabButton: React.FC<{icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void}> = ({icon, label, isActive, onClick}) => (
    <button onClick={onClick} className={`py-2 px-4 font-semibold text-sm rounded-md transition-all duration-300 flex items-center gap-2 ${isActive ? 'bg-[--color-primary] shadow text-[--color-accent]' : 'text-[--color-text-secondary] hover:text-[--color-text-primary]'}`}>
        {icon} {label}
    </button>
);

const PlanList: React.FC<{ planificaciones: Planificacion[], subjectMap: Map<string, Subject>, onSelectPlan: (plan: Planificacion) => void }> = ({ planificaciones, subjectMap, onSelectPlan }) => {
    if (planificaciones.length === 0) {
        return (
            <div className="text-center solid-card p-12">
                <FileTextIcon className="w-16 h-16 mx-auto text-[--color-text-secondary] opacity-50 mb-4" />
                <h3 className="text-xl font-bold text-[--color-text-primary]">Aún no hay planificaciones</h3>
                <p className="text-[--color-text-secondary] mt-2">Crea tu primera planificación para empezar a organizar tu cursada.</p>
            </div>
        );
    }
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {planificaciones.map(plan => {
                const subject = subjectMap.get(plan.subjectId);
                const statusStyle = STATUS_STYLES[plan.status];
                return (
                    <div key={plan.id} className="solid-card flex flex-col overflow-hidden transform hover:-translate-y-1 transition-transform">
                        <div className="p-5 flex-grow">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-sm font-semibold" style={{ color: subject ? getSubjectColor(subject.id, Array.from(subjectMap.values())) : 'gray' }}>
                                    {subject?.name || 'Materia Desconocida'}
                                </span>
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusStyle.color}`}>{statusStyle.text}</span>
                            </div>
                            <h3 className="font-bold text-lg text-[--color-text-primary] mb-1">{plan.title}</h3>
                            <p className="text-sm text-[--color-text-secondary]">
                                {new Date(plan.startDate + 'T00:00:00').toLocaleDateString('es-AR')} - {new Date(plan.endDate + 'T00:00:00').toLocaleDateString('es-AR')}
                            </p>
                        </div>
                        <div className="p-3 bg-black/5 flex justify-end gap-2">
                            <button onClick={() => onSelectPlan(plan)} className="btn btn-primary text-sm">Ver Detalle</button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

const PlanCalendar: React.FC<{ planificaciones: Planificacion[], subjects: Subject[], onSelectPlan: (plan: Planificacion) => void }> = ({ planificaciones, subjects, onSelectPlan }) => {
    // Basic calendar logic - for a real app, use a library
    const [currentDate, setCurrentDate] = useState(new Date());

    const { daysInMonth, firstDayOfMonth, month, year } = useMemo(() => {
        const d = new Date(currentDate);
        const y = d.getFullYear();
        const m = d.getMonth();
        return {
            daysInMonth: new Date(y, m + 1, 0).getDate(),
            firstDayOfMonth: (new Date(y, m, 1).getDay() + 6) % 7, // Monday is 0
            month: m,
            year: y,
        }
    }, [currentDate]);

    const eventsByDate = useMemo(() => {
        const map = new Map<string, Planificacion[]>();
        planificaciones.forEach(plan => {
            const start = new Date(plan.startDate + 'T00:00:00');
            const end = new Date(plan.endDate + 'T00:00:00');
            for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
                const dateKey = d.toISOString().split('T')[0];
                if (!map.has(dateKey)) map.set(dateKey, []);
                map.get(dateKey)!.push(plan);
            }
        });
        return map;
    }, [planificaciones]);

    return (
        <div className="solid-card p-6">
            <div className="flex items-center gap-4 mb-4">
                <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))}>&lt;</button>
                <h2 className="text-xl font-bold text-center w-48">{currentDate.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase())}</h2>
                <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))}>&gt;</button>
            </div>
             <div className="grid grid-cols-7 gap-1 text-center">
                {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(d => <div key={d} className="font-bold text-[--color-text-secondary] py-2">{d}</div>)}
                {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} className="border border-[--color-border] rounded-md h-24"></div>)}
                {Array.from({ length: daysInMonth }).map((_, day) => {
                    const date = new Date(year, month, day + 1);
                    const dateKey = date.toISOString().split('T')[0];
                    const todaysEvents = eventsByDate.get(dateKey) || [];
                    const isToday = new Date().toDateString() === date.toDateString();
                    return (
                        <div key={day} className={`border border-[--color-border] rounded-md h-24 p-1.5 flex flex-col transition-colors ${isToday ? 'bg-[--color-accent]/10' : ''}`}>
                            <span className={`font-semibold ${isToday ? 'text-[--color-accent]' : ''}`}>{day + 1}</span>
                            <div className="flex-grow overflow-y-auto">
                                <div className="space-y-1 mt-1">
                                    {todaysEvents.slice(0, 3).map(event => (
                                        <div key={event.id} onClick={() => onSelectPlan(event)} className="w-full h-2 rounded-full cursor-pointer" style={{ backgroundColor: getSubjectColor(event.subjectId, subjects) }}></div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
};

const PlanStats: React.FC<{ planificaciones: Planificacion[] }> = ({ planificaciones }) => {
    const total = planificaciones.length;
    const completados = planificaciones.filter(p => p.status === PlanificacionStatus.COMPLETADO).length;
    const completionRate = total > 0 ? (completados / total) * 100 : 0;
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="solid-card p-6 text-center">
                <h3 className="text-lg font-bold text-[--color-text-primary]">Cumplimiento Anual</h3>
                <p className="text-4xl font-bold text-[--color-accent] my-4">{completionRate.toFixed(0)}%</p>
                <p className="text-sm text-[--color-text-secondary]">{completados} de {total} planes completados</p>
            </div>
            <div className="solid-card p-6 text-center">
                <h3 className="text-lg font-bold text-[--color-text-primary]">Horas Dictadas vs Planificadas</h3>
                <p className="text-4xl font-bold text-[--color-accent] my-4">32 / 40 hs</p>
                <p className="text-sm text-[--color-text-secondary]">Datos de ejemplo</p>
            </div>
            <div className="solid-card p-6 text-center">
                <h3 className="text-lg font-bold text-[--color-text-primary]">Avance Promedio por Curso</h3>
                <p className="text-4xl font-bold text-[--color-accent] my-4">85%</p>
                <p className="text-sm text-[--color-text-secondary]">Datos de ejemplo</p>
            </div>
        </div>
    );
};

const PlanEditor: React.FC<{ plan: Planificacion | Partial<Planificacion>, subjects: Subject[], onClose: () => void, onSave: (plan: Planificacion) => void, onDelete: (id: string) => void }> = ({ plan: initialPlan, subjects, onClose, onSave, onDelete }) => {
    const [plan, setPlan] = useState<Planificacion | Partial<Planificacion>>(initialPlan);
    const isNew = !plan.id;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setPlan({ ...plan, [e.target.name]: e.target.value });
    };

    const handleResourceChange = (id: string, field: 'label' | 'url', value: string) => {
        const updatedResources = (plan.resources || []).map(res =>
            res.id === id ? { ...res, [field]: value } : res
        );
        setPlan({ ...plan, resources: updatedResources });
    };
    const addResource = () => {
        const newResource: PlanificacionResource = { id: `res-${Date.now()}`, label: '', url: '' };
        setPlan({ ...plan, resources: [...(plan.resources || []), newResource] });
    };
    const removeResource = (id: string) => {
        setPlan({ ...plan, resources: (plan.resources || []).filter(res => res.id !== id) });
    };

    const handleSubmit = () => {
        if (!plan.title || !plan.subjectId || !plan.startDate || !plan.endDate) {
            alert('Por favor, completa los campos obligatorios.');
            return;
        }
        const finalPlan: Planificacion = {
            id: plan.id || `plan-${Date.now()}`,
            title: plan.title,
            subjectId: plan.subjectId,
            status: plan.status || PlanificacionStatus.PENDIENTE,
            startDate: plan.startDate,
            endDate: plan.endDate,
            objectives: plan.objectives || '',
            content: plan.content || '',
            activities: plan.activities || '',
            evaluations: plan.evaluations || '',
            resources: (plan.resources || []).filter(r => r.label && r.url),
        };
        onSave(finalPlan);
    };

    const handleExportPDF = () => {
        const doc = new jsPDF();
        const subjectName = subjects.find(s => s.id === plan.subjectId)?.name || 'N/A';
        
        doc.setFontSize(18);
        doc.text(`Planificación: ${plan.title || 'Sin Título'}`, 14, 22);
        doc.setFontSize(12);
        doc.text(`Materia: ${subjectName}`, 14, 30);
        doc.text(`Período: ${plan.startDate} al ${plan.endDate}`, 14, 38);
        doc.text(`Estado: ${plan.status}`, 14, 46);
        
        const addSection = (title: string, content: string, y: number) => {
            doc.setFontSize(14);
            doc.text(title, 14, y);
            doc.setFontSize(10);
            const splitContent = doc.splitTextToSize(content, 180);
            doc.text(splitContent, 14, y + 8);
            return y + 8 + splitContent.length * 5;
        }

        let yPos = 60;
        yPos = addSection('Objetivos', plan.objectives || 'No especificados', yPos);
        yPos = addSection('Contenidos', plan.content || 'No especificados', yPos);
        yPos = addSection('Actividades', plan.activities || 'No especificadas', yPos);
        yPos = addSection('Evaluaciones', plan.evaluations || 'No especificadas', yPos);
        
        if (plan.resources && plan.resources.length > 0) {
            doc.addPage();
            doc.setFontSize(14);
            doc.text('Recursos', 14, 22);
            // FIX: Property 'autoTable' does not exist on type 'jsPDF'. Cast to any to resolve.
            (doc as any).autoTable({
                startY: 30,
                head: [['Nombre', 'URL']],
                body: plan.resources.map(r => [r.label, r.url]),
            });
        }
        
        doc.save(`planificacion_${plan.title?.replace(/ /g, '_')}.pdf`);
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="glass-card w-full max-w-4xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b border-[--color-border] flex justify-between items-center shrink-0">
                    <h2 className="text-xl font-bold text-[--color-text-primary]">{isNew ? 'Nueva Planificación' : 'Editar Planificación'}</h2>
                    <div className="flex items-center gap-2">
                        {!isNew && <button onClick={() => onDelete(plan.id!)} className="btn btn-danger !p-2"><TrashIcon className="w-5 h-5"/></button>}
                        <button onClick={handleExportPDF} className="btn btn-secondary !p-2"><DownloadIcon className="w-5 h-5"/></button>
                        <button onClick={onClose} className="text-3xl">&times;</button>
                    </div>
                </header>
                <main className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-[--color-text-secondary]">Título</label>
                            <input name="title" value={plan.title || ''} onChange={handleChange} className="input-styled w-full" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="block text-sm font-medium text-[--color-text-secondary]">Materia</label>
                                <select name="subjectId" value={plan.subjectId || ''} onChange={handleChange} className="input-styled w-full">
                                    <option value="" disabled>Seleccionar</option>
                                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[--color-text-secondary]">Estado</label>
                                <select name="status" value={plan.status || ''} onChange={handleChange} className="input-styled w-full">
                                    {Object.values(PlanificacionStatus).map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-[--color-text-secondary]">Fecha de Inicio</label>
                                <input type="date" name="startDate" value={plan.startDate || ''} onChange={handleChange} className="input-styled w-full" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[--color-text-secondary]">Fecha de Fin</label>
                                <input type="date" name="endDate" value={plan.endDate || ''} onChange={handleChange} className="input-styled w-full" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[--color-text-secondary]">Recursos</label>
                            <div className="space-y-2 mt-1">
                                {(plan.resources || []).map(res => (
                                    <div key={res.id} className="flex items-center gap-2">
                                        <input value={res.label} onChange={e => handleResourceChange(res.id, 'label', e.target.value)} placeholder="Nombre" className="input-styled w-1/3 text-sm"/>
                                        <input value={res.url} onChange={e => handleResourceChange(res.id, 'url', e.target.value)} placeholder="URL" className="input-styled flex-1 text-sm"/>
                                        <button onClick={() => removeResource(res.id)} className="p-1 text-red-500"><TrashIcon className="w-4 h-4"/></button>
                                    </div>
                                ))}
                                <button onClick={addResource} className="btn btn-secondary text-sm w-full"><LinkIcon className="w-4 h-4"/> Añadir Recurso</button>
                            </div>
                        </div>
                    </div>
                     <div className="space-y-4 flex flex-col">
                        <div>
                            <label className="block text-sm font-medium text-[--color-text-secondary]">Objetivos</label>
                            <textarea name="objectives" value={plan.objectives || ''} onChange={handleChange} rows={3} className="input-styled w-full" />
                        </div>
                        <div className="flex-grow flex flex-col">
                            <label className="block text-sm font-medium text-[--color-text-secondary]">Contenidos</label>
                            <textarea name="content" value={plan.content || ''} onChange={handleChange} className="input-styled w-full flex-grow" />
                        </div>
                         <div className="flex-grow flex flex-col">
                            <label className="block text-sm font-medium text-[--color-text-secondary]">Actividades</label>
                            <textarea name="activities" value={plan.activities || ''} onChange={handleChange} className="input-styled w-full flex-grow" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[--color-text-secondary]">Evaluaciones</label>
                            <textarea name="evaluations" value={plan.evaluations || ''} onChange={handleChange} rows={3} className="input-styled w-full" />
                        </div>
                    </div>
                </main>
                <footer className="p-4 border-t border-[--color-border] flex justify-end shrink-0">
                    <button onClick={handleSubmit} className="btn btn-primary">Guardar Planificación</button>
                </footer>
            </div>
        </div>
    );
};

export const PlanificacionesView: React.FC<PlanificacionesViewProps> = ({ user, subjects, planificaciones, onUpdatePlanificaciones }) => {
    type ViewMode = 'list' | 'calendar' | 'stats';
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [currentPlan, setCurrentPlan] = useState<Planificacion | Partial<Planificacion> | null>(null);

    const subjectMap = useMemo(() => new Map(subjects.map(s => [s.id, s])), [subjects]);

    const handleSavePlan = (planToSave: Planificacion) => {
        let updatedPlanificaciones;
        const existing = planificaciones.find(p => p.id === planToSave.id);
        if (existing) {
            updatedPlanificaciones = planificaciones.map(p => p.id === planToSave.id ? planToSave : p);
        } else {
            updatedPlanificaciones = [planToSave, ...planificaciones];
        }
        onUpdatePlanificaciones(updatedPlanificaciones);
        setCurrentPlan(null);
    };

    const handleDeletePlan = (id: string) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar esta planificación?')) {
            onUpdatePlanificaciones(planificaciones.filter(p => p.id !== id));
            setCurrentPlan(null);
        }
    };

    return (
        <div className="animate-fade-in-up">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[--color-text-primary]">Planificaciones</h1>
                    <p className="text-[--color-text-secondary]">Organiza y haz un seguimiento de tu hoja de ruta académica.</p>
                </div>
                <button onClick={() => setCurrentPlan({})} className="btn btn-primary self-stretch sm:self-auto">
                    <PlusCircleIcon className="w-5 h-5" />
                    <span>Crear Planificación</span>
                </button>
            </div>

            <div className="flex items-center gap-2 p-1 bg-[--color-secondary] rounded-lg mb-6 self-start">
                <TabButton icon={<ClipboardListIcon className="w-5 h-5" />} label="Lista" isActive={viewMode === 'list'} onClick={() => setViewMode('list')} />
                <TabButton icon={<CalendarIcon className="w-5 h-5" />} label="Calendario" isActive={viewMode === 'calendar'} onClick={() => setViewMode('calendar')} />
                <TabButton icon={<ChartBarIcon className="w-5 h-5" />} label="Estadísticas" isActive={viewMode === 'stats'} onClick={() => setViewMode('stats')} />
            </div>

            {viewMode === 'list' && <PlanList planificaciones={planificaciones} subjectMap={subjectMap} onSelectPlan={setCurrentPlan} />}
            {viewMode === 'calendar' && <PlanCalendar planificaciones={planificaciones} subjects={subjects} onSelectPlan={setCurrentPlan} />}
            {viewMode === 'stats' && <PlanStats planificaciones={planificaciones} />}

            {currentPlan && (
                <PlanEditor
                    key={currentPlan.id || 'new'}
                    plan={currentPlan}
                    subjects={subjects}
                    onSave={handleSavePlan}
                    onClose={() => setCurrentPlan(null)}
                    onDelete={handleDeletePlan}
                />
            )}
        </div>
    );
};