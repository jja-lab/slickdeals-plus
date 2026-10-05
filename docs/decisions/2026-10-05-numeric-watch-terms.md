# Decision: D01 — Numeric watch terms use token boundaries

- Date/time (UTC): 2026-10-05
- Project: Slickdeals+
- Run ID / branch: `20261005-200544-slickdeals-fix1-49854f8c` / `astra/20261005-200544-slickdeals-fix1-49854f8c`
- Status: decided-in-flight
- Decision maker: coordinating agent
- Authority: JJ approved the first F01–F04 batch and bounded Loom cleanup; supplied Run Brief Stage 2 explicitly delegates numeric boundaries and reject-versus-normalize choices. Exact semantics are not human-approved.
- Supersedes: none
- Next review checkpoint: JJ review of the locally committed B candidate, before any live test.

## Question

Which numeric strings count as standalone watch-term hits without changing ordinary text matching?

## Constraints and evidence

F01 in `docs/audits/2026-10-05/report.md` demonstrates substring matches inside $10.01/$100.01. Preserve $0.01 and 0.01 positives, custom terms, scores and ordinary case-insensitive substring matching. No vocabulary tuning or version bump is authorized.

## Chosen option and rationale

Apply numeric boundaries only to whole terms matching an optional dollar sign, digits, and an optional decimal fraction (digits required on both sides of the decimal). Keep lexical equality: 0.010 is distinct from 0.01; no rounding or numeric coercion. A bare numeric term also matches its dollar-prefixed form; a dollar-prefixed term requires the dollar sign.

The left edge must be start or a character other than a Unicode letter/number, underscore, dot, comma or dollar sign. The right edge rejects letters/numbers/underscore, a dot followed by a letter/number/underscore, or a comma followed by a digit. Thus parentheses, colon, semicolon, exclamation, question mark, terminal period and terminal comma delimit a token; attached decimals/grouped numbers and model/version tokens do not. Hyphens and slashes are delimiters; embedded unseparated model/version text is not. A leading dot/comma is conservatively rejected. Signs are delimiters, not a supported signed-number grammar. Preserve valid term bytes, including spaces; padded or otherwise nonnumeric strings keep existing text semantics.

## Alternatives considered

| Option | Benefits | Costs / drawbacks | Reason not selected |
| --- | --- | --- | --- |
| Digit-only boundaries | Very small patch | Still hits model/version strings | Does not satisfy embedded-token scope |
| Parse prices numerically | Treats 0.010 as equivalent | Broadens matches, conflates titles and prices, needs locale rules | Exceeds bounded lexical fix |
| Boundaries for every term | Uniform behavior | Breaks customized ordinary substring terms | Violates ordinary matching preservation |

## Runner-up

Digit-only boundaries are simpler but fail embedded models. Evidence that users intentionally rely on model numeric fragments could support a later explicit numeric/text mode.

## Consequences and affected work

Production keyword matcher and new offline fixtures change. Some leading-dot/comma or attached model forms stop alerting; punctuation and custom lexical numbers are covered explicitly. No storage migration, dependency, external effect or scoring change.

## Cost and steps to revert

Revert only the numeric matching helper/call and corresponding fixture expectations in the production file and comparison runner (small local edit, under an hour), then rerun checks. This restores F01 false positives. Existing dedup records are untouched; already displayed alerts cannot be undone by source reversion.

## Review and supersession history

2026-10-05: recorded before implementation. JJ disposition pending; silence is not acceptance.
