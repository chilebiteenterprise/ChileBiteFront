import { e as createAstro, c as createComponent, b as renderTemplate, d as addAttribute } from './astro/server_BVc79SrO.mjs';
import 'piccolore';
import 'clsx';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro = createAstro("https://chilebite.cl");
const $$BaseHead = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$BaseHead;
  const {
    title = "ChileBite \u2013 Descubre, Aprende y Comparte",
    description = "ChileBite es la plataforma gastron\xF3mica chilena para explorar recetas paso a paso, calcular macronutrientes, descubrir restaurantes y conectar con una comunidad apasionada por la cocina.",
    image = "https://chilebite.cl/images/Titulo.webp",
    canonicalURL = "https://chilebite.cl/"
  } = Astro2.props;
  return renderTemplate(_a || (_a = __template(['<!-- \u2500\u2500 Caracteres & Viewport \u2500\u2500 --><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><!-- \u2500\u2500 Favicon \u2500\u2500 --><link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="shortcut icon" href="/favicon.svg"><link rel="apple-touch-icon" href="/favicon.svg"><!-- \u2500\u2500 SEO Primario \u2500\u2500 --><title>', '</title><meta name="title"', '><meta name="description"', '><meta name="author" content="Chrystopher Silva, Miguel Escobar"><meta name="robots" content="index, follow"><link rel="canonical"', '><!-- \u2500\u2500 Open Graph / Facebook \u2500\u2500 --><meta property="og:type" content="website"><meta property="og:url"', '><meta property="og:title"', '><meta property="og:description"', '><meta property="og:image"', '><meta property="og:site_name" content="ChileBite"><meta property="og:locale" content="es_CL"><!-- \u2500\u2500 Twitter \u2500\u2500 --><meta property="twitter:card" content="summary_large_image"><meta property="twitter:url"', '><meta property="twitter:title"', '><meta property="twitter:description"', '><meta property="twitter:image"', '><!-- \u2500\u2500 Estilos & Fuentes Externas \u2500\u2500 --><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"><!-- \u2500\u2500 Theme & PWA hints \u2500\u2500 --><meta name="theme-color" content="#b08968"><!-- \u2500\u2500 Google AdSense \u2500\u2500 --><meta name="google-adsense-account" content="ca-pub-4855312501819907"><script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4855312501819907" crossorigin="anonymous"><\/script><!-- \u2500\u2500 FOUC (Flash of Unstyled Content) Prevention \u2500\u2500 --><script>\n  const theme = (() => {\n    if (typeof localStorage !== "undefined" && localStorage.getItem("theme")) {\n      return localStorage.getItem("theme");\n    }\n    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {\n      return "dark";\n    }\n    return "light";\n  })();\n  if (theme === "dark") {\n    document.documentElement.classList.add("dark");\n  } else {\n    document.documentElement.classList.remove("dark");\n  }\n<\/script>'])), title, addAttribute(title, "content"), addAttribute(description, "content"), addAttribute(canonicalURL, "href"), addAttribute(Astro2.url, "content"), addAttribute(title, "content"), addAttribute(description, "content"), addAttribute(image, "content"), addAttribute(Astro2.url, "content"), addAttribute(title, "content"), addAttribute(description, "content"), addAttribute(image, "content"));
}, "C:/Users/chrys/Documents/Github/ChileBite/ChileBiteFront/Recetas/src/shared/layout/BaseHead.astro", void 0);

export { $$BaseHead as $ };
