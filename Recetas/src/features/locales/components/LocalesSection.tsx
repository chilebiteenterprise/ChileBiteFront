import React, { useState } from 'react';
import { LocalesHero } from './LocalesHero';
import { LocalesFilter } from './LocalesFilter';
import { LocalesGrid } from './LocalesGrid';
import { LocalesMapPreview } from './LocalesMapPreview';

export const LocalesSection: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [selectedRegion, setSelectedRegion] = useState("Todas");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="bg-bg-page min-h-screen w-full max-w-full overflow-x-clip transition-colors">
      <LocalesHero 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      <LocalesFilter 
        selectedCategory={selectedCategory} 
        setSelectedCategory={setSelectedCategory}
        selectedRegion={selectedRegion}
        setSelectedRegion={setSelectedRegion}
      />
      <LocalesGrid 
        selectedCategory={selectedCategory}
        selectedRegion={selectedRegion}
        searchQuery={searchQuery}
      />
      <LocalesMapPreview 
        selectedRegion={selectedRegion}
        setSelectedRegion={setSelectedRegion}
      />
      
      {/* Banner de Suscripción para Feriantes y Locales de Barrio */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-zinc-950 to-zinc-900 py-20 px-6 text-white border-t border-emerald-900/40">
        <div className="absolute -top-32 -right-32 size-96 rounded-full bg-emerald-600/10 blur-[100px] pointer-events-none" />
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="max-w-2xl text-center lg:text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-wider mb-4 border border-emerald-500/30">
                Para Feriantes y Comerciantes de Barrio
              </span>
              <h2 className="font-serif text-3xl font-bold md:text-5xl mb-4 leading-tight">
                ¿Vendes en ferias o tienes una verdulería?
              </h2>
              <p className="text-zinc-300 text-base md:text-lg mb-6 leading-relaxed">
                Muestra tu puesto en el mapa de ChileBite, publica tus ofertas de la semana y recibe pedidos directos a tu WhatsApp de vecinos de tu comuna.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 text-left">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                  <div className="text-emerald-400 font-bold text-base mb-1">Mapa Activo</div>
                  <div className="text-xs text-zinc-400">Ubicación fija o itinerante según el día de feria.</div>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                  <div className="text-emerald-400 font-bold text-base mb-1">Ofertas del Día</div>
                  <div className="text-xs text-zinc-400">Pizarra de precios actualizada desde tu celular.</div>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                  <div className="text-emerald-400 font-bold text-base mb-1">Pedidos WhatsApp</div>
                  <div className="text-xs text-zinc-400">Tus clientes te escriben y reservan con 1 clic.</div>
                </div>
              </div>
            </div>

            <div className="w-full lg:w-auto shrink-0 bg-white/10 dark:bg-zinc-900/90 border border-emerald-500/30 p-8 rounded-3xl shadow-2xl backdrop-blur-xl text-center max-w-sm">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Plan Feriante Pro</span>
              <div className="mt-2 mb-4">
                <span className="text-4xl font-black text-white">$9.990</span>
                <span className="text-zinc-400 text-sm"> / mes</span>
              </div>
              <p className="text-xs text-zinc-300 mb-6">
                Sin comisiones por ventas. 100% de tus ganancias para ti y tus caseros.
              </p>
              <button 
                onClick={() => window.location.href = '/auth/register'}
                className="w-full rounded-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold py-3.5 px-6 transition-all duration-300 shadow-lg shadow-emerald-500/20 hover:scale-[1.02]"
              >
                Suscribir mi Puesto
              </button>
              <p className="text-[11px] text-zinc-400 mt-3">Prueba gratis los primeros 14 días</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
