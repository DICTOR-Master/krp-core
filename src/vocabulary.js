// KRP vocabulary (stage 1 of DICTO's KRP Amoeba plan): the shared words for a generated object,
// as code. VOCABULARY.md defines each term; this file is the one place they are spelled.
//
// An object is never stored as the truth: it is regenerated from its generator, the core's
// version and its parameter state, which together make its ID. A fingerprint of its coordinates
// is added only when it is deliberately retained, to prove a regeneration still matches.

/** The core's version, the version of every generator in it (equals package.json; checked). */
export const KRP_VERSION = '0.15.0';

/** Checking, in order. Unresolved can replace any step whose identification or validation is incomplete. */
export const STATUSES = ['Generated', 'Candidate', 'Recognized', 'Verified', 'Curated'];
export const UNRESOLVED = 'Unresolved';

/** Originality, kept apart from status: generated does not mean new. */
export const NOVELTY = ['not-searched', 'not-found', 'prior-art', 'specialist-checked'];

/** What happens to an object after use. */
export const RETENTION = ['ephemeral', 'cached', 'retained'];

// ---- object IDs: generator@version?parameters ----
const GENERATOR_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)+$/;
const VERSION_RE = /^\d+\.\d+\.\d+$/;
const KEY_RE = /^[a-z][a-zA-Z0-9]*$/;

function encodeValue(v) {
  if (typeof v === 'number') {
    if (!Number.isFinite(v)) throw new Error(`parameter value ${v} is not finite`);
    return String(v + 0); // shortest round-trip form; -0 becomes 0
  }
  if (typeof v === 'boolean') return String(v);
  if (typeof v === 'string') return `'${encodeURIComponent(v)}'`;
  throw new Error(`parameter values are numbers, booleans or strings, not ${typeof v}`);
}
function decodeValue(s) {
  if (s === 'true' || s === 'false') return s === 'true';
  if (s.startsWith("'") && s.endsWith("'")) return decodeURIComponent(s.slice(1, -1));
  const n = Number(s);
  if (s === '' || !Number.isFinite(n)) throw new Error(`bad parameter value '${s}'`);
  return n;
}

/** The object ID: e.g. ekp/dogstar@0.3.0, ekp/expanded-windows@0.3.0?push=0.3. Keys sorted. */
export function objectId(generator, params = {}, version = KRP_VERSION) {
  if (!GENERATOR_RE.test(generator)) throw new Error(`bad generator name '${generator}'`);
  if (!VERSION_RE.test(version)) throw new Error(`bad version '${version}'`);
  const keys = Object.keys(params).sort();
  for (const k of keys) if (!KEY_RE.test(k)) throw new Error(`bad parameter name '${k}'`);
  const query = keys.map((k) => `${k}=${encodeValue(params[k])}`).join('&');
  return `${generator}@${version}${query ? `?${query}` : ''}`;
}

/** The inverse of objectId. */
export function parseObjectId(id) {
  const m = /^([^@?]+)@([^?]+)(?:\?(.*))?$/.exec(id);
  if (!m || !GENERATOR_RE.test(m[1]) || !VERSION_RE.test(m[2])) throw new Error(`bad object ID '${id}'`);
  const params = {};
  if (m[3]) for (const pair of m[3].split('&')) {
    const i = pair.indexOf('=');
    const k = pair.slice(0, i);
    if (i < 1 || !KEY_RE.test(k)) throw new Error(`bad parameter in '${id}'`);
    params[k] = decodeValue(pair.slice(i + 1));
  }
  return { generator: m[1], version: m[2], params };
}

// ---- topology and measurements, from faces (polygons of [x, y, z] corners) ----
const keyOf = (p) => p.map((c) => (Math.round(c * 1e9) / 1e9 + 0).toFixed(9)).join(',');

/** Corners, edges and faces counted with corners merged, face sizes, closure and components. */
export function topologyOf(faces) {
  const corners = new Map();
  const id = (p) => { const k = keyOf(p); if (!corners.has(k)) corners.set(k, corners.size); return corners.get(k); };
  const F = faces.map((f) => f.map(id));
  const half = new Map();
  const parent = [...Array(corners.size).keys()];
  const find = (i) => (parent[i] === i ? i : (parent[i] = find(parent[i])));
  for (const f of F) f.forEach((a, j) => {
    const b = f[(j + 1) % f.length];
    half.set(`${a}>${b}`, (half.get(`${a}>${b}`) ?? 0) + 1);
    parent[find(a)] = find(b);
  });
  const edges = new Set([...half.keys()].map((k) => k.split('>').map(Number).sort((x, y) => x - y).join('-')));
  // Closed and outward-consistent: every directed edge once, its reverse once.
  const closed = [...half.entries()].every(([k, n]) => { const [a, b] = k.split('>'); return n === 1 && half.get(`${b}>${a}`) === 1; });
  const faceSizes = {};
  for (const f of F) faceSizes[f.length] = (faceSizes[f.length] ?? 0) + 1;
  const components = new Set([...Array(corners.size).keys()].map(find)).size;
  return { vertices: corners.size, edges: edges.size, faces: F.length, faceSizes, closed, components, euler: corners.size - edges.size + F.length };
}

/** Volume of closed, outward-wound faces (divergence theorem). */
export function volumeOf(faces) {
  let v = 0;
  for (const f of faces) for (let i = 1; i + 1 < f.length; i++) {
    const [a, b, c] = [f[0], f[i], f[i + 1]];
    v += a[0] * (b[1] * c[2] - b[2] * c[1]) - a[1] * (b[0] * c[2] - b[2] * c[0]) + a[2] * (b[0] * c[1] - b[1] * c[0]);
  }
  return v / 6;
}

/** The distinct edge lengths, rounded to 1e-9, shortest first. */
export function edgeLengthsOf(faces) {
  const L = new Set();
  for (const f of faces) f.forEach((p, i) => { const q = f[(i + 1) % f.length]; L.add(Math.round(Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]) * 1e9) / 1e9); });
  return [...L].sort((a, b) => a - b);
}

/** A fingerprint of the coordinates (FNV-1a, 64-bit, over the faces in a canonical order): the
 *  same for any regeneration, different for different geometry. Not a security hash. */
export function fingerprintOf(faces) {
  const canon = faces.map((f) => {
    const k = f.map(keyOf);
    let s = 0;
    for (let i = 1; i < k.length; i++) if (k[i] < k[s]) s = i;
    return [...k.slice(s), ...k.slice(0, s)].join(';'); // same start corner, same winding
  }).sort().join('|');
  let h = 0xcbf29ce484222325n;
  for (let i = 0; i < canon.length; i++) h = BigInt.asUintN(64, (h ^ BigInt(canon.charCodeAt(i))) * 0x100000001b3n);
  return h.toString(16).padStart(16, '0');
}
