import React, { useState, useEffect, useMemo } from 'react';
import { useAuth, AuthProvider } from "../../context/AuthContext";
import RecetaCard from './RecetaCard';
import RecetaDetalle from './DetalleReceta'; 
import IngredientesSelector from './IngredientesSelector';

const DIFICULTADES = ['Muy Fácil', 'Fácil', 'Media', 'Difícil', 'Muy Difícil'];
const CATEGORIAS_NOMBRES = [
  "Postre", "Almuerzo", "Cena", "Ensalada", "Desayuno", "Snack",
  "Entrada", "Sopa", "Bebida", "Acompañamiento", "Panadería"
];
const PAISES_NOMBRES = ["Global", "Argentina", "Chile", "Mexico", "España"];

const initialRecipeState = {
  nombre: '', descripcion_corta: '', descripcion_larga: '',
  preparacion: '', dificultad: 'Media',
  pais: 'Global', categoria: 'Postre', numero_porcion: 1,
  imagen_url: 'https://placehold.co/400x300?text=Imagen+de+Receta',
  video_url: '',
  ingredientes_detalle: []
};

const RecetaFormContent = () => {
  const { session, profile, loading: authLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [id, setId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recetaData, setRecetaData] = useState(initialRecipeState);
  const [authStatus, setAuthStatus] = useState('loading');
  const [vista, setVista] = useState('card');

  useEffect(() => {
    if (typeof window === 'undefined' || authLoading) return;

    if (profile) {
      if (profile.role === 'admin' || profile.rol === 'admin') {
        setAuthStatus('authorized');
      } else {
        window.location.href = '/';
      }
    } else {
      window.location.href = '/login';
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

  const getAuthToken = () => {
    return session?.access_token || localStorage.getItem('access_token');
  };

  const fetchRecipeDetails = async (currentId) => {
    setLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/recetas/${currentId}/`);
      if (!res.ok) throw new Error("Error al cargar la receta para editar.");
      const data = await res.json();
      setRecetaData({ ...initialRecipeState, ...data, id: data.id || currentId });
    } catch (error) {
      console.error("Error al obtener detalles:", error);
      alert(`No se pudo cargar la receta ${currentId}. ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setRecetaData(prev => ({ ...prev, [name]: type === 'number' ? Number(value) : value }));
  };

  const handleIngredientesChange = (nuevosIngredientes) => {
    setRecetaData(prev => ({ ...prev, ingredientes_detalle: nuevosIngredientes }));
  };

  // Cálculo en vivo de macros
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
  if (!token) return alert("Acceso denegado: Token de administrador no encontrado.");

  // Verifica que el id exista si estás editando
  if (isEditing && !id) return alert("Error: ID de receta no definido para editar.");

  const method = isEditing ? 'PUT' : 'POST';
  const url = isEditing
    ? `http://127.0.0.1:8000/api/recetas/${id}/`
    : `http://127.0.0.1:8000/api/recetas/`;

  const bodyData = { ...recetaData };
  if (!isEditing) bodyData.contador_likes = 0;

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(bodyData),
    });

    let data;
    try {
      data = await response.json();
    } catch {
      data = null; // JSON inválido o vacío
    }

    if (response.ok) {
      alert(`Receta ${isEditing ? 'modificada' : 'creada'} con éxito.`);
      setTimeout(() => window.location.reload(), 800);
    } else {
      // Mostrar siempre algo útil en el error
      const errorMsg = data?.detail || data || `Fallo al guardar (Código: ${response.status})`;
      throw new Error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
    }
  } catch (error) {
    console.error("Error al enviar la receta:", error);
    alert(`Error al guardar la receta: ${error.message}`);
  }
};


  if (authStatus === 'loading' || loading)
    return <div className="p-8 text-lg font-semibold text-center text-gray-600">Cargando y verificando permisos...</div>;

  return (
    <div className="flex flex-col lg:flex-row gap-8 p-6 max-w-[1400px] mx-auto">

      {/* FORMULARIO */}
      <form 
        onSubmit={handleSubmit} 
        className="lg:w-[40%] w-full bg-white p-6 rounded-xl shadow-lg border border-gray-200 sticky top-6 self-start h-fit max-h-[90vh] overflow-y-auto"
      >
        <h2 className="text-2xl font-bold mb-6 text-indigo-700">
          {isEditing ? '✏️ Editar Receta' : '🍳 Crear Nueva Receta'}
        </h2>

        <div className="space-y-4">
          {[ 
            { label: 'Nombre', name: 'nombre', type: 'text', required: true },
            { label: 'Descripción Corta (Max 255 chars)', name: 'descripcion_corta', type: 'textarea', maxLength: 255 },
            { label: 'Preparación', name: 'preparacion', type: 'textarea', rows: 5, required: true },
            { label: 'Descripción Larga', name: 'descripcion_larga', type: 'textarea', rows: 3 },
          ].map(f => (
            <div key={f.name}>
              <label className="block text-gray-700 font-semibold mb-1">{f.label}</label>
              {f.type === 'textarea' ? (
                <textarea {...f}
                  value={recetaData[f.name]} onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 transition-all resize-none"
                />
              ) : (
                <input {...f}
                  value={recetaData[f.name]} onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 transition-all"
                />
                )}
            </div>
          ))}

          <IngredientesSelector 
            ingredientes_detalle={recetaData.ingredientes_detalle} 
            onChange={handleIngredientesChange} 
          />

          {/* Badge de Macros en Vivo */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 p-4 rounded-xl shadow-inner mt-4">
            <h4 className="text-sm font-bold text-green-800 mb-2">Nutrición Estimada (1 Porción)</h4>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-white p-2 rounded-lg shadow-sm border border-green-100">
                <p className="text-xs text-gray-500 uppercase font-semibold">Calorías</p>
                <p className="text-lg font-bold text-green-700">{macrosLive.cal} <span className="text-xs">kcal</span></p>
              </div>
              <div className="bg-white p-2 rounded-lg shadow-sm border border-green-100">
                <p className="text-xs text-gray-500 uppercase font-semibold">Proteínas</p>
                <p className="text-lg font-bold text-blue-600">{macrosLive.prot} <span className="text-xs">g</span></p>
              </div>
              <div className="bg-white p-2 rounded-lg shadow-sm border border-green-100">
                <p className="text-xs text-gray-500 uppercase font-semibold">Carbs</p>
                <p className="text-lg font-bold text-orange-500">{macrosLive.carb} <span className="text-xs">g</span></p>
              </div>
              <div className="bg-white p-2 rounded-lg shadow-sm border border-green-100">
                <p className="text-xs text-gray-500 uppercase font-semibold">Grasas</p>
                <p className="text-lg font-bold text-red-500">{macrosLive.gras} <span className="text-xs">g</span></p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Dificultad</label>
              <select name="dificultad" value={recetaData.dificultad} onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400">
                {DIFICULTADES.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Porciones</label>
              <input type="number" name="numero_porcion" value={recetaData.numero_porcion}
                onChange={handleChange} min="1" max="6"
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed text-gray-500" disabled title="Las recetas base siempre se crean para 1 porción." />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">País</label>
              <select name="pais" value={recetaData.pais} onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400">
                {PAISES_NOMBRES.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Categoría</label>
              <select name="categoria" value={recetaData.categoria} onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400">
                {CATEGORIAS_NOMBRES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1">URL de la Imagen</label>
            <input type="text" name="imagen_url" value={recetaData.imagen_url} onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400" required />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-1">URL del Video (Opcional)</label>
            <input type="text" name="video_url" value={recetaData.video_url} onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400" />
          </div>

          <button type="submit"
            className="w-full py-3 mt-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-md">
            {isEditing ? 'Guardar Cambios' : 'Crear Receta'}
          </button>
        </div>
      </form>

      {/* VISTA PREVIA */}
      <div className="lg:w-[60%] w-full bg-gray-50 p-6 rounded-xl shadow-inner border border-gray-200 sticky top-6 self-start max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">Vista Previa</h3>
          <button 
            onClick={() => setVista(vista === 'card' ? 'detalle' : 'card')}
            className="px-4 py-2 text-sm font-semibold bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 transition">
            Cambiar a {vista === 'card' ? 'Vista Detallada' : 'Vista Tarjeta'}
          </button>
        </div>

        {vista === 'card' ? (
          <div className="max-w-xl mx-auto">
            <RecetaCard receta={recetaData} usuarioEsAdmin={false} />
          </div>
        ) : (
          <div className="w-full px-2">
            <RecetaDetalle receta={recetaData} modoLocal={true} usuarioEsAdmin={false} />
          </div>
        )}
      </div>
    </div>
  );
};

export default function RecetaForm() {
  return (
    <AuthProvider>
      <RecetaFormContent />
    </AuthProvider>
  );
}
