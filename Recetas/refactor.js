import fs from 'node:fs';
import path from 'node:path';

const srcDir = path.join(import.meta.dirname, 'src');

const replacements = [
  { old: 'Comentarios', new: 'CommentSection', oldPathRegex: /['"]\.\.?\/.*components\/Recetario\/Comentarios(\.jsx)?['"]/g, newPath: "'@/features/comments/components/CommentSection'" },
  { old: 'DetalleReceta', new: 'RecipeDetail', oldPathRegex: /['"]\.\.?\/.*components\/Recetario\/DetalleReceta(\.jsx)?['"]/g, newPath: "'@/features/recipes/components/RecipeDetail'" },
  { old: 'Filtros', new: 'RecipeFilters', oldPathRegex: /['"]\.\.?\/.*components\/Recetario\/Filtros(\.jsx)?['"]/g, newPath: "'@/features/recipes/components/RecipeFilters'" },
  { old: 'IngredientesSelector', new: 'IngredientSelector', oldPathRegex: /['"]\.\.?\/.*components\/Recetario\/IngredientesSelector(\.jsx)?['"]/g, newPath: "'@/features/recipes/components/IngredientSelector'" },
  { old: 'RecetaCard', new: 'RecipeCard', oldPathRegex: /['"]\.\.?\/.*components\/Recetario\/RecetaCard(\.jsx)?['"]/g, newPath: "'@/features/recipes/components/RecipeCard'" },
  { old: 'RecetaForm', new: 'RecipeEditor', oldPathRegex: /['"]\.\.?\/.*components\/Recetario\/RecetaForm(\.jsx)?['"]/g, newPath: "'@/features/recipes/components/RecipeEditor'" },
  { old: 'RecetarioToolBar', new: 'RecipeToolbar', oldPathRegex: /['"]\.\.?\/.*components\/Recetario\/RecetarioToolBar(\.jsx)?['"]/g, newPath: "'@/features/recipes/components/RecipeToolbar'" },
  { old: 'Recetario', new: 'RecipeGrid', oldPathRegex: /['"]\.\.?\/.*components\/Recetario\/Recetario(\.jsx)?['"]/g, newPath: "'@/features/recipes/components/RecipeGrid'" },
  { old: 'TaxonomiasAdmin', new: 'TaxonomyManager', oldPathRegex: /['"]\.\.?\/.*components\/Recetario\/TaxonomiasAdmin(\.jsx)?['"]/g, newPath: "'@/features/admin/components/TaxonomyManager'" },
  { old: 'Profile', new: 'UserProfile', oldPathRegex: /['"]\.\.?\/.*components\/Perfil\/Profile(\.jsx)?['"]/g, newPath: "'@/features/profiles/components/UserProfile'" },
  { old: 'EditProfileModal', new: 'EditProfileModal', oldPathRegex: /['"]\.\.?\/.*components\/Perfil\/EditProfileModal(\.jsx)?['"]/g, newPath: "'@/features/profiles/components/EditProfileModal'" },
  { old: 'SettingsModal', new: 'SettingsModal', oldPathRegex: /['"]\.\.?\/.*components\/Perfil\/SettingsModal(\.jsx)?['"]/g, newPath: "'@/features/profiles/components/SettingsModal'" },
  { old: 'SettingsPage', new: 'SettingsPage', oldPathRegex: /['"]\.\.?\/.*components\/Configuracion\/SettingsPage(\.jsx)?['"]/g, newPath: "'@/features/settings/components/SettingsPage'" },
  { old: 'Login', new: 'Login', oldPathRegex: /['"]\.\.?\/.*components\/Formularios\/Login(\.jsx)?['"]/g, newPath: "'@/features/auth/components/Login'" },
  { old: 'ResetPassword', new: 'ResetPassword', oldPathRegex: /['"]\.\.?\/.*components\/Formularios\/ResetPassword(\.jsx)?['"]/g, newPath: "'@/features/auth/components/ResetPassword'" },
  { old: 'Loader', new: 'Loader', oldPathRegex: /['"]\.\.?\/.*components\/Botones\/Loader(\.jsx)?['"]/g, newPath: "'@/shared/ui/Loader'" },
  { old: 'DetalleRecetaDarck', new: 'RecipeDetailDark', oldPathRegex: /['"]\.\.?\/.*components\/Locales\/DetalleRecetaDarck(\.jsx)?['"]/g, newPath: "'@/features/recipes/components/RecipeDetailDark'" },
  { old: 'Navbar', new: 'Navbar', oldPathRegex: /['"]\.\.?\/.*layouts\/Navbar(\.jsx)?['"]/g, newPath: "'@/shared/layout/Navbar'" },
  { old: 'Footer', new: 'Footer', oldPathRegex: /['"]\.\.?\/.*layouts\/Footer(\.jsx)?['"]/g, newPath: "'@/shared/layout/Footer'" },
  { old: 'AuthContext', new: 'AuthContext', oldPathRegex: /['"]\.\.?\/.*context\/AuthContext(\.jsx)?['"]/g, newPath: "'@/features/auth/context/AuthContext'" }
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (file.endsWith('.jsx') || file.endsWith('.astro') || file.endsWith('.js') || file.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;

      for (const rep of replacements) {
        // Replace imports path
        if (content.match(rep.oldPathRegex)) {
          content = content.replace(rep.oldPathRegex, rep.newPath);
          changed = true;
        }

        // Replace component names if changed
        if (rep.old !== rep.new) {
          // Replace "import Old from"
          const importRegex = new RegExp(`import\\s+${rep.old}\\s+from`, 'g');
          if (importRegex.test(content)) {
            content = content.replace(importRegex, `import ${rep.new} from`);
            changed = true;
          }

          // Replace JSX Tags <Old ... /> or <Old>
          const jsxRegex1 = new RegExp(`<${rep.old}(\\s|>)`, 'g');
          if (jsxRegex1.test(content)) {
            content = content.replace(jsxRegex1, `<${rep.new}$1`);
            changed = true;
          }

          const jsxRegex2 = new RegExp(`</${rep.old}>`, 'g');
          if (jsxRegex2.test(content)) {
            content = content.replace(jsxRegex2, `</${rep.new}>`);
            changed = true;
          }
          
          // Replace object assignments / exports
          const varRegex = new RegExp(`\\b${rep.old}\\b`, 'g');
          if (varRegex.test(content)) {
             // For safety, only do this if we actually know it's a structural name (not generic text).
             // Since we already replaced tags and imports, it should be safe to swap the remaining direct references.
             content = content.replace(varRegex, rep.new);
             changed = true;
          }
        }
      }

      // Also fix CSS imports for things like RecetaCard.css (which we deleted)
      // Remove entirely if it exists
      if (content.includes("import './RecetaCard.css';")) {
        content = content.replace(/import '\.\/RecetaCard\.css';\n?/g, '');
        changed = true;
      }

      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

processDirectory(srcDir);
