// Behavioral checks for the actual result parser/panel; no camera or navigation.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const ts = require('typescript');
const { JSDOM } = require('jsdom');
const root = path.resolve(__dirname, '..');

function generatorPayload(contentType, values) {
  const source = fs.readFileSync(path.join(root, 'assets/js/generate.js'), 'utf8');
  const compile = source.slice(source.indexOf('  function compileContent() {'), source.indexOf('  function getVal(id)'));
  const state = { contentType };
  const context = vm.createContext({state, encodeURIComponent, getVal: id => (values[id] || '').trim(), document: {getElementById: () => ({checked: false})}});
  vm.runInContext(compile + '\ncompileContent();', context);
  return state.qrData;
}

function harness(width, deliverAnalyticsCallback = true) {
  const dom = new JSDOM('<main id="scanapp-root"></main>', {url: 'https://scanapp.org/'});
  const { window } = dom;
  Object.defineProperty(window, 'innerWidth', {value: width});
  const effects = {opened: [], shares: [], toasts: [], copied: null};
  window.open = (...args) => effects.opened.push(args);
  Object.defineProperty(window.navigator, 'clipboard', {value: {writeText: async text => { effects.copied = text; }}, configurable: true});
  Object.defineProperty(window.navigator, 'share', {value: async data => effects.shares.push(data), configurable: true});
  const context = vm.createContext({window, document: window.document, navigator: window.navigator, HTMLElement:window.HTMLElement, SVGElement:window.SVGElement, URL, Date, console, setTimeout: () => 0, clearTimeout: () => {}});
  const modules = new Map();
  function load(filename) {
    if (!filename.endsWith('.ts')) filename += '.ts';
    if (modules.has(filename)) return modules.get(filename).exports;
    const module = {exports: {}}; modules.set(filename, module);
    const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2018}}).outputText;
    function localRequire(spec) {
      if (spec.endsWith('/app-shell')) return {appShell: {showToast: text => effects.toasts.push(text)}};
      if (spec.endsWith('/scanapp/logger')) return {Logger: new Proxy({}, {get: (_, name) => (...args) => {if (name === 'logUrlAction' && deliverAnalyticsCallback) args[0]();}})};
      assert.ok(spec.startsWith('.'), spec);
      return load(path.resolve(path.dirname(filename), spec));
    }
    vm.runInContext('(function(require,module,exports){' + compiled + '\n})', context, {filename})(localRequire, module, module.exports);
    return module.exports;
  }
  const parser = load(path.join(root, 'scanapp-js/src/v2/result/result-parser'));
  const { ResultPanel } = load(path.join(root, 'scanapp-js/src/v2/result/result-panel'));
  return {dom, window, effects, parser, panel: new ResultPanel(() => {})};
}

const email = generatorPayload('email', {'email-to':'fixture@example.org', 'email-subject':'A & B', 'email-body':'First line\nSecond line'});
const wifi = generatorPayload('wifi', {'wifi-ssid':'lab.test', 'wifi-encryption':'WPA', 'wifi-password':'fixture-password'});
const phone = generatorPayload('phone', {'phone-num':'+15555550123'});
const fixtures = [
  {text:'https://example.org/path?demo=1', category:'url', action:'https://example.org/path?demo=1'},
  {text:'HTTPS://example.org/path', category:'url', action:'https://example.org/path'},
  {text:'HTTP://EXAMPLE.ORG/path', category:'url', action:'http://example.org/path'},
  {text:'example.org/path?demo=1#result', category:'url', action:'https://example.org/path?demo=1#result'},
  {text:'www.example.technology:8080/path', category:'url', action:'https://www.example.technology:8080/path'},
  {text:'https://example.org/path%20name', category:'url', action:'https://example.org/path%20name'},
  {text:"https://example.org/o'brien", category:'url', action:"https://example.org/o'brien"},
  {text:'https://例え.テスト/path', category:'url', action:'https://xn--r8jz45g.xn--zckzah/path'},
  {text:email, category:'email', action:email},
  {text:'MAILTO:fixture@example.org', category:'email', action:'MAILTO:fixture@example.org'},
  {text:wifi, category:'wifi'},
  {text:'WIFI:T:WPA;S:lab.test;P:fixture-password;;', category:'wifi'},
  {text:phone, category:'phone'},
  {text:'TEL:+15555550123', category:'phone'},
  {text:'tel:+1555-555-0123;ext=42', category:'phone'},
  {text:'upi://pay?pa=fixture@bank&pn=Fixture', category:'upi'},
  {text:'Inventory item 12345', category:'text'},
  {text:'5901234123457', category:'text', format:'EAN_13'},
  {text:'Reference example.org invoice 123', category:'text'},
  {text:'Visit https://example.org for instructions', category:'text'},
  {text:'BEGIN:VCARD\nURL:https://example.org\nEND:VCARD', category:'text'},
  {text:'<img src=x onerror=fixture()>', category:'text'},
  {text:'javascript:alert(1)', category:'text'},
  {text:'javascript://example.org/alert(1)', category:'text'},
  {text:'data:text/html,https://example.org', category:'text'},
  {text:'ftp://example.org/file', category:'text'},
  {text:'fixture@example.org', category:'text'},
  {text:'https://user:secret@example.org/', category:'text'},
  {text:'https://', category:'text'},
  {text:'mailto:not-an-address', category:'text'},
  {text:'some tel:+15555550123 reference', category:'text'},
  {text:'https://example.org/\nhttps://other.example/', category:'text'},
  {text:'https://example.org\\@other.example/', category:'text'}
];

(async () => {
  let count = 0;
  for (const width of [390, 1280]) {
    const h = harness(width);
    for (const f of fixtures) {
      const result = h.parser.parseScanResult(f.text, f.format || 'QR_CODE');
      assert.equal(result.category, f.category, f.text);
      h.panel.show(result);
      assert.equal(h.panel.contentCard.textContent, f.text);
      assert.equal(h.panel.formatVal.textContent, f.format || 'QR_CODE');
      assert.equal(h.panel.contentCard.querySelectorAll('img,script').length, 0);
      assert.equal(h.panel.element.classList.contains('show'), true);
      const anchor = h.panel.contentCard.querySelector('a');
      if (f.category === 'url') assert.equal(anchor.href, f.action);
      else assert.equal(anchor, null, 'Only web URLs become content anchors');
      assert.equal(h.panel.actionOpenBtn.style.display, f.action ? 'flex' : 'none');
      const openCount = h.effects.opened.length;
      h.panel.actionOpenBtn.click();
      assert.equal(h.effects.opened.length, openCount + (f.action ? 1 : 0));
      if (f.action) {
        assert.equal(h.effects.opened.at(-1)[0], f.action);
        assert.equal(h.effects.opened.at(-1)[2], 'noopener,noreferrer');
      }
      if (f.category === 'email') {
        assert.equal(h.panel.actionOpenBtn.textContent.trim(), 'Email');
        assert.equal(h.panel.typeTitle.textContent, 'EMAIL');
      }
      await h.panel.handleCopy(); assert.equal(h.effects.copied, f.text);
      await h.panel.handleShare();
      const shared = h.effects.shares.at(-1);
      assert.equal(shared.text, f.text);
      assert.equal(shared.url, f.category === 'url' ? f.action : undefined);
      h.panel.hide();
      const afterHide = h.effects.opened.length;
      h.panel.handleOpen(); assert.equal(h.effects.opened.length, afterHide);
      count++;
    }
    Object.defineProperty(h.window.navigator, 'share', {value: undefined, configurable:true});
    h.panel.show(h.parser.parseScanResult(email, 'QR_CODE'));
    await h.panel.handleShare(); assert.equal(h.effects.copied, email);
    Object.defineProperty(h.window.navigator, 'clipboard', {value:{writeText:async()=>{throw Error('denied');}}, configurable:true});
    await h.panel.handleCopy(); assert.equal(h.effects.toasts.at(-1), 'Failed to copy.');
    h.dom.window.close();
  }
  const blockedAnalytics = harness(390, false);
  for (const text of [email, 'HTTPS://example.org/path']) {
    blockedAnalytics.panel.show(blockedAnalytics.parser.parseScanResult(text, 'QR_CODE'));
    const before = blockedAnalytics.effects.opened.length;
    blockedAnalytics.panel.actionOpenBtn.click();
    assert.equal(blockedAnalytics.effects.opened.length, before + 1, 'Open must work when analytics never invokes its callback');
  }
  blockedAnalytics.dom.window.close();
  console.log(`Passed ${count} parser/panel cases plus two blocked-analytics action checks, actual generator email/Wi-Fi/phone payload compilation, intended open/share/copy actions and hidden-result guards. Browser decoding/native clipboard are separate checks.`);
})().catch(error => {console.error(error); process.exitCode = 1;});
