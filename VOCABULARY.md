# KRP vocabulary

The shared words for geometry in KRP (Kaleidohedra · Rhombiverse · Polyhedraverse), by DICTO.
This is stage 1 of the KRP plan: before the sites share more, they agree what a generated object
*is*, how it is named, and what is known about it.

The code is `src/vocabulary.js` (the words and the measuring functions) and `src/identity/`
(records that use them). `tests/unit/vocabulary.test.mjs` checks both on every push, so the words
here and the code cannot drift apart.

## The principle

Geometry is **regenerated, not stored**. An object's truth is its generator, the core's version
and its parameter state. Coordinates can always be produced again; they are kept only when an
object is deliberately retained, and then only to prove a regeneration still matches.

## Terms

**Object.** Anything the core can generate: a solid, a cell, a set of flat plates, a compound of
parts, a patch of a lattice.

**Generator.** A named way of producing objects, e.g. `ekp/dogstar`, `ekp/expanded-windows`.
Lower case, words joined by `-`, a family first and then the object, joined by `/`.
A generator may take parameters.

**Family.** The first part of a generator name: the system the object belongs to, e.g. `ekp`
(the Euclid–Kepler–Pacioli cell).

**Version.** The version of krp-core (`0.3.0`, a git tag), which is the version of every generator
in it. The same ID at the same version always regenerates the same object.

**Parameter state.** The values a generator is given: numbers, true/false or text, each named, e.g.
`{ push: 0.3 }`. A generator without parameters makes one fixed object.

**Object ID.** `generator@version?parameters`, the parameters in alphabetical order:

```
ekp/dogstar@0.3.0
ekp/expanded-windows@0.3.0?push=0.7265425280053608
```

Readable, and it says exactly how to make the object again. Text values are quoted and
URL-encoded (`name='a%20b'`).

**Dimensionality.** `dimension`: the object's own dimension (3 for a solid, 2 for flat plates such
as Pacioli's rectangles). `ambient`: the dimension of the space it sits in (3 here; 4 and higher
for lattices in Rhombiverse).

**Parts.** An object built from other objects, each given by its generator and an offset, e.g. the
Sunstar: a dodecahedron and 6 Dogstars on its faces. `nested` parts share one centre, each inside
the next (the EKP cell's wrap order); their volumes are not added.

**Topology.** Corners, edges and faces counted with coincident corners merged; face sizes;
whether the surface is closed and consistently wound; how many separate pieces it has; and
V − E + F. An object made of parts reports its parts instead.

**Measurements.** Volume (closed solids only), and the distinct edge lengths.

**Validation.** The checks that verify the object, by script, run on every push.

**Names.** Names given to the object, by who gave them, e.g. `{ DICTO: 'Dogstar' }`. A name is
not a claim of originality.

**Status: checking.** One step at a time:

| Status | Meaning |
|---|---|
| Generated | Produced by a generator. Nothing more is claimed. |
| Candidate | Singled out as worth a look (an event, a match, a person's eye). |
| Recognized | Identified: matched to a known form, or settled as a definite configuration. |
| Verified | Its stated properties pass the checks. |
| Curated | Given a stable identity in the record by a person (DICTO). |
| Unresolved | In place of any step whose identification or checking is incomplete. |

**Novelty: originality, kept apart from status.** Generated does not mean new, and curated does not
mean new (the cube is curated and classical).

| Novelty | Meaning | Must say |
|---|---|---|
| not-searched | No search for prior work has been made. | |
| not-found | A search found nothing. Not proof of novelty. | the search's scope (e.g. web-level) and date |
| prior-art | Earlier work describes it. | the credit, e.g. George W. Hart (1996) |
| specialist-checked | Someone with specialist knowledge has checked it. | who, when, and what they found |

**History.** Each change of status, with its date, who made it and a note.

**Retention.**

| Retention | Meaning |
|---|---|
| ephemeral | A working state: it exists while it is being explored, then goes. |
| cached | Kept for speed; never the authority. |
| retained | Deliberately kept, with its fingerprint. |

**Fingerprint.** 16 hex digits from the object's coordinates (faces in a canonical order, corners
rounded to 10⁻⁹). Every regeneration gives the same fingerprint; different geometry gives a
different one. It detects change, nothing more (not a security hash).

## A description

`describe(generator, params)` returns everything above for one object. The Dogstar:

```js
{
  id: 'ekp/dogstar@0.3.0', generator: 'ekp/dogstar', version: '0.3.0', params: {},
  label: 'Dogstar', dimension: 3, ambient: 3, family: 'ekp', parent: 'ekp/cell',
  topology: { vertices: 32, edges: 90, faces: 60, faceSizes: { 3: 60 }, closed: true, components: 1, euler: 2 },
  measurements: { volume: 1.527864…, edgeLengths: [ … ] },
  validation: ['scripts/verify-roof-fold.mjs'],
  names: { DICTO: 'Dogstar' },
  novelty: { kind: 'prior-art', credit: "George W. Hart, stellation 8 of the dodecahedron … (1996); also Polyhedra-World", ref: '…' },
  status: 'Curated', history: [{ status: 'Curated', date: '2026-10-08', by: 'DICTO', note: '…' }],
  retention: 'retained', fingerprint: 'cf834d87dc8ed117',
}
```

A working state is plain: `describe('ekp/expanded-windows', { push: 0.3 })` is `Generated`,
`ephemeral`, `not-searched`, with no history and no fingerprint. Only the golden push,
study 10a in DISCOVERIES, is in the record.

## First records: the EKP cell

`src/identity/ekp.js` describes the Euclid–Kepler–Pacioli objects, the test case for these words:
Pacioli's rectangles, the icosahedron, octahedron, Dogstar, stella octangula, cube, great stellated
dodecahedron and dodecahedron; the cell itself (its parts, nested); the Dragon Jewel; the expanded
windows (a parameterised generator); and the Sunstar (parts, side by side). Credits and statuses
follow Kaleidohedra's DISCOVERIES.md.

## Not decided yet

Following the plan: how other families are recorded, how objects are stored or cached, how
records are shared between the sites and how events (a face becoming regular, say) mark
Candidates. These come when the stages that need them do.
