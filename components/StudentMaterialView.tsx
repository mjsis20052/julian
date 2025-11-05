import React, { useState, useMemo } from 'react';
import { Subject, Material, MaterialCategory } from '../types';
import { ArrowLeftIcon, FileTextIcon, LinkIcon, DownloadIcon, EyeIcon, YouTubeIcon, ImageIcon, PresentationIcon, XCircleIcon } from './Icons';

// Helper to get an icon for a material type
const getMaterialIcon = (type: Material['type'], url?: string) => {
    const className = "w-12 h-12";
    if (type === 'link' && url && (url.includes('youtube.com') || url.includes('youtu.be'))) {
        return <YouTubeIcon className={`${className} text-red-600`} />;
    }
    switch (type) {
        case 'pdf': return <FileTextIcon className={`${className} text-red-500`} />;
        case 'image': return <ImageIcon className={`${className} text-purple-500`} />;
        case 'presentation': return <PresentationIcon className={`${className} text-orange-500`} />;
        case 'link': return <LinkIcon className={`${className} text-blue-500`} />;
        default: return <FileTextIcon className={`${className} text-gray-500`} />;
    }
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


const MaterialPreviewModal: React.FC<{ material: Material, onClose: () => void, onDownload: (material: Material) => void }> = ({ material, onClose, onDownload }) => {
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


interface StudentMaterialViewProps {
    subject: Subject;
    materials: Material[];
    allMaterials: Material[];
    onUpdateMaterials: (materials: Material[]) => void;
    onBack: () => void;
}

export const StudentMaterialView: React.FC<StudentMaterialViewProps> = ({ subject, materials, allMaterials, onUpdateMaterials, onBack }) => {
    const [previewingMaterial, setPreviewingMaterial] = useState<Material | null>(null);

    const materialsByCategory = useMemo(() => {
        const grouped: { [key in MaterialCategory]?: Material[] } = {};
        materials.forEach(m => {
            if (!grouped[m.category]) grouped[m.category] = [];
            grouped[m.category]!.push(m);
        });
        return grouped;
    }, [materials]);
    
    const handleDownload = (materialToDownload: Material) => {
        if (!materialToDownload.content || !materialToDownload.fileType || !materialToDownload.fileName) {
            if (materialToDownload.url) {
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

    const handleViewMaterial = (material: Material) => {
        const updatedMaterials = allMaterials.map(m => 
            m.id === material.id ? { ...m, viewCount: m.viewCount + 1 } : m
        );
        onUpdateMaterials(updatedMaterials);
        setPreviewingMaterial(material);
    };

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in-up">
            <div className="flex items-center gap-3 mb-6">
                <button onClick={onBack} className="btn btn-secondary !p-2"><ArrowLeftIcon className="w-5 h-5" /></button>
                <div>
                    <h1 className="text-3xl font-bold text-[--color-text-primary]">{subject.name}</h1>
                    <p className="text-[--color-text-secondary]">Material de Estudio</p>
                </div>
            </div>
            
            {materials.length > 0 ? (
                <div className="space-y-8">
                    {(Object.entries(materialsByCategory) as [string, Material[]][]).map(([category, items]) => (
                        <section key={category}>
                            <h2 className="text-xl font-semibold text-[--color-text-primary] mb-4 border-b-2 border-[--color-accent] pb-2">{category}</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {items.map(item => (
                                    <button key={item.id} onClick={() => handleViewMaterial(item)} className="solid-card group relative overflow-hidden text-left transform hover:-translate-y-1 transition-transform">
                                        <div className="p-4 flex flex-col items-center text-center gap-3">
                                            {getMaterialIcon(item.type, item.url)}
                                            <p className="font-semibold text-sm line-clamp-2 flex-grow h-10">{item.title}</p>
                                            <div className="flex items-center gap-3 text-xs text-[--color-text-secondary]">
                                                <span className="flex items-center gap-1"><EyeIcon className="w-4 h-4"/> {item.viewCount}</span>
                                                <span className="flex items-center gap-1"><DownloadIcon className="w-4 h-4"/> {item.downloadCount}</span>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            ) : (
                <div className="text-center solid-card p-12">
                    <FileTextIcon className="w-16 h-16 mx-auto text-[--color-text-secondary] opacity-50 mb-4" />
                    <h3 className="text-xl font-bold text-[--color-text-primary]">No hay materiales todavía</h3>
                    <p className="text-[--color-text-secondary] mt-2">El profesor aún no ha subido recursos para esta materia.</p>
                </div>
            )}

            {previewingMaterial && <MaterialPreviewModal material={previewingMaterial} onClose={() => setPreviewingMaterial(null)} onDownload={handleDownload} />}
        </div>
    );
};