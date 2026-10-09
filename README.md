# krp-core

The geometry shared by **Kaleidohedra**, **Rhombiverse** and **Polyhedraverse**, by DICTO.

This is the first step of KRP (Kaleidohedra · Rhombiverse · Polyhedraverse): one source of geometry
that several sites use, instead of a copy in each. The sites stay separate; each pins a version of
this repo as a git submodule at `src/krp-core`.

Geometry only: lattices, cells and pieces as coordinates, topology and measurements. No rendering,
no page code, no stored state.

- `src/core/`: the cubic lattice, duals, pyramids, polyhedron statistics.
- `src/geometry-extensions/`: the lattice and shape generators (BCC detail, calcite, dual, elongated
  dodecahedron, growth, hex prism, interstitial, pyrochlore, cut-and-project quasicrystals, rhombic
  dodecahedron pieces, golden rhombohedra, rock salt, sphere packing, spherical toggle).
- The Euclid–Kepler–Pacioli cell by DICTO (`roof-fold.js`): the cube, dodecahedron, folded
  icosahedron, octahedron, stella octangula, great stellated dodecahedron, Pacioli's rectangles
  and the Dogstar, and what is built from them (the DICTO Jewel, the Sunstar and Stella–Jewel
  Lattices, the studies). Kaleidohedra's DISCOVERIES.md records the findings.
- Nets (`nets.js`): every solid unfolded flat and folded closed. DICTO FCC (`dicto-fcc.js`).
- DICTO's 13-dodecahedron cluster (`dodeca-cluster.js`): a dodecahedron with one on each face, and
  its gaps as exact pieces, 30 wedges and 20 needles (Kaleidohedra's DISCOVERIES.md #13).
- DICTO-Star (`id-star.js`): an icosidodecahedron with a dodecahedron on each
  pentagon and a tridiminished icosahedron on each triangle, every edge closed (DISCOVERIES.md #14).
- DICTO's clusters of DICTO Jewels (`polyhedra/stellaJewel.js`): the tetrahedral (4 Jewels) and the
  octahedral (6 Jewels round a hidden stella-shaped hole), shapes of their own; each fills space
  with stella octangulas.
- DICTO's clusters of the Sunstar Lattice's dodecahedra (`polyhedra/sunstar.js`): tetrahedral (4) and
  octahedral (6 round a hidden Dogstar), the same octet structure; each fills space with Dogstars.
- Kaleidohedra's lattice shear (`kaleido-lattice.js`): six lattice parameters and the Cell slider.
- `src/request.js`, `src/retention.js`: objects requested by ID (with a session cache), and kept
  entries (an ID and a fingerprint, checked when reopened).
- Polyhedraverse's shapes (`src/polyhedra/`): the registry of 312 polyhedra and their families
  (Platonic, Archimedean, Johnson, Catalan, deltahedra, prisms, stellations, star polyhedra, the
  parallelohedra and space-filling pairs, 4D projections …), the RVCMG pieces (`src/rvcmg/`) and
  printable nets (`src/polyhedra-nets/`). Each `.js` has a `.d.ts` beside it for TypeScript users;
  the `*.test.mjs` checks beside them run in `npm run verify`.
- Polyhedraverse's building (`src/assembly/`): the build graph and its saved form, face attach (every
  matching face and flush turn) and face registration, face kinds and piece colours, the running
  build name (Tetrahedral Star …), and the golden-rhombohedra helper. The one part that uses
  three.js (vectors, quaternions, its convex hull): import `three` from the page's import map or npm.
- `src/vocabulary.js`, `src/identity/`: the KRP vocabulary (IDs, versions, status, novelty,
  provenance) and the first records using it, the EKP objects. See [VOCABULARY.md](VOCABULARY.md).
- `tests/unit/`, `scripts/verify-*.mjs`: the checks, run on every push.

Plain ES modules, no build step, no dependencies (but three.js for `src/assembly/`):

```sh
npm test
npm run verify
```

Using it from a site:

```sh
git submodule add https://github.com/DICTOR-Master/krp-core src/krp-core
git clone --recurse-submodules <site repo>   # or: git submodule update --init
```

```js
import { cellKey } from '../krp-core/src/core/lattice.js';
```

Versions are git tags (`v0.1.0`, ...). A site moves to a newer core by checking out the new tag in
its submodule and committing that.

MIT licence. © DICTO.
