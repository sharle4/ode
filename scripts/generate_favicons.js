const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const publicDir = path.join(rootDir, 'public');
const appDir = path.join(rootDir, 'app');

const d = 'M 19.71 6.48 C 14.76 -0.93, 4.88 4.01, 6.11 17.61 C 7.35 31.2, 18.47 32.44, 22.18 22.55 C 24.03 15.13, 21.56 8.95, 19.09 8.95 C 16.62 8.95, 16.0 13.9, 18.47 18.84 C 19.71 21.31, 22.18 22.55, 25.89 20.08';

// Light mode SVG (for transparent favicon frames: 16, 32, 48)
const svgInk = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <defs>
    <path id="o" d="${d}" fill="none" stroke="#141415" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" />
  </defs>
  <g opacity="0.96">
    <use href="#o" x="-0.36" y="0.36" />
    <use href="#o" x="-0.18" y="0.18" />
    <use href="#o" x="0.00" y="0.00" />
    <use href="#o" x="0.18" y="-0.18" />
    <use href="#o" x="0.36" y="-0.36" />
  </g>
</svg>`;

// Luxury Dark canvas SVG for Apple Touch Icon & PWA (180, 192, 512)
function getLuxuryBadgeSvg(size) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${size}" height="${size}">
  <rect width="100" height="100" fill="#09090b" />
  <defs>
    <path id="o-badge" d="M 59.7 24.4 C 44.7 0.8, 14.8 16.6, 18.5 57.4 C 22.2 98.2, 55.6 101.9, 66.7 72.2 C 72.3 50.0, 64.8 31.4, 57.4 31.4 C 50.0 31.4, 48.1 46.3, 55.6 61.1 C 59.3 68.5, 66.7 72.2, 77.8 64.8" fill="none" stroke="#FAF8F5" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round" />
  </defs>
  <g opacity="0.98">
    <use href="#o-badge" x="-1.2" y="1.2" />
    <use href="#o-badge" x="-0.6" y="0.6" />
    <use href="#o-badge" x="0.0" y="0.0" />
    <use href="#o-badge" x="0.6" y="-0.6" />
    <use href="#o-badge" x="1.2" y="-1.2" />
  </g>
</svg>`;
}

async function generate() {
  console.log('--- Generating Ode Brand Favicons & Icons ---');

  // 1. Render transparent PNGs for ICO packaging
  const tmp16 = path.join(rootDir, 'public', 'tmp-16.png');
  const tmp32 = path.join(rootDir, 'public', 'tmp-32.png');
  const tmp48 = path.join(rootDir, 'public', 'tmp-48.png');

  await sharp(Buffer.from(svgInk)).resize(16, 16).png().toFile(tmp16);
  await sharp(Buffer.from(svgInk)).resize(32, 32).png().toFile(tmp32);
  await sharp(Buffer.from(svgInk)).resize(48, 48).png().toFile(tmp48);

  // 2. Render Apple Touch Icon (180x180)
  const appleTouchPathPub = path.join(publicDir, 'apple-touch-icon.png');
  const appleTouchPathApp = path.join(appDir, 'apple-icon.png');
  const appleSvg = getLuxuryBadgeSvg(180);
  await sharp(Buffer.from(appleSvg)).resize(180, 180).png().toFile(appleTouchPathPub);
  fs.copyFileSync(appleTouchPathPub, appleTouchPathApp);
  console.log('✓ Created Apple Touch Icon (180x180)');

  // 3. Render PWA icons (192x192 & 512x512)
  const icon192Path = path.join(publicDir, 'icon-192.png');
  const icon512Path = path.join(publicDir, 'icon-512.png');
  await sharp(Buffer.from(getLuxuryBadgeSvg(192))).resize(192, 192).png().toFile(icon192Path);
  await sharp(Buffer.from(getLuxuryBadgeSvg(512))).resize(512, 512).png().toFile(icon512Path);
  console.log('✓ Created PWA Icons (192x192, 512x512)');

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
