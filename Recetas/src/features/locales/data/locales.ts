export interface Locale {
  id: string;
  name: string;
  description: string;
  image: string;
  rating: number;
  distance: string;
  category: "Restaurante" | "Picada" | "Cafetería" | "Viñedo" | "Mercado";
  tags: string[];
  region: string;
  lat: number;
  lng: number;
  isFeatured?: boolean;
  isCertified?: boolean;
}

export const locales: Locale[] = [
  {
    id: "1",
    name: "Boragó",
    description: "Alta cocina endémica que explora la biodiversidad del territorio chileno.",
    image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=800",
    rating: 4.9,
    distance: "2.4 km",
    category: "Restaurante",
    tags: ["Alta Cocina", "Endémico", "Sustentable"],
    region: "Metropolitana de Santiago",
    lat: -33.3986,
    lng: -70.5739,
    isFeatured: true,
    isCertified: true,
  },
  {
    id: "2",
    name: "La Piojera",
    description: "Tradición pura en el corazón de Santiago. Cuna del Terremoto.",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800",
    rating: 4.5,
    distance: "0.8 km",
    category: "Picada",
    tags: ["Tradicional", "Popular", "Cultura"],
    region: "Metropolitana de Santiago",
    lat: -33.4328,
    lng: -70.6521,
    isCertified: true,
  },
  {
    id: "3",
    name: "Viña Santa Rita",
    description: "Un viaje por la historia del vino chileno en un entorno patrimonial único.",
    image: "https://images.unsplash.com/photo-1516594915697-87eb3b1c14ea?auto=format&fit=crop&q=80&w=800",
    rating: 4.8,
    distance: "35 km",
    category: "Viñedo",
    tags: ["Patrimonio", "Vinos", "Vistas"],
    region: "Metropolitana de Santiago",
    lat: -33.6333,
    lng: -70.6167,
    isFeatured: true,
  },
  {
    id: "4",
    name: "Mercado Central",
    description: "El epicentro de los sabores del mar chileno. Pescados y mariscos frescos.",
    image: "https://images.unsplash.com/photo-1534604973900-c41ab4c3c3c0?auto=format&fit=crop&q=80&w=800",
    rating: 4.6,
    distance: "1.2 km",
    category: "Mercado",
    tags: ["Mariscos", "Turismo", "Santiago"],
    region: "Metropolitana de Santiago",
    lat: -33.4332,
    lng: -70.6514,
  },
  {
    id: "5",
    name: "Café Turing",
    description: "Café de especialidad con granos seleccionados y tostado local.",
    image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=800",
    rating: 4.7,
    distance: "0.5 km",
    category: "Cafetería",
    tags: ["Especialidad", "Moderno", "Tranquilo"],
    region: "Metropolitana de Santiago",
    lat: -33.4372,
    lng: -70.6480,
  }
];
