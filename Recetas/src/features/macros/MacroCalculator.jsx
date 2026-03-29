import React, { useState, useEffect, useRef, useMemo } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Constants & helpers
// ─────────────────────────────────────────────────────────────────────────────
const API_URL =
  (import.meta.env.PUBLIC_API_URL || "https://chilebiteback.onrender.com")
    ?.replace(/^(?!https?)/, "https://")
    .replace(/\/$/, "");

const normalize = (s = "") =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

// Pill component for macros display
function MacroPill({ label, value, unit, color, icon }) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-4 rounded-2xl border ${color} gap-1 min-w-[110px] flex-1`}
    >
      <span className="text-xl">{icon}</span>
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
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  const suggestions = useMemo(() => {
    const q = normalize(query.trim());
    if (!q || q.length < 2) return [];
    return allIngredients
      .filter((ing) => normalize(ing.nombre_es || ing.nombre).includes(q))
      .slice(0, 8);
  }, [query, allIngredients]);

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
    onAdd(ing);
    setQuery("");
    setIsOpen(false);
    setActiveIdx(-1);
    inputRef.current?.focus();
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

  const showDrop = isOpen && suggestions.length > 0;

  return (
    <div ref={containerRef} className="relative w-full">
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
            setActiveIdx(-1);
          }}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="w-full pl-12 pr-4 py-4 bg-white dark:bg-[#1a1d24] border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:border-[#A0522D] text-gray-900 dark:text-gray-100 placeholder-gray-400 transition-all font-medium text-base disabled:opacity-50 disabled:cursor-wait shadow-sm"
        />
      </div>

      {showDrop && (
        <div className="absolute top-[calc(100%+8px)] left-0 right-0 z-50 bg-white dark:bg-[#1a1d24] border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl overflow-hidden">
          <div className="px-4 pt-3 pb-2 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {suggestions.length} resultado{suggestions.length !== 1 ? "s" : ""}
            </span>
          </div>
          <ul className="py-1 max-h-64 overflow-y-auto">
            {suggestions.map((ing, i) => {
              const name = ing.nombre_es || ing.nombre;
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
                  <span
                    className={`shrink-0 w-8 h-8 flex items-center justify-center rounded-xl text-sm ${
                      i === activeIdx
                        ? "bg-[#A0522D]/15"
                        : "bg-gray-100 dark:bg-gray-800"
                    }`}
                  >
                    🥗
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-800 dark:text-gray-200 truncate">
                      {highlight(name, query)}
                    </p>
                    {ing.nombre && ing.nombre_es && ing.nombre !== ing.nombre_es && (
                      <p className="text-xs text-gray-400 truncate">{ing.nombre}</p>
                    )}
                  </div>
                  <div className="ml-auto shrink-0 text-right text-xs text-gray-400">
                    {ing.calorias != null && (
                      <span>{Math.round(ing.calorias)} kcal</span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-800 flex items-center gap-3 text-[10px] text-gray-400">
            <span>
              <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded font-mono">↑↓</kbd> navegar
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded font-mono">Enter</kbd> añadir
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded font-mono">Esc</kbd> cerrar
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Single ingredient row in the list
// ─────────────────────────────────────────────────────────────────────────────
function IngredientRow({ item, onUpdateGrams, onRemove }) {
  const name = item.nombre_es || item.nombre;
  const factor = item.grams / 100;

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700/60 group transition-all hover:shadow-sm">
      {/* Icon */}
      <span className="text-lg shrink-0">🥗</span>

      {/* Name */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm truncate">
          {name}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {item.calorias != null &&
            `${(item.calorias * factor).toFixed(0)} kcal · `}
          {item.proteinas != null &&
            `P: ${(item.proteinas * factor).toFixed(1)}g · `}
          {item.carbohidratos != null &&
            `C: ${(item.carbohidratos * factor).toFixed(1)}g · `}
          {item.grasas != null && `G: ${(item.grasas * factor).toFixed(1)}g`}
        </p>
      </div>

      {/* Grams input */}
      <div className="flex items-center gap-1 shrink-0">
        <input
          type="number"
          min={1}
          max={2000}
          value={item.grams}
          onChange={(e) => onUpdateGrams(item._uid, Math.max(1, Number(e.target.value)))}
          className="w-16 text-center text-sm font-bold bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl py-1.5 focus:outline-none focus:border-[#A0522D] transition-colors"
        />
        <span className="text-xs text-gray-400 font-medium">g</span>
      </div>

      {/* Remove */}
      <button
        onClick={() => onRemove(item._uid)}
        className="shrink-0 w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors opacity-0 group-hover:opacity-100"
        aria-label="Eliminar ingrediente"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Calculator Component
// ─────────────────────────────────────────────────────────────────────────────
let _uid = 0;
const nextUid = () => ++_uid;

export default function MacroCalculator() {
  const [allIngredients, setAllIngredients] = useState([]);
  const [loadingIngredients, setLoadingIngredients] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);

  // Load ingredient catalogue
  useEffect(() => {
    setLoadingIngredients(true);
    fetch(`${API_URL}/api/ingredientes/`)
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data)
          ? data
          : data.results || [];
        setAllIngredients(list);
      })
      .catch(console.error)
      .finally(() => setLoadingIngredients(false));
  }, []);

  const handleAdd = (ing) => {
    setSelectedItems((prev) => [
      ...prev,
      { ...ing, grams: 100, _uid: nextUid() },
    ]);
  };

  const handleUpdateGrams = (uid, grams) => {
    setSelectedItems((prev) =>
      prev.map((i) => (i._uid === uid ? { ...i, grams } : i))
    );
  };

  const handleRemove = (uid) => {
    setSelectedItems((prev) => prev.filter((i) => i._uid !== uid));
  };

  const handleClear = () => setSelectedItems([]);

  // Totals (values in DB are per 100g)
  const totals = useMemo(() => {
    return selectedItems.reduce(
      (acc, item) => {
        const f = item.grams / 100;
        return {
          calorias: acc.calorias + (item.calorias ?? 0) * f,
          proteinas: acc.proteinas + (item.proteinas ?? 0) * f,
          carbohidratos: acc.carbohidratos + (item.carbohidratos ?? 0) * f,
          grasas: acc.grasas + (item.grasas ?? 0) * f,
          fibra: acc.fibra + (item.fibra ?? 0) * f,
        };
      },
      { calorias: 0, proteinas: 0, carbohidratos: 0, grasas: 0, fibra: 0 }
    );
  }, [selectedItems]);

  // Macros % for donut-like chart
  const kcalFromP = totals.proteinas * 4;
  const kcalFromC = totals.carbohidratos * 4;
  const kcalFromF = totals.grasas * 9;
  const totalKcalMacros = kcalFromP + kcalFromC + kcalFromF || 1;
  const pctP = (kcalFromP / totalKcalMacros) * 100;
  const pctC = (kcalFromC / totalKcalMacros) * 100;
  const pctF = (kcalFromF / totalKcalMacros) * 100;

  // Segments for the ring chart
  const CIRCUMFERENCE = 2 * Math.PI * 45; // r=45
  const segP = (pctP / 100) * CIRCUMFERENCE;
  const segC = (pctC / 100) * CIRCUMFERENCE;
  const segF = (pctF / 100) * CIRCUMFERENCE;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* ── Header ── */}
      <div className="mb-10 text-center">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#A0522D]/10 text-[#A0522D] font-bold text-sm uppercase tracking-wider mb-4">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          Herramienta Beta
        </span>
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight mb-3">
          Calculadora de{" "}
          <span className="text-[#A0522D]">Macronutrientes</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto leading-relaxed">
          Agrega ingredientes libremente y calcula en tiempo real las calorías,
          proteínas, carbohidratos y grasas de tu plato. Datos basados en el
          dataset USDA normalizado.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* ── LEFT: Search + Ingredient List ── */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          {/* Search */}
          <div className="bg-white dark:bg-[#0f1115] rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
            <h2 className="text-base font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-[#A0522D] rounded-lg flex items-center justify-center text-white text-xs font-black">1</span>
              Busca un ingrediente
            </h2>
            <IngredientSearch
              onAdd={handleAdd}
              allIngredients={allIngredients}
              loadingIngredients={loadingIngredients}
            />
          </div>

          {/* Ingredient list */}
          <div className="bg-white dark:bg-[#0f1115] rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 flex flex-col gap-3 flex-1">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <span className="w-6 h-6 bg-[#A0522D] rounded-lg flex items-center justify-center text-white text-xs font-black">2</span>
                Ingredientes añadidos
                {selectedItems.length > 0 && (
                  <span className="ml-1 bg-[#A0522D]/15 text-[#A0522D] text-xs font-bold px-2 py-0.5 rounded-full">
                    {selectedItems.length}
                  </span>
                )}
              </h2>
              {selectedItems.length > 0 && (
                <button
                  onClick={handleClear}
                  className="text-xs text-gray-400 hover:text-red-500 transition-colors font-medium"
                >
                  Limpiar todo
                </button>
              )}
            </div>

            {selectedItems.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-3xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4 text-3xl">
                  🥗
                </div>
                <p className="text-gray-400 font-medium">No has añadido ingredientes aún</p>
                <p className="text-sm text-gray-300 dark:text-gray-600 mt-1">
                  Busca un ingrediente arriba para comenzar
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
                {selectedItems.map((item) => (
                  <IngredientRow
                    key={item._uid}
                    item={item}
                    onUpdateGrams={handleUpdateGrams}
                    onRemove={handleRemove}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: Results ── */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Calorie hero card */}
          <div className="bg-linear-to-br from-[#A0522D] to-[#7a3d20] text-white rounded-3xl p-6 shadow-xl shadow-[#A0522D]/20 flex flex-col items-center justify-center gap-2 min-h-[160px]">
            <p className="text-sm font-semibold uppercase tracking-widest opacity-80">
              Total de calorías
            </p>
            <p className="text-6xl font-black tabular-nums leading-none">
              {Math.round(totals.calorias)}
            </p>
            <p className="text-sm font-semibold opacity-70">kcal</p>
          </div>

          {/* Macros breakdown */}
          <div className="bg-white dark:bg-[#0f1115] rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
            <h2 className="text-base font-bold text-gray-700 dark:text-gray-300 mb-4">
              Distribución de macros
            </h2>

            {/* Ring chart */}
            {selectedItems.length > 0 && (
              <div className="flex justify-center mb-5">
                <svg width="120" height="120" className="-rotate-90">
                  <circle cx="60" cy="60" r="45" fill="none" stroke="#f3f4f6" strokeWidth="12" className="dark:stroke-gray-800" />
                  {/* Carbs */}
                  <circle
                    cx="60" cy="60" r="45" fill="none"
                    stroke="#3b82f6" strokeWidth="12"
                    strokeDasharray={`${(pctC / 100) * CIRCUMFERENCE} ${CIRCUMFERENCE}`}
                    strokeLinecap="round"
                  />
                  {/* Protein */}
                  <circle
                    cx="60" cy="60" r="45" fill="none"
                    stroke="#10b981" strokeWidth="12"
                    strokeDasharray={`${(pctP / 100) * CIRCUMFERENCE} ${CIRCUMFERENCE}`}
                    strokeDashoffset={-((pctC / 100) * CIRCUMFERENCE)}
                    strokeLinecap="round"
                  />
                  {/* Fat */}
                  <circle
                    cx="60" cy="60" r="45" fill="none"
                    stroke="#f59e0b" strokeWidth="12"
                    strokeDasharray={`${(pctF / 100) * CIRCUMFERENCE} ${CIRCUMFERENCE}`}
                    strokeDashoffset={-(((pctC + pctP) / 100) * CIRCUMFERENCE)}
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <MacroPill
                label="Proteínas"
                value={totals.proteinas}
                unit="g"
                icon="💪"
                color="border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400"
              />
              <MacroPill
                label="Carbohid."
                value={totals.carbohidratos}
                unit="g"
                icon="🌾"
                color="border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400"
              />
              <MacroPill
                label="Grasas"
                value={totals.grasas}
                unit="g"
                icon="🫒"
                color="border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400"
              />
              <MacroPill
                label="Fibra"
                value={totals.fibra}
                unit="g"
                icon="🥦"
                color="border-violet-200 dark:border-violet-900 bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-400"
              />
            </div>

            {/* Legend */}
            {selectedItems.length > 0 && (
              <div className="mt-4 flex gap-3 flex-wrap">
                {[
                  { color: "bg-blue-400", label: `Carbos ${pctC.toFixed(0)}%` },
                  { color: "bg-emerald-400", label: `Proteínas ${pctP.toFixed(0)}%` },
                  { color: "bg-amber-400", label: `Grasas ${pctF.toFixed(0)}%` },
                ].map((l) => (
                  <span key={l.label} className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                    <span className={`w-2.5 h-2.5 rounded-full ${l.color}`} />
                    {l.label}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-gray-400 dark:text-gray-600 leading-relaxed px-1">
            * Los valores nutricionales son aproximados y provienen de la base de datos USDA. Los datos pueden variar según la preparación y la fuente de los ingredientes.
          </p>
        </div>
      </div>
    </div>
  );
}
