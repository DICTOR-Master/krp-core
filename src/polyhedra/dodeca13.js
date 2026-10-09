/**
 * The DICTO Dodeca-13 family (DICTO, 2026-10-09; names by DICTO): thirteen regular dodecahedra, one in
 * the centre and twelve on its faces, with the gaps between the outer ones filled: 30 wedges (volume
 * phi^3/20 each) and 20 needles ((45 - 19 sqrt 5)/600). One solid of 152 faces (72 pentagons, 60
 * trapezoids, 20 triangles), volume 106.058472. Three wedges and a needle make a star; the cluster also
 * splits into the centre and 12 units (an outer dodecahedron with 5 half-wedges and 5 needle-thirds).
 * Each is a solid of its own (catalogued, attachable); the cluster has parts views (DODECA13_PARTS):
 * pieces (13 + 30 + 20), units (centre + 12), stars (13 + 20).
 * At dodecahedron edge 1, so its pentagons face-match every pentagon piece and the DICTO-Star.
 * scripts/verify-dodeca13.mjs checks every solid and every split.
 */
import DATA from './dodeca13Data.js';
import { specOf } from './stellaJewel.js';

const solid = (id, name, m) => specOf(id, name, m.vertices, m.faces, true, 1); // already at edge 1

export const DODECA13_ADDITIONS = {
  DICTO_DODECA13: solid('DICTO_DODECA13', 'DICTO Dodeca-13', DATA.FILLED),
  DICTO_DODECA13_STAR: solid('DICTO_DODECA13_STAR', 'DICTO Dodeca-13 Star', DATA.STAR),
  DICTO_DODECA13_UNIT: solid('DICTO_DODECA13_UNIT', 'DICTO Dodeca-13 Unit', DATA.UNIT),
  DICTO_DODECA13_WEDGE: solid('DICTO_DODECA13_WEDGE', 'DICTO Dodeca-13 Wedge', DATA.WEDGE),
  DICTO_DODECA13_NEEDLE: solid('DICTO_DODECA13_NEEDLE', 'DICTO Dodeca-13 Needle', DATA.NEEDLE),
};
export const DODECA13_ADDITION_IDS = Object.keys(DODECA13_ADDITIONS);
/** Parts views of the cluster: { viewName: [{ role, vertices, faces }] } in the cluster's frame.
 *  Roles: dodeca, centre, wedge, needle, star, unit. */
export const DODECA13_PARTS = { DICTO_DODECA13: DATA.parts };
/** Volumes at edge 1. */
export const DODECA13_VOLUMES = Object.fromEntries(DODECA13_ADDITION_IDS.map((id, i) => [id, [DATA.FILLED, DATA.STAR, DATA.UNIT, DATA.WEDGE, DATA.NEEDLE][i].volume]));
