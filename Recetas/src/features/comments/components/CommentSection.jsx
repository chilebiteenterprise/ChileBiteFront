import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { MessageSquare, Send, MessageCircle, Trash2, Edit3, Check, X, ShieldCheck, CornerUpLeft, Filter, Clock, Users, ThumbsUp, EyeOff, Eye, Ban } from 'lucide-react';
import { toast } from "@heroui/react";
import { useAuth, AuthProvider } from '@/features/auth/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';

function getTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    const intervals = [
        { label: "año", seconds: 31536000 },
        { label: "mes", seconds: 2592000 },
        { label: "semana", seconds: 604800 },
        { label: "día", seconds: 86400 },
        { label: "hora", seconds: 3600 },
        { label: "minuto", seconds: 60 },
    ];
    for (const interval of intervals) {
        const count = Math.floor(seconds / interval.seconds);
        if (count >= 1) return `hace ${count} ${interval.label}${count > 1 ? "s" : ""}`;
    }
    return "ahora mismo";
}

// Flat structure but 1 level deep
const buildFlatCommentTree = (comments) => {
    const rootComments = comments.filter(c => !c.comentario_padre);
    const repliesMap = {};
    
    // Agrupar respuestas por papa
    comments.filter(c => c.comentario_padre).forEach(reply => {
        if (!repliesMap[reply.comentario_padre]) {
            repliesMap[reply.comentario_padre] = [];
        }
        repliesMap[reply.comentario_padre].push(reply);
    });

    return rootComments.map(comment => ({
        ...comment,
        replies: repliesMap[comment.id] || []
    }));
};

const CommentForm = ({ 
    commentText, 
    setCommentText, 
    onSubmit, 
    onCancelReply, 
    replyingToComment,
    currentUser,
    inputRef,
    isSubmitting
}) => {
    const isReplying = replyingToComment !== null;
    const isReady = commentText.trim().length > 0;
    
    useEffect(() => {
        if (inputRef && inputRef.current && isReplying) {
            inputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' }); 
            const textarea = inputRef.current.querySelector('textarea');
            if(textarea) textarea.focus();
        }
    }, [inputRef, isReplying]);

    return (
        <div className={`mt-4 ${isReplying ? 'ml-0' : 'mb-8'}`} ref={inputRef}>
            {isReplying && (
                <div className="mb-3 p-3 premium-glass-panel border-l-4 border-l-primary-500 flex items-start justify-between">
                    <div className="flex items-center">
                        <CornerUpLeft size={16} className="mr-2 text-primary-500" />
                        <span className="text-sm font-medium text-foreground-700">
                            Respondiendo a{" "}
                            <span className="font-bold text-foreground-900">
                            {replyingToComment.usuario_nombre}
                            </span>
                        </span>
                    </div>
                    <button
                        onClick={onCancelReply}
                        className="text-foreground-500 hover:text-foreground-700 text-sm font-medium transition-colors ml-4"
                        disabled={isSubmitting}
                    >
                        <X size={14} className="inline-block mr-1" />
                    </button>
                </div>
            )}

            <div className="flex gap-4">
                <div className="flex-shrink-0">
                    {currentUser?.avatar_url || currentUser?.imagen_perfil ? (
                        <img src={currentUser.avatar_url || currentUser.imagen_perfil} alt={currentUser?.username || currentUser?.nombres || 'User'} className="w-11 h-11 rounded-full object-cover shadow-md border-2 border-primary-200" />
                    ) : (
                        <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-md bg-gradient-to-tr from-primary-600 to-primary-400">
                            {(currentUser?.username || currentUser?.nombres || 'U').charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>
                <div className="flex-1 flex flex-col sm:flex-row gap-3">
                    <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder={isReplying ? "Escribe tu respuesta..." : "Comparte tu opinión sobre esta receta..."}
                        className="flex-1 px-4 py-3 border border-default-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none bg-default-50/50 backdrop-blur-md text-foreground placeholder-default-400 shadow-inner transition-shadow"
                        rows={isReplying ? 1 : 2}
                        disabled={isSubmitting}
                    />
                    <button
                        onClick={onSubmit}
                        disabled={!isReady || isSubmitting}
                        className="self-end sm:self-auto px-6 py-3 bg-blue-600 text-[#ffffff] rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                Publicando...
                            </>
                        ) : (
                            <>
                                <Send size={18} /> Publicar
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};


function CommentItem({ comment, currentUserId, currentUserRole, onReply, onEdit, onDelete, onToggleVisibility, onBan, replyingTo, newComment, setNewComment, handleSubmitComment, currentUser, onLike }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(comment.texto);

    const replyInputRef = useRef(null); 
    const isOwner = currentUserId === comment.user_id;
    const isCurrentUserAdmin = currentUserRole === 'admin'; 
    const canModify = isOwner || isCurrentUserAdmin; 
    const timeAgo = getTimeAgo(comment.fecha_creacion);
    const replies = comment.replies || []; 
    
    const isAdminComment = comment.rol === 'admin'; 
    const isHidden = comment.estado === 'oculto';
    const isCurrentReplyTarget = currentUserId && comment.id === replyingTo; 

    const handleSaveEdit = () => {
        if (editContent.trim() && editContent !== comment.texto) {
            onEdit(comment.id, editContent.trim(), comment.estado);
        }
        setIsEditing(false);
    };
    
    const handleCancelReply = () => {
        onReply(null);
        setNewComment('');
    };

    return (
        <div className="group animate-in fade-in duration-300">
            <div className="flex gap-4">
                <div className="flex-shrink-0">
                    {comment.usuario_avatar ? (
                        <img src={comment.usuario_avatar} alt={comment.usuario_nombre || 'User'} className={`w-11 h-11 rounded-full object-cover shadow-xl border-2 ${isAdminComment ? 'border-sky-400' : 'border-default-200'}`} />
                    ) : (
                        <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-xl ${isAdminComment ? 'bg-gradient-to-tr from-sky-600 to-sky-400' : 'bg-gradient-to-tr from-default-600 to-default-400'}`}>
                            {comment.usuario_nombre?.charAt(0).toUpperCase() || 'U'}
                        </div>
                    )}
                </div>
                
                <div className="flex-1 min-w-0">
                    <div className={`premium-glass-panel p-4 rounded-xl shadow-sm border relative overflow-hidden ${isHidden ? 'border-red-300 dark:border-red-800 bg-red-50/50 dark:bg-red-900/20 opacity-80' : isAdminComment ? 'border-sky-200/50 hover:border-sky-300' : 'border-default-200/50 hover:border-default-300'} transition-all`}>
                        {isHidden && (
                            <div className="absolute top-0 right-0 bg-red-600 text-[#ffffff] text-[10px] uppercase font-bold px-3 py-1 rounded-bl-xl shadow-sm">
                                Oculto al público
                            </div>
                        )}
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <span className={`font-bold ${isAdminComment ? 'text-sky-800 dark:text-sky-400' : 'text-foreground-900'} text-sm`}>
                                {comment.usuario_nombre}
                            </span>
                            
                            {isAdminComment && (
                                <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full border border-sky-200">
                                    <ShieldCheck size={12} /> Admin
                                </span>
                            )}

                            <span className="text-xs text-default-500">· {timeAgo}</span>
                        </div>

                        {isEditing ? (
                            <div className="space-y-2">
                                <textarea
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    className="w-full px-3 py-2 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none text-foreground bg-white/50 backdrop-blur shadow-inner"
                                    rows={2}
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleSaveEdit}
                                        disabled={!editContent.trim()}
                                        className="px-3 py-1 bg-blue-600 text-[#ffffff] rounded-full text-xs font-medium hover:bg-blue-700 transition-colors flex items-center gap-1 disabled:opacity-50"
                                    >
                                        <Check size={14} /> Guardar
                                    </button>
                                    <button
                                        onClick={() => { setIsEditing(false); setEditContent(comment.texto); }}
                                        className="px-3 py-1 bg-default-200 text-default-800 rounded-full text-xs font-medium hover:bg-default-300 transition-colors flex items-center gap-1"
                                    >
                                        <X size={14} /> Cancelar
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <p className={`leading-relaxed whitespace-pre-wrap text-sm ${isHidden ? 'text-danger-900 dark:text-danger-100 italic font-medium' : isAdminComment ? 'text-foreground-800' : 'text-foreground-600'}`}>
                                    {comment.texto}
                                </p>
                                
                                {/* Actions */}
                                <div className="flex flex-wrap items-center gap-4 mt-3">
                                    <button
                                        onClick={() => {
                                            if (!currentUserId) {
                                                toast.error("Debes iniciar sesión para dar me gusta");
                                            } else {
                                                onLike(comment.id);
                                            }
                                        }}
                                        className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${comment.userLiked ? 'text-danger-500' : 'text-default-400 hover:text-danger-500'}`}
                                    >
                                        <ThumbsUp size={14} className={comment.userLiked ? 'fill-current' : ''} /> 
                                        <span>{comment.likes || 0}</span>
                                    </button>

                                    {currentUserId && (
                                        <button
                                            onClick={() => onReply(comment.id)}
                                            className="flex items-center gap-1.5 text-xs font-medium text-default-400 hover:text-primary-500 transition-colors"
                                        >
                                        <MessageCircle size={14} /> Responder
                                        </button>
                                    )}
                                    
                                    {isOwner && (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="flex items-center gap-1.5 text-xs font-medium text-default-400 hover:text-primary-500 transition-colors"
                                        >
                                            <Edit3 size={14} /> Editar
                                        </button>
                                    )}
                                    
                                    {canModify && (
                                        <button
                                            onClick={() => onDelete(comment.id)}
                                            className="flex items-center gap-1.5 text-xs font-medium text-default-400 md:opacity-0 md:group-hover:opacity-100 hover:text-danger-500 transition-all"
                                        >
                                            <Trash2 size={14} /> Eliminar
                                        </button>
                                    )}

                                    {/* Backend Admin Controls */}
                                    {isCurrentUserAdmin && (
                                        <div className="flex items-center gap-2 ml-auto border-l pl-3 border-default-200">
                                            <button
                                                onClick={() => onToggleVisibility(comment.id, comment.texto, isHidden ? 'visible' : 'oculto')}
                                                className={`flex items-center p-1.5 rounded-md transition-colors ${isHidden ? 'text-success-600 hover:bg-success-50' : 'text-warning-600 hover:bg-warning-50'}`}
                                                title={isHidden ? "Mostrar comentario" : "Ocultar comentario"}
                                            >
                                                {isHidden ? <Eye size={16} /> : <EyeOff size={16} />}
                                            </button>
                                            {!isAdminComment && (
                                                <button
                                                    onClick={() => onBan(comment.user_id)}
                                                    className="flex items-center p-1.5 rounded-md text-red-600 hover:bg-red-50 transition-colors"
                                                    title="Banear usuario"
                                                >
                                                    <Ban size={16} />
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                        
                    {isCurrentReplyTarget && (
                        <CommentForm
                            commentText={newComment}
                            setCommentText={setNewComment}
                            onSubmit={handleSubmitComment}
                            onCancelReply={handleCancelReply}
                            replyingToComment={comment}
                            currentUser={currentUser}
                            inputRef={replyInputRef}
                            isSubmitting={false} 
                        />
                    )}

                    {replies.length > 0 && (
                        <div className="mt-4 space-y-4 pl-8 relative before:absolute before:inset-y-0 before:left-4 before:w-px before:bg-gradient-to-b before:from-default-200 before:to-transparent">
                            {replies.map((reply) => (
                                <CommentItem
                                    key={reply.id}
                                    comment={reply}
                                    currentUserId={currentUserId}
                                    currentUserRole={currentUserRole}
                                    onReply={onReply}
                                    onEdit={onEdit}
                                    onDelete={onDelete}
                                    onToggleVisibility={onToggleVisibility}
                                    onBan={onBan}
                                    onLike={onLike}
                                    replyingTo={replyingTo}
                                    newComment={newComment}
                                    setNewComment={setNewComment}
                                    handleSubmitComment={handleSubmitComment}
                                    currentUser={currentUser}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

const INITIAL_LOAD = 5;
const LOAD_STEP = 5; 

function CommentSectionContent({ recipeId }) {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(null); 
    const [banModalData, setBanModalData] = useState(null); // { userId }
    const [banReason, setBanReason] = useState('');
    const [banDays, setBanDays] = useState(7);
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [visibleCommentCount, setVisibleCommentCount] = useState(INITIAL_LOAD); 
    const [sortType, setSortType] = useState('recent'); 
    
    const topCommentInputRef = useRef(null); 
    const API_BASE = `/api/recetas/${recipeId}/comments/`;

    const { session, profile } = useAuth();
    const getToken = () => session?.access_token || localStorage.getItem("access_token");
    
    const handleLoadMore = () => {
        setVisibleCommentCount(prevCount => prevCount + LOAD_STEP);
    };

    useEffect(() => {
        if (profile) {
            setCurrentUser({
                ...profile,
                id: profile.id,
                nombres: profile.username || profile.nombres,
                rol: (String(profile.role).toLowerCase() === 'admin' || String(profile.rol).toLowerCase() === 'admin') ? 'admin' : 'normal'
            });
        } else {
            setCurrentUser(null);
        }
    }, [profile]);

    const localAuthToken = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    const token = session?.access_token || localAuthToken;

    const loadComments = useCallback(async () => {
        setIsLoading(true);
        try {
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const res = await fetch(API_BASE, { headers });
            if (!res.ok) throw new Error("Error al cargar comentarios");
            const data = await res.json();
            
            // Enrich with Supabase profiles
            const userIds = [...new Set(data.map(c => c.user_id))].filter(Boolean);
            let profilesMap = {};
            if (userIds.length > 0) {
                const { data: profilesData } = await supabase
                    .from('profiles')
                    .select('id, username, avatar_url, role')
                    .in('id', userIds);
                if (profilesData) {
                    profilesData.forEach(p => { profilesMap[p.id] = p; });
                }
            }

            const processedData = data.map(c => {
                const profile = profilesMap[c.user_id] || {};
                return {
                    ...c,
                    usuario_nombre: profile.username || 'Usuario',
                    usuario_avatar: profile.avatar_url || null,
                    rol: profile.role || 'normal', 
                    likes: c.contador_likes !== undefined ? c.contador_likes : 0, 
                    userLiked: c.usuario_le_dio_like || false
                };
            });

            setComments(processedData);
        } catch (err) {
            console.error("Error loading comments:", err);
            toast.error("Error al cargar los comentarios.");
        } finally {
            setIsLoading(false);
        }
    }, [recipeId, token]); 

    useEffect(() => {
        loadComments();
    }, [loadComments]);

    const handleLikeComment = async (commentId) => {
        if (!currentUser) {
            toast.error("Debes iniciar sesión para dar me gusta");
            return;
        }
        const token = getToken();
        if (!token) return;

        const originalComment = comments.find(c => c.id === commentId);
        if (!originalComment) return;

        const isLiking = !originalComment.userLiked;
        
        setComments(prevComments => 
            prevComments.map(c => {
                if (c.id === commentId) {
                    return {
                        ...c,
                        userLiked: isLiking,
                        likes: isLiking ? c.likes + 1 : c.likes - 1
                    };
                }
                return c;
            })
        );

        try {
            const res = await fetch(`/api/comments/${commentId}/like/`, {
                method: 'POST', 
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!res.ok) throw new Error("Fallo al alternar el like.");
        } catch (err) {
            console.error("Error al dar like:", err);
            setComments(prevComments => 
                prevComments.map(c => c.id === commentId ? originalComment : c)
            );
            toast.error("Error al registrar me gusta");
        }
    }

    const handleSubmitComment = async () => {
        if (!newComment.trim()) return;
        
        if (!currentUser) {
            toast.error("Debes iniciar sesión para comentar");
            return;
        }

        const token = getToken(); 
        if (!token) return;

        // Resolve parent comment root for single level nesting view
        let finalParent = replyingTo;
        if (replyingTo) {
            const parentComment = comments.find(c => c.id === replyingTo);
            if (parentComment && parentComment.comentario_padre) {
                finalParent = parentComment.comentario_padre; // Attach to root
            }
        }

        const payload = {
            texto: finalParent !== replyingTo && replyingTo ? `@${comments.find(c=>c.id===replyingTo)?.usuario_nombre} ${newComment.trim()}` : newComment.trim(),
            comentario_padre: finalParent, 
        };
        
        setIsSubmitting(true);

        try {
            const res = await fetch(API_BASE, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (res.status === 403) {
                toast.error("Tu cuenta ha sido suspendida para comentar.");
                return;
            }

            if (!res.ok) throw new Error("Error creando comentario");

            toast.success("Comentario publicado!"); 
            setNewComment('');
            setReplyingTo(null);
            loadComments(); 
            setVisibleCommentCount(INITIAL_LOAD); 

        } catch (err) {
            console.error(err);
            toast.error("No se pudo publicar el comentario");
        } finally {
            setIsSubmitting(false); 
        }
    };

    const handleEditComment = async (commentId, newContent, estadoStr = 'visible') => {
        const token = getToken(); 
        if (!token) return;

        try {
            const res = await fetch(`/api/comments/${commentId}/`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ texto: newContent, estado: estadoStr }),
            });
            if (!res.ok) throw new Error("Error editando comentario");
            toast.success("Comentario actualizado");
            loadComments();
        } catch (err) {
            console.error(err);
            toast.error("No se pudo editar el comentario");
        }
    };

    const handleToggleVisibility = async (commentId, content, newEstado) => {
        await handleEditComment(commentId, content, newEstado);
    };

    const confirmDelete = async (commentId) => {
        const token = getToken(); 
        if (!token) return;
        
        try {
            const res = await fetch(`/api/comments/${commentId}/`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Error eliminando comentario");
            toast.success("Comentario eliminado");
            loadComments();
        } catch (err) {
            console.error(err);
            toast.error("No se pudo eliminar el comentario");
        } finally {
            setShowDeleteModal(null);
        }
    };

    const handleBanSubmit = async () => {
        const token = getToken();
        if (!token || !banModalData) return;
        
        try {
            const res = await fetch(`/api/ban/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    user_id: banModalData.userId,
                    razon: banReason,
                    duracion_dias: banDays
                }),
            });
            if (!res.ok) throw new Error("Error baneando al usuario");
            toast.success("Usuario baneado con éxito. Se le notificará por email.");
        } catch (err) {
            toast.error("No se pudo banear al usuario.");
        } finally {
            setBanModalData(null);
            setBanReason('');
        }
    }
    
    const handleReply = (parentId) => {
        if (!currentUser) {
            toast.error("Debes iniciar sesión para responder");
            return;
        }

        setReplyingTo(parentId);
        if (parentId === null) {
            setNewComment('');
            if (topCommentInputRef.current) {
                topCommentInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        } else {
            setNewComment(""); 
        }
    };

    const sortedComments = useMemo(() => {
        let sorted = [...comments];
        if (sortType === 'recent') {
            sorted.sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion));
        } else if (sortType === 'popularity') {
            sorted.sort((a, b) => (b.likes || 0) - (a.likes || 0));
        }
        return sorted;
    }, [comments, sortType]);

    // Usar Single Level Nesting
    const organizedComments = buildFlatCommentTree(sortedComments); 
    
    const visibleComments = organizedComments.slice(0, visibleCommentCount);
    const showLoadMoreButton = visibleCommentCount < organizedComments.length;
    
    const isTopLevelComment = currentUser && replyingTo === null;

    return (
        <div className='max-w-8xl mx-auto w-full font-[Inter]' >
            <div className="premium-glass-wrapper rounded-[2.5rem] border border-slate-200 dark:border-zinc-800 p-6 md:p-8 shadow-xl">
                
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-primary-100 rounded-xl text-primary-600">
                            <MessageSquare size={24} />
                        </div>
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-foreground-900 to-foreground-600 bg-clip-text text-transparent">
                            CommentSection{" "}
                            <span className="text-xl font-medium text-foreground-400">
                                ({comments.length})
                            </span>
                        </h2>
                    </div>

                    {organizedComments.length > 0 && (
                        <div className="flex items-center gap-2 bg-default-100/50 p-1.5 rounded-full border border-default-200 backdrop-blur-md">
                            <button
                                onClick={() => setSortType('recent')}
                                className={`flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full transition-all ${sortType === 'recent' 
                                    ? 'bg-white dark:bg-zinc-800 text-primary-600 dark:text-primary-400 shadow-sm' 
                                    : 'text-default-500 hover:text-foreground'}`}
                            >
                                <Clock size={14} /> Recientes
                            </button>
                            <button
                                onClick={() => setSortType('popularity')}
                                className={`flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full transition-all ${sortType === 'popularity' 
                                    ? 'bg-white dark:bg-zinc-800 text-primary-600 dark:text-primary-400 shadow-sm' 
                                    : 'text-default-500 hover:text-foreground'}`}
                            >
                                <Users size={14} /> Populares
                            </button>
                        </div>
                    )}
                </div>

                {isTopLevelComment && (
                    <CommentForm
                        commentText={newComment}
                        setCommentText={setNewComment}
                        onSubmit={handleSubmitComment}
                        onCancelReply={() => {}}
                        replyingToComment={null}
                        currentUser={currentUser}
                        inputRef={topCommentInputRef}
                        isSubmitting={isSubmitting}
                    />
                )}
                
                {!currentUser && (
                    <div className="mb-8 p-6 premium-glass-panel border border-primary-100 text-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <p className="text-foreground-700 font-medium relative z-10 flex items-center justify-center gap-2">
                        <ShieldCheck className="text-primary-500" /> Inicia sesión para interactuar con la comunidad.
                        </p>
                    </div>
                )}

                {isLoading ? (
                    <div className="text-center py-16">
                        <div className="inline-block animate-spin rounded-full h-10 w-10 border-3 border-default-200 border-t-primary-600"></div>
                        <p className="mt-4 text-default-500 font-medium animate-pulse">Cargando experiencias...</p>
                    </div>
                ) : organizedComments.length === 0 ? (
                    <div className="text-center py-16 px-4 border border-dashed border-default-300 rounded-3xl bg-default-50/30">
                        <MessageCircle className="mx-auto text-default-300 mb-4" size={48} strokeWidth={1.5} />
                        <h3 className="text-foreground-800 text-lg font-bold">Sé el primero en comentar</h3>
                        <p className="text-default-500 text-sm mt-2 max-w-sm mx-auto">
                            ¿Qué te pareció esta receta? ¿Tienes algún consejo o modificación? ¡Compártelo!
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {visibleComments.map((comment) => (
                            <CommentItem
                                key={comment.id}
                                comment={comment}
                                currentUserId={currentUser?.id || null}
                                currentUserRole={currentUser?.role?.toLowerCase() || currentUser?.rol?.toLowerCase() || 'normal'}
                                onReply={handleReply}
                                onEdit={handleEditComment}
                                onDelete={setShowDeleteModal}
                                onToggleVisibility={handleToggleVisibility}
                                onBan={(userId) => setBanModalData({ userId })}
                                onLike={handleLikeComment}
                                replyingTo={replyingTo}
                                newComment={newComment}
                                setNewComment={setNewComment}
                                handleSubmitComment={handleSubmitComment}
                                currentUser={currentUser}
                            />
                        ))}
                        
                        {showLoadMoreButton && (
                            <div className="text-center pt-8 pb-4">
                                <button
                                    onClick={handleLoadMore}
                                    className="px-8 py-3 bg-default-100 text-foreground-700 font-semibold rounded-full hover:bg-default-200 transition-all shadow-sm hover:shadow-md active:scale-95"
                                >
                                    Mostrar más comentarios ({organizedComments.length - visibleCommentCount})
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modal Confirmación Borrar */}
            {showDeleteModal !== null && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-zinc-900 rounded-[2rem] p-8 shadow-[0_0_50px_rgba(0,0,0,0.3)] max-w-sm w-full border border-danger-200 dark:border-danger-900/50">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-zinc-100 mb-2">¿Eliminar Comentario?</h3>
                        <p className="text-slate-600 dark:text-zinc-400 mb-8 text-sm leading-relaxed">
                            Esta acción no se puede deshacer y también eliminará sus respuestas.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowDeleteModal(null)}
                                className="px-5 py-2.5 bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => confirmDelete(showDeleteModal)}
                                className="px-5 py-2.5 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors shadow-lg shadow-red-500/30"
                            >
                                Sí, eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Banear Usuario */}
            {banModalData !== null && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-zinc-900 rounded-[2rem] p-8 shadow-[0_0_50px_rgba(0,0,0,0.3)] max-w-sm w-full border border-danger-300 dark:border-danger-900/50">
                        <h3 className="text-xl font-bold text-danger-600 dark:text-danger-500 mb-2 flex items-center gap-2">
                            <Ban size={22} /> Suspender Usuario
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-zinc-400 mb-6 leading-relaxed">
                            Ingresa el motivo del bloqueo. Este mensaje llegará al correo del usuario.
                        </p>
                        
                        <div className="space-y-5 mb-8">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5 uppercase tracking-wide">Razón</label>
                                <input 
                                    type="text"
                                    placeholder="Ej. Incumplió reglas comunitarias..."
                                    value={banReason}
                                    onChange={(e) => setBanReason(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-100 border border-slate-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-danger-500/50 focus:border-danger-500 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-600"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5 uppercase tracking-wide">Días de bloqueo</label>
                                <input 
                                    type="number"
                                    value={banDays}
                                    onChange={(e) => setBanDays(Number(e.target.value))}
                                    min={1}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-100 border border-slate-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-danger-500/50 focus:border-danger-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => { setBanModalData(null); setBanReason(''); }}
                                className="px-5 py-2.5 bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleBanSubmit}
                                disabled={!banReason.trim() || banDays < 1}
                                className="px-5 py-2.5 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors shadow-lg shadow-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Aplicar Sanción
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

export default function CommentSection(props) {
    return (
        <AuthProvider>
            <CommentSectionContent {...props} />
        </AuthProvider>
    );
}
