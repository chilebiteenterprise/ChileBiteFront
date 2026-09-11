import React from "react";
import { motion } from "framer-motion";
import { Calculator, Sparkles, Scale, Utensils, ArrowRight } from "lucide-react";

export const CalculatorPreviewSection: React.FC = () => {
  return (
    <section className="py-24 px-4 bg-[#111317] text-white relative">
      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column: Text & Features */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="text-[#c89a74] text-xs font-bold uppercase tracking-widest mb-3 block">
              HERRAMIENTA IA DE COCINA
            </span>

            <h2 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight tracking-tight">
              Calculadora de Recetas &{" "}
              <span className="text-[#c89a74]">
                Nutrición con IA
              </span>
            </h2>

            <p className="text-zinc-300 text-lg md:text-xl leading-relaxed mb-8 font-medium">
              Optimiza tus porciones, calcula valores nutricionales precisos en
              segundos y recibe sugerencias inteligentes de platos a partir de
              los ingredientes que tienes disponibles en tu cocina.
            </p>

            {/* Feature Points */}
            <div className="space-y-4 mb-10">
              <motion.div
                whileHover={{ x: 6 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="flex items-start gap-4 p-4.5 rounded-2xl bg-[#191c24] border border-zinc-800/80 transition-colors"
              >
                <div className="p-3 rounded-xl bg-[#c89a74]/15 border border-[#c89a74]/30 text-[#c89a74] shrink-0">
                  <Utensils className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-base md:text-lg">
                    Selección de Ingredientes
                  </h4>
                  <p className="text-zinc-400 text-sm md:text-base">
                    Ingresa lo que tienes en tu despensa y deja que nuestro motor
                    descubra las mejores recetas.
                  </p>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ x: 6 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="flex items-start gap-4 p-4.5 rounded-2xl bg-[#191c24] border border-zinc-800/80 transition-colors"
              >
                <div className="p-3 rounded-xl bg-[#c89a74]/15 border border-[#c89a74]/30 text-[#c89a74] shrink-0">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-base md:text-lg">
                    Cálculo Nutricional de Precisión
                  </h4>
                  <p className="text-zinc-400 text-sm md:text-base">
                    Obtén el desglose automático de calorías, proteínas,
                    carbohidratos y grasas por porción.
                  </p>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ x: 6 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="flex items-start gap-4 p-4.5 rounded-2xl bg-[#191c24] border border-zinc-800/80 transition-colors"
              >
                <div className="p-3 rounded-xl bg-[#c89a74]/15 border border-[#c89a74]/30 text-[#c89a74] shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-base md:text-lg">
                    Sugerencias Inteligentes Adaptadas
                  </h4>
                  <p className="text-zinc-400 text-sm md:text-base">
                    IA entrenada para recomendarte alternativas deliciosas de la
                    cocina chilena e internacional.
                  </p>
                </div>
              </motion.div>
            </div>

            {/* CTA Button Stitch Pill */}
            <motion.a
              href="/calculadora"
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-[#c89a74] text-[#1c1208] font-extrabold text-lg hover:bg-[#d8a882] transition-all group"
            >
              <Calculator className="w-5 h-5" />
              <span>Probar Calculadora IA</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.a>
          </motion.div>

          {/* Right Column: Visual Showcase */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex items-center justify-center"
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="relative w-full rounded-3xl overflow-hidden border border-zinc-800 bg-[#191c24] p-2.5 group"
            >
              <img
                src="/images/calculadora_ia.png"
                alt="Vista previa de la Calculadora de Recetas con IA"
                className="w-full h-auto object-cover rounded-2xl group-hover:scale-102 transition-transform duration-500"
                loading="lazy"
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CalculatorPreviewSection;
