/**
 * The Dragon Jewel and the stella octangula (direct request 2026-10-08:
 * "place them in another setting free of lattice with face attachment"),
 * from Kaleidohedra's Stella–Jewel Lattice. Names by DICTO.
 *
 * The Dragon Jewel (DJ) is the regular dodecahedron with its six face
 * neighbours' stella octangulas carved out (Kaleidohedra DISCOVERIES.md
 * #10): 12 Penrose thick rhombi (72/108 degrees), one on each edge of the
 * cube inside it, each in one of the dodecahedron's own face planes, and
 * 48 triangles walling the cut-away, 8 over each cube face meeting at its
 * centre. Dragon Jewels and stella octangulas, alternating like a
 * checkerboard, fill space exactly (study 10b; volumes 12 + 4 = two cubes
 * at cube edge 2).
 *
 * Built here at the scale where the rhombi have edge 1, so they attach to
 * the thick Penrose rhombus prism's faces (Aperiodic Sets); the stella is
 * at the same scale (its cube edge phi), so the two mate as in the
 * lattice. Both are non-convex; scripts/verify-stella-jewel.ts checks them.
 */
import type { PolyhedronSpec } from './core.js';
export declare const STELLA_JEWEL_ADDITIONS: Record<string, PolyhedronSpec>;
export declare const STELLA_JEWEL_ADDITION_IDS: string[];
