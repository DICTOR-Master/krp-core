// Verifies the overlap test (assembly/overlap.js, DICTO 2026-10-09: attached Hexas "merging"):
//   - the true Hexa / Hexa-Key checkerboard (the rhombohedral cluster's 8 Hexas and sealed Key) is
//     clean, though the Key's stella points are thinner than the sampling margin;
//   - a piece overlaps itself and not a far copy;
//   - every face attach of convex pairs (cube, dodecahedron) and of the DICTO Jewel with the stella is
//     clean; Hexa on Hexa merges in exactly the 960 of 1056 placements on its triangles.
import * as THREE from 'three';
import { POLYHEDRA, HEXA_PARTS } from '../src/polyhedra/index.js';
import { faceAttachOptions } from '../src/assembly/faceAttach.js';
import { solidsOverlap, placedSolid } from '../src/assembly/overlap.js';

let failures = 0;
const check = (label, ok) => { console.log(`${ok ? 'OK  ' : 'FAIL'} ${label}`); if (!ok) failures++; };
const cen = (V) => V.reduce((t, v) => t.map((x, i) => x + v[i] / V.length), [0, 0, 0]);
{
  const cl = HEXA_PARTS.DICTO_HEXA_RHOMBO_CLUSTER.hexas;
  const sp = (p) => POLYHEDRA[p.role === 'key' ? 'DICTO_HEXA_KEY' : 'DICTO_HEXA'];
  const pl = (p) => placedSolid(sp(p), cen(p.vertices).map((x, k) => x - cen(sp(p).vertices)[k]));
  let bad = 0;
  for (let i = 0; i < cl.length; i++) for (let j = i + 1; j < cl.length; j++) if (solidsOverlap(pl(cl[i]), pl(cl[j]))) bad++;
  check(`the Hexa / Hexa-Key checkerboard (${cl.length} pieces): ${bad} overlapping pairs`, bad === 0);
}
{
  const H = POLYHEDRA.DICTO_HEXA;
  check('a Hexa overlaps itself, not a far copy', solidsOverlap(placedSolid(H), placedSolid(H)) && !solidsOverlap(placedSolid(H), placedSolid(H, [50, 0, 0])));
}
for (const [a, b, want] of [['CUBE', 'CUBE', 0], ['DODECAHEDRON', 'DODECAHEDRON', 0], ['DRAGON_JEWEL', 'STELLA_OCTANGULA', 0], ['DICTO_HEXA', 'DICTO_HEXA', 960]]) {
  const A = POLYHEDRA[a], B = POLYHEDRA[b], PA = placedSolid(A);
  let total = 0, ov = 0;
  for (let fi = 0; fi < A.faces.length; fi++) for (const o of faceAttachOptions(A, fi, new THREE.Matrix4(), B, B.faces.map((_, k) => k))) {
    total++;
    if (solidsOverlap(PA, placedSolid(B, o.position.toArray(), o.quaternion.toArray()))) ov++;
  }
  check(`${A.name} on ${B.name}: ${ov} of ${total} face attaches overlap (want ${want})`, ov === want);
}
console.log(failures ? `${failures} failures.` : 'All checks passed (0 failures).');
process.exit(failures ? 1 : 0);
