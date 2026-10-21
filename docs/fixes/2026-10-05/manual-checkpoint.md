# Candidate B: next manual checkpoint

## Current status — 2026-10-07

The subsequent focused native F01–F04 checkpoint is complete; see [native results](native-browser-2026-10-07.md) and [independent review](native-review-2026-10-07.md). B passed 132 detector checks, 8 built-ins, the tested highlight transitions, and six JJ-approved native imports, including empty/custom reload persistence. Remaining import categories have offline coverage only. Both scripts/managers are disabled, exact source hashes preserved, default settings restored, and four synthetic dedup IDs retained in each disposable profile. No further manual import is needed for this accepted checkpoint.

Next action is JJ review of candidate B, in-flight N01 fixture protocol, actual coverage and unresolved followups. Keep scripts off until a later concrete test/use checkpoint. No merge, push, release, new fix batch or general live compatibility claim is authorized. The following 2026-10-06 setup proposal and sequence are historical; their pending-approval wording does not reopen completed work.

Status as of 2026-10-06: D01/D02 accepted; disposable-profile setup and sequential default-off smoke were subsequently approved and completed. See [native smoke results](browser-smoke-2026-10-06.md) for actual source, storage and browser evidence and limitations. Both scripts/managers finish disabled. Broader alert-enabled F01–F04 tests remain a separate JJ checkpoint. No push, merge or release is authorized.

Use the original [comparison protocol](../../audits/2026-10-05/comparison-plan.md) for disposable-profile isolation, manager auto-update controls, sequential variant activation, matched storage seeds, paired order, observation logs and rollback. Its historical statement that B did not yet exist is superseded by this implementation handoff; its broader case matrix does not enlarge the approved F01–F04 batch.

## Exact artifacts

The run's `agent/artifacts/` retains `A.user.js`, `B.user.js` and `manifest.json`, with exact source bytes, SHA-256 and Git identities. Absolute directory:

`/Users/jjatkinson/Documents/Projects/astra-orchestrator/.astra/runs/20261005-200544-slickdeals-fix1-49854f8c/agent/artifacts/`

A is `2d368f8e003aa6d9e7c28c8f4ef82f1fabcba8ac`, SHA-256 `bd090250026addeb1e4eac018129a4f8bd60673b12daee8163eb5281654877fb`. Tested B is implementation commit `303387389d30269293a5b6c7b9385a1fcf6b7fbc`, SHA-256 `63b5097d31bb0832bb187a82033fbee075e3fd4acb8f561d67f8c3a9fc6bcb83`; documentation acceptance commits do not replace its identity. Both retain original version metadata; do not identify them by displayed version or download a current release as a substitute. Verify hashes before and after any later installation. Keep artifact backups and source worktrees.

## Original browser setup proposal (historical)

The following proposal records the pre-setup plan. It has been fulfilled for test-profile / Profile 1 (A) and Slickdeals B / Profile 2 (B); current versions, setup evidence and actual grants are recorded in the smoke report and agent continuity. Do not repeat completed setup merely because the original proposal below uses prospective language.

Proposed setup: two disposable profiles named `Slickdeals A` and `Slickdeals B`, with the same browser/manager versions and configuration, logged out of browser sync and Slickdeals unless JJ explicitly chooses otherwise. Do not clone the everyday profile or import personal cookies/settings. Manager auto-update controls must prevent either exact local script being replaced; if that cannot be verified, stop before installation. Install only the matching artifact into each profile after confirmation, keeping scripts disabled until the sequential test begins.

Use equal initial settings and empty dedup stores in the disposable profiles, record both GM and origin-local state, and restore the same test seeds for paired cases. Keep only one variant enabled across the experiment. First confirm setup; then guide installation/hash verification and the default-off smoke test one step at a time. Existing profiles may be reused only if JJ confirms they are disposable and their state can be matched. Record setup approval with its actual message; elapsed time or acceptance of D01/D02 does not authorize browser changes.

## Native acceptance sequence — setup/smoke complete, remaining cases pending approval

1. D01/D02, disposable setup and bounded default-off smoke are complete. Obtain JJ's explicit approval of the remaining concrete native test actions before enabling alerts or replaying imports/reset cases. Do not use the everyday profile or personal storage.
2. Apply the existing protocol's equal browser/manager settings and effective auto-update controls. Activate only one variant at a time across the experiment. Record exact installed hashes, timestamps, URLs and fixture identities.
3. Default-off smoke verified one menu/style set, sampled alert inactivity and absent dedup. Existing filter/sorting/highlight interactions were not exercised and remain pending; preserve that distinction from the completed smoke.
4. Replay numeric positive/negative cases from `compare.cjs`, including punctuation, larger prices, trailing decimals, model/version strings and custom numeric terms. Record title and verdict independently of real deal quality.
5. From equal saved seeds, use the real file picker to import invalid roots, malformed watchlists, valid custom and intentionally empty lists, partial settings and warning cases. Rejected imports must preserve current settings and both stores; accepted values must persist after reload. Record notification and settings refresh behavior.
6. Enable alerts on wrapped and wrapper-less cards, then disable using the checkbox, reset and import. Confirm no stale alert class remains, including cards that have lost price data. Reprocess again and verify dedup entries are unchanged. Cancelled resets remain unchanged. Do not claim pending-text-timer behavior is fixed.
7. Record native DOM/API/layout, userscript-manager storage and observer behavior as browser observations; offline mocks cannot certify these. F05–F11 remain unresolved and may surface. Do not fold repairs into this live checkpoint without authorization.

Stop on unexpected storage changes, alert floods, duplicate activation, source hash drift or unexplained exceptions. Disable B, retain evidence, and follow the original protocol's explicit A/seed restoration only within disposable profiles. Report controlled replay separately from variable live-page observations. No browser speedup or population alert precision is established by this patch.
