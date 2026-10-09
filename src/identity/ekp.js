// The Euclid–Kepler–Pacioli objects described in the KRP vocabulary (stage 1's test case, DICTO's
// decision 2026-10-08). Each record says how to regenerate the object and what is known about it;
// describe() turns a record and a parameter state into the object's full description. Credits and
// statuses follow Kaleidohedra's DISCOVERIES.md. describe() itself is in describe.js.
import { roofFoldSolids, ekpWindowsSolid, expandedWindows, EXPANDED_WINDOWS_GOLDEN, dogstarSolid } from '../geometry-extensions/roof-fold.js';

const CHECK = 'scripts/verify-roof-fold.mjs';
const EKP_DOI = 'https://doi.org/10.5281/zenodo.23173809';
const S = () => roofFoldSolids();
const classical = (credit, short) => ({ kind: 'prior-art', credit, short });
const curated = (date, note) => [{ status: 'Curated', date, by: 'DICTO', note }];

// Every EKP object sits in the same cell: a cube of edge 2 centred on the origin.
export const EKP_RECORDS = Object.fromEntries(Object.entries({
  'ekp/pacioli-rectangles': {
    label: "Pacioli's golden rectangles", dimension: 2, make: () => S().rects.faces,
    novelty: classical('Luca Pacioli, De divina proportione (1509)', 'Pacioli (1509)'),
    names: {}, status: 'Curated', history: curated('2026-10-06', 'DISCOVERIES #8: the folded roof ridges, corners on the icosahedron'),
  },
  'ekp/icosahedron': {
    label: 'Icosahedron', make: () => S().ico.faces, novelty: classical('classical (Euclid, Elements XIII)', 'Euclid, Elements XIII'),
    names: {}, status: 'Curated', history: curated('2026-10-06', "DISCOVERIES #8: Euclid's roofs folded back in through the cube's faces"),
  },
  'ekp/octahedron': {
    label: 'Octahedron', make: () => S().oct.faces, novelty: classical('classical (Euclid, Elements XIII)', 'Euclid, Elements XIII'),
    names: {}, status: 'Curated', history: curated('2026-10-06', 'DISCOVERIES #8'),
  },
  'ekp/dogstar': {
    label: 'Dogstar', make: () => dogstarSolid(),
    novelty: { kind: 'prior-art', credit: "George W. Hart, stellation 8 of the dodecahedron, 'Tetrahedral Stellations of the Dodecahedron' (1996); also Polyhedra-World, and Hans Walser's 'semi-regular dodecahedron' (a cube with its six hip roofs cut away, checkerboarded with regular dodecahedra)", short: 'G. W. Hart (1996)', ref: 'https://www.georgehart.com/virtual-polyhedra/stellations-dodecahedron-tetrahedral.html' },
    names: { DICTO: 'Dogstar' }, status: 'Curated',
    history: curated('2026-10-08', 'DICTO named it: the hole regular dodecahedra leave in their densest lattice packing; volume phi/2 at dodecahedron edge 1; an EKP piece between the octahedron and the stella octangula'),
  },
  'ekp/stella-octangula': {
    label: 'Stella octangula', make: () => S().stella.faces, compound: 'two regular tetrahedra, overlapping in the octahedron',
    novelty: classical('Johannes Kepler (Harmonices Mundi, 1619)', 'Kepler (1619)'),
    names: {}, status: 'Curated', history: curated('2026-10-06', 'DISCOVERIES #8'),
  },
  'ekp/cube': {
    label: 'Cube', make: () => S().cube.faces, novelty: classical('classical (Euclid, Elements XIII)', 'Euclid, Elements XIII'),
    names: {}, status: 'Curated', history: curated('2026-10-06', 'DISCOVERIES #8: the cell itself'),
  },
  'ekp/great-stellated-dodecahedron': {
    label: 'Great stellated dodecahedron', make: () => S().star.faces,
    novelty: classical('Johannes Kepler (Harmonices Mundi, 1619)', 'Kepler (1619)'),
    names: {}, status: 'Curated', history: curated('2026-10-06', 'DISCOVERIES #8; #12: the great stellated dodecahedron of the Dogstar\'s 1/phi^3 core'),
  },
  'ekp/dodecahedron': {
    label: 'Dodecahedron', make: () => S().dodeca.faces, novelty: classical('Euclid, Elements XIII.17 (roofs on a cube)', 'Euclid, Elements XIII.17'),
    names: {}, status: 'Curated', history: curated('2026-10-06', 'DISCOVERIES #8'),
  },
  'ekp/cell': {
    label: 'Euclid–Kepler–Pacioli cell',
    parts: ['ekp/pacioli-rectangles', 'ekp/icosahedron', 'ekp/octahedron', 'ekp/dogstar', 'ekp/stella-octangula', 'ekp/cube', 'ekp/great-stellated-dodecahedron', 'ekp/dodecahedron'].map((generator) => ({ generator, offset: [0, 0, 0] })),
    nested: true, // the parts share one centre, each inside the next (the wrap order); no volume is a sum
    novelty: { kind: 'not-found', scope: 'web-level', date: '2026-10-06', ref: EKP_DOI },
    names: { DICTO: 'Euclid–Kepler–Pacioli cell' }, status: 'Curated',
    history: curated('2026-10-06', 'DISCOVERIES #8 (candidate); the Dogstar joined the wrap order 2026-10-08'),
  },
  'ekp/dragon-jewel': {
    label: 'DICTO Jewel', make: () => { const W = ekpWindowsSolid(); return [...W.rhombi, ...W.walls]; },
    novelty: { kind: 'not-found', scope: 'web-level', date: '2026-10-08', ref: EKP_DOI },
    names: { DICTO: 'DICTO Jewel' }, status: 'Curated',
    history: curated('2026-10-08', "DISCOVERIES #10, the EKP windows: the dodecahedron with its six face-neighbours' stella octangulas carved out"),
  },
  'ekp/expanded-windows': {
    label: 'Expanded windows', params: { push: { min: 0, max: 1 } }, make: ({ push }) => expandedWindows(push),
    // Only the golden push is in the record (study 10a); any other push is a working state.
    curated: [{ params: { push: EXPANDED_WINDOWS_GOLDEN } }],
    novelty: { kind: 'not-searched', note: 'study 10a of #10, not a separate claim' },
    names: {}, status: 'Curated',
    history: curated('2026-10-08', 'DISCOVERIES study 10a: the 12 window rhombi pushed straight out by sqrt(7 - 4 phi) hull into a 74-face solid with a flat net'),
  },
  'ekp/sunstar': {
    label: 'Sunstar',
    parts: [{ generator: 'ekp/dodecahedron', offset: [0, 0, 0] }, ...[[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]].map((d) => ({ generator: 'ekp/dogstar', offset: d.map((c) => 2 * c) }))],
    novelty: { kind: 'not-searched', note: "named by DICTO; context of #12 (a whole Sunstar 1/phi^3 the size fits inside the great star)" },
    names: { DICTO: 'Sunstar' }, status: 'Curated',
    history: curated('2026-10-08', 'a dodecahedron with the 6 Dogstars on its faces (the 8 at its corners only touch it at a point)'),
  },
}).map(([g, r]) => [g, { family: 'ekp', parent: g === 'ekp/cell' ? null : 'ekp/cell', validation: [CHECK], ...r }]));
