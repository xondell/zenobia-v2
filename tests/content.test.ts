import { describe, expect, it } from 'vitest';
import { chapters } from '../src/data/chapters';
import { sources } from '../src/data/sources';

describe('historical narrative', () => {
  it('has exactly ten unique Russian chapters with sources and speaker notes', () => {
    expect(chapters).toHaveLength(10);
    expect(new Set(chapters.map(c => c.id)).size).toBe(10);
    for (const chapter of chapters) {
      expect(chapter.title).toMatch(/[А-Яа-я]/);
      expect(chapter.paragraphs.length).toBeGreaterThan(0);
      expect(chapter.notes.split(/\s+/).length).toBeGreaterThan(65);
      expect(chapter.sources.every(id => sources.some(s => s.id === id))).toBe(true);
    }
  });
  it('distinguishes the fall in 272 from the second revolt in 273', () => {
    const fall = chapters.find(c => c.id === 'fall')!;
    expect(fall.paragraphs.join(' ')).toContain('272');
    expect(fall.paragraphs.join(' ')).toContain('273');
    expect(fall.paragraphs.join(' ')).toMatch(/неизвестн|не установлен/);
  });
});
