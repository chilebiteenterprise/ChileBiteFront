import React, { useState, useEffect } from "react";
import FireContainer from "./FireContainer.jsx";
import { Heart, Bookmark, Check, Eye, MapPin } from "lucide-react";
import { toast } from "@heroui/react";
import { useAuth } from '@/features/auth/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';

export default function RecipeCard({ receta, usuarioEsAdmin = false, isSelected = false, onToggleSelect }) {
  const { session } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(receta.likes || 0);
  const [guardado, setGuardado] = useState(false);

  const idToUse = receta.id_receta || receta.id;

  // === CARGA INICIAL: sincroniza estado de corazon y guardado para este usuario ===
  useEffect(() => {
    // Si viene en receta (cuando renderiza un contexto con likes), priorizamos, sino fetch del usuario
    setLikes(receta.likes || 0);

    if (!idToUse || !session?.user?.id) return;
    
    const fetchEstado = async () => {
      try {
        const [{ count: likeCount }, { count: saveCount }] = await Promise.all([
          supabase
            .from('core_recetalike')
            .select('*', { count: 'exact', head: true })
            .eq('receta_id', idToUse)
            .eq('user_id', session.user.id),
          supabase
            .from('core_recetaguardada')
            .select('*', { count: 'exact', head: true })
            .eq('receta_id', idToUse)
            .eq('user_id', session.user.id)
        ]);
        setLiked(likeCount > 0);
        setGuardado(saveCount > 0);
      } catch (err) {
        console.error("Error al obtener estado de receta:", err);
      }
    };
    fetchEstado();
  }, [idToUse, session, receta]);

  // === LIKE ===
  const handleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!session?.user?.id) return toast.danger("Acceso Denegado", { description: "Debes estar logueado para marcar como favorito" });

    try {
      if (liked) {
         await supabase.from('core_recetalike').delete().eq('receta_id', idToUse).eq('user_id', session.user.id);
         setLikes(Math.max(0, likes - 1));
      } else {
         await supabase.from('core_recetalike').insert([{ receta_id: idToUse, user_id: session.user.id }]);
         setLikes(likes + 1);
      }
      setLiked(!liked);
    } catch (err) {
      console.error(err);
    }
  };

  // === GUARDAR ===
  const handleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!session?.user?.id) return toast.danger("Acceso Denegado", { description: "Debes estar logueado para guardar" });

    try {
      if (guardado) {
         await supabase.from('core_recetaguardada').delete().eq('receta_id', idToUse).eq('user_id', session.user.id);
      } else {
         await supabase.from('core_recetaguardada').insert([{ receta_id: idToUse, user_id: session.user.id }]);
      }
      setGuardado(!guardado);
    } catch (err) {
      console.error(err);
    }
  };

  const dificultadMap = {
    "Muy Fácil": 1,
    "Fácil": 2,
    "Media": 3,
    "Difícil": 4,
    "Muy Difícil": 5,
  };
  const dificultadNum = dificultadMap[receta.dificultad] || 0;

  const handleCardClick = (e) => {
    if (e.target.closest("[data-receta-ignore='true']")) return;
    if (usuarioEsAdmin && onToggleSelect) {
      onToggleSelect(idToUse);
    } else {
      window.open(`/recipes/${idToUse}`, "_blank");
    }
  };

  // Mapeamos Estilos de Vida
  const estilos = receta.estilos_vida_detalle || [];

  return (
    <div 
      className={`group relative bg-white dark:bg-[#0f1115] border rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 ease-out cursor-pointer flex flex-col h-full ${isSelected ? "border-[#b08969] ring-2 ring-[#b08969]/50" : "border-slate-200 dark:border-slate-800"}`}
      onClick={handleCardClick}
    >
      {/* Admin Multi-Select Checkbox Overlay */}
      {usuarioEsAdmin && (
        <div 
          className="absolute top-4 left-4 z-20"
          data-receta-ignore="true"
        >
          <button 
            onClick={(e) => { e.stopPropagation(); onToggleSelect && onToggleSelect(idToUse); }}
            className={`w-8 h-8 rounded-lg flex items-center justify-center border-2 transition-all backdrop-blur-md shadow-lg ${isSelected ? "bg-[#b08969] border-[#b08969] text-white" : "bg-black/30 border-white/40 text-transparent hover:border-white"}`}
          >
            <Check className={`w-5 h-5 ${isSelected ? "opacity-100" : "opacity-0"}`} strokeWidth={3} />
          </button>
        </div>
      )}

      {/* Upper Zone (Multimedia) */}
      <div className="relative h-56 shrink-0 overflow-hidden">
        <img 
          alt={receta.nombre} 
          className={`w-full h-full object-cover transition-transform duration-700 ease-in-out ${isSelected ? 'scale-110' : 'group-hover:scale-110'}`} 
          src={receta.imagen_url || "https://placehold.co/800x600?text=Receta"}
          onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/800x600?text=No+Image"; }}
        />
        
        {/* Floating Country Badge (Bottom-Left) */}
        <div className="absolute bottom-3 left-3 z-30" data-receta-ignore="true">
          <span className="px-3 py-1.5 rounded-full flex items-center gap-1.5 backdrop-blur-md transition-colors border shadow-md bg-black/40 text-white border-white/20 text-[10px] font-bold tracking-widest uppercase">
            <MapPin className="w-3.5 h-3.5" />
            {receta.pais_nombre || receta.pais_detalle?.nombre || receta.pais || '—'}
          </span>
        </div>

        {/* Floating Badges (Top-Right) */}
        <div className="absolute top-4 right-4 z-30 flex flex-col gap-2" data-receta-ignore="true">
          {usuarioEsAdmin && (
            <button 
              type="button"
              onClick={(e) => { e.stopPropagation(); window.open(`/recipes/${idToUse}`, "_blank"); }}
              title="Ver Receta"
              className="w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-colors border shadow-md bg-black/40 text-white border-white/20 hover:bg-[#b08969]"
            >
              <Eye className="w-5 h-5" />
            </button>
          )}
          <button 
            type="button"
            onClick={handleSave}
            title={guardado ? "Quitar de Guardados" : "Guardar Receta"}
            className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-colors border shadow-md border-white/20 hover:bg-black/60 ${guardado ? "bg-yellow-500/90 text-white border-yellow-400" : "bg-black/40 text-white"}`}
          >
            <Bookmark className={`w-5 h-5 ${guardado ? "fill-current" : ""}`} />
          </button>
        </div>
      </div>

      {/* Middle Content */}
      <div className="p-5 flex flex-col gap-3">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight tracking-tight line-clamp-2">
          {receta.nombre}
        </h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed line-clamp-2 italic">
            {receta.descripcion_corta}
        </p>
      </div>

      {/* Footer */}
      <div className="px-5 py-4 flex items-center justify-between border-t border-slate-200/50 dark:border-slate-800/50 mt-auto">
        {/* Left: Flame Icons + Media */}
        <div className="flex items-center gap-2">
          <FireContainer selectedDifficulty={dificultadNum} setSelectedDifficulty={() => {}} />
          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            {receta.dificultad}
          </span>
        </div>

        {/* Right: Red Heart Icon + Likes */}
        <div className="flex items-center gap-2 z-30" data-receta-ignore="true">
          <button 
            type="button"
            onClick={handleFavorite}
            title={liked ? "Ya no me gusta" : "Me gusta"}
            className="flex items-center gap-2 group/heart bg-transparent border-none p-1 cursor-pointer transition-transform active:scale-90"
          >
            <Heart className={`w-6 h-6 transition-transform group-hover/heart:scale-125 ${liked ? "fill-[#ff4757] text-[#ff4757]" : "text-slate-400"}`} />
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300 pointer-events-none">
              {likes}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
