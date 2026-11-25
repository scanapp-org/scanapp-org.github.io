// Real file-flow/parser/panel code; controlled decoder, analytics and browser APIs.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const ts = require('typescript');
const {JSDOM} = require('jsdom');
const root = path.resolve(__dirname, '..');

function harness(options = {}) {
  const dom = new JSDOM('<main id="scanapp-root"></main>', {url: options.url || 'https://scanapp.org/?private=hidden#secret'});
  const {window} = dom;
  Object.defineProperty(window, 'innerWidth', {value: options.width || 1280});
  window.matchMedia = () => ({matches: false});
  const effects = {events: [], toasts: [], decoderCalls: 0, pickerClicks: 0};
  let page;
  const globals = {window, document: window.document, navigator: window.navigator, localStorage: window.localStorage,
    HTMLElement: window.HTMLElement, SVGElement: window.SVGElement, URL, Date, console: {warn: () => {}},
    setTimeout: () => 0, clearTimeout: () => {}};
  if (!options.noTag) globals.gtag = (...args) => {
    if (options.throwTag) throw Error('controlled tracking failure');
    effects.events.push({name: args[1], params: args[2], presented: !!page?.resultPanel.element.classList.contains('show')});
  };
  const context = vm.createContext(globals);
  const modules = new Map();
  const result = {text: 'Fixture private payload', category: 'text', format: 'QR_CODE', timestamp: 1};
  class CameraManager {
    async scanFile() { effects.decoderCalls++; return options.decode ? options.decode() : result; }
    pause() {}
    resume() {}
    async stopCamera() {}
  }
  class PwaPromptManager {
    canShowPrompt() { return !!options.installBanner; }
    logInstallBannerShown() { if (options.installBanner) throw Error('optional banner tracking failed'); }
    onPromptAvailable() {}
  }
  function load(filename) {
    if (!filename.endsWith('.ts')) filename += '.ts';
    if (modules.has(filename)) return modules.get(filename).exports;
    const module = {exports: {}}; modules.set(filename, module);
    const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2018}}).outputText;
    const localRequire = spec => {
      if (spec.endsWith('/app-shell')) return {appShell: {showToast: message => effects.toasts.push(message)}};
      if (spec.endsWith('/camera/camera-manager')) return {CameraManager};
      if (spec.endsWith('/scanapp/pwa')) return {PwaPromptManager};
      assert.ok(spec.startsWith('.'), spec);
      return load(path.resolve(path.dirname(filename), spec));
    };
    vm.runInContext('(function(require,module,exports){' + code + '\n})', context, {filename})(localRequire, module, module.exports);
    return module.exports;
  }
  const {ScanPage} = load(path.join(root, 'scanapp-js/src/v2/pages/scan-page/scan-page'));
  page = new ScanPage();
  page.getElement().classList.add('active');
  window.document.getElementById('scanapp-root').appendChild(page.getElement());
  page.fileInputHelper.click = () => effects.pickerClicks++;
  const file = {name: 'private-filename.png'};
  return {dom, window, page, effects, file, load};
}
function events(h) { return h.effects.events.filter(e => e.name.startsWith('file_scan_')); }
function checkTerminal(h, outcome) {
  const list = events(h);
  assert.equal(list.length, 2);
  assert.equal(list[0].name, 'file_scan_start');
  assert.equal(list[1].params.outcome, outcome);
  assert.equal(list[1].params.contract_version, '1');
  assert.equal(list[1].params.scan_mode, 'file');
  assert.ok(Number.isFinite(list[1].params.elapsed_ms) && list[1].params.elapsed_ms >= 0 && list[1].params.elapsed_ms <= 600000);
  for (const event of list) {
    const allowed = event.name === 'file_scan_start' ? ['contract_version', 'scan_mode', 'outcome'] : ['contract_version', 'scan_mode', 'outcome', 'elapsed_ms'];
    assert.deepEqual(Object.keys(event.params).sort(), allowed.sort());
  }
  assert.ok(!/private-filename|Fixture private|hidden|secret/.test(JSON.stringify(list)));
}
(async () => {
  for (const width of [390, 1280]) {
    for (const tag of [{}, {noTag: true}, {throwTag: true}, {installBanner: true, throwTag: true}]) {
      const h = harness({...tag, width});
      await h.page.processImageFile(h.file);
      assert.equal(h.page.resultPanel.contentCard.textContent, 'Fixture private payload');
      assert.equal(h.page.resultPanel.element.classList.contains('show'), true, 'optional tracking must not suppress result');
      assert.ok(!h.effects.toasts.some(t => /No QR/.test(t)));
      h.page.triggerFileSelect('toolbar');
      assert.equal(h.effects.pickerClicks, 1, 'tracking must not suppress picker');
      if (!tag.noTag && !tag.throwTag) {
        checkTerminal(h, 'presented');
        assert.equal(events(h)[1].presented, true, 'presented event follows result DOM');
        assert.ok(h.effects.events.filter(e => e.name === 'ScanSuccess' || e.name === 'ScanSuccess_file').every(e => e.presented));
      }
      h.dom.window.close();
    }
  }
  const failed = harness({decode: async () => { throw Error('raw private error'); }});
  await failed.page.processImageFile(failed.file); checkTerminal(failed, 'decode_failed');
  assert.ok(failed.effects.toasts.includes('No QR / Barcode detected in image.'));
  assert.equal(failed.effects.events.filter(e => e.name === 'ScanSuccess').length, 0);
  failed.dom.window.close();

  for (const target of ['window', 'zone']) {
    const h = harness({throwTag: true});
    const drop = new h.window.Event('drop', {bubbles: true, cancelable: true});
    Object.defineProperty(drop, 'dataTransfer', {value: {files: [h.file], types: ['Files']}});
    (target === 'window' ? h.window : h.page.dragZone).dispatchEvent(drop);
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(h.effects.decoderCalls, 1, 'drop handles one file once');
    assert.equal(h.page.resultPanel.element.classList.contains('show'), true, 'tracking must not suppress drops');
    h.dom.window.close();
  }

  const presentation = harness(); presentation.page.resultPanel.show = () => { throw Error('render failed'); };
  await presentation.page.processImageFile(presentation.file); checkTerminal(presentation, 'presentation_failed');
  assert.ok(presentation.effects.toasts.includes('Could not display this result. Please try the image again.'));
  assert.equal(presentation.effects.events.filter(e => e.name === 'ScanSuccess').length, 0);
  presentation.dom.window.close();

  let finish;
  const overlap = harness({decode: () => new Promise(resolve => { finish = resolve; })});
  const first = overlap.page.processImageFile(overlap.file);
  await overlap.page.processImageFile(overlap.file);
  assert.equal(overlap.effects.decoderCalls, 1, 'do not concurrently use the file decoder');
  assert.ok(overlap.effects.toasts.includes('Please wait for the current image to finish processing.'));
  finish({text: 'first result', category: 'text', format: 'QR_CODE', timestamp: 1}); await first;
  assert.deepEqual(events(overlap).map(e => [e.name, e.params.outcome]), [['file_scan_start', 'started'], ['file_scan_start', 'started'], ['file_scan_error', 'busy'], ['file_scan_result_presented', 'presented']]);
  overlap.page.cameraManager.scanFile = async () => ({text: 'retry', category: 'text', format: 'QR_CODE', timestamp: 1});
  await overlap.page.processImageFile(overlap.file);
  assert.equal(overlap.page.resultPanel.contentCard.textContent, 'retry');
  assert.equal(events(overlap).filter(e => e.name === 'file_scan_start').length, 3);
  assert.equal(events(overlap).filter(e => e.name !== 'file_scan_start').length, 3);
  overlap.dom.window.close();

  let complete;
  const leaving = harness({decode: () => new Promise(resolve => { complete = resolve; })});
  const pending = leaving.page.processImageFile(leaving.file);
  await leaving.page.onUnmount(); // navigate away and back while decoding
  leaving.page.getElement().classList.add('active');
  complete({text: 'stale result', category: 'text', format: 'QR_CODE', timestamp: 1}); await pending;
  checkTerminal(leaving, 'view_left');
  assert.equal(leaving.page.resultPanel.currentResult, null);
  leaving.dom.window.close();

  for (const url of ['http://localhost:8000/', 'https://copied.example.org/']) {
    const h = harness({url}); await h.page.processImageFile(h.file); assert.equal(events(h).length, 0); h.dom.window.close();
  }
  const cancelled = harness(); await cancelled.page.handleFileSelected({target: {files: []}});
  assert.equal(cancelled.effects.decoderCalls, 0); assert.equal(events(cancelled).length, 0); cancelled.dom.window.close();

  const once = harness(); const {FileScanAttempt} = once.load(path.join(root, 'scanapp-js/src/v2/file-scan-telemetry'));
  const attempt = new FileScanAttempt(); attempt.finish('decode_failed'); attempt.finish('presented'); checkTerminal(once, 'decode_failed'); once.dom.window.close();
  console.log('PASS: file result/picker independent of analytics at390/1280px; paired outcomes, honest failures, overlap/retry, navigation staleness, cancel, terminal dedup and host/content privacy');
})().catch(error => {console.error(error); process.exitCode = 1;});
