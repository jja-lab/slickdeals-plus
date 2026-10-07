# Controlled native F01–F04 checks — 2026-10-07

The approved focused native checks and final disabled-state verification are complete. Both managers/scripts finish off, with exact source bytes preserved and observed test pages unloaded. No production source, version, dependency, release, push or merge changed during this continuation.

## Authority and test identities

JJ approved native F01–F04 tests after the [default-off smoke](browser-smoke-2026-10-06.md). Chrome denied automated file assignment, so JJ operated the native picker while the agent prepared seeds and captured results. JJ subsequently accepted the focused coverage proposal with “sounds good”: stop further A imports and run six B imports plus empty/custom reload persistence. This intentionally narrows and makes native import coverage asymmetric; it does not reduce the completed offline suite.

| Variant | Source commit | SHA-256 |
| --- | --- | --- |
| A | `2d368f8e003aa6d9e7c28c8f4ef82f1fabcba8ac` | `bd090250026addeb1e4eac018129a4f8bd60673b12daee8163eb5281654877fb` |
| B | `303387389d30269293a5b6c7b9385a1fcf6b7fbc` | `63b5097d31bb0832bb187a82033fbee075e3fd4acb8f561d67f8c3a9fc6bcb83` |

Both scripts retain v33.0.0 metadata. Documentation commits do not replace these tested identities. Profiles remain A/test-profile/Profile 1 and B/Slickdeals B/Profile 2, with Chrome and Tampermonkey versions recorded in the smoke report. No upgrades occurred during this phase.

## Method and decisions

Native Tampermonkey runs the unchanged installed source on an intercepted document at `https://slickdeals.net/?sdplus_native_fixture=f01-f04`. Identical local HTML and three exact DataModule API responses (`[]`) isolate synthetic cards from live deals. Before mutation, guards require top-level execution, the exact fixture URL/marker, and permitted synthetic card IDs. The actual setting, reset and import handlers execute; exposed debug APIs provide detector calls, reproducible seeds, processing and native GM diagnostics. Neither production source nor private handlers are substituted.

Protocol records reside in the run directory listed below:

- **N01**, `decision-native-fixture-isolation.md`: decided in flight; JJ review of the fixture approach remains pending. Native DOM/storage behavior is covered; variable live-site behavior is not.
- **N02**, `decision-native-import-coverage.md`: original twelve-imports-per-variant proposal, preserved with its rationale.
- **N03**, `decision-native-focused-b.md`: JJ accepted six focused B imports, superseding N02 under that explicit checkpoint. Cases are 00/null, 09/malformed JSON, 20/null watch term, 39/empty watchlist, 40/custom watchlist, and 42/warnings. D01/D02 remain accepted and unchanged.

## Observed results

| Check | A baseline | B candidate |
| --- | --- | --- |
| Numeric boundaries: 50 cases | 28 pass / 22 expected defects | 50 pass |
| Malformed watchlists: 54 cases | 10 pass / 44 expected defects | 54 pass |
| Nearby detector controls: 28 cases | 28 pass | 28 pass |
| Built-in fixtures | 8/8 pass | 8/8 pass |
| Default-off synthetic processing | No highlights or fixture dedup membership | Same |
| Explicit disable, four wrapped/bare cards including two no-data cards | Clears highlights | Clears highlights |
| Cancel Reset All | Settings/local entries unchanged; highlights preserved | Same |
| Accept Reset All | Four stale highlights persist after repeated processing | All four cleared and remain clear |
| Other setting reprocess with alerts disabled | Four stale highlights persist | All four cleared |
| Null import (00) | Accepts and changes settings/GM/local with success toast | Rejects, preserves settings/GM/local, failure toast |
| Numeric-root import (01) | Accepts and changes settings/GM/local with success toast | Offline coverage only |
| Malformed JSON (09), null watch term (20) | Not run natively under focused coverage | Both reject atomically |
| Empty/custom imports (39/40) | Not run natively under focused coverage | Exact expected values in settings/GM/local, persist after reload |
| Import turns alerts off (combined with B39) | Not run natively | All four highlights clear; repeated processing keeps clear |
| Warning import (42) | Not run natively | Expected defaults saved to both stores; exactly two warnings |

Native detector totals are A **66 pass / 66 expected failures**, B **132/132 pass**, plus 8/8 built-ins each. The returned effective inputs were independently compared to `cases.json`, including `$$0.01`. A prior attempt corrupted that input during runner string expansion; it remains a nonauthoritative attempt and is excluded from these results.

All six selected B native import assessments pass. Rejected imports 00/09/20 preserve the live settings object, all seven observed localStorage entries, raw GM master, and displayed minimum-price value; each produces only the failure toast and no observed dynamic stylesheet mutation. Empty/custom values match the expected fixture in the live object and both stores after actual document reloads, including custom whitespace, the numeric string and an unknown tier. The warning result was recovered from the surviving original observer after a stalled read, rather than inferred from JJ's report alone.

Three repeated processing passes follow each relevant transition. Local dedup bytes and native GM-first membership stay unchanged, and no new alert toast is recorded after disabling. The built-in self-test materializes initially absent empty dedup storage; subsequent synthetic alerts add four test IDs. These retained entries are intentional, not an empty store.

A's corrected pure rerun began with the empty dedup record left by its earlier attempt; B's first pure run began with the record absent. Both finished with an empty record and unchanged settings. Exact detector inputs match, but these initial storage representations are not claimed to be identical fresh stores.

## Tool failures and evidence limits

- Chrome denied `DOM.setFileInputFiles` with `Not allowed`. No alternate file assignment, private handler invocation, permission weakening or dashboard workaround was used. JJ disconnected debugging for native picker selection; the agent reconnected only after the reported selection.
- Reused B-tab routing failed with unavailable `Fetch.enable`/`Fetch.disable` methods. Installed-code review supported a fresh-tab recovery, which successfully fulfilled the exact fixture. The underlying failed-session cause remains unproven. Registration alone was not treated as proof of routing.
- Manual disconnection removed session routes. An initial B39 reload reached the live page with alerts already off; its fixture guard timed out and it was not counted as persistence evidence. The agent restored the fixture without store writes and then completed an actual guarded reload. B40 routes were restored before reload.
- Some background-tab waits and a reset click timed out. Foregrounding the tab and short staged captures recovered the checks. Earlier inconclusive reset/cancel attempts remain excluded. A live-page evaluation once addressed an ad frame even through `mainFrame`; all controlled mutations require verified top-level fixture execution.
- GM master is read through the installed script's public diagnostic method. Intermediate GM dedup observations establish membership, not raw equality; local bytes and final native export provide separate dedup evidence. Private settings-event counts are unavailable: stylesheet/UI consequences are observed instead.
- The other-setting transition deliberately seeds `glitchAlerts=false` through the exposed settings object, then executes the actual `freeOnly` handler. It is not represented as a purely user-operated transition.
- Controlled document/API fixtures are not proof of general live-site compatibility, performance improvement, population alert precision, or complete observer behavior. The remaining generated import cases are offline-only. F05–F11, including the sensitivity display mismatch and pending text-edit timers, remain unresolved.

## Retained evidence and close-out

Run directory: `/Users/jjatkinson/Documents/Projects/astra-orchestrator/.astra/runs/20261005-200544-slickdeals-fix1-49854f8c/agent` on branch `astra/20261005-200544-slickdeals-fix1-49854f8c`.

`native-f01-f04/` retains exact inputs/helpers and source-hash manifests; corrected A/B pure results; toggle/reset/reprocess snapshots; paired import before/after/assessments; B39/B40 reload evidence; review and connection-recovery notes; and final native exports/verification. These local continuity records are gitignored, not Git backups. Earlier failed/incomplete attempts are explicitly distinguished. Exact sources remain in `artifacts/` and at the pinned commits above.

A's final decoded source matches its baseline, both manager/script flags are false, original manager settings/options/UUID are unchanged, and GM master/dedup match the last native local values. Its four exact fixture routes were removed and the base page has no script menu/styles/highlights/processed markers. Export SHA-256: `062dd7db16ea6c716306a189f57716846ef39be7d99646401324d8f3dc509fd5`.

B's first after-test export still had both enabled flags true and was not accepted as disabled-state evidence. JJ corrected both switches and supplied `B-native-disabled.txt`. Its decoded source, UUID/options/manager settings are unchanged; both flags are false, and final GM values match the recovered B42 state and a fresh top-level localStorage check. Only the four fixture routes were removed; the base page has no menu/styles/highlights/processed markers. Corrected export SHA-256: `afe81a41461f467b9aa628919e907b6715a77dabd490d2aa2dec2760dfe42d49`. Both variants retain the same four synthetic dedup IDs and default settings. No profile or broader site-storage cleanup occurred.

Existing offline results remain A 53 passes / 121 expected failures and B 174 passes. No unchanged-source behavioral suite is relabeled as a new run. Native evidence received an independent read-only review; see the final review addendum in [native-review-2026-10-07.md](native-review-2026-10-07.md). No new production fix is authorized by these test results.
