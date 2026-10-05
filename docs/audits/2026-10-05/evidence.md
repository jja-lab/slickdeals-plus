# Evidence and reproducibility

Run from repository root with installed Node (audit machine: `v26.8.2`) and Bash. No package install, network access, userscript manager, live browser or real storage is involved.

```sh
node --check slickdeals-plus-v33.0.0.js
node --check docs/audits/2026-10-05/probes.cjs
node docs/audits/2026-10-05/probes.cjs
node docs/audits/2026-10-05/probes.cjs --strict
bash -n release.sh
git diff --check
shasum -a 256 slickdeals-plus-v33.0.0.js
```

`probes.cjs` normal mode must exit 0 only after matching every pinned baseline observation and passing all controls. It prints `XFAIL` for desired behavior that A does not satisfy; these are **known baseline failures, not passes**. `--strict` must exit 1 while any XFAIL remains. Any changed baseline hash, extraction mismatch, assertion/fixture error, or changed observation also fails nonzero. An unexpected fix is not silently accepted: revise the evidence and expectations explicitly. The harness is pinned to A; do not point it at a future B by simply removing the hash check.

Expected final output: **8 control groups passed; 12 expected baseline failures; 0 unexpected failures**. Eleven XFAIL observations span F01–F09 because F02 and F04 have two observations; F10 adds the twelfth. The built-in eight fixtures are one control group. F11 is source-only. See [probe-output.txt](probe-output.txt) for captured output. The first harness development runs exposed two missing test-bridge bindings (`bridge`, then `log`), exited1, and were corrected in the harness only; those were not production defects.

The hash must remain `bd090250026addeb1e4eac018129a4f8bd60673b12daee8163eb5281654877fb`. Baseline commit is `2d368f8e003aa6d9e7c28c8f4ef82f1fabcba8ac`. File locations in [report.md](report.md) refer to that source.

## Harness boundaries

- Reads production source and SHA-pins it. Loads module definitions in a fresh VM per case, stopping before `init`. No production file edits or test hooks are written to the userscript.
- Exposes actual modules through an in-memory bridge. Exact source slices execute settings-change, input-debounce, import and feed-observer logic. Extraction anchors are checked. Reset/import highlight tests synthesize the source-equivalent settings assignment and execute the exact `all` event route; menu callback connections are established by source inspection, not native clicks. The F03 import snippet verifies assignment and toast; save/event effects are source-established because those services are no-op mocks in that case.
- GM and localStorage are independent Maps. All fetches are local stubs; `window.open` records arguments; no browser opens. Fake nodes implement only methods used by the case. Test timers are queued/drained deterministically; the processing helper itself is unmodified.
- Detector tests call actual production logic. The malformed-watchlist probe first verifies validator acceptance, then requires the specific `toLowerCase` throw; it does not treat arbitrary exceptions as expected failure.
- API hang checks pending completion and absence of scheduled application timeout; it is not a measured timeout contract. The fixture is explicitly released afterward. Initialization's await dependency is source-traced.
- Observer probe calls the actual callback with supplied mutation records. It checks lost additions and duplicate guards, not native DOM scheduling or all self-triggering behaviors.
- `window.open` call count is not a count of visible tabs. Synthetic partial API records and encoding cases establish behavior for those inputs, not current site prevalence.
- Default-off control checks representative card filtering/highlighting and zero alert writes/classes. It does not prove byte-for-byte behavioral equivalence to main, which is not the baseline.

## Verification record

Final checks and review disposition are recorded in [handoff.md](handoff.md) and [review.md](review.md). Before committing, inspect only intended audit artifacts and run `git diff --cached --check` too; `git diff --check` alone does not inspect untracked additions. Verify source checkout status/HEAD separately from the run worktree. No remote state was fetched or asserted.

Required live checks remain pending: native menu/import interactions, actual current selectors/API data, layout/visibility, popup handling, hydrated/replaced cards, realistic observer timing, browser storage permissions, manager auto-update isolation, and repeated performance trials. None is labeled passed by these offline probes.
