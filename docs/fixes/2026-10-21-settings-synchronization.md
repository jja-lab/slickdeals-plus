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
