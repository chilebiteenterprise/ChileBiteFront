import fs from 'node:fs';
import path from 'node:path';

const srcDir = path.join(import.meta.dirname, 'src');

const replacements = [
  { oldPathRegex: /['"](\.\.\/)+lib\/(.*?)['"]/g, newPath: "'@/lib/$2'" },
  { oldPathRegex: /['"]\.\.\/\.\.\/components\/RecipeGrid\/TaxonomyManager\.jsx['"]/g, newPath: "'@/features/admin/components/TaxonomyManager'" },
  { oldPathRegex: /['"]\.\.\/\.\.\/components\/Recetario\/TaxonomiasAdmin\.jsx['"]/g, newPath: "'@/features/admin/components/TaxonomyManager'" },
  { oldPathRegex: /['"]\.\.\/\.\.\/components\/Recetario\/RecetaForm\.jsx['"]/g, newPath: "'@/features/recipes/components/RecipeEditor'" }
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
        if (content.match(rep.oldPathRegex)) {
          content = content.replace(rep.oldPathRegex, rep.newPath);
          changed = true;
        }
      }

      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

processDirectory(srcDir);
