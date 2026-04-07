const fs = require('fs');
const path = require('path');

// Simple HTML to PNG conversion using puppeteer
// Run: node scripts/convert-og-image.js

const svgContent = fs.readFileSync(
  path.join(__dirname, '../public/og-image.svg'),
  'utf-8'
);

const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { margin: 0; padding: 0; }
    svg { display: block; }
  </style>
</head>
<body>
  ${svgContent}
</body>
</html>
`;

console.log('SVG file created at: public/og-image.svg');
console.log('');
console.log('To convert to JPG (1200x630), you have 3 options:');
console.log('');
console.log('Option 1: Use an online converter');
console.log('  - Upload public/og-image.svg to https://convertio.co/svg-jpg/');
console.log('  - Set size to 1200x630');
console.log('  - Download and save as public/og-image.jpg');
console.log('');
console.log('Option 2: Use ImageMagick (if installed)');
console.log('  magick convert public/og-image.svg -resize 1200x630 public/og-image.jpg');
console.log('');
console.log('Option 3: Use Figma/Sketch');
console.log('  - Import the SVG');
console.log('  - Export as JPG 1200x630');
console.log('');
console.log('Note: Next.js can serve SVG directly, but some platforms prefer JPG for OG images.');
