import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
await mkdir('public/textures', { recursive: true });
const n = 512;
const color = Buffer.alloc(n * n * 3), bump = Buffer.alloc(n * n);
// Periodic multiscale limestone grain. Entirely generated for this project.
for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
  const grain = Math.sin(x * 123.4 + y * 453.1) * Math.sin(y * 76.7 + x * 26.8);
  const strata = Math.sin(y * Math.PI / 32 + Math.sin(x * Math.PI / 64)) * .45;
  const cloud = Math.sin(x * Math.PI / 64) * Math.cos(y * Math.PI / 128) * .5;
  const noise = grain * 8 + strata * 8 + cloud * 12;
  const i = y * n + x;
  color[i * 3] = Math.round(190 + noise);
  color[i * 3 + 1] = Math.round(177 + noise);
  color[i * 3 + 2] = Math.round(153 + noise);
  bump[i] = Math.round(185 + grain * 22 + strata * 12);
}
await sharp(color, { raw: { width: n, height: n, channels: 3 } }).webp({ quality: 90 }).toFile('public/textures/limestone.webp');
await sharp(bump, { raw: { width: n, height: n, channels: 1 } }).png().toFile('public/textures/limestone-height.png');
console.log('Generated two 512² limestone texture maps.');
