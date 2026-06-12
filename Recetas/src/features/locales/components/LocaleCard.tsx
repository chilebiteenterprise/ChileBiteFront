import React from 'react';
import { Card, Chip } from '@heroui/react';
import { Star, MapPin } from 'lucide-react';
import type { Locale } from '../data/locales';
import { LocaleBadge } from './LocaleBadge';

interface LocaleCardProps {
  locale: Locale;
}

export const LocaleCard: React.FC<LocaleCardProps> = ({ locale }) => {
  return (
    <Card className="group overflow-hidden rounded-2xl border-none bg-white transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl dark:bg-zinc-900">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={locale.image}
          alt={locale.name}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {locale.isFeatured && <LocaleBadge type="featured" />}
          {locale.isCertified && <LocaleBadge type="certified" />}
        </div>
      </div>

      <Card.Header className="flex flex-col items-start gap-1 p-5">
        <div className="flex w-full items-center justify-between">
          <Card.Title className="font-serif text-xl font-bold text-zinc-900 dark:text-white">
            {locale.name}
          </Card.Title>
          <div className="flex items-center gap-1">
            <Star className="size-4 fill-amber-400 text-amber-400" />
            <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
              {locale.rating}
            </span>
          </div>
        </div>
        
        <Card.Description className="line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
          {locale.description}
        </Card.Description>
      </Card.Header>

      <Card.Content className="px-5 pb-2">
        <div className="flex flex-wrap gap-2">
          {locale.tags.map((tag) => (
            <Chip key={tag} variant="soft" className="bg-zinc-100 dark:bg-zinc-800">
              <Chip.Label className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase font-bold tracking-tight">
                {tag}
              </Chip.Label>
            </Chip>
          ))}
        </div>
      </Card.Content>

      <Card.Footer className="mt-auto border-t border-zinc-100 p-5 dark:border-zinc-800">
        <div className="flex w-full items-center justify-between text-xs text-zinc-500">
          <div className="flex items-center gap-1">
            <MapPin className="size-3" />
            <span>{locale.distance} de tu ubicación</span>
          </div>
          <span className="font-medium text-copper-600 dark:text-copper-400 uppercase tracking-widest">
            {locale.category}
          </span>
        </div>
      </Card.Footer>
    </Card>
  );
};
