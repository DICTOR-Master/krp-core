/**
 * prisms.ts — the last piece of Zalgaller's "complete classification of
 * convex regular-faced polyhedra" not yet in this registry (5 Platonic +
 * 13 Archimedean + prisms/antiprisms + 92 Johnson) — see
 * docs/prisms-antiprisms-spec.md for the full design record. Unlike
 * every other family, prisms/antiprisms are parametric in n rather than
 * a fixed, finite named set, so this file generates coordinates directly
 * from the same closed-form formulas `johnson.ts` already trusts for
 * elongation/gyroelongation (regular n-gon circumradius, antiprism
 * height via law of cosines) instead of transcribing scipy ConvexHull
 * output — lower transcription risk for a family this simple, per the
 * spec doc's reasoning.
 *
 * Every face here (n-gon caps, square or triangle sides) is a regular
 * polygon, so unlike catalan.ts this needs none of the irregular-face
 * infrastructure (`makeSpecByCircumradius`, the face-vertex-0
 * canonicalization fix) — plain `makeSpec` and the existing
 * `facesCongruent`/`faceRotationalSymmetry` apply unchanged.
 *
 * Capped at n=10 (matching the largest regular-polygon face already
 * anywhere in this registry, the decagon) with two dedupes skipped:
 * PRISM_4 = CUBE (already Platonic) and ANTIPRISM_3 = OCTAHEDRON
 * (already a deltahedron, D8) — both provably identical to shapes
 * already registered, same standard as every prior family's dedupes.
 */
import { type PolyhedronSpec } from './core.js';
export declare const PRISM_ANTIPRISM_ADDITIONS: Record<string, PolyhedronSpec>;
export declare const PRISM_ANTIPRISM_ADDITION_IDS: string[];
