import { ShoppingBag, ExternalLink, Utensils } from 'lucide-react';

/**
 * ──────────────────────────────────────────────────────────────
 * MAPA DE UTENSILIOS DE COCINA CON LINKS DE AFILIADO
 * ──────────────────────────────────────────────────────────────
 * Cada entrada tiene:
 *   name    → Nombre visible al usuario
 *   tag     → Palabras clave para matchear con el tipo de receta
 *   amazon  → Link de afiliado Amazon Chile (pendiente)
 *   ml      → Link de afiliado MercadoLibre  (pendiente)
 *   icon    → Emoji para el card
 *
 * PENDIENTE: Reemplaza los campos ml con los links meli.la reales
 * ──────────────────────────────────────────────────────────────
 */


/**
 * Selecciona los utensilios más relevantes basándose en los
 * ingredientes/pasos de la receta (matching por palabras clave).
 * Si no hay match, retorna los 2 primeros por defecto.
 */
function selectRelevantTools(ingredients = [], steps = []) {
  const allText = [
    ...ingredients.map(i => i.data?.ingrediente?.nombre ?? i.text ?? ''),
    ...steps.map(s => s.text ?? ''),
  ]
    .join(' ')
    .toLowerCase();

  const scored = KITCHEN_TOOLS.map(tool => ({
    ...tool,
    score: tool.tag.filter(kw => allText.includes(kw)).length,
  }));

  const matched = scored.filter(t => t.score > 0).sort((a, b) => b.score - a.score);
  return matched.length > 0 ? matched.slice(0, 3) : KITCHEN_TOOLS.slice(0, 2);
}

// ──────────────────────────────────────────────────────────────
//  Componente principal
// ──────────────────────────────────────────────────────────────
export default function AffiliateLinks({ ingredients = [], steps = [] }) {
  const tools = selectRelevantTools(ingredients, steps);

  return (
    <div className="mt-8 premium-glass-panel rounded-[2rem] p-6 border border-slate-200 dark:border-zinc-800 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2.5 bg-[#b08968]/10 dark:bg-[#b08968]/20 rounded-xl">
          <Utensils className="w-5 h-5 text-[#b08968] dark:text-orange-200" />
        </div>
        <div>
          <h3 className="font-bold text-slate-800 dark:text-zinc-200 text-base leading-none">
            Equipa tu cocina
          </h3>
          <p className="text-xs text-slate-400 dark:text-orange-200/50 mt-0.5">
            Utensilios recomendados para esta receta
          </p>
        </div>
      </div>

      {/* Cards de utensilios */}
      <ul className="space-y-3">
        {tools.map((tool, idx) => (
          <li
            key={idx}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800"
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">{tool.icon}</span>
              <span className="text-sm font-semibold text-slate-700 dark:text-zinc-300">
                {tool.name}
              </span>
            </div>

            <div className="flex gap-2 shrink-0">
              {/* MercadoLibre — solo muestra si tiene link real */}
              {tool.ml !== 'https://meli.la/PENDIENTE' && (
                <a
                  href={tool.ml}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FFE600] hover:bg-[#f0d800] text-gray-900 text-xs font-bold transition-all hover:scale-105 shadow-sm"
                >
                  <ShoppingBag className="w-3 h-3" />
                  MercadoLibre
                </a>
              )}

              {/* Amazon Chile */}
              <a
                href={tool.amazon}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FF9900] hover:bg-[#e68a00] text-white text-xs font-bold transition-all hover:scale-105 shadow-sm"
              >
                <ExternalLink className="w-3 h-3" />
                Amazon
              </a>
            </div>
          </li>
        ))}
      </ul>

      {/* Disclaimer */}
      <p className="mt-4 text-[10px] text-slate-400 dark:text-orange-200/30 leading-relaxed text-center">
        ChileBite puede recibir una comisión si realizas una compra a través de estos
        enlaces, sin costo adicional para ti. Solo recomendamos utensilios, nunca
        alimentos.
      </p>
    </div>
  );
}
