# Settings synchronization — preserve unrelated remote edits

Status: decided-in-flight, 2026-10-21. JJ explicitly authorized the Gold Tier/Glitch settings synchronization fix using the same workflow. F05/F06 decisions remain accepted.

Choice: use a deep loaded/saved baseline and explicit edited keys to merge local edits into freshly read persisted settings at save time. Preserve object identity, existing GM-first storage precedence and dual writes. A successful primary write advances the baseline; unreadable/malformed primary storage aborts the ordinary save rather than overwriting with stale fallback data. An absent primary may use localStorage; explicit reset/import can replace corrupt settings.

Semantics: same-field conflicts are last successful save wins. Explicit dirty keys include edits back to the original value; enabling Free/Gold writes both mutually exclusive keys. Clear replaces only its seven filter keys. Confirmed reset and validated import replace the full state. Pending text survives menu refresh and is included in an unrelated local save. Opening the menu refreshes remote values without saving; reconciliation emits all-settings processing when needed.

Rationale: a stale page's full-object writes were independently reproduced overwriting newer Gold/Glitch/threshold choices in both directions. Field-level reconciliation addresses that demonstrated loss without new permissions, storage format, or continuous polling. It does not establish the historical live drift's cause.

Runner-up: continuous GM listeners plus dirty tracking, but this requires new grants and more lifecycle coordination and still cannot make read/modify/write atomic. A blind last-whole-object-write approach retains the defect. Server/transaction-based coordination is disproportionate to this bounded fix.

Limits: idle pages may display stale state until menu opening, save or reload. Exactly overlapping writes can still race because storage has no compare-and-set. Existing 600 ms persistence delay remains; immediate reload can lose unsaved text. Primary-write failure is logged and pending field intent retained; no automatic retry loop. Reset/import failure does not constitute successful persistence.

Reversal: revert this focused commit; existing storage format needs no migration. Cost is restoring the stale-tab overwrite. Review checkpoint: actual SettingsModule/MenuModule shared-storage regressions including failures and explicit bulk semantics, prior regression suites, independent review, native B installed-source/settings verification and bounded two-tab smoke before local commit. Human ratification pending.
