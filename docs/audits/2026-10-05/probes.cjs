'use strict';
// Baseline characterization only. No dependencies, network, browser, or real storage.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createHash } = require('node:crypto');
const scriptPath = path.resolve(__dirname, '../../../slickdeals-plus-v33.0.0.js');
const source = fs.readFileSync(scriptPath, 'utf8');
const hash = 'bd090250026addeb1e4eac018129a4f8bd60673b12daee8163eb5281654877fb';
assert.equal(createHash('sha256').update(source).digest('hex'), hash, 'Baseline changed: review/adapt probes explicitly');
assert.ok(process.argv.slice(2).every(arg => arg === '--strict'), 'Only --strict is supported');
function section(start, end) {
  const a = source.indexOf(start), b = source.indexOf(end, a + start.length);
  assert.ok(a >= 0 && b > a && source.indexOf(start, a + 1) === -1, 'Extraction anchors changed');
  return source.slice(a, b);
}
const definitions = source.slice(0, source.indexOf('    (async function init() {'));
assert.ok(definitions.length > 50000, 'Missing init boundary');
const settingsHandler = section("            context.eventBus.on('settingsChanged', ({ key }) => {", '            // Expose debug interface');
const observerFactory = section('            const attachFeedObserver = feed => {', '            // BUG FIX #7:');
const menuDebounce = section('                const debouncedSave = UtilsModule.debounce(', '                // Clear filters button');
const menuImport = section('                                    const parsed = JSON.parse(ev.target.result);', '                                    } catch {');
function classes() {
  const values = new Set();
  return { add: (...ks) => ks.forEach(k => values.add(k)), remove: (...ks) => ks.forEach(k => values.delete(k)),
    contains: k => values.has(k), toggle(k, enabled) { if (enabled) values.add(k); else values.delete(k); } };
}
function node() {
  return { dataset: {}, classList: classes(), style: { removeProperty(k) { delete this[k]; } } };
}
function runtime(shared = {}) {
  const gm = shared.gm || new Map(), local = shared.local || new Map();
  const timers = new Map(), logs = [], observers = [], opens = [];
  let timerId = 0;
  const document = { querySelectorAll: () => [], querySelector: () => null };
  const sandbox = { document, URL, console: Object.fromEntries(['log', 'warn', 'error'].map(k => [k, (...args) => logs.push([k, ...args])])),
    localStorage: { getItem: k => local.get(k) ?? null, setItem: (k, v) => local.set(k, v) },
    GM_getValue: k => gm.get(k), GM_setValue: (k, v) => gm.set(k, v),
    setTimeout: (fn, ms = 0) => { timers.set(++timerId, { fn, ms }); return timerId; }, clearTimeout: id => timers.delete(id),
    fetch: () => { throw new Error('Unconfigured offline fetch'); },
    window: { open: (...args) => opens.push(args) },
    MutationObserver: class { constructor(cb) { this.cb = cb; observers.push(this); } observe(target, options) { this.target = target; this.options = options; } disconnect() {} }
  };
  vm.createContext(sandbox);
  vm.runInContext(definitions + '\n globalThis.modules = { log, ConstantsModule, ValidationModule, UtilsModule, LinkResolutionModule, DataModule, SettingsModule, MenuModule, ProcessingModule, GlitchAlertModule, SortingModule, ToastModule };\n})();', sandbox, { timeout: 1000 });
  const m = sandbox.modules;
  const s = JSON.parse(JSON.stringify(m.ConstantsModule.DEFAULTS));
  let pos = 0;
  const context = { settings: { getSettings: () => s, saveSettings() {}, getOriginalPosCounter: () => pos++ }, data: { lookup() {} }, isProcessing: false,
    sorting: { applySorting() {} }, eventBus: { on(event, cb) { this.handler = cb; }, emit() {} } };
  context.processing = m.ProcessingModule(context);
  sandbox.context = context;
  // Evaluate exact production snippets inside the module scope through this bridge.
  sandbox.bridge = Object.assign({}, m, { context });
  const run = code => vm.runInContext('with (bridge) { ' + code + '\n}', sandbox, { timeout: 1000 });
  async function drain() {
    for (let n = 0; n < 200; n++) {
      await Promise.resolve();
      if (!timers.size) { await Promise.resolve(); if (!timers.size) return; }
      const [id, task] = timers.entries().next().value;
      timers.delete(id); task.fn();
    }
    throw new Error('Timer budget exceeded');
  }
  return { ...m, m, s, gm, local, context, document, sandbox, bridge: sandbox.bridge, timers, logs, observers, opens, run, drain };
}
function card(r, { id = '42', title = 'ordinary item', price = '$10', original = '$20', votes = '5', badge = '', wrapped = true, link = false } = {}) {
  const c = node(), wrapper = wrapped ? node() : c;
  c.dataset.threadid = id;
  const S = r.ConstantsModule.SELECTORS;
  const fields = { [S.dealTitle]: { textContent: title }, [S.dealPrice]: { textContent: price },
    [S.originalPrice]: { textContent: original }, [S.voteCount]: { textContent: votes },
    [S.dealBadge]: { textContent: badge }, [S.priceContainer]: node() };
  const handlers = new Set();
  const a = { href: 'https://slickdeals.net/click?u2=https%3A%2F%2Fexample.test%2Fdeal', dataset: {},
    addEventListener: (type, fn) => handlers.add(fn), removeEventListener: (type, fn) => handlers.delete(fn) };
  c.closest = selector => selector === 'li' ? (wrapped ? wrapper : null) : c;
  c.querySelector = selector => fields[selector] || null;
  c.querySelectorAll = selector => selector === 'a' && link ? [a] : [];
  c.matches = selector => selector === S.dealCard;
  c.nodeType = 1;
  r.document.querySelectorAll = selector => selector === S.dealCard ? [c] : selector === '.sdp-glitch-alert' && wrapper.classList.contains('sdp-glitch-alert') ? [wrapper] : [];
  return { c, wrapper, fields, a, handlers };
}
async function processCard(r, force = true) {
  const pending = r.context.processing.processAllCards(force);
  await r.drain(); await pending;
}
const deal = (patch = {}) => ({ titleText: 'ordinary item', currentPrice: 10, originalPrice: 20, percent: 50, votes: 0, isPromoted: false, hasData: true, ...patch });
let passed = 0, expectedFailures = 0;
async function check(label, fn) { await fn(); passed++; console.log('PASS', label); }
function issue(id, observation, baseline, desired) {
  assert.deepEqual(observation, baseline, `${id}: unexpected baseline outcome`);
  assert.notDeepEqual(observation, desired, `${id}: unexpectedly fixed; update audit explicitly`);
  expectedFailures++;
  console.log(`XFAIL ${id} observed=${JSON.stringify(observation)} desired=${JSON.stringify(desired)}`);
}
async function main() {
  console.log(`Baseline SHA-256 ${hash}; Node ${process.version}`);
  await check('built-in fixtures 8/8 in isolated stores', () => {
    const r = runtime(); const result = r.GlitchAlertModule.runSelfTest();
    assert.equal(result.passed, 8); assert.equal(result.failed, 0);
  });
  await check('detector exclusions, sensitivity-independent A/B combinations and 40% boundary', () => {
    const r = runtime(), evalDeal = (d, s = r.s) => r.GlitchAlertModule.evaluateDealAnomaly(d, undefined, s);
    for (const sensitivity of ['low', 'medium', 'high']) {
      const s = { ...r.s, glitchSensitivity: sensitivity };
      assert.equal(evalDeal(deal({ titleText: 'price glitch', percent: 0 }), s).alert, true);
      assert.equal(evalDeal(deal({ titleText: 'milwaukee drill', percent: 40 }), s).alert, true);
      assert.equal(evalDeal(deal({ titleText: 'milwaukee drill', percent: 39.99 }), s).alert, false);
    }
    assert.equal(evalDeal(deal({ titleText: 'glitch', isPromoted: true })).alert, false);
    assert.equal(evalDeal(deal({ hasData: false })).alert, false);
    assert.equal(evalDeal(deal({ currentPrice: NaN })).manualReview, true);
    assert.equal(evalDeal(deal({ originalPrice: NaN, percent: 0 })).manualReview, false);
    assert.equal(evalDeal(deal({ titleText: 'item $0.01', currentPrice: 0.01, percent: 0 })).alert, true);
  });
  {
    const r = runtime();
    const observed = ['$10.01', '$100.01'].map(p => r.GlitchAlertModule.evaluateDealAnomaly(deal({ titleText: 'ordinary item ' + p, currentPrice: Number(p.slice(1)), originalPrice: NaN, percent: 0 }), undefined, r.s).alert);
    issue('F01 numeric keyword boundaries', observed, [true, true], [false, false]);
  }
  {
    const r = runtime();
    const observed = [null, 1].map(term => {
      const v = r.ValidationModule.validateSettings({ glitchKeywords: { A: [term], B: [], C: [] } }, r.s);
      assert.equal(v.warnings.length, 0);
      assert.throws(() => r.GlitchAlertModule.evaluateDealAnomaly(deal(), undefined, v.settings), /toLowerCase/);
      return 'accepted then TypeError';
    });
    issue('F02 malformed watchlist elements', observed, ['accepted then TypeError', 'accepted then TypeError'], ['safely rejected or normalized', 'safely rejected or normalized']);
    const v = r.ValidationModule.validateSettings({ glitchKeywords: { A: [''], B: [], C: [] } }, r.s);
    issue('F02 empty keyword', r.GlitchAlertModule.evaluateDealAnomaly(deal({ percent: 0 }), undefined, v.settings).alert, true, false);
  }
  {
    const r = runtime(), messages = []; r.s.minPrice = '25';
    r.bridge.ToastModule = { show: msg => messages.push(msg) }; r.bridge.populateMenu = () => {};
    r.bridge.ev = { target: { result: 'null' } };
    r.run(menuImport);
    issue('F03 invalid root import', { minPrice: r.s.minPrice, message: messages[0] }, { minPrice: '', message: 'Settings imported' }, { minPrice: '25', message: 'Import failed' });
  }
  await check('default-off pipeline: no alert class or dedup writes; wrapper-less filter and highlighting', async () => {
    const r = runtime(), f = card(r, { title: 'price glitch', votes: '1.2k', wrapped: false });
    r.s.freeOnly = true;
    await processCard(r);
    assert.equal(f.wrapper.classList.contains('sd-plus-hide'), true);
    assert.equal(f.c.classList.contains('highlightBoth'), true);
    assert.equal(f.wrapper.classList.contains('sdp-glitch-alert'), false);
    assert.equal(r.gm.size, 0); assert.equal(r.local.size, 0);
  });
  for (const transition of ['glitchAlerts', 'reset-all', 'import-all']) {
    const r = runtime(), f = card(r, { title: 'price glitch' });
    r.ToastModule.show = () => {}; r.s.glitchAlerts = true;
    await processCard(r); assert.equal(f.wrapper.classList.contains('sdp-glitch-alert'), true);
    if (transition === 'reset-all') Object.assign(r.s, r.ConstantsModule.DEFAULTS);
    else if (transition === 'import-all') Object.assign(r.s, r.ValidationModule.validateSettings({ glitchAlerts: false }, r.ConstantsModule.DEFAULTS).settings);
    else r.s.glitchAlerts = false;
    r.run(settingsHandler); r.context.eventBus.handler({ key: transition === 'glitchAlerts' ? transition : 'all' }); await r.drain();
    if (transition === 'glitchAlerts') await check('explicit alert disable clears highlight', () => assert.equal(f.wrapper.classList.contains('sdp-glitch-alert'), false));
    else issue('F04 stale highlight ' + transition, f.wrapper.classList.contains('sdp-glitch-alert'), true, false);
  }
  {
    const r = runtime(), f = card(r, { link: true });
    for (let i = 0; i < 3; i++) await processCard(r);
    for (const fn of f.handlers) fn({ preventDefault() {}, stopPropagation() {} });
    issue('F05 repeated redirect handlers', r.opens.length, 3, 1);
    r.s.bypassRedirects = false;
    for (const fn of f.handlers) fn({ preventDefault() {}, stopPropagation() {} });
    assert.equal(r.opens.length, 3, 'Bypass-off must suppress every handler');
    assert.ok(r.opens.every(args => args[2] === 'noopener,noreferrer'));
  }
  {
    const r = runtime(); let input;
    r.bridge.newMenuBody = { addEventListener: (type, fn) => { assert.equal(type, 'input'); input = fn; } };
    r.run(menuDebounce);
    input({ target: { dataset: { setting: 'minPrice' }, value: '10' } });
    input({ target: { dataset: { setting: 'maxPrice' }, value: '50' } });
    await r.drain();
    issue('F06 shared debounce loses first field', [r.s.minPrice, r.s.maxPrice], ['', '50'], ['10', '50']);
  }
  await check('dedup reload, number/string normalization, idempotency and FIFO cap', () => {
    const r = runtime(); r.GlitchAlertModule.markAlerted(42); r.GlitchAlertModule.markAlerted('42');
    assert.equal(JSON.parse(r.gm.get('sdPlus_seen_alerts')).ids.length, 1);
    const reload = runtime(r); assert.equal(reload.GlitchAlertModule.hasAlerted(42), true);
    for (let i = 0; i < 501; i++) reload.GlitchAlertModule.markAlerted('case-' + i);
    const ids = JSON.parse(r.gm.get('sdPlus_seen_alerts')).ids;
    assert.equal(ids.length, 500); assert.equal(ids[0], 'case-1'); assert.equal(ids[499], 'case-500');
    assert.equal(reload.GlitchAlertModule.hasAlerted(42), false);
    assert.equal(r.gm.get('sdPlus_seen_alerts'), r.local.get('sdPlus_seen_alerts'));
  });
  await check('API envelopes, partial rejection and total rejection with DOM fallback', async () => {
    const r = runtime(); let calls = 0;
    r.sandbox.fetch = async () => ({ ok: true, json: async () => [ { deals: [{ threadId: 1 }] }, { jfyDeals: [{ threadId: 2 }] }, [{ threadId: 3 }]][calls++] });
    const api = r.DataModule(); await api.load(); assert.equal(api.count(), 3);
    calls = 0;
    r.sandbox.fetch = async () => { if (calls++ === 0) throw new Error('offline'); return { ok: true, json: async () => [{ threadId: 4 }] }; };
    const partial = r.DataModule(); await partial.load(); assert.equal(partial.count(), 1);
    r.sandbox.fetch = async () => { throw new Error('offline'); };
    const failed = r.DataModule(); await failed.load(); assert.equal(failed.count(), 0);
    r.context.data = failed; const f = card(r, { price: '$10', original: '$100', votes: '50' });
    await processCard(r); assert.equal(f.wrapper.dataset.sdpPrice, '10'); assert.equal(f.wrapper.dataset.sdpDiscount, '90');
  });
  {
    const r = runtime(), f = card(r, { price: '$10', original: '$100', votes: '50' });
    r.context.data.lookup = () => ({ threadId: 42 }); await processCard(r);
    issue('F07 partial API suppresses DOM fields', [f.wrapper.dataset.sdpPrice, f.wrapper.dataset.sdpRating, f.wrapper.dataset.sdpDiscount], ['NaN', '0', '0'], ['10', '50', '90']);
  }
  {
    const r = runtime(); let release, calls = 0, settled = false;
    r.sandbox.fetch = () => ++calls === 1 ? new Promise(resolve => { release = resolve; }) : Promise.resolve({ ok: false });
    const loading = r.DataModule().load().then(() => { settled = true; });
    await r.drain();
    issue('F08 API has no application timeout', { settled, timers: r.timers.size }, { settled: false, timers: 0 }, { settled: true, timers: 0 });
    release({ ok: false }); await loading;
  }
  {
    const r = runtime(), f = card(r); let processed = 0;
    r.context.processing.processCards = async cards => { processed += cards.length; };
    r.run(observerFactory + '\nattachFeedObserver({});');
    const obs = r.observers[0];
    assert.equal(obs.options.attributes, undefined, 'Own class/style attributes are not observed');
    assert.equal(obs.options.childList, true);
    r.context.isProcessing = true;
    obs.cb([{ addedNodes: [f.c] }]); r.context.isProcessing = false; await r.drain();
    issue('F09 insertion lost under processing lock', processed, 0, 1);
    obs.cb([{ addedNodes: [f.c] }]); assert.equal(processed, 1, 'Unlocked delta must process card');
    f.c.dataset.sdpProcessed = 'true'; obs.cb([{ addedNodes: [f.c] }]); assert.equal(processed, 1, 'Already-processed nodes must be ignored');
  }
  await check('sorting rating/discount/default independently per feed', () => {
    const r = runtime(); const items = [node(), node(), node()];
    items.forEach((li, i) => Object.assign(li, { nodeName: 'LI', dataset: { sdOriginalPos: String(i), sdpRating: String([10, 50, 20][i]), sdpDiscount: String([90, 20, 50][i]) } }));
    const second = node(); second.nodeName = 'LI';
    r.document.querySelectorAll = () => [{ children: items }, { children: [second] }];
    const sort = r.SortingModule(r.context);
    for (const [mode, orders] of [['rating', ['2', '0', '1']], ['discount', ['0', '2', '1']], ['default', ['0', '1', '2']]]) {
      r.s.sortBy = mode; sort.applySorting(); assert.deepEqual(items.map(li => li.style.order), orders); assert.equal(second.style.order, '0');
    }
  });
  await check('links reject active schemes; settings dual writes and DOM number parser', () => {
    const r = runtime();
    for (const dest of ['javascript:alert(1)', 'data:text/html,x', '/relative']) assert.equal(r.LinkResolutionModule.extractDestinationUrl('https://slickdeals.net/click?u2=' + encodeURIComponent(dest)), null);
    for (const [raw, want] of [['1,234°', 1234], ['1.2k', 1200], ['-12', -12]]) assert.equal(r.UtilsModule.parseHumanNumber(raw), want);
    assert.equal(r.UtilsModule.parsePrice('$1,200.99'), 1200.99);
    const settings = r.SettingsModule(); settings.loadSettings(); settings.getSettings().minPrice = '25'; settings.saveSettings();
    assert.equal(r.gm.get('sdPlus_settings_master'), r.local.get('sdPlus_settings_master'));
    assert.equal(JSON.parse(r.gm.get('sdPlus_settings_master')).minPrice, '25');
  });
  {
    const r = runtime(), intended = 'https://example.test/search?q=a%26b';
    issue('F10 destination decoded twice', r.LinkResolutionModule.extractDestinationUrl('https://slickdeals.net/click?u2=' + encodeURIComponent(intended)), 'https://example.test/search?q=a&b', intended);
  }
  console.log(`SUMMARY ${passed} control groups passed; ${expectedFailures} expected baseline failures; 0 unexpected failures`);
  if (process.argv.includes('--strict') && expectedFailures) process.exitCode = 1;
}
main().catch(error => { console.error('UNEXPECTED FAILURE', error); process.exitCode = 1; });
