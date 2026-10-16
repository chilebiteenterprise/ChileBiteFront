import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { MessageSquare, Send, MessageCircle, Trash2, Edit3, Check, X, ShieldCheck, CornerUpLeft, Filter, Clock, Users, ThumbsUp, EyeOff, Eye, Ban } from 'lucide-react';
import { useAuth, AuthProvider } from '@/features/auth/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import DOMPurify from 'dompurify';
import { useRateLimit } from '@/hooks/useRateLimit';
import { toast } from "@heroui/react";

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
                <div className="mb-3 p-3.5 premium-glass-panel rounded-xl border border-border-subtle border-l-4 border-l-brand-primary flex items-start justify-between shadow-sm">
                    <div className="flex items-center">
                        <CornerUpLeft size={16} className="mr-2 text-brand-primary" />
                        <span className="text-sm font-medium text-text-muted">
                            Respondiendo a{" "}
                            <span className="font-bold text-text-main">
                            {replyingToComment.usuario_nombre}
                            </span>
                        </span>
                    </div>
                    <button
                        onClick={onCancelReply}
                        className="text-text-subtle hover:text-text-main text-sm font-medium transition-colors ml-4"
                        disabled={isSubmitting}
                    >
                        <X size={14} className="inline-block mr-1" />
                    </button>
                </div>
            )}

            <div className="flex gap-4">
                <div className="flex-shrink-0">
                    {currentUser?.avatar_url || currentUser?.imagen_perfil ? (
                        <img 
                            src={currentUser.avatar_url || currentUser.imagen_perfil} 
                            alt={currentUser?.username || currentUser?.nombres || 'User'} 
                            className="w-11 h-11 rounded-full object-cover shadow-md border-2 border-border-subtle"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://ui-avatars.com/api/?name=" + (currentUser?.username || currentUser?.nombres || 'U').charAt(0) + "&background=random";
                            }}
                        />
                    ) : (
                        <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-md bg-gradient-to-tr from-brand-primary to-brand-hover">
                            {(currentUser?.username || currentUser?.nombres || 'U').charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>
                <div className="flex-1 flex flex-col sm:flex-row gap-3">
                    <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder={isReplying ? "Escribe tu respuesta..." : "Comparte tu opinión sobre esta receta..."}
                        className="flex-1 px-4 py-3 border border-border-subtle rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary resize-none bg-surface-input text-text-main placeholder:text-text-subtle shadow-sm transition-all"
                        rows={isReplying ? 1 : 2}
                        disabled={isSubmitting}
                    />
                    <button
                        onClick={onSubmit}
                        disabled={!isReady || isSubmitting}
                        className="self-end sm:self-auto px-6 py-3 bg-brand-primary text-white rounded-xl font-bold hover:bg-brand-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg shadow-brand-primary/20 transform hover:-translate-y-0.5"
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


function CommentItem({ comment, currentUserId, currentUserRole, onReply, onEdit, onDelete, onToggleVisibility, onBan, replyingTo, newComment, setNewComment, handleSubmitComment, currentUser, onLike, isSubmitting }) {
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
                        <img 
                            src={comment.usuario_avatar} 
                            alt={comment.usuario_nombre || 'User'} 
                            className={`w-11 h-11 rounded-full object-cover shadow-md border-2 ${isAdminComment ? 'border-brand-primary' : 'border-border-subtle'}`}
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://ui-avatars.com/api/?name=" + (comment.usuario_nombre || 'U').charAt(0) + "&background=random";
                            }}
                        />
                    ) : (
                        <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-md ${isAdminComment ? 'bg-gradient-to-tr from-brand-primary to-brand-hover' : 'bg-surface-muted text-text-muted border border-border-subtle'}`}>
                            {comment.usuario_nombre?.charAt(0).toUpperCase() || 'U'}
                        </div>
                    )}
                </div>
                
                <div className="flex-1 min-w-0">
                    <div className={`premium-glass-panel p-4 rounded-2xl shadow-sm border relative overflow-hidden ${isHidden ? 'border-red-500/40 bg-red-500/10 opacity-80' : isAdminComment ? 'border-brand-primary/40 hover:border-brand-primary/60' : 'border-border-subtle hover:border-border-strong'} transition-all`}>
                        {isHidden && (
                            <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] uppercase font-bold px-3 py-1 rounded-bl-xl shadow-sm">
                                Oculto al público
                            </div>
                        )}
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <span className={`font-bold ${isAdminComment ? 'text-brand-primary' : 'text-text-main'} text-sm`}>
                                {comment.usuario_nombre}
                            </span>
                            
                            {isAdminComment && (
                                <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-brand-primary bg-brand-subtle px-2.5 py-0.5 rounded-full border border-brand-primary/25">
                                    <ShieldCheck size={12} /> Admin
                                </span>
                            )}

                            <span className="text-xs text-text-subtle font-medium">· {timeAgo}</span>
                        </div>

                        {isEditing ? (
                            <div className="space-y-2">
                                <textarea
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    className="w-full px-3 py-2 border border-border-subtle rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary resize-none text-text-main bg-surface-input shadow-sm"
                                    rows={2}
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleSaveEdit}
                                        disabled={!editContent.trim()}
                                        className="px-3.5 py-1.5 bg-brand-primary text-white rounded-full text-xs font-bold hover:bg-brand-hover transition-colors flex items-center gap-1 shadow-sm disabled:opacity-50"
                                    >
                                        <Check size={14} /> Guardar
                                    </button>
                                    <button
                                        onClick={() => { setIsEditing(false); setEditContent(comment.texto); }}
                                        className="px-3.5 py-1.5 bg-surface-muted text-text-muted hover:text-text-main hover:bg-surface-elevated rounded-full text-xs font-semibold transition-colors flex items-center gap-1 border border-border-subtle"
                                    >
                                        <X size={14} /> Cancelar
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <p className={`leading-relaxed whitespace-pre-wrap text-sm ${isHidden ? 'text-red-500 italic font-medium' : isAdminComment ? 'text-text-main font-medium' : 'text-text-muted'}`}>
                                    {comment.texto}
                                </p>
                                
                                {/* Actions */}
                                <div className="flex flex-wrap items-center gap-4 mt-3">
                                    <button
                                        onClick={() => {
                                            if (!currentUserId) {
                                                toast.danger("Debes iniciar sesión para dar me gusta");
                                            } else {
                                                onLike(comment.id);
                                            }
                                        }}
                                        className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${comment.userLiked ? 'text-red-500' : 'text-text-subtle hover:text-red-500'}`}
                                    >
                                        <ThumbsUp size={14} className={comment.userLiked ? 'fill-current' : ''} /> 
                                        <span>{comment.likes || 0}</span>
                                    </button>

                                    {currentUserId && (
                                        <button
                                            onClick={() => onReply(comment.id)}
                                            className="flex items-center gap-1.5 text-xs font-semibold text-text-subtle hover:text-brand-primary transition-colors"
                                        >
                                        <MessageCircle size={14} /> Responder
                                        </button>
                                    )}
                                    
                                    {isOwner && (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="flex items-center gap-1.5 text-xs font-semibold text-text-subtle hover:text-brand-primary transition-colors"
                                        >
                                            <Edit3 size={14} /> Editar
                                        </button>
                                    )}
                                    
                                    {canModify && (
                                        <button
                                            onClick={() => onDelete(comment.id)}
                                            className="flex items-center gap-1.5 text-xs font-semibold text-text-subtle md:opacity-0 md:group-hover:opacity-100 hover:text-red-500 transition-all"
                                        >
                                            <Trash2 size={14} /> Eliminar
                                        </button>
                                    )}

                                    {/* Backend Admin Controls */}
                                    {isCurrentUserAdmin && (
                                        <div className="flex items-center gap-2 ml-auto border-l pl-3 border-border-subtle">
                                            <button
                                                onClick={() => onToggleVisibility(comment.id, comment.texto, isHidden ? 'visible' : 'oculto')}
                                                className={`flex items-center p-1.5 rounded-lg transition-colors ${isHidden ? 'text-emerald-500 hover:bg-emerald-500/10' : 'text-amber-500 hover:bg-amber-500/10'}`}
                                                title={isHidden ? "Mostrar comentario" : "Ocultar comentario"}
                                            >
                                                {isHidden ? <Eye size={16} /> : <EyeOff size={16} />}
                                            </button>
                                            {!isAdminComment && (
                                                <button
                                                    onClick={() => onBan(comment.user_id)}
                                                    className="flex items-center p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
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
                            isSubmitting={isSubmitting} 
                        />
                    )}

                    {replies.length > 0 && (
                        <div className="mt-4 space-y-4 pl-8 relative before:absolute before:inset-y-0 before:left-4 before:w-px before:bg-gradient-to-b before:from-border-subtle before:to-transparent">
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
                                    isSubmitting={isSubmitting}
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
    
    // Anti-Spam Rate Limiting
    const { isRateLimited, executeWithLimit } = useRateLimit(3000);
    
    const topCommentInputRef = useRef(null); 
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

    const loadComments = useCallback(async (silent = false) => {
        if (!silent) setIsLoading(true);
        try {
            const { data: commentsData, error: commentsErr } = await supabase
                .from('core_comentarioreceta')
                .select('*')
                .eq('receta_id', recipeId);
                
            if (commentsErr) throw new Error(commentsErr.message);

            const data = commentsData || [];
            
            // Enrich with Supabase profiles and likes
            const currentUserUUID = currentUser?.id;
            let userLikesMap = {};
            
            if (currentUserUUID && data.length > 0) {
               const { data: likesData } = await supabase.from('core_comentariolike').select('comentario_id').eq('user_id', currentUserUUID);
               if (likesData) {
                   likesData.forEach(l => { userLikesMap[l.comentario_id] = true });
               }
            }

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
                    comentario_padre: c.comentario_padre_id, // Map standard db back to component logic
                    usuario_nombre: profile.username || 'Usuario',
                    usuario_avatar: profile.avatar_url || null,
                    rol: profile.role || 'normal', 
                    likes: c.contador_likes !== undefined ? c.contador_likes : 0, 
                    userLiked: userLikesMap[c.id] || false
                };
            });

            setComments(processedData);
        } catch (err) {
            console.error("Error loading comments:", err);
            toast.danger("Error al cargar los comentarios.");
        } finally {
            setIsLoading(false);
        }
    }, [recipeId, currentUser?.id]); 

    useEffect(() => {
        loadComments();
    }, [loadComments]);

    const handleLikeComment = async (commentId) => {
        if (!currentUser?.id) {
            toast.danger("Debes iniciar sesión para dar me gusta");
            return;
        }

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
            if (isLiking) {
                const { error } = await supabase.from('core_comentariolike').insert([{ user_id: currentUser.id, comentario_id: commentId }]);
                if (error) throw new Error(error.message);
            } else {
                const { error } = await supabase.from('core_comentariolike').delete().eq('user_id', currentUser.id).eq('comentario_id', commentId);
                if (error) throw new Error(error.message);
            }
        } catch (err) {
            console.error("Error al dar like:", err);
            setComments(prevComments => 
                prevComments.map(c => c.id === commentId ? originalComment : c)
            );
            toast.danger("Error al registrar me gusta");
        }
    }

    const handleSubmitComment = () => {
        if (!newComment.trim()) return;
        
        if (!currentUser?.id) {
            toast.danger("Debes iniciar sesión para comentar");
            return;
        }

        executeWithLimit(async () => {
            // Resolve parent comment root for single level nesting view
            let finalParent = replyingTo;
            if (replyingTo) {
                const parentComment = comments.find(c => c.id === replyingTo);
                if (parentComment && (parentComment.comentario_padre || parentComment.comentario_padre_id)) {
                    finalParent = parentComment.comentario_padre || parentComment.comentario_padre_id; // Attach to root
                }
            }

            const rawText = finalParent !== replyingTo && replyingTo ? `@${comments.find(c=>c.id===replyingTo)?.usuario_nombre} ${newComment.trim()}` : newComment.trim();

            const payload = {
                receta_id: recipeId,
                user_id: currentUser.id,
                texto: DOMPurify.sanitize(rawText),
                comentario_padre_id: finalParent || null,
                estado: 'visible',
                fecha_creacion: new Date().toISOString(),
                contador_likes: 0
            };
            
            setIsSubmitting(true);

            try {
                const { error } = await supabase.from('core_comentarioreceta').insert([payload]);

                if (error) throw new Error(error.message);

                toast.success("Comentario publicado!"); 
                setNewComment('');
                setReplyingTo(null);
                loadComments(true); 
                setVisibleCommentCount(INITIAL_LOAD); 
            } catch (err) {
                console.error(err);
                toast.danger("No se pudo publicar el comentario");
            } finally {
                setIsSubmitting(false); 
            }
        });
    };

    const handleEditComment = async (commentId, newContent, estadoStr = 'visible') => {
        if (!currentUser?.id) return;
        try {
            const { error } = await supabase
                .from('core_comentarioreceta')
                .update({ texto: DOMPurify.sanitize(newContent), estado: estadoStr })
                .eq('id', commentId);

            if (error) throw new Error(error.message);
            toast.success("Comentario actualizado");
            loadComments(true);
        } catch (err) {
            console.error(err);
            toast.danger("No se pudo editar el comentario");
        }
    };

    const handleToggleVisibility = async (commentId, content, newEstado) => {
        await handleEditComment(commentId, content, newEstado);
    };

    const confirmDelete = async (commentId) => {
        if (!currentUser?.id) return;
        
        try {
            await supabase.from('core_comentariolike').delete().eq('comentario_id', commentId);
            const { error } = await supabase
                .from('core_comentarioreceta')
                .delete()
                .eq('id', commentId);
                
            if (error) throw new Error(error.message);
            toast.success("Comentario eliminado");
            loadComments(true);
        } catch (err) {
            console.error(err);
            toast.danger("No se pudo eliminar el comentario");
        } finally {
            setShowDeleteModal(null);
        }
    };

    const handleBanSubmit = async () => {
        const token = getToken();
        if (!token || !banModalData) return;
        
        try {
            const res = await fetch(`${apiUrl}/api/ban/`, {
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
            toast.danger("No se pudo banear al usuario.");
        } finally {
            setBanModalData(null);
            setBanReason('');
        }
    }
    
    const handleReply = (parentId) => {
        if (!currentUser) {
            toast.danger("Debes iniciar sesión para responder");
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
            <div className="premium-glass-wrapper rounded-[2.5rem] border border-border-subtle p-6 md:p-8 shadow-xl">
                
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-brand-subtle rounded-xl text-brand-primary">
                            <MessageSquare size={24} />
                        </div>
                        <h2 className="text-2xl font-serif font-black text-text-main tracking-tight flex items-center gap-2">
                            Comentarios de la Comunidad{" "}
                            <span className="text-lg font-sans font-medium text-text-muted">
                                ({comments.length})
                            </span>
                        </h2>
                    </div>

                    {organizedComments.length > 0 && (
                        <div className="flex items-center gap-1.5 bg-surface-muted/60 p-1.5 rounded-full border border-border-subtle backdrop-blur-md">
                            <button
                                onClick={() => setSortType('recent')}
                                className={`flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full transition-all ${sortType === 'recent' 
                                    ? 'bg-surface-card text-brand-primary font-bold shadow-sm' 
                                    : 'text-text-muted hover:text-text-main'}`}
                            >
                                <Clock size={14} /> Recientes
                            </button>
                            <button
                                onClick={() => setSortType('popularity')}
                                className={`flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full transition-all ${sortType === 'popularity' 
                                    ? 'bg-surface-card text-brand-primary font-bold shadow-sm' 
                                    : 'text-text-muted hover:text-text-main'}`}
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
                        isSubmitting={isSubmitting || isRateLimited}
                    />
                )}
                
                {!currentUser && (
                    <div className="mb-8 p-6 premium-glass-panel rounded-2xl border border-border-subtle text-center relative overflow-hidden group shadow-sm">
                        <div className="absolute inset-0 bg-gradient-to-r from-brand-subtle/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <p className="text-text-muted font-medium relative z-10 flex items-center justify-center gap-2">
                        <ShieldCheck className="text-brand-primary" /> Inicia sesión para interactuar con la comunidad.
                        </p>
                    </div>
                )}

                {isLoading ? (
                    <div className="text-center py-16">
                        <div className="inline-block animate-spin rounded-full h-10 w-10 border-3 border-border-subtle border-t-brand-primary"></div>
                        <p className="mt-4 text-text-muted font-medium animate-pulse">Cargando experiencias...</p>
                    </div>
                ) : organizedComments.length === 0 ? (
                    <div className="text-center py-16 px-4 border border-dashed border-border-subtle rounded-3xl bg-surface-muted/20">
                        <MessageCircle className="mx-auto text-text-subtle mb-4" size={48} strokeWidth={1.5} />
                        <h3 className="text-text-main text-lg font-bold">Sé el primero en comentar</h3>
                        <p className="text-text-muted text-sm mt-2 max-w-sm mx-auto">
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
                                isSubmitting={isSubmitting || isRateLimited}
                            />
                        ))}
                        
                        {showLoadMoreButton && (
                            <div className="text-center pt-8 pb-4">
                                <button
                                    onClick={handleLoadMore}
                                    className="px-8 py-3 bg-surface-muted text-text-muted hover:text-text-main hover:bg-surface-elevated font-semibold rounded-full border border-border-subtle transition-all shadow-sm hover:shadow-md active:scale-95"
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
                    <div className="bg-surface-elevated rounded-[2rem] p-8 shadow-2xl max-w-sm w-full border border-border-subtle">
                        <h3 className="text-xl font-bold text-text-main mb-2">¿Eliminar Comentario?</h3>
                        <p className="text-text-muted mb-8 text-sm leading-relaxed">
                            Esta acción no se puede deshacer y también eliminará sus respuestas.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowDeleteModal(null)}
                                className="px-5 py-2.5 bg-surface-muted text-text-muted hover:text-text-main hover:bg-surface-elevated rounded-xl font-semibold transition-colors border border-border-subtle"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => confirmDelete(showDeleteModal)}
                                className="px-5 py-2.5 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors shadow-md shadow-red-500/20"
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
                    <div className="bg-surface-elevated rounded-[2rem] p-8 shadow-2xl max-w-sm w-full border border-border-subtle">
                        <h3 className="text-xl font-bold text-red-500 mb-2 flex items-center gap-2">
                            <Ban size={22} /> Suspender Usuario
                        </h3>
                        <p className="text-sm text-text-muted mb-6 leading-relaxed">
                            Ingresa el motivo del bloqueo. Este mensaje llegará al correo del usuario.
                        </p>
                        
                        <div className="space-y-5 mb-8">
                            <div>
                                <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wide">Razón</label>
                                <input 
                                    type="text"
                                    placeholder="Ej. Incumplió reglas comunitarias..."
                                    value={banReason}
                                    onChange={(e) => setBanReason(e.target.value)}
                                    className="w-full px-4 py-3 bg-surface-input text-text-main border border-border-subtle rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all placeholder:text-text-subtle"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wide">Días de bloqueo</label>
                                <input 
                                    type="number"
                                    value={banDays}
                                    onChange={(e) => setBanDays(Number(e.target.value))}
                                    min={1}
                                    className="w-full px-4 py-3 bg-surface-input text-text-main border border-border-subtle rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => { setBanModalData(null); setBanReason(''); }}
                                className="px-5 py-2.5 bg-surface-muted text-text-muted hover:text-text-main hover:bg-surface-elevated rounded-xl font-semibold transition-colors border border-border-subtle"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleBanSubmit}
                                disabled={!banReason.trim() || banDays < 1}
                                className="px-5 py-2.5 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors shadow-md shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
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
