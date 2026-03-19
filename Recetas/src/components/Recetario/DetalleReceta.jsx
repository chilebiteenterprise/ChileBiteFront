import React, { useState, useEffect } from 'react';
import { useAuth, AuthProvider } from "../../context/AuthContext";
import { ChefHat, Clock, Users, Heart, Share2, BookOpen, ListOrdered, Video, Bookmark, Minus, Plus, Flame, Beef, Wheat, Droplet } from 'lucide-react';

const COLOR_PRINCIPAL = '#b08968';
const COLOR_PAGINA = '#fcf8f4';

const parseTextToList = (text) => {
  if (!text || typeof text !== 'string') return [];
  return text.split('\n').map(item => item.trim()).filter(item => item.length > 0);
};

function RecetaDetalleContent({ idReceta, receta: recetaProp, modoLocal = false, usuario }) {
  const { session } = useAuth();
  const [receta, setReceta] = useState(recetaProp || null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [ingredientsState, setIngredientsState] = useState([]);
  const [stepsState, setStepsState] = useState([]);
  const [porcionesDeseadas, setPorcionesDeseadas] = useState(1);
  const [loading, setLoading] = useState(!modoLocal);
  const [error, setError] = useState(null);

  // === CARGA INICIAL: sincroniza con backend y obtiene estado de usuario ===
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
        const token = session?.access_token || localStorage.getItem("access_token");
        const headers = token ? { "Authorization": `Bearer ${token}` } : {};

        const response = await fetch(`http://127.0.0.1:8000/api/recetas/${idReceta}/`, {
          headers: headers, 
        });
        
        if (!response.ok) throw new Error(`Error ${response.status}`);
        const data = await response.json();
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
        setIsFavorite(data.liked || false);
        setIsSaved(data.is_guardada || false);
      } catch (err) {
        console.error(err);
        setError('No se pudo cargar la receta.');
      } finally {
        setLoading(false);
      }
    };

    fetchReceta();
  }, [idReceta, recetaProp, modoLocal]);

  useEffect(() => {
    // Si recetaProp cambia mientras estamos en modoLocal, actualizar en tiempo real
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
    try {
      const token = session?.access_token || localStorage.getItem('access_token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      if (!token) return alert('Debes estar logueado');
      await fetch(`http://127.0.0.1:8000/api/recetas/${idReceta}/like/`, {
        method: 'POST',
        headers: headers, 
      });
      setIsFavorite(prev => !prev);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async () => {
    const token = session?.access_token || localStorage.getItem("access_token");
    if (!token) return alert("Debes estar logueado");
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      await fetch(`http://127.0.0.1:8000/api/recetas/${idReceta}/guardar/`, { method: 'POST', headers: headers });
      setIsSaved(prev => !prev);
    } catch (err) {
      console.error(err);
    }
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

  if (loading) return <div className="flex items-center justify-center min-h-screen text-lg text-gray-600">Cargando receta...</div>;
  if (error || !receta) return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center text-gray-700">
      <p className="text-xl font-semibold mb-4">{error || 'Receta no encontrada'}</p>
      <button onClick={navigateBack} className="px-4 py-2 bg-stone-600 text-white rounded-lg hover:bg-stone-700 transition">Volver al recetario</button>
    </div>
  );

  const imageUrl = receta.imagen_url?.trim() || null;
  const tiempoTotal = receta.tiempo_total || '1 hora 30 min';

  const tabs = [
    { id: 1, name: "Resumen y Detalles", icon: BookOpen },
    { id: 2, name: "Ingredientes y Pasos", icon: ListOrdered },
    { id: 3, name: "Video y Tips", icon: Video, hide: !receta.video_url },
  ].filter(tab => !tab.hide);

  const PageContent = () => {
    switch (currentPage) {
      case 1:
        return (
          <div className="animate-fade-in">
            <h1 className="text-4xl font-serif font-bold mb-4 border-b pb-2" style={{ color: COLOR_PRINCIPAL }}>{receta.nombre}</h1>
            <p className="text-gray-600 text-sm italic mb-6">Por: {receta.usuario_nombre || receta.usuario || "Chef Anónimo"}</p>
            <p className="text-gray-700 text-lg mb-8 leading-relaxed">{receta.descripcion_larga || receta.descripcion_corta}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white rounded-xl p-4 text-center shadow-sm border" style={{ borderColor: COLOR_PRINCIPAL + '40' }}>
                <Clock className="w-6 h-6 mx-auto mb-2" style={{ color: COLOR_PRINCIPAL }} />
                <p className="text-sm text-gray-600 mb-1">Tiempo Total</p>
                <p className="font-bold text-lg">{tiempoTotal}</p>
              </div>
              <div className="bg-white rounded-xl p-4 text-center shadow-sm border flex flex-col items-center justify-center transition-all" style={{ borderColor: COLOR_PRINCIPAL + '40' }}>
                <Users className="w-6 h-6 mb-2" style={{ color: COLOR_PRINCIPAL }} />
                <p className="text-sm text-gray-600 mb-2">Porciones</p>
                <div className="flex items-center gap-3">
                  <button onClick={() => setPorcionesDeseadas(p => Math.max(1, p - 1))} className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition">
                    <Minus className="w-4 h-4 text-gray-700" />
                  </button>
                  <span className="font-bold text-xl w-6 text-center">{porcionesDeseadas}</span>
                  <button onClick={() => setPorcionesDeseadas(p => p + 1)} className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition">
                    <Plus className="w-4 h-4 text-gray-700" />
                  </button>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 text-center shadow-sm border" style={{ borderColor: COLOR_PRINCIPAL + '40' }}>
                <ChefHat className="w-6 h-6 mx-auto mb-2" style={{ color: COLOR_PRINCIPAL }} />
                <p className="text-sm text-gray-600 mb-1">Dificultad</p>
                <p className="font-bold text-lg">{receta.dificultad}</p>
              </div>
            </div>

            {receta.total_calorias != null && parseFloat(receta.total_calorias) > 0 && (
              <div className="bg-gradient-to-br from-orange-50 to-amber-50/50 rounded-2xl p-6 mb-8 border border-orange-100/60 shadow-[0_4px_20px_-4px_rgba(251,146,60,0.1)]">
                <div className="flex justify-between items-end mb-5">
                  <h3 className="text-xl font-bold text-orange-900 flex items-center gap-2">
                    <Flame className="w-6 h-6 text-orange-500 fill-orange-500/20" />
                    Valor Nutricional
                  </h3>
                  <span className="text-sm font-semibold text-orange-700 bg-orange-100/80 px-3 py-1 rounded-full">Por 1 porción</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center shadow-sm border border-orange-100/50 hover:shadow-md transition-shadow">
                    <Flame className="w-5 h-5 mx-auto mb-1 text-orange-400" />
                    <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Calorías</p>
                    <p className="font-extrabold text-2xl text-orange-600">{receta.total_calorias} <span className="text-xs font-medium text-orange-400">kcal</span></p>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center shadow-sm border border-blue-100/50 hover:shadow-md transition-shadow">
                    <Beef className="w-5 h-5 mx-auto mb-1 text-blue-400" />
                    <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Proteínas</p>
                    <p className="font-extrabold text-2xl text-blue-600">{receta.total_proteinas} <span className="text-xs font-medium text-blue-400">g</span></p>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center shadow-sm border border-emerald-100/50 hover:shadow-md transition-shadow">
                    <Wheat className="w-5 h-5 mx-auto mb-1 text-emerald-400" />
                    <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Carbs</p>
                    <p className="font-extrabold text-2xl text-emerald-600">{receta.total_carbohidratos} <span className="text-xs font-medium text-emerald-400">g</span></p>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center shadow-sm border border-yellow-100/50 hover:shadow-md transition-shadow">
                    <Droplet className="w-5 h-5 mx-auto mb-1 text-yellow-500" />
                    <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Grasas</p>
                    <p className="font-extrabold text-2xl text-yellow-600">{receta.total_grasas} <span className="text-xs font-medium text-yellow-400">g</span></p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      case 2:
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-fade-in">
            <div>
              <h2 className="text-3xl font-serif font-bold mb-6" style={{ color: COLOR_PRINCIPAL }}>Ingredientes</h2>
              <ul className="space-y-3 list-none">
                {ingredientsState.map(ing => {
                  const scale = porcionesDeseadas / (receta.numero_porcion || 1);
                  let text = ing.text;
                  if (ing.isDetailed && ing.data) {
                    const scaledCantidad = (parseFloat(ing.data.cantidad) * scale).toFixed(1).replace(/\.0$/, '');
                    text = `${scaledCantidad} ${ing.data.unidad} de ${ing.data.ingrediente.nombre}`;
                  }
                  return (
                    <li key={ing.id} onClick={() => toggleCheck("ingredients", ing.id)} className={`flex items-start gap-3 border-b border-gray-100 pb-3 cursor-pointer transition-all ${ing.checked ? "opacity-50 grayscale" : "hover:bg-white/50 p-2 rounded-lg"}`}>
                      <span className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${ing.checked ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 text-transparent'}`}>
                        ✓
                      </span>
                      <span className={`flex-1 text-lg font-medium tracking-tight ${ing.checked ? "line-through text-gray-500" : "text-gray-800"}`}>
                        {text}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div>
              <h2 className="text-3xl font-serif font-bold mb-6" style={{ color: COLOR_PRINCIPAL }}>Preparación</h2>
              <ul className="list-inside space-y-4">
                {stepsState.map(step => (
                  <li key={step.id} onClick={() => toggleCheck("steps", step.id)} className={`pl-2 border-l-2 border-orange-200 cursor-pointer ${step.checked ? "line-through text-gray-400" : ""}`}>
                    <span className="font-bold text-lg" style={{ color: COLOR_PRINCIPAL }}>Paso {step.id + 1}:</span> {step.text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      case 3:
        return receta.video_url ? (
          <div className="animate-fade-in">
            <h2 className="text-3xl font-serif font-bold mb-4" style={{ color: COLOR_PRINCIPAL }}>Video Tutorial</h2>
            <div className="relative h-0 pb-[56.25%]">
              <iframe src={receta.video_url} frameBorder="0" allowFullScreen className="rounded-xl shadow-xl absolute top-0 left-0 w-full h-full"></iframe>
            </div>
          </div>
        ) : null;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col pt-12">
      <div className="max-w-8xl mx-auto w-full px-4">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row min-h-[700px]">
          <div className="lg:w-1/3 p-6 md:p-8 relative border-r border-stone-200 flex flex-col justify-between" style={{ backgroundColor: COLOR_PRINCIPAL }}>
            <div>
              <h2 className="text-2xl font-serif font-extrabold text-white mb-4">MENÚ DEL LIBRO</h2>
              <div className="text-white text-sm opacity-90 mb-6">
                <p>Porciones: {porcionesDeseadas}</p>
                <p>Dificultad: {receta.dificultad}</p>
              </div>
              <div className="space-y-3">
                {tabs.map(tab => (
                  <button key={tab.id} onClick={() => setCurrentPage(tab.id)} className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-semibold ${currentPage === tab.id ? 'text-gray-900 shadow-md' : 'text-white hover:bg-white hover:bg-opacity-20'}`} style={{ backgroundColor: currentPage === tab.id ? COLOR_PAGINA : 'transparent' }}>
                    <tab.icon className="w-5 h-5" style={{ color: currentPage === tab.id ? COLOR_PRINCIPAL : 'white' }} />
                    <span>{tab.name}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-around pt-6 border-t border-white border-opacity-30">
              <button onClick={handleFavorite} className={`p-3 rounded-full shadow-lg transition-colors ${isFavorite ? 'bg-red-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`} title="Guardar en favoritos">
                <Heart className="w-6 h-6 fill-current" />
              </button>
              <button onClick={handleSave} className={`p-3 rounded-full shadow-lg transition-colors ${isSaved ? 'bg-yellow-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`} title="Guardar receta">
                <Bookmark className="w-6 h-6 fill-current" />
              </button>
              <button onClick={handleShare} className="p-3 rounded-full bg-white text-gray-700 shadow-lg hover:bg-gray-100 transition-colors" title="Compartir">
                <Share2 className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="lg:w-2/3 p-8 md:p-12 overflow-y-auto" style={{ backgroundColor: COLOR_PAGINA }}>
            {imageUrl && <div className="block lg:hidden mb-6 rounded-lg overflow-hidden shadow-md"><img src={imageUrl} alt={receta.nombre} className="w-full h-48 object-cover" /></div>}
            <PageContent />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RecetaDetalle(props) {
  return (
    <AuthProvider>
      <RecetaDetalleContent {...props} />
    </AuthProvider>
  );
}