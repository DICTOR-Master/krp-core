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
import { type FamilyKey } from '../polyhedra/families.js';
export declare const NODE_BASE_COLOR = 4705316;
export declare const PIECE_COLORS: {
    readonly default: 4705316;
    readonly red: 9121326;
    readonly gray: 5921370;
    readonly skyBlue: 12575728;
    readonly white: 14676991;
    readonly black: 1710626;
    readonly paleBlue: 14217471;
    readonly blue: 3043230;
    readonly green: 5294200;
    readonly amber: 13938487;
    readonly purple: 10053324;
    readonly pink: 15245492;
    readonly orange: 14715452;
    readonly teal: 3197368;
};
export type PieceColorKey = keyof typeof PIECE_COLORS;
export declare const PIECE_COLOR_LABELS: Record<PieceColorKey, string>;
export declare const isPieceColorKey: (v: unknown) => v is PieceColorKey;
export declare const FAMILY_COLORS: Record<FamilyKey, number>;
export type ColorMode = 'green' | 'family' | 'pick';
export declare const COLOR_MODES: ColorMode[];
export declare const COLOR_MODE_LABELS: Record<ColorMode, string>;
export interface ColorPrefs {
    mode: ColorMode;
    pick: PieceColorKey;
}
export declare const DEFAULT_COLOR_PREFS: ColorPrefs;
/** The colour a piece shows, given the mode and (pick mode) its own saved colour. */
export declare function pieceColorHex(prefs: ColorPrefs, specId: string, saved: string | undefined): number;
/** What a newly placed piece saves: the picked colour in pick mode, else nothing (green). */
export declare function newPieceColor(prefs: ColorPrefs): PieceColorKey | undefined;
