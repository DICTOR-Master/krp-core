/**
 * The DICTO Hexa family (DICTO, 2026-10-09; names by DICTO): the cube DICTO saw in Kaleidohedra's
 * Studies (Windows, copies): eight exact DICTO Jewels on a 2 x 2 x 2 block of cells, passing through
 * each other inside, one solid (volume 80 = 6 2/3 Jewels, at cube edge 2 per cell). Its partner, the
 * DICTO Hexa-Key, is the gap between Hexas: 8 stella octangulas and 24 roofs, volume 48 = 4 Jewels.
 * Hexas and Hexa-Keys fill space like a checkerboard (5 : 3), Hexas meeting window to window: the
 * Stella-Jewel Lattice one level up. Two clusters of eight Hexas: rhombohedral (window to window,
 * a Hexa-Key sealed inside) and diamond (Hexas sharing corner Jewels).
 *
 * Each shape is one solid (catalogued, attachable) and has parts views (HEXA_PARTS): the Hexa as its
 * 8 overlapping Jewels, or split without overlap into 8 cubes + 24 roofs (A) or 4 whole and 4 trimmed
 * Jewels (B); the Hexa-Key as 8 stellas + 24 roofs; the clusters as their Hexas (and Hexa-Key).
 * At the DICTO Jewel's scale (raw x phi/2), so windows and walls face-match the Jewel and the stella.
 * scripts/verify-hexa.mjs checks every solid and every split.
 */
import DATA from './hexaData.js';
import { specOf } from './stellaJewel.js';

const PHI = (1 + Math.sqrt(5)) / 2;
const K = PHI / 2;
const solid = (id, name, m) => specOf(id, name, m.vertices, m.faces, true);
const mesh = (name) => DATA.meshes[name];
const firstOf = (parts, re) => parts.find((p) => re.test(p.kind));

export const HEXA_ADDITIONS = {
  DICTO_HEXA: solid('DICTO_HEXA', 'DICTO Hexa', DATA.HEXA),
  DICTO_HEXA_KEY: solid('DICTO_HEXA_KEY', 'DICTO Hexa-Key', DATA.KEY),
  DICTO_HEXA_RHOMBO_CLUSTER: solid('DICTO_HEXA_RHOMBO_CLUSTER', 'DICTO Hexa rhombohedral cluster', DATA.R),
  DICTO_HEXA_DIAMOND_CLUSTER: solid('DICTO_HEXA_DIAMOND_CLUSTER', 'DICTO Hexa diamond cluster', DATA.D),
  DICTO_HEXA_TRIMMED_JEWEL: solid('DICTO_HEXA_TRIMMED_JEWEL', 'DICTO Hexa trimmed Jewel', mesh(firstOf(DATA.parts.HEXA_B, /trimmed/).mesh)),
  DICTO_HEXA_ROOF: solid('DICTO_HEXA_ROOF', 'DICTO Hexa roof', mesh(firstOf(DATA.parts.HEXA_A, /roof/).mesh)),
};
export const HEXA_ADDITION_IDS = Object.keys(HEXA_ADDITIONS);

// A part: a mesh (vertices at the shape's scale, in the parent's frame) and what it is.
const placed = (meshName, offset, role) => {
  const m = meshName === 'HEXA' ? DATA.HEXA : meshName === 'KEY' ? DATA.KEY : mesh(meshName);
  return { role, vertices: m.vertices.map((v) => v.map((x, i) => (x + offset[i]) * K)), faces: m.faces };
};
const roleOf = (kind) => (/roof/.test(kind) ? 'roof' : /trimmed/.test(kind) ? 'trimmed' : /stella/.test(kind) ? 'stella' : /cube/.test(kind) ? 'cube' : 'jewel');
const viewOf = (list) => list.map((p) => placed(p.mesh, p.offset, roleOf(p.kind ?? '')));
const sharedJewel = (o) => DATA.parts.D_SHARED.some((s) => s.every((x, i) => Math.abs(x - o[i]) < 1e-6));
/** Parts views by shape id: { viewName: [{ role, vertices, faces }] }. Roles: jewel, trimmed, cube,
 *  roof, stella, hexa, key, shared (a Jewel two Hexas share). */
export const HEXA_PARTS = {
  DICTO_HEXA: { jewels: viewOf(DATA.parts.HEXA_JEWELS), cubesAndRoofs: viewOf(DATA.parts.HEXA_A), wholeAndTrimmed: viewOf(DATA.parts.HEXA_B) },
  DICTO_HEXA_KEY: { stellasAndRoofs: viewOf(DATA.parts.KEY_PIECES) },
  DICTO_HEXA_RHOMBO_CLUSTER: {
    hexas: DATA.parts.R_CUBES.map((p) => placed(p.mesh, p.offset, p.mesh === 'KEY' ? 'key' : 'hexa')),
    jewels: DATA.parts.R_CUBES.flatMap((p) => (p.mesh === 'KEY' ? [placed('KEY', p.offset, 'key')]
      : DATA.parts.HEXA_JEWELS.map((j) => placed('jewel', j.offset.map((x, i) => x + p.offset[i]), 'jewel')))),
  },
  DICTO_HEXA_DIAMOND_CLUSTER: {
    hexas: DATA.parts.D_CUBES.map((p) => placed('HEXA', p.offset, 'hexa')),
    jewels: (() => {
      const seen = new Set(), out = [];
      for (const p of DATA.parts.D_CUBES) for (const j of DATA.parts.HEXA_JEWELS) {
        const o = j.offset.map((x, i) => Math.round((x + p.offset[i]) * 1e6) / 1e6), k = o.join(',');
        if (seen.has(k)) continue;
        seen.add(k);
        out.push(placed('jewel', o, sharedJewel(o) ? 'shared' : 'jewel'));
      }
      return out;
    })(),
  },
};
/** Volumes in raw units (cube edge 2 per cell; a DICTO Jewel is 12). */
export const HEXA_VOLUMES = { DICTO_HEXA: DATA.HEXA.volume, DICTO_HEXA_KEY: DATA.KEY.volume, DICTO_HEXA_RHOMBO_CLUSTER: DATA.R.volume, DICTO_HEXA_DIAMOND_CLUSTER: DATA.D.volume };
