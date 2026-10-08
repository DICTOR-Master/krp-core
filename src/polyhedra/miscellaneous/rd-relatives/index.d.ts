/**
 * "rd-relatives", a new sub-group of the "Miscellaneous" family (see the
 * family's own index.ts one level up): 2 real solids directly related
 * to the Rhombic Dodecahedron (RHOMBIC_DODECAHEDRON, catalan.ts) --
 * ported over from a sibling project (Rhombiverse) where both already
 * shipped as real, independently placeable lattice pieces, verified
 * there before this port (exact flush-fit against a real RD, confirmed
 * both mathematically and against that app's own live geometry).
 *
 * - ELONGATED_DODECAHEDRON: the 4th of Fedorov's 5 real parallelohedra
 *   (Cube, Hexagonal Prism, Rhombic Dodecahedron, Elongated
 *   Dodecahedron, Truncated Octahedron -- the only convex shapes that
 *   tile 3D space by translation alone). Take an RD, cut it through its
 *   own equator (the 4 rhombic faces whose plane passes through center),
 *   insert a square prism of height `h = sqrt(3) * half` between the
 *   two halves. The 8 remaining rhombic faces are untouched RD faces,
 *   just shifted outward; the 4 cut faces each merge with one new prism
 *   side into a single flat HEXAGON. `h` is the one non-arbitrary value:
 *   exactly the height that makes all 6 edges of each new hexagon equal
 *   length, and that length is EXACTLY RD's own edge length -- so this
 *   whole shape is genuinely uniform-edge (18 vertices, 28 edges, 12
 *   faces: 8 rhombi + 4 hexagons -- matches the standard cited count
 *   exactly, verified independently via a real scipy.spatial.ConvexHull
 *   on these exact 18 points, not assumed from the construction alone).
 *
 * - RHOMBOHEDRON: RD is the zonotope (Minkowski sum) of a cube's own 4
 *   body-diagonal directions, which always decomposes into exactly
 *   C(4,3) = 4 congruent rhombohedra (anchor at one cube corner,
 *   opposite corner is RD's own center, edges run to the 3 adjacent
 *   octahedral points matching that corner's own sign pattern). A real,
 *   strict rhombohedron -- verified directly: all 3 generating edge
 *   vectors have the identical length, so (being translates of those
 *   same 3 vectors) all 12 edges of the resulting parallelepiped do too,
 *   and the real convex hull confirms exactly 6 rhombic faces, V-E+F=2.
 *
 * Both vertex/edge/face arrays below were generated the same way this
 * project's own Catalan-solid batches were (see catalan.ts's own
 * header): real coordinates from the construction above, a genuine
 * scipy.spatial.ConvexHull to find the true faces (merging coplanar
 * triangles into real n-gons), outward CCW winding confirmed by normal
 * direction vs. each face's own centroid offset from the shape center.
 *
 * The hull-merge step does NOT, on its own, canonicalize each face's
 * vertex 0 to a consistent geometric role the way RHOMBIC_DODECAHEDRON's
 * own hand-verified face list happens to (catalan.ts's own comment,
 * "already consistent... as produced by the hull-merge angle sort") --
 * that was a lucky property of RD's specific hull, not a guarantee this
 * generation method provides generally, and it did NOT recur here: both
 * shapes' raw rhombic faces below originally started vertex 0 at the
 * OBTUSE corner, opposite RD's own acute-corner convention. Harmless to
 * facesCongruent() (core.ts) itself, which only checks edge/angle
 * sequences up to rotation and can't see which vertex is "0" -- but
 * fatal to actual face-attach, since ShapeViewer.tsx's computeFaceAttach
 * aligns incoming's vertex-0 direction straight to target's vertex-0
 * direction, so a role mismatch there silently rotates the whole attach
 * by 90 degrees, missing on BOTH of a rhombus's 2 valid registrations.
 * Direct user report, 2026-09-23 ("RD isn't attaching correctly to
 * newly added ED/Rhombohedron... offers 2 positions and neither relates
 * to faces properly") -- reproduced exactly, fixed by cyclically
 * rotating each affected face by 1 (see each FACES_* array's own
 * comment below); the 4 hexagonal ELONGATED_DODECAHEDRON faces needed
 * no change, their own hull-merge order already happening to land
 * vertex 0 on a valid mirror-axis start.
 *
 * Deliberately built WITHOUT makeSpec/makeSpecByCircumradius, unlike
 * every sibling file in this registry -- real bug caught before
 * shipping, not a stylistic choice: both of those rescale (edge->1, or
 * circumradius->1) INDEPENDENTLY per shape, which breaks the one
 * property that actually matters here -- these two shapes' rhombic
 * faces must be the literal SAME size as RHOMBIC_DODECAHEDRON's own
 * real face for facesCongruent() (core.ts) to recognize them as
 * attachable to a real RD, since it compares ABSOLUTE edge lengths, not
 * ratios. The raw vertices below already share RD's own real
 * coordinate scale by construction (same half=0.5/octahedral=1
 * convention RHOMBIC_DODECAHEDRON's own VERTS use one file over -- both
 * shapes are literally cut from RD's own real geometry, not an
 * independent re-derivation at an arbitrary scale) -- confirmed
 * directly: facesCongruent(RHOMBOHEDRON face, RHOMBIC_DODECAHEDRON
 * face) is true with these exact numbers, false after either rescale.
 */
import { type PolyhedronSpec } from '../../core.js';
export declare const RD_RELATIVES_ADDITIONS: Record<string, PolyhedronSpec>;
export declare const RD_RELATIVES_ADDITION_IDS: string[];
