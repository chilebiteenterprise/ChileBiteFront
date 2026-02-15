// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import tailwindcss from '@tailwindcss/vite'; // Importa el plugin de Vite para Tailwind
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  // Tienes configurado el output para SSR con Node
  output: 'server', 
  
  adapter: node({
    mode: 'standalone', 
  }),
  
  // MODIFICAMOS EL BLOQUE VITE
  vite: {
    // 1. Añadimos el plugin de Tailwind CSS aquí
    plugins: [tailwindcss()],
    // 2. Quitamos 'resolve: { preserveSymlinks: true }' y el bloque 'css' si no es estrictamente necesario, 
    //    ya que HeroUI debería funcionar solo con el plugin de Tailwind.
  },

  // 3. Integración de React, ¡Correcto!
  integrations: [react()]
});