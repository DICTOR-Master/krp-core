/**
 * Shared, family-agnostic polyhedron infrastructure. Vertices + edges +
 * faces are the only source of truth for any shape in any family
 * (deltahedra, Platonic, and eventually Archimedean/Johnson) — everything
 * else (connector degree, geometry validation) is derived from them, never
 * hand-declared separately. See docs/construction-kit-spec.md's "derive,
 * don't duplicate" rule for why: an independently-written version of this
 * same kind of data once hand-declared a `degrees` array that disagreed
 * with its own edge list, and a face list with the wrong total count
 * entirely — both the specific bug class that happens when a fact
 * derivable from another field gets stored and asserted separately.
 */
export type Vec3 = [number, number, number];
export interface Connector {
  id: number;
  degree: number;
  pos: Vec3;
}
export interface PolyhedronSpec {
  id: string;
  name: string;
  faceCount: number;
  vertices: Vec3[];
  edges: [number, number][];
  faces: number[][];
  connectors: Connector[];
  /**
     * Optional face-attach eligibility override: indices into `faces` that
     * are valid attach targets, to the EXCLUSION of every other face on
     * this shape -- regardless of `isRegularFace`. Only RVCMG connector
     * pieces set this (their two real "ports" -- the hex interface and the
     * shape-specific target face -- known exactly at construction time,
     * see rvcmg-connectors/index.ts). Needed because `isRegularFace` alone
     * gets this family wrong in BOTH directions: a wall/side triangle can
     * coincidentally BE a genuine regular polygon (nothing stops that) and
     * would wrongly become attachable, while the golden-rhombus/kite
     * pieces' own real target faces are deliberately NOT regular polygons
     * (matching Catalan solids' own irregular rhombi/kite faces) and would
     * wrongly be excluded. Every other family leaves this undefined, and
     * ShapeViewer.tsx's eligibility check falls back to `isRegularFace`
     * exactly as before -- no behavior change for Catalan solids or
     * graded pyramids.
     */
  attachableFaceIndices?: number[];
}
export interface FaceConnector {
  faceIndex: number;
  size: number;
  pos: Vec3;
  normal: Vec3;
}
export declare function centerVertices(vs: Vec3[]): Vec3[];
export declare function dist(a: Vec3, b: Vec3): number;
export declare function buildConnectors(vertices: Vec3[], edges: [number, number][]): Connector[];
export declare function makeSpec(id: string, name: string, faceCount: number, rawVerts: Vec3[], edges: [number, number][], faces: number[][]): PolyhedronSpec;
/**
 * Catalan-solid counterpart to makeSpec — "unit edge length" doesn't
 * apply (11 of the 13 Catalan solids have 2-3 distinct edge lengths per
 * face; a single reference edge would silently pick an arbitrary one of
 * them). Normalizes by circumradius instead: the distance to the
 * FARTHEST vertex, scaled to exactly 1. Decided empirically, not by
 * default — see docs/catalan-solids-spec.md's "Normalization
 * convention, decided" section for the 3 rejected alternatives
 * (insphere=1, a global skewed-insphere constant, trusting each
 * shape's natural unnormalized polar-dual scale) and why circumradius=1
 * is the only one of the 4 that guarantees consistent visual scale
 * across the whole family rather than approximating it well for some
 * shapes and badly for others.
 */
export declare function makeSpecByCircumradius(id: string, name: string, faceCount: number, rawVerts: Vec3[], edges: [number, number][], faces: number[][]): PolyhedronSpec;
/**
 * Whether two faces are true geometric matches for face-attach — same
 * vertex count is NOT enough once irregular-faced families exist
 * (Catalan solids): a rhombic dodecahedron's rhombus (diagonal ratio
 * sqrt(2)) and a rhombic triacontahedron's rhombus (diagonal ratio phi)
 * are both 4-sided, but gluing one onto the other would not sit flush
 * — a genuinely different shape, not just a scale mismatch. Checks
 * whether face2's own edge-length AND interior-angle sequence (computed
 * the same way faceRotationalSymmetry does) matches face1's REVERSED
 * sequence under some cyclic rotation.
 *
 * **Why reversed, not direct — a real, two-part finding, not a
 * first-principles assumption.** The actual attach transform
 * (ShapeViewer.tsx / verify-face-attach.ts's computeFaceAttach) opposes
 * the two faces' outward normals (so incoming grows away from target,
 * not into it) and only ever computes a ROTATION, never a reflection.
 * A first version of this function checked the DIRECT (non-reversed)
 * sequence for exactly that reason — "the transform can't reflect, so
 * don't offer a match that would need one." That was half right: the
 * transform can't reflect, but normal-opposition itself means the
 * physical relationship between target and incoming, as seen from a
 * single fixed external viewpoint, is inherently mirror-like — proven
 * directly (Catalan solids batch 2, DISDYAKIS_TRIACONTAHEDRON): every
 * face here is a scalene triangle with NO reflective symmetry of its
 * own (genuinely chiral as a 2D shape), and attaching a copy of the
 * solid to ANOTHER INSTANCE of the identical face (same winding, same
 * handedness — what the old direct check would approve) was checked
 * by brute-force search over every possible twist angle and found to
 * have NO solution closer than 0.33 units of error. Attaching that
 * same face to its actual geometric mirror partner elsewhere on the
 * solid (found by matching reversed edge-length order at the vertex-0
 * role), using the exact same unmodified transform, coincides to
 * within 1e-16 (floating-point noise). For every REGULAR or
 * achiral-with-a-reflective-symmetry face already in this registry
 * (squares, rhombi, isosceles triangles, kites — everything through
 * Catalan batch 1), a face's reversed sequence is ALWAYS reachable via
 * some rotation of its own direct sequence (that symmetry is exactly
 * what "achiral" means here), so switching from direct to reversed
 * matching changes nothing for any of them — confirmed by the full
 * registry's own `verify:face-attach` staying at 0 failures across
 * every prior family. It only changes behavior — correctly — once a
 * genuinely chiral 2D face shape (no reflective symmetry at all, first
 * appearing with the scalene-triangle Catalan solids) exists.
 */
export declare function facesCongruent(verticesA: Vec3[], faceA: number[], verticesB: Vec3[], faceB: number[], tol?: number): boolean;
/**
 * A face's own rotational (cyclic) symmetry order — how many discrete
 * "registrations" face-attach genuinely offers for THIS face, replacing
 * the old blind assumption "always equal to the face's own vertex
 * count" (only true for a regular n-gon's full rotational symmetry).
 * Computed from the face's actual geometry: BOTH its edge-length
 * sequence AND its interior-angle sequence around the polygon, checking
 * every cyclic rotation offset for self-consistency. Edge length alone
 * isn't enough — a rhombus has 4 equal edges but only 2-fold rotational
 * symmetry, since its interior angles alternate (θ, 180°−θ, θ, 180°−θ).
 * Reduces to the old `faceSize` value for every regular-polygon face
 * already in this registry (every rotation offset matches), so this is
 * a strict generalization, not a special case for one family — see
 * docs/catalan-solids-spec.md.
 */
export declare function faceRotationalSymmetry(vertices: Vec3[], face: number[], tol?: number): number;
/**
 * Rotates a face's cyclic vertex order so vertex 0 lies on a real
 * mirror-symmetry axis of the polygon (its edge-length sequence reads
 * as a palindrome starting there), if one exists. Every hand-authored
 * face list in this registry already satisfies this by construction —
 * a kite's own vertex 0 is deliberately "where the two short edges
 * meet" (kiteToRdH.ts), a rhombus's any vertex works (both diagonals
 * are mirror axes) — because `computeFaceAttach`
 * (verify-face-attach.ts, mirrored in ShapeViewer.tsx) aligns two
 * congruent faces by matching vertex 0's own direction and reversing
 * the rest (`incoming[i] <-> target[(n-i)%n]`), which is only correct
 * when vertex 0 sits on such an axis — the SAME "face-vertex-0 needing
 * a consistent geometric role, not just a consistent index" bug class
 * `docs/build-plan.md` records from the first Catalan solids.
 *
 * Needed for GENERICALLY constructed faces (`app/lib/rvcmg/solid.ts`'s
 * hex/target caps), where vertex 0 is whatever a generic algorithm
 * happened to start from, not hand-picked — caught live: the real
 * hemi-RD hex interface (D2h symmetry, not full hexagonal symmetry)
 * failed exactly this way in `verify:face-attach` before this fix,
 * every other already-registered face having satisfied it by hand-
 * authored convention rather than by an enforced invariant. Returns the
 * face unrotated if no starting vertex satisfies the palindrome (a
 * genuinely asymmetric polygon, e.g. a scalene wall triangle) — such a
 * face can only ever be congruent to an equally asymmetric one, which
 * would need the same fix applied to IT, not this one; harmless
 * otherwise since facesCongruent already wouldn't match it to anything
 * with a real mirror axis.
 */
export declare function rotateFaceToMirrorAxis(vertices: Vec3[], face: number[], tol?: number): number[];
/**
 * Whether a face is a genuine REGULAR polygon (equal edges AND equal
 * interior angles) — full `n`-fold rotational symmetry
 * (`faceRotationalSymmetry === face.length`) is exactly this condition
 * for a planar convex polygon: if the edge+angle sequence maps onto
 * itself under EVERY single-step rotation, every edge (and every angle)
 * must equal its neighbor, hence all equal.
 *
 * A general geometric utility, not itself a face-attach policy — see
 * `ShapeViewer.tsx`'s own use of this for the actual eligibility rule
 * (direct user instruction, 2026-09-15, scoped to the Miscellaneous
 * family only: a graded pyramid's LATERAL faces — isosceles, non-
 * regular except at grade 2 — must never be offered for attachment to
 * each other, "so pointed pyramids don't stick to each other." Explicitly
 * NOT applied to Catalan solids' own irregular rhombi/kite faces, which
 * remain fully face-attachable exactly as already shipped and verified —
 * this function reports pure geometric fact regardless of policy).
 */
export declare function isRegularFace(vertices: Vec3[], face: number[], tol?: number): boolean;
/**
 * Face connectors — the face-snap-mode counterpart to buildConnectors(),
 * derived from `vertices` + `faces` exactly the way vertex connectors are
 * derived from `vertices` + `edges` (construction-kit-spec.md's "Dual /
 * face-snap mode" design, not a new stored field). The outward normal comes
 * from the face's own CCW winding (already required for correct flat-shaded
 * rendering), so it's a genuine cross-check of that winding wherever it's
 * used, not just an assumption repeated — see scripts/verify-face-connectors.ts.
 */
export declare function buildFaceConnectors(spec: PolyhedronSpec): FaceConnector[];
/**
 * Triangulates a face for rendering (never stored). Convex faces fan from
 * their first vertex, as always. Given the vertices, a non-convex face
 * (the Catalan stellation pieces have some) is ear-clipped instead, since
 * a fan would cover the wrong region.
 */
export declare function triangulateFace(face: number[], vertices?: Vec3[]): [number, number, number][];
/** Re-checks that every edge is length 1 and every face's own boundary edges are all length 1. */
export declare function validateShape(spec: PolyhedronSpec, tol?: number): string[];
/**
 * Catalan-solid counterpart to validateShape — "every edge is length 1"
 * doesn't apply here (see makeSpecByCircumradius). Checks the properties
 * that actually define a valid Catalan solid instead: Euler's formula
 * and face count (shared with validateShape), every face's own edge
 * lengths forming a valid closed polygon matching every OTHER face's
 * edge-length multiset (true congruence across the whole shape, not
 * just internal consistency of one face), and — the actual defining
 * property of face-transitivity — every face sitting at the same
 * distance from the shape's own center (a uniform insphere radius).
 */
export declare function validateCatalanShape(spec: PolyhedronSpec, tol?: number): string[];
