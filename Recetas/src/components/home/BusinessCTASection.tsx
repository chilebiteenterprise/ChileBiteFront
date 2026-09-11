import React from "react";
import { motion } from "framer-motion";
import { ChevronRight, FileText, CalendarCheck, ShieldCheck, MapPin } from "lucide-react";

export const BusinessCTASection: React.FC = () => {
  return (
    <section className="py-24 px-4 bg-[#111317] text-white relative">
      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 35 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="p-8 md:p-14 rounded-[2.5rem] bg-[#191c24] border border-zinc-800/90 relative overflow-hidden"
        >
          <div className="grid lg:grid-cols-3 gap-10 items-center">
            {/* Left Col (2 cols): Text & Info */}
            <div className="lg:col-span-2 text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#c89a74]/15 border border-[#c89a74]/30 text-[#c89a74] text-xs font-bold uppercase tracking-wider mb-6">
                <MapPin className="w-3.5 h-3.5 text-[#c89a74]" />
                <span>RED PROFESIONAL CHILEBITE</span>
              </div>

              {/* Title */}
              <h2 className="text-3xl md:text-5xl font-black mb-6 tracking-tight text-white leading-tight">
                Potencia tu Restaurante o Picada con Nuestra Audiencia Gourmet
              </h2>

              {/* Description */}
              <p className="text-base md:text-lg text-zinc-300 mb-8 leading-relaxed font-medium">
                Integra tu menú digital verificado, gestiona reservas sin comisiones
                abusivas y pon tu propuesta culinaria frente a más de 180,000 comensales
                que buscan experiencias auténticas cada mes.
              </p>

              {/* Feature Points */}
              <div className="grid sm:grid-cols-3 gap-4 pt-2">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-300">
                  <FileText className="w-4 h-4 text-[#c89a74] shrink-0" />
                  <span>Carta Digital & Alérgenos IA</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-300">
                  <CalendarCheck className="w-4 h-4 text-[#c89a74] shrink-0" />
                  <span>Motor de Reservas Directo</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-300">
                  <ShieldCheck className="w-4 h-4 text-[#c89a74] shrink-0" />
                  <span>Sello de Calidad Verificado</span>
                </div>
              </div>
            </div>

            {/* Right Col (1 col): Action Button */}
            <div className="flex flex-col items-center lg:items-end justify-center text-center lg:text-right pt-6 lg:pt-0">
              <motion.a
                href="/auth/register"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-[#c89a74] text-[#1c1208] font-extrabold text-base md:text-lg hover:bg-[#d8a882] transition-all group"
              >
                <span>POSTULAR MI RESTAURANTE</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.a>

              <span className="text-[11px] font-semibold text-zinc-500 mt-3 block">
                Proceso de curaduría de 48 horas · Sin costo de apertura
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default BusinessCTASection;
