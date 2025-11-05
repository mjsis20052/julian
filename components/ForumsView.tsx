import React, { useState, useMemo } from 'react';
import { User, ForumThread, ForumReply, ForumThreadStatus, Role } from '../types';
import { ArrowLeftIcon, ChatBubbleIcon, LockClosedIcon, LockOpenIcon, MessageSquareIcon, PencilIcon, SendIcon, TrashIcon, UserIcon, XCircleIcon } from './Icons';

interface ForumsViewProps {
  currentUser: User;
  allUsers: User[];
  threads: ForumThread[];
  replies: ForumReply[];
  onAddThread: (thread: Omit<ForumThread, 'id' | 'timestamp' | 'status' | 'isLocked'>) => void;
  onEditThread?: (threadId: string, title: string, content: string) => void;
  onAddReply: (reply: Omit<ForumReply, 'id' | 'timestamp'>) => void;
  onUpdateThreadStatus?: (threadId: string, status: ForumThreadStatus, reason?: string) => void;
  onDeleteThread?: (threadId: string) => void;
  onDeleteReply?: (replyId: string) => void;
  onToggleLockThread?: (threadId: string) => void;
}

const TimeAgo: React.FC<{ date: string }> = ({ date }) => {
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diffInSeconds < 60) return <span>hace {diffInSeconds}s</span>;
    if (diffInSeconds < 3600) return <span>hace {Math.floor(diffInSeconds / 60)}m</span>;
    if (diffInSeconds < 86400) return <span>hace {Math.floor(diffInSeconds / 3600)}h</span>;
    return <span>hace {Math.floor(diffInSeconds / 86400)}d</span>;
}

const RejectionModal: React.FC<{ threadTitle: string, onClose: () => void, onConfirm: (status: ForumThreadStatus, reason: string) => void }> = ({ threadTitle, onClose, onConfirm }) => {
    const [reason, setReason] = useState('');
    return (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="glass-card w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-[--color-text-primary] mb-2">Rechazar Publicación</h2>
                <p className="text-[--color-text-secondary] mb-4">Estás a punto de rechazar: "{threadTitle}"</p>
                <div>
                    <label htmlFor="rejection-reason" className="block text-sm font-medium text-[--color-text-secondary] mb-1">Motivo (opcional para rechazo, requerido para solicitar cambios)</label>
                    <textarea id="rejection-reason" value={reason} onChange={e => setReason(e.target.value)} rows={3} className="input-styled w-full" placeholder="Explica por qué la publicación no es adecuada o qué cambios necesita." />
                </div>
                <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-[--color-border]">
                    <button type="button" onClick={onClose} className="btn btn-secondary">Cancelar</button>
                    <button type="button" onClick={() => onConfirm(ForumThreadStatus.REJECTED, reason)} className="btn btn-danger">Rechazar Permanentemente</button>
                    <button type="button" onClick={() => onConfirm(ForumThreadStatus.NEEDS_REVISION, reason)} disabled={!reason.trim()} className="btn btn-primary">Solicitar Cambios</button>
                </div>
            </div>
        </div>
    );
};

const ThreadEditor: React.FC<{ initialThread?: ForumThread, onClose: () => void, onSave: (title: string, content: string, threadId?: string) => void }> = ({ initialThread, onClose, onSave }) => {
    const [title, setTitle] = useState(initialThread?.title || '');
    const [content, setContent] = useState(initialThread?.content || '');
    const [error, setError] = useState('');
    const isEditing = !!initialThread;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) {
            setError('El título y el contenido no pueden estar vacíos.'); return;
        }
        onSave(title, content, initialThread?.id);
    }
    
    return (
        <form onSubmit={handleSubmit} className="animate-fade-in-up flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
                 <h2 className="text-3xl font-bold text-[--color-text-primary]">{isEditing ? 'Editar Hilo' : 'Crear Nuevo Hilo'}</h2>
            </div>
            <div className="solid-card p-6 flex-grow flex flex-col gap-4">
                <div>
                    <label htmlFor="thread-title" className="block text-sm font-medium text-[--color-text-secondary] mb-1">Título</label>
                    <input type="text" id="thread-title" value={title} onChange={e => setTitle(e.target.value)} placeholder="Un título claro y conciso" className="input-styled w-full"/>
                </div>
                <div className="flex-grow flex flex-col">
                    <label htmlFor="thread-content" className="block text-sm font-medium text-[--color-text-secondary] mb-1">Contenido</label>
                    <textarea id="thread-content" value={content} onChange={e => setContent(e.target.value)} placeholder="Escribe tu pregunta o tema de discusión..." className="input-styled w-full flex-grow resize-none"/>
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <div className="flex justify-end gap-2 pt-4 border-t border-[--color-border]">
                    <button type="button" onClick={onClose} className="btn btn-secondary">Cancelar</button>
                    <button type="submit" className="btn btn-primary">{isEditing ? 'Guardar Cambios' : 'Publicar Hilo'}</button>
                </div>
            </div>
        </form>
    );
};


export const ForumsView: React.FC<ForumsViewProps> = ({ currentUser, allUsers, threads, replies, onAddThread, onEditThread, onAddReply, onUpdateThreadStatus, onDeleteThread, onDeleteReply, onToggleLockThread }) => {
    const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
    const [viewState, setViewState] = useState<'list' | 'create' | 'edit'>('list');
    const [editingThread, setEditingThread] = useState<ForumThread | null>(null);

    const [isRejectingThread, setIsRejectingThread] = useState<ForumThread | null>(null);
    const [newReply, setNewReply] = useState('');

    const userMap = useMemo(() => new Map(allUsers.map(u => [u.id, u.name])), [allUsers]);

    const visibleThreads = useMemo(() => {
        const userYears = Array.isArray(currentUser.year) ? currentUser.year : (currentUser.year ? [currentUser.year] : []);
        
        return threads.filter(thread => {
            if (currentUser.role === Role.STUDENT) {
                const isMyThread = thread.authorId === currentUser.id;
                const isApproved = thread.status === ForumThreadStatus.APPROVED;
                const matchesCourse = thread.careerId === currentUser.careerId && userYears.includes(thread.year as number);
                return matchesCourse && (isApproved || isMyThread);
            }
            if (currentUser.role === Role.PRECEPTOR) {
                return thread.careerId === currentUser.careerId && userYears.includes(thread.year as number);
            }
            return true;
        }).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [threads, currentUser]);

    const selectedThread = useMemo(() => {
        return threads.find(t => t.id === selectedThreadId) || null;
    }, [threads, selectedThreadId]);

    const handleAddThread = (title: string, content: string) => {
        if (currentUser.role !== Role.STUDENT || !currentUser.careerId || typeof currentUser.year === 'undefined') return;
        
        onAddThread({
            authorId: currentUser.id,
            title,
            content,
            careerId: currentUser.careerId,
            year: Array.isArray(currentUser.year) ? currentUser.year[0] : currentUser.year as number,
        });
        setViewState('list');
    };

    const handleEditSave = (title: string, content: string, threadId?: string) => {
        if (!threadId || !onEditThread) return;
        onEditThread(threadId, title, content);
        setViewState('list');
        setEditingThread(null);
        setSelectedThreadId(threadId); // Go back to the detail view after editing
    };

    const handleAddReply = (content: string) => {
        if (!selectedThread) return;
        onAddReply({
            threadId: selectedThread.id,
            authorId: currentUser.id,
            content,
        });
    };
    
    const handleConfirmRejection = (status: ForumThreadStatus, reason: string) => {
        if (isRejectingThread && onUpdateThreadStatus) {
            onUpdateThreadStatus(isRejectingThread.id, status, reason);
        }
        setIsRejectingThread(null);
    };
    
    const statusPill = (status: ForumThreadStatus) => {
        const styles: Record<ForumThreadStatus, string> = {
            [ForumThreadStatus.APPROVED]: 'bg-green-500/10 text-green-600',
            [ForumThreadStatus.PENDING]: 'bg-yellow-500/10 text-yellow-600',
            [ForumThreadStatus.REJECTED]: 'bg-red-500/10 text-red-600',
            [ForumThreadStatus.NEEDS_REVISION]: 'bg-blue-500/10 text-blue-600',
        };
        return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>{status}</span>;
    };
    
    // RENDER LOGIC
    if (viewState === 'create' || viewState === 'edit') {
        return <ThreadEditor
            initialThread={viewState === 'edit' ? editingThread! : undefined}
            onClose={() => { setViewState('list'); setEditingThread(null); }}
            onSave={(title, content, threadId) => {
                viewState === 'edit' ? handleEditSave(title, content, threadId) : handleAddThread(title, content);
            }}
        />;
    }

    if (!selectedThread) {
        // Thread List View
        return (
            <div className="animate-fade-in">
                <div className="animate-fade-in-up">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                        <div>
                            <h2 className="text-3xl font-bold text-[--color-text-primary]">Foros de Discusión</h2>
                            <p className="text-[--color-text-secondary]">Un espacio para colaborar y resolver dudas.</p>
                        </div>
                         {currentUser.role === Role.STUDENT && onAddThread && (
                             <button onClick={() => setViewState('create')} className="btn btn-primary self-start md:self-center">
                                 <PencilIcon className="w-5 h-5"/> <span>Nuevo Hilo</span>
                             </button>
                         )}
                    </div>
                    <div className="space-y-4">
                        {visibleThreads.length > 0 ? visibleThreads.map(thread => {
                            const isMyPost = thread.authorId === currentUser.id;
                            const showStatusToStudent = isMyPost && thread.status !== ForumThreadStatus.APPROVED;
                            return (
                                <div key={thread.id} onClick={() => setSelectedThreadId(thread.id)} className="solid-card p-5 cursor-pointer transform hover:-translate-y-1 transition-transform duration-300">
                                    <div className="flex justify-between items-start gap-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-[--color-accent] hover:underline">{thread.title}</h3>
                                            <p className="text-sm text-[--color-text-secondary] mt-1">
                                                por {userMap.get(thread.authorId) || 'Anónimo'} - <TimeAgo date={thread.timestamp} />
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            {thread.isLocked && <span title="Hilo bloqueado"><LockClosedIcon className="w-5 h-5 text-gray-400"/></span>}
                                            {(currentUser.role === Role.PRECEPTOR || showStatusToStudent) && statusPill(thread.status)}
                                            <div className="flex items-center gap-1 text-sm text-[--color-text-secondary]">
                                                <MessageSquareIcon className="w-5 h-5"/>
                                                <span>{replies.filter(r => r.threadId === thread.id).length}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        }) : (
                             <div className="text-center text-[--color-text-secondary] py-16 solid-card">
                                <ChatBubbleIcon className="w-12 h-12 mx-auto mb-4 opacity-50"/>
                                <p>Aún no hay discusiones en el foro.</p>
                                {currentUser.role === Role.STUDENT && <p className="mt-2">¡Sé el primero en empezar una!</p>}
                            </div>
                        )}
                    </div>
                </div>
                {isRejectingThread && onUpdateThreadStatus && <RejectionModal threadTitle={isRejectingThread.title} onClose={() => setIsRejectingThread(null)} onConfirm={handleConfirmRejection} />}
           </div>
        );
    }

    // Thread Detail View
    const threadReplies = replies.filter(r => r.threadId === selectedThread.id).sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
    const handleNewReplySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newReply.trim()) return;
        handleAddReply(newReply);
        setNewReply('');
    };
    
    const isPreceptor = currentUser.role === Role.PRECEPTOR;
    const isAuthor = currentUser.id === selectedThread.authorId;
    
    const canAdmin = isPreceptor && onUpdateThreadStatus && onToggleLockThread;
    const canEdit = onEditThread && (isPreceptor || (isAuthor && selectedThread.status === ForumThreadStatus.NEEDS_REVISION));
    const canDelete = onDeleteThread && (isPreceptor || isAuthor);

    return (
        <div className="animate-fade-in">
            <div className="animate-fade-in-up">
                <button onClick={() => setSelectedThreadId(null)} className="btn btn-secondary mb-6"><ArrowLeftIcon className="w-5 h-5"/> Volver a la lista</button>
                
                <div className="solid-card p-6 mb-6">
                    {canAdmin && (
                        <div className="bg-[--color-secondary] p-3 rounded-lg mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-[--color-border]">
                             <div>
                                <span className="font-semibold text-sm text-[--color-text-secondary] mr-2">Estado:</span>
                                {statusPill(selectedThread.status)}
                                {selectedThread.rejectionReason && <p className="text-xs text-red-500 mt-1">Motivo: {selectedThread.rejectionReason}</p>}
                            </div>
                            <div className="flex gap-2 flex-wrap">
                                <button onClick={() => onUpdateThreadStatus(selectedThread.id, ForumThreadStatus.APPROVED)} className="btn btn-success text-xs">Aprobar</button>
                                <button onClick={() => setIsRejectingThread(selectedThread)} className="btn btn-danger text-xs">Rechazar/Revisar</button>
                                <button onClick={() => onToggleLockThread(selectedThread.id)} className="btn btn-outline text-xs">{selectedThread.isLocked ? <><LockOpenIcon className="w-4 h-4"/> Desbloquear</> : <><LockClosedIcon className="w-4 h-4"/> Bloquear</>}</button>
                            </div>
                        </div>
                    )}
                    <div className="mb-4">
                        <h2 className="text-3xl font-bold text-[--color-text-primary] break-words">{selectedThread.title}</h2>
                        <p className="text-sm text-[--color-text-secondary] mt-2">
                            por {userMap.get(selectedThread.authorId) || 'Anónimo'} - <TimeAgo date={selectedThread.timestamp} />
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 mt-4 mb-6">
                        {canEdit && (
                            <button onClick={() => { setEditingThread(selectedThread); setViewState('edit'); setSelectedThreadId(null); }} className="btn btn-secondary text-sm w-full sm:w-auto"><PencilIcon className="w-4 h-4"/> Editar</button>
                        )}
                        {canDelete && (
                            <button onClick={() => { if (window.confirm('¿Estás seguro de que quieres eliminar este hilo?')) { if(onDeleteThread) onDeleteThread(selectedThread.id); setSelectedThreadId(null); } }} className="btn btn-danger text-sm w-full sm:w-auto"><TrashIcon className="w-4 h-4"/> Eliminar</button>
                        )}
                    </div>

                    <p className="mt-6 whitespace-pre-wrap text-[--color-text-primary] break-words">{selectedThread.content}</p>
                </div>
                
                <h3 className="text-2xl font-bold text-[--color-text-primary] mb-4">Respuestas ({threadReplies.length})</h3>
                <div className="space-y-4">
                    {threadReplies.map(reply => {
                        const canDeleteReply = onDeleteReply && (isPreceptor || currentUser.id === reply.authorId);
                        return (
                            <div key={reply.id} className="solid-card p-5">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-[--color-secondary] flex items-center justify-center"><UserIcon className="w-5 h-5 text-[--color-text-secondary]"/></div>
                                        <div>
                                            <p className="font-bold text-[--color-text-primary]">{userMap.get(reply.authorId) || 'Anónimo'}</p>
                                            <p className="text-xs text-[--color-text-secondary]"><TimeAgo date={reply.timestamp} /></p>
                                        </div>
                                    </div>
                                    {canDeleteReply && (
                                        <button onClick={() => window.confirm('¿Seguro que quieres eliminar esta respuesta?') && onDeleteReply(reply.id)} className="text-red-500 hover:bg-red-500/10 p-2 rounded-full"><TrashIcon className="w-4 h-4"/></button>
                                    )}
                                </div>
                                <p className="mt-3 text-[--color-text-secondary] pl-11 break-words">{reply.content}</p>
                            </div>
                        )
                    })}
                </div>

                {selectedThread.isLocked ? (
                     <div className="mt-6 solid-card p-6 text-center text-[--color-text-secondary] flex items-center justify-center gap-3">
                        <LockClosedIcon className="w-6 h-6"/>
                        <p className="font-semibold">Este hilo ha sido bloqueado. No se pueden añadir más respuestas.</p>
                     </div>
                ) : (
                    <form onSubmit={handleNewReplySubmit} className="mt-6 solid-card p-5">
                        <textarea value={newReply} onChange={e => setNewReply(e.target.value)} placeholder="Escribe una respuesta..." rows={4} className="input-styled w-full"/>
                        <div className="flex justify-end mt-4"><button type="submit" className="btn btn-primary"><SendIcon className="w-5 h-5"/> Enviar Respuesta</button></div>
                    </form>
                )}
            </div>
             {isRejectingThread && onUpdateThreadStatus && <RejectionModal threadTitle={isRejectingThread.title} onClose={() => setIsRejectingThread(null)} onConfirm={handleConfirmRejection} />}
        </div>
    );
};