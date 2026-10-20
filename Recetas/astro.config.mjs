import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';
import { createClient } from '@supabase/supabase-js';

// Obtenemos las credenciales para la compilación (con fallbacks)
const supabaseUrl = process.env.PUBLIC_SUPABASE_URL || 'https://tnzpojvhsxjzfachozid.supabase.co';
const supabaseKey = process.env.PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_rJKjnreA7A8lP_zTwgvGxw_FMciqFlo';

let recipeUrls = [];
try {
  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data, error } = await supabase
    .from('core_receta')
    .select('id');
    
  if (error) {
    console.error("Error al obtener recetas para el sitemap:", error.message);
  } else if (data) {
    recipeUrls = data.map(recipe => `https://chilebite.cl/recipes/${recipe.id}`);
  }
} catch (err) {
  console.error("Error al generar las páginas personalizadas para el sitemap:", err);
}

// https://astro.build/config
export default defineConfig({
  site: 'https://chilebite.cl',
  adapter: vercel(),
  build: {
    inlineStylesheets: 'always',
  },
  devToolbar: {
    enabled: false
  },

  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: ['dompurify', '@heroui/react', '@heroui/toast', 'lucide-react', '@supabase/supabase-js'],
    },
  },

  integrations: [
    react(),
    sitemap({
      customPages: recipeUrls,
    })
  ]
});