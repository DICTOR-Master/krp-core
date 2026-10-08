// describe(): an object's full description in the KRP vocabulary, from its record and a parameter
// state. Records live in the family files (ekp.js, kaleido.js) and are gathered in index.js.
import { KRP_VERSION, objectId, topologyOf, volumeOf, edgeLengthsOf, fingerprintOf } from '../vocabulary.js';

const sameParams = (a, b) => Object.keys(b).length === Object.keys(a).length && Object.keys(b).every((k) => a[k] === b[k]);

export function makeDescriber(RECORDS) {
  const recordOf = (generator) => {
    const r = RECORDS[generator];
    if (!r) throw new Error(`no record for '${generator}'`);
    return r;
  };
  const checkParams = (generator, r, params) => {
    for (const k of Object.keys(params)) if (!r.params?.[k]) throw new Error(`'${generator}' has no parameter '${k}'`);
    for (const [k, { min, max }] of Object.entries(r.params ?? {})) {
      if (typeof params[k] !== 'number') throw new Error(`'${generator}' needs a number '${k}'`);
      if (params[k] < min || params[k] > max) throw new Error(`'${generator}': ${k} is outside ${min}..${max}`);
    }
    if (r.valid && !r.valid(params)) throw new Error(`'${generator}': no such object at ${JSON.stringify(params)}`);
  };

  /** The faces of a generator's object at a parameter state (parts translated and joined). */
  function facesOf(generator, params = {}) {
    const r = recordOf(generator);
    if (r.parts) return r.parts.flatMap(({ generator: g, offset }) => facesOf(g).map((f) => f.map((p) => p.map((c, i) => c + offset[i]))));
    checkParams(generator, r, params);
    return r.make(params);
  }

  /** An object's full description. */
  function describe(generator, params = {}) {
    const r = recordOf(generator);
    checkParams(generator, r, params);
    // A parameterised object is in the record only at a curated state (its own record, or the
    // generator's); anywhere else it was just generated.
    const state = r.curated ? r.curated.find((c) => sameParams(params, c.params)) : null;
    const inRecord = r.curated ? !!state : true;
    const meta = { ...r, ...(state ?? {}) };
    const faces = facesOf(generator, params);
    const solid = (r.dimension ?? 3) === 3 && !r.nested;
    // Built from parts: the parts' own topology counts (joined faces would not form one surface).
    const topology = r.parts
      ? { parts: r.parts.length, partsClosed: r.parts.every((p) => topologyOf(facesOf(p.generator)).closed) }
      : topologyOf(faces);
    return {
      id: objectId(generator, params),
      generator,
      version: KRP_VERSION,
      params: { ...params },
      label: r.label,
      dimension: r.dimension ?? 3,
      ambient: 3,
      family: r.family,
      parent: r.parent ?? null,
      ...(r.parts ? { parts: r.parts.map((p) => ({ ...p, offset: [...p.offset] })), nested: !!r.nested } : {}),
      ...(r.compound ? { compound: r.compound } : {}),
      topology,
      measurements: {
        ...(solid ? { volume: r.parts ? r.parts.reduce((t, p) => t + volumeOf(facesOf(p.generator)), 0) : volumeOf(faces) } : {}),
        edgeLengths: edgeLengthsOf(faces),
      },
      validation: r.validation ?? [],
      names: inRecord ? { ...(meta.names ?? {}) } : {},
      novelty: inRecord ? { ...meta.novelty } : { kind: 'not-searched' },
      status: inRecord ? meta.status : 'Generated',
      history: inRecord ? meta.history.map((h) => ({ ...h })) : [],
      retention: inRecord ? 'retained' : 'ephemeral',
      // Only a retained object carries one (declared here so typed consumers see the field).
      fingerprint: inRecord ? fingerprintOf(faces) : undefined,
    };
  }
  return { describe, facesOf };
}
