// Finds a net tree free of overlap for a solid in geometry-extensions/nets.js (for big non-convex
// solids whose search is too slow to run in the browser). Usage: node scripts/find-net.mjs <id> [maxSeed]
// Prints the [root, shift, depthFirst, seed] to store as that solid's `net`.
import { SOLIDS, netOf } from '../src/geometry-extensions/nets.js';

const [id, maxSeed = '20000'] = process.argv.slice(2);
if (!SOLIDS[id]) { console.error(`unknown solid ${id}`); process.exit(1); }
const faceCount = SOLIDS[id].make().faces.length;
const warn = console.warn; console.warn = () => {};
let best = null;
const tries = [];
for (let root = 0; root < faceCount; root++) for (let shift = 0; shift < 4; shift++) for (const depthFirst of [false, true]) tries.push([root, shift, depthFirst, 0]);
for (let seed = 1; seed <= Number(maxSeed); seed++) tries.push([seed % faceCount, seed % 4, seed % 2 === 0, seed]);
const t0 = Date.now();
for (const tr of tries) {
  SOLIDS[id].net = tr;
  let n;
  try { n = netOf(id); } catch { continue; }
  if (!best || n.overlapCount < best.n) best = { tr, n: n.overlapCount };
  if (n.overlapCount === 0) break;
}
console.warn = warn;
console.log(`${id}: ${faceCount} faces; best net ${JSON.stringify(best.tr)} with ${best.n} overlapping pair(s), ${((Date.now() - t0) / 1000).toFixed(0)} s`);
