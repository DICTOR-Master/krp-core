// Every record the core holds, and describe()/facesOf() over all of them.
import { EKP_RECORDS } from './ekp.js';
import { KALEIDO_RECORDS } from './kaleido.js';
import { makeDescriber } from './describe.js';

export const RECORDS = { ...EKP_RECORDS, ...KALEIDO_RECORDS };
export const { describe, facesOf } = makeDescriber(RECORDS);
