// The request pathway (stage 3 of DICTO's KRP plan): an environment asks for an object by its ID
// and gets it regenerated, with its description, instead of keeping its own copy.
import { parseObjectId, KRP_VERSION } from './vocabulary.js';
import { EKP_RECORDS, describe, facesOf } from './identity/ekp.js';

const RECORDS = { ...EKP_RECORDS };

/** Every generator the core can answer for. */
export const GENERATORS = Object.keys(RECORDS);

/** The object an ID names: { description, faces } (faces in the generator's own units). An ID made
 *  by another core version is refused: this core cannot promise to regenerate it exactly. */
export function request(id) {
  const { generator, version, params } = parseObjectId(id);
  if (version !== KRP_VERSION) throw new Error(`'${id}' was made by krp-core ${version}; this is krp-core ${KRP_VERSION}`);
  if (!RECORDS[generator]) throw new Error(`krp-core has no generator '${generator}'`);
  return { description: describe(generator, params), faces: facesOf(generator, params) };
}
