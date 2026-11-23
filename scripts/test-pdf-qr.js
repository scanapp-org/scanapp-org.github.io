// Limits, safe links and UI failure/measurement behavior. Real rendering fixtures live in private QA evidence.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const {JSDOM} = require('jsdom');
const core = require('../assets/js/pdf-qr-core');
const path = require('node:path');
assert.equal(core.hasPdfHeader(new TextEncoder().encode('%PDF-1.7\n')),true);
assert.equal(core.hasPdfHeader(new TextEncoder().encode('not a PDF')),false);
for(const value of ['javascript:alert(1)','data:text/html,example','mailto:fixture@example.org','Reference example.org','https://example.org/ space','https://name:secret@example.org/']) assert.equal(core.safeWebUrl(value),null,value);
assert.equal(core.safeWebUrl('HTTPS://example.org/path'),'https://example.org/path');
assert.equal(core.safeWebUrl('https://example.org/?a=1#b'),'https://example.org/?a=1#b');
for(const [w,h] of [[612,792],[10000,10000],[200,100000]]) {
 const scale=core.renderScale(w,h);assert.ok(w*scale<=1800.01&&h*scale<=1800.01);assert.ok(w*h*scale*scale<=3000000.01);
}
assert.throws(()=>core.renderScale(Infinity,1));
const layout=fs.readFileSync(path.join(__dirname,'../_layouts/pdf-qr-scanner.html'),'utf8');
const source=fs.readFileSync(path.join(__dirname,'../assets/js/pdf-qr-scanner.js'),'utf8').replace("import('/assets/vendor/pdfjs/pdf.min.mjs')",'testImport()');
async function fixture(options={}) {
 const dom=new JSDOM(layout,{url:options.host||'https://scanapp.org/scan-qr-code-from-pdf/?private=hidden#secret'});
 const {window}=dom;window.ScanAppPdfQR=core;
 const events=[],copied=[],opened=[];window.gtag=(...args)=>events.push(args);window.open=(...args)=>opened.push(args);
 Object.defineProperty(window.navigator,'clipboard',{value:{writeText:async text=>{if(options.copyDenied)throw Error('blocked');copied.push(text);}}});
 window.HTMLCanvasElement.prototype.getContext=()=>({getImageData:()=>({width:1,height:1,data:new Uint8ClampedArray(4)})});
 const doc={numPages:options.pages||3,getPage:async()=>({getViewport:({scale})=>({width:100*scale,height:100*scale}),render:()=>{
   let rejectRender;
   const promise=options.renderDelay?new Promise((resolve,reject)=>{rejectRender=reject;setTimeout(resolve,80);}):Promise.resolve();
   return {promise,cancel(){if(rejectRender)rejectRender(Error('cancelled'));}};
 },cleanup(){}})};
 let destroyed=0;
 const lib={GlobalWorkerOptions:{},getDocument(){const task={destroy:async()=>{destroyed++;}};task.promise=new Promise((resolve,reject)=>queueMicrotask(()=>{if(options.encrypted)task.onPassword();else if(options.corrupt)reject(Error('bad'));else resolve(doc);}));return task;}};
 class Worker {
  postMessage(job){const finish=()=>this.onmessage({data:{id:job.id,found:!options.noQr,text:options.result||'HTTPS://example.org/private-fixture'}});if(options.decodeDelay)setTimeout(finish,80);else queueMicrotask(finish);}
  terminate(){}
 }
 const blob=new Blob(['%PDF-1.7\nsynthetic']);
 const context={window,document:window.document,navigator:window.navigator,URL,Worker,File,fetch:async()=>({ok:true,blob:async()=>blob}),performance,clearTimeout,setTimeout,Uint8Array,Number,Promise,testImport:async()=>{if(options.dependencyFail)throw Error('offline');return lib;}};
 vm.runInNewContext(source,context);
 const input=window.document.getElementById('pdf-file-input');
 const file=options.file||new File(['%PDF-1.7\nsynthetic'],'private-filename.pdf',{type:'application/pdf'});
 if(options.sample)window.document.getElementById('pdf-sample-button').click();
 else {Object.defineProperty(input,'files',{value:[file]});input.dispatchEvent(new window.Event('change'));}
 await new Promise(resolve=>setTimeout(resolve,25));
 return {window,events,copied,opened,dom,destroyed:()=>destroyed};
}
(async()=>{
 const good=await fixture();
 assert.equal(good.window.document.getElementById('pdf-result-text').value,'HTTPS://example.org/private-fixture');
 assert.equal(good.window.document.getElementById('pdf-open-link').tagName,'BUTTON');
 assert.equal(good.window.document.getElementById('pdf-open-link').hasAttribute('href'),false);
 good.window.document.getElementById('pdf-open-link').click();assert.deepEqual(good.opened,[['https://example.org/private-fixture','_blank','noopener,noreferrer']]);
 good.window.document.getElementById('pdf-copy-button').click();await new Promise(r=>setTimeout(r,0));assert.deepEqual(good.copied,['HTTPS://example.org/private-fixture']);
 assert.ok(good.events.some(x=>x[1]==='pdf_qr_scan_result'&&x[2].outcome==='found'&&!x[2].is_sample));
 for(const text of ['private-filename','private-fixture','hidden','secret','%PDF'])assert.ok(!JSON.stringify(good.events).includes(text),text);
 good.dom.window.close();
 const sample=await fixture({sample:true});assert.ok(sample.events.length>0&&sample.events.every(x=>x[2].is_sample));sample.dom.window.close();
 const other=await fixture({host:'http://localhost:8767/scan-qr-code-from-pdf/'});assert.equal(other.events.length,0);other.dom.window.close();
 const noCode=await fixture({noQr:true});assert.equal(noCode.window.document.getElementById('pdf-no-result').hidden,false);assert.equal(noCode.window.document.getElementById('pdf-result-section').hidden,true);noCode.dom.window.close();
 const text=await fixture({result:'javascript:fixture()'});assert.equal(text.window.document.getElementById('pdf-open-link').hidden,true);text.dom.window.close();
 for(const [options,message] of [[{encrypted:true},/Password-protected/],[{pages:201},/200 pages/],[{corrupt:true},/could not be opened/],[{dependencyFail:true},/could not load/],[{file:new File(['not pdf'],'secret-name.pdf')},/not a readable PDF/],[{file:{size:core.maxBytes+1}},/20 MB/]]) {
  const f=await fixture(options);assert.match(f.window.document.getElementById('pdf-status').textContent,message);assert.equal(f.window.document.getElementById('pdf-workspace').hidden,true);f.dom.window.close();
 }
 const denied=await fixture({copyDenied:true});denied.window.document.getElementById('pdf-copy-button').click();await new Promise(r=>setTimeout(r,0));assert.match(denied.window.document.getElementById('pdf-result-status').textContent,/Couldn’t copy/);denied.dom.window.close();
 for(const delayed of [{renderDelay:true},{decodeDelay:true}]) {
  const stale=await fixture(delayed);stale.window.document.getElementById('pdf-reset-button').click();await new Promise(r=>setTimeout(r,100));
  assert.equal(stale.window.document.getElementById('pdf-workspace').hidden,true);
  assert.equal(stale.window.document.getElementById('pdf-drop-zone').hidden,false);
  assert.equal(stale.events.filter(x=>x[1]==='pdf_qr_scan_result').length,0);
  assert.equal(stale.destroyed(),1);stale.dom.window.close();
 }
 console.log('PASS: PDF input limits, protected/corrupt/dependency errors, safe URLs, result/no-code UI, sample exclusion, host/payload privacy and copy outcomes');
})().catch(error=>{console.error(error);process.exitCode=1;});
