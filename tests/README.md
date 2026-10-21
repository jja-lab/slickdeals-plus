# Browser regression fixtures

Run these in Chrome. Fixtures extract actual modules from the userscript and use isolated DOM/storage stubs; they do not modify live Slickdeals settings. They are not substitutes for native Tampermonkey install/export and editing checks. Results appear as JSON in `#results`; `failed: 0` is required for the fixed source. A top-level `error` is a failed run, not a count.

## Serve and run

From anywhere inside your repository checkout:

```sh
WT="$(git rev-parse --show-toplevel)"
cd "$WT"
python3 -m http.server 8765 --bind 127.0.0.1
```

Open `http://127.0.0.1:8765/tests/menu-state.html` (or another fixture name). Stop the server with Ctrl-C before starting a different server on that port.

Historical serving directories:

| Suite | Directory | Fixed pass/fail | Original negative control pass/fail |
|---|---|---|---|
| menu-state.html | worktree root | 36/0 | 28/8 |
| filter-edits.html | /private/tmp/slickdeals-f06-check | 31/0 | 15/16 |
| link-handlers.html | /private/tmp/slickdeals-f05-check | 19/0 | 8/11 |
| settings-sync.html (original 39 assertions) | /private/tmp/slickdeals-sync-check | 39/0 | 19/20 |
| settings-sync.html (expanded repair, 53 assertions) | /private/tmp/slickdeals-sync-repair-check | 53/0 | 24/29 against 8b34ec9; 42/11 against e244c5f |

All use the same server command above, with the listed directory as cwd. Temporary files are not committed or guaranteed to survive cleanup. Existing temporary fixed-source snapshots are historical; refresh copies before testing new code.

## Recreate isolated directories and baselines

Run from a shell with WT set as above. These commands create disposable test copies only:

```sh
for suite in f06 f05 sync sync-repair; do
  mkdir -p "/private/tmp/slickdeals-$suite-check/tests"
  cp "$WT"/tests/*.html "/private/tmp/slickdeals-$suite-check/tests/"
  cp "$WT/slickdeals-plus-v33.0.0.js" "/private/tmp/slickdeals-$suite-check/"
done
git -C "$WT" show 525f7f2:slickdeals-plus-v33.0.0.js > /private/tmp/slickdeals-f06-check/baseline.js
git -C "$WT" show fa81d30:slickdeals-plus-v33.0.0.js > /private/tmp/slickdeals-f05-check/baseline.js
git -C "$WT" show 8b34ec9:slickdeals-plus-v33.0.0.js > /private/tmp/slickdeals-sync-check/baseline.js
git -C "$WT" show 8b34ec9:slickdeals-plus-v33.0.0.js > /private/tmp/slickdeals-sync-repair-check/baseline.js
git -C "$WT" show e244c5f:slickdeals-plus-v33.0.0.js > /private/tmp/slickdeals-sync-repair-check/repair-baseline.js
cd /private/tmp/slickdeals-sync-repair-check
python3 -m http.server 8765 --bind 127.0.0.1
```

The copy loop uses the current expanded settings fixture in every directory. Therefore `/private/tmp/slickdeals-sync-check` also produces 53/0 versus 24/29 after this copy. To reproduce the **historical 39-assertion fixture** there, replace only that disposable fixture:

```sh
git -C "$WT" show e244c5f:tests/settings-sync.html > /private/tmp/slickdeals-sync-check/tests/settings-sync.html
```

Use `?baseline` on each suite URL for its original negative control. The menu suite does not need baseline.js: its baseline mode reverses the initialization-order fix in the extracted module. Settings-sync also supports `?repairBaseline` to use exact e244c5f. Do not use one suite's baseline.js for another suite.

For the unchanged menu/filter/link suites against exact e244c5f, copy `repair-baseline.js` over the **temporary** `slickdeals-plus-v33.0.0.js` and use normal URLs. Restore that temporary file from WT before testing the repair. Expected before/after counts: menu36/0→36/0; filters31/0→31/0; links19/0→19/0; expanded settings42/11→53/0.

## Retained evidence

The original evidence is an external, machine-local record, not a repository dependency or a required location for running these fixtures. Save new result JSON in a location of your choosing.

Historical location on the original test machine (reference only):
`/Users/jjatkinson/Documents/Projects/astra-orchestrator/.astra/preparations/20261021-slickdeals-browser/`

Original pairs: `menu-{fixed,baseline}-results.json`, `f06-{fixed,baseline}-results.json`, `f05-{fixed,baseline}-results.json`, `sync-{fixed,baseline}-results.json`. Latest pre-repair regressions: `sync-menu-state-results.json`, `sync-filter-edits-results.json`, `sync-link-handlers-results.json`.

Repair comparisons: `repair-{before,after}-{menu-state,filter-edits,link-handlers,settings-sync}.json`; original baseline with expanded assertions: `repair-original-baseline-settings-sync.json`. These local evidence exports are not Git-tracked. baseline.js files are generated, not committed; the Git revisions above are the durable sources.
