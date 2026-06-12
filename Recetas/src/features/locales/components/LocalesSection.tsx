import React from 'react';
import { LocalesHero } from './LocalesHero';
import { LocalesFilter } from './LocalesFilter';
import { LocalesGrid } from './LocalesGrid';
import { LocalesMapPreview } from './LocalesMapPreview';

export const LocalesSection: React.FC = () => {
  return (
    <div className="bg-zinc-50 dark:bg-zinc-950 min-h-screen">
      <LocalesHero />
      <LocalesFilter />
      <LocalesGrid />
      <LocalesMapPreview />
      
      {/* Visual Footer/CTA for businesses */}
      <section className="bg-zinc-900 py-20 px-6 text-center text-white">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-serif text-3xl font-bold md:text-5xl mb-6">
            ¿Eres dueño de un local gastronómico?
          </h2>
          <p className="text-zinc-400 text-lg mb-10">
            Únete a la red más grande de sabores chilenos y conecta con miles de foodies.
            Registra tu local de forma gratuita y destaca tu propuesta.
          </p>
          <button className="rounded-full bg-white px-10 py-4 text-zinc-950 font-bold hover:scale-105 transition-transform shadow-xl shadow-white/10">
            Registra tu Local Hoy
          </button>
        </div>
      </section>
    </div>
  );
};
