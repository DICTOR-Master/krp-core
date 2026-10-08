/**
 * RVCMG core data model (spec §6, §20). Every later stage (coalesce,
 * separate, the state graph, interpolation, verification) is built on
 * these three types alone — no parallel/derived type should ever be
 * introduced to sidestep them.
 */
/**
 * Structural state equality (spec §25.8): "equal vertex count does not
 * imply equal state; compare coordinates + connectivity." Deliberately
 * ignores `id` — a state's own `id` is a provenance label (how it was
 * reached), not its content, so two differently-labeled states built by
 * different call sequences (e.g. `separate(coalesce(s))` vs. the
 * original `s`) can and should compare equal here despite different
 * `id` strings. Compares the vertex-id SET (with positions, order-
 * independent) and the boundary-edge set expressed as unordered id
 * pairs (order- and index-independent, since two states with the same
 * topology can list their vertices/edges in different array orders).
 */
export function statesApproximatelyEqual(a, b, tol = 1e-9) {
  if (a.vertices.length !== b.vertices.length)
    return false;
  const bById = new Map(b.vertices.map((v) => [v.id, v]));
  for (const va of a.vertices) {
    const vb = bById.get(va.id);
    if (!vb)
      return false;
    const d = Math.hypot(va.pos[0] - vb.pos[0], va.pos[1] - vb.pos[1], va.pos[2] - vb.pos[2]);
    if (d > tol)
      return false;
  }
  const edgeKey = (state, edge) => {
    const [i, j] = edge;
    const idI = state.vertices[i].id;
    const idJ = state.vertices[j].id;
    return idI < idJ ? `${idI}|${idJ}` : `${idJ}|${idI}`;
  };
  const edgesA = new Set(a.boundaryEdges.map((e) => edgeKey(a, e)));
  const edgesB = new Set(b.boundaryEdges.map((e) => edgeKey(b, e)));
  if (edgesA.size !== edgesB.size)
    return false;
  for (const k of edgesA)
    if (!edgesB.has(k))
      return false;
  return true;
}
/**
 * Parses a compound vertex id built by coalesce() (`(<left>+<right>)`)
 * back into its immediate two parent ids, or returns `null` for a
 * primitive (never-merged) id. The parenthesized form is unambiguous at
 * any nesting depth — a bare `left+right` string concatenation can't
 * tell where an inner merge's own "+" ends and an outer one begins once
 * a parent id is itself compound (e.g. is `"v1+v2+v3"` `(v1+v2)+v3` or
 * `v1+(v2+v3)`? genuinely ambiguous). This is what lets `separate()`
 * correctly restore a split-out child's own `sourceIds` even when that
 * child is itself the product of an earlier merge, purely by re-parsing
 * its id — no extra stored field needed beyond the id string itself
 * (derive, don't duplicate).
 */
export function parseCompoundId(id) {
  if (!id.startsWith('(') || !id.endsWith(')'))
    return null;
  const inner = id.slice(1, -1);
  let depth = 0;
  for (let i = 0; i < inner.length; i++) {
    const c = inner[i];
    if (c === '(')
      depth++;
    else if (c === ')')
      depth--;
    else if (c === '+' && depth === 0)
      return [inner.slice(0, i), inner.slice(i + 1)];
  }
  return null; // malformed -- no top-level '+' found
}
