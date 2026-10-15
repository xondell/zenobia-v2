import { test, expect } from '@playwright/test';

test('source links appear only in the Sources panel, not on slides', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('main a[href^="http"]')).toHaveCount(0);
  await page.getByRole('button', { name: 'Источники', exact: true }).click();
  await expect(page.getByRole('dialog').getByRole('link', { name: /Classical Numismatic Group/ }).first()).toBeVisible();
  await expect(page.getByRole('dialog')).toContainText('CC BY 4.0');
});

test('projector has light surfaces and near-fullscreen interactive scenes', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Презентация', exact: true }).click();
  await page.getByRole('button', { name: 'Главы', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: /02.*Империя/ }).click();
  await expect(page.locator('#crisis')).toBeVisible();
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(247, 245, 240)');
  const map = await page.locator('#crisis .chapter-art').boundingBox();
  expect(map!.width).toBeGreaterThan(1920 * .85);
  expect(map!.height).toBeGreaterThan(1080 * .65);
});

test('chapter arrows visibly animate and repeated navigation settles safely', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Презентация', exact: true }).click();
  const next = page.getByRole('button', { name: 'Следующая глава', exact: true });
  await expect(next).toBeVisible();
  // Observe within the same task: a remote round-trip can miss the entire 220ms exit.
  const animated = await next.evaluate(button => {
    (button as HTMLButtonElement).click();
    const running = document.querySelector('main')!.getAnimations({ subtree: true }).some(a => a.playState === 'running' && a.effect instanceof KeyframeEffect && a.effect.target?.classList.contains('chapter'));
    (button as HTMLButtonElement).click();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    return running;
  });
  expect(animated).toBe(true);
  await expect(page.locator('.chapter-status')).toContainText('02');
  await expect(page.locator('.experience')).toHaveAttribute('data-transitioning', 'false');
  await expect(page.locator('main > section:not([hidden])')).toHaveCount(1);
  await expect(page.locator('#crisis')).toHaveCSS('opacity', '1');
});

test('city card is anchored and can be dismissed without leaving presentation', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/');
  await page.locator('#crisis').scrollIntoViewIfNeeded();
  const marker = page.locator('#crisis').getByRole('button', { name: 'Рим', exact: true });
  await marker.click();
  const card = page.locator('#crisis .map-popover');
  await expect(card).toBeVisible();
  await expect(card).toContainText('Политический центр');
  await page.waitForTimeout(1500);
  const a = (await marker.boundingBox())!, b = (await card.boundingBox())!;
  expect(b.x).toBeGreaterThanOrEqual(0);
  expect(b.x + b.width).toBeLessThanOrEqual(1920);
  expect(Math.min(Math.abs(b.x - (a.x + a.width)), Math.abs(a.x - (b.x + b.width)))).toBeLessThan(70);
  await page.keyboard.press('Escape');
  await expect(card).toBeHidden();
  await marker.click();
  await marker.click();
  await expect(card).toBeHidden();
});

test('Latin legends orient the real coin and stop its spin', async ({ page }) => {
  await page.goto('/');
  const slide = page.locator('#augusta');
  await slide.scrollIntoViewIfNeeded();
  const canvas = slide.locator('canvas');
  await expect(canvas).toBeVisible();
  await slide.getByRole('button', { name: /IVNO REGINA/ }).click();
  await expect(slide.getByRole('button', { name: 'Вращать монету', exact: true })).toBeVisible();
  await expect.poll(() => canvas.getAttribute('data-coin-angle')).toBe('3.142');
  await slide.getByRole('button', { name: /S ZЄNOBIA/ }).click();
  await expect.poll(() => canvas.getAttribute('data-coin-angle')).toBe('0.000');
  await expect(slide.locator('.object-detail')).toContainText('Augusta');
});

test('projector quiz stays above navigation and can return to the coin', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Презентация', exact: true }).click();
  await page.getByRole('button', { name: 'Главы', exact: true }).click();
  await page.getByRole('dialog').locator('.chapter-menu button').nth(9).click();
  await expect(page.locator('.experience')).toHaveAttribute('data-transitioning', 'false');
  await page.getByRole('button', { name: /Проверить себя/ }).click();
  const options = (await page.locator('.quiz-options').boundingBox())!;
  const footer = (await page.locator('.presentation-controls').boundingBox())!;
  expect(options.y + options.height).toBeLessThan(footer.y);
  for (const answer of ['III век н. э.', 'Пальмира', 'Аврелиан']) {
    await page.locator('.quiz').getByRole('button', { name: answer, exact: true }).click();
    const next = page.locator('.quiz').getByRole('button', { name: 'Далее', exact: true });
    const bounds = (await next.boundingBox())!;
    expect(bounds.y + bounds.height).toBeLessThan(footer.y);
    await next.click();
  }
  await expect(page.locator('.quiz h3')).toHaveText('3 из 3');
  await page.getByRole('button', { name: 'Вернуться к монете', exact: true }).click();
  await expect(page.locator('#epilogue .coin-legends')).toBeVisible();
});

test('map text can be collapsed to explore regions beneath it', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/');
  await page.locator('#crisis').scrollIntoViewIfNeeded();
  await page.locator('#crisis').getByRole('button', { name: 'Свернуть текст', exact: true }).click();
  await page.locator('#crisis').getByRole('button', { name: 'Регион Галлия', exact: true }).click();
  await expect(page.locator('#crisis .map-popover')).toContainText('Галльское');
  await page.locator('#crisis').getByRole('button', { name: 'Показать текст', exact: true }).click();
  await expect(page.locator('#crisis .chapter-copy')).toBeVisible();
});

test('legacy switches repeatedly without accumulating canvases and retains three archive images', async ({ page }) => {
  await page.goto('/');
  const legacy = page.locator('#legacy');
  await legacy.scrollIntoViewIfNeeded();
  for (let i = 0; i < 3; i++) {
    await legacy.getByRole('button', { name: '3D-реконструкция', exact: true }).click();
    await expect(legacy.locator('canvas')).toHaveCount(1);
    await expect(legacy.locator('canvas')).toHaveAttribute('data-external-model', 'temple-bel', { timeout: 30000 });
    await legacy.getByRole('button', { name: 'Археологические фотографии', exact: true }).click();
    await expect(legacy.locator('canvas')).toHaveCount(0);
    await legacy.locator('.gallery-controls button').nth(i).click();
    await expect(legacy.locator('.gallery-image')).toHaveClass(new RegExp(`gallery-${i}`));
  }
});

test('Escape closes the focused map, not another offscreen map card', async ({ page }) => {
  await page.goto('/');
  // Wait for hydration before sending keys to server-rendered SVG controls.
  await page.getByRole('button', { name: 'Главы', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
  for (const id of ['crisis', 'expansion']) {
    const marker = page.locator(`#${id}`).getByRole('button', { name: 'Рим', exact: true });
    await page.locator(`#${id}`).scrollIntoViewIfNeeded();
    await marker.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator(`#${id} .map-popover`)).toBeVisible();
  }
  await page.keyboard.press('Escape');
  await expect(page.locator('#expansion .map-popover')).toBeHidden();
  await expect(page.locator('#expansion').getByRole('button', { name: 'Рим', exact: true })).toBeFocused();
});

test('coin explanation and legends never overlap and the poster fits its canvas', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Презентация', exact: true }).click();
  await page.getByRole('button', { name: 'Главы', exact: true }).click();
  await page.getByRole('dialog').locator('.chapter-menu button').nth(5).click();
  await expect(page.locator('.experience')).toHaveAttribute('data-transitioning', 'false');
  const slide = page.locator('#augusta');
  await slide.getByRole('button', { name: /S ZЄNOBIA/ }).click();
  const legends = (await slide.locator('.coin-legends').boundingBox())!;
  const detail = (await slide.locator('.object-detail').boundingBox())!;
  expect(detail.y).toBeGreaterThanOrEqual(legends.y + legends.height + 8);
  const poster = (await slide.locator('.scene-fallback').boundingBox())!;
  const canvas = (await slide.locator('.webgl-canvas').boundingBox())!;
  expect(Math.abs(poster.x - canvas.x)).toBeLessThan(2);
  expect(Math.abs(poster.height - canvas.height)).toBeLessThan(2);
});

test('campaign stage buttons focus the corresponding historical event', async ({ page }) => {
  await page.goto('/');
  const slide = page.locator('#aurelian');
  await slide.scrollIntoViewIfNeeded();
  await slide.getByRole('button', { name: '02 · ЭМЕСА', exact: true }).click();
  await expect(slide.locator('.map-popover')).toContainText('272');
  await expect(slide.locator('.map-popover')).toContainText('Эмес');
});

test('mobile icon navigation keeps accessible names and presentation access', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Презентация', exact: true }).click();
  await expect(page.locator('.experience')).toHaveClass(/presenting/);
  await page.getByRole('button', { name: 'Главы', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
});

test('map arrow keys stay local but N still opens speaker notes', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Презентация', exact: true }).click();
  await page.getByRole('button', { name: 'Главы', exact: true }).click();
  await page.getByRole('dialog').locator('.chapter-menu button').nth(1).click();
  await expect(page.locator('.experience')).toHaveAttribute('data-transitioning', 'false');
  await page.locator('#crisis').getByRole('button', { name: 'Рим', exact: true }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('.chapter-status')).toContainText('02');
  await page.keyboard.press('n');
  await expect(page.locator('.speaker-notes')).toBeVisible();
});
