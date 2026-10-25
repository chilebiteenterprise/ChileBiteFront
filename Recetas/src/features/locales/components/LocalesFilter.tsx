import React, { useState, useRef, useEffect, useMemo } from 'react';
import { MapPin, ChevronDown, Check, Search, RotateCcw, X } from 'lucide-react';
import { CategoryChip } from './CategoryChip';
import { CHILE_REGIONS } from '../data/regions';

interface LocalesFilterProps {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedRegion: string;
  setSelectedRegion: (region: string) => void;
}

const categories = [
  "Todos",
  "Verdulerías",
  "Pescaderías",
  "Tostadurías y Frutos Secos",
  "Queserías y Lácteos"
];

export const LocalesFilter: React.FC<LocalesFilterProps> = ({
  selectedCategory,
  setSelectedCategory,
  selectedRegion,
  setSelectedRegion
}) => {
  const [isRegionOpen, setIsRegionOpen] = useState(false);
  const [regionSearch, setRegionSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on click outside or Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsRegionOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsRegionOpen(false);
      }
    };

    if (isRegionOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isRegionOpen]);

  // Normalize search for accents
  const normalize = (str: string) => 
    str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const filteredRegions = useMemo(() => {
    if (!regionSearch.trim()) return CHILE_REGIONS;
    const q = normalize(regionSearch.trim());
    return CHILE_REGIONS.filter(
      r => normalize(r.name).includes(q) || 
           normalize(r.shortName).includes(q) || 
           normalize(r.romanNumeral).includes(q)
    );
  }, [regionSearch]);

  const currentRegionObj = useMemo(() => {
    if (selectedRegion === "Todas") return null;
    return CHILE_REGIONS.find(r => r.value === selectedRegion);
  }, [selectedRegion]);

  const currentRegionLabel = currentRegionObj ? currentRegionObj.shortName : "Todas las Regiones";

  const hasActiveFilters = selectedRegion !== "Todas" || selectedCategory !== "Todos";

  const handleResetFilters = () => {
    setSelectedRegion("Todas");
    setSelectedCategory("Todos");
  };

  return (
    <div className="sticky top-20 z-30 mp-filter-bar py-3.5 backdrop-blur-xl transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5 w-full max-w-full min-w-0">
          
          {/* Left: Region Selector & Reset */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsRegionOpen(prev => !prev)}
                aria-haspopup="listbox"
                aria-expanded={isRegionOpen}
                className={`group h-11 px-4.5 rounded-full flex items-center gap-2.5 text-xs md:text-sm font-medium transition-all duration-200 cursor-pointer select-none border ${
                  isRegionOpen
                    ? 'border-emerald-600 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-500/30'
                    : selectedRegion !== "Todas"
                      ? 'border-emerald-600/60 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                      : 'mp-button'
                }`}
              >
                <MapPin className={`size-4 shrink-0 transition-colors ${selectedRegion !== "Todas" ? "text-emerald-600 dark:text-emerald-400" : "mp-text-muted group-hover:text-emerald-600 dark:group-hover:text-emerald-400"}`} />
                <span className="mp-text-muted text-xs font-medium uppercase tracking-wider hidden sm:inline">Región:</span>
                <span className="truncate max-w-[150px] sm:max-w-[200px] mp-text-title font-semibold">
                  {currentRegionLabel}
                </span>
                <ChevronDown 
                  className={`size-4 ml-1 mp-text-muted transition-transform duration-200 shrink-0 ${isRegionOpen ? 'rotate-180 text-emerald-600 dark:text-emerald-400' : ''}`} 
                />
              </button>

              {/* Popover Dropdown */}
              {isRegionOpen && (
                <div 
                  className="absolute left-0 top-full mt-2 w-80 sm:w-88 max-h-[360px] z-50 rounded-2xl mp-dropdown shadow-2xl backdrop-blur-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
                  role="listbox"
                >
                  {/* Search bar inside dropdown */}
                  <div className="p-2.5 mp-dropdown-header">
                    <div className="relative flex items-center">
                      <Search className="absolute left-3 size-4 mp-text-subtle pointer-events-none" />
                      <input
                        ref={searchInputRef}
                        type="text"
                        value={regionSearch}
                        onChange={(e) => setRegionSearch(e.target.value)}
                        placeholder="Buscar región de Chile..."
                        className="w-full h-9 pl-9 pr-8 text-xs font-normal rounded-xl mp-input focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-colors"
                      />
                      {regionSearch && (
                        <button
                          type="button"
                          onClick={() => setRegionSearch("")}
                          className="absolute right-2.5 mp-text-muted hover:mp-text-title p-0.5 cursor-pointer"
                        >
                          <X className="size-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* List of Regions */}
                  <div className="overflow-y-auto p-1.5 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700 scrollbar-track-transparent">
                    {/* Todas las Regiones option */}
                    {!regionSearch && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedRegion("Todas");
                            setIsRegionOpen(false);
                            setRegionSearch("");
                          }}
                          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs md:text-sm transition-colors cursor-pointer text-left ${
                            selectedRegion === "Todas"
                              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-semibold'
                              : 'mp-dropdown-item'
                          }`}
                        >
                          <span>Todas las Regiones</span>
                          {selectedRegion === "Todas" && (
                            <Check className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          )}
                        </button>
                        <div className="my-1.5 h-px mp-border border-b" />
                      </>
                    )}

                    {filteredRegions.length === 0 ? (
                      <div className="py-8 text-center text-xs mp-text-muted">
                        No se encontraron regiones
                      </div>
                    ) : (
                      filteredRegions.map((region) => {
                        const isSelected = selectedRegion === region.value;
                        return (
                          <button
                            key={region.value}
                            type="button"
                            onClick={() => {
                              setSelectedRegion(region.value);
                              setIsRegionOpen(false);
                              setRegionSearch("");
                            }}
                            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs md:text-sm transition-colors cursor-pointer text-left ${
                              isSelected
                                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-semibold'
                                : 'mp-dropdown-item'
                            }`}
                          >
                            <span className="truncate pr-2 font-medium">{region.name}</span>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[11px] font-mono mp-text-subtle uppercase">
                                {region.romanNumeral}
                              </span>
                              {isSelected && (
                                <Check className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                              )}
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick reset button if filters active */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                title="Restablecer filtros"
                className="inline-flex items-center gap-1.5 h-11 px-3.5 rounded-full text-xs font-medium mp-button transition-all cursor-pointer active:scale-95"
              >
                <RotateCcw className="size-3 text-emerald-600 dark:text-emerald-400" />
                <span className="hidden sm:inline">Restablecer</span>
              </button>
            )}
          </div>

          {/* Right: Category Filters (Pill Slider) */}
          <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scroll-smooth min-w-0 max-w-full">
            {categories.map((category) => (
              <CategoryChip
                key={category}
                label={category}
                isActive={selectedCategory === category}
                onClick={() => setSelectedCategory(category)}
              />
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};
