export type LocaleCategory = 
  | "Verdulería"
  | "Pescadería"
  | "Tostadurías y Frutos Secos"
  | "Quesería y Lácteos";

export interface FreshProduct {
  name: string;
  price: number;
  unit: string; // "kg", "atado", "unidad", "docena", "4 unidades", "4 cabezas"
}

export interface DaySchedule {
  day: "Lunes" | "Martes" | "Miércoles" | "Jueves" | "Viernes" | "Sábado" | "Domingo";
  address: string;
  hours: string;
}

export interface CatalogProduct {
  id: string;
  name: string;
  category?: string;
  price: number;
  unit: string; // "kg", "atado", "unidad", "docena", "4 unidades", "4 cabezas"
  inStock: boolean;
  description?: string;
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
  address?: string;
  hours?: string;
  paymentMethods?: string[];
  lat: number;
  lng: number;
  isFeatured?: boolean;
  isCertified?: boolean;
  isProSubscription?: boolean;
  whatsappNumber?: string;
  stallNumber?: string;
  featuredProducts?: FreshProduct[];
  catalog?: CatalogProduct[];
  isItinerant?: boolean;
  itinerantSchedules?: DaySchedule[];
}

export const locales: Locale[] = [
  // ================= VERDULERÍAS =================
  {
    id: "v-vega",
    name: "La Vega Central - Verdulería Don Tito",
    description: "Tradición campesina en La Vega Central. Las mejores paltas, tomates frescos y choclos recién cosechados directamente de chacras de la zona central.",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800",
    rating: 4.9,
    distance: "1.2 km",
    category: "Verdulería",
    tags: ["Paltas", "Tomates", "Huevos", "Choclo"],
    region: "Metropolitana de Santiago",
    commune: "Recoleta",
    address: "Dávila Baeza 700",
    hours: "Lunes a Domingo: 06:00 - 16:30 hrs",
    paymentMethods: ["Efectivo", "Redcompra / Débito", "Transferencia bancaria"],
    lat: -33.4290,
    lng: -70.6515,
    isFeatured: true,
    isProSubscription: true,
    stallNumber: "Sector Chacareros - Puesto 142",
    whatsappNumber: "+56991234567",
    featuredProducts: [
      { name: "Palta", price: 3490, unit: "kg" },
      { name: "Tomate", price: 1490, unit: "kg" },
      { name: "Huevos", price: 2990, unit: "docena" },
      { name: "Choclo", price: 500, unit: "unidad" }
    ],
    catalog: [
      { id: "c1", name: "Palta Hass Primera", category: "Verduras", price: 3490, unit: "kg", inStock: true, description: "Cremosa, punto óptimo para consumo inmediato o maduración." },
      { id: "c2", name: "Tomate Selección", category: "Verduras", price: 1490, unit: "kg", inStock: true, description: "Fresco de huerto, ideal para ensaladas y pebre." },
      { id: "c3", name: "Huevos de Campo Extra", category: "Huevos y Aves", price: 2990, unit: "docena", inStock: true, description: "Huevos frescos de gallina libre, yema naranja intensa." },
      { id: "c4", name: "Choclo Choclero", category: "Verduras", price: 500, unit: "unidad", inStock: true, description: "Dientes tiernos para pastel de choclo, humitas o cocidos." },
      { id: "c5", name: "Limón Sutil", category: "Cítricos", price: 1290, unit: "kg", inStock: true, description: "Jugo abundante con gran aroma para aderezos." },
      { id: "c6", name: "Cebolla Morada", category: "Verduras", price: 1100, unit: "kg", inStock: true, description: "Suave y crujiente, perfecta para ceviches y ensaladas." },
      { id: "c7", name: "Cilantro Fresco", category: "Hierbas", price: 600, unit: "atado", inStock: true, description: "Aroma fresco de huerto recién cortado." },
      { id: "c8", name: "Zapallo Camote", category: "Verduras", price: 1200, unit: "kg", inStock: true, description: "Corte fresco diario para cazuelas o sopaipillas." }
    ]
  },
  {
    id: "v-valledor",
    name: "Lo Valledor - El Casero de Oro",
    description: "Venta directa de productores de la zona central. Fruta fresca de temporada, melones, frutillas, manzanas y ajos chilenos.",
    image: "https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&q=80&w=800",
    rating: 4.8,
    distance: "3.5 km",
    category: "Verdulería",
    tags: ["Melón", "Frutillas", "Cebolla", "Manzanas", "Ajo"],
    region: "Metropolitana de Santiago",
    commune: "Pedro Aguirre Cerda",
    address: "Av. Carlos Valdovinos 3000",
    hours: "Lunes a Sábado: 05:00 - 15:00 hrs",
    paymentMethods: ["Efectivo", "Transferencia bancaria"],
    lat: -33.4840,
    lng: -70.6780,
    isFeatured: true,
    isProSubscription: true,
    stallNumber: "Patio Las Hortalizas - Local 58",
    whatsappNumber: "+56987654321",
    featuredProducts: [
      { name: "Melón", price: 1800, unit: "unidad" },
      { name: "Frutillas", price: 2190, unit: "kg" },
      { name: "Cebolla", price: 990, unit: "kg" },
      { name: "Manzanas", price: 1000, unit: "4 unidades" }
    ],
    catalog: [
      { id: "v1", name: "Melón Tuna Dulce", category: "Frutas", price: 1800, unit: "unidad", inStock: true, description: "Cosecha fresca del valle del Maipo, muy jugoso." },
      { id: "v2", name: "Frutillas de San Pedro", category: "Frutas", price: 2190, unit: "kg", inStock: true, description: "Rojas, aromáticas y de calibre parejo." },
      { id: "v3", name: "Cebolla Temprana", category: "Verduras", price: 990, unit: "kg", inStock: true, description: "Malla seleccionada firme, ideal para sofrito y empanadas." },
      { id: "v4", name: "Manzanas Fuji Crujientes", category: "Frutas", price: 1000, unit: "4 unidades", inStock: true, description: "Manzanas dulces y jugosas, paquete clásico de feria." },
      { id: "v5", name: "Ajo Rosado Chileno", category: "Verduras", price: 500, unit: "4 cabezas", inStock: true, description: "Cabezas firmes de gran aroma para todo tipo de sofritos." },
      { id: "v6", name: "Papas Corahila", category: "Tubérculos", price: 1400, unit: "kg", inStock: true, description: "Papas seleccionadas para puré, fritas o al horno." },
      { id: "v7", name: "Sandía de Paine", category: "Frutas", price: 4500, unit: "unidad", inStock: true, description: "Calidad certificada de Paine, corazón dulce y jugoso." }
    ]
  },
  {
    id: "v-chacra",
    name: "Verdulería La Chacra de Providencia",
    description: "Verdulería de barrio con abastecimiento diario. Albahaca fresca, paltas de primera y arándanos frescos.",
    image: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&q=80&w=800",
    rating: 4.7,
    distance: "0.8 km",
    category: "Verdulería",
    tags: ["Albahaca", "Palta", "Arándanos"],
    region: "Metropolitana de Santiago",
    commune: "Providencia",
    address: "Av. Providencia 1450",
    hours: "Lunes a Sábado: 08:30 - 20:00 hrs | Domingo: 09:00 - 15:00 hrs",
    paymentMethods: ["Efectivo", "Redcompra / Débito", "Crédito", "Transferencia"],
    lat: -33.4285,
    lng: -70.6125,
    isProSubscription: true,
    whatsappNumber: "+56976543219",
    featuredProducts: [
      { name: "Albahaca", price: 990, unit: "atado" },
      { name: "Palta", price: 3890, unit: "kg" },
      { name: "Arándanos", price: 2990, unit: "kg" }
    ],
    catalog: [
      { id: "ch1", name: "Albahaca Fresca Criolla", category: "Hierbas", price: 990, unit: "atado", inStock: true, description: "Hoja ancha aromática perfecta para pesto y ensaladas caprese." },
      { id: "ch2", name: "Palta Hass Madura", category: "Verduras", price: 3890, unit: "kg", inStock: true, description: "Selección para consumir en el día o en 48 horas." },
      { id: "ch3", name: "Arándanos de Exportación", category: "Frutas", price: 2990, unit: "kg", inStock: true, description: "Fruta fresca firme y dulce de temporada." },
      { id: "ch4", name: "Rúcula Hidropónica", category: "Hojas Verdes", price: 1200, unit: "atado", inStock: true, description: "Frescura garantizada, cultivada sin pesticidas." },
      { id: "ch5", name: "Tomates Cherry Mixtos", category: "Verduras", price: 1800, unit: "kg", inStock: true, description: "Variedades roja y amarilla para ensaladas gourmet." },
      { id: "ch6", name: "Mix de Hojas Tiernas", category: "Hojas Verdes", price: 1690, unit: "kg", inStock: true, description: "Espinaca baby, berro y lechuga morada lavadas." }
    ]
  },

  // ================= PESCADERÍAS =================
  {
    id: "p-terminal",
    name: "Terminal Pesquero Metropolitano - Don Juan",
    description: "Llegada directa de caletas de la costa chilena todas las madrugadas. Pescados frescos y mariscos del día.",
    image: "https://images.unsplash.com/photo-1534604973900-c41ab4c3c3c0?auto=format&fit=crop&q=80&w=800",
    rating: 4.9,
    distance: "5.1 km",
    category: "Pescadería",
    tags: ["Reineta", "Congrio", "Choritos", "Machas"],
    region: "Metropolitana de Santiago",
    commune: "Lo Espejo",
    address: "Av. Américo Vespucio 1500",
    hours: "Martes a Domingo: 04:00 - 13:00 hrs",
    paymentMethods: ["Efectivo", "Redcompra / Débito", "Transferencia"],
    lat: -33.5180,
    lng: -70.6850,
    isFeatured: true,
    isProSubscription: true,
    stallNumber: "Sector Minorista - Pasillo Central 12",
    whatsappNumber: "+56994443322",
    featuredProducts: [
      { name: "Reineta", price: 5990, unit: "kg" },
      { name: "Congrio", price: 8990, unit: "kg" },
      { name: "Choritos", price: 1990, unit: "kg" },
      { name: "Machas", price: 4990, unit: "kg" }
    ],
    catalog: [
      { id: "pt1", name: "Filete de Reineta Fresca", category: "Pescados", price: 5990, unit: "kg", inStock: true, description: "Despinada y limpia, extraída de la costa de Lebu." },
      { id: "pt2", name: "Congrio Colorado Entero", category: "Pescados", price: 8990, unit: "kg", inStock: true, description: "Excelente para caldillo o frito, carne blanca y firme." },
      { id: "pt3", name: "Choritos de Chiloé Vivos", category: "Mariscos", price: 1990, unit: "kg", inStock: true, description: "Choritos frescos en concha para caldillos o al vapor." },
      { id: "pt4", name: "Machas en su Concha", category: "Mariscos", price: 4990, unit: "kg", inStock: true, description: "De la costa norte, perfectas a la parmesana." },
      { id: "pt5", name: "Salmón Atlántico Fresco", category: "Pescados", price: 11990, unit: "kg", inStock: true, description: "Corte en porciones o filete entero con piel." },
      { id: "pt6", name: "Almejas Seleccionadas", category: "Mariscos", price: 2990, unit: "kg", inStock: true, description: "Limpias de arena, carnosas y de gran sabor marino." }
    ]
  },
  {
    id: "p-portales",
    name: "Pescadería Caleta Portales",
    description: "El auténtico sabor del puerto directo a tu mesa. Pescados frescos capturados por pescadores artesanales.",
    image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=800",
    rating: 4.8,
    distance: "1.9 km",
    category: "Pescadería",
    tags: ["Merluza", "Sierra", "Camarones"],
    region: "Valparaíso",
    commune: "Valparaíso",
    address: "Av. España s/n, Caleta Portales",
    hours: "Lunes a Domingo: 07:00 - 16:00 hrs",
    paymentMethods: ["Efectivo", "Redcompra / Débito"],
    lat: -33.0370,
    lng: -71.5930,
    isProSubscription: true,
    stallNumber: "Box de Venta 7",
    whatsappNumber: "+56981112233",
    featuredProducts: [
      { name: "Merluza", price: 4500, unit: "kg" },
      { name: "Sierra", price: 4800, unit: "kg" },
      { name: "Camarones", price: 8900, unit: "kg" }
    ],
    catalog: [
      { id: "pp1", name: "Merluza Común Fresca", category: "Pescados", price: 4500, unit: "kg", inStock: true, description: "La clásica 'pescada' porteña, limpia y lista para freír." },
      { id: "pp2", name: "Sierra Entera", category: "Pescados", price: 4800, unit: "kg", inStock: true, description: "Ideal para preparar al horno con ajo, orégano y vino blanco." },
      { id: "pp3", name: "Camarón Ecuatoriano Calibre 36/40", category: "Mariscos", price: 8900, unit: "kg", inStock: true, description: "Desvenado y congelado en origen para máxima textura." },
      { id: "pp4", name: "Corvina de Orilla", category: "Pescados", price: 9500, unit: "kg", inStock: true, description: "Pieza noble de carne blanca para ceviche o a la plancha." }
    ]
  },

  // ================= TOSTADURÍAS Y FRUTOS SECOS =================
  {
    id: "t-puertorico",
    name: "Tostaduría Puerto Rico",
    description: "Una leyenda del grano y el fruto seco en Chile desde 1937. Tostado diario a la vista, frutos secos y porotos seleccionados.",
    image: "https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&q=80&w=800",
    rating: 4.9,
    distance: "1.1 km",
    category: "Tostadurías y Frutos Secos",
    tags: ["Nueces", "Almendras", "Porotos", "Merkén"],
    region: "Metropolitana de Santiago",
    commune: "Santiago Centro",
    address: "San Pablo 1890",
    hours: "Lunes a Viernes: 09:30 - 19:30 hrs | Sábado: 09:30 - 15:30 hrs",
    paymentMethods: ["Efectivo", "Redcompra / Débito", "Crédito", "Transferencia"],
    lat: -33.4380,
    lng: -70.6550,
    isFeatured: true,
    isProSubscription: true,
    stallNumber: "Local Tradicional - San Pablo",
    whatsappNumber: "+56972223344",
    featuredProducts: [
      { name: "Nueces", price: 7990, unit: "kg" },
      { name: "Almendras", price: 8900, unit: "kg" },
      { name: "Porotos", price: 2490, unit: "kg" },
      { name: "Merkén", price: 16000, unit: "kg" }
    ],
    catalog: [
      { id: "tp1", name: "Nuez Mariposa Partida Selección", category: "Frutos Secos", price: 7990, unit: "kg", inStock: true, description: "Cosecha nacional nueva, claras y crujientes." },
      { id: "tp2", name: "Almendras Non Pareil Tostadas", category: "Frutos Secos", price: 8900, unit: "kg", inStock: true, description: "Tostadas artesanalmente sin sal añadida." },
      { id: "tp3", name: "Porotos Tórtola de Campo", category: "Legumbres", price: 2490, unit: "kg", inStock: true, description: "Piel fina y cocción suave, no se desintegran." },
      { id: "tp4", name: "Merkén Ahumado Mapuche", category: "Especias", price: 16000, unit: "kg", inStock: true, description: "Ahumado a la leña tradicional con semillas de cilantro." },
      { id: "tp5", name: "Lentejas 4mm Seleccionadas", category: "Legumbres", price: 1990, unit: "kg", inStock: true, description: "Grano entero sin impurezas, cocción rápida." },
      { id: "tp6", name: "Mix Frutos Secos Gourmet", category: "Frutos Secos", price: 8500, unit: "kg", inStock: true, description: "Almendras, nueces, arándanos deshidratados y castañas de cajú." }
    ]
  },
  {
    id: "t-talca",
    name: "Tostaduría Talca",
    description: "Especialistas en semillas, harina tostada, frutos secos y maní recién tostado por mayor y detalle.",
    image: "https://images.unsplash.com/photo-1536510233921-8e5043fce771?auto=format&fit=crop&q=80&w=800",
    rating: 4.7,
    distance: "1.4 km",
    category: "Tostadurías y Frutos Secos",
    tags: ["Maní", "Harina Tostada", "Castañas de Cajú"],
    region: "Metropolitana de Santiago",
    commune: "Recoleta",
    address: "Av. Recoleta 642",
    hours: "Lunes a Sábado: 09:00 - 19:00 hrs",
    paymentMethods: ["Efectivo", "Redcompra / Débito", "Transferencia"],
    lat: -33.4305,
    lng: -70.6490,
    isProSubscription: true,
    whatsappNumber: "+56965554433",
    featuredProducts: [
      { name: "Maní", price: 2990, unit: "kg" },
      { name: "Harina Tostada", price: 1890, unit: "kg" },
      { name: "Castañas de Cajú", price: 9500, unit: "kg" }
    ],
    catalog: [
      { id: "tt1", name: "Maní Tostado con Piel", category: "Frutos Secos", price: 2990, unit: "kg", inStock: true, description: "Tostado diario caliente en paila de cobre tradicional." },
      { id: "tt2", name: "Harina Tostada Molino de Agua", category: "Granos y Harinas", price: 1890, unit: "kg", inStock: true, description: "Aroma inconfundible a trigo tostado para ulpo o chicha." },
      { id: "tt3", name: "Castañas de Cajú Tostadas", category: "Frutos Secos", price: 9500, unit: "kg", inStock: true, description: "Sin sal, textura cremosa y calibre jumbo." },
      { id: "tt4", name: "Semillas de Chía y Linaza", category: "Semillas", price: 3200, unit: "kg", inStock: true, description: "Altas en fibra y omega 3, selección limpia." }
    ]
  },

  // ================= QUESERÍAS Y LÁCTEOS =================
  {
    id: "q-franklin",
    name: "Matadero Franklin - Quesería Don Chanco",
    description: "Auténticos quesos de fundo de la zona centro-sur. Quesos madurados de Chanco, mantecoso y mantequilla de campo.",
    image: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&q=80&w=800",
    rating: 4.9,
    distance: "2.8 km",
    category: "Quesería y Lácteos",
    tags: ["Queso Chanco", "Queso Mantecoso", "Mantequilla", "Manjar"],
    region: "Metropolitana de Santiago",
    commune: "Santiago Centro",
    address: "Franklin 962",
    hours: "Viernes a Domingo y Festivos: 08:30 - 17:00 hrs",
    paymentMethods: ["Efectivo", "Redcompra / Débito", "Transferencia"],
    lat: -33.4735,
    lng: -70.6480,
    isFeatured: true,
    isProSubscription: true,
    stallNumber: "Galpón Matadero - Local 104",
    whatsappNumber: "+56983332211",
    featuredProducts: [
      { name: "Queso Chanco", price: 8490, unit: "kg" },
      { name: "Queso Mantecoso", price: 8990, unit: "kg" },
      { name: "Manjar", price: 4990, unit: "kg" },
      { name: "Mantequilla", price: 7990, unit: "kg" }
    ],
    catalog: [
      { id: "qf1", name: "Queso Chanco Madurado Tradicional", category: "Quesos", price: 8490, unit: "kg", inStock: true, description: "Receta típica de la región del Maule con 60 días de maduración." },
      { id: "qf2", name: "Queso Mantecoso del Sur", category: "Quesos", price: 8990, unit: "kg", inStock: true, description: "Funde a la perfección en empanadas y tostadas." },
      { id: "qf3", name: "Manjar de Campo en Olla de Cobre", category: "Dulces y Derivados", price: 4990, unit: "kg", inStock: true, description: "Elaborado con leche fresca entera y azúcar natural." },
      { id: "qf4", name: "Mantequilla de Campo sin Sal", category: "Lácteos", price: 7990, unit: "kg", inStock: true, description: "Batida artesanalmente con crema fresca de vaca." },
      { id: "qf5", name: "Queso de Cabra al Merkén", category: "Quesos", price: 11900, unit: "kg", inStock: true, description: "Toque picante ahumado que realza la intensidad de la leche de cabra." }
    ]
  },
  {
    id: "q-colchagua",
    name: "Lácteos Las Parcelas de Colchagua",
    description: "Distribución directa de parcelas de Colchagua. Quesillos frescos sin sal y quesos de cabra artesanales.",
    image: "https://images.unsplash.com/photo-1559561853-08451507cbe7?auto=format&fit=crop&q=80&w=800",
    rating: 4.8,
    distance: "1.7 km",
    category: "Quesería y Lácteos",
    tags: ["Quesillo", "Queso de Cabra"],
    region: "Metropolitana de Santiago",
    commune: "Ñuñoa",
    address: "Av. Simón Bolívar 2890",
    hours: "Lunes a Sábado: 09:00 - 19:30 hrs",
    paymentMethods: ["Efectivo", "Redcompra / Débito", "Crédito"],
    lat: -33.4540,
    lng: -70.6010,
    isProSubscription: true,
    whatsappNumber: "+56974445566",
    featuredProducts: [
      { name: "Quesillo", price: 2990, unit: "unidad" },
      { name: "Queso de Cabra", price: 12900, unit: "kg" }
    ],
    catalog: [
      { id: "qc1", name: "Quesillo Fresco Artesanal", category: "Quesos Frescos", price: 2990, unit: "unidad", inStock: true, description: "Llegada diaria desde el valle, sin conservantes." },
      { id: "qc2", name: "Queso de Cabra Semimadurado", category: "Quesos", price: 12900, unit: "kg", inStock: true, description: "Sabor suave y cremoso, apto para intolerantes a la lactosa." },
      { id: "qc3", name: "Ricotta Fresca de Leche Entera", category: "Quesos Frescos", price: 5990, unit: "kg", inStock: true, description: "Excelente textura para postres o rellenos de pasta." },
      { id: "qc4", name: "Yogurt Natural Tipo Griego", category: "Lácteos", price: 3490, unit: "kg", inStock: true, description: "Sin azúcar ni endulzantes añadidos, 100% natural." }
    ]
  },
  {
    id: "p-coquimbo",
    name: "Caleta de Coquimbo - Pescadería El Navegante",
    description: "Extracción sustentable en la bahía de Coquimbo. Ostiones frescos de Tongoy y congrio recién desembarcado.",
    image: "https://images.unsplash.com/photo-1534604973900-c41ab4c3c3c0?auto=format&fit=crop&q=80&w=800",
    rating: 4.9,
    distance: "2.1 km",
    category: "Pescadería",
    tags: ["Ostiones", "Congrio"],
    region: "Coquimbo",
    commune: "Coquimbo",
    address: "Costanera Pedro Montt s/n",
    hours: "Lunes a Domingo: 06:30 - 15:30 hrs",
    paymentMethods: ["Efectivo", "Redcompra / Débito", "Transferencia"],
    lat: -29.9533,
    lng: -71.3436,
    isFeatured: true,
    isProSubscription: true,
    stallNumber: "Puesto 18 - Sector Desembarco",
    whatsappNumber: "+56951234567",
    featuredProducts: [
      { name: "Ostiones", price: 8990, unit: "docena" },
      { name: "Congrio", price: 9500, unit: "kg" }
    ],
    catalog: [
      { id: "pq1", name: "Ostiones Vivos en Media Concha", category: "Mariscos", price: 8990, unit: "docena", inStock: true, description: "Provenientes de los criaderos certificados de Tongoy." },
      { id: "pq2", name: "Congrio Dorado de Roca", category: "Pescados", price: 9500, unit: "kg", inStock: true, description: "Pescado de profundidad capturado en espinel artesanal." },
      { id: "pq3", name: "Filete de Corvina Costera", category: "Pescados", price: 8900, unit: "kg", inStock: true, description: "Textura firme y sabor limpio del mar nortino." },
      { id: "pq4", name: "Locos Cocidos Tiernos", category: "Mariscos", price: 15990, unit: "docena", inStock: true, description: "De áreas de manejo sustentable autorizadas por SERNAPESCA." }
    ]
  },
  {
    id: "v-temuco",
    name: "Feria Pinto de Temuco - Puesto Doña Carmen",
    description: "Patrimonio cultural y gastronómico de La Araucanía. Piñones frescos cordilleranos, ají seco y papas recién cosechadas.",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800",
    rating: 4.9,
    distance: "1.5 km",
    category: "Verdulería",
    tags: ["Piñones", "Papas", "Ají"],
    region: "La Araucanía",
    commune: "Temuco",
    address: "Av. Aníbal Pinto 032",
    hours: "Lunes a Sábado: 07:00 - 17:00 hrs",
    paymentMethods: ["Efectivo", "Transferencia bancaria"],
    lat: -38.7359,
    lng: -72.5850,
    isFeatured: true,
    isProSubscription: true,
    stallNumber: "Bandjón 2 - Puesto 45",
    whatsappNumber: "+56945678901",
    featuredProducts: [
      { name: "Piñones", price: 3990, unit: "kg" },
      { name: "Papas", price: 1890, unit: "kg" },
      { name: "Ají", price: 1200, unit: "atado" }
    ],
    catalog: [
      { id: "vt1", name: "Piñones de Araucaria Pewen", category: "Frutos de la Selva Valdiviana", price: 3990, unit: "kg", inStock: true, description: "Recolectados por comunidades pehuenches en Curarrehue." },
      { id: "vt2", name: "Papas Nativas del Sur (Michuñe y Clavela)", category: "Tubérculos", price: 1890, unit: "kg", inStock: true, description: "Variedades ancestrales con piel de color y sabor terroso profundo." },
      { id: "vt3", name: "Ají Cacho de Cabra Seco", category: "Especias", price: 1200, unit: "atado", inStock: true, description: "Secado al humo en fogón tradicional." },
      { id: "vt4", name: "Digüeñes Frescos de Temporada", category: "Hongos y Setas", price: 2500, unit: "kg", inStock: true, description: "Hongos silvestres de roble cosechados en primavera." },
      { id: "vt5", name: "Murtas Silvestres Frescas", category: "Frutas", price: 3400, unit: "kg", inStock: true, description: "Aromáticas bayas nativas para mermeladas y postres." }
    ]
  },
  {
    id: "q-angelmo",
    name: "Mercado de Angelmó - Ahumados y Quesos del Sur",
    description: "Auténticos quesos sureños ahumados con leña de ulmo y mantequilla de campo tradicional.",
    image: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&q=80&w=800",
    rating: 4.8,
    distance: "3.2 km",
    category: "Quesería y Lácteos",
    tags: ["Queso Ahumado", "Mantequilla"],
    region: "Los Lagos",
    commune: "Puerto Montt",
    address: "Av. Angelmó 2150",
    hours: "Lunes a Domingo: 08:00 - 18:30 hrs",
    paymentMethods: ["Efectivo", "Redcompra / Débito", "Transferencia"],
    lat: -41.4815,
    lng: -72.9682,
    isProSubscription: true,
    stallNumber: "Pasillo Artesanal 33",
    whatsappNumber: "+56965432198",
    featuredProducts: [
      { name: "Queso Ahumado", price: 9990, unit: "kg" },
      { name: "Mantequilla", price: 7990, unit: "kg" }
    ],
    catalog: [
      { id: "qa1", name: "Queso de Campo Ahumado en Ulmo", category: "Quesos Ahumados", price: 9990, unit: "kg", inStock: true, description: "Ahumado lento que le otorga color dorado y sabor leñoso único." },
      { id: "qa2", name: "Mantequilla de Campo Salada", category: "Lácteos", price: 7990, unit: "kg", inStock: true, description: "Elaborada con sal de mar de Cáhuil y nata fresca." },
      { id: "qa3", name: "Salmón Ahumado en Caliente", category: "Ahumados", price: 14500, unit: "kg", inStock: true, description: "Receta ancestral chilota con maderas nobles nativas." },
      { id: "qa4", name: "Queso Mantecoso de Osorno", category: "Quesos", price: 8900, unit: "kg", inStock: true, description: "Pura leche de praderas osorninas, cremosidad insuperable." }
    ]
  }
];
