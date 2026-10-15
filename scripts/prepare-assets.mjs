import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';

await mkdir('public/images', { recursive: true });
for (const [name, ext] of [['palmyra', 'jpg'], ['schmalz', 'jpg'], ['zenobia', 'png'], ['tiepolo', 'jpg']]) {
  await sharp(`public/images/${name}.${ext}`).resize({ width: 1920, withoutEnlargement: true }).webp({ quality: 86 }).toFile(`public/images/${name}.webp`);
}
await sharp('public/images/palmyra.jpg').resize(800).webp({ quality: 80 }).toFile('public/images/palmyra-small.webp');
// The original CNG photograph has two faces side by side. Both derivative
// textures retain CC BY-SA 2.5; see ASSET_CREDITS.md.
for (const [name, left] of [['obverse', 0], ['reverse', 400]]) {
  await sharp('public/images/coin.png').extract({ left, top: 0, width: 400, height: 406 }).resize(512, 512).webp({ quality: 95 }).toFile(`public/images/coin-${name}.webp`);
}
const url = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_land.geojson';
const response = await fetch(url);
if (!response.ok) throw new Error(`Natural Earth: ${response.status}`);
await mkdir('src/data/geo', { recursive: true });
await writeFile('src/data/geo/land.json', JSON.stringify(await response.json()));
console.log('Optimized local images and Natural Earth land prepared.');
