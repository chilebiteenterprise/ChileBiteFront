import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { MessageSquare, Send, MessageCircle, Trash2, Edit3, Check, X, ShieldCheck, CornerUpLeft, Filter, Clock, Users, ThumbsUp } from 'lucide-react';


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

const buildCommentTree = (comments, parentId = null) => {
    return comments
        .filter((c) => c.comentario_padre === parentId)
        .map((comment) => ({
            ...comment,
            replies: buildCommentTree(comments, comment.id),
        }));
};

const CommentForm = ({ 
    commentText, 
    setCommentText, 
    onSubmit, 
    onCancelReply, 
    replyingToComment,
    currentUser,
    primaryColor, 
    secondaryColor,
    inputRef,
    isSubmitting
}) => {
    const isReplying = replyingToComment !== null;
    const isReady = commentText.trim().length > 0;
    
    // Scroll al input cuando aparece (solo para respuestas)
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
                <div className={`mb-3 p-3 rounded-lg border flex items-start justify-between bg-${replyingToComment.rol === 'admin' ? 'sky-50 border-sky-300' : 'amber-50 border-amber-300'} border-l-4`}>
                    <div className="flex items-center">
                        <CornerUpLeft size={16} className={`mr-2 text-${primaryColor}-600`} />
                        <span className={`text-sm text-${primaryColor}-800`}>
                            Respondiendo a{" "}
                            <span className="font-bold">
                            {replyingToComment.usuario_nombre}
                            </span>
                        </span>
                    </div>

                    <button
                        onClick={onCancelReply}
                        className="text-slate-500 hover:text-slate-700 text-sm font-medium transition-colors ml-4"
                        disabled={isSubmitting}
                    >
                        <X size={14} className="inline-block mr-1" /> Cancelar
                    </button>
                </div>
            )}

            <div className="flex gap-4">
                <div className="flex-shrink-0">
                    {/* Avatar del usuario actual */}
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-md bg-${primaryColor}-700`}>
                        {currentUser?.nombres?.charAt(0).toUpperCase() || 'U'}
                    </div>
                </div>
                <div className="flex-1 flex flex-col sm:flex-row gap-3">
                    <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder={isReplying ? "Escribe tu respuesta..." : "Comparte tu opinión sobre esta receta..."}
                        className={`flex-1 px-4 py-3 border-2 border-${primaryColor}-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-${primaryColor}-500 resize-none bg-${secondaryColor}-50 text-amber-950 placeholder-${secondaryColor}-400 shadow-inner transition-shadow`}
                        rows={isReplying ? 1 : 2}
                        disabled={isSubmitting}
                    />
                    <button
                        onClick={onSubmit}
                        disabled={!isReady || isSubmitting}
                        className={`self-end sm:self-auto px-6 py-3 bg-${primaryColor}-700 text-white rounded-xl font-bold hover:bg-${primaryColor}-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-[1.01]`}
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



function CommentItem({ comment, currentUserId, currentUserRole, onReply, onEdit, onDelete, replyingTo, newComment, setNewComment, handleSubmitComment, currentUser, primaryColor, secondaryColor, onLike }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(comment.texto);

    const replyInputRef = useRef(null); 
    
    const isOwner = currentUserId === comment.usuario;
    // Permite eliminar/editar si es dueño O si el usuario actual es admin
    const canModify = isOwner || currentUserRole === 'admin'; 
    const timeAgo = getTimeAgo(comment.fecha_creacion);
    const replies = comment.replies || []; 
    
    const isAdmin = comment.rol === 'admin'; 
    const isCurrentReplyTarget = currentUserId && comment.id === replyingTo; 

    // Clases CSS dinámicas basadas en el rol para diferenciación visual
    const containerClasses = isAdmin 
        ? "p-4 bg-sky-100 rounded-xl shadow-lg border border-sky-400 transform scale-[1.01]" 
        : "p-4 bg-amber-50 rounded-xl shadow-md border border-amber-200"; 

    const usernameClasses = isAdmin 
        ? "font-extrabold text-sky-950 text-base" 
        : "font-bold text-amber-950 text-sm";
    
    const handleSaveEdit = () => {
        if (editContent.trim() && editContent !== comment.texto) {
            onEdit(comment.id, editContent.trim());
        }
        setIsEditing(false);
    };
    
    const handleCancelReply = () => {
        onReply(null);
        setNewComment('');
    };

    return (
        <div className="group">
            <div className="flex gap-4">
                {/* Avatar */}
                <div className="flex-shrink-0">
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-xl ${isAdmin ? 'bg-sky-700' : 'bg-amber-700'}`}>
                        {comment.usuario_nombre?.charAt(0).toUpperCase()}
                    </div>
                </div>
                
                {/* Comment Content */}
                <div className="flex-1 min-w-0">
                    
                    <div className={containerClasses}>
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <span className={usernameClasses}>{comment.usuario_nombre}</span>
                            
                            {/* Badge de Administrador */}
                            {isAdmin && (
                                <span className="flex items-center gap-1 text-xs font-bold text-white bg-sky-700 px-3 py-1 rounded-full shadow-md">
                                    <ShieldCheck size={14} /> Administrador
                                </span>
                            )}

                            <span className="text-xs text-slate-600">· {timeAgo}</span>
                            {comment.comentario_padre && (
                                <span className="text-xs font-medium text-amber-700 bg-amber-200 px-2 py-0.5 rounded-full">Respuesta</span>
                            )}
                        </div>

                        {isEditing ? (
                            <div className="space-y-2">
                                <textarea
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    className={`w-full px-3 py-2 border border-${isAdmin ? 'sky' : 'amber'}-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-${isAdmin ? 'sky' : 'amber'}-500 resize-none text-amber-950 bg-white shadow-inner`}
                                    rows={2}
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleSaveEdit}
                                        disabled={!editContent.trim()}
                                        className={`px-3 py-1 bg-${isAdmin ? 'sky' : 'amber'}-700 text-white rounded-full text-xs font-medium hover:bg-${isAdmin ? 'sky' : 'amber'}-800 transition-colors flex items-center gap-1 disabled:opacity-50`}
                                    >
                                        <Check size={14} /> Guardar
                                    </button>
                                    <button
                                        onClick={() => { setIsEditing(false); setEditContent(comment.texto); }}
                                        className="px-3 py-1 bg-slate-200 text-slate-900 rounded-full text-xs font-medium hover:bg-slate-300 transition-colors flex items-center gap-1"
                                    >
                                        <X size={14} /> Cancelar
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <p className={`leading-relaxed whitespace-pre-wrap text-base ${isAdmin ? 'text-sky-900 font-medium' : 'text-amber-900'}`}>
                                    {comment.texto}
                                </p>
                                
                                {/* Actions */}
                                <div className="flex items-center gap-4 mt-3">
                                    {/* IMPLEMENTACIÓN DE ME GUSTA (LIKE) */}
                                    <button
                                        onClick={() => currentUserId && onLike(comment.id)}
                                        disabled={!currentUserId}
                                        className={`flex items-center gap-1 text-xs font-semibold transition-colors ${comment.userLiked ? 'text-red-600' : 'text-slate-500 hover:text-red-700'} disabled:opacity-50`}
                                    >
                                        <ThumbsUp size={14} fill={comment.userLiked ? 'currentColor' : 'none'} /> 
                                        <span className="font-bold">{comment.likes || 0}</span> Me Gusta
                                    </button>

                                    {currentUserId && (
                                        <button
                                        onClick={() => onReply(comment.id)}
                                        className={`flex items-center gap-1 text-xs font-semibold transition-colors ${isAdmin ? 'text-sky-700 hover:text-sky-900' : 'text-amber-700 hover:text-amber-900'}`}
                                        >
                                        <MessageCircle size={14} /> Responder
                                        </button>
                                    )}
                                    
                                    {/* Solo el dueño puede editar, pero el dueño o el ADMIN puede eliminar. */}
                                    {isOwner && (
                                        <button
                                        onClick={() => setIsEditing(true)}
                                        className={`flex items-center gap-1 text-xs font-semibold transition-colors ${isAdmin ? 'text-sky-700 hover:text-sky-900' : 'text-amber-700 hover:text-amber-900'}`}
                                        >
                                        <Edit3 size={14} /> Editar
                                        </button>
                                    )}
                                    
                                    {canModify && (
                                        <button
                                        onClick={() => onDelete(comment.id)}
                                        className="flex items-center gap-1 text-xs text-red-600 hover:text-red-800 font-semibold transition-colors"
                                        >
                                        <Trash2 size={14} /> Eliminar
                                        </button>
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
                            primaryColor={primaryColor}
                            secondaryColor={secondaryColor}
                            inputRef={replyInputRef}
                            isSubmitting={false} 
                        />
                    )}

                    {replies.length > 0 && (
                        <div className={`mt-4 space-y-4 pl-6 ml-1 border-l-2 ${isAdmin ? 'border-sky-300' : 'border-amber-300'}`}>
                            {replies.map((reply) => (
                                <CommentItem
                                    key={reply.id}
                                    comment={reply}
                                    currentUserId={currentUserId}
                                    currentUserRole={currentUserRole}
                                    onReply={onReply}
                                    onEdit={onEdit}
                                    onDelete={onDelete}
                                    onLike={onLike}
                                    replyingTo={replyingTo}
                                    newComment={newComment}
                                    setNewComment={setNewComment}
                                    handleSubmitComment={handleSubmitComment}
                                    currentUser={currentUser}
                                    primaryColor={primaryColor}
                                    secondaryColor={secondaryColor}
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

export default function CommentSection({ recipeId }) {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(null); 
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [visibleCommentCount, setVisibleCommentCount] = useState(INITIAL_LOAD); 
    
    const [sortType, setSortType] = useState('recent'); 
    
    const topCommentInputRef = useRef(null); 
    
    const API_BASE = `http://localhost:8000/api/recetas/${recipeId}/comments/`;

    const getToken = () => localStorage.getItem("access_token");
    
    const handleLoadMore = () => {
        setVisibleCommentCount(prevCount => prevCount + LOAD_STEP);
    };

    // Cargar usuario desde localStorage al montar el componente
    useEffect(() => {
        const storedUserJson = localStorage.getItem("user");
        if (storedUserJson) {
            try {
                const user = JSON.parse(storedUserJson);
                setCurrentUser({
                    ...user,
                    id: user.id || user.usuario_id,
                    nombres: user.nombres || user.usuario_nombre,
                    rol: user.rol === 'admin' ? 'admin' : 'normal'
                });
            } catch (e) {
                console.error("Error al parsear el objeto de usuario de localStorage.", e);
                setCurrentUser(null);
            }
        }
    }, []); 

    // Función para cargar los comentarios y aplicar los roles
    const loadComments = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch(API_BASE);
            if (!res.ok) throw new Error("Error al cargar comentarios");
            const data = await res.json();
            
            // Mapeamos campos del backend a nuestro estado local, utilizando campos reales
            const processedData = data.map(c => ({
                ...c,
                rol: c.autor_rol || 'normal', 
                // Usamos los campos reales del backend (likes_count y user_liked)
                likes: c.likes_count !== undefined ? c.likes_count : 0, 
                userLiked: c.user_liked || false
            }));

            setComments(processedData);
        } catch (err) {
            console.error("Error loading comments:", err);
        } finally {
            setIsLoading(false);
        }
    }, [recipeId]); 

    useEffect(() => {
        loadComments();
    }, [loadComments]);

    // --- LÓGICA DE LIKE FUNCIONAL ---
    const handleLikeComment = async (commentId) => {
        if (!currentUser) return;
        const token = getToken();
        if (!token) return console.error("Token no encontrado. Inicie sesión.");

        // 1. Optimistic Update (Guardamos el estado original para revertir)
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
            const res = await fetch(`http://localhost:8000/api/comments/${commentId}/like/`, {
                method: 'POST', 
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!res.ok) {
                throw new Error("Fallo al alternar el like.");
            }
            
        } catch (err) {
            console.error("Error al dar like:", err);
            setComments(prevComments => 
                prevComments.map(c => c.id === commentId ? originalComment : c)
            );
        }
    }


    const handleSubmitComment = async () => {
        if (!newComment.trim() || !currentUser || isSubmitting) return;

        const token = getToken(); 
        if (!token) {
            console.error("Usuario no autenticado para comentar.");
            return;
        }

        const payload = {
            texto: newComment.trim(),
            comentario_padre: replyingTo, 
        };
        
        setIsSubmitting(true); // Deshabilitar botón

        try {
            const res = await fetch(API_BASE, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error("Error creando comentario");

            console.log("Comentario publicado con éxito!"); 

            setNewComment('');
            setReplyingTo(null);
            loadComments(); 
            setVisibleCommentCount(INITIAL_LOAD); 

        } catch (err) {
            console.error(err);
            console.error("No se pudo publicar el comentario");
        } finally {
            setIsSubmitting(false); 
        }
    };

    const handleEditComment = async (commentId, newContent) => {
        const token = getToken(); 
        if (!token) return;

        try {
            const res = await fetch(`http://localhost:8000/api/comments/${commentId}/`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ texto: newContent }),
            });
            if (!res.ok) throw new Error("Error editando comentario");
            loadComments();
        } catch (err) {
            console.error(err);
            console.error("No se pudo editar el comentario");
        }
    };


    const handleDeleteComment = (commentId) => {
        setShowDeleteModal(commentId);
    };
    
    const confirmDelete = async (commentId) => {
        const token = getToken(); 
        if (!token) {
            console.error("Usuario no autenticado para eliminar.");
            return;
        }
        
        try {
            const res = await fetch(`http://localhost:8000/api/comments/${commentId}/`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Error eliminando comentario");
            loadComments();
        } catch (err) {
            console.error(err);
            console.error("No se pudo eliminar el comentario");
        } finally {
            setShowDeleteModal(null);
        }
    };
    
    const handleReply = (parentId) => {
        setReplyingTo(parentId);
        if (parentId === null) {
            setNewComment('');
            if (topCommentInputRef.current) {
                topCommentInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        } else {
            const parent = comments.find((c) => c.id === parentId);
            if (parent) setNewComment(`@${parent.usuario_nombre} `);
        }
    };

    // Lógica de Ordenamiento (Solo comentarios de nivel superior)
    const sortedComments = useMemo(() => {
        let sorted = [...comments];
        
        if (sortType === 'recent') {
            sorted.sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion));
        } else if (sortType === 'popularity') {
            sorted.sort((a, b) => (b.likes || 0) - (a.likes || 0));
        }

        return sorted;
    }, [comments, sortType]);

    // Construir la estructura anidada de comentarios
    const organizedComments = buildCommentTree(sortedComments); 
    
    const visibleComments = organizedComments.slice(0, visibleCommentCount);
    const showLoadMoreButton = visibleCommentCount < organizedComments.length;
    
    const replyingToComment = replyingTo ? comments.find((c) => c.id === replyingTo) : null;
    
    const isCurrentUserAdmin = currentUser?.rol === 'admin';
    const primaryColor = isCurrentUserAdmin ? 'sky' : 'amber';
    const secondaryColor = isCurrentUserAdmin ? 'slate' : 'amber';
    
    const isTopLevelComment = currentUser && replyingTo === null;


    return (
        <div className='max-w-8xl mx-auto w-full px-4 font-[Inter]' >
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-amber-100">
                
                {/* Header */}
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-amber-200">
                    <MessageSquare className="text-amber-800" size={28} />
                    <h2 className="text-2xl font-extrabold text-amber-950">
                        Comentarios{" "}
                        <span className="ml-2 text-xl font-medium text-amber-700">
                            ({comments.length})
                        </span>
                    </h2>
                </div>

                {/* Comment Input Area - Solo para comentarios de nivel superior */}
                {isTopLevelComment && (
                    <CommentForm
                        commentText={newComment}
                        setCommentText={setNewComment}
                        onSubmit={handleSubmitComment}
                        onCancelReply={() => {}}
                        replyingToComment={null}
                        currentUser={currentUser}
                        primaryColor={primaryColor}
                        secondaryColor={secondaryColor}
                        inputRef={topCommentInputRef}
                        isSubmitting={isSubmitting}
                    />
                )}
                
                {/* Mensaje si no está autenticado */}
                {!currentUser && (
                    <div className="mb-8 p-6 bg-amber-50 rounded-xl border border-amber-200 text-center shadow-inner">
                        <p className="text-amber-900 font-medium">
                        Inicia sesión para dejar un comentario. ¡Queremos saber tu opinión!
                        </p>
                    </div>
                )}

                {/* Controles de Ordenamiento */}
                {organizedComments.length > 0 && (
                    <div className="flex items-center justify-end gap-3 mb-6">
                        <span className="text-sm font-medium text-slate-700 flex items-center gap-1">
                            <Filter size={16} /> Ordenar por:
                        </span>
                        <button
                            onClick={() => setSortType('recent')}
                            className={`flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full transition-all ${sortType === 'recent' 
                                ? 'bg-amber-700 text-white shadow-md' 
                                : 'bg-amber-100 text-amber-800 hover:bg-amber-200'}`}
                        >
                            <Clock size={14} /> Más Recientes
                        </button>
                        <button
                            onClick={() => setSortType('popularity')}
                            className={`flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full transition-all ${sortType === 'popularity' 
                                ? 'bg-amber-700 text-white shadow-md' 
                                : 'bg-amber-100 text-amber-800 hover:bg-amber-200'}`}
                        >
                            <Users size={14} /> Popularidad
                        </button>
                    </div>
                )}


                {/* Comments List / States */}
                {isLoading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-amber-300 border-t-amber-800"></div>
                        <p className="mt-4 text-amber-700 font-medium">Cargando comentarios...</p>
                    </div>
                ) : organizedComments.length === 0 ? (
                    <div className="text-center py-12">
                        <MessageSquare className="mx-auto text-amber-400 mb-4" size={48} />
                        <p className="text-amber-700 text-lg font-medium">
                            Sé el primero en comentar esta receta
                        </p>
                        <p className="text-amber-600 text-sm mt-2">
                            Comparte tu experiencia o pregunta al autor
                        </p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {visibleComments.map((comment) => (
                            <CommentItem
                                key={comment.id}
                                comment={comment}
                                currentUserId={currentUser?.id || null}
                                currentUserRole={currentUser?.rol || 'normal'}
                                onReply={handleReply}
                                onEdit={handleEditComment}
                                onDelete={handleDeleteComment}
                                onLike={handleLikeComment}
                                
                                // Props para el formulario de respuesta anidado
                                replyingTo={replyingTo}
                                newComment={newComment}
                                setNewComment={setNewComment}
                                handleSubmitComment={handleSubmitComment}
                                currentUser={currentUser}
                                primaryColor={primaryColor}
                                secondaryColor={secondaryColor}
                            />
                        ))}
                        
                        {/* BOTÓN "CARGAR MÁS" */}
                        {showLoadMoreButton && (
                            <div className="text-center pt-4">
                                <button
                                    onClick={handleLoadMore}
                                    className="px-6 py-2 bg-amber-100 text-amber-800 font-semibold rounded-full hover:bg-amber-200 transition-colors shadow-md transform hover:scale-[1.01]"
                                >
                                    Cargar más comentarios ({organizedComments.length - visibleCommentCount} restantes)
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Custom Delete Confirmation Modal */}
            {showDeleteModal !== null && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl p-6 shadow-2xl max-w-sm w-full border-t-4 border-red-600 animate-in fade-in zoom-in-50 duration-300">
                        <h3 className="text-xl font-bold text-slate-800 mb-3">Confirmar Eliminación</h3>
                        <p className="text-slate-600 mb-6">
                            ¿Estás seguro de que quieres eliminar este comentario? Esta acción no se puede deshacer y eliminará todas sus respuestas anidadas.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowDeleteModal(null)}
                                className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg font-medium hover:bg-slate-300 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => confirmDelete(showDeleteModal)}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center gap-1 shadow-md hover:shadow-lg"
                            >
                                <Trash2 size={16} /> Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}