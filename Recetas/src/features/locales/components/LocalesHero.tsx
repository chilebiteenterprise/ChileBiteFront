import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, X, Tag } from 'lucide-react';
import { locales } from '../data/locales';

interface LocalesHeroProps {
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
}

export const LocalesHero: React.FC<LocalesHeroProps> = ({ searchQuery = "", setSearchQuery }) => {
  const [inputValue, setInputValue] = useState(searchQuery);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync external searchQuery with local inputValue
  useEffect(() => {
    if (searchQuery === "") {
      setInputValue("");
    } else {
      setInputValue(searchQuery);
    }
  }, [searchQuery]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Collect ONLY ingredients and fresh products
  const allIngredients: string[] = useMemo(() => {
    const seen = new Set<string>();
    const list: string[] = [];

    const add = (name: string) => {
      const clean = name.trim();
      if (!clean || seen.has(clean.toLowerCase())) return;
      seen.add(clean.toLowerCase());
      list.push(clean);
    };

    // 1. Fresh products and ingredients from stalls
    locales.forEach(loc => {
      loc.featuredProducts?.forEach(p => add(p.name));
    });

    // 2. Ingredientes populares de ferias libres chilenas (nombres cotidianos)
    const freshMarketIngredients = [
      "Tomate", "Palta", "Choclo", "Cebolla", "Papas", "Zanahoria", "Lechuga", 
      "Limón", "Acelga", "Espinaca", "Zapallo", "Pimentón", "Ajo", "Cilantro", 
      "Perejil", "Albahaca", "Frutillas", "Melón", "Sandía", "Plátano", "Manzana", 
      "Naranja", "Arándanos", "Reineta", "Merluza", "Congrio", "Sierra", 
      "Choritos", "Machas", "Almejas", "Ostiones", "Camarones", "Huevos", 
      "Porotos", "Lentejas", "Garbanzos", "Nueces", "Almendras", "Maní", 
      "Castañas de Cajú", "Harina Tostada", "Merkén", "Queso Chanco", "Queso Mantecoso", 
      "Queso de Cabra", "Quesillo", "Mantequilla", "Manjar", "Piñones", "Ají"
    ];
    freshMarketIngredients.forEach(add);

    return list.sort((a, b) => a.localeCompare(b, 'es'));
  }, []);

  const normalize = (str: string) =>
    str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const suggestions = useMemo(() => {
    const q = normalize(inputValue.trim());
    if (!q || q.length < 1) return [];
    return allIngredients
      .filter(name => normalize(name).includes(q))
      .slice(0, 8);
  }, [inputValue, allIngredients]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    if (setSearchQuery) setSearchQuery(val);
    setIsOpen(true);
    setActiveIndex(-1);
  };

  const handleSelect = (name: string) => {
    setInputValue(name);
    if (setSearchQuery) setSearchQuery(name);
    setIsOpen(false);
    setActiveIndex(-1);
    inputRef.current?.blur();
  };

  const handleClear = () => {
    setInputValue("");
    if (setSearchQuery) setSearchQuery("");
    setIsOpen(false);
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex(prev => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === "Enter") {
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        e.preventDefault();
        handleSelect(suggestions[activeIndex].name);
      } else {
        setIsOpen(false);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setActiveIndex(-1);
    }
  };

  const highlight = (text: string, query: string) => {
    const normText = normalize(text);
    const normQuery = normalize(query.trim());
    const idx = normText.indexOf(normQuery);
    if (idx === -1 || !normQuery) return <span className="text-white">{text}</span>;
    return (
      <>
        <span className="text-zinc-300">{text.slice(0, idx)}</span>
        <span className="text-amber-400 font-bold">{text.slice(idx, idx + normQuery.length)}</span>
        <span className="text-zinc-300">{text.slice(idx + normQuery.length)}</span>
      </>
    );
  };

  const showDropdown = isOpen && suggestions.length > 0;

  return (
    <section className="relative z-20 flex min-h-[55vh] items-center justify-center overflow-visible bg-zinc-950 py-16 px-6 border-b border-zinc-900 transition-colors">
      {/* Background Image with Dark Atmospheric Overlay */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=2000"
          alt="Mercados, ferias y gastronomía chilena"
          className="h-full w-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/85 via-zinc-950/50 to-zinc-950" />
      </div>

      <div className="relative z-20 mx-auto max-w-4xl text-center w-full">
        <h1 className="mb-5 font-serif text-4xl font-extrabold leading-tight text-white md:text-6xl">
          Encuentra tu Casero y los <br />
          <span className="bg-gradient-to-r from-emerald-400 via-amber-300 to-orange-400 bg-clip-text text-transparent">
            Mejores Productos del Día
          </span>
        </h1>

        <p className="mx-auto mb-8 max-w-2xl text-base text-zinc-300 md:text-lg">
          Ubica puestos de feria libre, verdulerías y productores locales cerca de ti. Compara precios por kilo y pide directo por WhatsApp.
        </p>

        {/* Autocomplete Search Container */}
        <div ref={containerRef} className="relative z-20 mx-auto max-w-2xl w-full">
          <div className="relative rounded-full border border-white/15 bg-white/10 p-1 backdrop-blur-2xl transition-all duration-300 focus-within:bg-zinc-900/90 focus-within:border-brand-primary focus-within:ring-2 focus-within:ring-brand-primary/30 shadow-2xl flex items-center">
            <Search className="ml-4 size-5 text-zinc-400 shrink-0 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={showDropdown}
              value={inputValue}
              onChange={handleInputChange}
              onFocus={() => { if (suggestions.length > 0) setIsOpen(true); }}
              onKeyDown={handleKeyDown}
              placeholder="Busca un ingrediente (ej: palta, reineta, queso chanco, tomate)..."
              className="w-full bg-transparent px-4 py-3 text-white placeholder:text-zinc-400 focus:outline-none text-sm md:text-base font-normal"
            />
            {inputValue && (
              <button
                type="button"
                onClick={handleClear}
                className="mr-3 text-zinc-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Limpiar búsqueda"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {/* Autocomplete Suggestions Popover */}
          {showDropdown && (
            <div 
              role="listbox"
              className="absolute top-[calc(100%+8px)] left-0 right-0 z-[100] rounded-2xl bg-zinc-900/95 border border-zinc-800 shadow-2xl backdrop-blur-2xl overflow-hidden text-left animate-in fade-in slide-in-from-top-1 duration-150"
            >
              <div className="px-4 py-2.5 border-b border-zinc-800 flex items-center justify-between text-zinc-400 text-xs font-semibold uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Tag className="size-3.5 text-amber-400" />
                  Ingredientes y productos disponibles
                </span>
                <span className="text-[11px] font-mono text-zinc-500">
                  {suggestions.length} resultados
                </span>
              </div>

              <ul className="py-1 max-h-72 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
                {suggestions.map((ingredient, idx) => (
                  <li
                    key={`${ingredient}-${idx}`}
                    role="option"
                    aria-selected={idx === activeIndex}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelect(ingredient);
                    }}
                    onMouseEnter={() => setActiveIndex(idx)}
                    className={`flex items-center justify-between px-4 py-2.5 cursor-pointer transition-colors text-sm ${
                      idx === activeIndex
                        ? "bg-zinc-800 text-white font-semibold"
                        : "text-zinc-300 hover:bg-zinc-800/70 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-3">
                      <div className="size-7 rounded-lg flex items-center justify-center shrink-0 bg-amber-400/10 text-amber-400">
                        <Tag className="size-3.5" />
                      </div>
                      <span className="truncate">
                        {highlight(ingredient, inputValue)}
                      </span>
                    </div>

                    <span className="text-[10px] font-medium uppercase tracking-wider text-amber-400 shrink-0">
                      Ingrediente
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Decorative Gradient Elements (clipped to avoid horizontal scroll) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -bottom-24 -left-24 size-96 rounded-full bg-copper-500/10 dark:bg-copper-500/20 blur-[120px]" />
        <div className="absolute -top-24 -right-24 size-96 rounded-full bg-amber-500/10 blur-[120px]" />
      </div>
    </section>
  );
};
