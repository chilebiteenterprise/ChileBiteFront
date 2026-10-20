import React, { useState, useEffect, useMemo } from 'react';
import { useAuth, AuthProvider } from '@/features/auth/context/AuthContext';
import RecipeCard from './RecipeCard';
import RecetaDetalle from './RecipeDetail'; 
import IngredientSelector from './IngredientSelector';
import { toast } from "@heroui/react";
import { 
  Youtube, 
  Smartphone, 
  Video, 
  BookOpen, 
  Image as ImageIcon, 
  UtensilsCrossed, 
  ListOrdered, 
  ChefHat, 
  Clock, 
  Users, 
  Flame, 
  Beef, 
  Wheat, 
  Droplet, 
  Globe, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Check, 
  CheckCircle2,
  ExternalLink, 
  X, 
  Eye, 
  EyeOff, 
  Sparkles,
  Layers,
  HelpCircle
} from 'lucide-react';
import { useRateLimit } from '@/hooks/useRateLimit';
import { supabase } from '@/lib/supabaseClient';
import { getVideoEmbedInfo } from '@/utils/videoHelper';

// Adaptador seguro para HeroUI v3 toast (evita pasar objetos directos como children de React)
const addToast = ({ title, description, color = 'default', timeout = 3500 }) => {
  const message = title || description || '';
  const options = {
    description: title && description ? description : undefined,
    timeout
  };
  if (color === 'danger' || color === 'error') {
    toast.danger(message, options);
  } else if (color === 'success') {
    toast.success(message, options);
  } else if (color === 'warning') {
    toast.warning(message, options);
  } else {
    toast(message, options);
  }
};

const DIFICULTADES = ['Muy Fácil', 'Fácil', 'Media', 'Difícil', 'Muy Difícil'];

const initialRecipeState = {
  nombre: '', 
  descripcion_corta: '', 
  descripcion_larga: '',
  preparacion: '', 
  dificultad: 'Media',
  pais: '', 
  tipo_plato: '', 
  estilos_vida: [],
  tiempo_preparacion: '', 
  sugerencias: '',
  numero_porcion: 1,
  imagen_url: '',
  video_url: '',
  ingredientes_detalle: []
};

// Estilo base unificado con tokens del sistema de diseño
const inputBaseStyle = "w-full bg-surface-input border border-border-subtle rounded-2xl px-4 py-3.5 text-sm text-text-main placeholder:text-text-subtle focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none shadow-sm transition-all";

const VIDEO_FORMAT_OPTIONS = [
  {
    id: 'youtube',
    label: 'YouTube',
    description: 'Video horizontal tradicional',
    placeholder: 'https://www.youtube.com/watch?v=... o https://youtu.be/...',
    icon: Youtube,
  },
  {
    id: 'shorts',
    label: 'Shorts',
    description: 'Formato vertical YouTube Shorts',
    placeholder: 'https://www.youtube.com/shorts/...',
    icon: Video,
  },
  {
    id: 'tiktok',
    label: 'TikTok',
    description: 'Video vertical de TikTok',
    placeholder: 'https://www.tiktok.com/@usuario/video/...',
    icon: Smartphone,
  },
];

const RecetaFormContent = () => {
  const { session, profile, loading: authLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [id, setId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recetaData, setRecetaData] = useState(initialRecipeState);
  const [authStatus, setAuthStatus] = useState('loading');
  
  // Estudio de vista previa
  const [showPreview, setShowPreview] = useState(false);
  const [vista, setVista] = useState('detalle'); // 'card' | 'detalle'
  
  // Taxonomías
  const [paises, setPaises] = useState([]);
  const [tiposPlato, setTiposPlato] = useState([]);
  const [estilosVida, setEstilosVida] = useState([]);
  const [videoFormat, setVideoFormat] = useState('youtube');

  // Pasos de preparación
  const [pasos, setPasos] = useState(['']);
  const [isOpenPais, setIsOpenPais] = useState(false);

  // Modal de notificación interactivo tras guardar
  const [saveSuccessModal, setSaveSuccessModal] = useState({
    isOpen: false,
    isEditing: false,
    recetaId: null,
    nombre: ''
  });

  const videoInfo = useMemo(() => getVideoEmbedInfo(recetaData.video_url), [recetaData.video_url]);
  const videoFieldHint = VIDEO_FORMAT_OPTIONS.find(option => option.id === videoFormat) || VIDEO_FORMAT_OPTIONS[0];

  // Anti-Spam Rate Limiting
  const { isRateLimited, executeWithLimit } = useRateLimit(3000);

  useEffect(() => {
    const fetchTaxonomias = async () => {
      const [{ data: paisesData }, { data: tiposData }, { data: estilosData }] = await Promise.all([
        supabase.from('core_pais').select('id, nombre').order('nombre'),
        supabase.from('core_tipoplato').select('id, nombre').order('nombre'),
        supabase.from('core_estilovida').select('id, nombre').order('nombre'),
      ]);
      if (paisesData) setPaises(paisesData);
      if (tiposData) setTiposPlato(tiposData);
      if (estilosData) setEstilosVida(estilosData);
    };
    fetchTaxonomias();
  }, []);

  useEffect(() => {
    if (!videoInfo?.platform) return;

    if (videoInfo.platform === 'TikTok') {
      setVideoFormat('tiktok');
      return;
    }

    if (recetaData.video_url?.includes('/shorts/')) {
      setVideoFormat('shorts');
      return;
    }

    setVideoFormat('youtube');
  }, [videoInfo?.platform, recetaData.video_url]);

  useEffect(() => {
    if (typeof window === 'undefined' || authLoading) return;

    if (profile) {
      if (profile.role === 'admin' || profile.rol === 'admin') {
        setAuthStatus('authorized');
      } else {
        window.location.href = '/';
      }
    } else {
      window.location.href = '/auth/login';
    }

    const params = new URLSearchParams(window.location.search);
    const currentId = params.get('id');
    if (currentId) {
      setId(currentId);
      setIsEditing(true);
      fetchRecipeDetails(currentId);
    } else {
      setLoading(false);
    }
  }, [profile, authLoading]);

  // Sincronizar pasos cuando se edita
  useEffect(() => {
    if (isEditing && recetaData.preparacion && pasos.length === 1 && pasos[0] === '') {
      const loadedPasos = recetaData.preparacion.split('\n\n').filter(p => p.trim() !== '');
      if (loadedPasos.length > 0) {
        setPasos(loadedPasos);
      }
    }
  }, [recetaData.preparacion, isEditing]);

  const fetchRecipeDetails = async (currentId) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('core_receta')
        .select(`
          *,
          ingredientes_detalle:core_recetaingrediente (
            cantidad,
            unidad,
            ingrediente:core_ingrediente ( id, nombre, tipo_medida, calorias_por_100g, proteinas_por_100g, carbohidratos_por_100g, grasas_por_100g, peso_por_unidad_gramos, peso_por_taza_gramos, peso_por_cucharada_gramos )
          ),
          core_receta_estilos_vida ( estilovida_id )
        `)
        .eq('id', currentId)
        .single();

      if (error) throw new Error(error.message);

      setRecetaData({
        ...initialRecipeState,
        id: data.id,
        nombre: data.nombre || '',
        descripcion_corta: data.descripcion_corta || '',
        descripcion_larga: data.descripcion_larga || '',
        preparacion: data.preparacion || '',
        dificultad: data.dificultad || 'Media',
        pais: data.pais_id || '',
        tipo_plato: data.tipo_plato_id || '',
        estilos_vida: (data.core_receta_estilos_vida || []).map(e => e.estilovida_id),
        tiempo_preparacion: data.tiempo_preparacion || '',
        sugerencias: data.sugerencias || '',
        numero_porcion: data.numero_porcion || 1,
        imagen_url: data.imagen_url || '',
        video_url: data.video_url || '',
        ingredientes_detalle: (data.ingredientes_detalle || []).map(item => ({
          ingrediente: item.ingrediente,
          cantidad: item.cantidad,
          unidad: item.unidad
        }))
      });
    } catch (error) {
      console.error("Error al obtener detalles:", error);
      addToast({
        title: "Error al cargar receta",
        description: error.message,
        color: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setRecetaData(prev => ({ ...prev, [name]: type === 'number' ? Number(value) : value }));
  };

  const handleTimeChange = (amount) => {
    setRecetaData(prev => {
      const current = Number(prev.tiempo_preparacion) || 0;
      const next = Math.max(1, current + amount);
      return { ...prev, tiempo_preparacion: next };
    });
  };

  // Pasos de preparación dinámicos
  const handlePasoChange = (index, value) => {
    const nuevosPasos = [...pasos];
    nuevosPasos[index] = value;
    setPasos(nuevosPasos);
    setRecetaData(prev => ({ ...prev, preparacion: nuevosPasos.join('\n\n') }));
  };
  const addPaso = () => setPasos([...pasos, '']);
  const removePaso = (index) => {
    const nuevosPasos = pasos.filter((_, i) => i !== index);
    setPasos(nuevosPasos.length ? nuevosPasos : ['']);
    setRecetaData(prev => ({ ...prev, preparacion: nuevosPasos.join('\n\n') }));
  };

  const handleEstiloVidaToggle = (idVal) => {
    setRecetaData(prev => {
      const current = prev.estilos_vida || [];
      if (current.includes(idVal)) return { ...prev, estilos_vida: current.filter(x => x !== idVal) };
      return { ...prev, estilos_vida: [...current, idVal] };
    });
  };

  const handleIngredientesChange = (nuevosIngredientes) => {
    setRecetaData(prev => ({ ...prev, ingredientes_detalle: nuevosIngredientes }));
  };

  // Macros en tiempo real
  const macrosLive = useMemo(() => {
    let cal = 0, prot = 0, carb = 0, gras = 0;
    (recetaData.ingredientes_detalle || []).forEach(item => {
      const { ingrediente, cantidad, unidad } = item;
      if (!ingrediente) return;
      const cant = parseFloat(cantidad) || 0;
      let multi = 0;

      if (unidad === 'g' || unidad === 'ml') {
        multi = cant / 100.0;
      } else if (unidad === 'kg' || unidad === 'l') {
        multi = (cant * 1000.0) / 100.0;
      } else if (unidad === 'cda') {
        const peso = parseFloat(ingrediente.peso_por_cucharada_gramos) || 15.0;
        multi = (cant * peso) / 100.0;
      } else if (unidad === 'taza') {
        const peso = parseFloat(ingrediente.peso_por_taza_gramos) || (ingrediente.tipo_medida === 'volumen' ? 240.0 : 200.0);
        multi = (cant * peso) / 100.0;
      } else {
        const peso = parseFloat(ingrediente.peso_por_unidad_gramos) || 100.0;
        multi = (cant * peso) / 100.0;
      }

      cal += (parseFloat(ingrediente.calorias_por_100g) || 0) * multi;
      prot += (parseFloat(ingrediente.proteinas_por_100g) || 0) * multi;
      carb += (parseFloat(ingrediente.carbohidratos_por_100g) || 0) * multi;
      gras += (parseFloat(ingrediente.grasas_por_100g) || 0) * multi;
    });
    return { cal: cal.toFixed(1), prot: prot.toFixed(1), carb: carb.toFixed(1), gras: gras.toFixed(1) };
  }, [recetaData.ingredientes_detalle]);

  const handleSubmit = (e) => {
    e.preventDefault();
    executeWithLimit(async () => {
      if (!session?.user?.id) {
        addToast({ title: "Acceso Denegado", description: "Debes iniciar sesión como administrador.", color: "danger" });
        return;
      }
      if (isEditing && !id) {
        addToast({ title: "Error Interno", description: "ID de receta no definido para editar.", color: "danger" });
        return;
      }

      // Sanitización segura tolerante a fallos
      let sanitize = (val) => (typeof val === 'string' ? val.trim() : (val || ''));
      try {
        const dompurifyModule = await import('dompurify');
        const dp = dompurifyModule.default || dompurifyModule;
        if (dp && typeof dp.sanitize === 'function') {
          sanitize = (val) => dp.sanitize(typeof val === 'string' ? val : (val || ''));
        }
      } catch (err) {
        console.warn('DOMPurify dynamic fallback:', err);
      }

      const preparacionFinal = sanitize(pasos.filter(p => p.trim() !== '').join('\n\n'));

      const totalCal = parseFloat(macrosLive.cal) || 0;
      const totalProt = parseFloat(macrosLive.prot) || 0;
      const totalCarb = parseFloat(macrosLive.carb) || 0;
      const totalGras = parseFloat(macrosLive.gras) || 0;

      const recetaPayload = {
        nombre: sanitize(recetaData.nombre || ''),
        descripcion_corta: sanitize(recetaData.descripcion_corta || ''),
        descripcion_larga: sanitize(recetaData.descripcion_larga || ''),
        preparacion: preparacionFinal,
        sugerencias: sanitize(recetaData.sugerencias || ''),
        dificultad: recetaData.dificultad,
        pais_id: recetaData.pais || null,
        tipo_plato_id: recetaData.tipo_plato || null,
        tiempo_preparacion: recetaData.tiempo_preparacion || null,
        numero_porcion: 1, // Porción base por defecto siempre es 1
        imagen_url: recetaData.imagen_url || null,
        video_url: recetaData.video_url || null,
        total_calorias: totalCal,
        total_proteinas: totalProt,
        total_carbohidratos: totalCarb,
        total_grasas: totalGras,
        user_id: session.user.id,
      };

      try {
        let recetaId = id;

        if (isEditing) {
          const { error } = await supabase
            .from('core_receta')
            .update(recetaPayload)
            .eq('id', id);
          if (error) throw new Error(error.message);
        } else {
          recetaPayload.contador_likes = 0;
          recetaPayload.fecha_creacion = new Date().toISOString();
          const { data: nuevaReceta, error } = await supabase
            .from('core_receta')
            .insert(recetaPayload)
            .select('id')
            .single();
          if (error) throw new Error(error.message);
          recetaId = nuevaReceta.id;
        }

        // Sincronizar ingredientes
        await supabase.from('core_recetaingrediente').delete().eq('receta_id', recetaId);
        const ingredientesRows = (recetaData.ingredientes_detalle || []).map(item => ({
          receta_id: recetaId,
          ingrediente_id: item.ingrediente?.id,
          cantidad: item.cantidad,
          unidad: item.unidad
        })).filter(r => r.ingrediente_id);
        if (ingredientesRows.length > 0) {
          const { error: ingError } = await supabase.from('core_recetaingrediente').insert(ingredientesRows);
          if (ingError) throw new Error(ingError.message);
        }

        // Sincronizar estilos de vida
        await supabase.from('core_receta_estilos_vida').delete().eq('receta_id', recetaId);
        const estilosRows = (recetaData.estilos_vida || []).map(estiloId => ({
          receta_id: recetaId,
          estilovida_id: estiloId
        }));
        if (estilosRows.length > 0) {
          await supabase.from('core_receta_estilos_vida').insert(estilosRows);
        }

        // Notificación modal interactiva que el usuario puede cerrar
        setSaveSuccessModal({
          isOpen: true,
          isEditing,
          recetaId,
          nombre: recetaData.nombre || 'Receta'
        });

        addToast({
          title: `¡Receta ${isEditing ? 'modificada' : 'creada'} con éxito!`,
          description: "Los cambios han sido guardados correctamente.",
          color: "success",
          timeout: 3500,
        });

      } catch (error) {
        console.error("Error al enviar la receta:", error);
        addToast({
          title: "Error al guardar",
          description: error.message,
          color: "danger",
          timeout: 5000,
        });
      }
    });
  };

  if (authStatus === 'loading' || loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="font-bold text-text-muted">Inicializando Estudio de Recetas...</p>
        </div>
      </div>
    );
  }

  // Objeto para live preview
  const selectedCountry = paises.find(p => p.id === Number(recetaData.pais));
  const recetaParaPreview = {
    ...recetaData,
    preparacion: pasos.join('\n\n'),
    pais_nombre: selectedCountry ? selectedCountry.nombre : '',
    total_calorias: macrosLive.cal,
    total_proteinas: macrosLive.prot,
    total_carbohidratos: macrosLive.carb,
    total_grasas: macrosLive.gras
  };

  return (
    <div className="w-full min-h-screen pb-32 animate-fade-in">

      {/* HEADER SUPERIOR CON NAVEGACIÓN Y ACCIONES RÁPIDAS */}
      <div className="sticky top-0 z-40 bg-surface-card/85 backdrop-blur-xl border-b border-border-subtle py-4 px-4 md:px-8 mb-8">
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
              type="button"
              onClick={() => window.location.href = "/recipes"} 
              className="flex items-center justify-center w-11 h-11 rounded-2xl bg-surface-muted hover:bg-surface-elevated text-text-muted hover:text-brand-primary border border-border-subtle transition-all active:scale-95"
              title="Volver al recetario"
              aria-label="Volver al recetario"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary">
                  {isEditing ? 'Modo Edición' : 'Nueva Receta'}
                </span>
                {recetaData.nombre && (
                  <span className="text-xs text-text-subtle font-medium truncate max-w-[200px] sm:max-w-[300px]">
                    • {recetaData.nombre}
                  </span>
                )}
              </div>
              <h1 className="text-xl md:text-2xl font-serif font-black text-text-main leading-tight">
                {isEditing ? 'Editar Receta' : 'Crear Receta Culinaria'}
              </h1>
            </div>
          </div>

          {/* Selector de Vista Previa */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                showPreview 
                  ? 'bg-brand-primary text-white border-brand-primary shadow-sm' 
                  : 'bg-surface-card text-text-muted border-border-subtle hover:text-text-main hover:bg-surface-muted'
              }`}
            >
              {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{showPreview ? 'Ocultar Vista Previa' : 'Ver Vista Previa'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ÁREA DE VISTA PREVIA COLAPSABLE */}
      {showPreview && (
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 mb-12 animate-fade-in">
          <div className="premium-glass-wrapper bg-surface-card rounded-[2.5rem] border border-border-subtle shadow-xl overflow-hidden p-6 md:p-8">
            <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-border-subtle">
              <div className="flex items-center gap-3">
                <span className="size-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
                <div>
                  <h3 className="font-extrabold text-sm text-text-main leading-none">Previsualización en Vivo</h3>
                  <span className="text-xs text-text-subtle">Los cambios se reflejan automáticamente</span>
                </div>
              </div>
              <div className="flex items-center bg-surface-muted rounded-xl p-1 border border-border-subtle">
                <button
                  type="button"
                  onClick={() => setVista('detalle')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    vista === 'detalle' ? 'bg-brand-primary text-white shadow-sm' : 'text-text-muted hover:text-text-main'
                  }`}
                >
                  Detalle
                </button>
                <button
                  type="button"
                  onClick={() => setVista('card')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    vista === 'card' ? 'bg-brand-primary text-white shadow-sm' : 'text-text-muted hover:text-text-main'
                  }`}
                >
                  Tarjeta
                </button>
              </div>
            </div>

            {vista === 'card' ? (
              <div className="max-w-md mx-auto py-6">
                <RecipeCard receta={recetaParaPreview} usuarioEsAdmin={false} />
              </div>
            ) : (
              <div className="w-full">
                <RecetaDetalle receta={recetaParaPreview} modoLocal={true} usuarioEsAdmin={false} isPreview={true} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* FORMULARIO ORGANIZADO EN 4 BLOQUES TEMÁTICOS */}
      <form onSubmit={handleSubmit} className="max-w-[1400px] mx-auto px-4 md:px-8 flex flex-col gap-8">

        {/* =========================================================================
            BLOQUE 1: IDENTIDAD Y CLASIFICACIÓN
           ========================================================================= */}
        <section className="premium-glass-wrapper bg-surface-card rounded-[2rem] border border-border-subtle p-6 md:p-8 shadow-sm">
          {/* Header del Bloque */}
          <div className="flex items-center justify-between pb-6 mb-6 border-b border-border-subtle">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center font-black text-sm">
                01
              </div>
              <div>
                <h2 className="text-xl font-serif font-black text-text-main flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-brand-primary" /> Identidad y Clasificación
                </h2>
                <p className="text-xs text-text-muted mt-0.5">Nombre, descripción, categorías y métricas de cocción</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {/* Nombre de la Receta */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                Nombre de la Receta <span className="text-red-500">*</span>
              </label>
              <input 
                name="nombre"
                value={recetaData.nombre}
                onChange={handleChange}
                className="w-full bg-surface-input border border-border-subtle rounded-2xl px-5 py-4 text-xl md:text-2xl font-serif font-bold text-text-main focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none shadow-sm transition-all placeholder:text-text-subtle"
                placeholder="Ej. Cazuela de Vacuno Tradicional" 
                required
              />
            </div>

            {/* Descripciones en Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted">Descripción Corta</label>
                  <span className="text-[10px] text-text-subtle">
                    {recetaData.descripcion_corta?.length || 0} / 255
                  </span>
                </div>
                <textarea 
                  name="descripcion_corta"
                  value={recetaData.descripcion_corta}
                  onChange={handleChange}
                  maxLength={255}
                  className={`${inputBaseStyle} resize-none min-h-[110px]`} 
                  placeholder="Un breve resumen que atrape al lector en el catálogo..." 
                  rows="3"
                ></textarea>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-text-muted">Historia o Descripción Detallada</label>
                <textarea 
                  name="descripcion_larga"
                  value={recetaData.descripcion_larga}
                  onChange={handleChange}
                  className={`${inputBaseStyle} resize-none min-h-[110px]`} 
                  placeholder="Origen de la receta, anécdotas o contexto familiar y cultural..." 
                  rows="3"
                ></textarea>
              </div>
            </div>

            {/* Métricas: Tiempo Total y Dificultad */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border-subtle/60">
              
              {/* Tiempo de Preparación */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-brand-primary" /> Tiempo Total (Minutos)
                </label>
                <div className="flex items-center gap-2">
                  <button 
                    type="button" 
                    onClick={() => handleTimeChange(-5)} 
                    className="w-11 h-11 rounded-xl bg-surface-muted hover:bg-surface-elevated border border-border-subtle text-text-main font-bold text-lg transition-all flex items-center justify-center active:scale-95 shrink-0"
                  >
                    −
                  </button>
                  <input 
                    name="tiempo_preparacion"
                    type="number"
                    min="1"
                    value={recetaData.tiempo_preparacion}
                    onChange={handleChange}
                    className="w-full bg-surface-input border border-border-subtle rounded-xl px-3 py-2.5 text-center text-lg font-extrabold text-text-main focus:border-brand-primary outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                    placeholder="45"
                  />
                  <button 
                    type="button" 
                    onClick={() => handleTimeChange(5)} 
                    className="w-11 h-11 rounded-xl bg-surface-muted hover:bg-surface-elevated border border-border-subtle text-text-main font-bold text-lg transition-all flex items-center justify-center active:scale-95 shrink-0"
                  >
                    +
                  </button>
                </div>
                <div className="flex gap-2 justify-center pt-1">
                  {[15, 30, 45, 60, 90].map(m => (
                    <button 
                      type="button" 
                      key={m} 
                      onClick={() => setRecetaData(prev => ({ ...prev, tiempo_preparacion: m }))} 
                      className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all ${
                        Number(recetaData.tiempo_preparacion) === m 
                          ? 'bg-brand-primary text-white border-brand-primary' 
                          : 'bg-surface-muted/60 border-border-subtle text-text-muted hover:border-brand-primary/50'
                      }`}
                    >
                      {m}m
                    </button>
                  ))}
                </div>
              </div>

              {/* Dificultad */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-brand-primary" /> Nivel de Dificultad
                </label>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {DIFICULTADES.map(d => {
                    const isSelected = recetaData.dificultad === d;
                    return (
                      <button 
                        key={d}
                        type="button"
                        onClick={() => handleChange({ target: { name: 'dificultad', value: d, type: 'text'} })}
                        className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition-all ${
                          isSelected 
                            ? 'bg-brand-primary border-brand-primary text-white shadow-sm' 
                            : 'bg-surface-muted border-border-subtle text-text-muted hover:border-brand-primary/50'
                        }`}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Taxonomías: País, Tipo de Plato y Estilos */}
            <div className="pt-6 border-t border-border-subtle/60 flex flex-col gap-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Selector de País */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-brand-primary" /> País de Origen
                  </label>
                  <div className="relative">
                    <button 
                      type="button" 
                      onClick={() => setIsOpenPais(!isOpenPais)} 
                      className={`${inputBaseStyle} flex justify-between items-center text-left`}
                    >
                      <span className="font-semibold truncate">
                        {recetaData.pais ? paises.find(p => p.id === Number(recetaData.pais))?.nombre : "Selecciona País de Origen..."}
                      </span>
                      <svg xmlns="http://www.w3.org/2000/svg" className={`size-4 text-text-subtle transition-transform duration-300 ${isOpenPais ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {isOpenPais && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsOpenPais(false)}></div>
                        <div className="absolute z-50 w-full mt-2 bg-surface-card border border-border-subtle rounded-2xl shadow-2xl max-h-60 overflow-y-auto py-2 top-full left-0 custom-scrollbar">
                          {paises.map(p => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => {
                                handleChange({ target: { name: 'pais', value: p.id, type: 'number' } });
                                setIsOpenPais(false);
                              }}
                              className={`w-full text-left px-5 py-3 text-sm font-semibold transition-colors flex items-center gap-3 ${
                                Number(recetaData.pais) === p.id 
                                  ? 'bg-brand-primary/10 text-brand-primary' 
                                  : 'text-text-main hover:bg-surface-muted hover:text-brand-primary'
                              }`}
                            >
                              <div className="w-7 h-7 rounded-lg bg-surface-muted text-brand-primary text-xs font-bold flex items-center justify-center shrink-0">
                                {p.nombre.substring(0, 2).toUpperCase()}
                              </div>
                              <span className="truncate">{p.nombre}</span>
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Tipo de Plato Chips */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                    <UtensilsCrossed className="w-4 h-4 text-brand-primary" /> Tipo de Plato
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {tiposPlato.map(tp => {
                      const isSelected = String(recetaData.tipo_plato) === String(tp.id);
                      return (
                        <button 
                          key={tp.id}
                          type="button"
                          onClick={() => handleChange({ target: { name: 'tipo_plato', value: tp.id, type: 'number'} })}
                          className={`px-4 py-2 rounded-xl border text-xs font-bold transition-all ${
                            isSelected 
                              ? 'bg-brand-primary border-brand-primary text-white shadow-sm' 
                              : 'bg-surface-muted border-border-subtle text-text-muted hover:border-brand-primary/50'
                          }`}
                        >
                          {tp.nombre}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Estilos de Vida Chips */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-brand-primary" /> Estilos de Vida & Dietas
                </label>
                <div className="flex flex-wrap gap-2">
                  {estilosVida.map(ev => {
                    const isChecked = recetaData.estilos_vida.includes(ev.id);
                    return (
                      <button 
                        key={ev.id}
                        type="button"
                        onClick={() => handleEstiloVidaToggle(ev.id)}
                        className={`px-4 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 ${
                          isChecked 
                            ? 'bg-brand-primary border-brand-primary text-white shadow-sm' 
                            : 'bg-surface-muted border-border-subtle text-text-muted hover:border-brand-primary/50'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${isChecked ? 'bg-white' : 'bg-brand-primary'}`}></span>
                        {ev.nombre}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* =========================================================================
            BLOQUE 2: CONTENIDO MULTIMEDIA
           ========================================================================= */}
        <section className="premium-glass-wrapper bg-surface-card rounded-[2rem] border border-border-subtle p-6 md:p-8 shadow-sm">
          <div className="flex items-center justify-between pb-6 mb-6 border-b border-border-subtle">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center font-black text-sm">
                02
              </div>
              <div>
                <h2 className="text-xl font-serif font-black text-text-main flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-brand-primary" /> Contenido Multimedia
                </h2>
                <p className="text-xs text-text-muted mt-0.5">Fotografía destacada del plato y video tutorial paso a paso</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            
            {/* Imagen Principal */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5 mb-2">
                  <ImageIcon className="w-4 h-4 text-brand-primary" /> URL de Imagen Principal (Portada)
                </label>
                <input 
                  name="imagen_url"
                  value={recetaData.imagen_url}
                  onChange={handleChange}
                  className={inputBaseStyle} 
                  placeholder="https://ejemplo.com/fotos/empanada.webp" 
                />
              </div>

              {/* Preview de la imagen */}
              <div className="aspect-[16/10] w-full rounded-2xl overflow-hidden border border-border-subtle bg-surface-muted flex items-center justify-center relative shadow-inner">
                {recetaData.imagen_url ? (
                  <img 
                    src={recetaData.imagen_url} 
                    alt="Vista previa de portada" 
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-text-subtle p-6 text-center">
                    <ImageIcon className="w-10 h-10 stroke-1" />
                    <span className="text-xs font-medium">Pega una URL válida para previsualizar la fotografía</span>
                  </div>
                )}
              </div>
            </div>

            {/* Video Tutorial */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5 mb-2">
                  <Video className="w-4 h-4 text-brand-primary" /> Video Tutorial (Opcional)
                </label>
                
                {/* Formato del Video */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {VIDEO_FORMAT_OPTIONS.map(option => {
                    const Icon = option.icon;
                    const isSelected = videoFormat === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setVideoFormat(option.id)}
                        className={`rounded-xl border p-3 text-left transition-all ${
                          isSelected
                            ? 'border-brand-primary bg-brand-primary/10 text-brand-primary font-bold shadow-xs'
                            : 'border-border-subtle bg-surface-muted/60 text-text-muted hover:border-brand-primary/40'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          <span className="text-xs font-bold">{option.label}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <input 
                  name="video_url"
                  value={recetaData.video_url}
                  onChange={handleChange}
                  className={inputBaseStyle} 
                  placeholder={videoFieldHint.placeholder} 
                  type="url"
                />
                <p className="text-[11px] text-text-subtle mt-1.5">
                  Formato activo: <span className="font-semibold text-text-main">{videoFieldHint.label}</span> ({videoFieldHint.description}).
                </p>
              </div>

              {/* Hint explicativo */}
              <div className="p-4 rounded-xl bg-surface-muted/60 border border-border-subtle text-xs text-text-muted space-y-1">
                <p className="font-bold text-text-main flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-brand-primary" /> Compatibilidad de videos
                </p>
                <p>
                  El reproductor integrado de ChileBite es compatible con videos horizontales de YouTube, videos verticales de YouTube Shorts y publicaciones de TikTok.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* =========================================================================
            BLOQUE 3: INGREDIENTES Y ESTIMACIÓN NUTRICIONAL
           ========================================================================= */}
        <section className="premium-glass-wrapper bg-surface-card rounded-[2rem] border border-border-subtle p-6 md:p-8 shadow-sm">
          <div className="flex items-center justify-between pb-6 mb-6 border-b border-border-subtle">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center font-black text-sm">
                03
              </div>
              <div>
                <h2 className="text-xl font-serif font-black text-text-main flex items-center gap-2">
                  <UtensilsCrossed className="w-5 h-5 text-brand-primary" /> Ingredientes y Nutrición
                </h2>
                <p className="text-xs text-text-muted mt-0.5">Cantidades, unidades permitidas y cálculo automático de macronutrientes</p>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {/* Selector interactivo de ingredientes */}
            <IngredientSelector 
              ingredientes_detalle={recetaData.ingredientes_detalle} 
              onChange={handleIngredientesChange} 
            />

            {/* Estimación Nutricional en Vivo */}
            <div className="pt-6 border-t border-border-subtle/60">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
                <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-brand-primary" /> Estimación Nutricional por Porción Base ({recetaData.numero_porcion} {recetaData.numero_porcion === 1 ? 'porción' : 'porciones'})
                </h3>
                <span className="text-[10px] text-text-subtle">Cálculo dinámico en tiempo real</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Calorías */}
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center">
                  <Flame className="w-5 h-5 mx-auto mb-1 text-amber-500" />
                  <p className="text-2xl font-black text-amber-600 dark:text-amber-400">
                    {macrosLive.cal}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-text-subtle mt-0.5">Calorías (kcal)</p>
                </div>

                {/* Proteínas */}
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center">
                  <Beef className="w-5 h-5 mx-auto mb-1 text-rose-500" />
                  <p className="text-2xl font-black text-rose-600 dark:text-rose-400">
                    {macrosLive.prot}g
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-text-subtle mt-0.5">Proteínas</p>
                </div>

                {/* Carbohidratos */}
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                  <Wheat className="w-5 h-5 mx-auto mb-1 text-emerald-500" />
                  <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    {macrosLive.carb}g
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-text-subtle mt-0.5">Carbohidratos</p>
                </div>

                {/* Grasas */}
                <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-center">
                  <Droplet className="w-5 h-5 mx-auto mb-1 text-sky-500" />
                  <p className="text-2xl font-black text-sky-600 dark:text-sky-400">
                    {macrosLive.gras}g
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-text-subtle mt-0.5">Grasas Totales</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            BLOQUE 4: PREPARACIÓN Y CONSEJOS DEL CHEF
           ========================================================================= */}
        <section className="premium-glass-wrapper bg-surface-card rounded-[2rem] border border-border-subtle p-6 md:p-8 shadow-sm">
          <div className="flex items-center justify-between pb-6 mb-6 border-b border-border-subtle">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center font-black text-sm">
                04
              </div>
              <div>
                <h2 className="text-xl font-serif font-black text-text-main flex items-center gap-2">
                  <ListOrdered className="w-5 h-5 text-brand-primary" /> Preparación y Consejos del Chef
                </h2>
                <p className="text-xs text-text-muted mt-0.5">Pasos ordenados de elaboración y trucos culinarios</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Lista secuencial de pasos */}
            <div className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                Pasos de Preparación <span className="text-red-500">*</span>
              </label>

              <div className="space-y-4">
                {pasos.map((paso, index) => (
                  <div key={index} className="flex gap-3 md:gap-4 items-start group">
                    {/* Badge del número de paso */}
                    <div className="shrink-0 w-9 h-9 rounded-xl bg-brand-primary/10 text-brand-primary border border-brand-primary/20 flex items-center justify-center font-black text-sm mt-1">
                      {index + 1}
                    </div>

                    {/* Textarea del paso */}
                    <div className="flex-1 relative">
                      <textarea 
                        value={paso}
                        onChange={(e) => handlePasoChange(index, e.target.value)}
                        className={`${inputBaseStyle} resize-none min-h-[90px]`} 
                        placeholder={`Describe el Paso ${index + 1} (ej. En una olla a fuego medio dora la cebolla picada fina con una pizca de sal)...`} 
                        required
                      ></textarea>

                      {pasos.length > 1 && (
                        <button 
                          type="button" 
                          onClick={() => removePaso(index)}
                          className="absolute top-2 right-2 p-1.5 bg-surface-card hover:bg-red-500/10 text-text-subtle hover:text-red-500 rounded-lg border border-border-subtle transition-all"
                          title="Eliminar este paso"
                          aria-label={`Eliminar paso ${index + 1}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Botón para añadir paso */}
              <button 
                type="button" 
                onClick={addPaso}
                className="w-full py-3.5 rounded-2xl border-2 border-dashed border-border-subtle text-text-muted hover:text-brand-primary hover:border-brand-primary/50 hover:bg-brand-primary/5 transition-all font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.99]"
              >
                <Plus className="w-4 h-4" /> Añadir Siguiente Paso
              </button>
            </div>

            {/* Consejos y Sugerencias del Chef */}
            <div className="pt-6 border-t border-border-subtle/60 space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                <ChefHat className="w-4 h-4 text-brand-primary" /> Sugerencias y Trucos del Chef (Opcional)
              </label>
              <textarea 
                name="sugerencias"
                value={recetaData.sugerencias}
                onChange={handleChange}
                className={`${inputBaseStyle} resize-none min-h-[90px]`} 
                placeholder="Trucos del chef, sugerencias de acompañamiento o sustituciones de ingredientes si falta algo en la despensa..." 
                rows="3"
              ></textarea>
            </div>

          </div>
        </section>

        {/* =========================================================================
            BARRA DE ACCIONES INFERIOR (STICKY)
           ========================================================================= */}
        <div className="sticky bottom-6 z-40 bg-surface-card/90 backdrop-blur-xl border border-border-subtle rounded-3xl p-4 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-text-muted hidden sm:block">
            {isEditing ? (
              <span>Editando receta <strong className="text-text-main">{recetaData.nombre || 'sin título'}</strong></span>
            ) : (
              <span>Completa los campos obligatorios antes de publicar</span>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button 
              type="button"
              onClick={() => window.location.href = '/recipes'}
              className="px-6 py-3 rounded-2xl text-sm font-bold text-text-muted hover:text-text-main hover:bg-surface-muted transition-all"
            >
              Descartar
            </button>
            <button 
              type="submit"
              disabled={isRateLimited}
              className={`px-8 py-3.5 rounded-2xl text-sm font-black shadow-lg transition-all flex items-center justify-center gap-2.5 ${
                isRateLimited 
                  ? 'bg-surface-muted text-text-subtle cursor-not-allowed shadow-none' 
                  : 'bg-brand-primary hover:bg-brand-hover text-white shadow-brand-primary/25 hover:shadow-brand-primary/40 active:scale-98'
              }`}
            >
              {isRateLimited ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Check className="w-4 h-4" />
              )}
              <span>{isEditing ? 'Guardar Cambios' : 'Publicar Receta'}</span>
            </button>
          </div>
        </div>

      </form>

      {/* =========================================================================
          MODAL DE CONFIRMACIÓN INTERACTIVO TRAS GUARDAR / CREAR RECETA
         ========================================================================= */}
      {saveSuccessModal.isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-titulo-guardado"
        >
          {/* Fondo para cerrar al hacer clic afuera */}
          <div 
            className="absolute inset-0"
            onClick={() => setSaveSuccessModal(prev => ({ ...prev, isOpen: false }))}
          ></div>

          <div className="relative w-full max-w-md bg-surface-elevated border border-border-subtle rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6 z-10 animate-scale-in">
            {/* Botón Cerrar (X) */}
            <button 
              type="button"
              onClick={() => setSaveSuccessModal(prev => ({ ...prev, isOpen: false }))}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-surface-muted hover:bg-surface-card border border-border-subtle text-text-muted hover:text-text-main flex items-center justify-center transition-all shadow-sm active:scale-95"
              title="Cerrar notificación"
              aria-label="Cerrar notificación"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Ícono de Éxito */}
            <div className="w-16 h-16 rounded-3xl bg-green-500/10 border border-green-500/20 text-green-500 mx-auto flex items-center justify-center shadow-inner">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            {/* Textos Informativos */}
            <div className="space-y-2">
              <span className="inline-block text-[10px] font-black uppercase tracking-wider text-green-600 dark:text-green-400 bg-green-500/10 px-3 py-1 rounded-full">
                {saveSuccessModal.isEditing ? 'Cambios Guardados' : 'Receta Publicada'}
              </span>
              <h3 id="modal-titulo-guardado" className="text-xl font-serif font-black text-text-main">
                {saveSuccessModal.isEditing ? '¡Receta Modificada con Éxito!' : '¡Receta Creada con Éxito!'}
              </h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Los datos de <strong className="text-text-main font-bold">"{saveSuccessModal.nombre}"</strong> fueron registrados y guardados correctamente en la base de datos.
              </p>
            </div>

            {/* Acciones para el usuario */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSaveSuccessModal(prev => ({ ...prev, isOpen: false }))}
                className="flex-1 py-3 px-4 rounded-xl border border-border-subtle bg-surface-muted hover:bg-surface-card text-text-main font-bold text-xs transition-all active:scale-95"
              >
                Seguir Editando
              </button>

              <button
                type="button"
                onClick={() => window.location.href = '/recipes'}
                className="flex-1 py-3 px-4 rounded-xl bg-brand-primary hover:bg-brand-hover text-white font-bold text-xs shadow-md shadow-brand-primary/20 transition-all flex items-center justify-center gap-1.5 active:scale-95"
              >
                <span>Ir al Recetario</span>
              </button>

              {saveSuccessModal.recetaId && (
                <button
                  type="button"
                  onClick={() => window.location.href = `/recipes/${saveSuccessModal.recetaId}`}
                  className="py-3 px-3 rounded-xl border border-border-subtle bg-surface-muted hover:bg-surface-card text-text-muted hover:text-brand-primary transition-all flex items-center justify-center active:scale-95"
                  title="Ver receta pública"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function RecipeEditor() {
  return (
    <AuthProvider>
      <RecetaFormContent />
    </AuthProvider>
  );
}
