// Source geometry: Giovanni De Gasperis & A. Cordisco / #NEWPALMYRA.
// CC BY 4.0, confirmed on the author's linked Sketchfab publication.
import { readFile, writeFile } from 'node:fs/promises';
import { Float32BufferAttribute, Mesh, MeshStandardMaterial, Vector3 } from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { mergeGeometries, mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { meshopt } from '@gltf-transform/functions';
import { MeshoptEncoder } from 'meshoptimizer';

globalThis.FileReader = class {
  readAsArrayBuffer(blob) { blob.arrayBuffer().then(buffer => { this.result = buffer; this.onloadend?.(); }); }
  readAsDataURL(blob) { blob.arrayBuffer().then(buffer => { this.result = `data:${blob.type};base64,${Buffer.from(buffer).toString('base64')}`; this.onloadend?.(); }); }
};
const source = process.argv[2] || '/tmp/opencode/zenobia-model/temple.obj';
const obj = new OBJLoader().parse(await readFile(source, 'utf8'));
obj.updateMatrixWorld(true);
const geometries = [];
obj.traverse(child => {
  if (child.isMesh) {
    const g = child.geometry.clone().applyMatrix4(child.matrixWorld);
    g.deleteAttribute('uv');
    if (!g.getAttribute('normal')) g.computeVertexNormals();
    geometries.push(g);
  }
});
let geometry = mergeGeometries(geometries, false);
const before = geometry.getAttribute('position').count;
geometry = mergeVertices(geometry, .0001);
// OpenSim exports Z-up; convert to Three.js Y-up, then center on ground.
geometry.rotateX(-Math.PI / 2);
geometry.computeBoundingBox();
const bounds = geometry.boundingBox;
const size = bounds.getSize(new Vector3());
const center = bounds.getCenter(new Vector3());
geometry.translate(-center.x, -bounds.min.y, -center.z);
// Fit the whole complex in 32 world units; preserve all relative proportions.
geometry.scale(32 / Math.max(size.x, size.z), 32 / Math.max(size.x, size.z), 32 / Math.max(size.x, size.z));
geometry.computeBoundingBox();
const positions = geometry.getAttribute('position');
const normals = geometry.getAttribute('normal');
const uv = new Float32Array(positions.count * 2);
for (let i = 0; i < positions.count; i++) {
  const nx = Math.abs(normals.getX(i)), ny = Math.abs(normals.getY(i)), nz = Math.abs(normals.getZ(i));
  uv[i * 2] = .5 + (nx > ny && nx > nz ? positions.getZ(i) : positions.getX(i)) * .025;
  uv[i * 2 + 1] = .5 + (ny > nx && ny > nz ? positions.getZ(i) : positions.getY(i)) * .025;
}
geometry.setAttribute('uv', new Float32BufferAttribute(uv, 2));
const mesh = new Mesh(geometry, new MeshStandardMaterial({ color: '#baa584', roughness: .92 }));
mesh.name = 'Temple_of_Bel_Giovanni_De_Gasperis_A_Cordisco_NEW PALMYRA_CC_BY_4';
mesh.userData = { source: 'https://github.com/giodegas/PalmyraTemple', license: 'CC BY 4.0', attribution: 'Giovanni De Gasperis, A. Cordisco; derived from #NEWPALMYRA', changes: 'Merged meshes, removed unused UVs, welded vertices, Z-up to Y-up, centered/scaled, GLB conversion.' };
const glb = await new GLTFExporter().parseAsync(mesh, { binary: true });
await MeshoptEncoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.encoder': MeshoptEncoder });
const document = await io.readBinary(new Uint8Array(glb));
await document.transform(meshopt({ encoder: MeshoptEncoder, level: 'medium' }));
const compressed = await io.writeBinary(document);
await writeFile('public/models/temple-bel.glb', compressed);
console.log({ sourceObjects: geometries.length, before, vertices: geometry.getAttribute('position').count, triangles: geometry.index.count / 3, uncompressedBytes: glb.byteLength, compressedBytes: compressed.byteLength, bounds: geometry.boundingBox });
