import React, { useState, useEffect, useRef, useMemo } from "react";
import { supabase } from '@/lib/supabaseClient';
import CopilotChat from './CopilotChat';
import { Sparkles } from 'lucide-react';
import { AuthProvider } from '@/features/auth/context/AuthContext';

const normalize = (s = "") =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

// Pill component for macros display
function MacroPill({ label, value, unit, color }) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-4 rounded-2xl border ${color} gap-1 min-w-[110px] flex-1`}
    >
      <span className="text-2xl font-black tabular-nums">
        {value.toFixed(1)}
        <span className="text-sm font-semibold ml-0.5">{unit}</span>
      </span>
      <span className="text-xs font-semibold uppercase tracking-wider opacity-70">
        {label}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Autocomplete for ingredients
// ─────────────────────────────────────────────────────────────────────────────
function IngredientSearch({ onAdd, allIngredients, loadingIngredients }) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [cantidad, setCantidad] = useState("");
  const [unidad, setUnidad] = useState("g");
  const [isOpenUnidad, setIsOpenUnidad] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  const suggestions = useMemo(() => {
    const q = normalize(query.trim());
    if (!q || q.length < 2 || selectedIngredient) return [];
    return allIngredients
      .filter((ing) => normalize(ing.nombre).includes(q))
      .slice(0, 8);
  }, [query, allIngredients, selectedIngredient]);

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setActiveIdx(-1);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (ing) => {
    setSelectedIngredient(ing);
    setQuery(ing.nombre);
    setIsOpen(false);
    setActiveIdx(-1);
    setCantidad("1"); // Cantidad por defecto
    setUnidad("g");
  };

  const handleAdd = () => {
    if (!selectedIngredient || !cantidad || Number(cantidad) <= 0) return;
    onAdd(selectedIngredient, Number(cantidad), unidad);
    setSelectedIngredient(null);
    setQuery("");
    setCantidad("");
    setUnidad("g");
  };

  const handleKeyDown = (e) => {
    if (!isOpen || !suggestions.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((p) => Math.min(p + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((p) => Math.max(p - 1, -1));
    } else if (e.key === "Enter" && activeIdx >= 0) {
      e.preventDefault();
      handleSelect(suggestions[activeIdx]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setActiveIdx(-1);
    }
  };

  const highlight = (text, query) => {
    const normText = normalize(text);
    const normQ = normalize(query.trim());
    const idx = normText.indexOf(normQ);
    if (idx === -1 || !normQ) return <span>{text}</span>;
    return (
      <>
        <span>{text.slice(0, idx)}</span>
        <span className="text-[#A0522D] dark:text-[#d4906a] font-bold">
          {text.slice(idx, idx + normQ.length)}
        </span>
        <span>{text.slice(idx + normQ.length)}</span>
      </>
    );
  };

  const showDrop = isOpen && suggestions.length > 0 && !selectedIngredient;

  return (
    <div ref={containerRef} className="relative w-full flex flex-col gap-4">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1110.5 3a7.5 7.5 0 016.15 13.65z"
            />
          </svg>
        </div>
        <input
          ref={inputRef}
          id="macro-ingredient-search"
          type="text"
          autoComplete="off"
          placeholder={
            loadingIngredients
              ? "Cargando ingredientes..."
              : "Buscar ingrediente (ej: pollo, arroz, tomate...)"
          }
          disabled={loadingIngredients}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setSelectedIngredient(null);
            setActiveIdx(-1);
          }}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="w-full pl-12 pr-4 py-4 bg-white dark:bg-[#1a1d24] border-2 border-gray-200 dark:border-gray-700 rounded-2xl outline-none focus:border-[#A0522D] text-gray-900 dark:text-gray-100 placeholder-gray-400 transition-all font-medium text-base disabled:opacity-50 disabled:cursor-wait shadow-sm"
        />

        {showDrop && (
          <div className="absolute top-[calc(100%+8px)] left-0 right-0 z-50 bg-white dark:bg-[#1a1d24] border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl overflow-hidden">
            <ul className="py-1 max-h-64 overflow-y-auto">
              {suggestions.map((ing, i) => {
                const name = ing.nombre;
                return (
                  <li
                    key={ing.id || name}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelect(ing);
                    }}
                    onMouseEnter={() => setActiveIdx(i)}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors text-sm ${
                      i === activeIdx
                        ? "bg-[#A0522D]/10 dark:bg-[#A0522D]/20"
                        : "hover:bg-gray-50 dark:hover:bg-gray-800/60"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-800 dark:text-gray-200 truncate">
                        {highlight(name, query)}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      {selectedIngredient && (
        <div className="flex gap-2.5 animate-fade-in">
          <input
            type="number"
            min="0.1"
            step="0.1"
            placeholder="Cant."
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
            className="w-24 text-center px-4 py-3 bg-white dark:bg-[#1a1d24] border-2 border-gray-200 dark:border-gray-700 rounded-2xl outline-none focus:border-[#A0522D] text-gray-900 dark:text-gray-100 placeholder-gray-400 transition-all font-medium text-base shadow-sm"
          />
          <div className="relative flex-1">
            <button
              type="button"
              onClick={() => setIsOpenUnidad(!isOpenUnidad)}
              className="w-full flex justify-between items-center px-4 py-3 bg-white dark:bg-[#1a1d24] border-2 border-gray-200 dark:border-gray-700 rounded-2xl outline-none focus:border-[#A0522D] text-gray-900 dark:text-gray-100 font-medium text-base shadow-sm text-left"
            >
              <span className="truncate pr-2">
                {unidad === 'g' ? 'Gramos (g)' : unidad === 'unidad' ? 'Unidades (ud)' : unidad === 'cda' ? 'Cucharadas (cda)' : 'Tazas'}
              </span>
              <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-300 ${isOpenUnidad ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isOpenUnidad && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsOpenUnidad(false)}></div>
                <div className="absolute z-50 w-full mt-2 bg-white dark:bg-[#1a1d24] border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl py-2 top-full right-0">
                  {[
                    { val: 'g', label: 'Gramos (g)' },
                    { val: 'unidad', label: 'Unidades (ud)' },
                    { val: 'cda', label: 'Cucharadas (cda)' },
                    { val: 'taza', label: 'Tazas' }
                  ].map(u => (
                    <button
                      key={u.val}
                      type="button"
                      onClick={() => { setUnidad(u.val); setIsOpenUnidad(false); }}
                      className="w-full text-left px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
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
            disabled={!cantidad}
            className="bg-[#A0522D] text-white px-5 rounded-2xl hover:bg-[#944925] disabled:opacity-50 transition-all shadow-md flex items-center justify-center shrink-0"
          >
            <svg className="w-6 h-6 font-bold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Single ingredient row in the list
// ─────────────────────────────────────────────────────────────────────────────
const getItemGrams = (item) => {
  if (item.unidad === 'unidad') return item.cantidad * (Number(item.peso_por_unidad_gramos) || 100);
  if (item.unidad === 'taza') return item.cantidad * (Number(item.peso_por_taza_gramos) || 200);
  if (item.unidad === 'cda') return item.cantidad * (Number(item.peso_por_cucharada_gramos) || 15);
  return item.cantidad; // 'g'
};

function IngredientRow({ item, onUpdateQuantity, onUpdateUnit, onRemove }) {
  const [isOpenUnit, setIsOpenUnit] = useState(false);
  const name = item.nombre;
  const grams = getItemGrams(item);
  const factor = grams / 100;

  const handleAdjust = (val) => {
    onUpdateQuantity(item._uid, Math.max(0.1, item.cantidad + val));
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700/60 group transition-all hover:shadow-sm">
      {/* Name */}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-gray-800 dark:text-gray-100 text-base truncate">
          {name}
        </p>
        <div className="flex flex-wrap gap-x-2 text-xs text-gray-400 mt-1">
          <span className="font-medium text-[#A0522D]">{(item.calorias_por_100g * factor).toFixed(0)} kcal</span>
          <span className="opacity-40">•</span>
          <span>P: {(item.proteinas_por_100g * factor).toFixed(1)}g</span>
          <span className="opacity-40">•</span>
          <span>C: {(item.carbohidratos_por_100g * factor).toFixed(1)}g</span>
          <span className="opacity-40">•</span>
          <span>G: {(item.grasas_por_100g * factor).toFixed(1)}g</span>
          <span className="opacity-40">•</span>
          <span>({Math.round(grams)}g totales)</span>
        </div>
      </div>

      {/* Controller: Quantity and Unit Selection */}
      <div className="flex items-center gap-3">
        {/* Quantity Controller Box */}
        <div className="flex items-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-1 shadow-sm">
          <button
            onClick={() => handleAdjust(item.unidad === 'g' ? -10 : -0.5)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors active:scale-90"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
            </svg>
          </button>
          
          <input
            type="number"
            min={0.1}
            step={item.unidad === 'g' ? 1 : 0.1}
            value={item.cantidad}
            onChange={(e) => onUpdateQuantity(item._uid, Math.max(0.1, Number(e.target.value)))}
            className="w-12 text-center text-sm font-black bg-transparent border-none outline-none text-gray-900 dark:text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />

          <button
            onClick={() => handleAdjust(item.unidad === 'g' ? 10 : 0.5)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors active:scale-90"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {/* Custom Dropdown Selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpenUnit(!isOpenUnit)}
            className="flex items-center gap-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs font-bold text-[#A0522D] dark:text-[#d4906a] rounded-xl px-3 py-2 outline-none cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-all shadow-sm select-none"
          >
            <span>
              {item.unidad === 'g' ? 'Gramos (g)' : item.unidad === 'unidad' ? 'Unidades (ud)' : item.unidad === 'cda' ? 'Cucharadas (cda)' : 'Tazas'}
            </span>
            <svg xmlns="http://www.w3.org/2000/svg" className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-300 ${isOpenUnit ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isOpenUnit && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsOpenUnit(false)}></div>
              <div className="absolute right-0 top-[calc(100%+6px)] z-50 min-w-[140px] bg-white dark:bg-[#1a1d24] border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl py-1.5 overflow-hidden animate-fade-in">
                {[
                  { val: 'g', label: 'Gramos (g)' },
                  { val: 'unidad', label: 'Unidades (ud)' },
                  { val: 'cda', label: 'Cucharadas (cda)' },
                  { val: 'taza', label: 'Tazas' }
                ].map(u => (
                  <button
                    key={u.val}
                    type="button"
                    onClick={() => {
                      onUpdateUnit(item._uid, u.val);
                      setIsOpenUnit(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-xs font-semibold transition-colors ${
                      item.unidad === u.val
                        ? 'bg-[#A0522D]/10 text-[#A0522D] dark:bg-[#A0522D]/20 dark:text-[#d4906a]'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    {u.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

let _uid = 0;
const nextUid = () => ++_uid;

function MacroCalculatorInner() {
  const [allIngredients, setAllIngredients] = useState([]);
  const [loadingIngredients, setLoadingIngredients] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [recipeName, setRecipeName] = useState(null);

  // Load ingredient catalogue from Supabase
  useEffect(() => {
    setLoadingIngredients(true);
    supabase
      .from('core_ingrediente')
      .select('id, nombre, calorias_por_100g, proteinas_por_100g, carbohidratos_por_100g, grasas_por_100g, fibra_por_100g, peso_por_unidad_gramos, peso_por_taza_gramos, peso_por_cucharada_gramos')
      .order('nombre')
      .limit(1000)
      .then(({ data, error }) => {
        if (!error && data) setAllIngredients(data);
      })
      .catch(console.error)
      .finally(() => setLoadingIngredients(false));
  }, []);

    const handleAdd = (ing, cantidad = 100, unidad = 'g') => {
    setSelectedItems((prev) => [
      ...prev,
      { cantidad, unidad, ...ing, _uid: nextUid() },
    ]);
  };

  const handleUpdateQuantity = (uid, cantidad) => {
    setSelectedItems((prev) =>
      prev.map((i) => (i._uid === uid ? { ...i, cantidad } : i))
    );
  };

  const handleUpdateUnit = (uid, unidad) => {
    setSelectedItems((prev) =>
      prev.map((i) => (i._uid === uid ? { ...i, unidad } : i))
    );
  };

  const handleRemove = (uid) => {
    setSelectedItems((prev) => prev.filter((i) => i._uid !== uid));
  };

  const handleClear = () => {
    setSelectedItems([]);
    setRecipeName(null);
  };

  // Totals Summation
  const totals = useMemo(() => {
    return selectedItems.reduce(
      (acc, item) => {
        const grams = getItemGrams(item);
        const f = grams / 100;
        return {
          calorias: acc.calorias + (Number(item.calorias_por_100g) || 0) * f,
          proteinas: acc.proteinas + (Number(item.proteinas_por_100g) || 0) * f,
          carbohidratos: acc.carbohidratos + (Number(item.carbohidratos_por_100g) || 0) * f,
          grasas: acc.grasas + (Number(item.grasas_por_100g) || 0) * f,
          fibra: acc.fibra + (Number(item.fibra_por_100g) || 0) * f,
        };
      },
      { calorias: 0, proteinas: 0, carbohidratos: 0, grasas: 0, fibra: 0 }
    );
  }, [selectedItems]);

  // Macros % for donut chart (using energy contribution)
  const kcalFromP = totals.proteinas * 4;
  const kcalFromC = totals.carbohidratos * 4;
  const kcalFromF = totals.grasas * 9;
  const kcalFromFib = totals.fibra * 2; // Fiber approx 2kcal/g
  const totalKcalMacros = kcalFromP + kcalFromC + kcalFromF + kcalFromFib || 1;
  const pctP = (kcalFromP / totalKcalMacros) * 100;
  const pctC = (kcalFromC / totalKcalMacros) * 100;
  const pctF = (kcalFromF / totalKcalMacros) * 100;
  const pctFib = (kcalFromFib / totalKcalMacros) * 100;

  const CIRCUMFERENCE = 2 * Math.PI * 45;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:grid-cols-8 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight mb-3">
          Calculadora de <span className="text-[#A0522D]">Macronutrientes</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto leading-relaxed text-sm">
          Añade ingredientes y calcula en tiempo real la nutrición de tu plato.
          Datos basados en nuestro dataset normalizado.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* LEFT: Management */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          {/* Search */}
          <div className="bg-white dark:bg-[#0f1115] rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
            <h2 className="text-base font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-[#A0522D] rounded-lg flex items-center justify-center text-white text-xs font-black">1</span>
              Busca y añade
            </h2>
            <IngredientSearch
              onAdd={handleAdd}
              allIngredients={allIngredients}
              loadingIngredients={loadingIngredients}
            />
          </div>

          {/* List */}
          <div className="bg-white dark:bg-[#0f1115] rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 flex flex-col gap-3 min-h-[400px]">
             <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-700 dark:text-gray-300 flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-[#A0522D] rounded-lg flex items-center justify-center text-white text-xs font-black">2</span>
                  Ingredientes en el plato
                  {selectedItems.length > 0 && (
                    <span className="bg-[#A0522D]/15 text-[#A0522D] text-xs font-bold px-2 py-0.5 rounded-full">
                      {selectedItems.length}
                    </span>
                  )}
                </div>
                {recipeName && (
                  <span className="text-xs text-[#A0522D] dark:text-[#d4906a] font-black uppercase tracking-wider mt-1 block">
                    Receta: {recipeName}
                  </span>
                )}
              </h2>
              {selectedItems.length > 0 && (
                <button
                  onClick={handleClear}
                  className="flex items-center gap-2 px-3 py-1.5 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs font-bold rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Limpiar plato
                </button>
              )}
            </div>

            {selectedItems.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-10 opacity-30">
                <p className="text-sm font-medium">El plato está vacío</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3 mt-4">
                {selectedItems.map((item) => (
                  <IngredientRow
                    key={item._uid}
                    item={item}
                    onUpdateQuantity={handleUpdateQuantity}
                    onUpdateUnit={handleUpdateUnit}
                    onRemove={handleRemove}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Results */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Calorias */}
          <div className="bg-linear-to-br from-[#A0522D] to-[#7a3d20] text-white rounded-[2rem] p-8 shadow-xl shadow-[#A0522D]/20 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-80 mb-2">Energía Total</p>
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-7xl font-black tabular-nums tracking-tighter">
                {Math.round(totals.calorias)}
              </span>
              <span className="text-xl font-bold opacity-60">kcal</span>
            </div>
          </div>

          {/* Breakdown */}
          <div className="bg-white dark:bg-[#0f1115] rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 p-6">
            <h2 className="text-base font-bold text-gray-700 dark:text-gray-300 mb-6 px-1 text-center">Distribución Nutricional</h2>

            {selectedItems.length > 0 && (
              <div className="flex justify-center mb-8 relative">
                 <svg width="160" height="160" className="-rotate-90">
                  <circle cx="80" cy="80" r="45" fill="none" stroke="#f3f4f6" strokeWidth="18" className="dark:stroke-gray-800" />
                  {/* Carbs */}
                  <circle
                    cx="80" cy="80" r="45" fill="none"
                    stroke="#3b82f6" strokeWidth="18"
                    strokeDasharray={`${(pctC / 100) * CIRCUMFERENCE} ${CIRCUMFERENCE}`}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                  {/* Protein */}
                  <circle
                    cx="80" cy="80" r="45" fill="none"
                    stroke="#10b981" strokeWidth="18"
                    strokeDasharray={`${(pctP / 100) * CIRCUMFERENCE} ${CIRCUMFERENCE}`}
                    strokeDashoffset={-((pctC / 100) * CIRCUMFERENCE)}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                  {/* Fat */}
                  <circle
                    cx="80" cy="80" r="45" fill="none"
                    stroke="#f59e0b" strokeWidth="18"
                    strokeDasharray={`${(pctF / 100) * CIRCUMFERENCE} ${CIRCUMFERENCE}`}
                    strokeDashoffset={-(((pctC + pctP) / 100) * CIRCUMFERENCE)}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                  {/* Fiber */}
                  <circle
                    cx="80" cy="80" r="45" fill="none"
                    stroke="#8b5cf6" strokeWidth="18"
                    strokeDasharray={`${(pctFib / 100) * CIRCUMFERENCE} ${CIRCUMFERENCE}`}
                    strokeDashoffset={-(((pctC + pctP + pctF) / 100) * CIRCUMFERENCE)}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                   <span className="text-xs font-bold text-gray-400 uppercase">Kcal</span>
                   <span className="text-xl font-black text-gray-800 dark:text-white">
                    {Math.round(totals.calorias)}
                   </span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <MacroPill label="Proteínas" value={totals.proteinas} unit="g" color="border-emerald-100 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400" />
              <MacroPill label="Carbos" value={totals.carbohidratos} unit="g" color="border-blue-100 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400" />
              <MacroPill label="Grasas" value={totals.grasas} unit="g" color="border-amber-100 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400" />
              <MacroPill label="Fibra" value={totals.fibra} unit="g" color="border-violet-100 dark:border-violet-900/40 bg-violet-50/50 dark:bg-violet-950/20 text-violet-600 dark:text-violet-400" />
            </div>

            {selectedItems.length > 0 && (
              <div className="mt-8 flex justify-center flex-wrap gap-4 border-t border-gray-100 dark:border-gray-800 pt-6">
                {[
                  { color: "bg-blue-500", label: "C" },
                  { color: "bg-emerald-500", label: "P" },
                  { color: "bg-amber-500", label: "G" },
                  { color: "bg-violet-500", label: "F" },
                ].map((l) => (
                  <span key={l.label} className="flex items-center gap-1.5 text-[10px] font-black uppercase text-gray-400">
                    <span className={`w-2 h-2 rounded-full ${l.color}`} />
                    {l.label}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Copilot Toggle Button */}
      <button
        onClick={() => setIsCopilotOpen(true)}
        className="fixed bottom-6 right-6 z-30 w-14 h-14 bg-linear-to-br from-[#A0522D] to-[#7a3d20] rounded-full shadow-[0_4px_20px_rgba(160,82,45,0.5)] flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all group"
        aria-label="Abrir Chef IA"
      >
        <span className="absolute -top-1 -right-1 bg-red-500 w-3.5 h-3.5 rounded-full border-2 border-[#19120f] animate-pulse"></span>
        <Sparkles className="w-7 h-7 text-white group-hover:animate-spin-slow" />
      </button>

      {/* Copilot Drawer Component */}
      <CopilotChat 
        isOpen={isCopilotOpen} 
        onClose={() => setIsCopilotOpen(false)}
        onAdd={handleAdd}
        onClear={handleClear}
        onSetRecipeName={setRecipeName}
      />
    </div>
  );
}

export default function MacroCalculator() {
  return (
    <AuthProvider>
      <MacroCalculatorInner />
    </AuthProvider>
  );
}