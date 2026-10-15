import { useGLTF } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import { Mesh } from 'three';
import { StoneMaterial } from './StoneMaterial';
import { assetPath } from '@/lib/asset-path';

// Giovanni De Gasperis & A. Cordisco, derived from #NEWPALMYRA, CC BY 4.0.
// 1,551 source objects merged to a single mesh by scripts/convert-temple.mjs.
export function ImportedTemple() {
  const { scene } = useGLTF(assetPath('/models/temple-bel.glb'));
  const mesh = scene.children[0] as Mesh;
  const gl = useThree(s => s.gl);
  useEffect(() => { gl.domElement.setAttribute('data-external-model', 'temple-bel'); }, [gl]);
  return <group position={[0, .65, -48]} rotation={[0, Math.PI, 0]}><group position={mesh.position} rotation={mesh.rotation} scale={mesh.scale}><mesh name="external-temple-bel" geometry={mesh.geometry} castShadow receiveShadow dispose={null}><StoneMaterial color="#d0c0a5" repeat={12} /></mesh></group></group>;
}
