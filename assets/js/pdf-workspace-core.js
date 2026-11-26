/* Local PDF transformations. No storage, telemetry or network access. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('../vendor/pdf-lib/pdf-lib.min.js'));
  else root.ScanAppPDF = factory(root.PDFLib);
})(typeof self !== 'undefined' ? self : this, function (P) {
  'use strict';
  const MAX_BYTES = 40 * 1024 * 1024, MAX_PAGES = 200;
  function ranges(text, count) {
    if (!text.trim()) return Array.from({length: count}, (_, i) => i);
    const out = [];
    for (const part of text.split(',')) {
      const m = part.trim().match(/^(\d+)(?:\s*-\s*(\d+))?$/);
      if (!m) throw new Error('Use page numbers or ranges, such as 1, 3-5.');
      const a = Number(m[1]), b = Number(m[2] || m[1]);
      if (a < 1 || b < a || b > count) throw new Error('Page range is outside this document.');
      for (let n = a; n <= b; n++) if (!out.includes(n - 1)) out.push(n - 1);
    }
    return out;
  }
  async function open(bytes) {
    if (!bytes.length || bytes.length > MAX_BYTES) throw new Error('Use PDFs up to 40 MB combined.');
    let doc;
    try { doc = await P.PDFDocument.load(bytes.slice(), {updateMetadata: false}); }
    catch (_) { throw new Error('This PDF is damaged or password-protected. Use an unprotected copy.'); }
    if (doc.getPageCount() > MAX_PAGES) throw new Error('Use at most 200 pages combined.');
    const form = doc.getForm();
    if (form.hasXFA()) throw new Error('XFA forms are not supported.');
    if (form.getFields().some(f => f instanceof P.PDFSignature)) throw new Error('PDFs with digital-signature fields are not supported. Edit an unsigned copy.');
    const fields = form.getFields().map(f => {
      const base = {name: f.getName(), readonly: f.isReadOnly()};
      if (f instanceof P.PDFTextField) return {...base, type: 'text', value: f.getText() || ''};
      if (f instanceof P.PDFCheckBox) return {...base, type: 'check', value: f.isChecked()};
      if (f instanceof P.PDFDropdown || f instanceof P.PDFRadioGroup || f instanceof P.PDFOptionList)
        return {...base, type: 'choice', options: f.getOptions(), value: f.getSelected()};
      return {...base, type: 'unsupported', value: ''};
    });
    return {fields, pages: doc.getPages().map((p, index) => ({index, rotation: 0, edits: []}))};
  }
  function color(hex) { return P.rgb(...[1,3,5].map(i => parseInt(hex.slice(i,i+2),16)/255)); }
  async function build(sources, pages, fields, selected) {
    if (!pages.length) throw new Error('Keep at least one page.');
    const output = await P.PDFDocument.create(), docs = new Map();
    const indexes = selected || pages.map((_,i) => i);
    if (!indexes.length) throw new Error('Select at least one page.');
    for (const i of indexes) {
      const item = pages[i];
      if (!item) throw new Error('Selected page does not exist.');
      if (!docs.has(item.source)) {
        const doc = await P.PDFDocument.load(sources[item.source].slice(), {updateMetadata: false});
        const form = doc.getForm();
        for (const field of fields[item.source] || []) {
          if (field.readonly || field.type === 'unsupported') continue;
          const f = form.getField(field.name);
          if (field.type === 'text') f.setText(field.value);
          if (field.type === 'check') field.value ? f.check() : f.uncheck();
          if (field.type === 'choice') {
            if (Array.isArray(field.value) ? field.value.length : field.value) f.select(field.value);
            else f.clear();
          }
        }
        if (form.getFields().length) form.flatten();
        docs.set(item.source, doc);
      }
      const [page] = await output.copyPages(docs.get(item.source), [item.index]);
      output.addPage(page);
      page.setRotation(P.degrees((page.getRotation().angle + item.rotation + 360) % 360));
      for (const edit of item.edits) {
        const opts = {x:edit.x, y:edit.y, rotate:P.degrees(edit.angle || 0)};
        if (edit.type === 'text') page.drawText(edit.text, {...opts, size:edit.size, color:color(edit.color), font:await output.embedFont(P.StandardFonts.Helvetica)});
        if (edit.type === 'highlight') page.drawRectangle({...opts, width:edit.width, height:edit.height, color:color(edit.color), opacity:0.3});
        if (edit.type === 'image') {
          const image = await output.embedPng(edit.data);
          page.drawImage(image, {...opts, width:edit.width, height:edit.height});
        }
        if (edit.type === 'drawing') for (let j=1;j<edit.points.length;j++) page.drawLine({start:edit.points[j-1],end:edit.points[j],thickness:edit.size,color:color(edit.color)});
      }
    }
    return output.save();
  }
  return {open, build, ranges, MAX_BYTES, MAX_PAGES};
});
