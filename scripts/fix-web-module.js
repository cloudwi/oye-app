const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'dist', 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

// script 태그에 type="module" 추가 (import.meta 호환)
html = html.replace(
  /<script src="(.*?)" defer><\/script>/g,
  '<script src="$1" type="module"></script>'
);

fs.writeFileSync(indexPath, html);
console.log('Fixed: Added type="module" to script tags in dist/index.html');
