import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Skeleton } from '@heroui/react';

/**
 * PRODUCTOS RECOMENDADOS (ChileBite Affiliate System)
 * Enriquecido con metadatos para un look más profesional
 */
const PRODUCTOS = [
  {
    id: 1,
    title: "Set 3 Sartenes Hierro",
    image: "https://http2.mlstatic.com/D_NQ_NP_2X_679298-MLA100481655052_122025-F.webp",
    link: "https://meli.la/1Ctdssr"
  },
  {
    id: 2,
    title: "Bateria Smart Crema",
    image: "https://http2.mlstatic.com/D_NQ_NP_2X_834457-MLA99495459316_112025-F.webp",
    link: "https://meli.la/2FKeizR"
  },
  {
    id: 3,
    title: "Afilador Manual 4en1",
    image: "https://http2.mlstatic.com/D_NQ_NP_2X_684314-CBT105126405578_012026-F.webp",
    link: "https://meli.la/1f6rAcS"
  },
  {
    id: 4,
    title: "Secaplatos EOLAND",
    image: "https://http2.mlstatic.com/D_NQ_NP_2X_657284-MLA99855650081_112025-F.webp",
    link: "https://meli.la/337Dp5R"
  },
  {
    id: 5,
    title: "Cocinar Es Fácil",
    image: "https://http2.mlstatic.com/D_NQ_NP_2X_656345-MLC94964003449_102025-F.webp",
    link: "https://meli.la/2ykmSsM"
  },
  {
    id: 6,
    title: "Mortero Marmol",
    image: "https://http2.mlstatic.com/D_NQ_NP_2X_890314-MLA107681270852_032026-F.webp",
    link: "https://meli.la/1iY3cyJ"
  },
  {
    id: 7,
    title: "Delantal Parrilla",
    image: "https://http2.mlstatic.com/D_NQ_NP_2X_742565-MLC51449136045_092022-F-delantal-para-parrilla-cocina-personalizado-sublimado.webp",
    link: "https://meli.la/1VyxLoN"
  },
  {
    id: 8,
    title: "Recetario 200 Pag",
    image: "https://http2.mlstatic.com/D_NQ_NP_2X_871449-MLA95167566226_102025-F.webp",
    link: "https://meli.la/1pZ21L2"
  },
  {
    id: 9,
    title: "6 Cucharas Medida",
    image: "https://http2.mlstatic.com/D_NQ_NP_2X_664439-MLC79691479420_102024-F.webp",
    link: "https://meli.la/15Z3fkt"
  },
  {
    id: 10,
    title: "Balanza Digital",
    image: "https://http2.mlstatic.com/D_NQ_NP_2X_852646-MLA95248085013_102025-F.webp",
    link: "https://meli.la/1pb4srW"
  }
];

// Extendemos el array para el efecto infinito (7 copias para evitar bordes en scroll ultrasónico)
const EXTENDED_PRODUCTS = [...PRODUCTOS, ...PRODUCTOS, ...PRODUCTOS, ...PRODUCTOS, ...PRODUCTOS, ...PRODUCTOS, ...PRODUCTOS];
const CARD_WIDTH = 180; 
const GAP = 12; 
const TOTAL_WIDTH_SINGLE = PRODUCTOS.length * (CARD_WIDTH + GAP);

const ProductCard = ({ item }) => {
  return (
    <div className="min-w-[180px] h-full snap-center select-none">
      <a
        href={item.link}
        target="_blank"
        rel="noopener noreferrer"
        className="block group/card relative bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 rounded-[1.5rem] overflow-hidden h-full"
      >
        {/* Banner de Gradiente sutil en hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#b08968]/0 via-transparent to-[#b08968]/0 group-hover/card:from-[#b08968]/5 group-hover/card:to-[#b08968]/10 transition-all duration-700 -z-0" />

        {/* Imagen Wrapper */}
        <div className="h-28 overflow-hidden relative bg-white flex items-center justify-center p-3 z-10">
          <img
            src={item.image}
            alt={item.title}
            className="max-w-full max-h-full object-contain group-hover/card:scale-105 transition-transform duration-500 ease-out"
          />
          
          <div className="absolute top-2 right-2 translate-y-2 opacity-0 group-hover/card:translate-y-0 group-hover/card:opacity-100 transition-all duration-300">
            <div className="bg-[#b08968] text-white p-2 rounded-full shadow-lg ring-2 ring-[#b08968]/10">
              <ShoppingCart size={12} />
            </div>
          </div>
        </div>

        {/* Info Area */}
        <div className="p-3 z-10 relative">
          <h4 className="text-xs font-bold text-gray-900 dark:text-zinc-100 leading-tight mb-2 min-h-[2rem] group-hover/card:text-[#b08968] transition-colors duration-300 line-clamp-2">
            {item.title}
          </h4>

          <div className="flex items-center justify-between pt-2 border-t border-gray-50 dark:border-zinc-800/50">
            <span className="text-[9px] font-black text-gray-400 group-hover/card:text-[#b08968] transition-colors duration-300 tracking-wide">
              VER
            </span>
            <motion.div
              animate={{ x: [0, 3, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            >
               <ArrowRight size={12} className="text-[#b08968]" />
            </motion.div>
          </div>
        </div>
      </a>
    </div>
  );
};

const AffiliateCarousel = () => {
  const containerRef = useRef(null);
  const isScrolling = useRef(false);

  // Initialize scroll position to the middle block
  useEffect(() => {
    if (containerRef.current) {
      // Iniciamos en el bloque central (índice 3 de los 7 bloques)
      containerRef.current.scrollLeft = TOTAL_WIDTH_SINGLE * 3;
    }
  }, []);

  // Native infinite scroll logic
  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;

    // Tenemos un margen gigante de arrastre (1 bloque entero = ~1920px extra a cada lado)
    // Si caemos por debajo de 1 bloque (entramos a la zona de peligro izquierda)
    if (el.scrollLeft <= TOTAL_WIDTH_SINGLE) {
      el.style.scrollBehavior = 'auto'; // Desactivar smooth para salto instantáneo
      el.scrollLeft += TOTAL_WIDTH_SINGLE * 3; // Saltamos 3 bloques hacia la derecha
    } 
    // Si pasamos el bloque 5 (entramos a la zona de peligro derecha)
    else if (el.scrollLeft >= TOTAL_WIDTH_SINGLE * 5) {
      el.style.scrollBehavior = 'auto';
      el.scrollLeft -= TOTAL_WIDTH_SINGLE * 3; // Saltamos 3 bloques hacia la izquierda
    }
  };

  const scroll = (direction) => {
    const el = containerRef.current;
    if (!el) return;
    
    // Configurar scroll suave temporal para el clic del botón
    el.style.scrollBehavior = 'smooth';
    const moveAmount = direction === 'left' ? -CARD_WIDTH - GAP : CARD_WIDTH + GAP;
    el.scrollLeft += moveAmount;
  };

  return (
    <div className="w-full py-8 relative overflow-hidden bg-transparent">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Header Widget */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-zinc-50 tracking-tight flex items-center gap-2">
            <span className="w-1.5 h-6 bg-[#b08968] rounded-full inline-block"></span>
            Equipa tu <span className="text-[#b08968]">Cocina</span>
          </h3>

          <div className="flex gap-2">
            <button
              onClick={() => scroll('left')}
              className="p-2.5 rounded-xl bg-white dark:bg-zinc-800 shadow-sm border border-gray-100 dark:border-zinc-700 hover:bg-[#b08968] hover:text-white transition-all duration-300 group active:scale-95"
              aria-label="Anterior"
            >
              <ChevronLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-2.5 rounded-xl bg-white dark:bg-zinc-800 shadow-sm border border-gray-100 dark:border-zinc-700 hover:bg-[#b08968] hover:text-white transition-all duration-300 group active:scale-95"
              aria-label="Siguiente"
            >
              <ChevronRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Carousel Track (Native CSS Scroll) */}
      <div className="relative w-full">
        <div
            ref={containerRef}
            onScroll={handleScroll}
            className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-hide select-none"
            style={{ 
              scrollbarWidth: 'none', // Firefox
              msOverflowStyle: 'none' // IE/Edge
            }}
          >
            {/* Inline script fallback para Webkit scrollbar hide (opcional si se usa postcss) */}
            <style dangerouslySetInnerHTML={{__html: `
              .scrollbar-hide::-webkit-scrollbar { display: none; }
            `}} />

            {EXTENDED_PRODUCTS.map((item, index) => (
              <ProductCard key={`${item.id}-${index}`} item={item} />
            ))}
          </div>
        </div>
      
      {/* Decorative Fade Edges */}
      <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-stone-50 dark:from-gray-900 to-transparent pointer-events-none z-10" />
      <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-stone-50 dark:from-gray-900 to-transparent pointer-events-none z-10" />
    </div>
  );
};

export default AffiliateCarousel;
