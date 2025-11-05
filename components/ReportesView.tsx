import React, { useState, useMemo } from 'react';
import { User, Subject, Grade, AttendanceRecord, AttendanceStatus, GradeType } from '../types';
import { DownloadIcon, ChartBarIcon, TrendingUpIcon, TrendingDownIcon } from './Icons';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Props definition
interface ReportesViewProps {
    user: User;
    subjects: Subject[];
    students: User[];
    grades: Grade[];
    attendanceRecords: AttendanceRecord[];
}

// Reusable Bar Chart Component
const BarChart: React.FC<{ data: { label: string; value: number }[]; title: string; }> = ({ data, title }) => {
    const maxValue = Math.max(...data.map(d => d.value), 0);
    const scale = maxValue > 0 ? 100 / maxValue : 0;

    return (
        <div className="solid-card p-6 h-full">
            <h3 className="font-bold text-[--color-text-primary] mb-4">{title}</h3>
            <div className="flex justify-around items-end h-64 w-full gap-4 pt-4 border-l border-b border-[--color-border]" aria-label={title}>
                {data.map((item, index) => (
                    <div key={item.label} className="flex flex-col items-center flex-1 h-full group">
                        <div className="w-full h-full flex items-end justify-center" title={`${item.label}: ${item.value.toFixed(2)}`}>
                            <div
                                className={`w-3/4 bg-[--color-accent] rounded-t-lg hover:bg-[--color-accent-hover] transition-all relative`}
                                style={{ height: `${item.value * scale}%`, animation: `grow-bar 0.5s ease-out ${index * 0.1}s forwards`, transformOrigin: 'bottom', opacity: 0 }}
                            >
                                <span className="text-[--color-text-primary] font-bold text-sm absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">{item.value.toFixed(2)}</span>
                            </div>
                        </div>
                        <span className="text-xs mt-2 font-semibold text-[--color-text-secondary] text-center">{item.label}</span>
                    </div>
                ))}
            </div>
            <style>{`@keyframes grow-bar { from { transform: scaleY(0); opacity: 0; } to { transform: scaleY(1); opacity: 1; } }`}</style>
        </div>
    );
};

// Reusable Line Chart Component
const LineChart: React.FC<{ data: { label: string; value: number }[]; title: string; }> = ({ data, title }) => {
    if (!data || data.length < 2) {
        return (
            <div className="solid-card p-6 h-full text-center flex flex-col justify-center items-center">
                <h3 className="font-bold text-[--color-text-primary] mb-4">{title}</h3>
                <p className="text-[--color-text-secondary]">No hay suficientes datos para mostrar la evolución.</p>
            </div>
        );
    }
    // Constants for SVG dimensions
    const width = 500;
    const height = 300;
    const padding = { top: 20, right: 20, bottom: 40, left: 40 };

    const maxValue = 10; // Grades are 0-10
    const minValue = 0;

    const xScale = (index: number) => padding.left + (index / (data.length - 1)) * (width - padding.left - padding.right);
    const yScale = (value: number) => height - padding.bottom - ((value - minValue) / (maxValue - minValue)) * (height - padding.top - padding.bottom);

    const linePath = data.map((point, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(point.value)}`).join(' ');

    return (
        <div className="solid-card p-6 h-full">
            <h3 className="font-bold text-[--color-text-primary] mb-4">{title}</h3>
            <div className="w-full overflow-x-auto">
                <svg viewBox={`0 0 ${width} ${height}`} aria-label={title}>
                    {/* Y-Axis Grid Lines & Labels */}
                    {[...Array(6)].map((_, i) => {
                        const y = height - padding.bottom - (i * (height - padding.top - padding.bottom) / 5);
                        const value = minValue + i * (maxValue - minValue) / 5;
                        return (
                            <g key={i}>
                                <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="var(--color-border)" strokeDasharray="2,2" />
                                <text x={padding.left - 8} y={y} dy="0.3em" textAnchor="end" fontSize="10" fill="var(--color-text-secondary)">{value}</text>
                            </g>
                        );
                    })}

                    {/* X-Axis Labels */}
                    {data.map((point, i) => (
                        <text key={i} x={xScale(i)} y={height - padding.bottom + 15} textAnchor="middle" fontSize="10" fill="var(--color-text-secondary)">{point.label}</text>
                    ))}

                    {/* Line Path */}
                    <path d={linePath} fill="none" stroke="var(--color-accent)" strokeWidth="2" style={{ strokeDasharray: 1000, strokeDashoffset: 1000, animation: 'dash 1.5s ease-out forwards' }} />

                    {/* Data Points & Tooltips */}
                    {data.map((point, i) => (
                        <g key={i} className="group">
                            <circle cx={xScale(i)} cy={yScale(point.value)} r="4" fill="var(--color-accent)" className="transition-transform group-hover:scale-150" style={{ animation: `pop-in 0.5s ease-out ${i * 0.2}s forwards`, transform: 'scale(0)' }}/>
                            <g className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <rect x={xScale(i) - 20} y={yScale(point.value) - 30} width="40" height="20" rx="4" fill="var(--color-primary)" stroke="var(--color-border)" />
                                <text x={xScale(i)} y={yScale(point.value) - 20} textAnchor="middle" fontSize="10" fontWeight="bold" fill="var(--color-text-primary)">{point.value.toFixed(2)}</text>
                            </g>
                        </g>
                    ))}
                </svg>
            </div>
             <style>{`
                @keyframes dash { to { stroke-dashoffset: 0; } }
                @keyframes pop-in { to { transform: scale(1); } }
            `}</style>
        </div>
    );
};


// Main Component
export const ReportesView: React.FC<ReportesViewProps> = ({ user, subjects, students, grades, attendanceRecords }) => {
    const [selectedSubjectId, setSelectedSubjectId] = useState('all');

    const myStudentIds = useMemo(() => {
        const studentSet = new Set<number>();
        subjects.forEach(subject => {
            students
                .filter(s => s.careerId === subject.careerId && (Array.isArray(s.year) ? s.year.includes(subject.year) : s.year === subject.year))
                .forEach(s => studentSet.add(s.id));
        });
        return studentSet;
    }, [subjects, students]);

    const { summaryStats, performanceBySubject, detailedStudentData, evolutionData } = useMemo(() => {
        const subjectIds = selectedSubjectId === 'all' ? subjects.map(s => s.id) : [selectedSubjectId];
        const relevantStudents = students.filter(s => myStudentIds.has(s.id));
        
        let totalGrades = 0, gradeSum = 0, aprobados = 0, desaprobados = 0, promocionados = 0, regulares = 0;
        const studentData = relevantStudents.map(student => {
            const studentGrades = grades.filter(g => g.studentId === student.id && subjectIds.includes(g.subjectId) && !isNaN(parseFloat(g.value)));
            const promedio = studentGrades.length > 0 ? studentGrades.reduce((sum, g) => sum + parseFloat(g.value), 0) / studentGrades.length : 0;
            if(promedio > 0) { gradeSum += promedio; totalGrades++; }

            const studentAttendance = attendanceRecords.filter(r => r.studentId === student.id && subjectIds.includes(r.subjectId));
            const present = studentAttendance.filter(r => r.status === AttendanceStatus.PRESENT || r.status === AttendanceStatus.JUSTIFIED).length;
            const asistencia = studentAttendance.length > 0 ? (present / studentAttendance.length) * 100 : 100;

            let estado = 'En Curso';
            if (promedio >= 7) { estado = 'Promocionado'; promocionados++; }
            else if (promedio >= 4) { estado = 'Regular'; regulares++; }
            else if (promedio > 0) { estado = 'Desaprobado'; desaprobados++;}
            if(promedio >= 4) aprobados++;

            return { id: student.id, name: student.name, promedio, asistencia, estado };
        });

        const asistenciaTotal = attendanceRecords.filter(r => myStudentIds.has(r.studentId) && subjectIds.includes(r.subjectId));
        const asistenciaGeneral = asistenciaTotal.length > 0 ? (asistenciaTotal.filter(r=>r.status === AttendanceStatus.PRESENT || r.status === AttendanceStatus.JUSTIFIED).length / asistenciaTotal.length) * 100 : 100;

        const perfBySub = subjects.filter(s=> subjectIds.includes(s.id)).map(subject => {
            const subjectGrades = grades.filter(g => g.subjectId === subject.id && myStudentIds.has(g.studentId) && !isNaN(parseFloat(g.value)));
            const value = subjectGrades.length > 0 ? subjectGrades.reduce((sum, g) => sum + parseFloat(g.value), 0) / subjectGrades.length : 0;
            return { label: subject.name.split(' ').slice(0,2).join(' '), value };
        });

        const evolData = grades.filter(g => myStudentIds.has(g.studentId) && subjectIds.includes(g.subjectId) && !['TP', 'Nota 1er Cuatrimestre', 'Nota 2do Cuatrimestre'].includes(g.type))
            .slice(-5)
            .map(g => ({ label: g.type, value: parseFloat(g.value) || 0 }));

        return {
            summaryStats: {
                promedioGeneral: totalGrades > 0 ? gradeSum / totalGrades : 0,
                asistenciaGeneral,
                aprobados, desaprobados, promocionados, regulares
            },
            performanceBySubject: perfBySub,
            detailedStudentData: studentData,
            evolutionData: evolData,
        };
    }, [selectedSubjectId, subjects, students, grades, attendanceRecords, myStudentIds]);
    
    const handleExportPDF = () => {
        const doc = new jsPDF();
        const subjectName = selectedSubjectId === 'all' ? 'Todos_los_Cursos' : subjects.find(s => s.id === selectedSubjectId)?.name.replace(/ /g, '_') || 'reporte';

        doc.setFontSize(18);
        doc.text(`Reporte Académico - ${subjectName.replace(/_/g, ' ')}`, 14, 22);
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Fecha: ${new Date().toLocaleDateString('es-AR')}`, 14, 28);
        
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text(`Promedio General: ${summaryStats.promedioGeneral.toFixed(2)}`, 14, 40);
        doc.text(`Asistencia General: ${summaryStats.asistenciaGeneral.toFixed(1)}%`, 14, 46);
        
        // The `autoTable` method is an extension from jspdf-autotable and is not on the base jsPDF type. Cast to 'any' to resolve the type error.
        (doc as any).autoTable({
            startY: 55,
            head: [['Alumno', 'Promedio', '% Asistencia', 'Estado']],
            body: detailedStudentData.map(s => [s.name, s.promedio.toFixed(2), s.asistencia.toFixed(1) + '%', s.estado]),
            theme: 'grid'
        });

        doc.save(`reporte_${subjectName}.pdf`);
    };

    return (
        <div className="animate-fade-in-up space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[--color-text-primary]">Reportes Académicos</h1>
                    <p className="text-[--color-text-secondary]">Análisis del rendimiento y asistencia de tus cursos.</p>
                </div>
                <button onClick={handleExportPDF} className="btn btn-primary">
                    <DownloadIcon className="w-5 h-5"/> Descargar Reporte
                </button>
            </div>

            <div className="w-full sm:w-1/2 md:w-1/3">
                <label htmlFor="subject-filter-reportes" className="sr-only">Filtrar por materia</label>
                <select id="subject-filter-reportes" onChange={(e) => setSelectedSubjectId(e.target.value)} value={selectedSubjectId} className="input-styled w-full">
                    <option value="all">Todas las materias</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="solid-card p-4"><p className="text-sm text-[--color-text-secondary]">Promedio General</p><p className="text-3xl font-bold text-blue-500">{summaryStats.promedioGeneral.toFixed(2)}</p></div>
                <div className="solid-card p-4"><p className="text-sm text-[--color-text-secondary]">Asistencia General</p><p className="text-3xl font-bold text-green-500">{summaryStats.asistenciaGeneral.toFixed(1)}%</p></div>
                <div className="solid-card p-4"><p className="text-sm text-[--color-text-secondary]">Aprobados</p><p className="text-3xl font-bold text-green-600">{summaryStats.aprobados}</p></div>
                <div className="solid-card p-4"><p className="text-sm text-[--color-text-secondary]">Desaprobados</p><p className="text-3xl font-bold text-red-500">{summaryStats.desaprobados}</p></div>
                <div className="solid-card p-4"><p className="text-sm text-[--color-text-secondary]">Promocionados</p><p className="text-3xl font-bold text-green-700">{summaryStats.promocionados}</p></div>
                <div className="solid-card p-4"><p className="text-sm text-[--color-text-secondary]">Regulares</p><p className="text-3xl font-bold text-blue-600">{summaryStats.regulares}</p></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <BarChart data={performanceBySubject} title="Promedio de Notas por Materia" />
                <LineChart data={evolutionData} title="Evolución de Notas (Últimas 5 Evaluaciones)" />
            </div>

            <div className="solid-card p-6">
                <h3 className="font-bold text-[--color-text-primary] mb-4">Detalle por Alumno</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b-2 border-[--color-border]">
                                <th className="p-3 font-semibold text-sm">Alumno</th>
                                <th className="p-3 font-semibold text-sm text-center">Promedio</th>
                                <th className="p-3 font-semibold text-sm text-center">% Asistencia</th>
                                <th className="p-3 font-semibold text-sm">Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {detailedStudentData.map(student => (
                                <tr key={student.id} className="border-b border-[--color-border] last:border-b-0">
                                    <td className="p-3 font-medium">{student.name}</td>
                                    <td className="p-3 text-center font-bold">{student.promedio.toFixed(2)}</td>
                                    <td className="p-3 text-center font-bold">{student.asistencia.toFixed(1)}%</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                            student.estado === 'Promocionado' || student.estado === 'Aprobado' ? 'bg-green-500/10 text-green-600' :
                                            student.estado === 'Regular' ? 'bg-blue-500/10 text-blue-600' :
                                            'bg-red-500/10 text-red-600'
                                        }`}>
                                            {student.estado}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};