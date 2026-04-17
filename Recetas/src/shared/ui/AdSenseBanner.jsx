import { useEffect, useRef } from 'react';

/**
 * Componente Google AdSense para ChileBite.
 *
 * ──────────────────────────────────────────────
 *  SETUP (una sola vez):
 *  1. Ve a https://adsense.google.com y crea tu cuenta
 *  2. Añade chilebite.vercel.app como sitio
 *  3. Google te dará un "Publisher ID" con formato: ca-pub-XXXXXXXXXXXXXXXX
 *  4. Reemplaza REEMPLAZA_CON_TU_ID en src/pages/index.astro (script global)
 *  5. Una vez aprobado, crea bloques de anuncio y usa su "data-ad-slot" aquí
 * ──────────────────────────────────────────────
 *
 * Props:
 *   slot       string  - El data-ad-slot de tu bloque (desde adsense.google.com)
 *   format     string  - 'auto' | 'rectangle' | 'horizontal' | 'vertical'
 *   className  string  - clases Tailwind adicionales para el contenedor
 *
 *  Publisher ID activo: ca-pub-4855312501819907
 */
export default function AdSenseBanner({
  slot = 'REEMPLAZA_CON_TU_SLOT',
  format = 'auto',
  className = '',
}) {
  const adRef = useRef(null);
  const pushed = useRef(false);

  useEffect(() => {
    // Solo ejecutar una vez y solo cuando AdSense esté cargado
    if (pushed.current) return;
    try {
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        pushed.current = true;
      }
    } catch (e) {
      // AdSense aún no está cargado o bloqueado por AdBlocker
    }
  }, []);

  // No renderizar en modo desarrollo para no generar impresiones inválidas
  if (import.meta.env.DEV) {
    return (
      <div
        className={`flex items-center justify-center rounded-2xl border-2 border-dashed border-[#b08968]/30 bg-[#b08968]/5 text-[#b08968]/50 text-xs font-semibold py-4 ${className}`}
      >
        [Anuncio AdSense — solo visible en producción]
      </div>
    );
  }

  return (
    <div className={`overflow-hidden ${className}`} ref={adRef}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-4855312501819907"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
