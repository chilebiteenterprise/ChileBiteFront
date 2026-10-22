import React, { useState, useEffect } from "react";
import { Cookie, X } from "lucide-react";

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem("chilebite_cookie_consent");
      if (!consent) {
        // Mostrar con un leve retraso para suavizar la animación
        const timer = setTimeout(() => setIsVisible(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch (e) {
      // Ignorar errores de localStorage en entornos restringidos
    }
  }, []);

  const handleAccept = (type = "all") => {
    try {
      localStorage.setItem("chilebite_cookie_consent", type);
    } catch (e) {
      // Silencioso
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      role="region"
      aria-label="Aviso de cookies y consentimiento"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-500"
    >
      <div className="relative p-5 rounded-3xl bg-neutral-900/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-amber-500/20 shadow-[0_10px_40px_rgba(0,0,0,0.5)] text-zinc-100 flex flex-col gap-3.5">
        {/* Glow sutil de marca */}
        <div className="pointer-events-none absolute -top-10 -right-10 w-32 h-32 bg-[#b08968]/20 rounded-full blur-2xl" />

        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#b08968]/20 text-[#f0a262] flex items-center justify-center shrink-0">
              <Cookie className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold tracking-tight text-white">
              Privacidad y Cookies
            </h4>
          </div>

          <button
            type="button"
            onClick={() => handleAccept("necessary")}
            className="text-zinc-400 hover:text-white transition-colors p-1"
            aria-label="Cerrar aviso de cookies"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-zinc-300 leading-relaxed">
          En ChileBite utilizamos cookies propias y de socios asociados (como{" "}
          <strong className="text-[#f0a262]">Google AdSense</strong>) para
          personalizar anuncios, contenido y analizar nuestro tráfico. Conoce más en nuestra{" "}
          <a
            href="/privacidad#cookies"
            className="text-[#f0a262] underline hover:text-amber-300 transition-colors"
          >
            Política de Privacidad
          </a>
          .
        </p>

        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={() => handleAccept("necessary")}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            Solo esenciales
          </button>

          <button
            type="button"
            onClick={() => handleAccept("all")}
            className="px-4 py-1.5 rounded-xl text-xs font-bold text-neutral-950 bg-gradient-to-r from-amber-500 to-[#f0a262] hover:brightness-110 shadow-sm transition-all"
          >
            Aceptar todas
          </button>
        </div>
      </div>
    </div>
  );
}
