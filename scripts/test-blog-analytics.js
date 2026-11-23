// Behavior checks for first-party scope and safe blog-to-tool measurement.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require('node:path').join(__dirname, '../assets/js/blog-analytics.js'), 'utf8');

function fixture(url) {
  const location = new URL(url), listeners = {}, scripts = [];
  const window = { location };
  const document = {
    addEventListener(name, fn) { listeners[name] = fn; },
    createElement() { return {}; },
    head: { appendChild(script) { scripts.push(script); } }
  };
  const context = vm.createContext({ window, document, URL, Date });
  vm.runInContext(source, context);
  return { window, scripts, runAgain() { vm.runInContext(source, context); },
    click(href) { listeners.click({ target: { closest() { return { href }; } } }); } };
}

const prod = fixture('https://scanapp.org/blog/example.html?private=hidden#secret');
assert.equal(prod.scripts.length, 1);
assert.equal(prod.scripts[0].async, true);
assert.equal(prod.window.dataLayer[1][2].page_location, 'https://scanapp.org/blog/example.html');
assert.equal(prod.window.dataLayer[1][2].content_group, 'blog');
prod.click('https://scanapp.org/generate/?private=hidden#secret');
assert.equal(prod.window.dataLayer[2][1], 'content_tool_click');
assert.equal(prod.window.dataLayer[2][2].destination_path, '/generate/');
assert.ok(!JSON.stringify(prod.window.dataLayer).includes('hidden'));
prod.click('https://elsewhere.example/generate/');
prod.click('https://scanapp.org/support/');
assert.equal(prod.window.dataLayer.length, 3);
prod.click('https://scanapp.org/');
assert.equal(prod.window.dataLayer.length, 4);
prod.runAgain();
assert.equal(prod.scripts.length, 1);
assert.equal(prod.window.dataLayer.length, 4);
const support = fixture('https://scanapp.org/supports/example');
assert.equal(support.window.dataLayer[1][2].content_group, 'support');
support.click('https://scanapp.org/');
assert.equal(support.window.dataLayer[2][2].content_group, 'support');
for (const url of ['http://localhost:4000/blog/', 'https://copied.example/blog/']) {
  const other = fixture(url);
  assert.equal(other.scripts.length, 0);
  assert.equal(other.window.dataLayer, undefined);
}
const pdfGuide = fixture('https://scanapp.org/supports/how-to-scan-qr-code-from-pdf-document');
pdfGuide.click('https://scanapp.org/scan-qr-code-from-pdf/?private=hidden#secret');
assert.equal(pdfGuide.window.dataLayer[2][1], 'content_tool_click');
assert.equal(pdfGuide.window.dataLayer[2][2].destination_path, '/scan-qr-code-from-pdf/');
assert.equal(pdfGuide.window.dataLayer[2][2].content_group, 'support');
assert.ok(!JSON.stringify(pdfGuide.window.dataLayer).includes('hidden'));
console.log('PASS: first-party blog measurement, safe destinations, idempotency, local/copied-host exclusion');
