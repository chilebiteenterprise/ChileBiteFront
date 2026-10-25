import React, { useState, useEffect, useRef } from 'react';
import { LocaleCard } from './LocaleCard';
import { locales } from '../data/locales';

interface LocalesGridProps {
  selectedCategory: string;
  selectedRegion: string;
  searchQuery?: string;
}

const ITEMS_PER_PAGE = 9;

const mapCategoryFilter = (filter: string) => {
  if (filter === "Verdulerías") return "Verdulería";
  if (filter === "Pescaderías") return "Pescadería";
  if (filter === "Tostadurías y Frutos Secos") return "Tostadurías y Frutos Secos";
  if (filter === "Queserías y Lácteos") return "Quesería y Lácteos";
  return filter; // "Todos"
};

export const LocalesGrid: React.FC<LocalesGridProps> = ({
  selectedCategory,
  selectedRegion,
  searchQuery = ""
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const sectionRef = useRef<HTMLElement>(null);
  const cleanQuery = searchQuery.trim().toLowerCase();

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedRegion, searchQuery]);

  const filteredLocales = locales.filter(locale => {
    const categoryMatch = selectedCategory === "Todos" || locale.category === mapCategoryFilter(selectedCategory);
    
    const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const regionMatch = selectedRegion === "Todas" || 
      locale.region === selectedRegion ||
      norm(locale.region).includes(norm(selectedRegion)) ||
      norm(selectedRegion).includes(norm(locale.region));
    
    let searchMatch = true;
    if (cleanQuery) {
      const normQ = norm(cleanQuery);
      const rootQ = normQ.endsWith("es") && normQ.length > 4 
        ? normQ.slice(0, -2) 
        : (normQ.endsWith("s") && normQ.length > 3 ? normQ.slice(0, -1) : normQ);

      const check = (target: string) => {
        const normT = norm(target);
        return normT.includes(normQ) || normT.includes(rootQ);
      };

      const matchName = check(locale.name);
      const matchDesc = check(locale.description);
      const matchCommune = locale.commune ? check(locale.commune) : false;
      const matchTags = locale.tags.some(t => check(t));
      const matchStall = locale.stallNumber ? check(locale.stallNumber) : false;
      const matchProducts = locale.featuredProducts 
        ? locale.featuredProducts.some(p => check(p.name))
        : false;

      searchMatch = matchName || matchDesc || matchCommune || matchTags || matchStall || matchProducts;
    }

    return categoryMatch && regionMatch && searchMatch;
  });

  // Parse distance string e.g. "1.2 km" into a numeric value
  const parseDistance = (distStr: string): number => {
    const match = distStr.match(/([\d.]+)/);
    return match ? parseFloat(match[1]) : 9999;
  };

  // Sort by nearest distance first
  const sortedLocales = [...filteredLocales].sort((a, b) => {
    return parseDistance(a.distance) - parseDistance(b.distance);
  });

  const totalPages = Math.ceil(sortedLocales.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedLocales = sortedLocales.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (sectionRef.current) {
      const topOffset = sectionRef.current.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: topOffset, behavior: 'smooth' });
    }
  };

  const getPaginationGroup = () => {
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, currentPage + 2);

    if (currentPage <= 3 && totalPages >= 5) {
      end = 5;
    }
    if (currentPage >= totalPages - 2 && totalPages >= 5) {
      start = totalPages - 4;
    }

    const pages: number[] = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <section ref={sectionRef} className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
      <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl font-bold text-zinc-900 dark:text-white md:text-4xl">
            Puestos y Caseros del Marketplace
          </h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400 text-sm md:text-base">
            {cleanQuery ? (
              <span>Mostrando puestos con <strong className="text-emerald-400 font-semibold">{searchQuery}</strong> ordenados por mayor cercanía a tu ubicación.</span>
            ) : (
              <span>Productos frescos de estación, ofertas del día y contacto directo con feriantes y productores locales.</span>
            )}
          </p>
        </div>
      </div>

      {filteredLocales.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center bg-white dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-white/[0.08] rounded-[2rem] shadow-sm">
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9m14.2 14.2c3.9-3.9 3.9-10.2 0-14.2M12 2a8 8 0 0 1 8 8c0 2.2-.9 4.2-2.3 5.7L12 22l-5.7-6.3A8 8 0 0 1 4 10a8 8 0 0 1 8-8Zm0 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/>
            </svg>
          </div>
          <h3 className="font-serif text-xl font-bold text-zinc-900 dark:text-zinc-100">
            No se encontraron puestos
          </h3>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 max-w-sm">
            Prueba cambiando los filtros de categoría o de región para descubrir nuevas opciones en el territorio.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedLocales.map((locale) => (
              <LocaleCard key={locale.id} locale={locale} />
            ))}
          </div>

          {/* Paginación con diseño de la galería adaptada a tonos verdes */}
          {totalPages > 1 && (
            <div className="mt-12 flex justify-center items-center gap-1 sm:gap-2 mb-8 select-none">
              {/* Botón Anterior */}
              <button
                type="button"
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-emerald-500/15 dark:hover:bg-emerald-500/20 transition-all disabled:opacity-30 disabled:pointer-events-none group cursor-pointer"
                aria-label="Página anterior"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="size-4 transition-transform group-hover:-translate-x-0.5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="hidden sm:inline">Anterior</span>
              </button>

              {/* Primera página + elipsis si es necesario */}
              {getPaginationGroup()[0] > 1 && (
                <>
                  <button 
                    type="button"
                    onClick={() => handlePageChange(1)} 
                    aria-label="Ir a la página 1"
                    className="size-9 sm:size-10 flex items-center justify-center rounded-full text-zinc-600 dark:text-zinc-400 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-emerald-500/15 dark:hover:bg-emerald-500/20 hover:scale-110 active:scale-95 font-semibold text-sm transition-all duration-200 cursor-pointer"
                  >
                    1
                  </button>
                  {getPaginationGroup()[0] > 2 && <span className="text-zinc-400 dark:text-zinc-500 font-medium px-1">…</span>}
                </>
              )}

              {/* Páginas numéricas dinámicas */}
              {getPaginationGroup().map(num => {
                const isCurrent = num === currentPage;
                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handlePageChange(num)}
                    aria-label={`Ir a la página ${num}`}
                    aria-current={isCurrent ? "page" : undefined}
                    className={`size-9 sm:size-10 flex items-center justify-center rounded-full text-sm transition-all duration-200 cursor-pointer ${
                      isCurrent 
                        ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/30 ring-2 ring-emerald-500/50 scale-105' 
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-emerald-500/15 dark:hover:bg-emerald-500/20 hover:scale-110 active:scale-95 font-semibold'
                    }`}
                  >
                    {num}
                  </button>
                );
              })}

              {/* Última página + elipsis si es necesario */}
              {getPaginationGroup()[getPaginationGroup().length - 1] < totalPages && (
                <>
                  {getPaginationGroup()[getPaginationGroup().length - 1] < totalPages - 1 && <span className="text-zinc-400 dark:text-zinc-500 font-medium px-1">…</span>}
                  <button 
                    type="button"
                    onClick={() => handlePageChange(totalPages)} 
                    aria-label={`Ir a la página ${totalPages}`}
                    className="size-9 sm:size-10 flex items-center justify-center rounded-full text-zinc-600 dark:text-zinc-400 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-emerald-500/15 dark:hover:bg-emerald-500/20 hover:scale-110 active:scale-95 font-semibold text-sm transition-all duration-200 cursor-pointer"
                  >
                    {totalPages}
                  </button>
                </>
              )}

              {/* Botón Siguiente */}
              <button
                type="button"
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-emerald-500/15 dark:hover:bg-emerald-500/20 transition-all disabled:opacity-30 disabled:pointer-events-none group cursor-pointer"
                aria-label="Página siguiente"
              >
                <span className="hidden sm:inline">Siguiente</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="size-4 transition-transform group-hover:translate-x-0.5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
};
