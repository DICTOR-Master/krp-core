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

export const HINT_RULES = {
  DICTO_HEXA: hexaRule('DICTO_HEXA', 'DICTO_HEXA_KEY'),
  DICTO_HEXA_KEY: hexaRule('DICTO_HEXA_KEY', 'DICTO_HEXA'),
  DICTO_DODECA13: DODECA13_RULE,
  DRAGON_JEWEL: hexaRule('DRAGON_JEWEL', 'STELLA_OCTANGULA', 2 * K),
  STELLA_OCTANGULA: hexaRule('STELLA_OCTANGULA', 'DRAGON_JEWEL', 2 * K),
  SEAMED_DODECAHEDRON: hexaRule('SEAMED_DODECAHEDRON', 'DOGSTAR', 2 * K),
  DOGSTAR: hexaRule('DOGSTAR', 'SEAMED_DODECAHEDRON', 2 * K),
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
  return (shape) => [...(HINT_RULES[shape] ?? []), ...active.filter((p) => p.ids.includes(shape)).flatMap((p) => rulesOf(p, specs)[shape] ?? [])];
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
 * neighbours), nearest `near` first (default the build's middle; the app passes the piece placed
 * last, so the hint follows the hand), at most `cap`. nodes: [{ id, shape, transform: { position,
 * quaternion } }]; specs: shape id -> spec.
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
  slots.sort((a, b) => dist(a) - dist(b));
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
    if (nodes.some((n) => close(n.transform.position, s.position, 1e-4))) continue; // a piece is there
    let cached = null;
    const mine = { get vertices() { return (cached ??= placedSolid(specs[s.shape], s.position, s.quaternion)).vertices; }, get faces() { return specs[s.shape].faces; }, get samples() { return (cached ??= placedSolid(specs[s.shape], s.position, s.quaternion)).samples; } };
    // Pieces too far apart to touch (their bounding spheres apart) need no test.
    const far = (b) => Math.hypot(...b.n.transform.position.map((x, k) => x - s.position[k])) > radiusOf(specs[b.n.shape]) + radiusOf(specs[s.shape]);
    if (built.some((b) => !far(b) && !onLattice(b.n, s) && solidsOverlap(solidOf(b), mine))) continue;
    out.push(s);
  }
  return out;
}
