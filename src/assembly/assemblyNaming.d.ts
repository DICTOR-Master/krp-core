/**
 * A running, always-on description of the CURRENT assembly (ordinary 3D
 * face/vertex/duoprism builds — RCP-C2B already has its own live "Cells:
 * X / Y" progress label, so this doesn't need to special-case it, just
 * describe whatever graph shape it's handed). Direct user request: "a
 * running total name so far" as things get attached.
 *
 * Two tiers, lookup first: a small, hand-curated catalog of exact
 * structural signatures (`NAMED_ASSEMBLIES`) the user has confirmed
 * deserve a real name, falling back to a generic, always-honest summary
 * built straight from the graph (root shape + each attached shape type,
 * grouped by kind + count) when nothing matches. The lookup deliberately
 * never invents a name on its own — every entry here was proposed AND
 * confirmed by the user first (see e.g. "Tetrahedral Star" below); this
 * module only ever recognizes signatures it's been explicitly told
 * about, never guesses at classical-sounding names for an arbitrary
 * build.
 */
import type { AssemblyNode, AssemblyConnection } from './assembly.js';
/**
 * The current assembly's running name/description — '' for an empty
 * graph OR a single, unattached root. A lone shape isn't really "an
 * assembly" yet (nothing's been built), and showing its bare name here
 * caused a real regression: this label's plain shape-name text could
 * collide with an unrelated `text=/^shapename$/i` locator elsewhere in
 * the app (e.g. a shape-browser card) expecting to be the only match on
 * the page. Once something is actually attached, the fuller generated
 * text (root + at least one attached piece) no longer collides with a
 * bare single-word shape-name locator.
 */
export declare function describeAssembly(nodes: AssemblyNode[], connections: AssemblyConnection[]): string;
