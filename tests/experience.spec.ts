import { test, expect } from '@playwright/test';

test('does not emit hydration or runtime errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto('/');
  await page.locator('#expansion').scrollIntoViewIfNeeded();
  await page.locator('#augusta').scrollIntoViewIfNeeded();
  await expect(page.locator('#augusta canvas')).toBeVisible({ timeout: 20000 });
  expect(errors).toEqual([]);
});

test('loads the licensed external temple and supports coin and city controls', async ({ page }) => {
  await page.goto('/#palmyra');
  await page.locator('#palmyra').scrollIntoViewIfNeeded();
  await expect(page.locator('#palmyra canvas')).toHaveAttribute('data-external-model', 'temple-bel', { timeout: 30000 });
  await page.locator('#palmyra').getByRole('button', { name: 'Исследовать 3D', exact: true }).click();
  await expect(page.locator('#palmyra .scene-hotspot')).toHaveCount(3);
  await page.locator('#palmyra .hotspot-list').getByRole('button', { name: /Храм Бела/ }).click();
  await expect(page.locator('#palmyra .object-detail')).toContainText('религиозных');
  await page.locator('#augusta').scrollIntoViewIfNeeded();
  await page.locator('#augusta').getByRole('button', { name: 'Показать реверс' }).click();
  await expect(page.locator('#augusta').getByRole('button', { name: 'Показать аверс' })).toBeVisible();
  await page.locator('#augusta').getByRole('button', { name: /S ZЄNOBIA/ }).click();
  await expect(page.locator('#augusta .object-detail')).toContainText('Augusta');
});

test('ten chapters, map timeline and sources are usable', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('main > section[data-chapter]')).toHaveCount(10);
  await expect(page.getByRole('heading', { name: 'Зенобия', exact: true }).first()).toBeVisible();
  await page.getByRole('button', { name: 'Главы', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: /05.*Рождение новой империи/ }).click();
  await expect(page.locator('#expansion')).toBeInViewport();
  const year = page.locator('#expansion input[type=range]');
  await year.fill('270');
  await expect(page.locator('#expansion .map-event')).toContainText('Египет');
  await page.locator('#expansion').getByRole('button', { name: 'Александрия', exact: true }).click();
  await expect(page.locator('#expansion .map-detail')).toContainText('Египта');
  await page.getByRole('button', { name: 'Источники', exact: true }).first().click();
  await expect(page.getByRole('dialog')).toContainText('Classical Numismatic Group');
  await page.getByRole('button', { name: 'Закрыть окно' }).click();
});

test('presentation supports navigation, notes, boundaries and exit', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Презентация', exact: true }).first().click();
  await page.locator('body').click({ position: { x: 10, y: 100 } });
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('.chapter-status')).toContainText('02');
  await page.keyboard.press('n');
  await expect(page.locator('.speaker-notes')).toBeVisible();
  await page.keyboard.press('End');
  await expect(page.locator('.chapter-status')).toContainText('10');
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('.chapter-status')).toContainText('10');
  await page.keyboard.press('Escape');
  await expect(page.locator('.experience')).not.toHaveClass(/presenting/);
});

test('all presentation slides fit a 1366×768 projector without scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Презентация', exact: true }).first().click();
  for (let i = 0; i < 10; i++) {
    await expect(page.locator('.experience')).toHaveAttribute('data-transitioning', 'false');
    const slide = page.locator('main > section[data-chapter]:not([hidden])');
    await expect(slide).toHaveCount(1);
    await expect(slide).toHaveAttribute('data-chapter', String(i));
    const bounds = await slide.boundingBox();
    expect(bounds!.height).toBeLessThanOrEqual(769);
    const footerTop = (await page.locator('.presentation-controls').boundingBox())!.y;
    for (const item of await slide.locator('.chapter-copy,.chapter-art').all()) {
      const itemBounds = await item.boundingBox();
      expect(itemBounds!.y + itemBounds!.height).toBeLessThanOrEqual(footerTop + 1);
    }
    if (i < 9) await page.getByRole('button', { name: 'Следующая глава', exact: true }).click();
  }
});

test('fullscreen refusal and slider keyboard do not break presentation', async ({ page }) => {
  await page.addInitScript(() => { Element.prototype.requestFullscreen = async () => { throw new Error('denied'); }; });
  await page.goto('/');
  await page.getByRole('button', { name: 'Главы', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: /05.*Рождение новой империи/ }).click();
  await page.getByRole('button', { name: 'Презентация', exact: true }).first().click();
  await expect(page.getByRole('status')).toContainText('работает в окне');
  const slider = page.locator('#expansion input[type=range]');
  await slider.focus();
  await page.keyboard.press('ArrowRight');
  await expect(slider).toHaveValue('268');
  await expect(page.locator('.chapter-status')).toContainText('05');
  await page.getByRole('button', { name: 'Выйти', exact: true }).click();
  await expect(page.locator('#expansion')).toBeInViewport();
});

for (const [width, height] of [[1920, 1080], [1440, 900], [1366, 768], [768, 1024], [390, 844]]) {
  test(`no horizontal overflow at ${width}×${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto('/');
    for (const id of ['prologue', 'crisis', 'palmyra', 'rise', 'expansion', 'augusta', 'aurelian', 'fall', 'legacy', 'epilogue']) {
      await page.locator('#' + id).scrollIntoViewIfNeeded();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    }
  });
}

test('reduced motion and disabled WebGL keep content accessible', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, ...args: Parameters<typeof original>) {
      if (String(args[0]).includes('webgl')) return null;
      return original.apply(this, args);
    } as typeof original;
  });
  await page.goto('/');
  await page.locator('#palmyra').scrollIntoViewIfNeeded();
  await expect(page.locator('#palmyra .scene-fallback img')).toBeVisible();
  await page.locator('#augusta').scrollIntoViewIfNeeded();
  await expect(page.locator('#augusta .scene-fallback img')).toBeVisible();
});

test('family, investigation, gallery and optional quiz work', async ({ page }) => {
  await page.goto('/');
  await page.locator('#rise').scrollIntoViewIfNeeded();
  await page.locator('#rise').getByRole('button', { name: 'Оденат СУПРУГ', exact: true }).click();
  await expect(page.locator('.person-detail')).toContainText('Сасанидов');
  await page.locator('#fall').scrollIntoViewIfNeeded();
  await page.getByRole('tab', { name: 'I Пленение и триумф', exact: true }).click();
  await expect(page.getByRole('tabpanel')).toContainText('нельзя считать доказанным');
  await page.locator('#legacy').scrollIntoViewIfNeeded();
  await page.getByRole('button', { name: 'Галерея: Свидетельство власти' }).click();
  await expect(page.locator('#legacy figcaption')).toContainText('CNG');
  await page.locator('#epilogue').scrollIntoViewIfNeeded();
  await page.getByRole('button', { name: /Проверить себя/ }).click();
  for (const answer of ['III век н. э.', 'Пальмира', 'Аврелиан']) {
    await page.locator('.quiz').getByRole('button', { name: answer, exact: true }).click();
    await expect(page.locator('.quiz [role=status]')).toContainText('Верно');
    await page.locator('.quiz').getByRole('button', { name: 'Далее', exact: true }).click();
  }
  await expect(page.locator('.quiz h3')).toHaveText('3 из 3');
});

test('mobile hero title remains on one line and media stays local', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const remote: string[] = [];
  page.on('request', request => {
    if (new URL(request.url()).origin !== new URL(test.info().project.use.baseURL!).origin) remote.push(request.url());
  });
  await page.goto('/');
  await expect(page.locator('.hero-title')).toHaveCSS('white-space', 'nowrap');
  const box = await page.locator('.hero-title').boundingBox();
  expect(box!.height).toBeLessThan(80);
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(390);
  await page.locator('#palmyra').scrollIntoViewIfNeeded();
  await expect(page.locator('#palmyra canvas')).toHaveAttribute('data-external-model', 'temple-bel', { timeout: 30000 });
  expect(remote).toEqual([]);
});
