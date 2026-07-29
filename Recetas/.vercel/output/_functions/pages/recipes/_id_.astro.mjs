import { e as createAstro, c as createComponent, r as renderComponent, a as renderHead, b as renderTemplate } from '../../chunks/astro/server_BVc79SrO.mjs';
import 'piccolore';
/* empty css                                                 */
import { F as Footer } from '../../chunks/Footer_DDOCd-oA.mjs';
import { $ as $$BaseHead } from '../../chunks/BaseHead_D43xBHWL.mjs';
import { s as supabase } from '../../chunks/supabaseClient_BDzqifr1.mjs';
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro("https://chilebite.cl");
const prerender = false;
const $$id = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$id;
  const { id } = Astro2.params;
  let nombre = "Detalle de Receta";
  try {
    const { data } = await supabase.from("core_receta").select("nombre").eq("id", id).single();
    if (data && data.nombre) {
      nombre = data.nombre;
    }
  } catch (err) {
    console.error("Error obteniendo nombre de la receta en SSR:", err);
  }
  return renderTemplate`<html lang="es"> <head>${renderComponent($$result, "BaseHead", $$BaseHead, { "title": `${nombre} \u2013 ChileBite`, "description": `Aprende a preparar ${nombre} paso a paso con nuestra receta detallada.` })}${renderHead()}</head> ${renderComponent($$result, "Navbar", null, { "client:only": "react", "client:component-hydration": "only", "client:component-path": "@/shared/layout/Navbar", "client:component-export": "default" })} <!-- Wrapper normal debajo del navbar --> <main class="mt-20 flex-1 relative z-10 w-full min-h-[85vh]"> ${renderComponent($$result, "RecetaDetalle", null, { "idReceta": id, "client:only": "react", "client:component-hydration": "only", "client:component-path": "@/features/recipes/components/RecipeDetail", "client:component-export": "default" })} <div className="max-w-[1400px] mx-auto w-full px-4 lg:px-8"> ${renderComponent($$result, "AffiliateCarousel", null, { "client:only": "react", "client:component-hydration": "only", "client:component-path": "@/shared/ui/AffiliateCarousel", "client:component-export": "default" })} </div> <div class="max-w-[1400px] mx-auto w-full px-4 lg:px-8 pb-16"> ${renderComponent($$result, "CommentSection", null, { "recipeId": id, "client:only": "react", "client:component-hydration": "only", "client:component-path": "@/features/comments/components/CommentSection", "client:component-export": "default" })} </div> </main> ${renderComponent($$result, "Footer", Footer, {})} </html>`;
}, "C:/Users/chrys/Documents/Github/ChileBite/ChileBiteFront/Recetas/src/pages/recipes/[id].astro", void 0);

const $$file = "C:/Users/chrys/Documents/Github/ChileBite/ChileBiteFront/Recetas/src/pages/recipes/[id].astro";
const $$url = "/recipes/[id]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$id,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
