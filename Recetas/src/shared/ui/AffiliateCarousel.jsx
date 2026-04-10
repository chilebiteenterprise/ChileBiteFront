import React, { useRef } from 'react';
import { ShoppingCart, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * PRODUCTOS RECOMENDADOS (ChileBite Affiliate System)
 */
const PRODUCTOS = [
  {
    id: 1,
    title: "Set 3 Sartenes Hierro",
    price: "Profesional 16-25cm",
    image: "https://http2.mlstatic.com/D_NQ_NP_2X_679298-MLA100481655052_122025-F.webp",
    link: "https://meli.la/1Ctdssr"
  },
  {
    id: 2,
    title: "Bateria Smart Crema",
    price: "5 Piezas Chef Choice",
    image: "https://http2.mlstatic.com/D_NQ_NP_2X_834457-MLA99495459316_112025-F.webp",
    link: "https://meli.la/2FKeizR"
  },
  {
    id: 3,
    title: "Afilador Manual 4en1",
    price: "Grado Profesional",
    image: "https://http2.mlstatic.com/D_NQ_NP_2X_684314-CBT105126405578_012026-F.webp",
    link: "https://meli.la/1f6rAcS"
  },
  {
    id: 4,
    title: "Secaplatos EOLAND",
    price: "Acero Inoxidable",
    image: "https://http2.mlstatic.com/D_NQ_NP_2X_657284-MLA99855650081_112025-F.webp",
    link: "https://meli.la/337Dp5R"
  }
];

const AffiliateCarousel = () => {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left'
        ? scrollLeft - clientWidth / 2
        : scrollLeft + clientWidth / 2;

      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full py-6 relative group bg-transparent">
      <div className="w-full px-4 md:px-8">
        {/* Header Widget - Más discreto */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800 dark:text-zinc-100 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-[#b08968] rounded-full"></span>
            Equipa tu <span className="text-[#b08968]">Cocina</span>
          </h3>

          <div className="flex gap-2">
            <button
              onClick={() => scroll('left')}
              className="p-2 rounded-full bg-white dark:bg-zinc-800 shadow-sm border border-gray-100 dark:border-zinc-700 hover:bg-[#b08968] hover:text-white transition-all duration-300"
              aria-label="Anterior"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-2 rounded-full bg-white dark:bg-zinc-800 shadow-sm border border-gray-100 dark:border-zinc-700 hover:bg-[#b08968] hover:text-white transition-all duration-300"
              aria-label="Siguiente"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Track Micro-Carousel */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {PRODUCTOS.map((item) => (
            <div
              key={item.id}
              className="min-w-[170px] md:min-w-[200px] snap-center"
            >
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block group/card relative bg-white dark:bg-zinc-900/80 rounded-2xl overflow-hidden border border-gray-100 dark:border-zinc-800/50 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300"
              >
                {/* Imagen Micro */}
                <div className="h-36 overflow-hidden relative bg-white flex items-center justify-center p-4">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="max-w-full max-h-full object-contain group-hover/card:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-2 right-2 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300">
                     <div className="bg-[#b08968] text-white p-1.5 rounded-full shadow-lg">
                        <ShoppingCart size={12} />
                     </div>
                  </div>
                </div>

                {/* Info Micro */}
                <div className="p-4 bg-white/50 dark:bg-zinc-900/50 transition-colors duration-300">
                  <span className="text-[8px] font-bold text-[#b08968] uppercase tracking-wider mb-1 block opacity-70">
                    {item.price}
                  </span>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-zinc-100 leading-tight truncate">
                    {item.title}
                  </h4>

                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-gray-50 dark:border-zinc-800/30">
                    <span className="text-[10px] font-semibold text-gray-500 hover:text-[#b08968] transition-colors">Comprar</span>
                    <ArrowRight size={12} className="text-[#b08968]" />
                  </div>
                </div>
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AffiliateCarousel;
