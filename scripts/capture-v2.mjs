import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

const directory = 'docs/screenshots/v2';
await mkdir(directory, { recursive: true });
const browser = await chromium.launch({ headless: true });
const errors = [];
const ids = ['prologue', 'crisis', 'palmyra', 'rise', 'expansion', 'augusta', 'aurelian', 'fall', 'legacy', 'epilogue'];
const sizes = process.env.ALL_SIZES ? [[1920,1080],[1366,768],[1440,900],[768,1024],[390,844]] : [[1920,1080]];
const report = [];
for (const [width,height] of sizes) {
  // A native fullscreen window cannot be resized: use an isolated page per size.
  const page = await browser.newPage({ viewport: { width,height } });
  page.setDefaultTimeout(30000);
  page.on('pageerror', error => errors.push(`${width}×${height}: ${error.message}`));
  await page.goto(process.env.TEST_URL || 'http://localhost:3101');
  await page.getByRole('button', { name: 'Презентация', exact: true }).click();
  for (const [index,id] of ids.entries()) {
    await page.getByRole('button', { name: 'Главы', exact: true }).click();
    await page.getByRole('dialog').locator('.chapter-menu button').nth(index).click();
    await page.waitForFunction(() => document.querySelector('.experience')?.getAttribute('data-transitioning') === 'false');
    await page.waitForTimeout(900);
    const slide = page.locator('#'+id);
    const measurements = await slide.evaluate(el => ({
      overflow: document.documentElement.scrollWidth > innerWidth + 1,
      boxes: [...el.querySelectorAll('.chapter-heading,.chapter-copy,.chapter-art')].map(node => {
        const b = node.getBoundingClientRect(); return { className: node.className, x:b.x,y:b.y,width:b.width,height:b.height,bottom:b.bottom };
      }),
    }));
    report.push({ width,height,id,...measurements });
    await page.screenshot({ path:`${directory}/${String(index+1).padStart(2,'0')}-${id}-${width}.png`, fullPage:width<1000 });
  }
  await page.close();
}
await writeFile(`${directory}/measurements.json`, JSON.stringify({ errors, report },null,2));
await browser.close();
console.log(`Captured ${report.length} slides; runtime errors: ${errors.length}`);
