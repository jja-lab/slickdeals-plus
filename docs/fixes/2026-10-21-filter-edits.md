# F06 — Rapid filter edit persistence

A shared debounced callback previously kept only the last field/value pair. Typing into several filters within 600 ms lost earlier changes, and queued callbacks could undo clear/reset/import.

MenuModule now updates each field in memory immediately and debounces persistence of the combined settings. A module-owned timer survives menu reinsertion. Clear, confirmed reset and valid import cancel it; rejected/canceled actions retain it. A nontext change flushes pending fields and emits an all-settings event so filters are reprocessed.

Decision: [filter edit persistence](../decisions/2026-10-21-filter-edit-persistence.md), decided-in-flight pending JJ review. The existing 600 ms delay remains; reload before that delay is not guaranteed to save input.

## Verification

- `node --check slickdeals-plus-v33.0.0.js`: passed.
- `tests/filter-edits.html`: 31 passed, 0 failed in actual Chrome B; exact pre-fix HEAD 525f7f2 served as baseline: 15 passed, 16 failed. Deterministic clocks exercise actual MenuModule code; storage is stubbed. Covers four-field edits, same-field coalescing, reset/clear/import precedence, canceled/rejected actions, nontext changes, reinsertion, and exactly one saved final snapshot.
- Existing `tests/menu-state.html`: 36 passed, 0 failed.
- Independent f06_review: no actionable findings; suggested stronger save assertions, incorporated and rerun.
- Native B Tampermonkey editor saved the updated source. Live inputs minPrice=10, maxPrice=50, includeKeywords=camera, excludeKeywords=used were entered within 69 ms; all four appeared correctly after reload. Test fields then restored to empty.

Final verification completed after JJ provided a hands-off native-control window. Export `slickdeals-b-f06-20261021.txt` matches the tested source except exactly eight trailing spaces trimmed on comment-only lines (21, 85, 88, 91, 95, 100, 104, 108). Source SHA256: d85ea706ded6caedd56a045101ead37d30b7556a9b83e86d2b3ed7f220b897e9. Installed SHA256: 3a955d9c4f898be57c277871980d0346ca6bb5c07f7ebcdc887a0c36f17568e9. Authoritative exported GM settings have all four test fields empty, and a final native page reload displays all four empty. Export preference restored. Final evidence: f06-install-verification.json and f06-final-restored.png.

Gold Tier Only and Glitch Alerts remain on, highlightDiff is 10, and sensitivity is Medium, matching the live state observed during this task. These differ from the previous session checkpoint and were not changed by this task; origin is unknown. Seen-alert storage also changed since that checkpoint while alerts were enabled. No historical settings or seen-alert data were overwritten. Native access temporarily failed; verification completed after the user returned a hands-off window.

Raw local evidence is retained under hub `.astra/preparations/20261021-slickdeals-browser/`: f06-fixed-results.json, f06-baseline-results.json, f06-menu-results.json, f06-live-reload.json, f06-live-reload.png. No push or release.
