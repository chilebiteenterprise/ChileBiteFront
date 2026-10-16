import React from 'react';
import { CategoryChip } from './CategoryChip';

interface LocalesFilterProps {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedRegion: string;
  setSelectedRegion: (region: string) => void;
}

const categories = [
  "Todos",
  "Restaurantes",
  "Picadas Tradicionales",
  "Cafeterías",
  "Viñedos",
  "Mercados"
];

export const LocalesFilter: React.FC<LocalesFilterProps> = ({
  selectedCategory,
  setSelectedCategory,
  selectedRegion,
  setSelectedRegion
}) => {
  return (
    <div className="sticky top-20 z-40 bg-zinc-50/80 py-6 backdrop-blur-xl dark:bg-zinc-950/80 border-b border-zinc-200/50 dark:border-zinc-800/50">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          {/* Region Dropdown Selector */}
          <div className="flex items-center gap-3">
            <label htmlFor="region-select" className="text-xs font-black uppercase tracking-widest text-brand-primary">
              Filtrar por Región:
            </label>
            <select
              id="region-select"
              aria-label="Región"
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="bg-surface-input border border-border-subtle rounded-full px-6 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-primary text-text-main cursor-pointer transition-all duration-300 shadow-sm hover:border-brand-primary"
            >
              <option value="Todas">Todas las Regiones</option>
              <option value="Metropolitana de Santiago">Región Metropolitana</option>
              <option value="Valparaíso">Región de Valparaíso</option>
              <option value="Coquimbo">Región de Coquimbo</option>
              <option value="Araucanía">Región de la Araucanía</option>
              <option value="Antofagasta">Región de Antofagasta</option>
            </select>
          </div>

          {/* Category Filters */}
          <div className="no-scrollbar flex items-center gap-3 overflow-x-auto pb-2 md:pb-0">
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
