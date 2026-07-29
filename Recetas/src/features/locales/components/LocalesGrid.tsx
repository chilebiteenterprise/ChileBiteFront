import React from 'react';
import { LocaleCard } from './LocaleCard';
import { locales } from '../data/locales';

interface LocalesGridProps {
  selectedCategory: string;
  selectedRegion: string;
}

const mapCategoryFilter = (filter: string) => {
  if (filter === "Restaurantes") return "Restaurante";
  if (filter === "Picadas Tradicionales") return "Picada";
  if (filter === "Cafeterías") return "Cafetería";
  if (filter === "Viñedos") return "Viñedo";
  if (filter === "Mercados") return "Mercado";
  return filter; // "Todos"
};

export const LocalesGrid: React.FC<LocalesGridProps> = ({
  selectedCategory,
  selectedRegion
}) => {
  const filteredLocales = locales.filter(locale => {
    const categoryMatch = selectedCategory === "Todos" || locale.category === mapCategoryFilter(selectedCategory);
    const regionMatch = selectedRegion === "Todas" || locale.region === selectedRegion;
    return categoryMatch && regionMatch;
  });

  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-10 flex items-end justify-between">
        <div>
          <h2 className="font-serif text-3xl font-bold text-zinc-900 dark:text-white md:text-4xl">
            Locales Destacados
          </h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Una selección curada de las mejores experiencias gastronómicas.
          </p>
        </div>
        <div className="hidden text-sm font-medium text-zinc-500 md:block">
          Mostrando {filteredLocales.length} resultados
        </div>
      </div>

      {filteredLocales.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-[2rem] shadow-sm">
          <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl text-[#b08968] mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9m14.2 14.2c3.9-3.9 3.9-10.2 0-14.2M12 2a8 8 0 0 1 8 8c0 2.2-.9 4.2-2.3 5.7L12 22l-5.7-6.3A8 8 0 0 1 4 10a8 8 0 0 1 8-8Zm0 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/>
            </svg>
          </div>
          <h3 className="font-serif text-xl font-bold text-zinc-900 dark:text-zinc-100">
            No se encontraron locales
          </h3>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 max-w-sm">
            Prueba a cambiar los filtros de categoría o de región para descubrir nuevas opciones culinarias en el territorio.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filteredLocales.map((locale) => (
            <LocaleCard key={locale.id} locale={locale} />
          ))}
        </div>
      )}
    </section>
  );
};
