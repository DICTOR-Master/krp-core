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
 */
import { solidsOverlap, placedSolid, placeVertices } from './overlap.js';

const K = (1 + Math.sqrt(5)) / 4; // phi / 2
const IDENTITY = [0, 0, 0, 1];
const AXES = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
const FACE_DIAGONALS = [];
for (const [i, j] of [[0, 1], [0, 2], [1, 2]]) for (const a of [-1, 1]) for (const b of [-1, 1]) { const v = [0, 0, 0]; v[i] = a; v[j] = b; FACE_DIAGONALS.push(v); }
const hexaRule = (same, other) => [
  ...AXES.map((v) => ({ shape: other, offset: v.map((x) => 4 * K * x), quaternion: IDENTITY })),
  ...FACE_DIAGONALS.map((v) => ({ shape: same, offset: v.map((x) => 4 * K * x), quaternion: IDENTITY })),
];

export const HINT_RULES = {
  DICTO_HEXA: hexaRule('DICTO_HEXA', 'DICTO_HEXA_KEY'),
  DICTO_HEXA_KEY: hexaRule('DICTO_HEXA_KEY', 'DICTO_HEXA'),
};
// Patterns on a lattice (spacing, in the piece's frame): a slot on the same lattice as a built piece,
// in the same turn, cannot pass through it, so only pieces off that lattice are tested.
const LATTICE = { DICTO_HEXA: { spacing: 4 * K, kin: 'hexa' }, DICTO_HEXA_KEY: { spacing: 4 * K, kin: 'hexa' } };

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
  const slots = [];
  for (const n of nodes) {
    for (const r of HINT_RULES[n.shape] ?? []) {
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
    if (built.some((b) => !onLattice(b.n, s) && solidsOverlap(solidOf(b), mine))) continue;
    out.push(s);
  }
  return out;
}
