import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Video, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Fix for default marker icons in Leaflet + React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom Marker Icon with Lucide
const createCustomIcon = (color = "#b08968") => L.divIcon({
  html: `<div style="color: ${color}; filter: drop-shadow(0 0 8px rgba(176,137,104,0.5));">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </div>`,
  className: 'custom-div-icon',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

export default function ChileMap({ posts = [] }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div className="h-[500px] bg-gray-900 rounded-3xl animate-pulse flex items-center justify-center text-gray-500">Cargando Mapa...</div>;

  // Center of Chile roughly
  const center = [-33.4489, -70.6693]; 
  
  // Sort posts by date for the route line
  const sortedPosts = [...posts].sort((a, b) => new Date(a.data.pubDate) - new Date(b.data.pubDate));
  const routeCoordinates = sortedPosts.map(p => [p.data.location.lat, p.data.location.lng]);

  return (
    <div className="relative w-full h-[600px] rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl">
      <MapContainer 
        center={center} 
        zoom={5} 
        scrollWheelZoom={false}
        className="w-full h-full z-10"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        {/* Route Line */}
        {routeCoordinates.length > 1 && (
          <Polyline 
            positions={routeCoordinates} 
            pathOptions={{ 
              color: '#b08968', 
              weight: 3, 
              dashArray: '10, 10',
              opacity: 0.6 
            }} 
          />
        )}

        {/* Markers */}
        {posts.map((post, idx) => (
          <Marker 
            key={idx} 
            position={[post.data.location.lat, post.data.location.lng]}
            icon={createCustomIcon()}
          >
            <Popup className="custom-popup">
              <div className="p-2 min-w-[200px] bg-gray-900 text-white rounded-xl">
                {post.data.heroImage && (
                  <img 
                    src={post.data.heroImage} 
                    alt={post.data.title} 
                    className="w-full h-24 object-cover rounded-lg mb-2"
                  />
                )}
                <h3 className="font-bold text-sm mb-1 text-[#b08968]">{post.data.title}</h3>
                <p className="text-xs text-gray-400 mb-3">{post.data.location.label}</p>
                <a 
                  href={`/blog/${post.slug}`}
                  className="flex items-center justify-center space-x-2 w-full py-2 bg-[#b08968] text-white text-xs font-bold rounded-lg hover:bg-[#9a7657] transition-colors"
                >
                  <Video size={14} />
                  <span>Ver Parada</span>
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Floating Info Overlay */}
      <div className="absolute top-4 right-4 z-20 bg-black/40 backdrop-blur-md border border-white/10 p-4 rounded-2xl pointer-events-none">
        <h4 className="text-white font-bold text-sm flex items-center gap-2">
          <MapPin size={16} className="text-[#b08968]" />
          Ruta del Sabor
        </h4>
        <p className="text-gray-400 text-[10px] mt-1">Explora cada parada de nuestro viaje gastronómico.</p>
      </div>
      
      <style>{`
        .leaflet-container {
          background: #111827 !important;
        }
        .custom-popup .leaflet-popup-content-wrapper {
          background: #111827;
          color: white;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 1rem;
          padding: 0;
        }
        .custom-popup .leaflet-popup-tip {
          background: #111827;
        }
        .custom-popup .leaflet-popup-content {
          margin: 0;
          padding: 8px;
        }
      `}</style>
    </div>
  );
}
