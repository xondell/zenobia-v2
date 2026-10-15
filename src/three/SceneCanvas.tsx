'use client';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { OrbitControls, Sky } from '@react-three/drei';
import { Suspense, useEffect, useMemo, useRef } from 'react';
import { BufferAttribute, CylinderGeometry, Group, SRGBColorSpace, TextureLoader, Vector3 } from 'three';
import type { SceneKind } from '@/components/SceneSlot';
import { Architecture } from './Architecture';
import { getCoinFaceUV } from '@/lib/coin-geometry';

function CameraMotion({ reduced, presenting }: { reduced: boolean; presenting: boolean }) {
  const target = useMemo(() => new Vector3(0, 3.6, -20), []);
  useFrame(({ camera, clock }) => {
    if (reduced) { camera.lookAt(target); return; }
    const scroll = presenting ? 0 : Math.min(window.scrollY / window.innerHeight, 1);
    const t = clock.elapsedTime;
    camera.position.set(12 - scroll * 5 + Math.sin(t * .075) * .7, 5.8 + scroll * 1.5, 20 - scroll * 17);
    camera.lookAt(target);
  });
  return null;
}
function Dust() {
  const coords = useMemo(() => {
    const values = new Float32Array(140 * 3);
    for (let i = 0; i < 140; i++) { values[i * 3] = Math.sin(i * 132.7) * 30; values[i * 3 + 1] = 1 + (i % 17) * .6; values[i * 3 + 2] = 20 - (i % 41) * 2; }
    return values;
  }, []);
  const group = useRef<Group>(null);
  useFrame((_, delta) => { if (group.current) group.current.position.x += delta * .035; });
  return <group ref={group}><points><bufferGeometry><bufferAttribute attach="attributes-position" args={[coords, 3]} /></bufferGeometry><pointsMaterial color="#efd8ac" size={.035} sizeAttenuation transparent opacity={.5} depthWrite={false} /></points></group>;
}
function Coin({ face, inspection, spinning, reduced }: { face: number; inspection: number; spinning: boolean; reduced: boolean }) {
  const ref = useRef<Group>(null);
  const { camera, invalidate, controls } = useThree();
  const [obverse, reverse] = useLoader(TextureLoader, ['/images/coin-obverse.webp', '/images/coin-reverse.webp']);
  const geometry = useMemo(() => {
    const geo = new CylinderGeometry(2.5, 2.5, .16, 128, 1, false);
    const pos = geo.attributes.position as BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i);
      if (x * x + z * z > 1) {
        const angle = Math.atan2(z, x);
        const roughness = 1 + .012 * Math.sin(angle * 17) + .008 * Math.cos(angle * 31);
        pos.setX(i, x * roughness); pos.setZ(i, z * roughness);
      }
    }
    geo.computeVertexNormals();
    // Cylinder cap UVs use (z,x), whereas the photographs use screen (x,y).
    // Remap each face explicitly to keep both inscriptions upright/unmirrored.
    const uv = geo.attributes.uv;
    for (let i = 0; i < uv.count; i++) {
      const normalY = geo.attributes.normal.getY(i);
      if (Math.abs(normalY) > .9) {
        const [u, v] = getCoinFaceUV(pos.getX(i), pos.getZ(i), normalY);
        uv.setXY(i, u, v);
      }
    }
    return geo;
  }, []);
  useEffect(() => {
    (controls as { reset?: () => void } | null)?.reset?.();
    camera.position.set(0, 0, 7.8); camera.lookAt(0, 0, 0); invalidate();
  }, [inspection, face, camera, controls, invalidate]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useFrame(({ gl }, delta) => {
    if (!ref.current) return;
    if (spinning && !reduced) ref.current.rotation.y += Math.min(delta, .05) * .28;
    else {
      const target = face === 0 ? 0 : Math.PI;
      ref.current.rotation.y += reduced ? target - ref.current.rotation.y : (target - ref.current.rotation.y) * Math.min(delta * 9, 1);
      if (Math.abs(target - ref.current.rotation.y) < .0005) ref.current.rotation.y = target;
      if (Math.abs(target - ref.current.rotation.y) > .0005) invalidate();
    }
    gl.domElement.setAttribute('data-coin-angle', ref.current.rotation.y.toFixed(3));
  });
  return <group ref={ref}><mesh rotation={[Math.PI / 2, 0, 0]} geometry={geometry} castShadow>
    <meshStandardMaterial attach="material-0" color="#8c7860" metalness={.85} roughness={.54} />
    <meshStandardMaterial attach="material-1" map={obverse} map-colorSpace={SRGBColorSpace} alphaTest={.3} metalness={.3} roughness={.6} />
    <meshStandardMaterial attach="material-2" map={reverse} map-colorSpace={SRGBColorSpace} alphaTest={.3} metalness={.3} roughness={.6} />
  </mesh></group>;
}
type Props = { kind: SceneKind; reduced: boolean; exploring: boolean; ruins: boolean; face: number; inspection: number; spinning: boolean; presenting: boolean; onDetail: (s: string) => void; onFailure: () => void };
export default function SceneCanvas({ kind, reduced, exploring, ruins, face, inspection, spinning, presenting, onDetail, onFailure }: Props) {
  const isCoin = kind === 'coin';
  const moving = kind === 'hero' && !reduced || isCoin && spinning && !reduced;
  return <Canvas className="webgl-canvas" shadows={!isCoin} dpr={[1, 1.5]} frameloop={moving ? 'always' : 'demand'} camera={{ position: isCoin ? [0, .2, 7.8] : kind === 'hero' ? [12, 5.8, 20] : [23, 12, 24], fov: isCoin ? 43 : 48, near: .1, far: 280 }} gl={{ antialias: true, alpha: false, powerPreference: 'low-power' }} onCreated={({ gl }) => { gl.domElement.addEventListener('webglcontextlost', onFailure, { once: true }); }} fallback={<span>3D недоступно</span>}>
    <color attach="background" args={[isCoin ? '#eee8dd' : '#e8dfcf']} />
    {!isCoin && <><Sky distance={450000} sunPosition={[-100, 18, -80]} turbidity={9} rayleigh={1.4} mieCoefficient={.01} mieDirectionalG={.8} /><fog attach="fog" args={['#8d8272', 65, 200]} /></>}
    <ambientLight intensity={isCoin ? 1.7 : 1.2} color={isCoin ? '#e7e5df' : '#d9c5a6'} />
    <directionalLight position={isCoin ? [-4, 5, 6] : [-15, 25, -25]} intensity={isCoin ? 3 : 3.1} color="#ffe0ad" castShadow={!isCoin} shadow-mapSize={[1024, 1024]} shadow-camera-left={-40} shadow-camera-right={40} shadow-camera-top={40} shadow-camera-bottom={-40} shadow-bias={-.001} />
    <directionalLight position={[10, 5, 9]} intensity={isCoin ? 1.5 : .35} color="#a7bbcf" />
    <Suspense fallback={null}>{isCoin ? <Coin face={face} inspection={inspection} spinning={spinning} reduced={reduced} /> : <Architecture ruins={ruins} hotspots={kind === 'city' && exploring} onDetail={onDetail} />}</Suspense>
    {kind === 'hero' && <><CameraMotion reduced={reduced} presenting={presenting} />{!reduced && <Dust />}</>}
    {kind === 'city' && <OrbitControls makeDefault target={[0, 4, -23]} enabled={exploring} enableZoom={exploring} enablePan={false} minDistance={12} maxDistance={95} maxPolarAngle={Math.PI * .48} />}
    {isCoin && <OrbitControls makeDefault enablePan={false} minDistance={5} maxDistance={13} enableZoom />}
  </Canvas>;
}
