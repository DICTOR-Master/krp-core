# krp-core

The geometry shared by **Kaleidohedra** and **Rhombiverse**, by DICTO.

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
  and the Dogstar, and what is built from them (the Dragon Jewel, the Sunstar and Stella–Jewel
  Lattices, the studies). Kaleidohedra's DISCOVERIES.md records the findings.
- Nets (`nets.js`): every solid unfolded flat and folded closed. DICTO FCC (`dicto-fcc.js`).
- `tests/unit/`, `scripts/verify-*.mjs`: the checks, run on every push.

Plain ES modules, no dependencies, no build step:

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
