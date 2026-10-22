import React from 'react';
import { Search, MapPin } from 'lucide-react';

interface LocalesHeroProps {
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
}

export const LocalesHero: React.FC<LocalesHeroProps> = ({ searchQuery = "", setSearchQuery }) => {
  return (
    <section className="relative flex min-h-[55vh] items-center justify-center overflow-hidden bg-zinc-950 py-16 px-6">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=2000"
          alt="Mercados, ferias y gastronomía chilena"
          className="h-full w-full object-cover opacity-35 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/80 via-transparent to-zinc-950" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 backdrop-blur-md">
          <MapPin className="size-4 text-emerald-400" />
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-300">
            Marketplace de Ferias y Productos Frescos
          </span>
        </div>

        <h1 className="mb-5 font-serif text-4xl font-extrabold leading-tight text-white md:text-6xl">
          Encuentra tu Casero y los <br />
          <span className="bg-gradient-to-r from-emerald-400 via-amber-300 to-orange-400 bg-clip-text text-transparent">
            Mejores Productos del Día
          </span>
        </h1>

        <p className="mx-auto mb-8 max-w-2xl text-base text-zinc-300 md:text-lg">
          Ubica puestos de feria libre, verdulerías y productores locales cerca de ti. Compara precios por kilo, ofertas del día y pide directo por WhatsApp.
        </p>

        <div className="mx-auto max-w-2xl">
          <div className="relative overflow-hidden rounded-full border border-white/20 bg-white/10 p-1.5 backdrop-blur-2xl transition-all duration-300 focus-within:bg-white/20 focus-within:ring-2 focus-within:ring-emerald-500/50 shadow-2xl flex items-center">
            <Search className="ml-4 size-5 text-zinc-300 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
              placeholder="Busca por producto (ej: palta, choclo), puesto, feria o comuna..."
              className="w-full bg-transparent px-4 py-3 text-white placeholder:text-zinc-400 focus:outline-none text-sm md:text-base"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery && setSearchQuery("")}
                className="mr-2 text-zinc-400 hover:text-white text-xs font-semibold px-2 py-1"
              >
                Limpiar
              </button>
            )}
            <button 
              className="mr-1 rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-600/30 shrink-0"
            >
              Explorar
            </button>
          </div>
        </div>
      </div>

      {/* Decorative Gradient Elements */}
      <div className="absolute -bottom-24 -left-24 size-96 rounded-full bg-copper-500/20 blur-[120px]" />
      <div className="absolute -top-24 -right-24 size-96 rounded-full bg-amber-500/10 blur-[120px]" />
    </section>
  );
};
