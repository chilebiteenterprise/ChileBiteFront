const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    if (fs.statSync(dirPath).isDirectory()) {
      walkDir(dirPath, callback);
    } else {
      callback(path.join(dir, f));
    }
  });
}

walkDir('./src', (filePath) => {
  if (filePath.endsWith('.jsx') || filePath.endsWith('.js') || filePath.endsWith('.astro')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // Replace "http://127...api/..." with ${import.meta.env.PUBLIC_API_URL}/api/...
    content = content.replace(/"http:\/\/(?:127\.0\.0\.1|localhost):8000([^"]+)"/g, '${import.meta.env.PUBLIC_API_URL}');
    
    // Replace 'http://127...api/...' with ${import.meta.env.PUBLIC_API_URL}/api/...
    content = content.replace(/'http:\/\/(?:127\.0\.0\.1|localhost):8000([^']+)'/g, '${import.meta.env.PUBLIC_API_URL}');
    
    // Replace backtick enclosed http://127... with  inside existing template literals
    content = content.replace(/http:\/\/(?:127\.0\.0\.1|localhost):8000/g, '');

    if (content !== original) {
      fs.writeFileSync(filePath, content);
      console.log('Fixed:', filePath);
    }
  }
});
