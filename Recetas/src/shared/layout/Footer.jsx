import React from "react";
import {
  ChefHat,
  Instagram,
  Youtube,
  Mail,
  MapPin,
  ArrowUp,
  Heart,
  Compass,
  Bookmark,
  UtensilsCrossed,
} from "lucide-react";
import CookieConsent from "@/shared/ui/CookieConsent";

export default function Footer() {
  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const exploreLinks = [
    { label: "Recetas Tradicionales", href: "/recipes" },
    { label: "Calculadora de Macros", href: "/calculadora" },
    { label: "Marketplace de Productos", href: "/marketplace" },
    { label: "La Ruta Gastronómica", href: "/blog" },
  ];

  const communityLinks = [
    { label: "Mi Perfil", href: "/profile" },
    { label: "Ajustes de Cuenta", href: "/profile/settings" },
    { label: "Explorar la Galería", href: "/recipes" },
  ];

  const legalLinks = [
    { label: "Términos de Uso", href: "/terminos" },
    { label: "Política de Privacidad", href: "/privacidad" },
    { label: "Soporte y Contacto", href: "mailto:contacto@chilebite.cl" },
  ];

  return (
    <footer className="relative mt-auto w-full bg-gradient-to-b from-[#fdf9f4] via-white to-[#fbf6ef] dark:from-[#19191f] dark:via-[#16161b] dark:to-[#121216] border-t border-border-subtle dark:border-zinc-800 transition-colors duration-300 overflow-hidden">
      {/* Top radiant glow line with soft drop-shadow */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#7a461b]/60 dark:via-[#f0a262]/70 to-transparent shadow-[0_0_16px_rgba(122,70,27,0.45)] dark:shadow-[0_0_20px_rgba(240,162,98,0.5)] z-10" />

      {/* Primary central ambient glow halo (only the middle light) */}
      <div className="pointer-events-none absolute -top-28 left-1/2 -translate-x-1/2 w-[650px] sm:w-[950px] h-[260px] bg-gradient-to-b from-[#eabe9b]/55 via-[#d4a373]/30 to-transparent dark:from-[#f0a262]/20 dark:via-[#f0a262]/5 dark:to-transparent rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 z-10">
        {/* ─── Main Footer Columns ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-14 border-b border-border-subtle dark:border-zinc-800/80">
          {/* Brand Info (Cols 1-5) */}
          <div className="lg:col-span-5 space-y-4">
            <a href="/" className="inline-flex items-center gap-3 group">
              <div className="w-11 h-11 rounded-2xl bg-brand-primary/10 dark:bg-[#f0a262]/15 flex items-center justify-center text-brand-primary dark:text-[#f0a262] transition-transform duration-300 group-hover:scale-105 group-hover:rotate-6 shadow-sm">
                <ChefHat className="w-6 h-6" />
              </div>
              <span className="text-2xl font-black tracking-tight text-text-main">
                Chile<span className="text-brand-primary dark:text-[#f0a262]">Bite</span>
              </span>
            </a>

            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-md pt-1">
              La plataforma culinaria que reúne la tradición, picadas históricas y nuevas recetas de Chile. Diseñada para apasionados de nuestra cocina y amantes del buen sabor.
            </p>

            {/* Social icons */}
            <div className="pt-2">
              <p className="text-xs font-bold uppercase tracking-wider text-text-muted/70 dark:text-zinc-500 mb-3">
                Síguenos en redes
              </p>
              <div className="flex items-center gap-2.5">
                <a
                  href="https://www.instagram.com/chilebite.channel?utm_source=qr&igsh=aGpkczc4aWp2dGg%3D"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram de ChileBite"
                  className="w-10 h-10 rounded-2xl flex items-center justify-center bg-surface-muted/60 dark:bg-[#202026] text-text-muted dark:text-zinc-400 hover:text-white hover:bg-gradient-to-tr hover:from-amber-600 hover:to-pink-600 border border-border-subtle dark:border-zinc-800 hover:border-transparent transition-all duration-300 hover:scale-110 shadow-2xs"
                >
                  <Instagram className="w-4 h-4" />
                </a>

                <a
                  href="https://www.tiktok.com/@chilebite_tk?is_from_webapp=1&sender_device=pc"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok de ChileBite"
                  className="w-10 h-10 rounded-2xl flex items-center justify-center bg-surface-muted/60 dark:bg-[#202026] text-text-muted dark:text-zinc-400 hover:text-white hover:bg-black dark:hover:bg-zinc-700 border border-border-subtle dark:border-zinc-800 hover:border-transparent transition-all duration-300 hover:scale-110 shadow-2xs"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 448 512">
                    <path d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z" />
                  </svg>
                </a>

                <a
                  href="https://youtube.com/@chilebite.channel?si=nl7r_XeXHuXzAevG"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube de ChileBite"
                  className="w-10 h-10 rounded-2xl flex items-center justify-center bg-surface-muted/60 dark:bg-[#202026] text-text-muted dark:text-zinc-400 hover:text-white hover:bg-red-600 border border-border-subtle dark:border-zinc-800 hover:border-transparent transition-all duration-300 hover:scale-110 shadow-2xs"
                >
                  <Youtube className="w-4 h-4" />
                </a>

                <a
                  href="#"
                  aria-label="X / Twitter de ChileBite"
                  className="w-10 h-10 rounded-2xl flex items-center justify-center bg-surface-muted/60 dark:bg-[#202026] text-text-muted dark:text-zinc-400 hover:text-white hover:bg-zinc-900 border border-border-subtle dark:border-zinc-800 hover:border-transparent transition-all duration-300 hover:scale-110 shadow-2xs"
                >
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Explorar (Cols 6-7) */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-black uppercase tracking-wider text-text-main flex items-center gap-2 mb-4">
              <Compass className="w-4 h-4 text-brand-primary dark:text-[#f0a262]" />
              Explorar
            </h3>
            <ul className="space-y-2.5">
              {exploreLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-brand-primary dark:hover:text-[#f0a262] transition-all duration-200 inline-flex items-center gap-1.5 group font-medium"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-border-strong dark:bg-zinc-700 transition-colors group-hover:bg-brand-primary dark:group-hover:bg-[#f0a262]" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Comunidad (Cols 8-9) */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-black uppercase tracking-wider text-text-main flex items-center gap-2 mb-4">
              <Bookmark className="w-4 h-4 text-brand-primary dark:text-[#f0a262]" />
              Comunidad
            </h3>
            <ul className="space-y-2.5">
              {communityLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-brand-primary dark:hover:text-[#f0a262] transition-all duration-200 inline-flex items-center gap-1.5 group font-medium"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-border-strong dark:bg-zinc-700 transition-colors group-hover:bg-brand-primary dark:group-hover:bg-[#f0a262]" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto & Ubicación (Cols 10-12) */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="text-sm font-black uppercase tracking-wider text-text-main flex items-center gap-2 mb-4">
              <UtensilsCrossed className="w-4 h-4 text-brand-primary dark:text-[#f0a262]" />
              Contacto
            </h3>

            {/* Email Card */}
            <a
              href="mailto:contacto@chilebite.cl"
              className="flex items-center gap-3 p-3.5 rounded-2xl bg-surface-muted/40 dark:bg-[#202026] border border-border-subtle dark:border-zinc-800/80 hover:border-brand-primary/40 dark:hover:border-[#f0a262]/40 transition-all group"
            >
              <div className="w-9 h-9 rounded-xl bg-brand-primary/10 dark:bg-[#f0a262]/15 text-brand-primary dark:text-[#f0a262] flex items-center justify-center shrink-0 transition-transform group-hover:scale-110">
                <Mail className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Escríbenos
                </p>
                <p className="text-xs font-bold text-zinc-900 dark:text-zinc-200 truncate group-hover:text-brand-primary dark:group-hover:text-[#f0a262]">
                  contacto@chilebite.cl
                </p>
              </div>
            </a>

            {/* Location Card */}
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-surface-muted/40 dark:bg-[#202026] border border-border-subtle dark:border-zinc-800/80">
              <div className="w-9 h-9 rounded-xl bg-brand-primary/10 dark:bg-[#f0a262]/15 text-brand-primary dark:text-[#f0a262] flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Ubicación
                </p>
                <p className="text-xs font-bold text-zinc-900 dark:text-zinc-200">
                  Las Cabras, Valle de Cachapoal 🇨🇱
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Bottom Bar ─── */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6 text-xs text-zinc-600 dark:text-zinc-400 font-medium">
            <span>© {new Date().getFullYear()} ChileBite. Todos los derechos reservados.</span>
            <div className="flex items-center gap-4">
              {legalLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="hover:text-brand-primary dark:hover:text-[#f0a262] transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs text-zinc-600 dark:text-zinc-400 font-medium flex items-center gap-1.5">
              Hecho con <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 animate-pulse" /> para los amantes del sabor chileno
            </span>

            {/* Scroll to Top button */}
            <button
              type="button"
              onClick={scrollToTop}
              title="Volver arriba"
              aria-label="Volver arriba"
              className="w-8 h-8 rounded-xl bg-surface-muted dark:bg-[#202026] border border-border-subtle dark:border-zinc-700/80 text-zinc-600 dark:text-zinc-400 hover:text-brand-primary dark:hover:text-[#f0a262] hover:border-brand-primary/50 dark:hover:border-[#f0a262]/50 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-2xs"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Banner de consentimiento de cookies y políticas (AdSense & privacidad) */}
      <CookieConsent />
    </footer>
  );
}
