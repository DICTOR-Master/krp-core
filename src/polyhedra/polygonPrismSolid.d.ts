/**
 * A general right-prism builder over any existing planar n-gon face:
 * two copies of that face (unchanged shape), translated apart along
 * the face's own normal by `height`, joined by n planar lateral
 * rectangle faces. Shared infrastructure for two "Miscellaneous"
 * sub-groups (direct user requests, 2026-09-17):
 * - `miscellaneous/quad-prisms/` — rhombus/kite Catalan-solid faces
 *   (n=4), "prism-like extenders with irregular faces."
 * - `miscellaneous/rvcmg-connectors-v2/` — the U-Hex spacer piece
 *   (n=6), a plain hex-to-hex prism to lengthen a chain of RVCMG v2
 *   adapters "for convenience."
 *
 * No coalescence math needed (unlike the tapered RVCMG adapter pieces,
 * `app/lib/rvcmg/solid.ts`): a translational extrusion of an already-
 * planar polygon always produces planar lateral faces automatically —
 * each lateral face is spanned by one fixed base-edge vector and one
 * fixed translation vector, which is a plane by construction. Because
 * the translation axis is the face's own normal (perpendicular to
 * every in-plane edge), every lateral face is a genuine RECTANGLE
 * regardless of the base polygon's own angles — the angle between any
 * base edge and the (perpendicular) translation vector is always
 * exactly 90°. Setting `height` equal to a given base edge's own
 * length turns THAT lateral face into a genuine SQUARE — for a regular
 * polygon or a rhombus (all edges equal), one `height` makes every
 * lateral face a square; for a kite (2 short + 2 long edges), it makes
 * exactly 2 squares + 2 rectangles depending on which edge length is
 * chosen (direct user confirmation: pick the short edge, extending
 * this project's own precedent in `kiteToRdH.ts`/`kiteToUHex.ts`).
 *
 * **Rectangles, found 2026-09-17 and fixed 2026-09-30.** Face attach used
 * to line up corner 0 with corner 0 and then turn by the face's symmetry,
 * which assumes a mirror line through a corner. A genuine (non-square)
 * rectangle's mirror lines pass through edge midpoints, so no turn ever
 * seated one, and the kite prisms kept their rectangle sides unattachable.
 * Face attach now tries each corner against corner 0 and keeps only the
 * placements where the faces sit flush (app/lib/faceAttach.ts), which
 * seats any pair of congruent faces; every side of these prisms attaches.
 */
import { type Vec3, type PolyhedronSpec } from './core.js';
export interface PolygonPrismOptions {
  id: string;
  name: string;
  /** The n real vertices of the base face (n >= 3), in their own winding order, at the source shape's own native scale. */
  faceVertices: Vec3[];
  /** That face's own outward unit normal — the extrusion axis. */
  normal: Vec3;
  /** Extrusion length along `normal` — see this file's own header for how each piece picks this. */
  height: number;
  /**
     * 'caps-only' (default) restricts `attachableFaceIndices` to the two
     * end caps — a plain end-to-end extender. 'all' opens every lateral
     * face up too, for branching (direct user request, 2026-09-17, for
     * the quad-prisms specifically — "add that please for branching
     * possibilities" — but NOT for the U-Hex spacer: "dont bother fr
     * U-Hex", so that piece stays end-to-end only). An explicit array
     * names exact face indices instead — needed for a kite base, whose 2
     * non-square rectangle lateral faces have a REAL, structural placement
     * limitation (see this file's own header) and must stay excluded even
     * though the piece's other faces are open for branching. A per-call
     * choice, not a blanket property of "being a polygon prism."
     */
  attachableFaces?: 'caps-only' | 'all' | number[];
}
export interface PolygonPrismResult {
  spec: PolyhedronSpec;
  problems: string[];
  /** Always 0/1 — the two caps are always pushed first. */
  capFaceIndices: [number, number];
}
export declare function buildPolygonPrismSolid(opts: PolygonPrismOptions): PolygonPrismResult;
