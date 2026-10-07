# Independent native evidence review — 2026-10-07

Verdict: the retained evidence supports completion of the approved focused native checkpoint. No required correction remains. Protocol N01 remains in flight for JJ review; JJ accepted N03's narrower import coverage. This review does not authorize release or additional fixes.

## Review performed

Native reviewer `native_test_scout` independently read the retained source/input/result records and the final report and machine summary. It made no browser calls, file changes, credential/profile reads or recursive delegations. This was an evidence review, not an independent second browser execution. The coordinator inspected the findings, ran assertions against the retained JSON, verified exact source bytes and final exports, and incorporated limitations.

- Corrected A/B detector inputs exactly match `cases.json`, including `$$0.01`. A has 66 passes/66 expected baseline failures; B has 132/132 passes; both built-in suites pass 8/8. The earlier corrupted A expansion is excluded.
- Toggle clears all four highlights in both. Reset and other-setting reprocessing leave four in A and clear four in B through three repeats. Cancellation preserves settings/local snapshots. Dedup observations and no-new-alert-toast assertions support the stated bounded claims.
- B00/09/20 preserve live settings, all seven observed local entries and raw GM master; each records one error toast and no stylesheet refresh. A00/01 reproduce acceptance and mutation of invalid roots.
- B39/40 produce exact expected settings in the live object and GM/local stores and persist across actual reloads. B39 also verifies native import-disable cleanup, including two no-data cards.
- The first B42 read stalled. A later read recovered the original surviving harness/observer: exact two-warning toast, one stylesheet refresh, expected defaults and unchanged dedup. The final assessment is based on recovered machine evidence as well as JJ's report, not on inferred transient behavior.
- Both final exports independently decode to the pinned A/B source hashes and show both manager/script flags false. B's final GM master/dedup also match a fresh top-level localStorage observation. Both actual close-out page probes show no script artifacts. A's later attempted recheck landed on a consent page and is explicitly excluded; its earlier valid close-out evidence remains authoritative.
- Final report counts, retained input hashes, asymmetric coverage and controlled-fixture limitations match the evidence. Working B source remains unchanged.

## Qualifications preserved

Intermediate GM dedup checks establish native membership; raw GM equality comes from final exports. Private event counts are unavailable, so UI/style consequences are reported. The other-setting transition seeds the exposed settings object before using the actual handler. Live-site compatibility/performance and the omitted native import categories are not certified. The initial corrected A/B pure runs differ in absent-versus-empty dedup representation, as the report discloses.

An earlier review identified accidental N01 wording suggesting a dashboard workaround. The coordinator appended an explicit correction preserving the original history and the governing prohibition: no permission workaround is authorized or performed. The explicit file-upload denial was respected throughout.

Final reviewed deliverables: [native report](native-browser-2026-10-07.md), [machine summary](native-results-2026-10-07.json), and evidence under the report's retained run directory. Final local commit/status checks are recorded in the run handoff after committing these documentation files.
