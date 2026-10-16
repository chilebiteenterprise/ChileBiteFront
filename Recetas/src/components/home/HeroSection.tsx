import React from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

export const HeroSection: React.FC = () => {
  const scrollToNext = () => {
    window.scrollBy({ top: window.innerHeight * 0.85, behavior: "smooth" });
  };

  return (
    <section className="relative min-h-[92vh] flex items-center justify-center pt-24 pb-16 px-4 overflow-hidden bg-[#111317]">
      {/* Background Image with Ambient Overlay */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src="/images/Titulo.webp"
          alt="ChileBite Portada Gastronómica"
          width="1920"
          height="1080"
          fetchPriority="high"
          loading="eager"
          decoding="async"
          className="w-full h-full object-cover transition-transform duration-1000 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/60 to-[#111317]" />
      </div>

      {/* Decorative Warm Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#c89a74]/15 rounded-full blur-[150px] pointer-events-none" />

      {/* Hero Content Container */}
      <div className="relative z-10 w-full max-w-4xl text-center mx-auto">
        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-4xl md:text-7xl font-black text-white tracking-tight mb-8 leading-tight drop-shadow-md"
        >
          Bienvenido a{" "}
          <span className="bg-gradient-to-r from-[#eabe9b] via-[#d4a373] to-[#c89a74] bg-clip-text text-transparent">
            ChileBite
          </span>
        </motion.h1>

        {/* Description Box */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="backdrop-blur-xl bg-black/65 p-6 md:p-8 rounded-3xl border border-white/10 max-w-3xl mx-auto"
        >
          <p className="text-base md:text-xl text-zinc-200 font-medium leading-relaxed">
            Somos Chrystopher Silva y Miguel Escobar. Creamos esta plataforma
            para que descubras, compartas y disfrutes las mejores recetas y
            locales cerca de ti.
          </p>
        </motion.div>
      </div>

      {/* Interactive Scroll Indicator */}
      <motion.button
        type="button"
        onClick={scrollToNext}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: [0, 10, 0] }}
        transition={{
          opacity: { duration: 0.5, delay: 0.8 },
          y: { repeat: Infinity, duration: 2, ease: "easeInOut" },
        }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 cursor-pointer p-3 rounded-full bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/15 text-white/70 hover:text-white transition-colors"
        aria-label="Desplazar hacia abajo"
      >
        <ChevronDown className="w-7 h-7" />
      </motion.button>
    </section>
  );
};

export default HeroSection;
