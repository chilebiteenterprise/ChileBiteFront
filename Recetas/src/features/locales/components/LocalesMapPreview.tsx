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
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const filteredLocales = locales.filter(locale => {
    return selectedRegion === "Todas" || locale.region === selectedRegion;
  });

  // Center of Santiago roughly
  const center: [number, number] = [-33.4489, -70.6693];

  if (!isMounted) {
    return (
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="h-[500px] bg-zinc-100 dark:bg-zinc-900 rounded-[2rem] animate-pulse flex items-center justify-center text-zinc-500">
          Cargando Mapa...
        </div>
      </section>
    );
  }

  // Dynamically import Leaflet modules only on the client
  let MapContainer: any = null;
  let TileLayer: any = null;
  let Marker: any = null;
  let Popup: any = null;
  let L: any = null;

  if (typeof window !== 'undefined') {
    const reactLeaflet = require('react-leaflet');
    MapContainer = reactLeaflet.MapContainer;
    TileLayer = reactLeaflet.TileLayer;
    Marker = reactLeaflet.Marker;
    Popup = reactLeaflet.Popup;
    L = require('leaflet');
    require('leaflet/dist/leaflet.css');

    // Fix default marker icon issues
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    });
  }

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
                <div className="mb-4 rounded-2xl bg-[#b08968] p-4 shadow-xl shadow-[#b08968]/30">
                  <Map className="size-8 text-white" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-zinc-900 dark:text-white">
                  Navega el Territorio
                </h3>
                <p className="mt-3 text-zinc-600 dark:text-zinc-400">
                  Visualiza todos los locales en nuestro mapa interactivo y planifica tu próxima ruta culinaria.
                </p>
                <div className="mt-8 flex gap-3">
                  <Button 
                    onClick={() => setShowFullMap(true)}
                    className="bg-[#b08968] hover:bg-[#9a7657] text-white font-bold rounded-full px-8 shadow-lg shadow-[#b08968]/20 transition-all duration-300"
                  >
                    Abrir Mapa Completo
                  </Button>
                  <Button 
                    variant="bordered"
                    className="rounded-full border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold"
                  >
                    <Navigation className="size-4 mr-2" />
                    Cerca de mí
                  </Button>
                </div>
              </div>
            </div>

            {/* Map Controls UI Mockup */}
            <div className="absolute bottom-8 right-8 flex flex-col gap-2">
              <button 
                onClick={() => setShowFullMap(true)}
                className="rounded-xl bg-white p-3 shadow-lg dark:bg-zinc-900 dark:text-white hover:bg-zinc-50 transition-colors border border-zinc-200 dark:border-zinc-800"
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
                zoom={10}
                scrollWheelZoom={true}
                className="w-full h-full z-10"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />

                {filteredLocales.map((locale) => (
                  <Marker
                    key={locale.id}
                    position={[locale.lat, locale.lng]}
                  >
                    <Popup className="custom-popup">
                      <div className="p-3 min-w-[220px] bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 rounded-xl">
                        <img 
                          src={locale.image} 
                          alt={locale.name} 
                          className="w-full h-24 object-cover rounded-lg mb-2 shadow-sm"
                        />
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-bold text-sm text-[#b08968]">{locale.name}</h4>
                          <span className="flex items-center gap-0.5 text-xs font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded">
                            <Star className="size-3 fill-amber-500" />
                            {locale.rating}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2 line-clamp-2">{locale.description}</p>
                        <div className="flex items-center justify-between text-[10px] font-bold text-zinc-400">
                          <span>{locale.category}</span>
                          <span>{locale.distance}</span>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
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
                <MapPin size={16} className="text-[#b08968]" />
                {selectedRegion === "Todas" ? "Todas las Regiones" : selectedRegion}
              </h4>
              <p className="text-zinc-500 dark:text-zinc-400 text-[10px] mt-1">
                Mostrando {filteredLocales.length} locales gastronómicos en el mapa.
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
