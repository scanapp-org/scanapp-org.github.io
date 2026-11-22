// Contact measurement behavior and payload boundaries; no network or dependencies.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../assets/js/contact-analytics.js'), 'utf8');

function fixture(url, options = {}) {
  const location = new URL(url), listeners = [], scripts = [], calls = [];
  const existingGtag = options.existingGtag ? (...args) => calls.push(args) : undefined;
  const window = { location, gtag: existingGtag };
  const document = {
    referrer: options.referrer || '',
    addEventListener(name, fn) { assert.equal(name, 'click'); listeners.push(fn); },
    querySelector(selector) {
      assert.ok(selector.includes('googletagmanager.com/gtag/js?id=G-2KZEP7DPYH'));
      return options.existingAnalytics || scripts.length ? {} : null;
    },
    createElement(tag) { assert.equal(tag, 'script'); return {}; },
    head: { appendChild(script) { scripts.push(script); } }
  };
  const context = vm.createContext({ window, document, URL, Date });
  const run = () => vm.runInContext(source, context);
  run();
  return {
    window, scripts, listeners, existingGtag, run,
    calls() { return options.existingGtag ? calls : Array.from(window.dataLayer || [], x => Array.from(x)); },
    click(href, classes = [], options = {}) {
      const anchor = { href, classList: { contains: value => classes.includes(value) },
        getAttribute: name => { assert.equal(name, 'data-contact-placement'); return options.placement || null; } };
      const element = { closest: selector => { assert.equal(selector, 'a[href]'); return options.noAnchor ? null : anchor; } };
      const target = options.textNode ? { nodeType: 3, parentElement: element } : element;
      const event = { target, defaultPrevented: !!options.prevented,
        preventDefault() { throw new Error('Analytics must not intercept navigation'); } };
      listeners.forEach(fn => fn(event));
    }
  };
}

for (const url of ['http://localhost:8766/contact/', 'https://copied.example/contact/', 'https://scanapp.org.attacker.example/contact/']) {
  const f = fixture(url);
  assert.equal(f.listeners.length, 0);
  assert.equal(f.scripts.length, 0);
  assert.equal(f.window.dataLayer, undefined);
}

// Existing page families retain responsibility for loading and configuring GA.
for (const pagePath of ['/', '/generate/', '/id/', '/image-compressor/', '/supports/example', '/blog/2026/05/24/example.html']) {
  const f = fixture('https://scanapp.org' + pagePath + '?private=hidden#secret', { existingGtag: true });
  assert.equal(f.scripts.length, 0);
  assert.equal(f.window.gtag, f.existingGtag);
  assert.equal(f.calls().length, 0);
  f.click('/contact/?private=hidden#secret', ['scanapp-contact-link'], { textNode: true });
  const [kind, name, payload] = f.calls()[0];
  assert.equal(kind, 'event'); assert.equal(name, 'contact_link_click');
  assert.equal(payload.page_path, pagePath);
  assert.equal(payload.page_location, 'https://scanapp.org' + pagePath);
  assert.equal(payload.destination_path, '/contact/');
  assert.equal(payload.link_placement, 'footer');
  assert.ok(!JSON.stringify(f.calls()).includes('hidden'));
  assert.ok(!JSON.stringify(f.calls()).includes('secret'));
}

// A page without a tag queues a safe event without introducing another loader.
for (const placement of ['sidebar', 'settings', 'untrusted-private-value']) {
  const f = fixture('https://scanapp.org/');
  f.click('/contact/', ['scanapp-contact-link'], { placement });
  assert.equal(f.calls()[0][2].link_placement, placement === 'untrusted-private-value' ? 'footer' : placement);
}

const queued = fixture('https://scanapp.org/demo/example');
queued.click('/contact/', ['scanapp-contact-link']);
assert.equal(queued.scripts.length, 0);
assert.equal(queued.calls()[0][1], 'contact_link_click');
queued.run();
assert.equal(queued.listeners.length, 1);
queued.click('/contact/', ['scanapp-contact-link']);
assert.equal(queued.calls().length, 2);

const contact = fixture('https://scanapp.org/contact/?private=hidden#secret', {
  referrer: 'https://example.org/guide?email=private@example.org#private'
});
assert.equal(contact.scripts.length, 1);
assert.equal(contact.scripts[0].async, true);
assert.equal(contact.scripts[0].src, 'https://www.googletagmanager.com/gtag/js?id=G-2KZEP7DPYH');
assert.equal(contact.calls().length, 2);
assert.equal(contact.calls()[1][0], 'config');
assert.equal(contact.calls()[1][1], 'G-2KZEP7DPYH');
assert.equal(contact.calls()[1][2].content_group, 'contact');
assert.equal(contact.calls()[1][2].page_location, 'https://scanapp.org/contact/');
assert.equal(contact.calls()[1][2].page_path, '/contact/');
assert.equal(contact.calls()[1][2].page_referrer, 'https://example.org/guide');
contact.click('mailto:private@example.org?subject=private&body=decoded-secret', ['contact-page-address']);
contact.click('mailto:private@example.org?subject=private&body=decoded-secret', ['contact-page-email-button']);
assert.equal(contact.calls()[2][1], 'contact_email_click');
assert.equal(contact.calls()[2][2].link_type, 'address');
assert.equal(contact.calls()[3][2].link_type, 'button');
for (const forbidden of ['hidden', 'secret', 'private@example.org', 'mailto:', 'subject=', 'body=']) {
  assert.ok(!JSON.stringify(contact.calls()).includes(forbidden), forbidden);
}
contact.run();
assert.equal(contact.calls().length, 4);
assert.equal(contact.listeners.length, 1);
assert.equal(contact.scripts.length, 1);

// Only the intended same-origin footer links and contact email controls count.
const before = contact.calls().length;
contact.click('https://elsewhere.example/contact/', ['scanapp-contact-link']);
contact.click('/support/', ['scanapp-contact-link']);
contact.click('/contact/', []);
contact.click('mailto:private@example.org', []);
contact.click('/contact/', ['scanapp-contact-link'], { prevented: true });
contact.click('/contact/', ['scanapp-contact-link'], { noAnchor: true });
contact.click('https://example.org/', ['contact-page-email-button']);
assert.equal(contact.calls().length, before);
const elsewhereEmail = fixture('https://scanapp.org/');
elsewhereEmail.click('mailto:private@example.org', ['contact-page-email-button']);
assert.equal(elsewhereEmail.calls().length, 0);
const preloaded = fixture('https://scanapp.org/contact', { existingAnalytics: true, existingGtag: true, referrer: 'invalid URL' });
assert.equal(preloaded.scripts.length, 0);
assert.equal(preloaded.calls()[1][2].page_referrer, '');

console.log('PASS: contact views/clicks, payload privacy, host scope, existing tags, idempotency and normal navigation');
