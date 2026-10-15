export function getNextChapter(index: number, key: string): number {
  if (key === 'Home') return 0;
  if (key === 'End') return 9;
  if (key === 'ArrowRight' || key === ' ') return Math.min(9, index + 1);
  if (key === 'ArrowLeft') return Math.max(0, index - 1);
  return index;
}

export function shouldIgnoreShortcut(tagName: string, editable: boolean): boolean {
  return editable || ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON', 'CANVAS', 'A'].includes(tagName);
}
