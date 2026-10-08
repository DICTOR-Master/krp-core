/**
 * RVCMG v2 — RD-Native-Rhombus-to-U-Hex: a NEW piece with no v1
 * counterpart. Collapses the new universal hex interface to a real
 * rhombus matching the RHOMBIC DODECAHEDRON's OWN native face — not the
 * golden-ratio rhombus of the rhombic triacontahedron.
 *
 * The point of this piece (flagged in project memory, 2026-09-16, as a
 * real confirmed benefit of moving to a small universal hex): under
 * v1's RD-native-scale hex, the only way to mate an adapter piece onto a
 * real `RHOMBIC_DODECAHEDRON` face was through an RD-Hemi in between
 * (dome + adapter). With the hex decoupled from RD's own native scale,
 * a rhombus adapter can target RD's own face directly — one piece
 * instead of two for an RD-to-other-shape connection. See
 * `rhombusToUHex.ts` for the full shared derivation.
 */
import { deriveRhombusToUHex, measureRhombusFace } from './rhombusToUHex.js';
export function deriveRdNativeRhombusToUHex() {
  return deriveRhombusToUHex({ catalanId: 'RHOMBIC_DODECAHEDRON', pieceName: 'rd-native-rhombus-to-uhex' });
}
export const RD_RHOMBUS_RATIO_MEASURED = measureRhombusFace('RHOMBIC_DODECAHEDRON').ratio;
export const RD_RHOMBUS_EDGE_MEASURED = measureRhombusFace('RHOMBIC_DODECAHEDRON').edge;
