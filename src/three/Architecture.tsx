import { Suspense, useLayoutEffect, useMemo, useRef } from 'react';
import { Html } from '@react-three/drei';
import { CylinderGeometry, InstancedMesh, Object3D, PlaneGeometry, Shape } from 'three';
import { StoneMaterial } from './StoneMaterial';
import { ImportedTemple } from './ImportedTemple';

function ColumnInstances({ ruins }: { ruins: boolean }) {
  const shafts = useRef<InstancedMesh>(null);
  const bases = useRef<InstancedMesh>(null);
  const capitals = useRef<InstancedMesh>(null);
  const collars = useRef<InstancedMesh>(null);
  const leaves = useRef<InstancedMesh>(null);
  const curls = useRef<InstancedMesh>(null);
  const count = 60;
  const shaftGeometry = useMemo(() => {
    const g = new CylinderGeometry(.31, .43, 5.7, 96, 6);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i);
      const a = Math.atan2(z, x);
      const flute = 1 - .045 * (1 + Math.cos(a * 24));
      p.setX(i, x * flute); p.setZ(i, z * flute);
    }
    g.computeVertexNormals(); return g;
  }, []);
  useLayoutEffect(() => {
    const temp = new Object3D();
    for (let i = 0; i < count; i++) {
      const row = i < 30 ? -1 : 1;
      const j = i % 30;
      const x = row * 5.2;
      const z = 18 - j * 3.2;
      const h = ruins && i % 4 !== 0 ? 1.4 + (i % 5) * 0.65 : 5.7;
      temp.position.set(x, h / 2 + .35, z); temp.scale.set(1, h / 5.7, 1); temp.updateMatrix(); shafts.current!.setMatrixAt(i, temp.matrix);
      temp.position.set(x, .2, z); temp.scale.set(1, 1, 1); temp.updateMatrix(); bases.current!.setMatrixAt(i, temp.matrix);
      temp.position.set(x, h + .55, z); temp.updateMatrix(); capitals.current!.setMatrixAt(i, temp.matrix);
      temp.position.set(x, h + .3, z); temp.updateMatrix(); collars.current!.setMatrixAt(i, temp.matrix);
      for (let j = 0; j < 8; j++) {
        const a = j * Math.PI / 4;
        temp.position.set(x + Math.cos(a) * .37, h + .15, z + Math.sin(a) * .37);
        temp.scale.set(.13, .31, .09); temp.rotation.set(.2 * Math.sin(a), -a, .2 * Math.cos(a)); temp.updateMatrix();
        leaves.current!.setMatrixAt(i * 8 + j, temp.matrix);
      }
      temp.rotation.set(0, 0, 0); temp.scale.set(1, 1, 1);
      for (let j = 0; j < 2; j++) {
        temp.position.set(x + (j === 0 ? -.36 : .36), h + .35, z + .43); temp.updateMatrix();
        curls.current!.setMatrixAt(i * 2 + j, temp.matrix);
      }
    }
    [shafts, bases, capitals, collars, leaves, curls].forEach(ref => { ref.current!.instanceMatrix.needsUpdate = true; });
  }, [ruins]);
  // Repeated stone pieces each share one geometry/material and one draw call.
  // https://r3f.docs.pmnd.rs/advanced/scaling-performance#instancing
  return <>
    <instancedMesh ref={shafts} args={[undefined, undefined, count]} geometry={shaftGeometry} castShadow receiveShadow><StoneMaterial color="#cbb89a" /></instancedMesh>
    <instancedMesh ref={bases} args={[undefined, undefined, count]} castShadow receiveShadow><boxGeometry args={[1.15, .4, 1.15]} /><StoneMaterial color="#bfae91" /></instancedMesh>
    <instancedMesh ref={capitals} args={[undefined, undefined, count]} castShadow><boxGeometry args={[1.12, .36, 1.12]} /><StoneMaterial color="#ddc8a8" /></instancedMesh>
    <instancedMesh ref={collars} args={[undefined, undefined, count]}><cylinderGeometry args={[.56, .46, .32, 24]} /><StoneMaterial /></instancedMesh>
    <instancedMesh ref={leaves} args={[undefined, undefined, count * 8]}><sphereGeometry args={[1, 6, 6]} /><StoneMaterial color="#ddcbb0" /></instancedMesh>
    <instancedMesh ref={curls} args={[undefined, undefined, count * 2]}><torusGeometry args={[.15, .045, 6, 10]} /><StoneMaterial color="#ddcbb0" /></instancedMesh>
    {!ruins && [-5.2, 5.2].map(x => <mesh key={x} position={[x, 6.65, -28]} castShadow><boxGeometry args={[1.05, .55, 96]} /><meshStandardMaterial color="#a68e6d" roughness={1} /></mesh>)}
  </>;
}

function Arch() {
  return <group position={[0, 0, -9]}>
    {[-3, 3].map(x => <group key={x} position={[x, 0, 0]}>
      <mesh position={[0, 2.1, 0]} castShadow><boxGeometry args={[1.7, 4.2, 2]} /><meshStandardMaterial color="#baa17c" roughness={.95} /></mesh>
      <mesh position={[0, .2, 0]} receiveShadow><boxGeometry args={[2.15, .4, 2.5]} /><meshStandardMaterial color="#b19873" /></mesh>
      {[-.65, .65].map(xx => <mesh key={xx} position={[xx, 2.2, 1.1]} castShadow><cylinderGeometry args={[.19, .24, 4.2, 12]} /><meshStandardMaterial color="#d0b38b" /></mesh>)}
    </group>)}
    <mesh position={[0, 4.1, 0]} castShadow><torusGeometry args={[2.16, .75, 8, 28, Math.PI]} /><meshStandardMaterial color="#bda17a" roughness={1} /></mesh>
    <mesh position={[0, 7, 0]} castShadow><boxGeometry args={[8, 1.1, 2.5]} /><meshStandardMaterial color="#bda27f" /></mesh>
    <mesh position={[0, 7.65, 0]}><boxGeometry args={[8.5, .22, 2.9]} /><meshStandardMaterial color="#c5ac89" /></mesh>
  </group>;
}
function Temple() {
  const pediment = useMemo(() => new Shape().moveTo(-7, 0).lineTo(0, 2.7).lineTo(7, 0).closePath(), []);
  return <group position={[0, 0, -47]}>
    {[0, 1, 2].map(i => <mesh key={i} position={[0, i * .23, 0]} receiveShadow><boxGeometry args={[18 - i, .24, 14 - i]} /><meshStandardMaterial color="#8d7f69" roughness={1} /></mesh>)}
    <mesh position={[0, 3.1, -1.5]} castShadow><boxGeometry args={[10, 5, 8]} /><meshStandardMaterial color="#a48f70" roughness={1} /></mesh>
    {[-6, -3.6, -1.2, 1.2, 3.6, 6].map(x => <group key={x} position={[x, 0, 5]}><mesh position={[0, 3.6, 0]} castShadow><cylinderGeometry args={[.4, .52, 6, 16]} /><meshStandardMaterial color="#c4ac87" /></mesh><mesh position={[0, 6.7, 0]}><boxGeometry args={[1.25, .4, 1.25]} /><meshStandardMaterial color="#c4ac87" /></mesh></group>)}
    <mesh position={[0, 7, 4.2]} castShadow><extrudeGeometry args={[pediment, { depth: 1.7, bevelEnabled: false }]} /><meshStandardMaterial color="#bda27c" /></mesh>
  </group>;
}
function Theater() {
  return <group position={[18, .12, -17]} rotation={[0, -.8, 0]}>
    {Array.from({ length: 9 }, (_, i) => <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, i * .33, 0]} receiveShadow><ringGeometry args={[4 + i * .7, 4.68 + i * .7, 40, 1, 0, Math.PI]} /><meshStandardMaterial color={i % 2 ? '#a79577' : '#bdab89'} side={2} roughness={1} /></mesh>)}
    <mesh position={[0, 1.2, -1]} castShadow><boxGeometry args={[16, 2.4, 1.4]} /><meshStandardMaterial color="#aa9370" /></mesh>
  </group>;
}
export function Architecture({ ruins, hotspots, onDetail }: { ruins: boolean; hotspots: boolean; onDetail: (s: string) => void }) {
  const terrain = useMemo(() => {
    const geometry = new PlaneGeometry(350, 350, 64, 64);
    const vertices = geometry.attributes.position;
    for (let i = 0; i < vertices.count; i++) {
      const x = vertices.getX(i), y = vertices.getY(i);
      const edge = Math.min(1, Math.max(0, (Math.hypot(x, y) - 65) / 55));
      vertices.setZ(i, edge * (2.8 + Math.sin(x * .036 + y * .015) * 2 + Math.cos(y * .047) * 1.2));
    }
    geometry.computeVertexNormals(); return geometry;
  }, []);
  return <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} geometry={terrain} receiveShadow position={[0, -.05, -25]}><StoneMaterial color="#ae9872" repeat={55} /></mesh>
    <mesh position={[0, .01, -26]} receiveShadow><boxGeometry args={[9, .1, 115]} /><meshStandardMaterial color="#a18f70" roughness={1} /></mesh>
    <ColumnInstances ruins={ruins} />
    {!ruins && <Arch />}
    <Suspense fallback={<Temple />}><ImportedTemple /></Suspense><Theater />
    {Array.from({ length: 18 }, (_, i) => <mesh key={i} position={[(i % 2 ? -1 : 1) * (14 + i % 7 * 3), .35 + i % 3 * .15, -6 - i * 4]} rotation={[0, i * 2.3, .06]} castShadow><boxGeometry args={[1.5, .7 + i % 3 * .3, 2]} /><meshStandardMaterial color="#8f8066" roughness={1} /></mesh>)}
    {hotspots && [[0, 8.7, -9, 'Арка'], [0, 10, -47, 'Храм Бела'], [18, 4, -17, 'Театр']].map(([x, y, z, name]) => <Html key={String(name)} position={[Number(x), Number(y), Number(z)]} center distanceFactor={45}><button className="scene-hotspot" onClick={() => onDetail(name === 'Арка' ? 'Монументальная арка связывала участки Большой колоннады. Здесь показана условная композиция, а не точная модель памятника.' : name === 'Театр' ? 'Римский театр Пальмиры отражает влияние греко-римской архитектуры на городскую культуру.' : 'Храм Бела был важнейшим религиозным сооружением Пальмиры. Его особенности нельзя свести к обычному римскому храму.')}><span>+</span>{name}</button></Html>)}
  </group>;
}
