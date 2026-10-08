/**
 * Stage 7's D10<->D12 rewrite rule: when a node's shape changes, each of its
 * existing connections needs a vertex on the *new* shape that plays "roughly
 * the same role" as the vertex it used on the old shape. Both shapes are
 * centered at their own centroid, so a vertex's position doubles as its
 * outward direction — "same role" is approximated as "most similar outward
 * direction," matched 1:1 by a greedy best-score-first assignment. A ref
 * whose only candidates are below the threshold, or whose candidates all
 * lost the greedy race to a better-scoring ref, is left unmatched —
 * orphaned rather than guessed.
 */
/**
 * Matches each entry of `oldVertexIndices` (vertex indices on `oldSpecId`) to
 * a distinct vertex index on `newSpecId`, by greedy best-direction-similarity
 * first. Returns an array the same length/order as `oldVertexIndices`;
 * `undefined` at a position means that old vertex has no valid new vertex
 * (orphaned).
 */
export declare function matchRewriteVertices(oldSpecId: string, newSpecId: string, oldVertexIndices: number[]): (number | undefined)[];
/** The rewrite is only defined for this specific pair — not a generic "swap any shape." */
export declare const REWRITE_TARGET: Record<string, string>;
