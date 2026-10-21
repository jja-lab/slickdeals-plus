# Settings synchronization — stale tabs preserve unrelated edits

Actual SettingsModule instances reproduced sequential whole-object saves overwriting newer Gold Tier/Glitch/threshold choices in both directions. This establishes the defect, not the cause of earlier live settings drift.

The fix reconciles a deep loaded/saved baseline plus explicit local keys against the latest GM-first persisted state. It keeps object identity and dual storage writes. Menu opening refreshes remote fields without saving, preserving pending text; saves repopulate controls after reconciliation and request full processing when remote values are adopted. Free/Gold enabling records both keys. Clear writes only filter keys. Reset/import explicitly replace the full state. Same-field edits are last successful save wins. No continuous listener or new grant is introduced; exactly overlapping writes can still race.

Unreadable or syntactically/root-invalid primary storage blocks ordinary saves. Failed writes retain pending key intent and show an error; successful primary GM writes tolerate an unavailable backup. Defaults shown after initial read failure get a baseline so they are not misclassified as user edits on recovery. Failed reset/import retains full replacement intent across refresh/retry and does not claim success. Existing 600 ms text delay remains.

Decision: [settings synchronization](../decisions/2026-10-21-settings-synchronization.md), decided-in-flight pending JJ ratification.

## Verification

- Actual SettingsModule and MenuModule browser fixture tests/settings-sync.html:39 passed/0 failed. Uses two frame instances with simulated shared GM/local stores and deterministic text timers; no live settings touched by fixture.
- Exact pre-fix HEAD8b34ec9 baseline:19 passed/20 failed, including independent on-to-off stale-tab case.
- Existing browser suites: menu36/0, filter-edits31/0, link-handlers19/0. Total125 passing checks.
- Independent design review complete; implementation review caught initial read-failure baseline issue, fixed and regression-covered. Re-review found no remaining blocking issues.
- node --check and git diff --check pass. No push/release/version bump.
- Unreleased central and in-script summaries added for menu/F06/F05 and this fix under approved workflow.

## Native B verification completed

JJ authorized the hands-off window with “Yes, Mac is free”. Captured starting script/storage, installed the tested source in the existing B script, then reloaded the site and opened a second tab. With both menus open, Gold/Glitch changes in the first tab survived an unrelated sort save in the stale second tab. A keyboard-committed threshold of 51 also survived. Reopening the second menu adopted the restored starting values: Gold and Glitch enabled, threshold 10, default sorting.

The browser fill helper did not commit the numeric control on blur; keyboard input did. The initial uncommitted value is recorded separately in live evidence, not counted as a successful persisted edit.

Final native export confirms all saved preference fields exactly match the starting export. All prior seen-alert IDs remain; normal live processing added one ID (20184171). Script is enabled. Exported source differs only by eight trimmed trailing spaces on comment lines 21, 93, 96, 99, 103, 108, 112, 116; all 2313 lines otherwise match. Tampermonkey export preference restored; second test tab closed; Mac released to JJ.

Evidence in hub `.astra/preparations/20261021-slickdeals-browser/`: `sync-live-results.json`, `sync-export-verification.json`, `sync-restored.png`, and before/after native exports `slickdeals-b-before-sync.txt` / `slickdeals-b-sync-20261021.txt`.

Source SHA-256: `b1794598752b039f8a7fccb71d880e98d042d158443b7744d2a2ed839f1dc508`. Installed SHA-256: `6021a41d9a2b7b2633542453201c73441db027a7c45057fc09fc7ba19fba6d5f`.

## Review-discovered repair — 2026-10-21

The earlier 125 passing checks missed partial numeric editing across debounce. Claude requested the native check: on e244c5f, `12.` then a pause then `99` became `9912`; `-` then a pause then `5` became `5`. Both fields were restored. This finding qualified the earlier completion claim; original evidence above is retained.

JJ authorized skipping the active element before value/checked assignments, repopulating after text saves only when remote values changed, clearer corrupt-primary wording, and no automatic backup recovery. The repair also distinguishes read/prepare/write failures and retains retry wording only for write-stage failures. tests/README.md documents serving, baseline generation and historical counts.

Independent repair review found no blocking issue; suggested explicit focus setup checks were incorporated. Expanded settings fixture uses actual property setters to catch equal-value assignments and covers number/checkbox focus on saves and refresh, conditional repopulation, malformed roots/JSON, read errors, and write-error wording. Exact e244c5f negative control:42 passed/11 failed. Repaired:53/0. Other suites before/after: menu36/0→36/0, filters31/0→31/0, links19/0→19/0. Original8b34ec9 against expanded fixture:24/29. Total repaired139/0. Missing toasts in the older baseline are assertions that fail, not fixture crashes.

Native repaired install, Q2 checks and final export verification pending at this checkpoint; no new completion claim until appended below. Decision repair note remains in flight; original decision ratification pending.

## Native repair verification completed — 2026-10-21

JJ approved the hands-off window (answer “1”). Captured fresh before-export, updated the same enabled B script through native Tampermonkey Modify confirmation, reloaded, then performed keyboard sequences with pauses exceeding 600 ms. `12.` + pause + `99` yielded `12.99`; `-` retained badInput=true through the pause and adding5 yielded `-5`. Both fields cleared and verified empty after reload. No live storage corruption was introduced; read/write failure wording was tested with the browser fixture's simulated stores.

Final export source matches all2323 lines except eight trailing spaces trimmed from comment lines21,94,97,100,104,109,113,117. All script storage data (including master preferences and seen-alert history) exactly equals the fresh pre-repair export. Export preference restored; Mac released. Evidence: repair-native-results.json, repair-native-typing.png, repair-install-verification.json, slickdeals-b-before-repair.txt, slickdeals-b-repair-20261021.txt in hub preparation evidence directory. Independent final review found no blockers; historical fixture reproduction clarification incorporated into tests/README.md. Fixture server stopped, test tab closed, no active reviewers. No push, merge, release or version bump.

Source SHA-256 `e8c0ac6e3947a72f115c972ea73c0e465ae45da9eecf6de699a6ed56aa2a96c8`; installed SHA-256 `72e5d07dafaf24f3790c1f9c05efe5d5a93e1fa89801b1b30811dd69a5e082c4`.
