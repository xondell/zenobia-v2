/** UVs for a cylinder turned +π/2 around X. Back-face X is reversed so the
 * photograph reads normally when the camera moves behind the coin. */
export function getCoinFaceUV(x: number, z: number, normalY: number): [number, number] {
  const length = Math.hypot(x, z);
  if (!length) return [.5, .5];
  return [.5 + Math.sign(normalY) * x / length * .5, .5 - z / length * .5];
}
