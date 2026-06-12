import React from 'react';
import { Card, Button } from '@heroui/react';
import { Map, Maximize2, Navigation } from 'lucide-react';

export const LocalesMapPreview: React.FC = () => {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <Card className="relative h-[500px] overflow-hidden rounded-[2rem] border-none shadow-2xl">
        {/* Mock Map Image */}
        <img
          src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80&w=2000"
          alt="Map visualization placeholder"
          className="h-full w-full object-cover opacity-90 dark:opacity-70 grayscale-[0.5] contrast-[1.1]"
        />
        
        {/* Overlay Grid/Texture for map feel */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
        
        {/* Content Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 backdrop-blur-[2px]">
          <div className="flex flex-col items-center text-center p-8 bg-white/90 dark:bg-zinc-950/90 rounded-3xl shadow-2xl border border-white/20 max-w-md">
            <div className="mb-4 rounded-2xl bg-copper-500 p-4 shadow-xl shadow-copper-500/30">
              <Map className="size-8 text-white" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-zinc-900 dark:text-white">
              Navega el Territorio
            </h3>
            <p className="mt-3 text-zinc-600 dark:text-zinc-400">
              Visualiza todos los locales en nuestro mapa interactivo y planifica tu próxima ruta culinaria.
            </p>
            <div className="mt-8 flex gap-3">
              <Button color="accent" className="bg-copper-500 text-white font-bold rounded-full px-8 shadow-lg shadow-copper-500/20">
                Abrir Mapa Completo
              </Button>
              <Button variant="secondary" className="rounded-full border-zinc-200 dark:border-zinc-800">
                <Navigation className="size-4 mr-2" />
                Cerca de mí
              </Button>
            </div>
          </div>
        </div>

        {/* Map Controls UI Mockup */}
        <div className="absolute bottom-8 right-8 flex flex-col gap-2">
          <button className="rounded-xl bg-white p-3 shadow-lg dark:bg-zinc-900 dark:text-white hover:bg-zinc-50 transition-colors">
            <Maximize2 className="size-5" />
          </button>
        </div>
      </Card>
    </section>
  );
};
