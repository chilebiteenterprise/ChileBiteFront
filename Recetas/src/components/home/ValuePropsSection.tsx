import React from "react";
import { motion } from "framer-motion";
import { UtensilsCrossed, Store, ArrowRight } from "lucide-react";

export const ValuePropsSection: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.96 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <section className="py-24 px-4 bg-[#111317] text-white relative">
      <div className="max-w-7xl mx-auto w-full relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-20"
        >
          <span className="text-[#c89a74] text-xs font-bold uppercase tracking-widest mb-3 block">
            PILARES CHILEBITE
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight">
            ¿Qué te ofrecemos?
          </h2>
          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto font-medium leading-relaxed">
            Todo lo que necesitas para tu próxima aventura culinaria, en un solo
            lugar.
          </p>
        </motion.div>

        {/* Feature Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid md:grid-cols-2 gap-8 lg:gap-12"
        >
          {/* Card 1: Aprende a Cocinar */}
          <motion.a
            href="/recipes"
            variants={cardVariants}
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="group p-10 rounded-[2.5rem] bg-[#191c24] border border-zinc-800/80 hover:border-[#c89a74]/50 transition-all duration-300 block relative overflow-hidden"
          >
            <div className="w-16 h-16 rounded-2xl bg-[#c89a74]/15 border border-[#c89a74]/30 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
              <UtensilsCrossed className="w-8 h-8 text-[#c89a74]" />
            </div>

            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl md:text-3xl font-bold text-white group-hover:text-[#c89a74] transition-colors">
                Aprende a Cocinar
              </h3>
              <ArrowRight className="w-6 h-6 text-[#c89a74] group-hover:translate-x-2 transition-transform duration-300" />
            </div>

            <p className="text-zinc-300 leading-relaxed text-base md:text-lg">
              Explora un catálogo extenso de recetas detalladas paso a paso.
              Desde platos tradicionales chilenos hasta innovación gastronómica,
              apoyado con nuestros videotutoriales exclusivos.
            </p>
          </motion.a>

          {/* Card 2: Descubre Locales */}
          <motion.a
            href="/locales"
            variants={cardVariants}
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="group p-10 rounded-[2.5rem] bg-[#191c24] border border-zinc-800/80 hover:border-[#c89a74]/50 transition-all duration-300 block relative overflow-hidden"
          >
            <div className="w-16 h-16 rounded-2xl bg-[#c89a74]/15 border border-[#c89a74]/30 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
              <Store className="w-8 h-8 text-[#c89a74]" />
            </div>

            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl md:text-3xl font-bold text-white group-hover:text-[#c89a74] transition-colors">
                Descubre Locales
              </h3>
              <ArrowRight className="w-6 h-6 text-[#c89a74] group-hover:translate-x-2 transition-transform duration-300" />
            </div>

            <p className="text-zinc-300 leading-relaxed text-base md:text-lg">
              Encuentra los mejores restaurantes y picadas en tu zona. Filtra por
              tus preferencias y sal a disfrutar de la mejor gastronomía en tu
              ciudad.
            </p>
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
};

export default ValuePropsSection;
