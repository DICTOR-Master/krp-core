// Stage 4: generation on request, the session cache, and deliberate retention (kept entries).
import test from 'node:test';
import assert from 'node:assert/strict';
import { objectId, fingerprintOf, KRP_VERSION } from '../../src/vocabulary.js';
import { request, clearCache } from '../../src/request.js';
import { keepEntry, checkKept, isKeptEntry } from '../../src/retention.js';
import { basisOf, FCC_PARAMS, paramsOnPath, PATH_RANGE } from '../../src/geometry-extensions/kaleido-lattice.js';

const det = (M) => M[0][0] * (M[1][1] * M[2][2] - M[1][2] * M[2][1]) - M[0][1] * (M[1][0] * M[2][2] - M[1][2] * M[2][0]) + M[0][2] * (M[1][0] * M[2][1] - M[1][1] * M[2][0]);
const cell = (p, t) => objectId('kaleido/cell', { ...p, t });

test('the Shear cell: the rhombic dodecahedron at FCC, a space-filling cell at every state', () => {
  const rd = request(cell(FCC_PARAMS, 1)).description;
  assert.deepEqual(rd.topology.faceSizes, { 4: 12 });
  assert.equal(rd.topology.vertices, 14);
  assert.ok(Math.abs(rd.measurements.volume - 2) < 1e-9);
  // One cell per lattice point: its volume is the lattice's cell volume, along the path and the Cell
  // slider. Known limit (found 2026-10-08, open with DICTO): near the path's ends (DICTO s <= -3.08 or
  // >= 4.41; Bain s <= -3.24) the cells with t > 0 are not the lattice's cells; t = 0 always is.
  for (const s of [-3, 0, 0.5, 1, 2, 4.4]) for (const t of [0, 0.37, 1]) {
    const p = paramsOnPath(s, 'dicto');
    const d = request(cell(p, t)).description;
    assert.ok(d.topology.closed && d.topology.euler === 2, `closed at s=${s}, t=${t}`);
    assert.ok(Math.abs(d.measurements.volume - Math.abs(det(basisOf(p)))) < 1e-6, `volume at s=${s}, t=${t}`);
  }
  for (const s of [PATH_RANGE[0], PATH_RANGE[1] - 0.01]) {
    const p = paramsOnPath(s, 'dicto');
    assert.ok(Math.abs(request(cell(p, 0)).description.measurements.volume - Math.abs(det(basisOf(p)))) < 1e-6, `t = 0 at the end s=${s}`);
  }
});

test('a slider state is generated on request and ephemeral until curated', () => {
  const d = request(cell(paramsOnPath(0.8), 0.5)).description;
  assert.equal(d.status, 'Generated');
  assert.equal(d.retention, 'ephemeral');
  assert.equal(d.fingerprint, undefined);
  assert.deepEqual(d.novelty, { kind: 'not-searched' });
  assert.equal(d.family, 'kaleido');
  assert.throws(() => request(objectId('kaleido/cell', { ...FCC_PARAMS, alpha: 170, beta: 170, gamma: 170, t: 1 })), /no such object/);
  assert.throws(() => request(objectId('kaleido/cell', { ...FCC_PARAMS })), /needs a number 't'/);
});

test('the session cache: the same answer again, equal to a fresh regeneration, read-only, bounded', () => {
  clearCache();
  const id = cell(paramsOnPath(1.3), 0.8);
  const a = request(id), b = request(id), f = request(id, { fresh: true });
  assert.equal(a.cached, false);
  assert.equal(b.cached, true);
  assert.equal(b.faces, a.faces, 'the remembered answer');
  assert.equal(f.cached, false);
  assert.notEqual(f.faces, a.faces);
  assert.equal(fingerprintOf(f.faces), fingerprintOf(a.faces), 'never different from a fresh regeneration');
  assert.deepEqual(f.description, a.description);
  assert.throws(() => { a.faces[0][0][0] = 99; }, TypeError, 'cached answers are frozen');
  for (let i = 0; i < 210; i++) request(cell(FCC_PARAMS, i / 210));
  assert.equal(request(id).cached, false, 'the oldest answers make room');
});

test('versions: another version\'s ID is refused unless asked to regenerate it here', () => {
  const old = `ekp/dogstar@0.4.1`;
  assert.throws(() => request(old), /was made by krp-core 0\.4\.1/);
  const r = request(old, { anyVersion: true });
  assert.equal(r.madeWith, '0.4.1');
  assert.equal(r.description.id, `ekp/dogstar@${KRP_VERSION}`);
});

test('kept entries: an ID and a fingerprint; reopening regenerates and compares', () => {
  const id = cell(paramsOnPath(2), 1);
  const e = keepEntry(id, 'DICTO FCC equal-edge cell', new Date('2026-10-08T12:00:00Z'));
  assert.deepEqual(Object.keys(e).sort(), ['fingerprint', 'id', 'kept', 'name']);
  assert.ok(isKeptEntry(e));
  assert.equal(e.kept, '2026-10-08T12:00:00.000Z');
  const c = checkKept(e);
  assert.equal(c.result, 'same');
  assert.equal(c.description.id, id);
  assert.equal(checkKept({ ...e, fingerprint: '0000000000000000' }).result, 'changed');
  // Kept with an older core: regenerated here, and said so.
  const older = { ...e, id: e.id.replace(`@${KRP_VERSION}`, '@0.4.1') };
  assert.deepEqual([checkKept(older).result, checkKept(older).madeWith], ['same', '0.4.1']);
  assert.equal(checkKept({ ...e, id: 'kaleido/gone@0.6.0' }).result, 'unavailable');
  assert.equal(checkKept({ ...e, id: 'not an id' }).result, 'unavailable');
  for (const bad of [null, {}, { ...e, fingerprint: 'xyz' }, { ...e, kept: 'yesterday' }, { ...e, name: 3 }]) assert.equal(isKeptEntry(bad), false);
});

test('the red band: where the Shear cell stops filling space', async () => {
  const { pathGaps, cellFillsSpace } = await import('../../src/geometry-extensions/kaleido-lattice.js');
  for (const tw of ['dicto', 'bain']) assert.deepEqual(pathGaps(0, tw), [], `t = 0 always fills space (${tw})`);
  const near = (g, want) => g.length === want.length && g.every(([a, b], i) => Math.abs(a - want[i][0]) < 0.01 && Math.abs(b - want[i][1]) < 0.01);
  assert.ok(near(pathGaps(1, 'dicto'), [[-7, -3.08], [4.41, 4.6]]), JSON.stringify(pathGaps(1, 'dicto')));
  assert.ok(near(pathGaps(1, 'bain'), [[-5, -3.24]]), JSON.stringify(pathGaps(1, 'bain')));
  // It agrees with the generated cell's own volume.
  for (const s of [-5, 0, 4.5]) {
    const p = paramsOnPath(s);
    const d = request(cell(p, 1)).description;
    assert.equal(cellFillsSpace(p, 1), Math.abs(d.measurements.volume - Math.abs(det(basisOf(p)))) < 1e-6, `s = ${s}`);
  }
});
