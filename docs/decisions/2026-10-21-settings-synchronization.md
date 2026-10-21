# Settings synchronization — preserve unrelated remote edits

Status: decided-in-flight, 2026-10-21. JJ explicitly authorized the Gold Tier/Glitch settings synchronization fix using the same workflow. F05/F06 decisions remain accepted.

Choice: use a deep loaded/saved baseline and explicit edited keys to merge local edits into freshly read persisted settings at save time. Preserve object identity, existing GM-first storage precedence and dual writes. A successful primary write advances the baseline; unreadable/malformed primary storage aborts the ordinary save rather than overwriting with stale fallback data. An absent primary may use localStorage; explicit reset/import can replace corrupt settings.

Semantics: same-field conflicts are last successful save wins. Explicit dirty keys include edits back to the original value; enabling Free/Gold writes both mutually exclusive keys. Clear replaces only its seven filter keys. Confirmed reset and validated import replace the full state. Pending text survives menu refresh and is included in an unrelated local save. Opening the menu refreshes remote values without saving; reconciliation emits all-settings processing when needed.

Rationale: a stale page's full-object writes were independently reproduced overwriting newer Gold/Glitch/threshold choices in both directions. Field-level reconciliation addresses that demonstrated loss without new permissions, storage format, or continuous polling. It does not establish the historical live drift's cause.

Runner-up: continuous GM listeners plus dirty tracking, but this requires new grants and more lifecycle coordination and still cannot make read/modify/write atomic. A blind last-whole-object-write approach retains the defect. Server/transaction-based coordination is disproportionate to this bounded fix.

Limits: idle pages may display stale state until menu opening, save or reload. Exactly overlapping writes can still race because storage has no compare-and-set. Existing 600 ms persistence delay remains; immediate reload can lose unsaved text. Primary-write failure is logged and pending field intent retained; no automatic retry loop. Reset/import failure does not constitute successful persistence.

Reversal: revert this focused commit; existing storage format needs no migration. Cost is restoring the stale-tab overwrite. Review checkpoint: actual SettingsModule/MenuModule shared-storage regressions including failures and explicit bulk semantics, prior regression suites, independent review, native B installed-source/settings verification and bounded two-tab smoke before local commit. Human ratification pending.

## Repair checkpoint — 2026-10-21 (in flight)

JJ explicitly authorized the focused-field guard, conditional text-save repopulation, unreadable-primary recovery wording, no automatic fallback, regression/native verification, documentation, independent review and local commit only. This adds to the original record; it does not retroactively ratify it.

Implementation choice: classify save failures by read/prepare/write phase. Read/parse/root failures say “Saved settings are unreadable. Use Reset All or Import to recover.” Write-stage failures retain “Please retry”; preparation failures receive recovery guidance without retry. We cannot determine whether a write failure is transient from the storage exception alone; retry is a write-stage action, not a guarantee it will recover. No automatic backup promotion or automatic retry loop.

Focused controls retain their DOM editing state until a later population while unfocused; other controls still refresh normally. This follows JJ's exact activeElement constraint. The setter-count fixture tests actual assignments (including equal values), with explicit focus setup checks; native partial-number sequences remain the acceptance check for browser transient text.

Alternative: silently use localStorage after primary corruption was rejected by JJ's explicit no-fallback scope and the risk of promoting stale backup values. Full input buffering/caret reconstruction is unnecessary for the bounded focus guard. Revert the repair commit to undo these changes, at the cost of returning the partial-input bug and misleading corruption wording; no migration/dependency change. Ratification checkpoint: review the repair results and the original synchronization semantics together. N01/T3 remain separate unresolved matters.

## Deferred follow-up — confirmed backup recovery (JJ deferred, 2026-10-21)

JJ explicitly deferred this follow-up; tracked in the orchestrator backlog as T2-393. It is not implemented by this documentation change, and this deferral does not ratify the earlier in-flight decisions.

When the primary GM settings are unreadable, offer once per page, at the first failed ordinary save (never at page load, never automatically):

> Saved settings are unreadable. Restore the backup copy? It may be older than your last change.

Accepting replaces the full state from the localStorage backup; declining keeps the Reset All/Import guidance. No automatic recovery is authorized.

Not built now because the script never writes unreadable data itself (only an outside writer can), Reset All/Import already recover, and stored settings carry no saved-at time. The prompt therefore cannot say how old the backup is without a storage-format change. This records JJ's stated deferral rationale and future interaction scope; implementation and verification remain a later task.

## JJ acceptance — 2026-10-21

Status: accepted for the original synchronization choices, repair, and recovery deferral specified below. Provenance: JJ's explicit in-session ratification, quoted verbatim:

> I ratify the settings-synchronization decisions (docs/decisions/2026-10-21-settings-synchronization.md), covering:
> - the original choices at e244c5f: merge explicitly edited fields into the latest GM-first stored state at save time; refresh on menu opening without saving; Clear replaces only its seven filter keys while confirmed Reset and validated Import replace the full state; same-field conflicts are last successful save wins; unreadable or malformed primary storage blocks ordinary saves, with no automatic backup fallback;
> - the repair at 63feba2: save-failure wording classified by read/prepare/write phase, and the focused-control guard plus conditional text-save repopulation;
> - the confirmed-backup-recovery deferral recorded at 2131e9a (tracked as T2-393).
>
> N01 stays in flight; T3 live tuning stays a release gate, not part of this ratification.
>
> Append a dated acceptance section quoting this, preserving the original record, commit it locally, and do not push. Then close out the session.

The original decision and repair/deferral history above are preserved. This acceptance authorizes no push, merge, publication, or implementation of T2-393. N01 remains in flight; T3 remains an outstanding release gate.
