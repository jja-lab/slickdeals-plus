# Offline F01–F04 comparison evidence

Date: 2026-10-05. Node v26.8.2. No dependencies, network/API requests, browser/profile/extension changes or real settings stores.

## Identities and outcomes

| Variant / artifact | Identity / SHA-256 |
| --- | --- |
| A | commit `2d368f8e003aa6d9e7c28c8f4ef82f1fabcba8ac`; never main |
| A source | `bd090250026addeb1e4eac018129a4f8bd60673b12daee8163eb5281654877fb` |
| B source | `63b5097d31bb0832bb187a82033fbee075e3fd4acb8f561d67f8c3a9fc6bcb83` |
| Runner | `6511cde60dd09b0050003ee3a42c74a7363a49eac7f04b0a5e6ed75cad0f6ad2` |
| Input manifest | `6cb77d15bb1f73e9cd4138cfa6eb909bb3847d14d7275d7982df113713887820` |

B is the unreleased source at implementation commit `303387389d30269293a5b6c7b9385a1fcf6b7fbc`; later documentation commits do not replace tested B's identity. The captured pre-commit run labels it uncommitted and pins its exact hash; the run handoff and artifact manifest record the resulting full commit. Metadata/version is unchanged. Input-manifest hash covers labels, explicit inputs and A expectations; runner hash additionally covers settings seeds, assertions, operations, mocks and clock/timer schedule.

[comparison-output.txt](comparison-output.txt) records source paths/identities, all result rows and structured A assertion observations, including actual/expected snapshots on rejected-import checks.

| Check | Actual result | Exit |
| --- | --- | --- |
| New comparison: A | 53 passes, 121 expected failures, 0 unexpected; 174 total | 0 for correct characterization |
| New comparison: B | 174 passes, 0 failures | 0 |
| Injected assertion | `Injected assertion: expected nonzero exit` | 1, required |
| Negative control: exact A supplied as B | 53 passes, 121 required-B failures | 1, required |
| Preserved audit characterization on unchanged A worktree | 8 control groups, 12 expected baseline failures, 0 unexpected | 0 |
| Preserved audit `--strict` | Same observations, known defects remain | 1, required |
| Production, new runner and original probe syntax | Pass | 0 |
| Diff whitespace checks | Pass (including final staged/commit checks recorded in run handoff) | 0 |

Counts refer to fixture groups, not population precision or individual assertions. The built-in eight detector fixtures are one passing group. New A failures exercise the approved fixes at multiple boundaries; they do not mean 121 distinct defects. Original audit artifacts and hash guard remain byte-identical.

## Reproduction

From this implementation worktree, using the retained exact A artifact:

```sh
node --check slickdeals-plus-v33.0.0.js
node --check docs/fixes/2026-10-05/compare.cjs
node docs/fixes/2026-10-05/compare.cjs --a /Users/jjatkinson/Documents/Projects/astra-orchestrator/.astra/runs/20261005-200544-slickdeals-fix1-49854f8c/agent/artifacts/A.user.js --b slickdeals-plus-v33.0.0.js --a-id 2d368f8e003aa6d9e7c28c8f4ef82f1fabcba8ac --b-id reviewed-candidate
```

Use `--inject-failure` with the same command to require exit 1. Supplying the exact A artifact as `--b` must instead fail the actual B assertions with 121 unexpected outcomes and exit 1. The coordinator ran both and retained full output in `agent/comparison-injected-failure.txt` and `agent/comparison-A-as-B-negative-control.txt`.

Run the old probes **only against A**, for example the unchanged audit worktree:

```sh
node /Users/jjatkinson/Documents/Projects/astra-orchestrator/.astra/worktrees/20261005-184105-slickdeals-audit-05fcc16a/docs/audits/2026-10-05/probes.cjs
node /Users/jjatkinson/Documents/Projects/astra-orchestrator/.astra/worktrees/20261005-184105-slickdeals-audit-05fcc16a/docs/audits/2026-10-05/probes.cjs --strict
```

The coordinator extracted A directly with `git show <A-commit>:slickdeals-plus-v33.0.0.js`, verified its pinned SHA-256 and retained exact bytes. Normal/strict audit output is retained in `agent/baseline-normal.txt` and `agent/baseline-strict.txt`. Original `docs/audits/2026-10-05/probe-output.txt` remains unchanged.

## What is actually exercised

- Entire production module definitions execute in fresh Node VM contexts; unique source anchors extract actual menu change/reset/import callback registration and settings reprocess handler. No test-only code is inserted in production.
- The real SettingsModule reads/writes isolated GM/localStorage Maps. Invalid imports compare current settings, both complete stores, write history, emitted events and menu refresh counts before/after, and require exactly one error notification. Valid empty/custom lists survive import and reload. Existing warning, partial-import and unknown-key compatibility are checked.
- Numeric fixtures cover lexical decimals/integers/dollar signs, larger amounts, punctuation, attached Unicode letters, model/version syntax, custom numbers and unchanged ordinary/padded text semantics. Malformed watchlist shapes and null/number/object/empty/whitespace elements in every tier are exercised through validation, direct detection and import. Stored malformed data gets safe empty tiers without eager writes; independent price anomalies still work.
- Actual toggle/reset/import callbacks trigger the actual settings handler and processing module on wrapped and wrapper-less synthetic cards, including cards whose price data disappears after highlighting. Repeated processing preserves cleared classes and dedup bytes. Re-enable, enabled import/reimport and cancelled reset are controls. A counted spy requires zero detector calls with default-off settings; debug-only catches are captured so swallowed exceptions do not masquerade as success.
- Built-in fixtures, scores/combinations at all sensitivities, representative filters/highlights/parsers, URL scheme rejection and dedup reload/normalization/FIFO/dual writes are controls. No threshold/vocabulary changes.
- Same cases, settings, fresh stores and deterministic timer schedule apply to both variants. `Date.now` is fixed at `1791201600000` plus simulated elapsed time, including self-test IDs. Each reload case alone deliberately reuses its own stores. No cross-variant state is shared.
- Only assertions and specifically recognized baseline malformed-term `toLowerCase` TypeErrors can count as expected A failures; unknown errors and unexpected passes fail the process. B must pass every case.

## Limits and unresolved work

Synthetic nodes/classes/selectors are not a DOM implementation. FileReader and confirmation are synchronous mocks; event callback registration is extracted, not a live menu mount. Initialization, actual browser layout, manager storage permissions, native observer scheduling and current Slickdeals selectors/API remain unverified. The runner does not establish speedup, security comprehensiveness or population alert precision.

F05–F11 remain unresolved: duplicate redirect handlers, shared/pending text debounce, partial API record fallback, unbounded API wait, insertion during processing lock, URL double decoding and late navbar recovery. Original audit evidence is retained; the new runner does not claim these findings pass in B. No pending timer fix is included. See [manual-checkpoint.md](manual-checkpoint.md) for the later explicitly authorized live gate.
