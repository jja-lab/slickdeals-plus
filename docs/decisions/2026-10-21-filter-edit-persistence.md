# F06 — Preserve rapid filter edits

Status: decided-in-flight, 2026-10-21. JJ authorized F06 in the existing worktree using the prior fix/test/review/native verification/local commit workflow. Human acceptance of this implementation choice is pending the completion checkpoint.

Question: debounce each field independently, or debounce persistence of the combined state?

Choice: update in-memory settings on each text/price input; retain one module-owned 600 ms timer to persist and reprocess the combined state. Bulk clear, confirmed reset and valid import cancel the timer. A non-text change saves pending text values along with its own value and emits all when necessary. Canceled reset and rejected import preserve pending edits. Menu reinsertion reads current values and retains the single timer.

Rationale: all four rapid field edits survive, one editing burst causes one save/reprocess, and replacement actions cannot be undone by a stale callback. Storage still uses the existing dual-write path. Numeric/string interpretation and filtering rules are unchanged.

Runner-up: per-field timers preserve delayed in-memory mutation, but cause multiple saves/reprocesses per burst and require a separate pending-value layer to survive menu repopulation. Rejected because it adds coordination without a user benefit here. Retaining the single last-value callback loses edits and is not acceptable.

Consequence: in-memory values (including export/debug or another processing event) can reflect input before the delayed save. Reloading within 600 ms can still lose unsaved input; immediate persistence/unload flushing is outside this fix. No alert enablement, score, storage format, dependency or API changes.

Reversal: revert this focused commit; no data migration needed. Cost is restoring old behavior, including the reproduced loss. Affected surfaces: MenuModule input/change/reset/clear/import handlers and browser regression fixture. Review checkpoint: independent review plus fixed/baseline browser checks and live B persistence/restoration before local commit.
