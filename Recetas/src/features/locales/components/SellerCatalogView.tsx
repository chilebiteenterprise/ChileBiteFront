import React, { useState, useMemo } from 'react';
import { 
  MapPin, 
  Clock, 
  CreditCard, 
  MessageCircle, 
  ArrowLeft, 
  Search, 
  CheckCircle2, 
  Share2,
  Tag
} from 'lucide-react';
import type { Locale, CatalogProduct } from '../data/locales';

interface SellerCatalogViewProps {
  locale: Locale;
}

export const SellerCatalogView: React.FC<SellerCatalogViewProps> = ({ locale }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [copiedLink, setCopiedLink] = useState(false);

  // Products list fallback
  const allProducts: CatalogProduct[] = useMemo(() => {
    if (locale.catalog && locale.catalog.length > 0) {
      return locale.catalog;
    }
    if (locale.featuredProducts && locale.featuredProducts.length > 0) {
      return locale.featuredProducts.map((p, idx) => ({
        id: `p-${idx}`,
        name: p.name,
        price: p.price,
        unit: p.unit,
        inStock: true,
        category: 'Productos Frescos'
      }));
    }
    return [];
  }, [locale]);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    allProducts.forEach(p => {
      if (p.category) set.add(p.category);
    });
    return ['todos', ...Array.from(set)];
  }, [allProducts]);

  // Filter products by search & category
  const filteredProducts = useMemo(() => {
    return allProducts.filter(p => {
      const matchesCategory = selectedCategory === 'todos' || p.category === selectedCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [allProducts, selectedCategory, searchQuery]);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const getProductWhatsappUrl = (productName: string, price: number, unit: string) => {
    if (!locale.whatsappNumber) return '#';
    const text = `¡Hola ${locale.name}! Vi su catálogo en ChileBite y quisiera consultar disponibilidad del producto: ${productName} ($${price.toLocaleString('es-CL')}/${unit}). ¿Hacen entregas o puedo pasar a retirar?`;
    return `https://wa.me/${locale.whatsappNumber.replace(/\+/g, '')}?text=${encodeURIComponent(text)}`;
  };

  const generalWhatsappUrl = locale.whatsappNumber
    ? `https://wa.me/${locale.whatsappNumber.replace(/\+/g, '')}?text=${encodeURIComponent(`¡Hola ${locale.name}! Encontré su puesto en ChileBite y quisiera consultar por sus productos y disponibilidad.`)}`
    : null;

  const fullAddress = locale.address 
    ? `${locale.address}, ${locale.commune || locale.region}` 
    : `${locale.commune || ''}, ${locale.region}`;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Nav Bar */}
      <div className="flex items-center justify-between">
        <a 
          href="/marketplace"
          className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-600 hover:text-emerald-600 dark:text-zinc-400 dark:hover:text-emerald-400 transition-colors"
        >
          <ArrowLeft className="size-4" />
          <span>Volver al Marketplace</span>
        </a>

        <div className="flex items-center gap-3">
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg mp-button text-xs font-semibold cursor-pointer"
          >
            <Share2 className="size-3.5" />
            <span>{copiedLink ? '¡Enlace copiado!' : 'Compartir puesto'}</span>
          </button>
        </div>
      </div>

      {/* Hero Seller Banner */}
      <div className="relative rounded-3xl overflow-hidden mp-card shadow-xl transition-colors">
        {/* Cover Background Image: limpia sin badges */}
        <div className="relative h-64 sm:h-80 md:h-96 w-full overflow-hidden mp-input">
          <img
            src={locale.image}
            alt={locale.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent dark:from-black/90 dark:via-black/40" />
          
          {/* Content inside banner bottom */}
          <div className="absolute bottom-6 left-6 right-6 text-white max-w-4xl space-y-2">
            <h1 className="font-serif text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white drop-shadow-md">
              {locale.name}
            </h1>
            <p className="text-sm sm:text-base text-zinc-100 dark:text-zinc-200 line-clamp-2 drop-shadow max-w-3xl leading-relaxed">
              {locale.description}
            </p>
          </div>
        </div>

        {/* Vendor Info Bar: Paleta limpia centralizada en global.css */}
        <div className="p-6 sm:p-8 mp-card border-t transition-colors">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Address */}
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 shrink-0">
                <MapPin className="size-5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold mp-text-muted uppercase tracking-wider">
                  Ubicación Física
                </p>
                <p className="text-sm font-bold mp-text-title">
                  {fullAddress}
                </p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                  A {locale.distance} de tu ubicación
                </p>
              </div>
            </div>

            {/* Hours */}
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 shrink-0">
                <Clock className="size-5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold mp-text-muted uppercase tracking-wider">
                  Horario de Atención
                </p>
                <p className="text-sm font-bold mp-text-title">
                  {locale.hours || 'Atención en horario habitual de feria'}
                </p>
              </div>
            </div>

            {/* Direct WhatsApp Action */}
            <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row gap-3 md:justify-end">
              {generalWhatsappUrl ? (
                <a
                  href={generalWhatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 transition-all text-center"
                >
                  <MessageCircle className="size-4" />
                  <span>Hacer pedido por WhatsApp</span>
                </a>
              ) : (
                <div className="text-xs text-zinc-500 dark:text-zinc-400 italic">
                  Contacto directo en puesto presencial
                </div>
              )}
            </div>
          </div>

          {/* Payment Methods and Tags */}
          <div className="mt-6 pt-6 border-t mp-border flex flex-wrap items-center justify-between gap-4">
            {locale.paymentMethods && locale.paymentMethods.length > 0 && (
              <div className="flex items-center gap-2 text-xs mp-text-muted">
                <CreditCard className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="font-bold mp-text-title">Medios de pago:</span>
                <span className="font-medium">{locale.paymentMethods.join(' • ')}</span>
              </div>
            )}

            <div className="flex flex-wrap gap-1.5">
              {locale.tags.map(tag => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-md text-[11px] font-semibold mp-input"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Catalog Section Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b mp-border pb-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Tag className="size-4" />
              <span>Productos Directos del Puesto</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold mp-text-title">
              Catálogo de Productos
            </h2>
            <p className="text-xs sm:text-sm mp-text-muted mt-1">
              Explora los productos disponibles hoy en {locale.name}. Consulta y encarga directamente por WhatsApp.
            </p>
          </div>

          {/* Search bar inside catalog */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 mp-text-subtle" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar en el catálogo..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl mp-input focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
            />
          </div>
        </div>

        {/* Category Pills */}
        {categories.length > 2 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold capitalize transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'mp-chip-inactive'
                }`}
              >
                {cat === 'todos' ? 'Todos los productos' : cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Catalog Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map((product) => {
            const whatsappUrl = getProductWhatsappUrl(product.name, product.price, product.unit);

            return (
              <div
                key={product.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 transition-all duration-300 hover:border-emerald-500/50 hover:shadow-lg dark:hover:border-emerald-500/40 shadow-sm"
              >
                <div className="space-y-3">
                  {/* Top product badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      {product.category || locale.category}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="size-3" />
                      <span>Disponible</span>
                    </span>
                  </div>

                  {/* Product title */}
                  <h3 className="font-serif text-lg font-bold text-zinc-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {product.name}
                  </h3>

                  {/* Product description if any */}
                  {product.description && (
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-2">
                      {product.description}
                    </p>
                  )}
                </div>

                {/* Price and Order Button */}
                <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400 uppercase font-semibold block">
                      Precio
                    </span>
                    <span className="text-lg font-extrabold text-zinc-900 dark:text-emerald-400">
                      ${product.price.toLocaleString('es-CL')}
                      <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400 ml-1">
                        /{product.unit}
                      </span>
                    </span>
                  </div>

                  {locale.whatsappNumber && (
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold transition-all shadow-sm"
                      aria-label={`Consultar por ${product.name} por WhatsApp`}
                    >
                      <MessageCircle className="size-3.5" />
                      <span>Consultar</span>
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 px-4 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/30">
          <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-300">
            No se encontraron productos que coincidan con la búsqueda.
          </p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategory('todos'); }}
            className="mt-3 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
          >
            Ver todos los productos
          </button>
        </div>
      )}
    </div>
  );
};
