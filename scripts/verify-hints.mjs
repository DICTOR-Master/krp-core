// Verifies the "what comes next" hints (assembly/hints.js, DICTO 2026-10-09): from a lone DICTO Hexa
// (and a lone Hexa-Key) the slots offered are its 6 axis neighbours of the other kind and its 12 face-
// diagonal neighbours of its own kind; growing a build by always taking every slot offered, three
// rounds deep, never makes two pieces overlap, and every piece stays on the checkerboard (Hexa where
// the lattice coordinates add up odd from a Key, Key where even). The DICTO Dodeca-13: its mirror
// column and bcc slots, none overlapping when placed one at a time.
import { POLYHEDRA } from '../src/polyhedra/index.js';
import { hintSlots } from '../src/assembly/hints.js';
import { SPACE_FILLING_PAIR_LIST } from '../src/polyhedra/families.js';
import { honeycombRules } from '../src/assembly/honeycombs.js';
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
// The DICTO Dodeca-13: a lone cluster offers its 12 mirror-column and 8 bcc neighbours; placed one at a
// time, as in the app (slots are alternatives, so they are found again after each), none overlap.
{
  const nodes = [at('DICTO_DODECA13', [0, 0, 0], 'd0')];
  const first = hintSlots(nodes, POLYHEDRA, { cap: 99 });
  const turned = first.filter((s) => Math.abs(s.quaternion[3]) < 0.999).length;
  check(`a lone DICTO Dodeca-13: ${first.length} slots (${turned} mirror column, ${first.length - turned} bcc; want 12 and 8)`, turned === 12 && first.length === 20);
  for (let i = 0; i < 10; i++) {
    const s = hintSlots(nodes, POLYHEDRA, { near: nodes.at(-1).transform.position });
    if (!s.length) break;
    const x = s[i % Math.min(4, s.length)];
    nodes.push({ id: `d${nodes.length}`, shape: x.shape, transform: { position: x.position, quaternion: x.quaternion } });
  }
  const P = nodes.map((n) => placedSolid(POLYHEDRA[n.shape], n.transform.position, n.transform.quaternion));
  let bad = 0;
  for (let i = 0; i < P.length; i++) for (let j = i + 1; j < P.length; j++) if (solidsOverlap(P[i], P[j])) bad++;
  check(`${nodes.length} Dodeca-13s placed one slot at a time: ${bad} overlapping pairs`, nodes.length === 11 && bad === 0);
}
// The space-filling pairs: grown by placing a slot at a time (the other kind first while unused) to
// 14 pieces: never overlapping, and both pieces of the pair used. Each lone piece in one pair only
// offers slots at once; a piece in several (tetrahedron, octahedron, cube, triangular prism) waits.
for (const pair of SPACE_FILLING_PAIR_LIST) {
  // A shape in several pairs waits for its partner, so the honeycombs start from a placed pair.
  const nodes = [at(pair.ids[0], [0, 0, 0], 'p0')];
  if (!pair.nonConvex) {
    const r = honeycombRules(pair.honeycomb, POLYHEDRA)[pair.ids[0]].find((x) => x.shape === pair.ids[1]);
    nodes.push({ id: 'p1', shape: r.shape, transform: { position: r.offset, quaternion: r.quaternion } });
  }
  while (nodes.length < 14) {
    const s = hintSlots(nodes, POLYHEDRA, { near: nodes.at(-1).transform.position });
    const pick = s.find((x) => !nodes.some((n) => n.shape === x.shape)) ?? s[0];
    if (!pick) break;
    nodes.push({ id: `p${nodes.length}`, shape: pick.shape, transform: { position: pick.position, quaternion: pick.quaternion } });
  }
  const P = nodes.map((n) => placedSolid(POLYHEDRA[n.shape], n.transform.position, n.transform.quaternion));
  let bad = 0;
  for (let i = 0; i < P.length; i++) for (let j = i + 1; j < P.length; j++) if (solidsOverlap(P[i], P[j])) bad++;
  const used = pair.ids.every((id) => nodes.some((n) => n.shape === id));
  check(`${pair.honeycomb}: ${nodes.length} pieces, both kinds used: ${used}, ${bad} overlapping pairs`, nodes.length === 14 && used && bad === 0);
}
{
  const lone = (id) => hintSlots([at(id, [0, 0, 0], 'x')], POLYHEDRA, { cap: 99 }).length;
  const single = ['TRUNCATED_TETRAHEDRON', 'CUBOCTAHEDRON', 'TRUNCATED_CUBE', 'PRISM_6', 'PRISM_8'], several = ['D4', 'D8', 'CUBE', 'PRISM_3'];
  check(`lone pieces: ${single.map((id) => `${id} ${lone(id)}`).join(', ')} offer slots; ${several.map((id) => `${id} ${lone(id)}`).join(', ')} wait`, single.every((id) => lone(id) > 0) && several.every((id) => lone(id) === 0));
}
console.log(failures ? `${failures} failures.` : 'All checks passed (0 failures).');
process.exit(failures ? 1 : 0);
