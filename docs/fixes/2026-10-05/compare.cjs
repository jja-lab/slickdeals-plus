'use strict';
// Offline A/B regression comparison. No dependencies, network, real DOM or stores.
// Run: node compare.cjs --a /exact/A.js --b /candidate/B.js [--a-id commit] [--b-id commit]
// --inject-failure proves an assertion reaches a nonzero process exit.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createHash } = require('node:crypto');
const hash = value => createHash('sha256').update(value).digest('hex');
const plain = value => JSON.parse(JSON.stringify(value));
const A_HASH = 'bd090250026addeb1e4eac018129a4f8bd60673b12daee8163eb5281654877fb';
const SETTINGS_KEY = 'sdPlus_settings_master';
const SEEN_KEY = 'sdPlus_seen_alerts';
const EMPTY = { A: [], B: [], C: [] };
const FIXED_EPOCH = Date.UTC(2026, 9, 5, 12);
const args = {};
for (let i = 2; i < process.argv.length; i++) {
  const key = process.argv[i];
  assert.ok(['--a', '--b', '--a-id', '--b-id', '--inject-failure'].includes(key), `Unknown option ${key}`);
  assert.ok(!(key in args), `Duplicate option ${key}`);
  if (key === '--inject-failure') args[key] = true;
  else { assert.ok(process.argv[i + 1] && !process.argv[i + 1].startsWith('--'), `Missing ${key} value`); args[key] = process.argv[++i]; }
}
assert.ok(args['--a'] && args['--b'], 'Explicit --a and --b source paths are required');
function variant(label) {
  const filename = path.resolve(args[`--${label.toLowerCase()}`]);
  const bytes = fs.readFileSync(filename);
  const source = bytes.toString('utf8');
  if (label === 'A') assert.equal(hash(bytes), A_HASH, 'A must be the exact approved baseline, never main or modified B');
  function section(start, end) {
    const a = source.indexOf(start), b = source.indexOf(end, a + start.length);
    assert.ok(a >= 0 && b > a && source.indexOf(start, a + 1) === -1, `Extraction anchor changed: ${start}`);
    return source.slice(a, b);
  }
  const boundary = '    (async function init() {';
  const init = source.indexOf(boundary);
  assert.ok(init > 50000 && source.indexOf(boundary, init + 1) === -1, 'Missing/ambiguous init boundary');
  return {
    label, filename, sourceHash: hash(bytes), identity: args[`--${label.toLowerCase()}-id`] || 'unlabeled; SHA-256 authoritative',
    definitions: source.slice(0, init),
    handler: section("            context.eventBus.on('settingsChanged', ({ key }) => {", '            // Expose debug interface'),
    change: section('                // Setting changes', '                // Debounced input for text fields'),
    reset: section('                // Reset button', '                // Export button'),
    import: section('                // Import button', '                // Debug button'),
  };
}
function classes() {
  const values = new Set();
  return { add: (...keys) => keys.forEach(k => values.add(k)), remove: (...keys) => keys.forEach(k => values.delete(k)),
    contains: key => values.has(key), toggle(key, enabled) { if (enabled) values.add(key); else values.delete(key); } };
}
function node() { return { dataset: {}, classList: classes(), style: { removeProperty(key) { delete this[key]; } } }; }
function runtime(v, initial = {}, stored = undefined, shared = undefined) {
  const gm = shared?.gm || new Map(), local = shared?.local || new Map(), writes = [], timers = new Map(), messages = [], events = [], logs = [];
  let now = 0, timerId = 0, menuRefreshes = 0;
  const cards = [], elements = [], pending = [];
  const document = {
    querySelector: () => null,
    querySelectorAll(selector) {
      if (selector === '.sdp-glitch-alert') return elements.filter(el => el.classList.contains('sdp-glitch-alert'));
      if (selector === modules.ConstantsModule.SELECTORS.dealCard) return cards;
      return [];
    },
    createElement(tag) { assert.equal(tag, 'input'); const input = { click() { input.onchange({ target: { files: [{ text: runtimeState.importText }] } }); } }; return input; },
  };
  const sandbox = {
    document, URL, confirm: () => runtimeState.confirm,
    Date: class extends Date { constructor(...values) { super(...(values.length ? values : [FIXED_EPOCH + now])); } static now() { return FIXED_EPOCH + now; } },
    console: Object.fromEntries(['log', 'warn', 'error'].map(k => [k, (...items) => logs.push([k, ...items])])),
    GM_getValue: key => gm.get(key), GM_setValue: (key, value) => { writes.push(['gm', key, value]); gm.set(key, value); },
    localStorage: { getItem: key => local.get(key) ?? null, setItem: (key, value) => { writes.push(['local', key, value]); local.set(key, value); } },
    setTimeout: (fn, ms = 0) => { const id = ++timerId; timers.set(id, { fn, due: now + ms }); return id; }, clearTimeout: id => timers.delete(id),
    fetch: () => { throw new Error('Network forbidden in comparison'); }, window: { open() { throw new Error('Browser opening forbidden'); } },
    FileReader: class { readAsText(file) { this.onload({ target: { result: file.text } }); } },
  };
  vm.createContext(sandbox);
  vm.runInContext(v.definitions + '\nglobalThis.modules = { ConstantsModule, ValidationModule, SettingsModule, ProcessingModule, GlitchAlertModule, UtilsModule, LinkResolutionModule, ToastModule, log };\n})();', sandbox, { timeout: 1000 });
  const modules = sandbox.modules;
  // Capture debug-only catches even when the real debug setting is off.
  modules.log.debug = (...items) => logs.push(['debug', ...items]);
  if (!shared) {
    const seed = stored === undefined ? JSON.stringify({ ...plain(modules.ConstantsModule.DEFAULTS), ...plain(initial) }) : stored;
    gm.set(SETTINGS_KEY, seed); local.set(SETTINGS_KEY, seed);
    local.set('unrelated-key', 'retained'); gm.set('unrelated-key', 'retained');
  }
  const settings = modules.SettingsModule(); settings.loadSettings();
  const listeners = new Map();
  const context = {
    settings, data: { lookup() {} }, isProcessing: false, sorting: { applySorting() {} },
    eventBus: {
      on(key, fn) { const callbacks = listeners.get(key) || []; callbacks.push(fn); listeners.set(key, callbacks); },
      emit(key, value) { events.push(plain({ key, value })); for (const fn of listeners.get(key) || []) fn(value); },
    },
  };
  const actualProcessing = modules.ProcessingModule(context);
  context.processing = { ...actualProcessing, processAllCards(...values) { const task = actualProcessing.processAllCards(...values); pending.push(task); return task; } };
  modules.ToastModule.show = (...items) => messages.push(items);
  const callbacks = {};
  const newMenuBody = {
    addEventListener(type, fn) { callbacks[type] = fn; },
    querySelector(selector) { return { addEventListener(type, fn) { callbacks[selector] = fn; } }; },
  };
  const bridge = { ...modules, context, newMenuBody, populateMenu: () => menuRefreshes++ };
  sandbox.bridge = bridge;
  const run = code => vm.runInContext('with (bridge) { ' + code + '\n}', sandbox, { timeout: 1000 });
  run(v.handler); run(v.change); run(v.reset); run(v.import);
  async function drain() {
    for (let n = 0; n < 500; n++) {
      await Promise.resolve();
      if (!timers.size) { await Promise.resolve(); if (!timers.size) { await Promise.all(pending.splice(0)); return; } }
      const [id, task] = [...timers].sort((a, b) => a[1].due - b[1].due || a[0] - b[0])[0];
      timers.delete(id); now = task.due; task.fn();
    }
    throw new Error('Deterministic timer budget exceeded');
  }
  const runtimeState = {
    ...modules, gm, local, writes, timers, messages, events, logs, cards, elements, context, document,
    s: settings.getSettings(), drain, get menuRefreshes() { return menuRefreshes; },
    confirm: true, importText: '', importJSON(text) { this.importText = text; callbacks['#sdPlusImportButton'](); },
    reset() { callbacks['#sdPlusResetButton'](); },
    toggle(value) { callbacks.change({ target: { dataset: { setting: 'glitchAlerts' }, type: 'checkbox', checked: value } }); },
    emit(key) { context.eventBus.emit('settingsChanged', { key, allSettings: settings.getSettings() }); },
    async process() { context.processing.processAllCards(true); await drain(); },
  };
  return runtimeState;
}
function snapshot(r) { return plain({ settings: r.s, gm: [...r.gm], local: [...r.local], writes: r.writes, events: r.events, menuRefreshes: r.menuRefreshes }); }
function card(r, { id = String(r.cards.length + 1), title = 'price glitch', price = '$10', original = '$20', votes = '5', wrapped = true, badge = '' } = {}) {
  const c = node(), wrapper = wrapped ? node() : c;
  c.dataset.threadid = id;
  const S = r.ConstantsModule.SELECTORS;
  const fields = { [S.dealTitle]: { textContent: title }, [S.dealPrice]: { textContent: price }, [S.originalPrice]: { textContent: original },
    [S.voteCount]: { textContent: votes }, [S.dealBadge]: { textContent: badge }, [S.priceContainer]: node() };
  c.closest = selector => selector === 'li' ? (wrapped ? wrapper : null) : c;
  c.querySelector = selector => fields[selector] || null;
  c.querySelectorAll = () => [];
  c.matches = selector => selector === S.dealCard; c.nodeType = 1;
  r.cards.push(c); r.elements.push(c); if (wrapped) r.elements.push(wrapper);
  return { c, wrapper, fields };
}
const deal = (patch = {}) => ({ titleText: 'ordinary item', currentPrice: 10, originalPrice: 20, percent: 0, votes: 0, isPromoted: false, hasData: true, ...patch });
const tests = [];
function test(label, input, run, aPass = true) { tests.push({ label, input, run, aPass }); }
function evaluate(r, title, watchlist = r.s.glitchKeywords, patch = {}) {
  return r.GlitchAlertModule.evaluateDealAnomaly(deal({ titleText: title.toLowerCase(), ...patch }), undefined, { ...r.s, glitchKeywords: watchlist });
}

// D01: lexical numeric tokens; ordinary text retains case-insensitive substring semantics.
const numericCases = [
  ['0.01', '0.01', true], ['0.01', '$0.01', true], ['$0.01', '$0.01', true], ['$0.01', '0.01', false],
  ['0.01', '$10.01', false], ['0.01', '$100.01', false], ['0.01', '0.010', false],
  ['0.01', '(0.01)', true], ['0.01', ':0.01;', true], ['0.01', '0.01!', true], ['0.01', '0.01?', true],
  ['0.01', '0.01.', true], ['0.01', '0.01,', true], ['0.01', '0.01, sale', true],
  ['0.01', 'v0.01', false], ['0.01', '0.01x', false], ['0.01', '_0.01', false], ['0.01', '0.01_', false],
  ['0.01', '1.0.01', false], ['0.01', '0.01.2', false], ['0.01', '0.01.beta', false],
  ['0.01', '.0.01', false], ['0.01', ',0.01', false], ['0.01', '0.01,000', false],
  ['0.01', '$$0.01', false], ['0.01', 'a$0.01', false], ['0.01', 'é0.01', false], ['0.01', '0.01界', false],
  ['0.01', 'deal-0.01', true], ['0.01', 'deal/0.01', true], ['0.01', '-0.01', true],
  ['12', '12', true], ['12', '$12', true], ['12', '312', false], ['12', '12.0', false], ['12', '12,000', false],
  ['$12', '$12', true], ['$12', '12', false], ['$12', 'x$12', false],
  ['00.01', '0.01', false], ['00.01', '00.01', true], ['00.01', '$100.01', false],
  ['0.010', '0.010', true], ['0.010', '0.01', false],
  ['GLITCH', 'microglitching', true], [' padded ', 'a padded term', true], [' padded ', 'padded', false],
  [' 0.01 ', 'x 0.01 y', true], [' 0.01 ', '0.01', false], ['.01', 'model.01x', true],
];
for (const [term, title, expected] of numericCases) {
  test(`F01 numeric/text ${JSON.stringify(term)} in ${JSON.stringify(title)}`, { term, title, expected }, v => {
    const r = runtime(v); const result = evaluate(r, title, { A: [term], B: [], C: [] });
    assert.equal(result.alert, expected); assert.equal(result.score, expected ? 3 : 0);
  }, title.toLowerCase().includes(term.toLowerCase()) === expected);
}

const invalidLists = [
  null, 1, false, 'glitch', [], {}, { A: [], B: [] }, { A: 'glitch', B: [], C: [] },
  ...['A', 'B', 'C'].flatMap(tier => [null, 1, {}, '', ' ', '\t\n'].map(term => ({ ...plain(EMPTY), [tier]: [term] }))),
  { A: ['custom', null], B: [], C: [] },
];
for (const [index, watchlist] of invalidLists.entries()) {
  test(`F02 reject malformed watchlist ${index}`, { watchlist }, v => {
    const r = runtime(v); const result = r.ValidationModule.validateSettings({ minPrice: '17', glitchKeywords: watchlist }, r.ConstantsModule.DEFAULTS);
    assert.equal(result.isValid, false); assert.ok(result.errors.length); assert.equal(result.settings.minPrice, '17');
    assert.deepEqual(plain(result.settings.glitchKeywords), EMPTY);
  }, false);
  test(`F02 defensive detector malformed watchlist ${index}`, { watchlist }, v => {
    const r = runtime(v); const result = evaluate(r, 'price glitch custom', watchlist);
    assert.equal(result.alert, false); assert.equal(result.score, 0); assert.equal(result.tier, null);
    const price = evaluate(r, 'price glitch custom', watchlist, { percent: 70, currentPrice: 5, originalPrice: 200 });
    assert.equal(price.alert, true); assert.equal(price.score, 5); assert.equal(price.tier, null);
  }, ['A', 'B', 'C'].some(tier => watchlist?.[tier]?.[0] === '\t\n'));
  test(`F03 atomic malformed watchlist import ${index}`, { watchlist }, async v => {
    const r = runtime(v, { minPrice: '25', glitchAlerts: true }); const before = snapshot(r);
    r.importJSON(JSON.stringify({ minPrice: '99', glitchKeywords: watchlist })); await r.drain();
    assert.deepEqual(snapshot(r), before); assert.equal(r.messages.length, 1); assert.equal(r.messages[0][1], 'error');
  }, false);
}
for (const [index, value] of [null, 0, 2.5, false, true, 'settings', [], [{}]].entries()) {
  test(`F03 reject root ${index}`, { value }, async v => {
    const r = runtime(v, { minPrice: '25', glitchAlerts: true }); const before = snapshot(r);
    assert.equal(r.ValidationModule.validateSettings(value, r.ConstantsModule.DEFAULTS).isValid, false);
    r.importJSON(JSON.stringify(value)); await r.drain();
    assert.deepEqual(snapshot(r), before); assert.equal(r.messages.length, 1); assert.equal(r.messages[0][1], 'error');
  }, false);
}
for (const text of ['', '{', '{"glitchAlerts":false,}', 'undefined']) {
  test(`F03 malformed JSON ${JSON.stringify(text)}`, { text }, async v => {
    const r = runtime(v, { minPrice: '25', glitchAlerts: true }); const before = snapshot(r);
    r.importJSON(text); await r.drain(); assert.deepEqual(snapshot(r), before);
    assert.equal(r.messages.length, 1); assert.equal(r.messages[0][1], 'error');
  });
}
for (const watchlist of [EMPTY, { A: ['Custom Token', ' padded '], B: ['12'], C: ['Context'], future: ['tolerated'] }]) {
  test(`F02/F03 valid watchlist ${JSON.stringify(watchlist)}`, { watchlist }, async v => {
    const r = runtime(v, { minPrice: '25' });
    r.importJSON(JSON.stringify({ glitchKeywords: watchlist })); await r.drain();
    assert.deepEqual(plain(r.s.glitchKeywords), watchlist); assert.equal(r.s.minPrice, '');
    assert.equal(r.gm.get(SETTINGS_KEY), r.local.get(SETTINGS_KEY));
    assert.deepEqual(JSON.parse(r.gm.get(SETTINGS_KEY)).glitchKeywords, watchlist);
    assert.equal(r.events.length, 1); assert.equal(r.events[0].value.key, 'all'); assert.equal(r.messages[0][1], 'success');
    const reload = runtime(v, {}, undefined, r); assert.deepEqual(plain(reload.s.glitchKeywords), watchlist);
    assert.equal(evaluate(reload, 'price glitch').alert, false);
    if (watchlist.A.length) assert.equal(evaluate(reload, 'custom token').alert, true);
  });
}
test('F02 persisted malformed watchlist safe fallback without repair writes', { watchlist: { A: [null], B: [], C: [] } }, v => {
  const text = JSON.stringify({ minPrice: '25', glitchKeywords: { A: [null], B: [], C: [] } });
  const r = runtime(v, {}, text);
  assert.deepEqual(plain(r.s.glitchKeywords), EMPTY); assert.equal(r.s.minPrice, '25');
  assert.equal(evaluate(r, 'price glitch').alert, false); assert.deepEqual(r.writes, []);
  assert.equal(r.gm.get(SETTINGS_KEY), text); assert.equal(r.local.get(SETTINGS_KEY), text);
}, false);
test('F02 absent watchlist retains missing-setting default compatibility', {}, v => {
  const r = runtime(v, {}, '{"minPrice":"25"}');
  assert.deepEqual(plain(r.s.glitchKeywords), plain(r.ConstantsModule.DEFAULTS.glitchKeywords));
  const result = r.GlitchAlertModule.evaluateDealAnomaly(deal({ titleText: 'price glitch' }), undefined, {});
  assert.equal(result.alert, true);
});
test('F03 partial import defaults, unknown key tolerance and dual writes', { minPrice: '17', futureOption: { enabled: true } }, async v => {
  const r = runtime(v, { minPrice: '25', maxPrice: '99', glitchAlerts: true });
  r.importJSON('{"minPrice":"17","futureOption":{"enabled":true}}'); await r.drain();
  assert.equal(r.s.minPrice, '17'); assert.equal(r.s.maxPrice, ''); assert.equal(r.s.glitchAlerts, false);
  assert.equal('futureOption' in r.s, false); assert.equal(r.gm.get(SETTINGS_KEY), r.local.get(SETTINGS_KEY));
  assert.equal(JSON.parse(r.gm.get(SETTINGS_KEY)).minPrice, '17'); assert.equal(r.local.get('sdPlus_debug'), 'false');
  assert.equal(r.events.length, 1); assert.equal(r.messages[0][1], 'success'); assert.equal(r.menuRefreshes, 1);
});
test('F03 wrong-type and color warnings remain accepted', { minPrice: 4, colorRatingBG: 'bad' }, async v => {
  const r = runtime(v); r.importJSON('{"minPrice":4,"colorRatingBG":"bad"}'); await r.drain();
  assert.equal(r.s.minPrice, r.ConstantsModule.DEFAULTS.minPrice); assert.equal(r.s.colorRatingBG, r.ConstantsModule.DEFAULTS.colorRatingBG);
  assert.equal(r.messages.length, 1); assert.equal(r.messages[0][1], 'warning'); assert.match(r.messages[0][0], /2 warning/);
  assert.equal(r.events.length, 1); assert.equal(r.gm.get(SETTINGS_KEY), r.local.get(SETTINGS_KEY));
});

for (const transition of ['toggle', 'reset', 'import', 'other-reprocess-setting']) {
  for (const wrapped of [true, false]) {
    for (const noData of [false, true]) {
      test(`F04 disable via ${transition} wrapped=${wrapped} noData=${noData}`, { transition, wrapped, noData }, async v => {
        const r = runtime(v, { glitchAlerts: true }); const f = card(r, { wrapped });
        await r.process(); assert.equal(f.wrapper.classList.contains('sdp-glitch-alert'), true);
        const dedup = [r.gm.get(SEEN_KEY), r.local.get(SEEN_KEY)]; assert.ok(dedup[0]);
        if (noData) f.fields[r.ConstantsModule.SELECTORS.dealPrice].textContent = 'See official rules';
        r.messages.length = 0;
        if (transition === 'toggle') r.toggle(false);
        else if (transition === 'reset') r.reset();
        else if (transition === 'import') r.importJSON('{"glitchAlerts":false}');
        else { r.s.glitchAlerts = false; r.emit('freeOnly'); }
        await r.drain();
        assert.equal(r.s.glitchAlerts, false); assert.equal(f.wrapper.classList.contains('sdp-glitch-alert'), false);
        for (let i = 0; i < 3; i++) await r.process();
        assert.equal(f.wrapper.classList.contains('sdp-glitch-alert'), false);
        assert.deepEqual([r.gm.get(SEEN_KEY), r.local.get(SEEN_KEY)], dedup);
        assert.equal(r.messages.some(items => items[0].startsWith('Glitch/home-run deal:')), false);
        assert.equal(r.logs.some(items => items.some(item => typeof item === 'string' && /error/i.test(item))), false);
      }, transition === 'toggle');
    }
  }
}
for (const wrapped of [true, false]) {
  test(`F04 default-off inactivity wrapped=${wrapped}`, { wrapped }, async v => {
    const r = runtime(v); const f = card(r, { wrapped }); const beforeWrites = plain(r.writes);
    const original = r.GlitchAlertModule.evaluateDealAnomaly;
    let detectorCalls = 0;
    r.GlitchAlertModule.evaluateDealAnomaly = () => { detectorCalls++; throw new Error('Detector must remain inactive'); };
    await r.process(); await r.process();
    assert.equal(f.wrapper.classList.contains('sdp-glitch-alert'), false); assert.deepEqual(r.writes, beforeWrites);
    assert.equal(r.gm.has(SEEN_KEY), false); assert.equal(r.local.has(SEEN_KEY), false); assert.deepEqual(r.messages, []);
    assert.equal(detectorCalls, 0);
    assert.equal(r.logs.some(items => items.some(item => typeof item === 'string' && /error/i.test(item))), false);
    r.GlitchAlertModule.evaluateDealAnomaly = original;
  });
}
test('F04 enabling highlights; repeated reprocess/re-enable retains dedup', {}, async v => {
  const r = runtime(v); const f = card(r); await r.process(); r.toggle(true); await r.drain();
  assert.equal(f.wrapper.classList.contains('sdp-glitch-alert'), true); assert.equal(r.messages.length, 1);
  const dedup = [r.gm.get(SEEN_KEY), r.local.get(SEEN_KEY)];
  await r.process(); r.toggle(false); await r.drain(); r.toggle(true); await r.drain();
  assert.equal(f.wrapper.classList.contains('sdp-glitch-alert'), true); assert.equal(r.messages.length, 1);
  assert.deepEqual([r.gm.get(SEEN_KEY), r.local.get(SEEN_KEY)], dedup);
});
test('F04 import enabled then reimport retains highlight and dedup', { glitchAlerts: true }, async v => {
  const r = runtime(v); const f = card(r); await r.process();
  r.importJSON('{"glitchAlerts":true}'); await r.drain();
  assert.equal(f.wrapper.classList.contains('sdp-glitch-alert'), true);
  const dedup = [r.gm.get(SEEN_KEY), r.local.get(SEEN_KEY)];
  r.importJSON('{"glitchAlerts":true}'); await r.drain();
  assert.equal(f.wrapper.classList.contains('sdp-glitch-alert'), true);
  assert.deepEqual([r.gm.get(SEEN_KEY), r.local.get(SEEN_KEY)], dedup);
  assert.equal(r.messages.filter(items => items[0].startsWith('Glitch/home-run deal:')).length, 1);
});
test('F04 cancelled reset preserves enabled state, stores and highlight', { confirmation: false }, async v => {
  const r = runtime(v, { glitchAlerts: true }); const f = card(r); await r.process();
  r.confirm = false; const before = snapshot(r); const messages = plain(r.messages);
  r.reset(); await r.drain();
  assert.deepEqual(snapshot(r), before); assert.deepEqual(r.messages, messages);
  assert.equal(f.wrapper.classList.contains('sdp-glitch-alert'), true);
});

test('control built-in fixtures exactly 8/8', {}, v => {
  const r = runtime(v); const result = r.GlitchAlertModule.runSelfTest(); assert.equal(result.passed, 8); assert.equal(result.failed, 0);
});
test('control scores, sensitivity thresholds and A/B/C combinations', {}, v => {
  const r = runtime(v);
  for (const sensitivity of ['low', 'medium', 'high']) {
    r.s.glitchSensitivity = sensitivity;
    for (const [title, patch, score, alert, tier] of [
      ['price glitch', {}, 3, true, 'A'], ['milwaukee', { percent: 40 }, 1.5, true, 'B'],
      ['milwaukee', { percent: 39.99 }, 0, false, null], ['clearance', {}, 0, false, null],
      ['price glitch milwaukee clearance', { percent: 40 }, 5, true, 'A'],
      ['ordinary', { percent: 70 }, 2, sensitivity === 'high', null],
      ['ordinary', { currentPrice: 5, originalPrice: 200, percent: 70 }, 5, sensitivity !== 'low', null],
      ['ordinary', { currentPrice: 5, originalPrice: 200, percent: 70, votes: 500 }, 7, true, null],
    ]) {
      const result = evaluate(r, title, r.s.glitchKeywords, patch);
      assert.deepEqual([result.score, result.alert, result.tier], [score, alert, tier], `${sensitivity}/${title}/${JSON.stringify(patch)}`);
    }
  }
  assert.equal(evaluate(r, 'price glitch', r.s.glitchKeywords, { isPromoted: true }).alert, false);
  assert.equal(evaluate(r, 'price glitch', r.s.glitchKeywords, { hasData: false }).alert, false);
  assert.equal(evaluate(r, 'ordinary', r.s.glitchKeywords, { currentPrice: NaN }).manualReview, true);
  assert.equal(evaluate(r, 'ordinary', r.s.glitchKeywords, { originalPrice: NaN }).manualReview, false);
});
test('control nearby filters, highlighting, parser and active-scheme rejection', {}, async v => {
  const r = runtime(v, { freeOnly: true }); const f = card(r, { wrapped: false, votes: '1.2k' });
  await r.process(); assert.equal(f.wrapper.classList.contains('sd-plus-hide'), true); assert.equal(f.c.classList.contains('highlightBoth'), true);
  assert.equal(r.UtilsModule.parseHumanNumber('1,234°'), 1234); assert.equal(r.UtilsModule.parseHumanNumber('1.2k'), 1200);
  assert.equal(r.UtilsModule.parseHumanNumber('-12'), -12); assert.equal(r.UtilsModule.parsePrice('$1,200.99'), 1200.99);
  for (const destination of ['javascript:alert(1)', 'data:text/html,x', '/relative']) {
    assert.equal(r.LinkResolutionModule.extractDestinationUrl('https://slickdeals.net/click?u2=' + encodeURIComponent(destination)), null);
  }
});
test('control dedup reload, ID normalization, FIFO 500 and dual writes', {}, v => {
  const r = runtime(v); r.GlitchAlertModule.markAlerted(42); r.GlitchAlertModule.markAlerted('42');
  assert.equal(JSON.parse(r.gm.get(SEEN_KEY)).ids.length, 1);
  const reload = runtime(v, {}, undefined, r); assert.equal(reload.GlitchAlertModule.hasAlerted(42), true);
  for (let i = 0; i < 501; i++) reload.GlitchAlertModule.markAlerted('case-' + i);
  const ids = JSON.parse(r.gm.get(SEEN_KEY)).ids;
  assert.equal(ids.length, 500); assert.equal(ids[0], 'case-1'); assert.equal(ids[499], 'case-500');
  assert.equal(reload.GlitchAlertModule.hasAlerted(42), false); assert.equal(r.gm.get(SEEN_KEY), r.local.get(SEEN_KEY));
});

async function main() {
  const variants = [variant('A'), variant('B')];
  const manifest = tests.map(({ label, input, aPass }) => ({ label, input, aPass }));
  console.log(JSON.stringify({ type: 'identities', node: process.version, variants: variants.map(({ label, filename, sourceHash, identity }) => ({ label, filename, sourceHash, identity })),
    harnessSha256: hash(fs.readFileSync(__filename)), inputManifestSha256: hash(JSON.stringify(manifest)), fixtures: tests.length,
    hashCoverage: 'Input manifest hashes labels, explicit inputs and A expectations; harness hash additionally covers all fixture settings, operations, mocks, assertions and timer/clock schedule.', fixedEpoch: FIXED_EPOCH }));
  let unexpected = 0;
  for (const v of variants) {
    let passed = 0, expectedFailures = 0, failed = 0;
    for (const t of tests) {
      let failure;
      try { await t.run(v); } catch (error) { failure = error; }
      const wantedPass = v.label === 'B' || t.aPass;
      // Never count extraction/setup/mock failures as expected baseline defects.
      const expectedFailureKind = failure && (failure.code === 'ERR_ASSERTION' ||
        (t.label.startsWith('F02 defensive detector') && failure.name === 'TypeError' && /toLowerCase/.test(failure.message)));
      if (!failure && wantedPass) { passed++; console.log(`PASS ${v.label} ${t.label}`); }
      else if (failure && !wantedPass && expectedFailureKind) {
        expectedFailures++;
        console.log(JSON.stringify({ type: 'XFAIL', variant: v.label, label: t.label, input: t.input,
          failure: { name: failure.name, code: failure.code, message: failure.message, actual: failure.actual, expected: failure.expected } }));
      }
      else { failed++; unexpected++; console.log(`${failure ? 'FAIL' : 'XPASS'} ${v.label} ${t.label}${failure ? ': ' + failure.stack : ': baseline expectation must be reviewed'}`); }
    }
    console.log(JSON.stringify({ type: 'summary', variant: v.label, passed, expectedFailures, unexpected: failed, total: tests.length }));
  }
  console.log('UNRESOLVED F05 duplicate redirect handlers; F06 shared debounce/pending edits; F07 partial API records; F08 API timeout; F09 observer insertion lock; F10 URL decoding; F11 late navbar recovery. No fixes or new passing claims for these findings.');
  console.log('LIMITS Actual module definitions and exact menu callbacks/settings handler are executed in Node VM. Synthetic selectors, class sets, Maps, synchronous FileReader/confirmation, deterministic timers and excluded initialization are not a real DOM/browser/Tampermonkey lifecycle. No network, real stores, installation, speed or population precision measurements.');
  if (args['--inject-failure']) assert.fail('Injected assertion: expected nonzero exit');
  if (unexpected) process.exitCode = 1;
}
main().catch(error => { console.error('UNEXPECTED FAILURE', error.stack); process.exitCode = 1; });
