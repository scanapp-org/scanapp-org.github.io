/* Real PDF round trips and isolated offline service-worker behavior. */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const P=require('../assets/vendor/pdf-lib/pdf-lib.min.js'),Core=require('../assets/js/pdf-workspace-core');
(async()=>{
  const a=await P.PDFDocument.create();
  for(let i=0;i<3;i++){const p=a.addPage([400+i*10,600]);p.drawText('Original page '+i,{x:40,y:500});}
  const form=a.getForm(), field=form.createTextField('Name');field.addToPage(a.getPage(0),{x:40,y:400,width:160,height:30});
  const check=form.createCheckBox('Agree');check.addToPage(a.getPage(0),{x:40,y:350,width:15,height:15});
  const choice=form.createDropdown('Choice');choice.addOptions(['First','Second']);choice.addToPage(a.getPage(0),{x:40,y:300,width:120,height:25});
  const ab=await a.save(), ai=await Core.open(ab);assert.equal(ai.pages.length,3);assert.equal(ai.fields.length,3);
  ai.fields.find(f=>f.name==='Name').value='Round trip';ai.fields.find(f=>f.name==='Agree').value=true;ai.fields.find(f=>f.name==='Choice').value='Second';
  const b=await P.PDFDocument.create();b.addPage([300,300]).drawText('Merged document',{x:20,y:200});const bb=await b.save();
  const pages=[{...ai.pages[2],source:0,rotation:90},{...ai.pages[0],source:0,edits:[{type:'text',text:'Added note',x:30,y:200,size:16,color:'#174b41'},{type:'highlight',x:30,y:160,width:150,height:20,color:'#ffff00'},{type:'drawing',points:[{x:30,y:140},{x:100,y:150}],size:2,color:'#000000'}]},{source:1,index:0,rotation:0,edits:[]}];
  const out=await Core.build([ab,bb],pages,[ai.fields,[]]),reopened=await P.PDFDocument.load(out);
  assert.equal(reopened.getPageCount(),3);assert.equal(reopened.getPage(0).getWidth(),420);assert.equal(reopened.getPage(0).getRotation().angle,90);assert.equal(reopened.getPage(1).getWidth(),400);assert.equal(reopened.getPage(2).getWidth(),300);assert.equal(reopened.getForm().getFields().length,0);
  const subset=await P.PDFDocument.load(await Core.build([ab,bb],pages,[ai.fields,[]],Core.ranges('3,1',3)));assert.equal(subset.getPageCount(),2);assert.equal(subset.getPage(0).getWidth(),300);assert.equal(subset.getPage(1).getWidth(),420);
  assert.deepEqual(Core.ranges('1, 2-3,2',3),[0,1,2]);for(const value of ['0','4','2-1','one','1.5','-1','1-999'])assert.throws(()=>Core.ranges(value,3));
  await assert.rejects(()=>Core.open(new Uint8Array([1,2,3])),/damaged/);
  await assert.rejects(()=>Core.build([ab],[],[ai.fields]),/at least one/);
  const signed=await P.PDFDocument.create();signed.addPage();
  signed.getForm().acroForm.addField(signed.context.register(signed.context.obj({FT:'Sig',T:P.PDFHexString.fromText('Signature'),Kids:[]})));
  const signedBytes=await signed.save();await assert.rejects(()=>Core.open(signedBytes),/signature/);
  const imageOnly=await P.PDFDocument.create();imageOnly.addPage([200,200]);const imageBytes=await imageOnly.save();
  const imageResult=await P.PDFDocument.load(await Core.build([imageBytes],[{source:0,index:0,rotation:0,edits:[{type:'image',data:fs.readFileSync('assets/icons/pwa-192x192.png'),x:20,y:20,width:80,height:80}]}],[[]]));
  assert.ok(imageResult.getPage(0).node.Resources().lookup(P.PDFName.of('XObject'),P.PDFDict).keys().length>0,'export contains embedded image');
  fs.mkdirSync('_reports/pdf-editor-qa',{recursive:true});fs.writeFileSync('_reports/pdf-editor-qa/roundtrip.pdf',out);fs.writeFileSync('_reports/pdf-editor-qa/input-a.pdf',ab);fs.writeFileSync('_reports/pdf-editor-qa/input-b.pdf',bb);
  // Actual worker code with network unavailable: cached assets still respond;
  // user data, foreign hosts and other cache namespaces are never claimed.
  const handlers={},deleted=[],keys=new Map([['/pdf-tools/',{body:'cached page'}]]);
  const cache={addAll:async()=>{},match:async path=>keys.get(typeof path==='string'?path:path.url)};
  const self={PDF_OFFLINE_ASSETS:['/pdf-tools/'],location:{origin:'https://scanapp.org'},addEventListener:(n,f)=>handlers[n]=f,skipWaiting:async()=>{},clients:{claim:async()=>{}}};
  vm.runInNewContext(fs.readFileSync('pdf-tools/sw.js','utf8'),{self,importScripts(){},caches:{open:async()=>cache,keys:async()=>['scanapp-pdf-workspace-old','scanner:static','other-app'],delete:async k=>deleted.push(k)},URL,fetch:async()=>{throw Error('network offline');},Promise});
  let pending;handlers.activate({waitUntil:p=>pending=p});await pending;assert.deepEqual(deleted,['scanapp-pdf-workspace-old']);
  let response;handlers.fetch({request:{url:'https://scanapp.org/pdf-tools/',method:'GET'},respondWith:p=>response=p});assert.equal((await response).body,'cached page');
  for(const [url,method] of [['https://scanapp.org/customer.pdf','GET'],['https://other.test/pdf-tools/','GET'],['https://scanapp.org/pdf-tools/','POST']])handlers.fetch({request:{url,method},respondWith(){throw Error('must not intercept');}});
  const rootHandlers={},rootDeleted=[],rootContext={caches:{keys:async()=>['v2.6.0.1:static','v2.5.0:static','scanapp-pdf-workspace-v1','unrelated-cache'],delete:async k=>rootDeleted.push(k)}};
  rootContext.self=rootContext;rootContext.addEventListener=(n,f)=>rootHandlers[n]=f;
  vm.runInNewContext(fs.readFileSync('sw.js','utf8'),rootContext);rootHandlers.activate({waitUntil:p=>pending=p});await pending;
  assert.deepEqual(rootDeleted,['v2.5.0:static'],'root worker preserves PDF and unrelated caches');
  console.log('PDF merge/order/rotation/annotations/form flatten/extraction/ranges/error and offline isolation tests passed.');
})().catch(e=>{console.error(e);process.exitCode=1;});
