# Slickdeals+ baseline audit — 2026-10-05

Audit complete; production fixes and live A/B are proposed, not performed. No consequential in-flight design decisions or supersessions were needed. Harness and documentation choices are routine choices delegated by the Run Brief; recommendations below are not accepted product decisions.

## Baseline and authority

- A: commit `2d368f8e003aa6d9e7c28c8f4ef82f1fabcba8ac`, source branch `feature/glitch-alert`.
- File: `slickdeals-plus-v33.0.0.js` (2,192 lines).
- SHA-256: `bd090250026addeb1e4eac018129a4f8bd60673b12daee8163eb5281654877fb`.
- Audit branch: `astra/20261005-184105-slickdeals-audit-05fcc16a`.
- `main` at `f0451451b506edaed088851b38f04c5b42656613` is NOT A. Four subsequent commits add detector/storage, combination-rule correction, UI wiring, and hardening: `4a0b3c1`, `17bf320`, `232993b`, `2d368f8`.
- JJ authorized branching/auditing and preparing comparison; the launch brief explicitly limits this checkpoint to artifacts/tests and a verified local commit. JJ retired Loom. No Loom imports, external model calls, dependencies, browser/profile changes, production edits, release, push or merge occurred.
- Both source checkout and run worktree started clean at the exact baseline. No prior handoff/checkpoint or accepted target decision record was found. Applicable hub AGENTS and target CLAUDE conventions were read. No target AGENTS or optional hub project profile was found. Control records were read only.

All source locations below refer to this exact baseline. Reproduce with [probes.cjs](probes.cjs); see [evidence.md](evidence.md) for commands and limitations, [comparison-plan.md](comparison-plan.md) for the future experiment, and [review.md](review.md) for independent review.

## Scope and method

Read the entire active userscript, four feature changes, README, CLAUDE, CHANGELOG, TODO, DEBUG-GUIDE, relevant historical Nuxt recon excerpts, and `release.sh`. Historical version/module lists and claims of “zero regression risk” were checked against code, not accepted as current facts. The release helper's main/clean-tree/version guards were inspected, never invoked. Prior scoping findings were independently checked.

Read-only native scouts separately examined data/settings/detection and DOM/lifecycle/security. The coordinator inspected source and integrated a dependency-free Node VM harness. It loads the actual module definitions before initialization and executes selected exact event-handler snippets in memory. The script bytes remain unchanged. Synthetic cards and storage model bounded behaviors; this is neither a DOM implementation nor a browser integration suite.

Severity is user impact under the specified trigger, not an estimate of frequency: **medium** means a feature gives wrong results, loses settings, or stops processing until another action; **low** means a narrower usability/compatibility issue. No critical exploit or destructive operation was established. Confidence separates certainty about code behavior from unknown live incidence.

## Findings

### F01 — Numeric watch term matches ordinary dollar amounts

**Medium; reproduced; high confidence.** Defaults line 336, matching lines 1554–1561, decision lines 1711–1716.

Trigger: ordinary titles `ordinary item $10.01` or `$100.01`, with no other alert signals. Expected: the penny watch term should not identify those as a one-cent price. Observed: substring `0.01` hits Tier A; both alert regardless of sensitivity. This can create misleading highlights and persistent toast dedup entries.

Probe `F01` reports `[true,true]` against proposed desired `[false,false]`; `$0.01` is a positive control. Smallest proposed fix: numeric-token boundaries for numeric watch terms while preserving existing text matching. Regression coverage: bare `0.01`, `$0.01`, punctuation, `$10.01`, `$100.01`, `0.010`, and embedded model/version numbers. **JJ must settle exact numeric-token semantics**; no general word-boundary or score tuning is implied.

### F02 — Imported watchlist contents can break or flood alerts

**Medium; reproduced; high confidence.** Validator lines 353–375, matcher lines 1554–1561, array guard lines 1656–1662, swallowed detector error lines 1404–1406.

Trigger: import `{ "glitchKeywords": { "A": [null], "B": [], "C": [] } }` (also number `1`), then enable alerts. Expected: reject/normalize invalid terms and evaluate safely. Observed: validation accepts without warnings; matcher throws on `toLowerCase`, caught at processing call site and only debug logged. Ordinary priced cards lose alert evaluation. An empty-string term is also accepted and matches every nonempty title, producing a Tier-A flood.

Probes `F02` establish both exact failure shapes. Smallest proposed fix: validate tier arrays and each nonempty string at the settings boundary, plus defensive detector validation. Decide whether to drop invalid entries with warnings or reject the entire watchlist. Cover missing tiers, null/object/number elements, whitespace-only terms, empty arrays, and valid customized strings. Do not silently restore a deliberately empty valid watchlist.

### F03 — Invalid JSON root is reported as successful import and resets settings

**Medium; reproduced exact handler snippet; high confidence.** Validator lines 353–375; menu import lines 1012–1022.

Trigger: import syntactically valid JSON `null` while `minPrice` is `25`. Expected: invalid import leaves settings/storage unchanged and reports failure. Observed: validator returns `isValid:false` with defaults and no warnings; menu ignores `isValid`, reports “Settings imported”, assigns defaults, saves, emits `all`. Probe `F03` records `minPrice:''` and success message. The same branch covers scalar roots; arrays are wrongly accepted as generic objects and also merit explicit rejection.

Smallest proposed fix: enforce a plain settings-object root and honor invalid status before any assignment/save/event. Cover `null`, scalars, arrays, malformed JSON, valid partial imports, and preservation of settings and both stores on rejection. Existing unknown-key tolerance need not change.

### F04 — Reset/import disables alerts but leaves highlighted cards

**Medium; reproduced handler + real processing; high confidence.** Reset emits `all` at 970, import at 1022; cleanup lines 2076–2087; gated card path lines 1372–1407; unconditional alert CSS at 1151.

Trigger: enable alerts and highlight a card; Reset All or import settings with `glitchAlerts:false`. Expected: highlights disappear just as with the explicit off toggle. Observed: cleanup only handles key `glitchAlerts`; force processing skips the alert block when disabled, leaving the class and visible CSS. `F04` separately reproduces reset and import; explicit off passes.

Smallest proposed fix: cleanup for every settings transition that leaves alerts disabled, including `all`, while preserving default-off inactivity. Cover wrapped/wrapper-less cards, no-data cards, enable/off/reset/import, repeated reprocessing, and existing dedup entries. Resetting dedup is a separate product choice, not required to clear CSS.

### F05 — Forced processing adds multiple redirect handlers

**Medium; reproduced; high confidence in repeated open requests, browser popup result unverified.** Lines 1257–1277, force invalidation lines 1425–1429.

Trigger: process a tracking link, then change reprocessing settings twice. Expected: one enabled bypass click produces one open request. Observed: each forced pass clears the processed flag and registers a fresh closure; the WeakMap is never read to remove the old listener. Three passes produce three `window.open` calls from one click (`F05`). `stopPropagation` does not remove other handlers on that same link. Browsers may block some requests; multiple visible tabs are not a measured result.

Smallest proposed fix: use existing WeakMap to remove/replace listeners or install once per link with current destination lookup. Cover repeated force passes, on/off/on, changed link destination, one user click, and `noopener,noreferrer`. This also prevents handler growth over a long session; no speed claim was measured.

### F06 — A shared debounce loses rapid changes to different fields

**Medium; reproduced exact input/debounce snippet; high confidence.** Menu lines 925–943; utility lines 448–454.

Trigger: type min price `10`, then max price `50` within 600 ms. Expected: both values persist and filter together. Observed: the second input cancels the only timer, retaining only max price; the displayed min field can disagree with saved settings. `F06` records `['','50']` versus `['10','50']`.

Smallest proposed fix: debounce per setting, or update settings immediately and debounce a combined persistence/reprocess operation. Cover quick changes across all four text fields, same-field coalescing, reload, and pending input followed by reset/import/clear so old timers cannot undo the later action.

### F07 — An incomplete matching API record suppresses valid DOM data

**Medium under synthetic partial-record trigger; reproduced; live prevalence unknown.** Lines 1208–1224, hasData line 1237, price filter lines 1350–1356.

Trigger: API entry `{threadId:42}` matches a card rendering `$10`, `$100`, `50` votes. Expected proposed resilience contract: retain usable DOM fields if API fields are absent/invalid. Observed: current price becomes NaN, votes/discount become zero; without a match, DOM resolves 10/50/90%. Probe `F07` records wrapper data. Price bounds may fail open, highlights/sort change, and enabled detector may request manual review despite a valid displayed price.

Smallest proposed fix: validated field-level fallback, preserving valid API zero values and distinguishing absent/invalid discount from zero. Cover complete/partial/malformed API records, missing match, valid zeros, DOM missing fields and promotions. Endpoint schemas were not fetched; this is a demonstrated robustness gap, not evidence that current endpoints routinely omit these fields.

### F08 — Initial processing waits indefinitely for an unresolved API request

**Medium under stalled-request trigger; reproduced pending data load plus source-established initialization dependency; live incidence unknown.** Fetch lines 554–569; `Promise.all` line 573; startup lines 1913–1924.

Trigger: one of three requests never settles while the others finish. Expected: enhancement reaches DOM fallback after a bounded wait. Observed: no application timeout/abort exists; initial processing, feed observers, settings event handlers and debug interface wait behind `dealDataReady`. Styles and menu creation may already have run. `F08` drains simulated timers and finds unresolved load with no timeout; releasing the pending fixture completes it. This is a structural liveness observation, not a real elapsed-time or network benchmark. Rejected/non-OK requests do fall back successfully.

Smallest proposed fix: bounded API wait with abort/fallback; explicitly choose whether/how late enrichment reprocesses cards. Cover hung response and JSON body, partial success, HTTP/parse errors, late completion, usable menu and DOM fallback. Timeout and late-data policy need review before implementation.

### F09 — Feed observer discards site insertions while processing is locked

**Medium under interleaved insertion trigger; reproduced callback; high confidence, live frequency unknown.** Batches lines 457–484; lock lines 1418–1450; observer lines 1987–1993; recovery lines 1969–1982.

Trigger: a new card is inserted during an asynchronous processing pass, after startup recovery timers have expired. Expected: it is processed once after the pass. Observed: the callback returns without queuing it. Unlock alone does nothing; another scroll/settings action is needed. `F09` records zero calls under lock, one outside it, and no duplicate call for an already-marked node.

Smallest proposed fix: retain/deduplicate added unprocessed cards and drain after processing. Cover insertion during 15-card batch gaps, concurrent setting changes, repeated observer deliveries, feed sections and own-mutation quiescence. Preserve child-list-only observation and early processed markers; broad attribute observation is not recommended.

### F10 — Redirect extraction removes meaningful destination escaping

**Low; reproduced controlled URL; current site encoding contract unverified.** Lines 508–521.

Trigger: tracking `u2=encodeURIComponent('https://example.test/search?q=a%26b')`. Expected for a once-encoded parameter: destination keeps `%26` inside the query value. Observed: `URLSearchParams.get` decodes the outer layer; additional `decodeURIComponent` turns it into `...q=a&b`, changing query structure. Probe `F10` pins the actual strings.

Smallest proposed fix: preserve the extracted absolute URL's escaping; support another encoding layer only if the site contract requires it. Cover `%26`, `%23`, `%25`, nested URLs, malformed encoding, and active-scheme rejection. Capture representative tracking URLs in a later authorized browser session before selecting compatibility behavior.

### F11 — Navbar appearing after ten seconds gets no menu recovery

**Low; source-established only; high confidence in branch, occurrence unverified.** Lines 780–787, 835–843.

Trigger: navbar absent when `waitForElement` times out, then arrives. Expected: later insertion recovery as claimed in the comment. Observed source path: `createMenu` returns before constructing `navBarObserver`; that observer only handles menu removal from an already-found navbar. A page reload is a practical recovery.

Smallest proposed fix: bounded late-navbar recovery/rebind, with observer lifetime limits. Regression coverage needed: navbar before/after timeout, menu removal, whole-navbar replacement, and no duplicate menu/listeners. No full menu DOM fixture was built for this lower-priority finding.

## Other reviewed surfaces and limitations

- **Parsing/filtering/highlighting/sorting:** Controls cover comma/abbreviated signed votes, dollar parsing, wrapper-less free-only hiding, combined highlight, independent per-grid CSS ordering and default restoration. Price-less cards intentionally receive only promoted/free/gold handling before an early return; include/exclude behavior on such cards needs a product expectation before labeling it a bug. `parsePrice('$10 + free shipping') === 0` is an input-format risk, not a confirmed live rendering. Existing include/exclude substring semantics are optional product tuning.
- **API/cache:** Three envelope shapes and rejection fallback pass. Data is loaded once and card values are WeakMap-cached; already-marked hydrated/reused cards or new/replaced feeds can miss refresh/observer coverage. Browser fixtures are needed before assigning live impact. Selector compatibility is unverified as of audit date.
- **Storage:** Normal GM+localStorage dual writes and dedup reload/id normalization/FIFO cap 500 pass. GM read/write throws are caught around the whole operation, so a thrown GM access can skip the local fallback/backup; this source-established exceptional-path limitation was not promoted to a separate first-batch finding. Dedup evicts oldest IDs, so “once across reloads” lasts only while retained, not forever. Multi-tab read-modify-write races remain untested.
- **Notifications:** Toast queue cap is five waiting items plus the active item. Processing marks a deal seen before `ToastModule.show`; a burst beyond queue capacity can mark unseen notifications as deduped. Decide whether dedup means “evaluated” or “displayed” before altering that policy. Six-second alert duration and repeated synchronous store parse/write are practical load risks; no performance improvement or alert precision claim is made.
- **DOM safety:** Toast title/reasons use `textContent` (237); menu HTML is static (790–827); badge HTML interpolates a count (858); CSS colors are validated/sanitized (1142–1144). HTTP(S)-only destination checks and `noopener,noreferrer` are present. No confirmed HTML/script injection sink was identified. This is a bounded source review, not a penetration test.
- **Lifecycle/errors:** Child-list-only observation excludes owned class/style/dataset writes, and sorting uses CSS order instead of reparenting. No native observer timing/echo-loop test ran. Broad catch/debug-only logging can make failures hard to see. Console-cleaner debug desync and page/sandbox debug exposure remain historical compatibility concerns; no current manager claim is made.
- **Documentation/release:** README/CLAUDE still name 32.3.9, TODO 32.3.7; source is 33.0.0 with unreleased feature comments for 33.1.0. Some historical fixed/open claims differ from code. No version/release housekeeping was folded into this audit. Historical Loom references remain untouched. `release.sh publish` has network effects even before its dry-run exit; no release mode was called.

## Proposed next checkpoint

Recommend a small first B batch limited to **F01–F04**: numeric watch-term boundaries, complete watchlist/root import validation, and disabled-state highlight cleanup. Preserve thresholds, keyword vocabulary, dual storage, pipeline order and default-off behavior. F03 belongs with F02 because both use the same import boundary. Add meaningful regression tests before changing those production paths.

JJ should choose numeric matching semantics and reject-versus-normalize behavior for malformed watchlists, then authorize the exact first fix scope. Keep valid empty arrays supported. Separately prioritize F05 (duplicate link requests) and F06 (lost field edits); both are concrete default-path defects but need not enlarge the alert hardening batch. F07–F09 require a separate data/lifecycle design checkpoint; F10 needs encoding evidence; F11 needs a browser timing fixture.

B does not yet exist. The [comparison protocol](comparison-plan.md) separates deterministic fixtures from live smoke tests and requires a later explicit live-test grant. No claim of improved B behavior, current-site compatibility, real-world precision, or measured performance is supported by this audit alone.
