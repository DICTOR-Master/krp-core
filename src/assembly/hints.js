/**
 * What comes next (DICTO 2026-10-09: "needs more visual clue help what comes next"): for pieces that
 * build a known pattern, the spots next to a build where the pattern's next pieces go. Each rule lists
 * a piece's neighbours in its own frame: { shape, offset, quaternion }. A slot is offered where it is
 * free (no piece there) and passes through nothing already built.
 *
 * The DICTO Hexa and Hexa-Key: plain copies on a cubic lattice of spacing 4 (raw, x phi/2 here), a
 * Hexa or a Key by parity like a 3D chessboard. Their neighbours along the axes share a whole wall,
 * those on the face diagonals a window; the body diagonals touch at one corner only, so they are not
 * offered.
 *
 * The DICTO Dodeca-13 (DISCOVERIES #13 and #17): two clusters can share an outer dodecahedron only
 * by overlapping, so as solid pieces they go on in its two clean patterns: the mirror column (along
 * each five-fold axis, 6 inradii out, turned 36 degrees, so the facing pentagons meet whole) and the
 * bcc stack (along the 8 cube diagonals, a = 6.668296 at edge 1, touching edge to edge).
 *
 * The space-filling pairs: the Stella–Jewel and Sunstar Lattices are the Hexa's checkerboard at half
 * its spacing (DICTO Jewels or seamed dodecahedra on the even cells, stellas or Dogstars on the odd,
 * all plain copies); the other pairs' honeycombs come from honeycombs.js. A pair's hints show once
 * both its pieces are in the build, or at once for a piece in no other pair (a tetrahedron alone could
 * be in the octet truss or the pyrochlore).
 */
import { solidsOverlap, placedSolid, placeVertices } from './overlap.js';
import { honeycombRules } from './honeycombs.js';
import { SPACE_FILLING_PAIR_LIST } from '../polyhedra/families.js';
import { DJ_OCTA_TILING } from '../polyhedra/stellaJewel.js';

const K = (1 + Math.sqrt(5)) / 4; // phi / 2
const IDENTITY = [0, 0, 0, 1];
const AXES = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
const FACE_DIAGONALS = [];
for (const [i, j] of [[0, 1], [0, 2], [1, 2]]) for (const a of [-1, 1]) for (const b of [-1, 1]) { const v = [0, 0, 0]; v[i] = a; v[j] = b; FACE_DIAGONALS.push(v); }
const hexaRule = (same, other, spacing = 4 * K) => [
  ...AXES.map((v) => ({ shape: other, offset: v.map((x) => spacing * x), quaternion: IDENTITY })),
  ...FACE_DIAGONALS.map((v) => ({ shape: same, offset: v.map((x) => spacing * x), quaternion: IDENTITY })),
];

const PHI = (1 + Math.sqrt(5)) / 2;
const unit = (v) => { const l = Math.hypot(...v); return v.map((x) => x / l); };
const turnAbout = (u, angle) => { const s = Math.sin(angle / 2); return [u[0] * s, u[1] * s, u[2] * s, Math.cos(angle / 2)]; };
// The dodecahedron's 12 face normals (the cluster's five-fold axes): cyclic (0, +-1, +-phi).
const FIVE_FOLD = [];
for (const a of [-1, 1]) for (const b of [-1, 1]) FIVE_FOLD.push(unit([0, a, b * PHI]), unit([a, b * PHI, 0]), unit([b * PHI, 0, a]));
const R_IN = PHI * PHI / (2 * Math.sqrt(3 - PHI)); // the dodecahedron's inradius at edge 1
const BCC_A = 6.668296;
const DODECA13_RULE = [
  ...FIVE_FOLD.map((u) => ({ shape: 'DICTO_DODECA13', offset: u.map((x) => 6 * R_IN * x), quaternion: turnAbout(u, Math.PI / 5) })),
  ...[-1, 1].flatMap((x) => [-1, 1].flatMap((y) => [-1, 1].map((z) => ({ shape: 'DICTO_DODECA13', offset: [x, y, z].map((c) => (c * BCC_A) / 2), quaternion: IDENTITY })))),
];

// The Admiral Cap (DICTO 2026-10-13: "needs a helper outline"): six caps on the icosahedron's six edges parallel to the axes make
// the regular octahedron of edge phi^2/sqrt2 (edgeRoof.js). The cap's own frame is the icosahedron's (D20, edge 1, centred), its
// apex on +x; the others are the same cap turned by pi about z (to -x) and by the icosahedron's three-fold turn x -> y -> z.
// All seven pieces share one origin, the icosahedron's centre.
const CYCLE = [0.5, 0.5, 0.5, 0.5]; // 120 degrees about (1,1,1): x -> y -> z -> x
const HALF_Z = [0, 0, 1, 0];
const qm = ([ax, ay, az, aw], [bx, by, bz, bw]) => [aw * bx + ax * bw + ay * bz - az * by, aw * by - ax * bz + ay * bw + az * bx, aw * bz + ax * by - ay * bx + az * bw, aw * bw - ax * bx - ay * by - az * bz];
const CAP_TURNS = [IDENTITY, HALF_Z, CYCLE, qm(CYCLE, HALF_Z), qm(CYCLE, CYCLE), qm(qm(CYCLE, CYCLE), HALF_Z)];
const ADMIRAL_CAPS = CAP_TURNS.map((quaternion) => ({ shape: 'DICTO_EDGE_ROOF', offset: [0, 0, 0], quaternion }));
const ADMIRAL_RULE = [{ shape: 'D20', offset: [0, 0, 0], quaternion: IDENTITY }, ...ADMIRAL_CAPS.slice(1)];
// Pieces whose pattern shares one origin: a slot there is only "taken" by the same piece in the same turn.
const SHARED_ORIGIN = new Set(['DICTO_EDGE_ROOF', 'D20']);

// DICTO's clusters (DICTO 2026-10-20; the Jewel paper #41 and the Sunstar paper #42): the Jewel-Tetra and Jewel-Octa, and the
// Sunstar-Tetra and Sunstar-Octa (the same cells, dodecahedra and Dogstars for Jewels and stellas), each on its tiling with loose
// stellas or Dogstars. In cell units (a cell is 2K here), from the cluster's own centre: the Tetra on the all-even anchors (its next
// copies 2 cells along the axes and the face diagonals), the Octa on the lattice DJ_OCTA_TILING (its 10 shortest steps); the loose
// pieces on the odd cells beside its Jewels or dodecahedra (for the Octa none of them a lattice point, so all are loose).
const CELL = 2 * K;
const cellRule = (entries) => entries.map(([shape, v]) => ({ shape, offset: v.map((x) => CELL * x), quaternion: IDENTITY }));
const keyOf = (v) => v.join(',');
const TETRA_CELLS = [[0, 0, 0], [1, 1, 0], [1, 0, 1], [0, 1, 1]];
const TETRA_STEPS = [...AXES, ...FACE_DIAGONALS].map((v) => v.map((x) => 2 * x));
const TETRA_LOOSE = [...new Map(TETRA_CELLS.flatMap((c) => AXES.map((e) => c.map((x, k) => x + e[k]))).map((o) => [keyOf(o), o.map((x) => x - 0.5)])).values()];
const OCTA_STEPS = [];
for (const a of [-1, 0, 1]) for (const b of [-1, 0, 1]) for (const c of [-1, 0, 1]) {
  const v = [0, 1, 2].map((k) => a * DJ_OCTA_TILING.basis[0][k] + b * DJ_OCTA_TILING.basis[1][k] + c * DJ_OCTA_TILING.basis[2][k]);
  if (v.some((x) => x) && v.reduce((t, x) => t + x * x, 0) <= 8) OCTA_STEPS.push(v);
}
const OCTA_LOOSE = [...new Map(AXES.flatMap((j) => AXES.map((e) => j.map((x, k) => x + e[k]))).filter((v) => v.some((x) => x)).map((v) => [keyOf(v), v])).values()];
const tetraRule = (cluster, loose) => cellRule([...TETRA_STEPS.map((v) => [cluster, v]), ...TETRA_LOOSE.map((v) => [loose, v])]);
const octaRule = (cluster, loose) => cellRule([...OCTA_STEPS.map((v) => [cluster, v]), ...OCTA_LOOSE.map((v) => [loose, v])]);

export const HINT_RULES = {
  DICTO_EDGE_ROOF: ADMIRAL_RULE,
  DICTO_HEXA: hexaRule('DICTO_HEXA', 'DICTO_HEXA_KEY'),
  DICTO_HEXA_KEY: hexaRule('DICTO_HEXA_KEY', 'DICTO_HEXA'),
  DICTO_DODECA13: DODECA13_RULE,
  DRAGON_JEWEL: hexaRule('DRAGON_JEWEL', 'STELLA_OCTANGULA', 2 * K),
  STELLA_OCTANGULA: hexaRule('STELLA_OCTANGULA', 'DRAGON_JEWEL', 2 * K),
  SEAMED_DODECAHEDRON: hexaRule('SEAMED_DODECAHEDRON', 'DOGSTAR', 2 * K),
  DOGSTAR: hexaRule('DOGSTAR', 'SEAMED_DODECAHEDRON', 2 * K),
  DJ_TETRAHEDRAL_CLUSTER: tetraRule('DJ_TETRAHEDRAL_CLUSTER', 'STELLA_OCTANGULA'),
  DJ_OCTAHEDRAL_CLUSTER: octaRule('DJ_OCTAHEDRAL_CLUSTER', 'STELLA_OCTANGULA'),
  DODECA_TETRAHEDRAL_CLUSTER: tetraRule('DODECA_TETRAHEDRAL_CLUSTER', 'DOGSTAR'),
  DODECA_OCTAHEDRAL_CLUSTER: octaRule('DODECA_OCTAHEDRAL_CLUSTER', 'DOGSTAR'),
};
// The honeycomb pairs (not the two above): rules per honeycomb, worked out once.
const HONEYCOMB_PAIRS = SPACE_FILLING_PAIR_LIST.filter((p) => !p.nonConvex);
const pairsOf = (shape) => HONEYCOMB_PAIRS.filter((p) => p.ids.includes(shape));
const honeycombCache = new Map();
const rulesOf = (pair, specs) => { if (!honeycombCache.has(pair.honeycomb)) honeycombCache.set(pair.honeycomb, honeycombRules(pair.honeycomb, specs)); return honeycombCache.get(pair.honeycomb); };
/** Each node's rules in this build: its own pattern's, and those of the pairs active here. */
function rulesFor(nodes, specs) {
  const present = new Set(nodes.map((n) => n.shape));
  const active = HONEYCOMB_PAIRS.filter((p) => p.ids.every((id) => present.has(id)) || p.ids.some((id) => present.has(id) && pairsOf(id).length === 1));
  // An icosahedron in a build with an Admiral Cap shows the six cap places (alone, it has no pattern).
  const extra = (shape) => (shape === 'D20' && present.has('DICTO_EDGE_ROOF') ? ADMIRAL_CAPS : []);
  return (shape) => [...(HINT_RULES[shape] ?? []), ...extra(shape), ...active.filter((p) => p.ids.includes(shape)).flatMap((p) => rulesOf(p, specs)[shape] ?? [])];
}
/** Whether a build has any piece with hints (its own pattern, or an active pair's). */
export function hasHints(nodes, specs) {
  const rules = rulesFor(nodes, specs);
  return nodes.some((n) => rules(n.shape).length > 0);
}
// Patterns on a lattice (spacing, in the piece's frame): a slot on the same lattice as a built piece,
// in the same turn, cannot pass through it, so only pieces off that lattice are tested.
const LATTICE = {
  DICTO_HEXA: { spacing: 4 * K, kin: 'hexa' }, DICTO_HEXA_KEY: { spacing: 4 * K, kin: 'hexa' },
  DRAGON_JEWEL: { spacing: 2 * K, kin: 'sj' }, STELLA_OCTANGULA: { spacing: 2 * K, kin: 'sj' },
  SEAMED_DODECAHEDRON: { spacing: 2 * K, kin: 'sun' }, DOGSTAR: { spacing: 2 * K, kin: 'sun' },
};

// A spec's bounding radius about its own origin (where its placement's position puts it).
const radii = new WeakMap();
const radiusOf = (spec) => { if (!radii.has(spec)) radii.set(spec, Math.max(...spec.vertices.map((v) => Math.hypot(...v)))); return radii.get(spec); };
const qmul = ([ax, ay, az, aw], [bx, by, bz, bw]) => [aw * bx + ax * bw + ay * bz - az * by, aw * by - ax * bz + ay * bw + az * bx, aw * bz + ax * by - ay * bx + az * bw, aw * bw - ax * bx - ay * by - az * bz];
const close = (a, b, eps) => a.every((x, i) => Math.abs(x - b[i]) < eps);
// Same orientation (q and -q are one turn).
const sameTurn = (a, b) => Math.abs(a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3]) > 1 - 1e-6;

/**
 * The free slots next to a build: [{ shape, position, quaternion, from }] (from: the node ids it
 * neighbours), the ones touching the most built pieces first, then nearest `near` (default the build's
 * middle), at most `cap`. So a build grows compactly round its middle (DICTO 2026-10-20: when the hints
 * followed the piece placed last, a build could end up "miles away from where it should be").
 * nodes: [{ id, shape, transform: { position, quaternion } }]; specs: shape id -> spec.
 */
export function hintSlots(nodes, specs, { cap = 12, near } = {}) {
  const slots = [], rules = rulesFor(nodes, specs);
  for (const n of nodes) {
    for (const r of rules(n.shape)) {
      if (!specs[r.shape]) continue;
      const position = placeVertices([r.offset], n.transform.position, n.transform.quaternion)[0];
      const quaternion = qmul(n.transform.quaternion, r.quaternion);
      const same = slots.find((s) => s.shape === r.shape && close(s.position, position, 1e-4) && sameTurn(s.quaternion, quaternion));
      if (same) { same.from.push(n.id); continue; }
      slots.push({ shape: r.shape, position, quaternion, from: [n.id] });
    }
  }
  if (!slots.length) return [];
  const mid = near ?? [0, 1, 2].map((k) => nodes.reduce((t, n) => t + n.transform.position[k], 0) / nodes.length);
  const dist = (s) => Math.hypot(...s.position.map((x, k) => x - mid[k]));
  slots.sort((a, b) => b.from.length - a.from.length || dist(a) - dist(b));
  const built = nodes.filter((n) => specs[n.shape]).map((n) => ({ n, solid: null }));
  const solidOf = (b) => (b.solid ??= placedSolid(specs[b.n.shape], b.n.transform.position, b.n.transform.quaternion));
  const onLattice = (n, s) => {
    const a = LATTICE[n.shape], c = LATTICE[s.shape];
    if (!a || !c || a.kin !== c.kin || !sameTurn(n.transform.quaternion, s.quaternion)) return false;
    const [x, y, z, w] = n.transform.quaternion; // the offset in n's own frame (inverse turn)
    const d = placeVertices([s.position.map((v, k) => v - n.transform.position[k])], [0, 0, 0], [-x, -y, -z, w])[0].map((v) => v / a.spacing);
    return d.every((v) => Math.abs(v - Math.round(v)) < 1e-4);
  };
  const out = [];
  for (const s of slots) {
    if (out.length >= cap) break;
    const taken = (n) => close(n.transform.position, s.position, 1e-4)
      && (!(SHARED_ORIGIN.has(n.shape) && SHARED_ORIGIN.has(s.shape)) || (n.shape === s.shape && sameTurn(n.transform.quaternion, s.quaternion)));
    if (nodes.some(taken)) continue; // a piece is there
    let cached = null;
    const mine = { get vertices() { return (cached ??= placedSolid(specs[s.shape], s.position, s.quaternion)).vertices; }, get faces() { return specs[s.shape].faces; }, get samples() { return (cached ??= placedSolid(specs[s.shape], s.position, s.quaternion)).samples; } };
    // Pieces too far apart to touch (their bounding spheres apart) need no test.
    const far = (b) => Math.hypot(...b.n.transform.position.map((x, k) => x - s.position[k])) > radiusOf(specs[b.n.shape]) + radiusOf(specs[s.shape]);
    if (built.some((b) => !far(b) && !onLattice(b.n, s) && solidsOverlap(solidOf(b), mine))) continue;
    out.push(s);
  }
  return out;
}
