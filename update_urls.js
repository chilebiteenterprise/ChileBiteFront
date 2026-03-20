const fs = require('fs');
const path = require('path');
const dir = path.resolve('c:/Users/chrys/Downloads/ChileBite/ChileBIteFront/Recetas/src');

const regex = /([ \t]*)const apiUrl = import\.meta\.env\.PUBLIC_API_URL \|\| "https:\/\/chilebiteback\.onrender\.com";/g;

function walk(directory) {
  let results = [];
  const list = fs.readdirSync(directory);
  list.forEach(file => {
    const filePath = path.join(directory, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(filePath));
    } else { 
      results.push(filePath);
    }
  });
  return results;
}

let updated = 0;
walk(dir).forEach(file => {
  if (file.endsWith('.jsx') || file.endsWith('.js') || file.endsWith('.astro')) {
    let content = fs.readFileSync(file, 'utf8');
    if (regex.test(content)) {
      const newContent = content.replace(regex, '$1const rawApiUrl = import.meta.env.PUBLIC_API_URL || "https://chilebiteback.onrender.com";\n$1const apiUrl = rawApiUrl?.startsWith("http") ? rawApiUrl : `https://${rawApiUrl}`;');
      fs.writeFileSync(file, newContent, 'utf8');
      console.log('Updated ' + file);
      updated++;
    }
  }
});

console.log(`Total files updated: ${updated}`);
