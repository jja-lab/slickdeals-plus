# Native default-off smoke — 2026-10-06

Status: approved sequential default-off smoke completed, with followups below. Both profiles finish with manager/script switches disabled and their observed Slickdeals pages unloaded. No production changes, release, push or merge.

## Scope and identities

JJ explicitly approved sequential default-off smoke in two disposable Chrome profiles, with only one script active at a time and both disabled afterward. Later approval added a separate B Playwright connection. This checkpoint covers initialization, menu/style uniqueness, default settings and alert inactivity, source preservation and both storage mechanisms. It does not exercise alert-enabled F01–F04 cases, filters/sort interactions, imports or reset transitions.

| Variant | Source commit | SHA-256 | Profile |
| --- | --- | --- | --- |
| A | 2d368f8e003aa6d9e7c28c8f4ef82f1fabcba8ac | bd090250026addeb1e4eac018129a4f8bd60673b12daee8163eb5281654877fb | test-profile / Profile 1 |
| B | 303387389d30269293a5b6c7b9385a1fcf6b7fbc | 63b5097d31bb0832bb187a82033fbee075e3fd4acb8f561d67f8c3a9fc6bcb83 | Slickdeals B / Profile 2 |

Both retain v33.0.0 metadata. Current documentation commits do not change the tested source identity. Chrome 154.0.8037.98 arm64 was user-reported; probes observe reduced UA Chrome/154.0.0.0. Screenshots establish Tampermonkey 5.5.1 in both. Manager exports and screenshots establish matching update controls: check interval Never, automatic installation off, sync off. Per-script check_for_updates remains true, subject to global update checks being off. Original metadata is unchanged.

## Observations

| Check | A | B |
| --- | --- | --- |
| Installed source before smoke | Exact hash verified | Exact hash verified |
| Initial GM storage | Empty | Empty |
| Initial seven script-owned localStorage keys | Absent, direct probe | Absent, user DevTools observation |
| One menu, button, dropdown and each style set | Observed | Observed, manual and direct probes |
| Alerts disabled; no current alert toast/highlight | Observed | Observed |
| Default saved settings; no local dedup or legacy keys | Verified | Verified |
| Processed / matching selector nodes at sample | 621 / 621 | 627 / 627 manual; 633 / 633 automated repeat |
| Post-smoke GM master matches local default JSON | Verified | Verified |
| Final source/options/settings preserved; both switches off | Verified export | Verified export |
| Final page unloaded | Verified | Verified after repeat |

B automated repeat was necessary after adding its browser connection to capture missing console evidence. Direct B samples at 21:39:59.071Z and 21:40:20.481Z pass the same menu, settings, alert and local-storage assertions. Opened menu and Glitch Alerts section only; no setting was changed. The earlier 21:20:08.332Z user-supplied B probe confirmed a visible menu after an earlier closed-menu sample lacked a layout box. Cause of that earlier observation was not established.

## Followups and limits

- Both variants display sensitivity Low while the live and persisted setting is Medium. A detached select-cloning experiment and the unchanged populate-then-clone source sequence explain this mismatch. No production fix was made under this smoke grant.
- A logged `reprocessUnprocessed max retries reached`. B's repeat logged Ready, 374 unique API deals from 394 rows, then processing 289 unprocessed deals, with no Slickdeals+ warning/error in the captured interval. This differing observation does not establish that B fixes the retry issue.
- B's disabled page already produced native site/ad console errors and warnings. Its active capture contained 16 errors and 8 warnings from site, advertising and resource sources. No clean-console claim. Site noise was also present during A's disabled/active runs.
- Live page contents differed between runs. Card counts are observations, not a controlled performance comparison, proof of complete dynamic processing, or population precision measurement.
- Probes sampled current toasts rather than continuously tracing startup. No observed alert activity and absent dedup support the bounded default-off result; they do not prove absence of every transient event.
- Chrome denied automation access to the Tampermonkey dashboard. JJ handled native switches and exports; agent verified webpage state and exported source/storage. No permission bypass was used.

Existing offline evidence is unchanged: A 53 passes / 121 expected failures, B 174 passes. No behavioral suite was rerun for unchanged code. Full native F01–F04 alert-enabled/real-import/reset cases remain a separate checkpoint, and F05–F11 remain outside the implementation grant.

## Evidence location

Retained under `/Users/jjatkinson/Documents/Projects/astra-orchestrator/.astra/runs/20261005-200544-slickdeals-fix1-49854f8c/agent/`: `artifacts/installed-exports/` and `artifacts/smoke-2026-10-06/`. Relevant evidence includes initial source/config verification, A probes/export/assertions, B manual probe provenance, direct B active/menu samples and redacted console captures. These local records are retained but gitignored; source identities above keep them interpretable.

## Final storage/source verification and next checkpoint

Post-smoke A export SHA-256: `8e982aada2103c9203174b77f578b61a09b7a1376b3d257f106907716956f474`.
Post-smoke B export SHA-256: `e9cc0b2303c7c11476e4a92e8bab9cf58685e57af827879dd20b28d7064580e7`.

Each final export contains one unchanged script, its original UUID/options and unchanged manager settings, with both manager and script enabled flags false. Both GM stores contain only the default master settings; the observed export string prefix `s` followed by JSON exactly matches the respective localStorage JSON. No GM or local dedup entry exists. Direct final-page probes show no script menu, styles, processed-node markers or debug interface. B final export was supplied as `slickdeals-B-export.txt` in the earlier temporary exports folder, then retained as `B-after-smoke-export.json`; `B-verification.json` records assertions. A equivalents are retained alongside it.

D01/D02 remain accepted; no new in-flight decision or supersession. Source and artifact hashes were rechecked against the pinned Git commits during this continuation. This documentation does not expand the previous F01–F04 implementation grant or certify full native behavior. Next JJ checkpoint: decide whether to authorize the controlled native F01–F04 sequence in [manual-checkpoint.md](manual-checkpoint.md). Keep both scripts disabled until that checkpoint. The sensitivity UI mismatch and A processing-retry warning remain separate followups, without an authorized repair in this session.
