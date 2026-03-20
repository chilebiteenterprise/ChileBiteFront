import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2 } from 'lucide-react';

const IngredientSelector = ({ ingredientes_detalle = [], onChange }) => {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [cantidad, setCantidad] = useState('');
  const [unidad, setUnidad] = useState('g');
  const [isOpenUnidad, setIsOpenUnidad] = useState(false);

  useEffect(() => {
    if (!search.trim() || selectedIngredient) {
      setResults([]);
      return;
    }
    const fetchIngredientes = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/ingredientes/?search=${encodeURIComponent(search)}`);
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
    <div className="bg-transparent rounded-xl w-full">
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed tracking-wide">
        Busca y agrega ingredientes para calcular el valor nutricional de <strong className="text-[#b08969]">una única porción</strong>.
      </p>
      
      {/* Buscador de Ingredientes */}
      <div className="flex flex-col gap-3 mb-5 p-5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400 dark:text-slate-500" />
          </div>
          <input
            type="text"
            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-[#b08969] focus:ring-1 focus:ring-[#b08969] outline-none shadow-sm transition-all text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600"
            placeholder={selectedIngredient ? selectedIngredient.nombre : "Busca un ingrediente (ej. Huevo, Pollo)..."}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIngredient(null);
            }}
          />
          {results.length > 0 && !selectedIngredient && (
            <ul className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl max-h-64 overflow-auto py-2">
              {results.map(ing => (
                <li 
                  key={ing.id} 
                  className="px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-950 hover:text-[#b08969] cursor-pointer flex flex-col sm:flex-row justify-between sm:items-center gap-2 transition-colors"
                  onClick={() => {
                    setSelectedIngredient(ing);
                    setSearch(ing.nombre);
                    setResults([]);
                  }}
                >
                  <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm leading-tight text-balance group-hover:text-[#b08969]">{ing.nombre}</span>
                  <span className="text-[10px] uppercase font-black bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full whitespace-nowrap shrink-0 w-fit">{ing.calorias_por_100g} kcal/100g</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex gap-2.5">
          <input 
            type="number"
            min="0"
            step="0.1"
            placeholder="Cant."
            className="w-28 text-center px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-[#b08969] focus:ring-1 focus:ring-[#b08969] outline-none shadow-sm transition-all text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600"
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
          />
          <div className="relative flex-1">
            <button 
                type="button"
                onClick={() => setIsOpenUnidad(!isOpenUnidad)}
                className="w-full flex justify-between items-center px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-[#b08969] focus:ring-1 focus:ring-[#b08969] outline-none shadow-sm transition-all text-sm text-slate-800 dark:text-slate-200"
            >
                <span className="truncate pr-2">
                  {unidad === 'g' ? 'Gramos (g)' : unidad === 'ml' ? 'Mililitros (ml)' : unidad === 'unidad' ? 'Unidades' : unidad === 'cda' ? 'Cucharadas' : 'Tazas'}
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" className={`size-4 text-slate-400 shrink-0 transition-transform duration-300 ${isOpenUnidad ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            
            {isOpenUnidad && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpenUnidad(false)}></div>
                    <div className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl max-h-48 overflow-y-auto py-2 top-full right-0">
                        {[
                          { val: 'g', label: 'Gramos (g)' },
                          { val: 'ml', label: 'Mililitros (ml)' },
                          { val: 'unidad', label: 'Unidades' },
                          { val: 'cda', label: 'Cucharadas' },
                          { val: 'taza', label: 'Tazas' }
                        ].map(u => (
                            <button
                                key={u.val}
                                type="button"
                                onClick={() => { setUnidad(u.val); setIsOpenUnidad(false); }}
                                className="w-full text-left px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-950 hover:text-[#b08969] transition-colors"
                            >
                                {u.label}
                            </button>
                        ))}
                    </div>
                </>
            )}
          </div>
          <button 
            type="button"
            onClick={handleAdd}
            disabled={!selectedIngredient || !cantidad}
            className="bg-[#b08969] text-white px-5 rounded-xl hover:bg-[#9c785c] disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 disabled:cursor-not-allowed transition-all shadow-md active:scale-95 flex items-center justify-center shrink-0"
          >
            <Plus className="w-5 h-5 font-bold" />
          </button>
        </div>
      </div>

      {/* Lista de seleccionados */}
      {ingredientes_detalle.length > 0 ? (
        <div className="max-h-[220px] overflow-y-auto custom-scrollbar pr-2">
          <ul className="space-y-2.5">
            {ingredientes_detalle.map((item, idx) => (
              <li key={idx} className="flex justify-between items-center bg-white dark:bg-slate-950 p-3 pl-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-[#b08969]/50 transition-all group">
                <span className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-3 text-sm">
                  <span className="bg-[#b08969]/10 text-[#b08969] border border-[#b08969]/20 text-xs font-black px-2.5 py-1 rounded-lg">
                    {item.cantidad} {item.unidad}
                  </span> 
                  {item.ingrediente.nombre}
                </span>
                <button type="button" onClick={() => handleRemove(idx)} className="text-red-400 hover:text-white p-2 rounded-lg hover:bg-red-500 opacity-60 group-hover:opacity-100 transition-all active:scale-90">
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="text-center py-8 text-slate-400 dark:text-slate-600 text-sm border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
          Sin ingredientes en la receta.
        </div>
      )}
    </div>
  );
};

export default IngredientSelector;
