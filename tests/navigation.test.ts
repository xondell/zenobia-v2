import { describe, expect, it } from 'vitest';
import { getNextChapter, shouldIgnoreShortcut } from '../src/lib/navigation';
describe('presentation keyboard logic', () => {
  it('moves without wrapping past either boundary', () => {
    expect(getNextChapter(0, 'ArrowLeft')).toBe(0);
    expect(getNextChapter(9, 'ArrowRight')).toBe(9);
    expect(getNextChapter(3, ' ')).toBe(4);
    expect(getNextChapter(3, 'Home')).toBe(0);
    expect(getNextChapter(3, 'End')).toBe(9);
    expect(getNextChapter(3, 'x')).toBe(3);
  });
  it('leaves form fields, buttons and 3D controls alone', () => {
    for (const tag of ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON', 'CANVAS', 'A']) {
      expect(shouldIgnoreShortcut(tag, false)).toBe(true);
    }
    expect(shouldIgnoreShortcut('DIV', true)).toBe(true);
    expect(shouldIgnoreShortcut('BODY', false)).toBe(false);
  });
});
