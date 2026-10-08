// The KRP vocabulary (VOCABULARY.md) and its test case, the Euclid–Kepler–Pacioli objects.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { KRP_VERSION, STATUSES, UNRESOLVED, NOVELTY, RETENTION, objectId, parseObjectId, fingerprintOf } from '../../src/vocabulary.js';
import { EKP_RECORDS } from '../../src/identity/ekp.js';
import { describe } from '../../src/identity/index.js';
import { EXPANDED_WINDOWS_GOLDEN, PHI } from '../../src/geometry-extensions/roof-fold.js';

test('KRP_VERSION is the package version', () => {
  assert.equal(KRP_VERSION, JSON.parse(readFileSync(new URL('../../package.json', import.meta.url))).version);
});

test('object IDs: generator@version?parameters, keys sorted, and back again', () => {
  assert.equal(objectId('ekp/dogstar'), `ekp/dogstar@${KRP_VERSION}`);
  assert.equal(objectId('ekp/x', { b: 2, a: -0, c: true, d: 'a b' }, '1.2.3'), "ekp/x@1.2.3?a=0&b=2&c=true&d='a%20b'");
  for (const params of [{}, { push: EXPANDED_WINDOWS_GOLDEN }, { t: 0.1 + 0.2, on: false, name: "it's" }]) {
    const back = parseObjectId(objectId('kaleido/shear', params));
    assert.deepEqual(back, { generator: 'kaleido/shear', version: KRP_VERSION, params });
  }
  for (const bad of [() => objectId('Dogstar'), () => objectId('ekp'), () => objectId('ekp/x', { t: NaN }), () => objectId('ekp/x', { 'b-c': 1 }), () => parseObjectId('ekp/x@1.2'), () => parseObjectId('ekp/x@1.2.3?t=')]) assert.throws(bad);
});

test('every EKP record is complete and uses only the vocabulary\'s words', () => {
  for (const [g, r] of Object.entries(EKP_RECORDS)) {
    assert.ok(STATUSES.includes(r.status) || r.status === UNRESOLVED, g);
    assert.ok(NOVELTY.includes(r.novelty.kind), g);
    if (r.novelty.kind === 'prior-art') assert.ok(r.novelty.credit && r.novelty.short, `${g}: prior art needs its credit, in full and short`);
    if (r.novelty.kind === 'not-found') assert.ok(r.novelty.scope && r.novelty.date, `${g}: 'not found' needs its scope and date`);
    assert.ok(r.history.length && r.history.every((h) => STATUSES.includes(h.status) && /^\d{4}-\d\d-\d\d$/.test(h.date)), g);
    for (const p of r.parts ?? []) assert.ok(EKP_RECORDS[p.generator], `${g}: part ${p.generator}`);
  }
});

test('EKP objects regenerate with their known measurements', () => {
  const vol = (g) => describe(g).measurements.volume;
  const near = (a, b) => Math.abs(a - b) < 1e-9;
  assert.ok(near(vol('ekp/cube'), 8));
  assert.ok(near(vol('ekp/octahedron'), 4 / 3));
  assert.ok(near(vol('ekp/stella-octangula'), 2 * (8 / 3)));
  assert.ok(near(vol('ekp/dogstar'), 16 - vol('ekp/dodecahedron')), 'the Dogstar is the hole one dodecahedron leaves per cell');
  assert.ok(near((vol('ekp/dragon-jewel') - 8) / (vol('ekp/dodecahedron') - 8), 1 / PHI), 'the Dragon Jewel keeps 1/phi of each roof');
  assert.ok(near(vol('ekp/dragon-jewel'), 12));
  assert.ok(near(vol('ekp/sunstar'), vol('ekp/dodecahedron') + 6 * vol('ekp/dogstar')));
  for (const g of ['ekp/icosahedron', 'ekp/octahedron', 'ekp/dogstar', 'ekp/cube', 'ekp/great-stellated-dodecahedron', 'ekp/dodecahedron', 'ekp/dragon-jewel']) {
    const t = describe(g).topology;
    assert.ok(t.closed && t.components === 1 && t.euler === 2, `${g}: one closed surface, V - E + F = 2`);
  }
  const s = describe('ekp/stella-octangula').topology;
  assert.ok(s.closed && s.components === 2 && s.euler === 4, 'the stella octangula: two closed tetrahedra');
  const R = describe('ekp/pacioli-rectangles');
  assert.equal(R.dimension, 2);
  assert.deepEqual(R.topology.faceSizes, { 4: 3 });
  assert.equal(R.measurements.volume, undefined, 'flat plates have no volume');
  assert.deepEqual(describe('ekp/sunstar').topology, { parts: 7, partsClosed: true });
});

test('retained objects carry a fingerprint that regeneration reproduces', () => {
  for (const g of Object.keys(EKP_RECORDS)) {
    const p = g === 'ekp/expanded-windows' ? { push: EXPANDED_WINDOWS_GOLDEN } : {};
    const a = describe(g, p), b = describe(g, p);
    assert.equal(a.retention, 'retained', g);
    assert.match(a.fingerprint, /^[0-9a-f]{16}$/, g);
    assert.equal(a.fingerprint, b.fingerprint, g);
    assert.equal(a.id, objectId(g, p));
  }
  assert.notEqual(describe('ekp/dodecahedron').fingerprint, describe('ekp/great-stellated-dodecahedron').fingerprint);
  // A face started at another corner, or the faces in another order, is the same geometry.
  const cube = [[[0, 0, 0], [1, 0, 0], [1, 1, 0]], [[0, 0, 1], [1, 1, 1], [1, 0, 1]]];
  assert.equal(fingerprintOf(cube), fingerprintOf([[cube[1][1], cube[1][2], cube[1][0]], cube[0]]));
  assert.notEqual(fingerprintOf(cube), fingerprintOf([[...cube[0]].reverse(), cube[1]]), 'winding counts');
});

test('a working state is generated and ephemeral; only the curated state is in the record', () => {
  const w = describe('ekp/expanded-windows', { push: 0.3 });
  assert.equal(w.status, 'Generated');
  assert.equal(w.retention, 'ephemeral');
  assert.deepEqual(w.novelty, { kind: 'not-searched' });
  assert.equal(w.fingerprint, undefined);
  assert.deepEqual(w.history, []);
  const g = describe('ekp/expanded-windows', { push: EXPANDED_WINDOWS_GOLDEN });
  assert.equal(g.status, 'Curated');
  assert.equal(g.topology.faces, 74, 'study 10a: a 74-face solid');
  assert.ok(RETENTION.includes(w.retention) && RETENTION.includes(g.retention));
  assert.throws(() => describe('ekp/expanded-windows', { push: 2 }));
  assert.throws(() => describe('ekp/expanded-windows', {}));
  assert.throws(() => describe('ekp/cube', { push: 0.5 }));
});

test('novelty is kept apart from status: curated objects can be classical or new', () => {
  assert.equal(describe('ekp/cube').status, 'Curated');
  assert.equal(describe('ekp/cube').novelty.kind, 'prior-art');
  assert.equal(describe('ekp/dogstar').novelty.kind, 'prior-art');
  assert.match(describe('ekp/dogstar').novelty.credit, /Hart/);
  assert.equal(describe('ekp/dogstar').names.DICTO, 'Dogstar');
  assert.equal(describe('ekp/cell').novelty.kind, 'not-found');
  assert.equal(describe('ekp/dragon-jewel').novelty.kind, 'not-found');
});

test('request: an ID in, the regenerated object and its description out', async () => {
  const { request, GENERATORS } = await import('../../src/request.js');
  assert.ok(GENERATORS.includes('ekp/dogstar'));
  const r = request(objectId('ekp/dogstar'));
  assert.equal(r.description.id, `ekp/dogstar@${KRP_VERSION}`);
  assert.equal(r.description.fingerprint, fingerprintOf(r.faces), 'the faces handed over are the recorded object');
  const w = request(objectId('ekp/expanded-windows', { push: 0.3 }));
  assert.equal(w.description.status, 'Generated');
  assert.throws(() => request('ekp/dogstar@0.0.1'), /was made by krp-core 0\.0\.1/);
  assert.throws(() => request(objectId('ekp/nothing')), /no generator/);
});
