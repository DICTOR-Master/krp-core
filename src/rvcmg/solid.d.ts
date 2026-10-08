/**
 * RVCMG Stage 8 — turning an adapter piece's two flat cross-sections
 * (the hemi-RD hex interface and the shape-specific target polygon,
 * currently coplanar per Stage 0-7's own design: "the tapered 3D wall
 * connecting them is a separate, later extrusion step, not part of
 * RVCMG's own state representation") into one real, closed, placeable
 * `PolyhedronSpec` solid.
 *
 * These 7 connector shapes have no external precedent (confirmed with
 * the user, 2026-09-15) — unlike every other family in this registry,
 * there is no published classification to check this construction
 * against. What CAN be, and is, checked computationally: Euler's
 * formula, every face planar and non-degenerate, every face wound
 * outward consistently, the hex face's edges matching the real hemi-RD
 * interface exactly, and the target face's edges matching whatever that
 * piece's own Stage 0-7 derivation already proved (typically unit
 * edge). The physical neck LENGTH (`wallHeight` below) is a genuinely
 * new design choice with nothing to derive it from — documented as
 * exactly that, not disguised as a derived fact.
 *
 * Approach: lift the target ring's real vertices along the hex
 * interface's own plane normal by `wallHeight`, then connect the two
 * rings with a triangulated wall — never quads, since a quad spanning
 * two differently-shaped/sized/rotated rings has no general guarantee
 * of being planar, while a triangle always is. The correspondence
 * between hex vertices and target vertices needed to build that wall is
 * never hand-declared per piece: it's recovered directly from the
 * target state's own vertex ids via `parseCompoundId` (spec's own
 * "derive, don't duplicate" id-encodes-ancestry design), so a change to
 * any adapter's own merge sequence can never silently desync from this
 * file's wall geometry.
 *
 * Known, accepted residual (2026-09-15): `verify:face-attach`'s full
 * exhaustive sweep finds 16 of the ~3.4M checks still failing (up from
 * 2 once `chooseConvexBoundarySplit`, below, started measuring both
 * diagonals per boundary and picking convexity over a fixed rule --
 * that naturally produces more genuinely scalene wall triangles, hence
 * more of this same case, not a new kind of bug) -- wall triangles
 * (triangle, pentagon, and regular-hex pieces) that happen to be exact
 * mirror images of another wall triangle on the SAME piece (real,
 * genuinely chiral shapes with no reflective symmetry at all, so no
 * mirror-axis rotation exists to fix). `facesCongruent`'s own doc
 * comment already anticipated this exact case ("first appearing with
 * the scalene-triangle Catalan solids... it only changes behavior once
 * a genuinely chiral 2D face shape exists") — a real, pre-existing
 * limitation of the shared face-attach placement algorithm for chiral
 * pairs, not something this file introduced or can fix by itself. Zero
 * practical impact: every one is a wall face, excluded from every
 * RVCMG piece's own `attachableFaceIndices`, so the app can never
 * select or offer any of them for a real attach.
 */
import { type Vec3, type PolyhedronSpec } from '../polyhedra/core.js';
import type { RvcmgState } from './types.js';
export interface BuildAdapterSolidOptions {
  id: string;
  name: string;
  /** The hex interface's own plane normal (`hemiRdInterfaceFrame().normal`) -- the axis the target ring is lifted along. */
  normal: Vec3;
  /** New design parameter (Stage 8, no external precedent to derive it from -- see this file's own header): how far the target ring is lifted from the hex plane. */
  wallHeight: number;
}
export interface BuildAdapterSolidResult {
  spec: PolyhedronSpec;
  problems: string[];
  /** Always 0 -- the hex (hemi-RD interface) face is always pushed first. Not inferable from face size alone (the target face is ALSO a triangle for the triangle piece). */
  hexFaceIndex: number;
  /** Always 1 -- the target (shape-specific) face is always pushed second. */
  targetFaceIndex: number;
}
/**
 * Builds the real 3D solid for one adapter piece: `hexState` is the
 * piece's OWN starting 6-vertex hemi-RD state (`states[0]` from its
 * `AdapterPieceResult`), `targetState` its own final state
 * (`states[states.length - 1]`).
 */
export declare function buildAdapterSolid(hexState: RvcmgState, targetState: RvcmgState, opts: BuildAdapterSolidOptions): BuildAdapterSolidResult;
/**
 * Mirrors `validateShape`/`validateCatalanShape`'s style for a family
 * where neither "every edge is 1" nor "one uniform insphere radius"
 * applies (a genuinely mixed-edge-length taper, unlike either existing
 * convention -- the kite pieces' own target face has TWO distinct edge
 * lengths, ruling out a single expected-length constant). Checks the
 * properties that actually define a valid adapter solid: Euler's
 * formula, every face planar (all its vertices within `tol` of the
 * plane defined by its own first 3), no degenerate (near-zero-area)
 * face, every face's own winding outward-consistent (already enforced
 * during construction, re-checked here independently rather than
 * trusted), and -- the fact that actually matters physically -- the
 * target face's own edge lengths matching `originalTargetState` (the
 * SAME state passed into `buildAdapterSolid`, before the lift): lifting
 * along a fixed vector can't change in-plane distances, so this is a
 * guard against a future bug in this file rather than a claim that
 * needs a hand-typed expected number per piece.
 */
export declare function validateAdapterSolid(spec: PolyhedronSpec, originalTargetState: RvcmgState, hexFaceIndex: number, targetFaceIndex: number, tol?: number): string[];
