// Verifies the "what comes next" hints (assembly/hints.js, DICTO 2026-10-09): from a lone DICTO Hexa
// (and a lone Hexa-Key) the slots offered are its 6 axis neighbours of the other kind and its 12 face-
// diagonal neighbours of its own kind; growing a build by always taking every slot offered, three
// rounds deep, never makes two pieces overlap, and every piece stays on the checkerboard (Hexa where
// the lattice coordinates add up odd from a Key, Key where even).
import { POLYHEDRA } from '../src/polyhedra/index.js';
import { hintSlots } from '../src/assembly/hints.js';
import { solidsOverlap, placedSolid } from '../src/assembly/overlap.js';

let failures = 0;
const check = (label, ok) => { console.log(`${ok ? 'OK  ' : 'FAIL'} ${label}`); if (!ok) failures++; };
const K = (1 + Math.sqrt(5)) / 4, S = 4 * K;
const at = (shape, position, id) => ({ id, shape, transform: { position, quaternion: [0, 0, 0, 1] } });
for (const [self, other] of [['DICTO_HEXA', 'DICTO_HEXA_KEY'], ['DICTO_HEXA_KEY', 'DICTO_HEXA']]) {
  const slots = hintSlots([at(self, [0, 0, 0], 'a')], POLYHEDRA, { cap: 99 });
  const kinds = slots.reduce((t, s) => ({ ...t, [s.shape]: (t[s.shape] ?? 0) + 1 }), {});
  check(`a lone ${POLYHEDRA[self].name}: ${slots.length} slots (${kinds[other] ?? 0} ${POLYHEDRA[other].name}, ${kinds[self] ?? 0} ${POLYHEDRA[self].name}; want 6 and 12)`, kinds[other] === 6 && kinds[self] === 12 && slots.length === 18);
}
{
  const nodes = [at('DICTO_HEXA', [0, 0, 0], 'n0')];
  for (let round = 0; round < 3; round++) for (const s of hintSlots(nodes, POLYHEDRA, { cap: 999 })) nodes.push(at(s.shape, s.position, `n${nodes.length}`));
  const parityOk = nodes.every((n) => { const c = n.transform.position.map((x) => x / S); const r = c.map(Math.round); const odd = (r[0] + r[1] + r[2]) % 2 !== 0; return c.every((x, k) => Math.abs(x - r[k]) < 1e-6) && (n.shape === 'DICTO_HEXA') === !odd; });
  const P = nodes.map((n) => placedSolid(POLYHEDRA[n.shape], n.transform.position));
  let bad = 0;
  for (let i = 0; i < P.length; i++) for (let j = i + 1; j < P.length; j++) if (solidsOverlap(P[i], P[j])) bad++;
  check(`three rounds of every slot: ${nodes.length} pieces, all on the checkerboard, ${bad} overlapping pairs`, parityOk && bad === 0 && nodes.length > 50);
}
console.log(failures ? `${failures} failures.` : 'All checks passed (0 failures).');
process.exit(failures ? 1 : 0);
