import sharp from 'sharp';
import * as assets from '@ribocarrew/sandboxmodellen-assets';
import fs from 'fs';
import path from 'path';

fs.mkdirSync('./src/assets', { recursive: true });
fs.mkdirSync('./public', { recursive: true });

const assetModule = (assets.default || assets);

const jobs = [
  // Webheader: vises ~48px, leveres @2x for skarphed på retina
  { src: assetModule.LOGO_SIMPELT,        out: './src/assets/logo-header.webp', w: 96,  fmt: 'webp' },
  { src: assetModule.LOGO_SIMPELT,        out: './src/assets/logo-header.png',  w: 96,  fmt: 'png'  }, // fallback
  // Favicon + apple-touch
  { src: assetModule.LOGO_MINIMALT,       out: './public/favicon-32.png',      w: 32,  fmt: 'png'  },
  { src: assetModule.LOGO_MINIMALT,       out: './public/favicon-180.png',     w: 180, fmt: 'png'  },
  // Print: håndtegnet variant, øverst på arbejdsarket
  { src: assetModule.LOGO_SIMPELT_HANDSON,  out: './src/assets/logo-print.png',     w: 200, fmt: 'png' },
  { src: assetModule.LOGO_MINIMALT_HANDSON, out: './src/assets/logo-print-lille.png', w: 60, fmt: 'png' },
];

(async () => {
  try {
    for (const j of jobs) {
      if (!j.src || !fs.existsSync(j.src)) {
        console.warn(`Source not found for job: ${j.src}`);
        continue;
      }
      let p = sharp(j.src).resize({ width: j.w });
      p = j.fmt === 'webp' ? p.webp({ quality: 90 }) : p.png({ compressionLevel: 9 });
      await p.toFile(j.out);
      console.log(`Generated: ${j.out}`);
    }
    console.log('All brand assets prepared successfully!');
  } catch (err) {
    console.error('Error preparing assets:', err);
  }
})();
