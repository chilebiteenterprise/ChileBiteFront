import React, { useState, useEffect } from 'react';
import { useAuth, AuthProvider } from '@/features/auth/context/AuthContext';
import { toast, Skeleton } from "@heroui/react";
import { ChefHat, Clock, Users, Heart, Share2, BookOpen, ListOrdered, Video, Bookmark, Minus, Plus, Flame, Beef, Wheat, Droplet } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import AdSenseBanner from '@/shared/ui/AdSenseBanner';
import CollectionPickerModal from './CollectionPickerModal.jsx';

const COLOR_PRINCIPAL = '#b08968';

const parseTextToList = (text) => {
  if (!text || typeof text !== 'string') return [];
  return text.split('\n').map(item => item.trim()).filter(item => item.length > 0);
};

function RecetaDetalleContent({ idReceta, receta: recetaProp, modoLocal = false, usuario, isPreview = false }) {
  const { session } = useAuth();
  const [receta, setReceta] = useState(recetaProp || null);
  const [currentPage, setCurrentPage] = useState(1);
  const [mediaTab, setMediaTab] = useState('steps');
  const [isFavorite, setIsFavorite] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [ingredientsState, setIngredientsState] = useState([]);
  const [stepsState, setStepsState] = useState([]);
  const [porcionesDeseadas, setPorcionesDeseadas] = useState(1);
  const [loading, setLoading] = useState(!modoLocal);
  const [error, setError] = useState(null);
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);

  useEffect(() => {
    if (modoLocal && recetaProp) {
      setReceta(recetaProp);
      const instruccionesArray = parseTextToList(recetaProp.preparacion);
      setStepsState(instruccionesArray.map((text, i) => ({ id: i, text, checked: false })));
      if (recetaProp.ingredientes_detalle && recetaProp.ingredientes_detalle.length > 0) {
        setIngredientsState(recetaProp.ingredientes_detalle.map((item, i) => ({ id: i, data: item, checked: false, isDetailed: true })));
      } else {
        const arr = parseTextToList(recetaProp.ingredientes);
        setIngredientsState(arr.map((text, i) => ({ id: i, text, checked: false, isDetailed: false })));
      }
      setPorcionesDeseadas(recetaProp.numero_porcion || 1);
      setIsFavorite(recetaProp.liked || false);
      setIsSaved(recetaProp.is_guardada || false);
      return;
    }

    if (!idReceta) return;

    const fetchReceta = async () => {
      try {
        const { data, error: fetchErr } = await supabase
          .from('core_receta')
          .select(`
            *,
            core_tipoplato:tipo_plato_id ( nombre ),
            core_pais:pais_id ( nombre ),
            ingredientes_detalle:core_recetaingrediente ( 
              cantidad, 
              unidad, 
              ingrediente:core_ingrediente ( nombre ) 
            )
          `)
          .eq('id', idReceta)
          .single();

        if (fetchErr) throw new Error(fetchErr.message);

        let userName = 'Chef Anónimo';
        if (data.user_id) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', data.user_id)
            .single();

          if (profileData && profileData.username) {
            userName = profileData.username;
          }
        }

        // Map data to match expected frontend structure
        data.usuario_nombre = userName;

        let liked = false;
        let guardada = false;
        let accurateLikes = data.contador_likes || 0;

        try {
          const { count } = await supabase.from('core_recetalike').select('*', { count: 'exact', head: true }).eq('receta_id', idReceta);
          accurateLikes = count || 0;
        } catch (e) { }

        // Fetch user specific state (liked / saved)
        if (session?.user?.id) {
          const [{ count: likeCount }, { data: colecciones }] = await Promise.all([
            supabase
              .from('core_recetalike')
              .select('*', { count: 'exact', head: true })
              .eq('receta_id', idReceta)
              .eq('user_id', session.user.id),
            supabase
              .from('core_coleccion')
              .select('id')
              .eq('user_id', session.user.id)
          ]);

          let saveCount = 0;
          if (colecciones && colecciones.length > 0) {
            const { count } = await supabase
              .from('core_coleccion_receta')
              .select('*', { count: 'exact', head: true })
              .eq('receta_id', idReceta)
              .in('coleccion_id', colecciones.map(c => c.id));
            saveCount = count || 0;
          }

          liked = likeCount > 0;
          guardada = saveCount > 0;
        }

        // Fix column naming mappings derived from old API outputs vs raw Supabase schema
        data.portada = data.imagen_url || '';
        data.descripcion = data.descripcion_larga || '';
        data.descripcion_corta = data.descripcion_corta || data.descripcion_larga || '';
        data.calorias = data.total_calorias || 0;
        data.proteinas = data.total_proteinas || 0;
        data.carbohidratos = data.total_carbohidratos || 0;
        data.grasas = data.total_grasas || 0;
        data.porciones = data.numero_porcion || 1;
        data.likes = accurateLikes;
        data.contador_likes = accurateLikes;

        setReceta(data);

        const instruccionesArray = parseTextToList(data.preparacion);
        setStepsState(instruccionesArray.map((text, i) => ({ id: i, text, checked: false })));
        if (data.ingredientes_detalle && data.ingredientes_detalle.length > 0) {
          setIngredientsState(data.ingredientes_detalle.map((item, i) => ({ id: i, data: item, checked: false, isDetailed: true })));
        } else {
          const arr = parseTextToList(data.ingredientes);
          setIngredientsState(arr.map((text, i) => ({ id: i, text, checked: false, isDetailed: false })));
        }
        setPorcionesDeseadas(data.numero_porcion || 1);
        setIsFavorite(liked);
        setIsSaved(guardada);
      } catch (err) {
        console.error(err);
        setError('No se pudo cargar la receta.');
      } finally {
        setLoading(false);
      }
    };

    fetchReceta();
  }, [idReceta, recetaProp, modoLocal, session]);

  useEffect(() => {
    if (modoLocal && recetaProp) {
      setReceta(recetaProp);
      const instruccionesArray = parseTextToList(recetaProp.preparacion);
      setStepsState(instruccionesArray.map((text, i) => ({ id: i, text, checked: false })));
      if (recetaProp.ingredientes_detalle && recetaProp.ingredientes_detalle.length > 0) {
        setIngredientsState(recetaProp.ingredientes_detalle.map((item, i) => ({ id: i, data: item, checked: false, isDetailed: true })));
      } else {
        const arr = parseTextToList(recetaProp.ingredientes);
        setIngredientsState(arr.map((text, i) => ({ id: i, text, checked: false, isDetailed: false })));
      }
      setPorcionesDeseadas(recetaProp.numero_porcion || 1);
    }
  }, [recetaProp, modoLocal]);

  const toggleCheck = (type, id) => {
    if (type === "ingredients") setIngredientsState(prev => prev.map(i => i.id === id ? { ...i, checked: !i.checked } : i));
    else setStepsState(prev => prev.map(s => s.id === id ? { ...s, checked: !s.checked } : s));
  };

  const handleFavorite = async () => {
    if (!session?.user?.id) return toast.error("Debes estar logueado para marcar como favorito");
    try {
      if (isFavorite) {
        await supabase.from('core_recetalike').delete().eq('receta_id', idReceta).eq('user_id', session.user.id);
        setReceta(prev => ({ ...prev, contador_likes: Math.max(0, (prev.contador_likes || 0) - 1) }));
        toast.success("Ya no te gusta esta receta");
      } else {
        await supabase.from('core_recetalike').insert([{ receta_id: idReceta, user_id: session.user.id }]);
        setReceta(prev => ({ ...prev, contador_likes: (prev.contador_likes || 0) + 1 }));
        toast.success((
          <div className="flex flex-col">
            <span className="font-bold">¡Genial!</span>
            <span className="text-sm">Agregado a tus me gusta</span>
          </div>
        ));
      }
      setIsFavorite(prev => !prev);
    } catch (err) { console.error(err); }
  };

  const handleSave = async () => {
    if (!session?.user?.id) return toast.error("Debes estar logueado para guardar");
    setIsCollectionModalOpen(true);
  };

  const handleCollectionSaveComplete = async () => {
    if (!session?.user?.id) return;
    try {
      const { data: colecciones } = await supabase.from('core_coleccion').select('id').eq('user_id', session.user.id);
      if (colecciones && colecciones.length > 0) {
        const { count } = await supabase.from('core_coleccion_receta').select('*', { count: 'exact', head: true }).eq('receta_id', idReceta).in('coleccion_id', colecciones.map(c => c.id));
        setIsSaved((count || 0) > 0);
      } else {
        setIsSaved(false);
      }
    } catch (err) { }
  };

  const handleShare = () => {
    if (!receta) return;
    if (navigator.share) {
      navigator.share({ title: receta.nombre, text: `Mira esta receta: ${receta.nombre}`, url: window.location.href }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      console.log('Link copiado al portapapeles');
    }
  };

  const navigateBack = () => window.history.back();

  if (loading) return (
    <div className="min-h-screen flex flex-col pt-12 pb-12 transition-colors duration-500">
      <div className="max-w-[1400px] mx-auto w-full px-4 lg:px-8">
        <div className="premium-glass-wrapper rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col lg:flex-row min-h-[850px] border border-slate-200 dark:border-zinc-800 relative">

          <div className="lg:w-[320px] xl:w-[380px] p-8 relative flex flex-col justify-between premium-glass-panel border-r border-slate-200 dark:border-zinc-800 z-10">
            <div>
              <div className="flex items-center gap-3 mb-10">
                <Skeleton className="w-14 h-14 rounded-xl" />
                <Skeleton className="h-8 w-32 rounded-lg" />
              </div>
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="w-full h-14 rounded-2xl" />
                ))}
              </div>
            </div>

            <div className="pt-8 mt-12 border-t border-slate-200 dark:border-zinc-700">
              <div className="flex justify-center gap-6">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="w-14 h-14 rounded-full" />
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1 p-8 md:p-12 xl:p-16 relative">
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="flex-1 space-y-4 w-full">
                  <Skeleton className="h-16 w-3/4 rounded-2xl" />
                  <Skeleton className="h-6 w-1/4 rounded-lg mb-6" />
                  <Skeleton className="h-32 w-full rounded-2xl" />
                </div>
                <div className="w-full md:w-1/3 flex-shrink-0">
                  <Skeleton className="h-64 w-full rounded-[2rem]" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-24 w-full rounded-2xl" />
                <Skeleton className="h-24 w-full rounded-2xl" />
              </div>

              <Skeleton className="h-48 w-full rounded-[2rem]" />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
  if (error || !receta) return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center text-slate-900 dark:text-zinc-200">
      <p className="text-xl font-semibold mb-4">{error || 'Receta no encontrada'}</p>
      <button onClick={navigateBack} className="px-4 py-2 bg-[#b08968] text-white dark:text-zinc-950 rounded-full hover:bg-[rgba(176,137,104,0.8)] dark:hover:bg-orange-200 transition font-bold">Volver al recetario</button>
    </div>
  );

  const imageUrl = receta.imagen_url?.trim() || null;
  const tiempoTotal = receta.tiempo_preparacion ? `${receta.tiempo_preparacion} min` : 'N/A';

  const tabs = [
    { id: 1, name: "Resumen y Detalles", icon: BookOpen },
    { id: 2, name: "Ingredientes", icon: ListOrdered },
    { id: 3, name: "Preparación y Extras", icon: Video },
  ];

  const PageContent = () => {
    switch (currentPage) {
      case 1:
        return (
          <div className="animate-fade-in space-y-8 z-10 relative">
            {/* Header Limpio Estilo Editorial */}
            <div className="border-b border-slate-200/60 dark:border-white/10 pb-6 mb-8">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#b08968] mb-2 block">
                Libro de Recetas
              </span>
              <h1 className="text-4xl md:text-5xl font-serif font-black text-slate-900 dark:text-white leading-tight mb-4">
                {receta.nombre}
              </h1>
              <div className="flex items-center gap-2">

              </div>
            </div>

            {/* Contenedor de Texto con Infobox Flotante */}
            <div className="relative">
              {/* Infobox Imagen (Pura y Ordenada) */}
              {imageUrl && (
                <div className="float-none md:float-right md:ml-8 md:mb-6 w-full md:w-[320px] xl:w-[380px] bg-slate-50 dark:bg-white/[0.03] p-1.5 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm">
                  <div className="aspect-[4/3] rounded-lg overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={receta.nombre}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Cuerpo de la Descripción (Inicio Directo) */}
              <div className="text-slate-600 dark:text-zinc-300 text-lg leading-[1.8] text-justify space-y-6">
                {receta.descripcion_larga || receta.descripcion_corta}
              </div>

              {/* Clearfix para layout Wikipedia */}
              <div className="clear-both"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="premium-glass-panel rounded-2xl p-6 flex items-center justify-between border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900/80 transition shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-[#b08968]/10 dark:bg-[#b08968]/20 rounded-xl">
                    <Clock className="w-6 h-6 text-[#b08968] dark:text-orange-200" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 dark:text-orange-200/60 font-bold uppercase tracking-widest">Tiempo Total</p>
                    <p className="font-extrabold text-xl text-slate-800 dark:text-zinc-200">{tiempoTotal}</p>
                  </div>
                </div>
              </div>
              <div className="premium-glass-panel rounded-2xl p-6 flex items-center justify-between border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900/80 transition shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-[#b08968]/10 dark:bg-[#b08968]/20 rounded-xl">
                    <ChefHat className="w-6 h-6 text-[#b08968] dark:text-orange-200" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 dark:text-orange-200/60 font-bold uppercase tracking-widest">Dificultad</p>
                    <p className="font-extrabold text-xl text-slate-800 dark:text-zinc-200">{receta.dificultad}</p>
                  </div>
                </div>
              </div>
            </div>

            {(isPreview || (receta.total_calorias != null && parseFloat(receta.total_calorias) > 0)) && (
              <div className="premium-glass-panel rounded-[2rem] p-8 border border-slate-200 dark:border-zinc-800 relative overflow-hidden shadow-sm">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#b08968] opacity-[0.05] dark:opacity-5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 relative z-10 gap-4">
                  <div>
                    <h3 className="text-2xl font-serif font-bold text-slate-800 dark:text-orange-200 flex items-center gap-3">
                      <Flame className="w-7 h-7 text-[#b08968] dark:text-orange-200" />
                      Valor Nutricional
                    </h3>
                    <p className="text-slate-500 dark:text-orange-200/60 text-sm mt-1">Tabla de información nutricional de la receta</p>
                  </div>
                  <span className="text-xs font-bold text-white dark:text-zinc-950 bg-[#b08968] dark:bg-orange-200 px-4 py-2 rounded-full tracking-wide uppercase shadow-lg">1 porción</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
                  <div className="premium-glass-panel rounded-2xl p-5 text-center border border-slate-200 dark:border-[#b08968]/20 transition-colors shadow-sm">
                    <Flame className="w-5 h-5 mx-auto mb-2 text-orange-500 dark:text-orange-400" />
                    <p className="text-[10px] text-slate-500 dark:text-orange-200/60 uppercase font-bold tracking-widest mb-1">Calorías</p>
                    <p className="font-extrabold text-3xl text-slate-800 dark:text-zinc-200">{receta.total_calorias} <span className="text-sm font-medium text-slate-500 dark:text-orange-200/60">kcal</span></p>
                  </div>
                  <div className="premium-glass-panel rounded-2xl p-5 text-center border border-slate-200 dark:border-[#b08968]/20 transition-colors shadow-sm">
                    <Beef className="w-5 h-5 mx-auto mb-2 text-blue-500 dark:text-blue-400" />
                    <p className="text-[10px] text-slate-500 dark:text-orange-200/60 uppercase font-bold tracking-widest mb-1">Proteínas</p>
                    <p className="font-extrabold text-3xl text-slate-800 dark:text-zinc-200">{receta.total_proteinas} <span className="text-sm font-medium text-slate-500 dark:text-orange-200/60">g</span></p>
                  </div>
                  <div className="premium-glass-panel rounded-2xl p-5 text-center border border-slate-200 dark:border-[#b08968]/20 transition-colors shadow-sm">
                    <Wheat className="w-5 h-5 mx-auto mb-2 text-emerald-500 dark:text-emerald-400" />
                    <p className="text-[10px] text-slate-500 dark:text-orange-200/60 uppercase font-bold tracking-widest mb-1">Carbs</p>
                    <p className="font-extrabold text-3xl text-slate-800 dark:text-zinc-200">{receta.total_carbohidratos} <span className="text-sm font-medium text-slate-500 dark:text-orange-200/60">g</span></p>
                  </div>
                  <div className="premium-glass-panel rounded-2xl p-5 text-center border border-slate-200 dark:border-[#b08968]/20 transition-colors shadow-sm">
                    <Droplet className="w-5 h-5 mx-auto mb-2 text-yellow-500 dark:text-yellow-500" />
                    <p className="text-[10px] text-slate-500 dark:text-orange-200/60 uppercase font-bold tracking-widest mb-1">Grasas</p>
                    <p className="font-extrabold text-3xl text-slate-800 dark:text-zinc-200">{receta.total_grasas} <span className="text-sm font-medium text-slate-500 dark:text-orange-200/60">g</span></p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      case 2:
        return (
          <div className="animate-fade-in z-10 relative">
            <div className="premium-glass-panel rounded-[2rem] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between border border-slate-200 dark:border-[#b08968]/30 mb-8 shadow-sm dark:shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-32 h-32 bg-[#b08968] opacity-[0.05] dark:opacity-10 rounded-full blur-2xl -ml-16 -mt-16 pointer-events-none"></div>
              <div className="flex items-center gap-5 mb-6 md:mb-0 relative z-10">
                <div className="p-4 bg-gradient-to-br from-[#b08968]/20 to-[#b08968]/5 dark:from-[#b08968]/30 dark:to-[#b08968]/10 rounded-2xl border border-slate-200 dark:border-[#b08968]/20 shadow-inner">
                  <Users className="w-7 h-7 text-[#b08968] dark:text-orange-200" />
                </div>
                <div>
                  <h3 className="font-bold text-2xl text-slate-800 dark:text-zinc-200 mb-1">Calculadora de Porciones</h3>
                  <p className="text-sm text-slate-500 dark:text-orange-200/60">Ajusta las cantidades para tus invitados</p>
                </div>
              </div>
              <div className="flex items-center gap-6 premium-glass-panel p-3 rounded-full border border-slate-200 dark:border-zinc-800 shadow-sm dark:shadow-inner relative z-10">
                <button onClick={() => setPorcionesDeseadas(p => Math.max(1, p - 1))} className="p-3 rounded-full bg-slate-100 dark:bg-zinc-800 hover:bg-[#b08968] dark:hover:bg-[#b08968] text-slate-700 dark:text-zinc-200 hover:text-white dark:hover:text-zinc-950 transition-all duration-300 focus:ring-4 focus:ring-[#b08968]/30 focus:outline-none shadow-sm dark:shadow-md border border-slate-200 dark:border-none">
                  <Minus className="w-5 h-5" />
                </button>
                <div className="flex flex-col items-center justify-center w-12">
                  <span className="font-extrabold text-3xl text-[#b08968] dark:text-orange-200 leading-none">{porcionesDeseadas}</span>
                </div>
                <button onClick={() => setPorcionesDeseadas(p => Math.min(20, p + 1))} className="p-3 rounded-full bg-slate-100 dark:bg-zinc-800 hover:bg-[#b08968] dark:hover:bg-[#b08968] text-slate-700 dark:text-zinc-200 hover:text-white dark:hover:text-zinc-950 transition-all duration-300 focus:ring-4 focus:ring-[#b08968]/30 focus:outline-none shadow-sm dark:shadow-md border border-slate-200 dark:border-none">
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="premium-glass-panel p-8 rounded-[2rem] border border-slate-200 dark:border-zinc-800 shadow-sm mb-8 w-full">
              <h2 className="text-3xl font-serif font-bold mb-6 text-slate-800 dark:text-orange-200 border-b border-slate-200 dark:border-zinc-700 pb-4">Ingredientes</h2>
              <ul className="space-y-4 list-none max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {ingredientsState.map(ing => {
                  const scale = porcionesDeseadas / (receta.numero_porcion || 1);
                  let text = ing.text;
                  if (ing.isDetailed && ing.data) {
                    const scaledCantidad = (parseFloat(ing.data.cantidad) * scale).toFixed(1).replace(/\.0$/, '');
                    text = `${scaledCantidad} ${ing.data.unidad} de ${ing.data.ingrediente.nombre}`;
                  }
                  return (
                    <li key={ing.id} onClick={() => toggleCheck("ingredients", ing.id)} className={`flex items-start gap-4 p-3 rounded-xl cursor-pointer transition-all ${ing.checked ? "opacity-50 grayscale bg-slate-100 dark:bg-zinc-950/30" : "premium-glass-panel hover:bg-slate-50 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 shadow-sm dark:shadow-none"}`}>
                      <span className={`mt-0.5 shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${ing.checked ? 'bg-[#b08968] border-[#b08968] text-white dark:text-zinc-950' : 'border-slate-300 dark:border-orange-900/40 text-transparent'}`}>✓</span>
                      <span className={`flex-1 text-lg font-medium tracking-tight ${ing.checked ? "line-through text-slate-400 dark:text-orange-200/60" : "text-slate-700 dark:text-zinc-200"}`}>{text}</span>
                    </li>
                  );
                })}
              </ul>
            </div>


          </div>
        );
      case 3:
        return (
          <div className="animate-fade-in z-10 relative">
            {receta.video_url && (
              <div className="flex gap-4 mb-8 justify-center">
                <button onClick={() => setMediaTab('steps')} className={`px-6 py-2 rounded-full font-bold transition-all shadow-sm ${mediaTab === 'steps' ? 'bg-[#b08968] text-white' : 'bg-slate-200 dark:bg-zinc-900 text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200'}`}>Pasos a Seguir</button>
                <button onClick={() => setMediaTab('video')} className={`px-6 py-2 rounded-full font-bold transition-all shadow-sm ${mediaTab === 'video' ? 'bg-[#b08968] text-white' : 'bg-slate-200 dark:bg-zinc-900 text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200'}`}>Video Tutorial</button>
              </div>
            )}

            <div className="bg-slate-50 dark:bg-zinc-900 p-8 rounded-[2rem] border border-slate-200 dark:border-zinc-700 shadow-sm mb-8">
              {mediaTab === 'steps' || !receta.video_url ? (
                <>
                  <h2 className="text-3xl font-serif font-bold mb-6 text-slate-800 dark:text-orange-200 border-b border-slate-200 dark:border-zinc-700 pb-4">Preparación</h2>
                  <ul className="list-inside space-y-6 max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
                    {stepsState.map(step => (
                      <li key={step.id} onClick={() => toggleCheck("steps", step.id)} className={`p-4 border-l-4 cursor-pointer transition-all rounded-r-xl ${step.checked ? "border-slate-300 dark:border-orange-900/40 text-slate-400 dark:text-orange-200/60 line-through opacity-50 bg-slate-100 dark:bg-zinc-900" : "border-[#b08968] text-slate-700 dark:text-zinc-200 bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 shadow-sm dark:shadow-none"}`}>
                        <span className="font-bold text-lg text-[#b08968] dark:text-orange-200 block mb-2">Paso {step.id + 1}</span>
                        <p className="leading-relaxed">{step.text}</p>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <>
                  <h2 className="text-3xl font-serif font-bold mb-6 text-slate-800 dark:text-orange-200">Video Tutorial</h2>
                  <div className="relative h-0 pb-[56.25%] rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-zinc-700">
                    <iframe src={receta.video_url} frameBorder="0" allowFullScreen className="absolute top-0 left-0 w-full h-full"></iframe>
                  </div>
                </>
              )}
            </div>

            {receta.sugerencias && (
              <div className="bg-orange-50 dark:bg-[#b08968]/10 p-6 rounded-2xl border border-orange-200 dark:border-[#b08968]/30 shadow-sm">
                <h3 className="font-bold text-orange-800 dark:text-orange-200 mb-2 flex items-center gap-2"><ChefHat className="w-5 h-5" /> Sugerencia del Chef</h3>
                <p className="text-orange-900/80 dark:text-orange-100 italic leading-relaxed">{receta.sugerencias}</p>
              </div>
            )}


          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`flex flex-col transition-colors duration-500 w-full ${isPreview ? 'p-0 pt-16 md:pt-20' : 'min-h-screen pt-12 pb-12'}`}>
      <div className={`w-full ${isPreview ? 'px-0' : 'max-w-[1400px] mx-auto px-4 lg:px-8'}`}>
        <div className={`premium-glass-wrapper w-full shadow-2xl overflow-hidden flex flex-col lg:flex-row border border-slate-200 dark:border-zinc-800 relative ${isPreview ? 'rounded-[2rem] min-h-0' : 'rounded-[2.5rem] min-h-[850px]'}`}>

          <div className={`${isPreview ? 'lg:w-[240px] xl:w-[280px] p-6' : 'lg:w-[320px] xl:w-[380px] p-8'} relative flex flex-col justify-between premium-glass-panel border-r border-slate-200 dark:border-zinc-800 z-10`}>
            <div>
              <div className={`flex items-center gap-4 border-b border-slate-200/50 dark:border-zinc-800 ${isPreview ? 'mb-6 pb-4' : 'mb-12 pb-8'}`}>
                <div className={`${isPreview ? 'w-10 h-10' : 'w-14 h-14'} bg-gradient-to-br from-[#b08968] to-[#967259] rounded-2xl flex items-center justify-center shadow-lg shadow-[#b08968]/30`}>
                  <BookOpen className={`${isPreview ? 'w-5 h-5' : 'w-7 h-7'} text-white`} />
                </div>
                <div>
                  <h2 className={`${isPreview ? 'text-lg' : 'text-2xl'} font-serif font-black text-slate-900 dark:text-white tracking-widest uppercase mb-1`}>El Libro</h2>
                </div>
              </div>
              <div className="space-y-4">
                {tabs.map(tab => {
                  const isActive = currentPage === tab.id;
                  return (
                    <button key={tab.id} onClick={() => setCurrentPage(tab.id)} className={`w-full text-left flex items-center gap-4 rounded-2xl transition-all duration-300 font-medium tracking-wide group ${isPreview ? 'px-3 py-3 text-sm' : 'px-5 py-4'} ${isActive ? 'bg-[#b08968] text-white dark:text-zinc-950 shadow-lg shadow-[#b08968]/20' : 'text-slate-500 dark:text-orange-200/60 hover:bg-slate-200 dark:hover:bg-zinc-900 hover:text-slate-800 dark:hover:text-zinc-200'}`}>
                      <tab.icon className={`${isPreview ? 'w-4 h-4' : 'w-5 h-5'} transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                      <span>{tab.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={`${isPreview ? 'pt-4 mt-6' : 'pt-8 mt-12'} border-t border-slate-200 dark:border-zinc-700`}>
              <div className={`flex justify-center ${isPreview ? 'gap-3' : 'gap-6'}`}>
                <button onClick={handleFavorite} className={`${isPreview ? 'p-3' : 'p-4'} rounded-full shadow-lg transition-all duration-300 hover:-translate-y-1 ${isFavorite ? 'bg-red-500 text-white shadow-red-500/20' : 'bg-slate-100 dark:bg-zinc-900 text-slate-400 dark:text-orange-200/60 hover:bg-slate-200 dark:hover:bg-zinc-800 hover:text-red-500 dark:hover:text-red-400 border border-slate-200 dark:border-zinc-700'}`} title={isFavorite ? "Ya no me gusta" : "Me gusta"}>
                  <Heart className={`${isPreview ? 'w-5 h-5' : 'w-6 h-6'} ${isFavorite ? 'fill-current' : ''}`} />
                </button>
                <button onClick={handleSave} className={`${isPreview ? 'p-3' : 'p-4'} rounded-full shadow-lg transition-all duration-300 hover:-translate-y-1 ${isSaved ? 'bg-yellow-500 text-white dark:text-zinc-950 shadow-yellow-500/20' : 'bg-slate-100 dark:bg-zinc-900 text-slate-400 dark:text-orange-200/60 hover:bg-slate-200 dark:hover:bg-zinc-800 hover:text-yellow-500 border border-slate-200 dark:border-zinc-700'}`} title={isSaved ? "Quitar de Guardados" : "Guardar Receta"}>
                  <Bookmark className={`${isPreview ? 'w-5 h-5' : 'w-6 h-6'} ${isSaved ? 'fill-current' : ''}`} />
                </button>
                <button onClick={handleShare} className={`${isPreview ? 'p-3' : 'p-4'} rounded-full bg-slate-100 dark:bg-zinc-900 text-slate-400 dark:text-orange-200/60 shadow-lg hover:bg-slate-200 dark:hover:bg-zinc-800 hover:text-slate-800 dark:hover:text-zinc-200 transition-all duration-300 hover:-translate-y-1 border border-slate-200 dark:border-zinc-700`} title="Compartir">
                  <Share2 className={`${isPreview ? 'w-5 h-5' : 'w-6 h-6'}`} />
                </button>
              </div>
            </div>
          </div>

          <div className={`flex-1 overflow-y-auto relative bg-transparent custom-scrollbar ${isPreview ? 'p-4 md:p-6' : 'p-8 md:p-12 xl:p-16'}`}>
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#b08968] opacity-[0.015] dark:opacity-[0.03] rounded-full blur-[100px] pointer-events-none"></div>
            <PageContent />

            {!isPreview && (
              <AdSenseBanner
                slot="9961213164"
                format="auto"
                className="mt-10 rounded-2xl"
              />
            )}

            <CollectionPickerModal
              isOpen={isCollectionModalOpen}
              onOpenChange={setIsCollectionModalOpen}
              recetaId={idReceta}
              onSaveComplete={handleCollectionSaveComplete}
            />
          </div>

        </div>
      </div>
    </div>
  );
}

export default function RecetaDetalle({ isPreview = false, ...props }) {
  return (
    <AuthProvider>
      <RecetaDetalleContent isPreview={isPreview} {...props} />
    </AuthProvider>
  );
}
