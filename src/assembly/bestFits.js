/**
 * Best fits (DICTO 2026-10-13: "it needs a helper outline, possible placements, and offer best matches only"): for any build, the
 * places where a catalogue piece sits flush on a free face, passes through nothing, and closes the most faces against the build.
 *
 * A face is free when the point just outside its middle is inside no other piece. Every piece with a face congruent to it (and allowed
 * there: faceMates) is tried in every flush turn (faceAttach.js); a placement that overlaps the build is dropped. Its score is the
 * number of its faces that close against the build (the point just outside a face's middle is inside a built piece), so a piece
 * filling a notch beats one standing on a single face. The free faces nearest `near` (the piece placed last) are searched first.
 *
 * Returns [{ shape, position, quaternion, closes, from }], best first, at most `count`, each shape once (the chosen shape up to twice).
 */
import * as THREE from 'three';
import { facesCongruent } from '../polyhedra/core.js';
import { isFaceEligibleForAttach } from '../polyhedra/index.js';
import { faceAttachOptions } from './faceAttach.js';
import { solidsOverlap, placedSolid, insideSolid, placeVertices } from './overlap.js';

const cached = (fn) => { const m = new WeakMap(); return (spec) => { if (!m.has(spec)) m.set(spec, fn(spec)); return m.get(spec); }; };
const edgeOf = cached((spec) => spec.edges.reduce((t, [a, b]) => t + Math.hypot(...spec.vertices[a].map((x, i) => x - spec.vertices[b][i])), 0) / spec.edges.length);
const radiusOf = cached((spec) => Math.max(...spec.vertices.map((v) => Math.hypot(...v))));
// A face's shape, for a quick first sort: its corner count and its sides, rounded.
const signature = (V, f) => `${f.length}:${f.map((a, i) => Math.hypot(...V[a].map((x, k) => x - V[f[(i + 1) % f.length]][k])).toFixed(3)).sort().join(',')}`;
const indexes = new WeakMap();
function faceIndex(specs) {
  if (indexes.has(specs)) return indexes.get(specs);
  const index = new Map();
  for (const [id, spec] of Object.entries(specs)) {
    if (!spec?.faces || !spec.edges) continue;
    spec.faces.forEach((f, k) => {
      if (!isFaceEligibleForAttach(spec, k)) return;
      const sig = signature(spec.vertices, f);
      if (!index.has(sig)) index.set(sig, new Map());
      const byShape = index.get(sig);
      if (!byShape.has(id)) byShape.set(id, []);
      byShape.get(id).push(k);
    });
  }
  indexes.set(specs, index);
  return index;
}
const matrixOf = (n) => new THREE.Matrix4().compose(new THREE.Vector3(...n.transform.position), new THREE.Quaternion(...n.transform.quaternion), new THREE.Vector3(1, 1, 1));
const centroidOf = (spec, position, quaternion) => { const P = placeVertices(spec.vertices, position, quaternion); return [0, 1, 2].map((k) => P.reduce((t, p) => t + p[k], 0) / P.length); };
// The point just outside each face's middle, placed.
function outsidePoints(spec, position, quaternion) {
  const P = placeVertices(spec.vertices, position, quaternion), step = 0.02 * edgeOf(spec);
  return spec.faces.map((f) => {
    const c = [0, 1, 2].map((k) => f.reduce((t, a) => t + P[a][k], 0) / f.length);
    const u = [0, 1, 2].map((k) => P[f[1]][k] - P[f[0]][k]), v = [0, 1, 2].map((k) => P[f[2]][k] - P[f[0]][k]);
    const n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]], l = Math.hypot(...n) || 1;
    return c.map((x, k) => x + (step * n[k]) / l);
  });
}

export function bestFits(nodes, specs, { near, chosen = null, preferred = [], count = 3, maxFaces = 12, shapes = null } = {}) {
  const built = nodes.filter((n) => specs[n.shape]).map((n) => ({ n, spec: specs[n.shape], solid: placedSolid(specs[n.shape], n.transform.position, n.transform.quaternion) }));
  if (!built.length) return [];
  const centre = (b) => b.n.transform.position;
  const nearOf = (p, b) => Math.hypot(...p.map((x, k) => x - centre(b)[k])) <= radiusOf(b.spec) + 0.05;
  const insideBuild = (p, except) => built.some((b) => b !== except && nearOf(p, b) && insideSolid(b.solid, p));
  // The free faces, nearest the hand first.
  const mid = near ?? built.at(-1).n.transform.position;
  const free = [];
  for (const b of built) {
    outsidePoints(b.spec, b.n.transform.position, b.n.transform.quaternion).forEach((p, fi) => {
      if (!isFaceEligibleForAttach(b.spec, fi) || insideBuild(p, b)) return;
      free.push({ b, fi, d: Math.hypot(...p.map((x, k) => x - mid[k])) });
    });
  }
  free.sort((x, y) => x.d - y.d);
  const index = faceIndex(specs), found = [];
  // Stellation pieces and big clusters are suggested only once they're in the build, chosen or among the ones you use: plain pieces
  // first (and far fewer to try).
  const known = new Set([...nodes.map((n) => n.shape), chosen, ...preferred]);
  for (const { b, fi } of free.slice(0, maxFaces)) {
    const target = b.spec, tf = target.faces[fi];
    const byShape = index.get(signature(target.vertices, tf));
    if (!byShape) continue;
    for (const [id, faces] of byShape) {
      if (shapes && !shapes.includes(id)) continue;
      if (!known.has(id) && (id.startsWith('STELLATION_') || specs[id].vertices.length > 40)) continue;
      if (target.faceMates?.[fi] && !target.faceMates[fi].includes(id)) continue;
      const spec = specs[id];
      const incoming = faces.filter((k) => (!spec.faceMates?.[k] || spec.faceMates[k].includes(b.n.shape)) && facesCongruent(target.vertices, tf, spec.vertices, spec.faces[k]));
      if (!incoming.length) continue;
      // One incoming face at a time (faceAttach's own de-duplication grows fast on big symmetric pieces); repeats of one placement
      // (a symmetric piece reached through another of its faces) are dropped at the end.
      const M = matrixOf(b.n);
      for (const o of incoming.flatMap((k) => faceAttachOptions(target, fi, M, spec, [k]))) {
        const position = o.position.toArray(), quaternion = o.quaternion.toArray();
        const closes = outsidePoints(spec, position, quaternion).filter((p) => insideBuild(p, null)).length;
        found.push({ shape: id, position, quaternion, closes, from: [b.n.id], d: Math.hypot(...position.map((v, k) => v - mid[k])) });
      }
    }
  }
  // Most faces closed first; then the chosen shape, shapes already in the build, the ones you use (preferred), the plainer piece
  // (fewer corners); then nearest the hand. Only as many as needed are tested for overlap, best first.
  const inBuild = new Set(nodes.map((n) => n.shape)), liked = new Set(preferred);
  const rank = (f) => [-f.closes, f.shape === chosen ? 0 : 1, inBuild.has(f.shape) ? 0 : 1, liked.has(f.shape) ? 0 : 1, specs[f.shape].vertices.length, f.d];
  found.sort((x, y) => { const a = rank(x), c = rank(y); for (let i = 0; i < a.length; i++) if (a[i] !== c[i]) return a[i] - c[i]; return 0; });
  const out = [], perShape = new Map();
  const clashes = (f) => {
    const spec = specs[f.shape], mine = placedSolid(spec, f.position, f.quaternion), r = radiusOf(spec);
    return built.some((x) => Math.hypot(...f.position.map((v, k) => v - centre(x)[k])) < r + radiusOf(x.spec) && solidsOverlap(x.solid, mine));
  };
  for (const f of found) {
    if (out.length >= count) break;
    const k = perShape.get(f.shape) ?? 0;
    if (k >= (f.shape === chosen ? 2 : 1)) continue;
    f.mid ??= centroidOf(specs[f.shape], f.position, f.quaternion);
    if (out.some((g) => g.shape === f.shape && Math.hypot(...g.mid.map((v, i) => v - f.mid[i])) < 1e-4)) continue;
    if (clashes(f)) continue;
    perShape.set(f.shape, k + 1);
    out.push(f);
  }
  return out.map(({ d, mid, ...slot }) => slot);
}
