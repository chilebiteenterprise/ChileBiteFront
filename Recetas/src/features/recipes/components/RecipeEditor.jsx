import React, { useState, useEffect, useMemo } from 'react';
import { useAuth, AuthProvider } from '@/features/auth/context/AuthContext';
import RecipeCard from './RecipeCard';
import RecetaDetalle from './RecipeDetail'; 
import IngredientSelector from './IngredientSelector';
import { addToast, ToastProvider } from "@heroui/toast";

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

// Constante para estilos de inputs unificados
const inputBaseStyle = "w-full bg-white dark:bg-[#0f1115] border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 text-sm text-slate-700 dark:text-slate-200 focus:border-[#b08969] focus:ring-1 focus:ring-[#b08969] outline-none shadow-sm transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600";

const RecetaFormContent = () => {
  const { session, profile, loading: authLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [id, setId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recetaData, setRecetaData] = useState(initialRecipeState);
  const [authStatus, setAuthStatus] = useState('loading');
  const [vista, setVista] = useState('detalle'); // Default to detalle to see steps better
  const [paises, setPaises] = useState([]);
  const [tiposPlato, setTiposPlato] = useState([]);
  const [estilosVida, setEstilosVida] = useState([]);

  // Estados visuales custom
  const [pasos, setPasos] = useState(['']);
  const [isOpenPais, setIsOpenPais] = useState(false);

  useEffect(() => {
    const rawApiUrl = import.meta.env.PUBLIC_API_URL || "https://chilebiteback.onrender.com";
    const apiUrl = rawApiUrl?.startsWith("http") ? rawApiUrl : `https://${rawApiUrl}`;
    fetch(`${apiUrl}/api/taxonomies/paises/`).then(r => r.json()).then(data => setPaises(data));
    fetch(`${apiUrl}/api/taxonomies/tipos_plato/`).then(r => r.json()).then(data => setTiposPlato(data));
    fetch(`${apiUrl}/api/taxonomies/estilos_vida/`).then(r => r.json()).then(data => setEstilosVida(data));
  }, []);

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

  // Sync Pasos whenever recetaData.preparacion is loaded from backend initially
  useEffect(() => {
    if (isEditing && recetaData.preparacion && pasos.length === 1 && pasos[0] === '') {
        const loadedPasos = recetaData.preparacion.split('\n\n').filter(p => p.trim() !== '');
        if (loadedPasos.length > 0) {
            setPasos(loadedPasos);
        }
    }
  }, [recetaData.preparacion, isEditing]);

  const getAuthToken = () => {
    return session?.access_token || localStorage.getItem('access_token');
  };

  const fetchRecipeDetails = async (currentId) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/recetas/${currentId}/`);
      if (!res.ok) throw new Error("Error al cargar la receta para editar.");
      const data = await res.json();
      setRecetaData({ ...initialRecipeState, ...data, id: data.id || currentId });
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

  // Funciones para Pasos Dinámicos
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

  const macrosLive = useMemo(() => {
    let cal = 0, prot = 0, carb = 0, gras = 0;
    (recetaData.ingredientes_detalle || []).forEach(item => {
      const { ingrediente, cantidad, unidad } = item;
      let multi = 0;
      if (unidad === 'g' || unidad === 'ml') {
        multi = parseFloat(cantidad) / 100.0;
      } else {
        const peso = ingrediente.peso_por_unidad_gramos || 100.0;
        multi = (parseFloat(cantidad) * parseFloat(peso)) / 100.0;
      }
      cal += parseFloat(ingrediente.calorias_por_100g) * multi;
      prot += parseFloat(ingrediente.proteinas_por_100g) * multi;
      carb += parseFloat(ingrediente.carbohidratos_por_100g) * multi;
      gras += parseFloat(ingrediente.grasas_por_100g) * multi;
    });
    return { cal: cal.toFixed(1), prot: prot.toFixed(1), carb: carb.toFixed(1), gras: gras.toFixed(1) };
  }, [recetaData.ingredientes_detalle]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = getAuthToken();
    if (!token) {
        addToast({ title: "Acceso Denegado", description: "Token de administrador no encontrado.", color: "danger" });
        return;
    }
    if (isEditing && !id) {
        addToast({ title: "Error Interno", description: "ID de receta no definido para editar.", color: "danger" });
        return;
    }

    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing
      ? `/api/recetas/${id}/`
      : `/api/recetas/`;

    const formattedIngredientes = (recetaData.ingredientes_detalle || []).map(item => ({
      ingrediente_id: item.ingrediente?.id,
      cantidad: item.cantidad,
      unidad: item.unidad
    }));

    // Ensure final array join (using standard \n\n instead of double escaped)
    const finalData = { 
        ...recetaData, 
        preparacion: pasos.filter(p => p.trim() !== '').join('\n\n'),
        ingredientes_detalle: formattedIngredientes
    };
    if (!isEditing) finalData.contador_likes = 0;

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(finalData),
      });

      let data;
      try { data = await response.json(); } catch { data = null; }

      if (response.ok) {
        addToast({
            title: `Receta ${isEditing ? 'modificada' : 'creada'} con éxito`,
            description: "Redirigiendo al recetario...",
            color: "success",
            timeout: 3000,
            className: "bg-white dark:bg-[#0f1115] text-[#17c964] border-2 border-[#17c964]/30 font-bold",
        });
        setTimeout(() => window.location.href='/recipes', 3000);
      } else {
        const errorMsg = data?.detail || data || `Fallo al guardar (Código: ${response.status})`;
        throw new Error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
      }
    } catch (error) {
      console.error("Error al enviar la receta:", error);
      addToast({
          title: "Error al guardar",
          description: error.message,
          color: "danger",
          timeout: 5000,
          className: "bg-white dark:bg-[#0f1115] text-[#f31260] border-2 border-[#f31260]/30 font-bold",
      });
    }
  };

  if (authStatus === 'loading' || loading)
    return <div className="p-10 text-center font-bold text-slate-600">Inicializando Studio...</div>;

  return (
    <div className="flex flex-col xl:flex-row gap-8 px-4 md:px-8 py-8 w-full max-w-[1600px] mx-auto min-h-screen">
      
      {/* LEFT PANEL: PREMIUM CREATOR STUDIO FORM */}
      <form onSubmit={handleSubmit} className="w-full xl:w-[50%] flex flex-col gap-10">
        
        {/* HERO MEDIA SECTION */}
        <section className="bg-white dark:bg-[#1a1c23] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Contenido Multimedia & Tiempo</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                {/* Imagen URL */}
                <div className="md:col-span-2 space-y-3">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">URL de Imagen Principal</label>
                    <input 
                        name="imagen_url"
                        value={recetaData.imagen_url}
                        onChange={handleChange}
                        className={inputBaseStyle} 
                        placeholder="https://ejemplo.com/imagen.jpg" 
                        required
                    />
                    {/* Preview Rápido */}
                    {recetaData.imagen_url && (
                        <div className="h-40 w-full rounded-xl overflow-hidden mt-2 border border-slate-200 dark:border-slate-800">
                             <img src={recetaData.imagen_url} alt="Vista Previa" className="w-full h-full object-cover" />
                        </div>
                    )}
                </div>

                {/* Video URL */}
                <div className="space-y-3">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">URL de Video (Opcional)</label>
                    <input 
                        name="video_url"
                        value={recetaData.video_url}
                        onChange={handleChange}
                        className={inputBaseStyle}
                        placeholder="Enlace de YouTube/Vimeo" 
                        type="url"
                    />
                </div>

                {/* Tiempo de Preparación Rediseñado */}
                <div className="space-y-3">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Minutos (Prep + Cocción)</label>
                    <div className="flex items-center gap-2">
                        <button type="button" onClick={() => handleTimeChange(-5)} className="size-11 rounded-xl bg-slate-100 dark:bg-[#0f1115] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold text-xl hover:bg-[#b08969] hover:text-white transition-all shadow-sm flex shrink-0 items-center justify-center active:scale-95">−</button>
                        <input 
                            name="tiempo_preparacion"
                            type="number"
                            min="1"
                            value={recetaData.tiempo_preparacion}
                            onChange={handleChange}
                            className="w-full bg-white dark:bg-[#0f1115] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-center text-lg font-bold text-slate-900 dark:text-white focus:border-[#b08969] focus:ring-1 focus:ring-[#b08969] outline-none shadow-sm transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600" 
                        />
                        <button type="button" onClick={() => handleTimeChange(5)} className="size-11 rounded-xl bg-slate-100 dark:bg-[#0f1115] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold text-xl hover:bg-[#b08969] hover:text-white transition-all shadow-sm flex shrink-0 items-center justify-center active:scale-95">+</button>
                    </div>
                    <div className="flex gap-2 justify-center mt-2">
                        {[15, 30, 45, 60].map(m => (
                            <button type="button" key={m} onClick={() => setRecetaData(prev => ({...prev, tiempo_preparacion: m}))} className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 hover:border-[#b08969] hover:text-[#b08969] transition-all bg-white dark:bg-[#0f1115] shadow-sm active:scale-95">
                                {m}m
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </section>

        {/* TEXT DATA SECTION */}
        <section className="bg-white dark:bg-[#1a1c23] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col gap-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Información de la Receta</h3>

            <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Nombre de la Receta</label>
                <input 
                    name="nombre"
                    value={recetaData.nombre}
                    onChange={handleChange}
                    className="w-full bg-white dark:bg-[#0f1115] border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 text-xl md:text-2xl font-bold text-slate-900 dark:text-white focus:border-[#b08969] focus:ring-1 focus:ring-[#b08969] outline-none shadow-sm transition-all"
                    placeholder="Ej: Salmón al Horno con Vegetales" 
                    required
                />
            </div>

            <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex justify-between">
                    <span>Descripción Corta</span>
                    <span className="text-xs text-slate-400 font-normal">Máx 255 carácteres</span>
                </label>
                <textarea 
                    name="descripcion_corta"
                    value={recetaData.descripcion_corta}
                    onChange={handleChange}
                    maxLength={255}
                    className={`${inputBaseStyle} resize-none`} 
                    placeholder="Un breve resumen que atrape..." 
                    rows="2"
                ></textarea>
            </div>

            <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Descripción Larga</label>
                <textarea 
                    name="descripcion_larga"
                    value={recetaData.descripcion_larga}
                    onChange={handleChange}
                    className={`${inputBaseStyle} resize-none`} 
                    placeholder="Historia del plato, origen, anécdotas..." 
                    rows="4"
                ></textarea>
            </div>
        </section>

        {/* INGREDIENTES & MACROS SECTION */}
        <section className="bg-white dark:bg-[#1a1c23] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-6">Ingredientes</h3>
            
            <IngredientSelector 
                ingredientes_detalle={recetaData.ingredientes_detalle} 
                onChange={handleIngredientesChange} 
            />

            {/* Macros Live */}
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 mt-8">Estimación Nutricional (1 Porción)</h3>
            <div className="grid grid-cols-4 gap-3 text-center">
                <div className="bg-white dark:bg-[#0f1115] border border-slate-200 dark:border-slate-800 rounded-2xl py-3 shadow-sm">
                    <p className="text-[#b08969] font-black text-lg">{macrosLive.cal}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mt-1">Kcal</p>
                </div>
                <div className="bg-white dark:bg-[#0f1115] border border-slate-200 dark:border-slate-800 rounded-2xl py-3 shadow-sm">
                    <p className="text-slate-800 dark:text-white font-bold text-lg">{macrosLive.prot}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mt-1">Prot</p>
                </div>
                <div className="bg-white dark:bg-[#0f1115] border border-slate-200 dark:border-slate-800 rounded-2xl py-3 shadow-sm">
                    <p className="text-slate-800 dark:text-white font-bold text-lg">{macrosLive.carb}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mt-1">Carbs</p>
                </div>
                <div className="bg-white dark:bg-[#0f1115] border border-slate-200 dark:border-slate-800 rounded-2xl py-3 shadow-sm">
                    <p className="text-slate-800 dark:text-white font-bold text-lg">{macrosLive.gras}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mt-1">Grasas</p>
                </div>
            </div>
        </section>

        {/* PASOS DE PREPARACIÓN */}
        <section className="bg-white dark:bg-[#1a1c23] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Pasos de Preparación</h3>
            
            <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                {pasos.map((paso, index) => (
                    <div key={index} className="flex gap-4 items-start">
                        <div className="shrink-0 size-8 rounded-full bg-[#b08969]/10 text-[#b08969] border border-[#b08969]/30 flex items-center justify-center font-bold text-sm mt-1">
                            {index + 1}
                        </div>
                        <div className="flex-1 space-y-2 relative">
                            <textarea 
                                value={paso}
                                onChange={(e) => handlePasoChange(index, e.target.value)}
                                className={`${inputBaseStyle} resize-none min-h-[100px]`} 
                                placeholder={`Describe el Paso ${index + 1}...`} 
                                required
                            ></textarea>
                            {pasos.length > 1 && (
                                <button 
                                    type="button" 
                                    onClick={() => removePaso(index)}
                                    className="absolute -top-2 -right-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-full p-1 transition-colors"
                                    title="Eliminar Paso"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <button 
                type="button" 
                onClick={addPaso}
                className="mt-6 w-full py-4 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-500 hover:text-[#b08969] hover:border-[#b08969]/50 transition-colors font-semibold text-sm flex items-center justify-center gap-2"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Añadir Siguiente Paso
            </button>
        </section>

        {/* CONSEJOS DEL CHEF */}
        <section className="bg-[#b08969]/5 border border-[#b08969]/20 rounded-3xl p-6 md:p-8 shadow-sm">
            <h3 className="text-xs font-bold text-[#b08969] uppercase tracking-widest mb-4">Sugerencias del Chef</h3>
            <textarea 
                name="sugerencias"
                value={recetaData.sugerencias}
                onChange={handleChange}
                className="w-full bg-white dark:bg-[#0f1115] border border-[#b08969]/20 rounded-2xl p-5 text-sm text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-[#b08969] resize-none outline-none placeholder:text-slate-400" 
                placeholder="Tips o consideraciones especiales (Ej: Reemplazos de ingredientes, trucos de cocción)..." 
                rows="3"
            ></textarea>
        </section>

        {/* TAXONOMÍAS */}
        <section className="bg-slate-50 dark:bg-[#1a1c23] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-8">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                
                {/* Custom País Dropdown */}
                <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">País de Origen</label>
                    <div className="relative">
                        <button 
                            type="button" 
                            onClick={() => setIsOpenPais(!isOpenPais)} 
                            className={`${inputBaseStyle} flex justify-between items-center w-full bg-white dark:bg-[#0f1115]`}>
                            <span>{recetaData.pais ? paises.find(p => p.id === Number(recetaData.pais))?.nombre : "Selecciona País..."}</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className={`size-4 text-slate-400 transition-transform duration-300 ${isOpenPais ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        
                        {isOpenPais && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setIsOpenPais(false)}></div>
                                <div className="absolute z-50 w-full mt-2 bg-white dark:bg-[#0f1115] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-h-60 overflow-y-auto py-2 top-full left-0">
                                    {paises.map(p => (
                                        <button
                                            key={p.id}
                                            type="button"
                                            onClick={() => {
                                                handleChange({ target: { name: 'pais', value: p.id, type: 'number' } });
                                                setIsOpenPais(false);
                                            }}
                                            className="w-full text-left px-5 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1a1c23] hover:text-[#b08969] transition-colors"
                                        >
                                            {p.nombre}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Dificultad Chips Instead of Select */}
                <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Dificultad</label>
                    <div className="flex flex-wrap gap-2">
                        {DIFICULTADES.map(d => {
                            const isSelected = recetaData.dificultad === d;
                            return (
                                <button 
                                    key={d}
                                    type="button"
                                    onClick={() => handleChange({ target: { name: 'dificultad', value: d, type: 'text'} })}
                                    className={`px-4 py-2 rounded-full border text-xs font-bold transition-all block ${isSelected ? 'bg-[#b08969] border-[#b08969] text-white shadow-md shadow-[#b08969]/30' : 'bg-white dark:bg-[#0f1115] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-[#b08969]/50'}`}
                                >
                                    {d}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <hr className="border-slate-200 dark:border-slate-800 my-8"/>

            {/* Tipo de Plato como Chips */}
            <div className="space-y-4">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tipo de Plato</label>
                <div className="flex flex-wrap gap-2.5">
                    {tiposPlato.map(tp => {
                        const isSelected = String(recetaData.tipo_plato) === String(tp.id);
                        return (
                            <button 
                                key={tp.id}
                                type="button"
                                onClick={() => handleChange({ target: { name: 'tipo_plato', value: tp.id, type: 'number'} })}
                                className={`px-5 py-2.5 rounded-full border text-xs font-bold transition-all block ${isSelected ? 'bg-[#b08969] border-[#b08969] text-white shadow-md shadow-[#b08969]/30' : 'bg-white dark:bg-[#0f1115] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-[#b08969]/50'}`}
                            >
                                {tp.nombre}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Estilos de Vida Chips */}
            <div className="space-y-4">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Estilos de Vida</label>
                <div className="flex flex-wrap gap-2.5">
                    {estilosVida.map(ev => {
                        const isChecked = recetaData.estilos_vida.includes(ev.id);
                        return (
                            <label key={ev.id} className="cursor-pointer group">
                                <input 
                                    className="hidden" 
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => handleEstiloVidaToggle(ev.id)}
                                />
                                <span className={`px-5 py-2.5 rounded-full border text-xs font-bold transition-all block ${isChecked ? 'bg-[#b08969] border-[#b08969] text-white shadow-md shadow-[#b08969]/30' : 'bg-white dark:bg-[#0f1115] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-[#b08969]/50'}`}>
                                    {ev.nombre}
                                </span>
                            </label>
                        );
                    })}
                </div>
            </div>

        </section>

        {/* Action Buttons Integrated into the Form */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 pt-4 mt-4 w-full">
            <button 
                type="button"
                onClick={() => window.location.href='/recipes'}
                className="w-full md:w-auto px-10 py-4 rounded-2xl text-sm font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-all">
                Descartar Cambios
            </button>
            <button 
                type="submit"
                className="w-full md:w-auto bg-[#b08969] hover:bg-[#9c785c] text-white px-12 py-4 rounded-2xl text-sm font-black shadow-xl shadow-[#b08969]/30 hover:shadow-[#b08969]/50 transition-all active:scale-[0.98] flex items-center justify-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {isEditing ? 'Guardar Cambios' : 'Publicar Receta'}
            </button>
        </div>

      </form>

      {/* RIGHT PANEL: LIVE PREVIEW SIDE-BY-SIDE */}
      <div className="hidden xl:flex xl:w-[50%] self-start sticky top-2 flex-col gap-4 max-h-[95vh] pt-4">
        
        {/* Toggle View Cards/Detalle */}
        <div className="flex justify-between items-center bg-slate-100 dark:bg-[#1a1c23]/50 backdrop-blur-md rounded-full px-2 py-1.5 shadow-sm border border-slate-200 dark:border-[#1a1c23] w-fit mx-auto">
            <button 
              type="button"
              onClick={() => setVista('card')}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${vista === 'card' ? 'bg-white dark:bg-[#0f1115] text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
              Vista Tarjeta
            </button>
            <button 
              type="button"
              onClick={() => setVista('detalle')}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${vista === 'detalle' ? 'bg-white dark:bg-[#0f1115] text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
              Vista Desplegada
            </button>
        </div>

        {/* Scrollable Container */}
        <div className="w-full rounded-[2rem] bg-slate-50/50 dark:bg-[#1a1c23]/30 border border-slate-200 dark:border-slate-800 shadow-inner flex-1 overflow-y-auto custom-scrollbar p-6 relative">
          {vista === 'card' ? (
            <div className="max-w-md mx-auto pointer-events-none opacity-90 hover:opacity-100 transition-opacity mt-10">
              <RecipeCard receta={{...recetaData, preparacion: pasos.join('\n\n')}} usuarioEsAdmin={false} />
            </div>
          ) : (
            <div className="w-full xl:max-w-3xl mx-auto pointer-events-none">
              <RecetaDetalle receta={{...recetaData, preparacion: pasos.join('\n\n')}} modoLocal={true} usuarioEsAdmin={false} />
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default function RecipeEditor() {
  return (
    <AuthProvider>
      <ToastProvider placement="bottom-right" />
      <RecetaFormContent />
    </AuthProvider>
  );
}
