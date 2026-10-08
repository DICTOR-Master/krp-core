/**
 * The "rvcmg-connectors" sub-group of the "Miscellaneous" family (see
 * the family's own index.ts one level up, which combines this
 * sub-group with the sibling "pyramids" one).
 *
 * The 7 RVCMG physical adapter pieces (see
 * docs/rvcmg-adapter-pieces-spec.md), now built as real, closed 3D
 * solids (Stage 8, `app/lib/rvcmg/solid.ts`): each piece's own flat
 * hemi-RD hex interface and shape-specific target polygon (Stages 0-7,
 * already verified) get a real triangulated tapered wall between them,
 * derived directly from that piece's own coalesce sequence rather than
 * hand-declared per piece. These 7 shapes have no external precedent —
 * unlike every other family in this registry, there is no published
 * classification to check them against; see solid.ts's own header.
 */
import { type PolyhedronSpec } from '../../core.js';
export declare const RVCMG_CONNECTOR_ADDITIONS: Record<string, PolyhedronSpec>;
export declare const RVCMG_CONNECTOR_ADDITION_IDS: string[];
