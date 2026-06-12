import React from 'react';
import { SearchField, Label } from '@heroui/react';
import { Search, MapPin } from 'lucide-react';

export const LocalesHero: React.FC = () => {
  return (
    <section className="relative flex min-h-[60vh] items-center justify-center overflow-hidden bg-zinc-950 py-20 px-6">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=2000"
          alt="Chilean culinary landscape"
          className="h-full w-full object-cover opacity-40 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/80 via-transparent to-zinc-950" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-copper-500/30 bg-copper-500/10 px-4 py-1 backdrop-blur-md">
          <MapPin className="size-4 text-copper-400" />
          <span className="text-xs font-bold uppercase tracking-widest text-copper-300">
            Encuentra el sabor de Chile
          </span>
        </div>

        <h1 className="mb-6 font-serif text-5xl font-extrabold leading-tight text-white md:text-7xl">
          Explora el Mapa del <br />
          <span className="bg-gradient-to-r from-amber-400 via-copper-400 to-orange-500 bg-clip-text text-transparent">
            Sabor Chileno
          </span>
        </h1>

        <p className="mx-auto mb-10 max-w-2xl text-lg text-zinc-400 md:text-xl">
          Desde las picadas más tradicionales hasta la alta cocina de autor. 
          Descubre los tesoros culinarios ocultos en cada rincón del territorio.
        </p>

        <div className="mx-auto max-w-2xl">
          <SearchField name="search-locales">
            <Label className="sr-only">Buscar locales</Label>
            <SearchField.Group className="relative overflow-hidden rounded-full border-none bg-white/10 p-1 backdrop-blur-2xl transition-all duration-300 focus-within:bg-white/20 focus-within:ring-2 focus-within:ring-copper-500/50">
              <SearchField.SearchIcon className="ml-4 size-5 text-zinc-400" />
              <SearchField.Input
                placeholder="Busca por nombre, ciudad o especialidad..."
                className="w-full bg-transparent px-4 py-3 text-white placeholder:text-zinc-500 focus:outline-none"
              />
              <button className="mr-1 rounded-full bg-copper-500 px-6 py-2 text-sm font-bold text-white transition-all hover:bg-copper-400 hover:shadow-lg hover:shadow-copper-500/20">
                Buscar
              </button>
            </SearchField.Group>
          </SearchField>
        </div>
      </div>

      {/* Decorative Gradient Elements */}
      <div className="absolute -bottom-24 -left-24 size-96 rounded-full bg-copper-500/20 blur-[120px]" />
      <div className="absolute -top-24 -right-24 size-96 rounded-full bg-amber-500/10 blur-[120px]" />
    </section>
  );
};
