# Proposed controlled A/B protocol

Status: preparation only. No improved B commit or live experiment exists. JJ must authorize the fix scope and later browser experiment separately. Do not install extensions, change the everyday browser profile, or run these live steps under the audit grant.

## Identify and preserve the variants

A is the exact feature baseline, not main or a release download:

```text
commit: 2d368f8e003aa6d9e7c28c8f4ef82f1fabcba8ac
file: slickdeals-plus-v33.0.0.js
SHA-256: bd090250026addeb1e4eac018129a4f8bd60673b12daee8163eb5281654877fb
```

At the future comparison checkpoint, extract A from Git into a separate experiment artifact directory (choose a new directory, never overwrite a previous experiment):

```sh
mkdir /tmp/sdplus-comparison-CHOOSE-UNIQUE-ID &&
git show 2d368f8e003aa6d9e7c28c8f4ef82f1fabcba8ac:slickdeals-plus-v33.0.0.js > /tmp/sdplus-comparison-CHOOSE-UNIQUE-ID/A.user.js
shasum -a 256 /tmp/sdplus-comparison-CHOOSE-UNIQUE-ID/A.user.js
```

The basename `.user.js` is only an installation artifact; bytes must remain exact. Do not use `release.sh` or `/releases/latest/` to obtain A.

B must be a future reviewed, locally committed improvement on this feature lineage. Before any run record its full commit, source filename, SHA-256, approved finding IDs, and diff against A. Keep its installation bytes identical to that committed file. Never identify variants only by `@version`: this audit changes no version and two future experimental variants may share metadata. Freeze the harness/fixture/settings versions as well. If the source shape changes, review module extraction bridges; do not remove A's hash guard merely to run B.

## Deterministic comparison first

1. Keep the audit probe command unchanged as evidence for A. It intentionally reports XFAILs and is pinned to A's hash; it is not a ready-made B acceptance suite.
2. In the authorized fix phase, add a comparison/regression runner with explicit A and B paths/hashes. Review extraction differences. Feed both the same labeled card/API fixtures, settings JSON, starting GM and localStorage snapshots, time schedule and DOM operations. Each case starts from a fresh store unless testing persistence.
3. Convert only approved fixed findings into B pass requirements. Keep unresolved findings explicitly labeled for both variants. Positive controls and default-off equivalence must continue passing. Never count the audit harness's successful characterization exit as “all behavior correct.”
4. Capture result rows with variant hash, case ID, input hash, expected outcome, actual outcome, status, error and runtime. Store raw observations and assertions. Preserve failed cases; investigate every unexpected failure and unexpected pass.
5. Only proceed to the approved live smoke stage after syntax, meaningful regressions, diff review and independent review pass. If a case lacks agreed expected behavior, mark it undecided and obtain that product judgment before counting accuracy.

## Required case matrix

| Surface | Identical inputs/actions for A and B | Observable comparison |
| --- | --- | --- |
| Default-off regression | All baseline defaults, then representative existing filter/sort settings; alerts remain off | Equal hidden IDs, highlight classes, price badges, ordering and link behavior; no alert store writes or alert toasts |
| Numeric/text alert boundaries | `$0.01`, bare `0.01`, `$10.01`, `$100.01`, `0.010`, punctuation and embedded version/model text; ordinary/glitch titles | Labeled expected alerts and reasons; retain ordinary text semantics unless separately approved |
| Price/score boundaries | 39.99/40/69.99/70% discount; ratio just below/at/above 0.1; original 100/>100, current 15/>15; votes 199/200/499/500; all sensitivities; absent sale/list price; promoted/no-data | Alert, tier, manual-review, score and reasons; preserve existing combinations unless approved tuning |
| Malformed imports | Root null/scalar/array/invalid JSON; bad tier shapes; null/number/empty/whitespace terms; valid custom terms and intentionally empty arrays | Warnings/rejection, no unintended settings/storage mutation, detector does not throw, valid configuration retained |
| State transitions | Off→on→off, reset while on, import false/true, repeated reprocess, wrapped and wrapper-less cards, pending text edit then clear/reset/import | Highlight cleanup, toggle persistence, one processing effect per action; stale timers do not undo later action |
| Reload dedup and cap | Fresh store, repeated same ID, reload with identical store, number/string ID, 500→501 IDs, burst >6 alerts | Toast requests/displayed counts separately; retained/evicted IDs and both-store equality; label current cap policy |
| API/fallback | Three envelope shapes; complete/partial/malformed record; no match; rejected/non-OK/invalid JSON; indefinitely pending response/body; late success | DOM correctness, initialization readiness, bounded wait if approved, no unexpected alert flood; valid zero preservation |
| Filters/highlighting | Price inclusive edges, free/nonfree, gold thresholds, promotions, include OR and exclude interaction; missing title/price | Hidden ID set, class and inline/CSS display agreement; record undecided missing-data policy separately |
| Sorting | Two feeds, default/rating/discount, ties, hidden entries, nondeal LI and wrapper-less cards | Per-feed order and restoration, no accidental cross-feed moves; wrapper-less sorting support is not assumed |
| Links | Reprocess repeatedly, bypass off/on, changed destination, percent-escaped nested URL, invalid schemes | One open request per click, correct destination, opener/referrer flags; actual visible tabs recorded separately |
| Dynamic cards/observers | Insert before/during/after batch, both feeds, later feed/navbar, replaced/rehydrated card, repeated deliveries | Every eligible card processed once; pending additions recovered; observer callbacks return to idle after own writes |
| Insertion safety | Titles/reasons containing `<img>`/quotes, invalid color import, active URL schemes | Literal rendered text, sanitized CSS, rejected unsafe schemes; no executed markup |
| Performance | Fixed 100/500-card fixtures, same inserts/settings and storage sizes | Comparable repeated timings, process/observer counts, store reads/writes and peak outstanding handlers; no correctness tradeoff |

## Later manual browser setup and smoke test

Use two dedicated disposable browser profiles A and B with the same browser and userscript-manager versions/configuration. Creation/extension setup requires the later grant. Do not clone JJ's everyday profile or import personal cookies/storage. Start both with identical test login state (prefer logged out unless a case requires otherwise), viewport, settings and seed stores. Browser profiles isolate origin localStorage and manager storage; separate script entries in one profile do not isolate localStorage.

Before opening a matched Slickdeals URL, disable manager auto-update checks **in both test profiles** and verify the effective setting. Keep the canonical scripts unchanged; do not strip their metadata to simulate A. If the installed manager cannot reliably prevent updating, stop and revise the setup at the checkpoint. Record installed source hash before and after each trial, not just displayed version. No sync/import service should overwrite a profile's settings mid-run.

Install the local exact A artifact in profile A and reviewed B artifact in profile B using the installed manager's local import/editor workflow. Inspect source after install. Keep only one variant active at any moment across the experiment: disable A before enabling B, and reverse for paired order. Do not activate both in the same page/profile. Open fresh test tabs after switching. Confirm there is one menu/style set and one active script entry.

Seed/export GM `sdPlus_settings_master`, GM `sdPlus_seen_alerts`, origin-local counterparts, `sdPlus_debug`, and any legacy `sdPlus_settings_v32/v31/v30/v28` keys consistently using only the disposable profiles. Missing keys must also match. A settings export alone does not capture dedup or legacy storage. Save original experiment seeds before every destructive reset/import test; never clear everyday storage.

Run deterministic saved fixtures in a suitable authorized browser harness first, then live-site smoke checks at identical URLs/settings. Record screenshots, hidden IDs/classes, menu transitions, toasts requested versus displayed, reload persistence, actual clicks, API availability/errors, dynamic card recovery and console exceptions. Test wrapped and wrapper-less examples and both feed sections. Exercise default-off before enabling alerts. Use benign link targets; do not purchase or interact with deal/account actions.

Live pages vary with time, personalization, inventory, ads and experiments. Alternate paired order A→B then B→A and record timestamps/card IDs/API inputs. If inputs differ, report that pair as an observational smoke check, not a controlled accuracy comparison. Later-captured sanitized DOM/API fixtures can support deterministic replay; avoid retaining personal tokens, ad identifiers or account data. Historical recon is not evidence of today's DOM compatibility.

## Accuracy and performance reporting

For alert quality use only explicitly labeled cases. Report each false positive/negative by case ID and agreed label, with numerator and denominator for that synthetic set. Cases labeled undecided do not enter those counts. Do not infer real-world precision/recall from selected fixtures. Keep scoring usefulness separate from implementation correctness.

For performance, choose and document warm-up count, at least 10 measured repetitions per fixed fixture/variant, alternating order and the same hardware/runtime. Report raw measurements, median and range (or percentiles), process counts, observer callbacks and storage operations. Distinguish scheduled batch waits from CPU work. Add browser measurements if the claim concerns browser performance; Node mocks cannot establish layout cost, native observer scheduling or popup timing. Live timings need repeated matched observations and explicit page/network variability; do not claim a speedup from one load or from fewer processed cards caused by a bug.

## Rollback and stop criteria

Stop on unexpected storage changes, default-off regressions, repeated open requests, observer runaway, hash/update drift, or unexplained exceptions. Retain failing evidence. Disable B and close its test tabs. In the disposable A profile, verify/reinstall the saved exact A file if needed, restore the saved experiment seed stores, and enable A alone. Verify its hash and expected baseline controls. To end testing, disable both variants and retain the artifacts/profiles until JJ chooses cleanup. No source branch reset, merge, everyday-profile restore or worktree deletion is required.

Before dependent work, JJ reviews: first fix batch F01–F04 and semantic choices; whether F05/F06 join a later batch; B's reviewed commit/hash and acceptance cases; browser/manager/profile setup and update-control method; explicit live-test authorization. Publishing and merging remain separate decisions.
