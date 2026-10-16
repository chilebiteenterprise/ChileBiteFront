import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export const GallerySection: React.FC = () => {
  return (
    <section className="py-24 px-4 bg-[#111317] text-white relative">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center w-full">
        {/* Left Column: Text Content */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="pr-0 md:pr-10"
        >
          <span className="text-[#c89a74] text-xs font-bold uppercase tracking-widest mb-3 block">
            CATÁLOGO DIGITAL
          </span>

          <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight tracking-tight">
            Una galería hecha{" "}
            <span className="text-[#c89a74]">
              a tu medida
            </span>
          </h2>

          <p className="text-lg md:text-xl text-zinc-300 leading-relaxed mb-10 font-medium">
            Disfruta de una interfaz agradable y fácil de usar, diseñada para que
            encuentres lo que buscas sin complicaciones. Filtra por país,
            dificultad, cantidad de porciones y más. Guarda tus favoritas en un
            solo clic.
          </p>

          <motion.a
            href="/recipes"
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-[#c89a74] text-[#1c1208] font-extrabold text-lg hover:bg-[#d8a882] transition-all group"
          >
            <span>Explorar Recetas</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </motion.a>
        </motion.div>

        {/* Right Column: Image Showcase */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="w-full relative flex items-center justify-center"
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="relative rounded-3xl overflow-hidden border border-zinc-800 bg-[#191c24] p-2.5 group"
          >
            <img
              src="/images/Sitio.webp"
              alt="Interfaz Galería ChileBite"
              width="512"
              height="384"
              className="rounded-2xl mx-auto w-full max-w-lg object-cover transition-transform duration-500 group-hover:scale-102"
              loading="lazy"
              decoding="async"
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default GallerySection;
