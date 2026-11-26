import * as renderer from '/assets/vendor/pdfjs/pdf.min.mjs';
renderer.GlobalWorkerOptions.workerSrc = '/assets/vendor/pdfjs/pdf.worker.min.mjs';
const Core = window.ScanAppPDF, $ = id => document.getElementById(id);
let sources = [], state = {pages:[],fields:[]}, current = 0, past = [], future = [], busy = false, viewport, previewDoc, previewLoading, renderTask, imageData, stroke, clearArmed=false;
const clone = value => JSON.parse(JSON.stringify(value));
const message = text => { $('workspace-status').textContent = text; };
function remember() { clearArmed=false;$('clear-pdfs').textContent='Clear';past.push(clone(state)); if(past.length>30) past.shift(); future=[]; }
function track(name) { try { if(location.hostname==='scanapp.org' && typeof window.gtag==='function') window.gtag('event',name,{content_group:'pdf_tools',tool_family:'pdf_editor',is_sample:!!window.pdfWorkspaceSample}); } catch (_) {} }
async function run(job) {
  if(busy) return;
  busy=true; document.querySelectorAll('#editor-workspace button,#editor-workspace input,#editor-workspace select,#editor-workspace textarea,#open-pdfs,#try-pdf').forEach(e=>e.disabled=true);
  try { await job(); } catch(e) { message(e.message || 'This operation could not be completed. Your original file is unchanged.'); }
  finally { busy=false; document.querySelectorAll('#editor-workspace button,#editor-workspace input,#editor-workspace select,#editor-workspace textarea,#open-pdfs,#try-pdf').forEach(e=>e.disabled=e.dataset.readonly==='true'); $('undo-edit').disabled=!past.length; $('redo-edit').disabled=!future.length; }
}
async function refresh() {
  $('editor-workspace').hidden=!state.pages.length;
  if(!state.pages.length) return;
  current=Math.max(0,Math.min(current,state.pages.length-1));
  $('page-total').textContent=state.pages.length;
  $('page-number').value=current+1; $('page-number').max=state.pages.length;
  const list=$('page-list'); list.replaceChildren();
  state.pages.forEach((p,i)=>{
    const button=document.createElement('button'); button.type='button'; button.className='page-tile'; button.setAttribute('aria-current',String(i===current));
    const title=document.createElement('strong'); title.textContent='Page '+(i+1);
    const detail=document.createElement('span'); detail.textContent='Document '+(p.source+1)+' · original '+(p.index+1)+(p.rotation?' · rotated':'')+(p.edits.length?' · edited':'');
    button.append(title,detail); button.onclick=()=>run(async()=>{current=i;await refresh();}); list.append(button);
  });
  await showForms();
  const bytes=await Core.build(sources,state.pages,state.fields,[current]);
  if(previewLoading) await previewLoading.destroy();
  previewLoading=renderer.getDocument({data:bytes,isEvalSupported:false,enableXfa:false,cMapUrl:'/assets/vendor/pdfjs/cmaps/',cMapPacked:true,standardFontDataUrl:'/assets/vendor/pdfjs/standard_fonts/',wasmUrl:'/assets/vendor/pdfjs/wasm/',iccUrl:'/assets/vendor/pdfjs/iccs/'});
  previewDoc=await previewLoading.promise;
  const page=await previewDoc.getPage(1), base=page.getViewport({scale:1});
  viewport=page.getViewport({scale:Math.min(1.6,1100/base.width,1600/base.height)});
  const canvas=$('pdf-page'), overlay=$('edit-layer');
  canvas.width=overlay.width=Math.ceil(viewport.width); canvas.height=overlay.height=Math.ceil(viewport.height);
  renderTask=page.render({canvasContext:canvas.getContext('2d'),viewport}); await renderTask.promise;
  $('page-caption').textContent='Page '+(current+1)+' of '+state.pages.length;
}
async function showForms() {
  const area=$('form-fields'); area.replaceChildren();
  const source=state.pages[current].source, fields=state.fields[source];
  if(!fields.length) { area.textContent='This document has no supported interactive fields. Use Add text to write on a flat form.'; return; }
  fields.forEach((f,i)=>{
    const label=document.createElement('label'), text=document.createElement('span'); text.textContent=f.name; label.append(text);
    let input;
    if(f.type==='unsupported') { const note=document.createElement('small'); note.textContent='Unsupported field'; label.append(note);area.append(label);return; }
    if(f.type==='choice') {
      input=document.createElement('select'); const empty=document.createElement('option');empty.value='';empty.textContent='Select…';input.append(empty);
      f.options.forEach(v=>{const opt=document.createElement('option'); opt.value=v;opt.textContent=v;input.append(opt);}); input.value=Array.isArray(f.value)?f.value[0]||'':f.value||'';
    } else { input=document.createElement('input'); input.type=f.type==='check'?'checkbox':'text'; if(f.type==='check') input.checked=f.value; else input.value=f.value; }
    input.disabled=f.readonly; input.dataset.readonly=String(f.readonly);
    input.onchange=()=>run(async()=>{ remember();state.fields[source][i].value=f.type==='check'?input.checked:input.value;await refresh();message('Form updated. Export flattens filled fields into the PDF.'); });
    label.append(input);area.append(label);
  });
}
async function addFiles(files) {
  const pending=[], pages=[], fields=[]; let total=sources.reduce((n,b)=>n+b.length,0), count=state.pages.length;
  for(const file of files) {
    total+=file.size; if(total>Core.MAX_BYTES) throw new Error('Use at most 40 MB combined. Clear this workspace to start again.');
    const bytes=new Uint8Array(await file.arrayBuffer()), info=await Core.open(bytes);count+=info.pages.length;
    if(count>Core.MAX_PAGES) throw new Error('Use at most 200 pages combined.');
    const source=sources.length+pending.length;pending.push(bytes);fields.push(info.fields);pages.push(...info.pages.map(p=>({...p,source})));
  }
  if(!pending.length) return;
  if(state.pages.length)remember(); const offset=sources.length; sources.push(...pending);fields.forEach((f,i)=>state.fields[offset+i]=f);state.pages.push(...pages);await refresh();message('PDF loaded. Select pages, edit, then download your result.');track('pdf_editor_open');
}
function download(bytes,name,type) {
  const url=URL.createObjectURL(new Blob([bytes],{type}));const link=document.createElement('a');link.href=url;link.download=name;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
}
async function exportPDF() {
  const chosen=Core.ranges($('page-range').value,state.pages.length);
  const bytes=await Core.build(sources,state.pages,state.fields,chosen);
  const reopened=await window.PDFLib.PDFDocument.load(bytes.slice());
  if(reopened.getPageCount()!==chosen.length) throw new Error('The export could not be verified. Please try again.');
  download(bytes,'scanapp-edited.pdf','application/pdf');message('Edited PDF prepared and checked. Open the downloaded file to review your changes.');track('pdf_editor_export');
}
$('open-pdfs').onclick=()=>$('pdf-input').click();
$('pdf-input').onchange=event=>run(async()=>{window.pdfWorkspaceSample=false;await addFiles(Array.from(event.target.files));event.target.value='';});
$('add-pdfs').onclick=()=>$('pdf-input').click();
$('try-pdf').onclick=()=>run(async()=>{
  const doc=await window.PDFLib.PDFDocument.create();
  for(let i=1;i<=3;i++){const p=doc.addPage([595,842]);p.drawText('ScanApp sample · page '+i,{x:50,y:760,size:24});p.drawText('Try adding a note, rotating or moving this page.',{x:50,y:710,size:14});}
  const field=doc.getForm().createTextField('Your name');field.addToPage(doc.getPage(0),{x:50,y:620,width:250,height:30});
  const bytes=await doc.save();window.pdfWorkspaceSample=true;await addFiles([new File([bytes],'sample.pdf',{type:'application/pdf'})]);
});
$('download-pdf').onclick=()=>run(exportPDF);
$('page-number').onchange=()=>run(async()=>{const i=Number($('page-number').value)-1;if(!Number.isInteger(i)||i<0||i>=state.pages.length)throw new Error('Choose an existing page.');current=i;await refresh();});
for(const [id,action] of Object.entries({
  'rotate-page':()=>{state.pages[current].rotation=(state.pages[current].rotation+90)%360;},
  'delete-page':()=>{if(state.pages.length===1)throw new Error('Keep at least one page.');state.pages.splice(current,1);},
  'move-before':()=>{if(current>0){[state.pages[current-1],state.pages[current]]=[state.pages[current],state.pages[current-1]];current--;}},
  'move-after':()=>{if(current<state.pages.length-1){[state.pages[current+1],state.pages[current]]=[state.pages[current],state.pages[current+1]];current++;}}
})) $(id).onclick=()=>run(async()=>{remember();action();await refresh();message('Page layout updated.');});
$('undo-edit').onclick=()=>run(async()=>{if(!past.length)return;future.push(clone(state));state=past.pop();await refresh();message('Undone.');});
$('redo-edit').onclick=()=>run(async()=>{if(!future.length)return;past.push(clone(state));state=future.pop();await refresh();message('Redone.');});
$('clear-pdfs').onclick=()=>{
  if(!clearArmed){clearArmed=true;$('clear-pdfs').textContent='Confirm clear';message('Unsaved edits will be lost. Select Confirm clear to empty the workspace, or keep editing. Your originals are unchanged.');return;}
  run(async()=>{sources=[];state={pages:[],fields:[]};past=[];future=[];imageData=null;clearArmed=false;$('clear-pdfs').textContent='Clear';if(previewLoading){await previewLoading.destroy();previewLoading=null;previewDoc=null;}await refresh();message('Workspace cleared.');});
};
$('image-input').onchange=event=>run(async()=>{
  const file=event.target.files[0];if(!file)return;
  if(file.size>5*1024*1024 || !['image/png','image/jpeg','image/webp'].includes(file.type))throw new Error('Use a PNG, JPG or WebP image up to 5 MB.');
  const img=await createImageBitmap(file);if(img.width*img.height>16000000){img.close();throw new Error('Use an image smaller than 16 megapixels.');}
  const c=document.createElement('canvas');c.width=img.width;c.height=img.height;c.getContext('2d').drawImage(img,0,0);img.close();imageData={data:c.toDataURL('image/png'),ratio:c.height/c.width};$('edit-mode').value='image';message('Image ready. Click the page to place it.');event.target.value='';
});
function pointer(event){const r=$('edit-layer').getBoundingClientRect();return {x:(event.clientX-r.left)*$('edit-layer').width/r.width,y:(event.clientY-r.top)*$('edit-layer').height/r.height};}
function pdfPoint(p){const [x,y]=viewport.convertToPdfPoint(p.x,p.y);return{x,y};}
function placeEdit(point) {
  const mode=$('edit-mode').value;
  if(!['text','highlight','image'].includes(mode)){message('Select Add text, Highlight or Place image to position an edit.');return;}
  return run(async()=>{
    const size=Number($('text-size').value), width=Number($('edit-width').value), color=$('edit-color').value;
    if(!Number.isFinite(size)||size<8||size>72||!Number.isFinite(width)||width<10||width>500)throw new Error('Use text size 8–72 and width 10–500 points.');
    let edit={type:mode,color,size,angle:viewport.rotation};
    if(mode==='text'){const text=$('edit-text').value;if(!text.trim())throw new Error('Enter text before placing it.');if(!/^[\x20-\x7e\n\r\t\u00a0-\u00ff]*$/.test(text))throw new Error('Added text currently supports Western European characters.');edit={...edit,...pdfPoint(point),text};}
    if(mode==='highlight')edit={...edit,...pdfPoint({x:point.x,y:point.y+24*viewport.scale}),width,height:24};
    if(mode==='image'){if(!imageData)throw new Error('Choose an image first.');edit={...edit,...pdfPoint({x:point.x,y:point.y+width*imageData.ratio*viewport.scale}),width,height:width*imageData.ratio,data:imageData.data};}
    remember();state.pages[current].edits.push(edit);await refresh();message('Added to page. Undo removes the last edit.');
  });
}
$('place-edit').onclick=()=>{
  if(!viewport||busy)return;
  const x=Number($('position-x').value),y=Number($('position-y').value);
  if(!Number.isFinite(x)||!Number.isFinite(y)||x<0||x>100||y<0||y>100){message('Use positions from 0 to 100 percent.');return;}
  placeEdit({x:viewport.width*x/100,y:viewport.height*y/100});
};
$('edit-layer').onpointerdown=event=>{
  if(busy||!viewport||$('edit-mode').value==='select')return;
  const mode=$('edit-mode').value, point=pointer(event);
  if(mode==='draw'||mode==='signature') {stroke=[point];$('edit-layer').setPointerCapture(event.pointerId);event.preventDefault();return;}
  placeEdit(point);
};
$('edit-layer').onpointermove=event=>{
  if(!stroke)return;const p=pointer(event),old=stroke[stroke.length-1];stroke.push(p);const ctx=$('edit-layer').getContext('2d');ctx.strokeStyle=$('edit-color').value;ctx.lineWidth=2*viewport.scale;ctx.beginPath();ctx.moveTo(old.x,old.y);ctx.lineTo(p.x,p.y);ctx.stroke();
};
function finishStroke(){if(!stroke)return;const points=stroke.map(pdfPoint);stroke=null;if(points.length<2)return;run(async()=>{remember();state.pages[current].edits.push({type:'drawing',points,size:2,color:$('edit-color').value});await refresh();message('Drawing added. A drawn signature is not a digital certificate.');});}
$('edit-layer').onpointerup=finishStroke;
$('edit-layer').onpointercancel=()=>{stroke=null;$('edit-layer').getContext('2d').clearRect(0,0,$('edit-layer').width,$('edit-layer').height);};
$('edit-mode').onchange=()=>{$('edit-layer').style.touchAction=['draw','signature'].includes($('edit-mode').value)?'none':'auto';message('Choose settings, then click or draw on the preview. Existing PDF text is not replaced.');};
$('export-image').onclick=()=>run(async()=>{
  const format=$('image-format').value,bytes=await Core.build(sources,state.pages,state.fields,[current]);
  const loading=renderer.getDocument({data:bytes,isEvalSupported:false,cMapUrl:'/assets/vendor/pdfjs/cmaps/',cMapPacked:true,standardFontDataUrl:'/assets/vendor/pdfjs/standard_fonts/',wasmUrl:'/assets/vendor/pdfjs/wasm/',iccUrl:'/assets/vendor/pdfjs/iccs/'});const doc=await loading.promise;
  try{const page=await doc.getPage(1),base=page.getViewport({scale:1}),v=page.getViewport({scale:Math.min(2,2400/Math.max(base.width,base.height))});const c=document.createElement('canvas');c.width=Math.ceil(v.width);c.height=Math.ceil(v.height);await page.render({canvasContext:c.getContext('2d'),viewport:v,background:'white'}).promise;const blob=await new Promise(resolve=>c.toBlob(resolve,'image/'+format,0.92));if(!blob)throw new Error('Image export failed.');download(blob,'scanapp-page-'+(current+1)+(format==='jpeg'?'.jpg':'.png'),'image/'+format);message('Selected page exported as an image.');track('pdf_editor_image_export');}finally{await loading.destroy();}
});
let offlineRegistration, offlineChecks=0;
$('enable-offline').onclick=async()=>{
  if(!('serviceWorker' in navigator)){ $('offline-status').textContent='Offline installation is unavailable in this browser. Editing still works while this page is open.';return; }
  offlineChecks=0;$('enable-offline').disabled=true;$('offline-status').textContent='Preparing offline files. Keep this tab open…';
  try { offlineRegistration=await navigator.serviceWorker.register('/pdf-tools/sw.js',{scope:'/pdf-tools/'});await checkOffline(); }
  catch(_){$('offline-status').textContent='Offline setup failed. Check your connection and available storage, then retry.';$('enable-offline').disabled=false;}
};
async function checkOffline(){
  if(!offlineRegistration)return;
  if(++offlineChecks>60){$('offline-status').textContent='Offline setup did not complete. Check storage and connection, then retry.';$('enable-offline').disabled=false;return;}
  if(offlineRegistration.active){const channel=new MessageChannel();channel.port1.onmessage=e=>{if(e.data.ready){$('offline-status').textContent='Ready offline. Bookmark this page. Browser storage cleanup may remove offline files; documents are never saved here.';$('enable-offline').disabled=true;}else{setTimeout(checkOffline,1000);}};offlineRegistration.active.postMessage({type:'offline-status'},[channel.port2]);}
  else setTimeout(checkOffline,1000);
}
$('workspace-loading').hidden=true;message('Ready. Open PDFs or try the sample.');
if('serviceWorker' in navigator) navigator.serviceWorker.getRegistration('/pdf-tools/').then(r=>{if(r&&r.scope.endsWith('/pdf-tools/')){offlineRegistration=r;checkOffline();}}).catch(()=>{});
// Optional aggregate measurement; no documents, names or content in event fields.
if(location.hostname==='scanapp.org' && navigator.onLine){
  window.dataLayer=window.dataLayer||[];window.gtag=window.gtag||function(){window.dataLayer.push(arguments);};
  window.gtag('js',new Date());window.gtag('config','G-2KZEP7DPYH',{content_group:'pdf_tools',page_location:location.origin+location.pathname,page_title:document.title});
  const analytics=document.createElement('script');analytics.async=true;analytics.src='https://www.googletagmanager.com/gtag/js?id=G-2KZEP7DPYH';document.head.append(analytics);
}
