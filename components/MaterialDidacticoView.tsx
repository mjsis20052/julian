import React, { useState, useMemo } from 'react';
import { Subject, Material, MaterialCategory, User, Role, NotificationType, Notification } from '../types';
import { FolderIcon, ArrowLeftIcon, PlusCircleIcon, FileTextIcon, LinkIcon, TrashIcon, UploadIcon, EyeIcon, DownloadIcon, UsersIcon, YouTubeIcon, ImageIcon, PresentationIcon, PencilIcon, XCircleIcon } from './Icons';

// Helper to get an icon for a material type
const getMaterialIcon = (type: Material['type'], url?: string) => {
    const className = "w-12 h-12";
    if (type === 'link' && url && (url.includes('youtube.com') || url.includes('youtu.be'))) {
        return <YouTubeIcon className={`${className} text-red-600`} />;
    }
    switch(type) {
        case 'pdf': return <FileTextIcon className={`${className} text-red-500`} />;
        case 'image': return <ImageIcon className={`${className} text-purple-500`} />;
        case 'presentation': return <PresentationIcon className={`${className} text-orange-500`} />;
        case 'link': return <LinkIcon className={`${className} text-blue-500`} />;
        default: return <FileTextIcon className={`${className} text-gray-500`} />;
    }
};

interface MaterialModalProps {
    subjectId: string;
    onClose: () => void;
    onSave: (newMaterial: Material) => void;
    initialMaterial?: Material | null;
}

const MaterialModal: React.FC<MaterialModalProps> = ({ subjectId, onClose, onSave, initialMaterial }) => {
    const [title, setTitle] = useState(initialMaterial?.title || '');
    const [category, setCategory] = useState<MaterialCategory>(initialMaterial?.category || MaterialCategory.GUIAS);
    const [type, setType] = useState<Material['type']>(initialMaterial?.type || 'pdf');
    const [url, setUrl] = useState(initialMaterial?.url || '');
    const [fileName, setFileName] = useState(initialMaterial?.fileName || '');
    const [file, setFile] = useState<File | null>(null);

    const isEditing = !!initialMaterial;

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve((reader.result as string).split(',')[1]);
            reader.onerror = error => reject(error);
        });
    };

    const handleSubmit = async () => {
        if (!title.trim()) return;

        let fileContent: string | undefined;
        let mimeType: string | undefined;

        if (type !== 'link' && file) {
            fileContent = await fileToBase64(file);
            mimeType = file.type;
        } else if (isEditing && initialMaterial?.content) {
            fileContent = initialMaterial.content;
            mimeType = initialMaterial.fileType;
        }

        const materialData: Material = {
            id: initialMaterial?.id || `mat-${Date.now()}`,
            subjectId,
            title,
            category,
            type,
            url: type === 'link' ? url : undefined,
            fileName: type !== 'link' ? (fileName || (file ? file.name : '')) : undefined,
            fileType: mimeType,
            content: fileContent,
            viewCount: initialMaterial?.viewCount || 0,
            downloadCount: initialMaterial?.downloadCount || 0,
            createdAt: initialMaterial?.createdAt || new Date().toISOString(),
        };
        onSave(materialData);
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setFileName(selectedFile.name);
        }
    };

    const acceptTypes = {
        pdf: '.pdf',
        image: 'image/*',
        presentation: '.ppt, .pptx, application/vnd.ms-powerpoint, application/vnd.openxmlformats-officedocument.presentationml.presentation',
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="glass-card w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-[--color-text-primary] mb-6">{isEditing ? 'Editar' : 'Subir'} Material Didáctico</h2>
                <div className="space-y-4">
                    <input type="text" placeholder="Título del material" value={title} onChange={e => setTitle(e.target.value)} className="input-styled w-full" />
                    <select value={category} onChange={e => setCategory(e.target.value as MaterialCategory)} className="input-styled w-full">
                        {Object.values(MaterialCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                    <select value={type} onChange={e => { setType(e.target.value as Material['type']); setFile(null); setFileName(''); }} className="input-styled w-full">
                        <option value="pdf">Archivo PDF</option>
                        <option value="image">Imagen</option>
                        <option value="presentation">Presentación</option>
                        <option value="link">Enlace Externo</option>
                    </select>
                    {type === 'link' ? (
                        <input type="url" placeholder="https://..." value={url} onChange={e => setUrl(e.target.value)} className="input-styled w-full" />
                    ) : (
                        <div>
                            <label htmlFor="file-upload" className="input-styled w-full flex items-center gap-3 cursor-pointer hover:bg-[--color-border]">
                                <UploadIcon className="w-5 h-5 text-[--color-text-primary]" />
                                <span className="text-sm text-[--color-text-primary] truncate">{fileName || 'Seleccionar archivo...'}</span>
                            </label>
                            <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} accept={acceptTypes[type as keyof typeof acceptTypes]} />
                        </div>
                    )}
                </div>
                 <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-[--color-border]">
                    <button onClick={onClose} className="btn btn-secondary">Cancelar</button>
                    <button onClick={handleSubmit} className="btn btn-primary">Guardar</button>
                </div>
            </div>
        </div>
    );
};

const PreviewModal: React.FC<{ material: Material, onClose: () => void, onDownload: (material: Material) => void }> = ({ material, onClose, onDownload }) => {
    const isYoutube = material.type === 'link' && material.url && (material.url.includes('youtube.com/watch') || material.url.includes('youtu.be'));
    const youtubeEmbedUrl = isYoutube ? material.url!.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/') : '';
    
    return (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="glass-card w-full max-w-4xl h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b border-[--color-border] flex justify-between items-center">
                    <h3 className="font-bold text-[--color-text-primary] truncate">{material.title}</h3>
                    <button onClick={onClose} className="btn btn-secondary !p-2 rounded-full h-8 w-8"><XCircleIcon className="w-5 h-5"/></button>
                </header>
                <div className="flex-grow flex items-center justify-center bg-[--color-secondary] p-4 overflow-auto">
                    {isYoutube ? (
                        <iframe
                            className="w-full h-full aspect-video"
                            src={youtubeEmbedUrl}
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    ) : material.type === 'link' ? (
                        <div className="text-center">
                            <p className="text-[--color-text-secondary] mb-4">Serás redirigido a un sitio externo.</p>
                            <a href={material.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                                <LinkIcon className="w-5 h-5"/> Abrir Enlace
                            </a>
                        </div>
                    ) : (
                         <div className="text-center">
                            <p className="text-2xl font-bold">{getMaterialIcon(material.type, material.url)}</p>
                            <p className="font-semibold text-[--color-text-primary] mt-2">{material.fileName}</p>
                            <p className="text-[--color-text-secondary] text-sm mt-4">La previsualización de archivos no está disponible en este prototipo.</p>
                            <button onClick={() => onDownload(material)} className="btn btn-primary mt-4"><DownloadIcon className="w-5 h-5"/> Descargar</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const downloadBase64File = (base64Data: string, contentType: string, fileName: string) => {
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};


const FileManager: React.FC<{ subject: Subject; allMaterials: Material[]; onUpdateMaterials: (materials: Material[]) => void; onBack: () => void; addNotification: (notificationData: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void; allUsers: User[] }> = ({ subject, allMaterials, onUpdateMaterials, onBack, addNotification, allUsers }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [modalState, setModalState] = useState<{ open: boolean, material: Material | null }>({ open: false, material: null });
    const [previewingMaterial, setPreviewingMaterial] = useState<Material | null>(null);

    const materialsForSubject = useMemo(() => {
        return allMaterials
            .filter(m => m.subjectId === subject.id)
            .filter(m => m.title.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [allMaterials, subject.id, searchTerm]);

    const materialsByCategory = useMemo(() => {
        const grouped: { [key in MaterialCategory]?: Material[] } = {};
        materialsForSubject.forEach(m => {
            if (!grouped[m.category]) grouped[m.category] = [];
            grouped[m.category]!.push(m);
        });
        return grouped;
    }, [materialsForSubject]);

    const handleSave = (materialToSave: Material) => {
        const existing = allMaterials.find(m => m.id === materialToSave.id);
        if (existing) {
            onUpdateMaterials(allMaterials.map(m => m.id === materialToSave.id ? materialToSave : m));
        } else {
            onUpdateMaterials([...allMaterials, materialToSave]);

            // --- NOTIFICATION LOGIC ---
            const studentsToNotify = allUsers.filter(u =>
                u.role === Role.STUDENT &&
                u.careerId === subject.careerId &&
                u.year === subject.year
            );

            studentsToNotify.forEach(student => {
                addNotification({
                    userId: student.id,
                    type: NotificationType.NEW_ASSIGNMENT,
                    text: `Nuevo material en ${subject.name}`,
                    details: `El profesor ha subido: "${materialToSave.title}"`
                });
            });
            // --- END NOTIFICATION LOGIC ---
        }
        setModalState({ open: false, material: null });
    };

    const handleDelete = (id: string) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este material?')) {
            onUpdateMaterials(allMaterials.filter(m => m.id !== id));
        }
    };
    
    const handleDownload = (materialToDownload: Material) => {
        if (!materialToDownload.content || !materialToDownload.fileType || !materialToDownload.fileName) {
            if (materialToDownload.url) { // Handle download for links
                window.open(materialToDownload.url, '_blank');
            }
            return;
        }

        downloadBase64File(materialToDownload.content, materialToDownload.fileType, materialToDownload.fileName);
        
        const updatedMaterials = allMaterials.map(m => 
            m.id === materialToDownload.id ? { ...m, downloadCount: m.downloadCount + 1 } : m
        );
        onUpdateMaterials(updatedMaterials);
    };
    
    const handlePreview = (material: Material) => {
        const updatedMaterials = allMaterials.map(m => 
            m.id === material.id ? { ...m, viewCount: m.viewCount + 1 } : m
        );
        onUpdateMaterials(updatedMaterials);
        setPreviewingMaterial(material);
    }
    
    return (
        <div className="animate-fade-in-up">
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="btn btn-secondary !p-2"><ArrowLeftIcon className="w-5 h-5" /></button>
                    <div>
                        <h1 className="text-3xl font-bold text-[--color-text-primary]">{subject.name}</h1>
                        <p className="text-[--color-text-secondary]">Biblioteca de Recursos</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 self-stretch sm:self-auto w-full sm:w-auto">
                    <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Buscar archivos..." className="input-styled w-full sm:w-48"/>
                    <button onClick={() => setModalState({ open: true, material: null })} className="btn btn-primary"><PlusCircleIcon className="w-5 h-5"/> <span className="hidden sm:inline">Subir</span></button>
                </div>
            </div>

            {Object.keys(materialsByCategory).length > 0 ? (
                <div className="space-y-8">
                {(Object.entries(materialsByCategory) as [string, Material[]][]).map(([category, items]) => (
                    <section key={category}>
                        <h2 className="text-xl font-semibold text-[--color-text-primary] mb-4 border-b-2 border-[--color-accent] pb-2">{category}</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {items.map(item => (
                                <div key={item.id} className="solid-card group relative overflow-hidden">
                                    <button onClick={() => handlePreview(item)} className="p-4 flex flex-col items-center text-center gap-3 cursor-pointer w-full">
                                        {getMaterialIcon(item.type, item.url)}
                                        <p className="font-semibold text-sm line-clamp-2 flex-grow h-10">{item.title}</p>
                                        <div className="flex items-center gap-3 text-xs text-[--color-text-secondary]">
                                            <span className="flex items-center gap-1"><EyeIcon className="w-4 h-4"/> {item.viewCount}</span>
                                            <span className="flex items-center gap-1"><DownloadIcon className="w-4 h-4"/> {item.downloadCount}</span>
                                        </div>
                                    </button>
                                     <div className="absolute top-1 right-1 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => {}} className="p-1.5 rounded-full bg-gray-500/80 text-white hover:bg-gray-600" title="Compartir (Próximamente)" disabled><UsersIcon className="w-4 h-4"/></button>
                                        <button onClick={() => setModalState({ open: true, material: item })} className="p-1.5 rounded-full bg-blue-500/80 text-white hover:bg-blue-600"><PencilIcon className="w-4 h-4"/></button>
                                        <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-full bg-red-500/80 text-white hover:bg-red-600"><TrashIcon className="w-4 h-4"/></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                ))}
                </div>
            ) : (
                <div className="text-center solid-card p-12">
                    <UploadIcon className="w-16 h-16 mx-auto text-[--color-text-secondary] opacity-50 mb-4" />
                    <h3 className="text-xl font-bold text-[--color-text-primary]">No hay materiales todavía</h3>
                    <p className="text-[--color-text-secondary] mt-2">Sube el primer recurso para esta materia.</p>
                </div>
            )}
            {modalState.open && <MaterialModal subjectId={subject.id} onClose={() => setModalState({ open: false, material: null })} onSave={handleSave} initialMaterial={modalState.material} />}
            {previewingMaterial && <PreviewModal material={previewingMaterial} onClose={() => setPreviewingMaterial(null)} onDownload={handleDownload}/>}
        </div>
    );
};

// Main View Component
interface MaterialDidacticoViewProps {
    subjects: Subject[];
    materials: Material[];
    onUpdateMaterials: (materials: Material[]) => void;
    addNotification: (notificationData: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
    allUsers: User[];
}

export const MaterialDidacticoView: React.FC<MaterialDidacticoViewProps> = ({ subjects, materials, onUpdateMaterials, addNotification, allUsers }) => {
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

    if (!selectedSubject) {
        return (
            <div className="animate-fade-in-up">
                <div className="glass-card p-6 mb-6">
                    <h2 className="text-2xl font-bold">Material Didáctico</h2>
                    <p className="text-[--color-text-secondary]">Selecciona una materia para ver y gestionar sus recursos.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {subjects.map(subject => {
                        const materialCount = materials.filter(m => m.subjectId === subject.id).length;
                        return (
                            <button key={subject.id} onClick={() => setSelectedSubject(subject)} className="solid-card p-6 text-left flex items-start gap-4 transform hover:-translate-y-1 transition-transform duration-300">
                                <FolderIcon className="w-10 h-10 text-[--color-accent] shrink-0" />
                                <div>
                                    <h3 className="text-xl font-bold text-[--color-text-primary]">{subject.name}</h3>
                                    <p className="text-sm text-[--color-text-secondary]">{materialCount} recurso(s)</p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    }
    
    return <FileManager subject={selectedSubject} allMaterials={materials} onUpdateMaterials={onUpdateMaterials} onBack={() => setSelectedSubject(null)} addNotification={addNotification} allUsers={allUsers} />;
};