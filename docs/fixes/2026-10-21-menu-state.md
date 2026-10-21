# Preserve saved menu selections

The menu displayed Low with Medium stored because listener setup cloned the controls after population. Populate after listener setup so the final controls receive their saved values. This also preserves nondefault sorting on creation and observer-driven reinsertion. No storage or alert-processing behavior changes.

## Verification

Serve the repository root with `python3 -m http.server 8765 --bind 127.0.0.1`, then open `/tests/menu-state.html` in Chrome. The fixture extracts the actual MenuModule and uses isolated iframe DOMs and in-memory settings; it does not touch live site settings. Append `?baseline` to restore the old initialization order as a negative control.

- Fixed: 36 passed, 0 failed.
- Old order: 28 passed, 8 expected failures for medium/high sensitivity and nondefault sorting on initial creation/reinsertion.
- Checks cover alerts off, other control values, no initialization writes, and exactly one save/event for a setting change.
- Independent review: no blocking findings; negative-control transformation assertion added from review.
- `node --check slickdeals-plus-v33.0.0.js` and `git diff --check` pass.
- Native Slickdeals B installation: after save/reload, Medium displayed and alerts unchecked. Post-save export confirms all GM data unchanged.

Tampermonkey trimmed eight trailing spaces on comment-only lines when saving. Export comparison verified those are the only differences from the tested source. Source SHA256: `bc8d57ed92f16e9f0e8af9bdf4bdff284fd3f60c5a2ede1b3e0151939cf4029b`; installed SHA256: `c76a9ad699d7a345f34987d35ca23ef188f9432362d54e12ff895b2209af6e71`.

Evidence is retained in the Astra hub `.astra/preparations/20261021-slickdeals-browser/`: fixed/baseline result JSON, pre/post Tampermonkey exports, `menu-install-verification.json`, and `sensitivity-fixed.png`. The test-profile manager and patched script remain enabled with alerts off. No release or remote push.
