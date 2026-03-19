import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2 } from 'lucide-react';

const IngredientesSelector = ({ ingredientes_detalle = [], onChange }) => {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [cantidad, setCantidad] = useState('');
  const [unidad, setUnidad] = useState('g');

  useEffect(() => {
    if (!search.trim() || selectedIngredient) {
      setResults([]);
      return;
    }
    const fetchIngredientes = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/ingredientes/?search=${encodeURIComponent(search)}`);
        const data = await res.json();
        setResults(data);
      } catch (err) {
        console.error("Error buscando ingredientes", err);
      } finally {
        setLoading(false);
      }
    };
    const timer = setTimeout(fetchIngredientes, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleAdd = () => {
    if (!selectedIngredient || !cantidad || Number(cantidad) <= 0) return;
    const newItem = {
      ingrediente: selectedIngredient,
      cantidad: Number(cantidad),
      unidad
    };
    onChange([...ingredientes_detalle, newItem]);
    
    // Reset form
    setSelectedIngredient(null);
    setSearch('');
    setCantidad('');
    setUnidad('g');
  };

  const handleRemove = (index) => {
    const newItems = [...ingredientes_detalle];
    newItems.splice(index, 1);
    onChange(newItems);
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-indigo-100 shadow-sm mt-4">
      <h3 className="text-lg font-bold text-indigo-900 mb-1">Ingredientes (Para 1 Porción)</h3>
      <p className="text-sm text-gray-500 mb-4 leading-relaxed">
        Agrega ingredientes exactos para calcular el valor nutricional de **una única porción**. 
        Los usuarios podrán multiplicar las porciones visualmente más adelante.
      </p>
      
      {/* Buscador de Ingredientes */}
      <div className="flex flex-col gap-3 mb-5 p-4 bg-indigo-50/50 rounded-lg border border-indigo-50">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-indigo-400" />
          </div>
          <input
            type="text"
            className="w-full pl-10 p-3 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
            placeholder={selectedIngredient ? selectedIngredient.nombre : "Busca un ingrediente (ej. Huevo, Pollo)..."}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIngredient(null);
            }}
          />
          {results.length > 0 && !selectedIngredient && (
            <ul className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-64 overflow-auto divide-y divide-gray-100">
              {results.map(ing => (
                <li 
                  key={ing.id} 
                  className="px-4 py-3 hover:bg-indigo-50 cursor-pointer flex flex-col sm:flex-row justify-between sm:items-center gap-2 transition-colors"
                  onClick={() => {
                    setSelectedIngredient(ing);
                    setSearch(ing.nombre);
                    setResults([]);
                  }}
                >
                  <span className="font-semibold text-gray-800 text-sm leading-tight text-balance">{ing.nombre}</span>
                  <span className="text-xs bg-green-100 text-green-700 font-medium px-2 py-1 rounded-full whitespace-nowrap shrink-0 w-fit">{ing.calorias_por_100g} kcal/100g</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex gap-2">
          <input 
            type="number"
            min="0"
            step="0.1"
            placeholder="Cant."
            className="w-24 p-3 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
          />
          <select 
            className="flex-1 p-3 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white transition-all shadow-sm"
            value={unidad}
            onChange={(e) => setUnidad(e.target.value)}
          >
            <option value="g">Gramos (g)</option>
            <option value="ml">Mililitros (ml)</option>
            <option value="unidad">Unidades</option>
            <option value="cda">Cucharadas</option>
            <option value="taza">Tazas</option>
          </select>
          <button 
            type="button"
            onClick={handleAdd}
            disabled={!selectedIngredient || !cantidad}
            className="bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-all shadow-md flex items-center justify-center"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Lista de seleccionados */}
      {ingredientes_detalle.length > 0 ? (
        <ul className="space-y-2">
          {ingredientes_detalle.map((item, idx) => (
            <li key={idx} className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-200 shadow-sm hover:border-indigo-200 transition-colors group">
              <span className="font-medium text-gray-700 flex items-center gap-2">
                <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded-md">{item.cantidad} {item.unidad}</span> 
                {item.ingrediente.nombre}
              </span>
              <button type="button" onClick={() => handleRemove(idx)} className="text-red-400 hover:text-red-600 p-2 rounded-md hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all">
                <Trash2 className="w-5 h-5" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center py-6 text-gray-400 italic text-sm border-2 border-dashed border-gray-200 rounded-xl">
          Aún no has agregado ingredientes.
        </div>
      )}
    </div>
  );
};

export default IngredientesSelector;
