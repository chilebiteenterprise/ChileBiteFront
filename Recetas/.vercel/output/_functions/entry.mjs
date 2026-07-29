import { renderers } from './renderers.mjs';
import { c as createExports, s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_Q1SinoZz.mjs';
import { manifest } from './manifest_dPomrdQp.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/admin/ingredient-manager.astro.mjs');
const _page2 = () => import('./pages/admin/recipe-editor.astro.mjs');
const _page3 = () => import('./pages/admin/taxonomy-manager.astro.mjs');
const _page4 = () => import('./pages/api/copilot.astro.mjs');
const _page5 = () => import('./pages/auth/forgot-password.astro.mjs');
const _page6 = () => import('./pages/auth/register.astro.mjs');
const _page7 = () => import('./pages/auth/reset-password.astro.mjs');
const _page8 = () => import('./pages/blog.astro.mjs');
const _page9 = () => import('./pages/blog/_---slug_.astro.mjs');
const _page10 = () => import('./pages/calculadora.astro.mjs');
const _page11 = () => import('./pages/locales.astro.mjs');
const _page12 = () => import('./pages/profile/collection.astro.mjs');
const _page13 = () => import('./pages/profile/settings.astro.mjs');
const _page14 = () => import('./pages/profile.astro.mjs');
const _page15 = () => import('./pages/recipes/_id_.astro.mjs');
const _page16 = () => import('./pages/recipes.astro.mjs');
const _page17 = () => import('./pages/settings.astro.mjs');
const _page18 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/admin/ingredient-manager.astro", _page1],
    ["src/pages/admin/recipe-editor.astro", _page2],
    ["src/pages/admin/taxonomy-manager.astro", _page3],
    ["src/pages/api/copilot.js", _page4],
    ["src/pages/auth/forgot-password.astro", _page5],
    ["src/pages/auth/register.astro", _page6],
    ["src/pages/auth/reset-password.astro", _page7],
    ["src/pages/blog/index.astro", _page8],
    ["src/pages/blog/[...slug].astro", _page9],
    ["src/pages/calculadora.astro", _page10],
    ["src/pages/locales.astro", _page11],
    ["src/pages/profile/collection.astro", _page12],
    ["src/pages/profile/settings.astro", _page13],
    ["src/pages/profile/index.astro", _page14],
    ["src/pages/recipes/[id].astro", _page15],
    ["src/pages/recipes/index.astro", _page16],
    ["src/pages/settings.astro", _page17],
    ["src/pages/index.astro", _page18]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./noop-entrypoint.mjs'),
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "middlewareSecret": "e1396ca7-6a5b-44d0-bbfc-746586e4bbde",
    "skewProtection": false
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;
const _start = 'start';
if (Object.prototype.hasOwnProperty.call(serverEntrypointModule, _start)) ;

export { __astrojsSsrVirtualEntry as default, pageMap };
