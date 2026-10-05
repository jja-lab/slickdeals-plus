# Candidate B: next manual checkpoint

Status: prepared for JJ review only. This implementation grant authorizes offline artifacts and local commit, not browser/profile/extension changes, installation, release, push or merge. D01/D02 remain decided-in-flight; exact semantics need JJ disposition before a live experiment.

Use the original [comparison protocol](../../audits/2026-10-05/comparison-plan.md) for disposable-profile isolation, manager auto-update controls, sequential variant activation, matched storage seeds, paired order, observation logs and rollback. Its historical statement that B did not yet exist is superseded by this implementation handoff; its broader case matrix does not enlarge the approved F01–F04 batch.

## Exact artifacts

The run's `agent/artifacts/` retains `A.user.js`, `B.user.js` and `manifest.json`, with exact source bytes, SHA-256 and Git identities. Absolute directory:

`/Users/jjatkinson/Documents/Projects/astra-orchestrator/.astra/runs/20261005-200544-slickdeals-fix1-49854f8c/agent/artifacts/`

A is `2d368f8e003aa6d9e7c28c8f4ef82f1fabcba8ac`, SHA-256 `bd090250026addeb1e4eac018129a4f8bd60673b12daee8163eb5281654877fb`. B is the reviewed candidate identified in the manifest and run handoff. Both retain original version metadata; do not identify them by displayed version or download a current release as a substitute. Verify hashes before and after any later installation. Keep artifact backups and source worktrees.

## Proposed live acceptance sequence, pending authorization

1. JJ reviews D01 token syntax and D02 rejection/fallback behavior, then explicitly authorizes disposable profiles and a bounded live session. Do not use the everyday profile or personal storage.
2. Apply the existing protocol's equal browser/manager settings and effective auto-update controls. Activate only one variant at a time across the experiment. Record exact installed hashes, timestamps, URLs and fixture identities.
3. First verify alerts default off, existing filters/sorting/highlights, no alert toast/dedup writes, and one menu/style set.
4. Replay numeric positive/negative cases from `compare.cjs`, including punctuation, larger prices, trailing decimals, model/version strings and custom numeric terms. Record title and verdict independently of real deal quality.
5. From equal saved seeds, use the real file picker to import invalid roots, malformed watchlists, valid custom and intentionally empty lists, partial settings and warning cases. Rejected imports must preserve current settings and both stores; accepted values must persist after reload. Record notification and settings refresh behavior.
6. Enable alerts on wrapped and wrapper-less cards, then disable using the checkbox, reset and import. Confirm no stale alert class remains, including cards that have lost price data. Reprocess again and verify dedup entries are unchanged. Cancelled resets remain unchanged. Do not claim pending-text-timer behavior is fixed.
7. Record native DOM/API/layout, userscript-manager storage and observer behavior as browser observations; offline mocks cannot certify these. F05–F11 remain unresolved and may surface. Do not fold repairs into this live checkpoint without authorization.

Stop on unexpected storage changes, alert floods, duplicate activation, source hash drift or unexplained exceptions. Disable B, retain evidence, and follow the original protocol's explicit A/seed restoration only within disposable profiles. Report controlled replay separately from variable live-page observations. No browser speedup or population alert precision is established by this patch.
