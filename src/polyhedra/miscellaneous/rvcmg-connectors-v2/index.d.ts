/**
 * RVCMG v2 — the "rvcmg-connectors-v2" sub-group of the "Miscellaneous"
 * family: adapter pieces built on the new universal hex interface
 * (`app/lib/rvcmg/universalHexInterface.ts`), replacing
 * `rvcmg-connectors-v1-archived/` as the LIVE, registered set (see this
 * directory's sibling for the archived v1 set and
 * `docs/rvcmg-adapter-pieces-spec.md` for the full redesign history).
 *
 * 8 tapered pieces, no RD-Hemi (direct user instruction, 2026-09-17 —
 * the hex is no longer tied to a real RD's own native scale, so there
 * is no longer a "bare dome" piece in this v2 set):
 * Triangle, Square, Pentagon, Golden-Rhombus, RD-Native-Rhombus,
 * DI-Kite, DH-Kite, Regular-Hexagon — all -to-U-Hex. Plus a 9th, the
 * U-Hex spacer prism (direct user request, 2026-09-17: "a U-Hex prism
 * too, to extend between connections for convenience") — a plain
 * hex-to-hex right prism (both caps are the universal hex itself, not
 * a shape-specific target), so any two of these pieces stack to
 * lengthen a chain of adapters. Height = the hex's own edge length
 * (direct user confirmation: "height same as length and depth of
 * hexagon"), which makes all 6 lateral faces genuine squares — no
 * RVCMG coalescence math needed here either (see
 * `polygonPrismSolid.ts`, `app/lib/polyhedra/`).
 *
 * Regular-Hexagon-to-U-Hex is the one exception to the shared
 * `WALL_HEIGHT_V2` neck length — see `REGULAR_HEX_WALL_HEIGHT`'s own
 * doc comment below for why (a real, play-tested icosahedron
 * construction, not a cosmetic tweak) and
 * `scripts/verify-icosahedron-hex-alignment.ts` for the independent
 * re-derivation.
 */
import { type PolyhedronSpec } from '../../core.js';
export declare const RVCMG_V2_CONNECTOR_ADDITIONS: Record<string, PolyhedronSpec>;
export declare const RVCMG_V2_CONNECTOR_ADDITION_IDS: string[];
