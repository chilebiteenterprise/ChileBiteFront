import React from 'react';
import { Card, Chip } from '@heroui/react';
import { Star, MapPin, MessageCircle, Tag, Store, Calendar } from 'lucide-react';
import type { Locale } from '../data/locales';
import { LocaleBadge } from './LocaleBadge';

interface LocaleCardProps {
  locale: Locale;
}

export const LocaleCard: React.FC<LocaleCardProps> = ({ locale }) => {
  const whatsappUrl = locale.whatsappNumber 
    ? `https://wa.me/${locale.whatsappNumber.replace(/\+/g, '')}?text=${encodeURIComponent(`¡Hola ${locale.name}! Los encontré en ChileBite y me gustaría consultar por sus productos y disponibilidad.`)}`
    : null;

  return (
    <Card className={`group overflow-hidden rounded-2xl border bg-white transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl dark:bg-zinc-900 ${
      locale.isProSubscription 
        ? 'border-emerald-500/30 hover:border-emerald-500/60 shadow-emerald-500/5' 
        : 'border-zinc-200/60 dark:border-zinc-800'
    }`}>
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={locale.image}
          alt={locale.name}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {locale.isProSubscription && <LocaleBadge type="pro" />}
          {locale.isFeatured && <LocaleBadge type="featured" />}
          {locale.isCertified && <LocaleBadge type="certified" />}
        </div>

        {/* Puesto / Stall chip if available */}
        {locale.stallNumber && (
          <div className="absolute top-4 right-4 bg-black/75 backdrop-blur-md px-3 py-1 rounded-full text-white text-[11px] font-bold flex items-center gap-1.5 border border-white/20">
            <Store className="size-3 text-emerald-400" />
            <span>{locale.stallNumber}</span>
          </div>
        )}
      </div>

      <Card.Header className="flex flex-col items-start gap-1 p-5">
        <div className="flex w-full items-center justify-between">
          <Card.Title className="font-serif text-xl font-bold text-zinc-900 dark:text-white line-clamp-1">
            {locale.name}
          </Card.Title>
          <div className="flex items-center gap-1 shrink-0 ml-2">
            <Star className="size-4 fill-amber-400 text-amber-400" />
            <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
              {locale.rating}
            </span>
          </div>
        </div>

        {locale.commune && (
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            {locale.commune}, {locale.region}
          </span>
        )}
        
        <Card.Description className="line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400 mt-1">
          {locale.description}
        </Card.Description>
      </Card.Header>

      {/* Featured Fresh Products / Offers for small shops & fairs */}
      {locale.featuredProducts && locale.featuredProducts.length > 0 && (
        <div className="px-5 py-2.5 bg-emerald-50/50 dark:bg-emerald-950/20 border-y border-emerald-100/60 dark:border-emerald-900/30">
          <div className="flex items-center gap-1.5 mb-2 text-xs font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
            <Tag className="size-3 text-emerald-600 dark:text-emerald-400" />
            <span>Ofertas y Precios del Día:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {locale.featuredProducts.map((prod, idx) => (
              <span 
                key={idx} 
                className={`text-[11px] font-medium px-2 py-0.5 rounded-md flex items-center gap-1 ${
                  prod.isOffer 
                    ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-900 dark:text-emerald-200 font-bold border border-emerald-300 dark:border-emerald-700' 
                    : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700'
                }`}
              >
                {prod.name}: <strong className="text-emerald-700 dark:text-emerald-300">${prod.price.toLocaleString('es-CL')}/{prod.unit}</strong>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Itinerant schedules badge if present */}
      {locale.isItinerant && locale.itinerantSchedules && (
        <div className="px-5 py-2 text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
          <Calendar className="size-3 text-[#b08968]" />
          <span>Feria itinerante: {locale.itinerantSchedules.map(s => s.day).join(', ')}</span>
        </div>
      )}

      <Card.Content className="px-5 py-3">
        <div className="flex flex-wrap gap-1.5">
          {locale.tags.map((tag) => (
            <Chip key={tag} variant="soft" className="bg-zinc-100 dark:bg-zinc-800">
              <Chip.Label className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase font-bold tracking-tight">
                {tag}
              </Chip.Label>
            </Chip>
          ))}
        </div>
      </Card.Content>

      <Card.Footer className="mt-auto border-t border-zinc-100 p-5 dark:border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-zinc-500">
          <MapPin className="size-3.5 text-zinc-400" />
          <span>{locale.distance}</span>
        </div>

        <div className="flex items-center gap-2">
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Contactar por WhatsApp a ${locale.name}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-sm"
            >
              <MessageCircle className="size-3.5 fill-current" />
              <span>Pedir</span>
            </a>
          )}
          <span className="font-semibold text-xs text-copper-600 dark:text-copper-400 uppercase tracking-wider">
            {locale.category}
          </span>
        </div>
      </Card.Footer>
    </Card>
  );
};
