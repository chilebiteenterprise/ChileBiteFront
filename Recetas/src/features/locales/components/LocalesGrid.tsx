import React from 'react';
import { LocaleCard } from './LocaleCard';
import { locales } from '../data/locales';

export const LocalesGrid: React.FC = () => {
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
          Mostrando {locales.length} resultados
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {locales.map((locale) => (
          <LocaleCard key={locale.id} locale={locale} />
        ))}
      </div>
    </section>
  );
};
