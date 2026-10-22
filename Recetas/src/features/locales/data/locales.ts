export type LocaleCategory = 
  | "Verdulería"
  | "Pescadería"
  | "Tostadurías y Frutos Secos"
  | "Quesería y Lácteos";

export interface FreshProduct {
  name: string;
  price: number;
  unit: string; // "kg", "atado", "malla", "unidad", "pieza"
  isOffer?: boolean;
}

export interface DaySchedule {
  day: "Lunes" | "Martes" | "Miércoles" | "Jueves" | "Viernes" | "Sábado" | "Domingo";
  address: string;
  hours: string;
}

export interface Locale {
  id: string;
  name: string;
  description: string;
  image: string;
  rating: number;
  distance: string;
  category: LocaleCategory;
  tags: string[];
  region: string;
  commune?: string;
  lat: number;
  lng: number;
  isFeatured?: boolean;
  isCertified?: boolean;
  isProSubscription?: boolean;
  whatsappNumber?: string;
  stallNumber?: string; // Ej: "Puesto 142 - Galpón Chacareros"
  featuredProducts?: FreshProduct[];
}

export const locales: Locale[] = [
  // ================= 🥑 VERDULERÍAS =================
  {
    id: "v-vega",
    name: "La Vega Central - Verdulería Don Tito",
    description: "Tradición campesina en el corazón de La Vega. Las mejores paltas Hass de Quillota, tomates limachinos y choclos recién cosechados.",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800",
    rating: 4.9,
    distance: "1.2 km",
    category: "Verdulería",
    tags: ["La Vega", "Paltas Quillota", "Tomates Limachinos", "Huevos de Campo"],
    region: "Metropolitana de Santiago",
    commune: "Recoleta",
    lat: -33.4290,
    lng: -70.6515,
    isFeatured: true,
    isProSubscription: true,
    stallNumber: "Sector Chacareros - Puesto 142",
    whatsappNumber: "+56991234567",
    featuredProducts: [
      { name: "Palta Hass Selección Quillota", price: 3490, unit: "kg", isOffer: true },
      { name: "Tomate Limachino Tradicional", price: 1490, unit: "kg" },
      { name: "Huevos de Campo Azules (Bandeja 30)", price: 6990, unit: "bandeja", isOffer: true },
      { name: "Choclo Pastelero Dulce", price: 500, unit: "unidad" }
    ]
  },
  {
    id: "v-valledor",
    name: "Lo Valledor - El Casero de Oro",
    description: "Venta directa de productores de la zona central. Fruta fresca de temporada, melones de Paine, cítricos y hortalizas seleccionadas.",
    image: "https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&q=80&w=800",
    rating: 4.8,
    distance: "3.5 km",
    category: "Verdulería",
    tags: ["Lo Valledor", "Por Mayor y Menor", "Frutas de Paine"],
    region: "Metropolitana de Santiago",
    commune: "Pedro Aguirre Cerda",
    lat: -33.4840,
    lng: -70.6780,
    isFeatured: true,
    isProSubscription: true,
    stallNumber: "Patio Las Hortalizas - Local 58",
    whatsappNumber: "+56987654321",
    featuredProducts: [
      { name: "Melón Calameño de Paine", price: 1800, unit: "unidad", isOffer: true },
      { name: "Frutillas de San Pedro", price: 2190, unit: "kg" },
      { name: "Cebolla Morada Selección", price: 990, unit: "kg" }
    ]
  },
  {
    id: "v-chacra",
    name: "Verdulería La Chacra de Providencia",
    description: "Verdulería de barrio con abastecimiento diario. Hortalizas hidropónicas, hierbas aromáticas y selección de frutas premium listas para comer.",
    image: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&q=80&w=800",
    rating: 4.7,
    distance: "0.8 km",
    category: "Verdulería",
    tags: ["Providencia", "Hidropónicos", "Frutas Premium"],
    region: "Metropolitana de Santiago",
    commune: "Providencia",
    lat: -33.4285,
    lng: -70.6125,
    isProSubscription: true,
    whatsappNumber: "+56976543219",
    featuredProducts: [
      { name: "Albahaca fresca hidropónica", price: 990, unit: "atado" },
      { name: "Palta Hass primera", price: 3890, unit: "kg", isOffer: true },
      { name: "Arándanos del Sur", price: 1500, unit: "caja" }
    ]
  },

  // ================= 🐟 PESCADERÍAS =================
  {
    id: "p-terminal",
    name: "Terminal Pesquero Metropolitano - Don Juan",
    description: "Llegada directa de caletas de la costa chilena todas las madrugadas. Pescados enteros o fileteados al momento y mariscos vivos.",
    image: "https://images.unsplash.com/photo-1534604973900-c41ab4c3c3c0?auto=format&fit=crop&q=80&w=800",
    rating: 4.9,
    distance: "5.1 km",
    category: "Pescadería",
    tags: ["Terminal Pesquero", "Reineta Fresca", "Congrio", "Mariscos Vivos"],
    region: "Metropolitana de Santiago",
    commune: "Lo Espejo",
    lat: -33.5180,
    lng: -70.6850,
    isFeatured: true,
    isProSubscription: true,
    stallNumber: "Sector Minorista - Pasillo Central 12",
    whatsappNumber: "+56994443322",
    featuredProducts: [
      { name: "Filete de Reineta del día", price: 5990, unit: "kg", isOffer: true },
      { name: "Congrio Colorado fresco", price: 8990, unit: "kg" },
      { name: "Choritos de Chiloé limpios", price: 1990, unit: "kg", isOffer: true },
      { name: "Machas en su concha", price: 4990, unit: "kg" }
    ]
  },
  {
    id: "p-portales",
    name: "Pescadería Caleta Portales",
    description: "El auténtico sabor del puerto directo a tu mesa. Pescados frescos capturados por pescadores artesanales de la V Región.",
    image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=800",
    rating: 4.8,
    distance: "1.9 km",
    category: "Pescadería",
    tags: ["Caleta Portales", "Artesanal", "Pescado del Puerto"],
    region: "Valparaíso",
    commune: "Valparaíso",
    lat: -33.0370,
    lng: -71.5930,
    isProSubscription: true,
    stallNumber: "Box de Venta 7",
    whatsappNumber: "+56981112233",
    featuredProducts: [
      { name: "Merluza Austral fresca", price: 4500, unit: "kg", isOffer: true },
      { name: "Sierra entera fresca", price: 3800, unit: "unidad" },
      { name: "Camarón nacional pelado", price: 8900, unit: "kg" }
    ]
  },

  // ================= 🥜 TOSTADURÍAS Y FRUTOS SECOS =================
  {
    id: "t-puertorico",
    name: "Tostaduría Puerto Rico",
    description: "Una leyenda del grano y el fruto seco en Chile desde 1937. Tostado diario a la vista, café en grano molido al momento y frutos secos selectos.",
    image: "https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&q=80&w=800",
    rating: 4.9,
    distance: "1.1 km",
    category: "Tostadurías y Frutos Secos",
    tags: ["Tostaduría Puerto Rico", "Tostado Propio", "Frutos Secos", "Legumbres"],
    region: "Metropolitana de Santiago",
    commune: "Santiago Centro",
    lat: -33.4380,
    lng: -70.6550,
    isFeatured: true,
    isProSubscription: true,
    stallNumber: "Local Tradicional - San Pablo",
    whatsappNumber: "+56972223344",
    featuredProducts: [
      { name: "Nueces Mariposa Extra Claras", price: 7990, unit: "kg", isOffer: true },
      { name: "Almendras Non Pareil tostadas", price: 8900, unit: "kg" },
      { name: "Porotos Tórtola Chilenos", price: 2490, unit: "kg" },
      { name: "Merkén Ahumado Mapuche", price: 1600, unit: "100g" }
    ]
  },
  {
    id: "t-talca",
    name: "Tostaduría Talca",
    description: "Especialistas en semillas, harinas rústicas (tostada, avena, linaza), frutos secos nacionales e importados y condimentos por mayor y detalle.",
    image: "https://images.unsplash.com/photo-1536510233921-8e5043fce771?auto=format&fit=crop&q=80&w=800",
    rating: 4.7,
    distance: "1.4 km",
    category: "Tostadurías y Frutos Secos",
    tags: ["Tostaduría Talca", "Harina Tostada", "A Granel"],
    region: "Metropolitana de Santiago",
    commune: "Recoleta",
    lat: -33.4305,
    lng: -70.6490,
    isProSubscription: true,
    whatsappNumber: "+56965554433",
    featuredProducts: [
      { name: "Maní tostado con sal marina", price: 2990, unit: "kg", isOffer: true },
      { name: "Harina Tostada de Trigo", price: 1890, unit: "kg" },
      { name: "Castañas de Cajú naturales", price: 9500, unit: "kg" }
    ]
  },

  // ================= 🧀 QUESERÍAS Y LÁCTEOS =================
  {
    id: "q-franklin",
    name: "Matadero Franklin - Quesería Don Chanco",
    description: "Auténticos quesos de fundo de la zona centro-sur. Quesos madurados de Chanco, mantecoso con orégano y mantequilla de campo artesanal.",
    image: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&q=80&w=800",
    rating: 4.9,
    distance: "2.8 km",
    category: "Quesería y Lácteos",
    tags: ["Matadero Franklin", "Queso Chanco", "Artesanal", "Campo Chileno"],
    region: "Metropolitana de Santiago",
    commune: "Santiago Centro",
    lat: -33.4735,
    lng: -70.6480,
    isFeatured: true,
    isProSubscription: true,
    stallNumber: "Galpón Matadero - Local 104",
    whatsappNumber: "+56983332211",
    featuredProducts: [
      { name: "Queso Chanco Tradicional 1kg", price: 8490, unit: "pieza", isOffer: true },
      { name: "Mantecoso de Campo laminado", price: 4600, unit: "500g" },
      { name: "Manjar de Leche al Cobre", price: 3490, unit: "pote", isOffer: true },
      { name: "Mantequilla artesanal de campo", price: 3200, unit: "pan 250g" }
    ]
  },
  {
    id: "q-colchagua",
    name: "Lácteos Las Parcelas de Colchagua",
    description: "Distribución directa de granjas del valle de Colchagua. Quesillos frescos sin sal, quesos de cabra artesanales del Valle del Elqui y yogurt natural.",
    image: "https://images.unsplash.com/photo-1559561853-08451507cbe7?auto=format&fit=crop&q=80&w=800",
    rating: 4.8,
    distance: "1.7 km",
    category: "Quesería y Lácteos",
    tags: ["Colchagua", "Quesillo Fresco", "Queso de Cabra"],
    region: "Metropolitana de Santiago",
    commune: "Ñuñoa",
    lat: -33.4540,
    lng: -70.6010,
    isProSubscription: true,
    whatsappNumber: "+56974445566",
    featuredProducts: [
      { name: "Quesillo fresco campesino", price: 2990, unit: "unidad", isOffer: true },
      { name: "Queso de Cabra maduro ahumado", price: 6990, unit: "pieza 400g" }
    ]
  }
];
