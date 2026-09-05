const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const publicDir = path.join(rootDir, 'public');
const appDir = path.join(rootDir, 'app');

const d = 'M 18.92 8.5 C 15.03 2.65, 7.23 6.55, 8.2 17.27 C 9.18 27.99, 17.95 28.96, 20.87 21.16 C 22.33 15.32, 20.39 10.45, 18.44 10.45 C 16.49 10.45, 16.0 14.34, 17.95 18.24 C 18.92 20.19, 20.87 21.16, 23.8 19.22';

// Master 32x32 SVG (Cream Paper + Charcoal Ink)
const svgCream = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <defs>
    <path id="o" d="${d}" fill="none" stroke="#1A1A1A" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" />
  </defs>
  <rect x="1" y="1" width="30" height="30" rx="7" fill="#FFFCF2" stroke="#E6E1D5" stroke-width="1" />
  <g opacity="0.96">
    <use href="#o" x="-0.30" y="0.30" />
    <use href="#o" x="-0.15" y="0.15" />
    <use href="#o" x="0.00" y="0.00" />
    <use href="#o" x="0.15" y="-0.15" />
    <use href="#o" x="0.30" y="-0.30" />
  </g>
</svg>`;

// Scalable 100x100 SVG for High-Res Icons (180, 192, 512)
function getCreamHighResSvg(size) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${size}" height="${size}">
  <rect width="100" height="100" fill="#FFFCF2" />
  <rect x="3" y="3" width="94" height="94" rx="22" fill="#FFFCF2" stroke="#E2DDD1" stroke-width="3" />
  <defs>
    <path id="o-hr" d="M 59.1 26.6 C 47.0 8.3, 22.6 20.5, 25.6 54.0 C 28.7 87.5, 56.1 90.5, 65.2 66.1 C 69.8 47.9, 63.7 32.7, 57.6 32.7 C 51.5 32.7, 50.0 44.8, 56.1 57.0 C 59.1 63.1, 65.2 66.1, 74.4 60.1" fill="none" stroke="#1A1A1A" stroke-width="4.1" stroke-linecap="round" stroke-linejoin="round" />
  </defs>
  <g opacity="0.98">
    <use href="#o-hr" x="-1.0" y="1.0" />
    <use href="#o-hr" x="-0.5" y="0.5" />
    <use href="#o-hr" x="0.0" y="0.0" />
    <use href="#o-hr" x="0.5" y="-0.5" />
    <use href="#o-hr" x="1.0" y="-1.0" />
  </g>
</svg>`;
}

async function generate() {
  console.log('--- Generating Ode Brand Favicons & Icons (Cream & Ink) ---');

  // 1. Render PNGs for ICO packaging (16, 32, 48)
  const tmp16 = path.join(publicDir, 'tmp-16.png');
  const tmp32 = path.join(publicDir, 'tmp-32.png');
  const tmp48 = path.join(publicDir, 'tmp-48.png');

  await sharp(Buffer.from(svgCream)).resize(16, 16).png().toFile(tmp16);
  await sharp(Buffer.from(svgCream)).resize(32, 32).png().toFile(tmp32);
  await sharp(Buffer.from(svgCream)).resize(48, 48).png().toFile(tmp48);

  // 2. Render Apple Touch Icon (180x180)
  const appleTouchPathPub = path.join(publicDir, 'apple-touch-icon.png');
  const appleTouchPathApp = path.join(appDir, 'apple-icon.png');
  const appleSvg = getCreamHighResSvg(180);
  await sharp(Buffer.from(appleSvg)).resize(180, 180).png().toFile(appleTouchPathPub);
  fs.copyFileSync(appleTouchPathPub, appleTouchPathApp);
  console.log('[OK] Created Apple Touch Icon (180x180)');

  // 3. Render PWA icons (192x192 & 512x512)
  const icon192Path = path.join(publicDir, 'icon-192.png');
  const icon512Path = path.join(publicDir, 'icon-512.png');
  await sharp(Buffer.from(getCreamHighResSvg(192))).resize(192, 192).png().toFile(icon192Path);
  await sharp(Buffer.from(getCreamHighResSvg(512))).resize(512, 512).png().toFile(icon512Path);
  console.log('[OK] Created PWA Icons (192x192, 512x512)');

  // 4. Create multi-resolution ICO via pack_ico.py
  execSync(`python scripts/pack_ico.py`, { cwd: rootDir, stdio: 'inherit' });

  // Clean up temporary files
  fs.unlinkSync(tmp16);
  fs.unlinkSync(tmp32);
  fs.unlinkSync(tmp48);

  console.log('--- All favicon and icon assets successfully generated! ---');
}

generate().catch(err => {
  console.error('Error generating favicons:', err);
  process.exit(1);
});
