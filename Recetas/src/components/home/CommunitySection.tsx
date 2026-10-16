import React from "react";
import { motion } from "framer-motion";

export const CommunitySection: React.FC = () => {
  return (
    <section className="py-24 px-4 bg-[#111317] text-white relative">
      <div className="max-w-4xl mx-auto text-center w-full relative z-10">
        {/* Subtitle Badge */}
        <motion.span
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-[#c89a74] text-xs font-bold uppercase tracking-widest mb-3 block"
        >
          VOZ DE LA TRIBU
        </motion.span>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight"
        >
          Comunidad ChileBite
        </motion.h2>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          className="text-lg md:text-xl text-zinc-300 leading-relaxed mb-14 max-w-2xl mx-auto font-medium"
        >
          Cocinillas, sommeliers aficionados y chefs de todo el territorio
          compartiendo hallazgos y reinterpretaciones en tiempo real.
        </motion.p>

        {/* Image Showcase Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 35 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-w-2xl mx-auto group"
        >
          <div className="relative rounded-3xl overflow-hidden border border-zinc-800 bg-[#191c24] p-2.5">
            <img
              src="/images/Carta.webp"
              alt="Carta de recetas ChileBite"
              width="576"
              height="432"
              className="rounded-2xl mx-auto w-full object-contain group-hover:scale-102 transition-transform duration-500"
              loading="lazy"
              decoding="async"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CommunitySection;
