/**
 * The real, bare RD-Hemi piece (see docs/rvcmg-adapter-pieces-spec.md's
 * own "RD-hemi (bare)" description) — genuinely one real half of the
 * rhombic dodecahedron, NOT a flat hex disk: the real rhombic faces and
 * vertices strictly on one side of the same bisection plane
 * `hemiRdInterface.ts` already uses, closed off by the flat hex cut
 * face. This is the ONE piece in the whole RVCMG family with a real 3D
 * "dome" body (direct user statement, 2026-09-15: "the RD-Hemi is the
 * only one to have a dome polyhedron") — every one of the 7 adapter
 * pieces (`solid.ts`) deliberately keeps its hex end perfectly flat.
 *
 * Derived directly from `POLYHEDRA.RHOMBIC_DODECAHEDRON`'s own real
 * data, never hand-declared: classifying its 14 vertices by the same
 * dot-product sign against the bisection axis `hemiRdInterface.ts`
 * already uses gives 4 strictly positive, 4 strictly negative, and the
 * same 6 on-plane vertices that ARE `HEMI_RD_INTERFACE`. Checking every
 * one of RD's 12 real rhombic faces against that classification
 * (computed below, not assumed) finds exactly 5 lying entirely on the
 * kept (non-negative) side, kept whole, and exactly 2 genuinely
 * straddling both sides — each of those has its two ON-PLANE vertices
 * sitting on a shared diagonal, so cutting along that existing diagonal
 * (not inventing a new one) splits each straddling rhombus into two
 * real triangles, one per side. The kept hemi is therefore: the 6 hex
 * vertices, the 4 positive vertices, 5 whole rhombi, 2 half-rhombus
 * triangles, and the one new hex cap face — 10 vertices, 8 faces.
 *
 * Scale: RD's own real, native scale — NOT rescaled at all. Every
 * adapter piece's own shared hex is ALSO built at this same native
 * scale (`hemiRdStartState`'s own corrected header, 2026-09-15), so
 * this piece's hex face lands exactly on theirs (confirmed below, not
 * assumed) AND its 5 real rhombi (uniform edge length, since RD itself
 * has one) land EXACTLY on `POLYHEDRA.RHOMBIC_DODECAHEDRON`'s own real
 * rhombi too — direct user report that surfaced the earlier, wrongly-
 * rescaled version's real gap: "you dont seem to have allowed RD-Hemi
 * to attach to full RD."
 */
import { type PolyhedronSpec } from '../polyhedra/core.js';
export interface BuildRdHemiResult {
  spec: PolyhedronSpec;
  problems: string[];
  /** Index into `spec.faces` of the one rhombus face farthest from the hex (opposite it entirely, touching none of its vertices) -- the "crown," where a real hourglass compound joins two hemis (direct user description, 2026-09-15: "rhombi faces at crown... forms a rhombi waist"). Also included in `attachableFaceIndices` like every other real rhombus here -- not a separate mechanism, just the one a real hourglass build uses. */
  crownFaceIndex: number;
}
export declare function buildRdHemiSolid(id: string, name: string): BuildRdHemiResult;
