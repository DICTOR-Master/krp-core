// Kaleidohedra's lattice shear in the KRP vocabulary (stage 4, DICTO's decision 2026-10-08): every
// slider state is a cell generated on request, ephemeral until someone keeps it. Only states DICTO
// curates are listed here, each with its own record.
import { cellDirections, cellCorners, paramsValid } from '../geometry-extensions/kaleido-lattice.js';
import { convexHullFaces } from '../geometry-extensions/roof-fold.js';

const length = { min: 0.05, max: 10 }, angle = { min: 0, max: 180 };

export const KALEIDO_RECORDS = {
  'kaleido/cell': {
    family: 'kaleido', parent: null,
    label: 'Kaleidohedra cell',
    // The six lattice parameters (lengths relative to FCC's, angles between FCC's primitive vectors)
    // and the Cell slider t (0 the rhombic dodecahedron sheared, 1 the lattice's equal-edge cell).
    params: { a: length, b: length, c: length, alpha: angle, beta: angle, gamma: angle, t: { min: 0, max: 1 } },
    valid: (p) => paramsValid(p),
    make: (p) => convexHullFaces(cellCorners(cellDirections(p, p.t))),
    // DICTO's curated states, each { params, status, novelty, names, history }. None yet.
    curated: [],
    validation: ['scripts/verify-kaleido.mjs'],
  },
};
