# Decision: D02 — Reject malformed watchlist imports atomically

- Date/time (UTC): 2026-10-05
- Project: Slickdeals+
- Run ID / branch: `20261005-200544-slickdeals-fix1-49854f8c` / `astra/20261005-200544-slickdeals-fix1-49854f8c`
- Status: decided-in-flight
- Decision maker: coordinating agent
- Authority: JJ approved the first F01–F04 batch and bounded Loom cleanup; supplied Run Brief Stage 2 explicitly delegates numeric boundaries and reject-versus-normalize choices. Exact semantics are not human-approved.
- Supersedes: none
- Next review checkpoint: JJ review of the locally committed B candidate, before any live test.

## Question

Should invalid watchlist structures/elements be rejected, normalized or replaced with defaults?

## Constraints and evidence

F02 accepts null/numeric terms and empty strings, producing exceptions or alert floods. F03 ignores validation failure. Valid custom strings and deliberately empty A/B/C arrays must survive; malformed input must not silently broaden a user watchlist. Existing valid partial imports fill omitted settings from defaults; unrelated wrong-type/color warnings and unknown-key handling stay compatible.

## Chosen option and rationale

A present watchlist must be a non-null, non-array object with all three A/B/C arrays, each containing only strings whose trim is nonempty. Preserve accepted strings byte-for-byte and allow empty arrays. Extra watchlist keys remain tolerated but unused. Reject an entire import on an invalid root (including arrays) or present malformed watchlist, before assignment, writes, menu refresh, success toast or settings event. Do not partially apply even valid sibling settings on rejection.

At stored-settings validation, return a safe fallback with empty keyword tiers for an explicitly malformed watchlist, plus isValid=false/errors; other validated/defaulted settings are retained. Existing loader consumes the safe result; no eager repair write is added. The detector independently suppresses all keyword hits for a present malformed watchlist, retaining non-keyword anomaly evaluation. Only an absent watchlist uses defaults, for existing missing-setting compatibility. Invalid data never triggers a silent default vocabulary substitution. Existing legacy migration may persist the safe validated result through its existing path.

## Alternatives considered

| Option | Benefits | Costs / drawbacks | Reason not selected |
| --- | --- | --- | --- |
| Drop invalid terms and warn | Salvages valid terms | Partially applies user input; obscures lost terms | Whole import rejection is easier to explain and undo |
| Replace malformed watchlist with defaults | Always supplies keywords | Broadens custom or empty watchlists | Conflicts with conservative requirement |
| Reject every settings warning | Uniform strictness | Breaks existing partial/warning compatibility | Unnecessary outside batch scope |

## Runner-up

Dropping invalid terms with warnings minimizes disruption but hides partial changes. A later user-facing repair preview could make normalization reviewable.

## Consequences and affected work

Validation helper, import callback, defensive matcher and offline fixtures change. Malformed persisted watchlists temporarily lose keyword signals until corrected; price-only signals remain. Valid custom and empty lists survive. No new storage format, dependencies, UI configuration or score changes. Invalid imports preserve both stores and live settings exactly.

## Cost and steps to revert

Revert the validation helper/branch, import guard and detector fallback, and adjust comparison fixtures (small local edit, under an hour). No new schema to migrate. Legacy migration may already have written empty tiers from malformed data; recovering original malformed values requires a retained user export/store snapshot. No real user stores are accessed in this run.

## Review and supersession history

2026-10-05: recorded before implementation. JJ disposition pending; silence is not acceptance.
