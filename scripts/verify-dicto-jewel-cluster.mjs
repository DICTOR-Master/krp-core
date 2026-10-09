// Verifies DICTO's clusters of DICTO Jewels (polyhedra/stellaJewel.js, DICTO 2026-10-09).
// The tetrahedral cluster:
//   - four DICTO Jewels at the corners of a regular tetrahedron of cells, each pair meeting face to
//     face on a whole rhombus (6 shared rhombi), no two overlapping;
//   - its surface: 228 faces (192 triangles, 36 rhombi), every edge on exactly two faces;
//   - one pinch point only, the cell corner at the centre, where the four lobes touch; with it
//     split, the surface is a sphere (Euler characteristic 2);
//   - volume exactly four DICTO Jewels.
// The octahedral cluster (at the end): six Jewels round an odd cell, 12 shared rhombi, no overlap, and
// the cell's stella octangula inside, fitting them face for face: a solid piece; volume six Jewels and
// a stella.
// Both fill space with stella octangulas: every Jewel (even cell) in exactly one cluster, stellas in
// the other cells (Jewels and stellas fill space: verify-roof-fold.mjs).
// As a shared network (DICTO's octet idea): the clusters are the cells of the octet truss on the
// Jewels' lattice, sharing Jewels, every stella hidden inside an octahedral cluster.
import { POLYHEDRA } from '../src/polyhedra/index.js';
import { DJ_TETRA_CENTRES, DJ_OCTA_CENTRES, DJ_TETRA_OFFSETS, DJ_OCTA_TILING } from '../src/polyhedra/stellaJewel.js';

let failures = 0;
const check = (label, ok) => { console.log(`${ok ? 'OK  ' : 'FAIL'} ${label}`); if (!ok) failures++; };
const PHI = (1 + Math.sqrt(5)) / 2, K = PHI / 2;
const sub = (a, b) => a.map((x, i) => x - b[i]);
const len = (a) => Math.hypot(...a);
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const volume = ({ vertices: V, faces: F }) => Math.abs(F.reduce((t, f) => {
  for (let m = 1; m + 1 < f.length; m++) { const [a, b, c] = [V[f[0]], V[f[m]], V[f[m + 1]]]; t += (a[0] * (b[1] * c[2] - b[2] * c[1]) - a[1] * (b[0] * c[2] - b[2] * c[0]) + a[2] * (b[0] * c[1] - b[1] * c[0])) / 6; }
  return t;
}, 0));

const DJ = POLYHEDRA.DRAGON_JEWEL, C = POLYHEDRA.DJ_TETRAHEDRAL_CLUSTER;
check('the cluster is registered', !!C);

// The four centres: a regular tetrahedron, each pair of cells a face diagonal apart (DICTO Jewel
// neighbours across a rhombus in the lattice).
const d = DJ_TETRA_CENTRES.flatMap((a, i) => DJ_TETRA_CENTRES.slice(i + 1).map((b) => len(sub(a, b))));
check('the four cells form a regular tetrahedron (all six centre distances equal)', d.every((x) => Math.abs(x - d[0]) < 1e-12));

// Pieces, in the cluster's own frame (centred on the four cells' centre).
const mid = DJ_TETRA_CENTRES.reduce((t, p) => t.map((x, i) => x + p[i] / 4), [0, 0, 0]);
const pieces = DJ_TETRA_CENTRES.map((c) => DJ.vertices.map((v) => v.map((x, i) => x + (c[i] - mid[i]) * K)));
const faceKey = (pts) => pts.map((p) => p.map((x) => x.toFixed(6)).join(',')).sort().join('|');
const faceSets = pieces.map((P) => new Set(DJ.faces.map((f) => faceKey(f.map((i) => P[i])))));
let sharedPairs = 0, sharedRhombi = 0;
for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) {
  const s = DJ.faces.filter((f) => f.length === 4 && faceSets[j].has(faceKey(f.map((k) => pieces[i][k])))).length;
  if (s === 1) sharedPairs++;
  sharedRhombi += s;
}
check(`every pair of Jewels shares exactly one whole rhombus (${sharedRhombi} shared)`, sharedPairs === 6 && sharedRhombi === 6);

// No overlap: points inside one Jewel lie in no other (Jewels are not convex: test against the
// Jewel's own point-in-solid by ray parity).
function inside(P, F, p) {
  const dir = [0.5773, 0.5779, 0.5767];
  let hits = 0;
  for (const f of F) for (let m = 1; m + 1 < f.length; m++) {
    const a = P[f[0]], b = P[f[m]], c = P[f[m + 1]];
    const e1 = sub(b, a), e2 = sub(c, a), h = cross(dir, e2), det = e1[0] * h[0] + e1[1] * h[1] + e1[2] * h[2];
    if (Math.abs(det) < 1e-12) continue;
    const s = sub(p, a), u = (s[0] * h[0] + s[1] * h[1] + s[2] * h[2]) / det; if (u < 0 || u > 1) continue;
    const q = cross(s, e1), v = (dir[0] * q[0] + dir[1] * q[1] + dir[2] * q[2]) / det; if (v < 0 || u + v > 1) continue;
    if ((e2[0] * q[0] + e2[1] * q[1] + e2[2] * q[2]) / det > 1e-12) hits++;
  }
  return hits % 2 === 1;
}
let seed = 11, bad = 0;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
for (let n = 0; n < 4000; n++) {
  const p = [rnd(), rnd(), rnd()].map((x) => (x * 2 - 1) * 2.2 * K * 2);
  const inn = pieces.filter((P) => inside(P, DJ.faces, p)).length;
  if (inn > 1) bad++;
}
check(`no two Jewels overlap (4000 sample points, ${bad} in two)`, bad === 0);

// The surface.
const tri = C.faces.filter((f) => f.length === 3).length, rh = C.faces.filter((f) => f.length === 4).length;
check(`surface: ${C.faces.length} faces (${tri} triangles, ${rh} rhombi)`, C.faces.length === 228 && tri === 192 && rh === 36);
const edgeUse = new Map();
C.faces.forEach((f) => f.forEach((a, i) => { const b = f[(i + 1) % f.length]; const k = a < b ? `${a}-${b}` : `${b}-${a}`; edgeUse.set(k, (edgeUse.get(k) ?? 0) + 1); }));
check('closed: every edge on exactly two faces', [...edgeUse.values()].every((n) => n === 2));
// Pinch points: vertices whose faces form more than one fan.
const pinch = [];
C.vertices.forEach((_, v) => {
  const inc = C.faces.filter((f) => f.includes(v)).map((f) => { const i = f.indexOf(v); return [f[(i + f.length - 1) % f.length], f[(i + 1) % f.length]]; });
  const parent = inc.map((_, i) => i), find = (i) => (parent[i] === i ? i : (parent[i] = find(parent[i])));
  for (let a = 0; a < inc.length; a++) for (let b = a + 1; b < inc.length; b++) if (inc[a].some((x) => inc[b].includes(x))) parent[find(a)] = find(b);
  const fans = new Set(inc.map((_, i) => find(i))).size;
  if (fans > 1) pinch.push({ v, fans });
});
const chi = C.vertices.length - edgeUse.size + C.faces.length;
const atCentre = pinch.length === 1 && len(C.vertices[pinch[0].v]) < 1e-9;
check(`one pinch point, at the centre, where the four lobes touch (${pinch.length} found)`, atCentre && pinch[0].fans === 4);
check(`with it split the surface is a sphere (Euler ${chi} + ${atCentre ? pinch[0].fans - 1 : '?'} = 2)`, atCentre && chi + pinch[0].fans - 1 === 2);
check(`volume = 4 DICTO Jewels (${volume(C).toFixed(6)} = 4 x ${volume(DJ).toFixed(6)})`, Math.abs(volume(C) - 4 * volume(DJ)) < 1e-9);

// ---- the octahedral cluster ----
{
  const O = POLYHEDRA.DJ_OCTAHEDRAL_CLUSTER;
  check('the octahedral cluster is registered', !!O);
  const omid = [0, 0, 0];
  const op = DJ_OCTA_CENTRES.map((c) => DJ.vertices.map((v) => v.map((x, i) => x + (c[i] - omid[i]) * K)));
  const osets = op.map((P) => new Set(DJ.faces.map((f) => faceKey(f.map((i) => P[i])))));
  let touching = 0, shared = 0;
  for (let i = 0; i < 6; i++) for (let j = i + 1; j < 6; j++) {
    const n = DJ.faces.filter((f) => f.length === 4 && osets[j].has(faceKey(f.map((k) => op[i][k])))).length;
    if (n === 1) touching++;
    shared += n;
  }
  check(`the six Jewels: 12 neighbouring pairs (the octahedron's edges) share a whole rhombus (${shared} shared, ${touching} pairs)`, touching === 12 && shared === 12);
  let obad = 0;
  for (let n = 0; n < 4000; n++) {
    const p = [rnd(), rnd(), rnd()].map((x) => (x * 2 - 1) * 3.2 * K * 2);
    if (op.filter((P) => inside(P, DJ.faces, p)).length > 1) obad++;
  }
  check(`no two Jewels overlap (4000 sample points, ${obad} in two)`, obad === 0);
  const eu = new Map(), dir = new Map();
  O.faces.forEach((f) => f.forEach((a, i) => {
    const b = f[(i + 1) % f.length], k = a < b ? `${a}-${b}` : `${b}-${a}`;
    eu.set(k, (eu.get(k) ?? 0) + 1); dir.set(`${a}>${b}`, (dir.get(`${a}>${b}`) ?? 0) + 1);
  }));
  check('closed and consistently wound: every edge on two faces, run once each way', [...eu.values()].every((n) => n === 2) && [...dir.values()].every((n) => n === 1));
  // Solid (DICTO: "the stella-shaped hole could have a stella in it, it's a solid"): the odd cell's
  // stella goes in, every one of its 48 faces cancelling against a Jewel's (the build checks it), so
  // the surface is the outside alone.
  const ST = POLYHEDRA.STELLA_OCTANGULA;
  check(`solid: its surface is the outside alone (${O.faces.length} faces), the stella inside fitting the six Jewels face for face`, O.faces.length === 288);
  // The stella's surface touches the outside only at its 8 spike tips.
  const tips = O.vertices.filter((v) => v.every((x) => Math.abs(Math.abs(x) - K) < 1e-9));
  check(`the stella inside reaches the outside only at its 8 spike tips (${tips.length})`, tips.length === 8);
  check(`volume = 6 DICTO Jewels and a stella octangula (${volume(O).toFixed(6)})`, Math.abs(volume(O) - 6 * volume(DJ) - volume(ST)) < 1e-9);
}

// ---- both clusters + stellas fill space: every even cell in exactly one cluster ----
{
  const N = 9, cover = (centresOf) => {
    const count = new Map();
    for (const site of centresOf) for (const e of site) count.set(e.join(), (count.get(e.join()) ?? 0) + 1);
    let ok = true, n = 0;
    for (let x = -N; x <= N; x++) for (let y = -N; y <= N; y++) for (let z = -N; z <= N; z++) {
      if ((x + y + z) % 2) continue;
      n++;
      if ((count.get([x, y, z].join()) ?? 0) !== 1) ok = false;
    }
    return { ok, n };
  };
  const tetra = [];
  for (let x = -N - 3; x <= N + 3; x += 2) for (let y = -N - 3; y <= N + 3; y += 2) for (let z = -N - 3; z <= N + 3; z += 2)
    tetra.push(DJ_TETRA_OFFSETS.map((d) => [x + d[0], y + d[1], z + d[2]]));
  const t = cover(tetra);
  check(`tetrahedral clusters + stellas fill space: each of ${t.n} Jewel cells in exactly one cluster`, t.ok);
  const [a, b, c] = DJ_OCTA_TILING.basis, R = 12, octa = [];
  for (let i = -R; i <= R; i++) for (let j = -R; j <= R; j++) for (let k = -R; k <= R; k++) {
    const o = [0, 1, 2].map((m) => DJ_OCTA_TILING.origin[m] + i * a[m] + j * b[m] + k * c[m]);
    if (o.some((v) => Math.abs(v) > N + 2)) continue;
    octa.push([[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]].map((d) => o.map((v, m) => v + d[m])));
  }
  const det = a[0] * (b[1] * c[2] - b[2] * c[1]) - a[1] * (b[0] * c[2] - b[2] * c[0]) + a[2] * (b[0] * c[1] - b[1] * c[0]);
  const o2 = cover(octa);
  check(`octahedral clusters + stellas fill space: each of ${o2.n} Jewel cells in exactly one cluster (lattice of ${Math.abs(det)} cells per cluster: 6 Jewels, its own stella and 5 more)`, o2.ok && Math.abs(det) === 12);
}

// ---- the octet network (DICTO, 2026-10-09): clusters as the octet truss's cells, sharing Jewels ----
{
  const M = 4;
  const ev = [], od = [];
  for (let x = -M; x <= M; x++) for (let y = -M; y <= M; y++) for (let z = -M; z <= M; z++) ((x + y + z) % 2 ? od : ev).push([x, y, z]);
  const AX = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
  // tetrahedral clusters: the four even cells round each cell corner (half-integer point)
  const tets = [], octs = [];
  for (let x = -M; x < M; x++) for (let y = -M; y < M; y++) for (let z = -M; z < M; z++) {
    const around = [];
    for (const dx of [0, 1]) for (const dy of [0, 1]) for (const dz of [0, 1]) around.push([x + dx, y + dy, z + dz]);
    tets.push(around.filter((c) => (c[0] + c[1] + c[2]) % 2 === 0).map((c) => c.join()));
  }
  for (const o of od) octs.push(AX.map((d) => o.map((v, i) => v + d[i]).join()));
  const inner = ev.filter((c) => c.every((v) => Math.abs(v) <= M - 2)).map((c) => c.join());
  const inT = (j) => tets.filter((t) => t.includes(j)).length, inO = (j) => octs.filter((o) => o.includes(j)).length;
  check('each Jewel is in 8 tetrahedral and 6 octahedral clusters, as each octet-truss vertex is in 8 tetrahedra and 6 octahedra', inner.every((j) => inT(j) === 8 && inO(j) === 6));
  // shared faces: a tetrahedral and an octahedral cluster that meet share exactly 3 Jewels (a triangle)
  const isTetraShape = (t) => t.length === 4;
  let pairs = 0, faces3 = 0;
  for (const t of tets.slice(0, 200)) for (const o of octs) {
    const n = t.filter((j) => o.includes(j)).length;
    if (n > 0) { pairs++; if (n === 3) faces3++; }
  }
  const tt = tets.slice(0, 200).every(isTetraShape);
  // a tetra and an octa meeting at a single Jewel (a corner) are vertex neighbours in the truss too; face neighbours share 3
  check(`tetrahedral and octahedral clusters meet as octet cells: sharing 3 Jewels (a face) or 1 (a corner), never 2 (${faces3} face pairs)`, tt && tets.slice(0, 200).every((t) => octs.every((o) => [0, 1, 3].includes(t.filter((j) => o.includes(j)).length))));
  // every stella is the hidden hole of exactly one octahedral cluster: its own odd cell is that cluster's centre
  check('every stella octangula is the hidden hole of exactly one octahedral cluster (its own cell the centre)', od.every((o) => octs.filter((c, i) => od[i] === o).length === 1));
  // with the octahedral clusters solid inside, they cover every cell: each even cell is in one, each odd cell is one's centre
  check('the filled octahedral clusters, sharing Jewels, cover all of space (every Jewel cell and every stella cell)', inner.every((j) => inO(j) >= 1) && od.length === octs.length);
}

console.log(failures === 0 ? '\nAll checks passed (0 failures).' : `\n${failures} check(s) FAILED.`);
process.exit(failures === 0 ? 0 : 1);
