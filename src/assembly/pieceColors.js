/**
 * Piece colours -- parity with Rhombiverse's colour picker, auto colour
 * by piece type, and recolour tool. Three modes:
 *   green  -- every piece the brand green (the default look).
 *   family -- every piece coloured by its (first) family, live.
 *   pick   -- each piece shows its own saved colour (AssemblyNode.color):
 *             new pieces take the picked colour, Paint recolours one.
 * The palette is Rhombiverse's own 13 colours (same values, same plain
 * names), with brand green standing in for its grey-blue "Default".
 */
import { familiesFor, KALEIDOHEDRA_VERIFIED, REGULAR_NINE_NEW } from '../polyhedra/families.js';
export const NODE_BASE_COLOR = 0x47cc24;
export const PIECE_COLORS = {
    default: NODE_BASE_COLOR,
    red: 0x8b2e2e,
    gray: 0x5a5a5a,
    skyBlue: 0xbfe3f0,
    white: 0xdff3ff,
    black: 0x1a1a22,
    paleBlue: 0xd8f0ff,
    blue: 0x2e6f9e,
    green: 0x50c878,
    amber: 0xd4af37,
    purple: 0x9966cc,
    pink: 0xe8a0b4,
    orange: 0xe08a3c,
    teal: 0x30c9b8,
};
export const PIECE_COLOR_LABELS = {
    default: 'Default',
    red: 'Red',
    gray: 'Gray',
    skyBlue: 'Sky Blue',
    white: 'White',
    black: 'Black',
    paleBlue: 'Pale Blue',
    blue: 'Blue',
    green: 'Green',
    amber: 'Amber',
    purple: 'Purple',
    pink: 'Pink',
    orange: 'Orange',
    teal: 'Teal',
};
export const isPieceColorKey = (v) => typeof v === 'string' && v in PIECE_COLORS;
// One clearly different colour per family (the lime is the only one
// outside the palette: 12 families, and the palette's pale blues and
// white are too alike to tell apart side by side).
export const FAMILY_COLORS = {
    DELTAHEDRA: PIECE_COLORS.orange,
    PLATONIC: PIECE_COLORS.white,
    ARCHIMEDEAN: PIECE_COLORS.blue,
    JOHNSON: PIECE_COLORS.purple,
    CATALAN: PIECE_COLORS.teal,
    // Indigo: between Archimedean blue and Johnson purple, darker than both.
    STELLATIONS: 0x5b4fd6,
    PRISMS: PIECE_COLORS.pink,
    ANTIPRISMS: PIECE_COLORS.red,
    POLYTOPES_4D: PIECE_COLORS.skyBlue,
    PARALLELOHEDRA: PIECE_COLORS.green,
    SPACE_FILLING_PAIRS: 0xc8e04a,
    APERIODIC: PIECE_COLORS.amber,
    // Magenta: clear of pink (pale), red and purple, and of every other key.
    BRIDGES_3D: 0xd946a8,
    MISCELLANEOUS: PIECE_COLORS.gray,
};
export const COLOR_MODES = ['green', 'family', 'pick'];
export const COLOR_MODE_LABELS = { green: 'Green', family: 'Family', pick: 'Pick' };
export const DEFAULT_COLOR_PREFS = { mode: 'green', pick: 'red' };
/** The colour a piece shows, given the mode and (pick mode) its own saved colour. */
export function pieceColorHex(prefs, specId, saved) {
    // Face-kind-coloured shapes (faceKinds.ts) carry their colours per face; white leaves them true.
    if (KALEIDOHEDRA_VERIFIED.includes(specId) || REGULAR_NINE_NEW.includes(specId))
        return 0xffffff;
    if (prefs.mode === 'family') {
        const family = familiesFor(specId)[0];
        return family ? FAMILY_COLORS[family] : NODE_BASE_COLOR;
    }
    if (prefs.mode === 'pick' && isPieceColorKey(saved))
        return PIECE_COLORS[saved];
    return NODE_BASE_COLOR;
}
/** What a newly placed piece saves: the picked colour in pick mode, else nothing (green). */
export function newPieceColor(prefs) {
    return prefs.mode === 'pick' && prefs.pick !== 'default' ? prefs.pick : undefined;
}
