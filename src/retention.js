// Deliberate retention (stage 4 of DICTO's KRP plan). A kept entry is an ID and a fingerprint,
// never coordinates: the object is regenerated when it is opened, and the fingerprint shows whether
// the core still makes the same object. Where entries are stored is the site's business (a
// visitor's own browser in Kaleidohedra); what enters the curated record is DICTO's decision.
import { fingerprintOf } from './vocabulary.js';
import { request } from './request.js';

/** A kept entry for an object ID: { id, fingerprint, kept (ISO date), name }. */
export function keepEntry(id, name = '', now = new Date()) {
  const { faces } = request(id);
  return { id, fingerprint: fingerprintOf(faces), kept: now.toISOString(), name: String(name).slice(0, 80) };
}

/**
 * Regenerate a kept entry and compare: { result: 'same' | 'changed' | 'unavailable', id, description?,
 * faces?, madeWith? }. 'changed' means this core makes a different object for that ID (a newer
 * generator); 'unavailable' means it cannot make it at all (generator gone, or no longer valid).
 */
export function checkKept(entry) {
  try {
    const r = request(entry.id, { anyVersion: true });
    return { result: fingerprintOf(r.faces) === entry.fingerprint ? 'same' : 'changed', id: entry.id, description: r.description, faces: r.faces, ...(r.madeWith ? { madeWith: r.madeWith } : {}) };
  } catch (e) {
    return { result: 'unavailable', id: entry.id, reason: e.message };
  }
}

/** Whether a value read back from storage is a well-formed kept entry. */
export function isKeptEntry(e) {
  return !!e && typeof e.id === 'string' && /^[0-9a-f]{16}$/.test(e.fingerprint) && typeof e.kept === 'string' && !Number.isNaN(Date.parse(e.kept)) && typeof e.name === 'string';
}
