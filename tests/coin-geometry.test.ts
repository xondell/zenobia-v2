import { expect, it } from 'vitest';
import { getCoinFaceUV } from '../src/lib/coin-geometry';

it('keeps both coin photographs upright and unmirrored after cylinder rotation', () => {
  expect(getCoinFaceUV(1, 0, 1)).toEqual([1, .5]);
  expect(getCoinFaceUV(0, -1, 1)).toEqual([.5, 1]);
  expect(getCoinFaceUV(-1, 0, -1)).toEqual([1, .5]);
  expect(getCoinFaceUV(0, -1, -1)).toEqual([.5, 1]);
  expect(getCoinFaceUV(0, 0, 1)).toEqual([.5, .5]);
});
