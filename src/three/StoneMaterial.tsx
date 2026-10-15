import { useLoader } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import { RepeatWrapping, SRGBColorSpace, TextureLoader } from 'three';

export function StoneMaterial({ color = '#d5c3a4', repeat = 1 }: { color?: string; repeat?: number }) {
  const [sourceMap, sourceHeight] = useLoader(TextureLoader, ['/textures/limestone.webp', '/textures/limestone-height.png']);
  const [map, height] = useMemo(() => repeat === 1 ? [sourceMap, sourceHeight] : [sourceMap.clone(), sourceHeight.clone()], [sourceMap, sourceHeight, repeat]);
  useEffect(() => () => { if (repeat !== 1) { map.dispose(); height.dispose(); } }, [map, height, repeat]);
  return <meshStandardMaterial color={color} map={map} map-colorSpace={SRGBColorSpace} map-wrapS={RepeatWrapping} map-wrapT={RepeatWrapping} map-repeat={[repeat, repeat]} bumpMap={height} bumpMap-wrapS={RepeatWrapping} bumpMap-wrapT={RepeatWrapping} bumpMap-repeat={[repeat, repeat]} bumpScale={.055} roughnessMap={height} roughness={1} />;
}
