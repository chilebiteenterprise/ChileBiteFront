import React, { useEffect, useState } from 'react';
import { Card, Button } from '@heroui/react';
import { Map, Maximize2, Navigation, X, MapPin, Star } from 'lucide-react';
import { locales } from '../data/locales';

interface LocalesMapPreviewProps {
  selectedRegion: string;
  setSelectedRegion: (region: string) => void;
}

export const LocalesMapPreview: React.FC<LocalesMapPreviewProps> = ({
  selectedRegion,
  setSelectedRegion
}) => {
  const [showFullMap, setShowFullMap] = useState(false);
  const [mapModules, setMapModules] = useState<{
    L: any;
    MapContainer: any;
    TileLayer: any;
    Marker: any;
    Popup: any;
  } | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function loadLeaflet() {
      try {
        const [leafletMod, reactLeafletMod] = await Promise.all([
          import('leaflet'),
          import('react-leaflet'),
          import('leaflet/dist/leaflet.css')
        ]);

        const L = (leafletMod && (leafletMod as any).default) ? (leafletMod as any).default : leafletMod;

        // Fix default marker icon issues
        if (L?.Icon?.Default?.prototype) {
          delete (L.Icon.Default.prototype as any)._getIconUrl;
          L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
            iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
          });
        }

        if (!isCancelled) {
          setMapModules({
            L,
            MapContainer: reactLeafletMod.MapContainer,
            TileLayer: reactLeafletMod.TileLayer,
            Marker: reactLeafletMod.Marker,
            Popup: reactLeafletMod.Popup
          });
        }
      } catch (err) {
        console.error("Error al cargar Leaflet:", err);
      }
    }

    loadLeaflet();

    return () => {
      isCancelled = true;
    };
  }, []);

  const filteredLocales = locales.filter(locale => {
    if (selectedRegion === "Todas") return true;
    const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return (
      locale.region === selectedRegion ||
      norm(locale.region).includes(norm(selectedRegion)) ||
      norm(selectedRegion).includes(norm(locale.region))
    );
  });

  // Center of Santiago roughly
  const center: [number, number] = [-33.4489, -70.6693];

  // Create custom marker icons
  const createCustomIcon = (locale: any) => {
    const L = mapModules?.L;
    if (!L) return undefined;
    
    const isPro = locale.isProSubscription;
    const isVeggie = locale.category === "Verdulería" || locale.category === "Feria Libre";
    
    const pinColor = isPro 
      ? 'bg-emerald-600 border-2 border-white shadow-emerald-500/50' 
      : isVeggie
        ? 'bg-green-700 border-2 border-white'
        : 'bg-[#b08968] border-2 border-white';

    const pulseEffect = isPro 
      ? '<span class="absolute -inset-1 rounded-full bg-emerald-400 opacity-75 animate-ping"></span>' 
      : '';

    return L.divIcon({
      className: 'relative flex items-center justify-center',
      html: `
        <div class="relative flex items-center justify-center cursor-pointer">
          ${pulseEffect}
          <div class="relative w-8 h-8 rounded-full ${pinColor} shadow-lg flex items-center justify-center transform hover:scale-110 transition-transform">
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16],
    });
  };

  const { MapContainer, TileLayer, Marker, Popup } = mapModules || {};

  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <Card className="relative h-[600px] overflow-hidden rounded-[2rem] border-none shadow-2xl bg-zinc-100 dark:bg-zinc-900">
        {!showFullMap ? (
          <>
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
              <div className="flex flex-col items-center text-center p-8 bg-white/95 dark:bg-zinc-950/95 rounded-[2rem] shadow-2xl border border-white/20 max-w-md mx-4">
                <div className="mb-4 rounded-2xl bg-emerald-600 p-4 shadow-xl shadow-emerald-600/30">
                  <Map className="size-8 text-white" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-zinc-900 dark:text-white">
                  Mapa de Ferias y Comercios Locales
                </h3>
                <p className="mt-3 text-zinc-600 dark:text-zinc-400 text-sm">
                  Encuentra puestos de ferias libres, verdulerías con productos frescos del día y locales destacados cerca de ti.
                </p>
                <div className="mt-8 flex gap-3">
                  <Button 
                    onClick={() => setShowFullMap(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-full px-8 shadow-lg shadow-emerald-600/20 transition-all duration-300"
                  >
                    Abrir Mapa Completo
                  </Button>
                </div>
              </div>
            </div>

            {/* Map Controls UI Mockup */}
            <div className="absolute bottom-8 right-8 flex flex-col gap-2">
              <button 
                onClick={() => setShowFullMap(true)}
                className="rounded-xl bg-white p-3 shadow-lg dark:bg-zinc-900 dark:text-white hover:bg-zinc-50 transition-colors border border-zinc-200 dark:border-zinc-800"
                aria-label="Maximizar mapa"
              >
                <Maximize2 className="size-5" />
              </button>
            </div>
          </>
        ) : (
          <div className="relative w-full h-full">
            {MapContainer && (
              <MapContainer
                center={center}
                zoom={11}
                scrollWheelZoom={true}
                className="w-full h-full z-10"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />

                {filteredLocales.map((locale) => {
                  const customIcon = createCustomIcon(locale);
                  const whatsappUrl = locale.whatsappNumber 
                    ? `https://wa.me/${locale.whatsappNumber.replace(/\+/g, '')}?text=${encodeURIComponent(`¡Hola ${locale.name}! Los encontré en el mapa de ChileBite y quisiera consultar por sus productos.`)}`
                    : null;

                  return (
                    <Marker
                      key={locale.id}
                      position={[locale.lat, locale.lng]}
                      icon={customIcon}
                    >
                      <Popup className="custom-popup">
                        <div className="p-3.5 min-w-[260px] max-w-[290px] bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 rounded-2xl shadow-xl border border-zinc-100 dark:border-zinc-800">
                          <div className="relative">
                            <img 
                              src={locale.image} 
                              alt={locale.name} 
                              className="w-full h-28 object-cover rounded-xl mb-2 shadow-sm"
                            />
                            {locale.isProSubscription && (
                              <span className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full shadow-md">
                                Comercio Pro
                              </span>
                            )}
                            {locale.stallNumber && (
                              <span className="absolute top-2 right-2 bg-black/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                {locale.stallNumber}
                              </span>
                            )}
                          </div>

                          <div className="flex items-start justify-between gap-1 mb-1">
                            <h4 className="font-bold text-sm text-zinc-900 dark:text-white leading-tight">
                              {locale.name}
                            </h4>
                            <span className="flex items-center gap-0.5 text-xs font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded shrink-0">
                              <Star className="size-3 fill-amber-500" />
                              {locale.rating}
                            </span>
                          </div>

                          {locale.commune && (
                            <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 mb-1">
                              {locale.commune}
                            </p>
                          )}

                          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2 line-clamp-2">
                            {locale.description}
                          </p>

                          {/* Featured products preview */}
                          {locale.featuredProducts && locale.featuredProducts.length > 0 && (
                            <div className="mb-3 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50">
                              <span className="text-[10px] font-black uppercase text-emerald-800 dark:text-emerald-300 block mb-1">
                                Productos destacados:
                              </span>
                              <div className="space-y-1">
                                {locale.featuredProducts.slice(0, 2).map((p, i) => (
                                  <div key={i} className="text-[11px] flex justify-between items-center text-zinc-700 dark:text-zinc-300">
                                    <span className="truncate pr-1">{p.name}</span>
                                    <span className="font-bold text-emerald-700 dark:text-emerald-400 shrink-0">
                                      ${p.price.toLocaleString('es-CL')}/{p.unit}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="flex items-center gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                            {whatsappUrl && (
                              <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 text-center py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-sm"
                              >
                                Contactar WhatsApp
                              </a>
                            )}
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${locale.lat},${locale.lng}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="py-1.5 px-2.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-medium transition-colors"
                              title="Cómo llegar"
                            >
                              📍 Ruta
                            </a>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
            )}

            {/* Floating Close Button */}
            <button
              onClick={() => setShowFullMap(false)}
              className="absolute top-6 right-6 z-20 rounded-full bg-white dark:bg-zinc-900 p-3 shadow-xl hover:scale-105 transition-all text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 focus:outline-none"
              aria-label="Cerrar mapa"
            >
              <X className="size-5" />
            </button>

            {/* Floating Info Overlay */}
            <div className="absolute top-6 left-6 z-20 bg-white/95 dark:bg-zinc-950/95 border border-zinc-200 dark:border-zinc-800/80 p-4 rounded-2xl shadow-xl max-w-xs pointer-events-none">
              <h4 className="text-zinc-900 dark:text-white font-bold text-sm flex items-center gap-2">
                <MapPin size={16} className="text-emerald-600" />
                {selectedRegion === "Todas" ? "Todas las Regiones" : selectedRegion}
              </h4>
              <p className="text-zinc-500 dark:text-zinc-400 text-[11px] mt-1">
                Mostrando {filteredLocales.length} puntos. Los marcadores con anillo verde son <strong>Comercios Pro</strong> con catálogo activo.
              </p>
            </div>
          </div>
        )}
      </Card>

      <style dangerouslySetInnerHTML={{__html: `
        .leaflet-container {
          background: #f4f4f5 !important;
        }
        .dark .leaflet-container {
          background: #09090b !important;
        }
        .custom-popup .leaflet-popup-content-wrapper {
          background: transparent;
          box-shadow: none;
          padding: 0;
        }
        .custom-popup .leaflet-popup-tip-container {
          display: none;
        }
        .custom-popup .leaflet-popup-content {
          margin: 0;
          padding: 0;
        }
      `}} />
    </section>
  );
};
