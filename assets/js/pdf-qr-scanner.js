(function () {
  'use strict';
  var core = window.ScanAppPdfQR;
  var input = document.getElementById('pdf-file-input');
  if (!input || !core) return;
  var byId = function (id) { return document.getElementById(id); };
  var status = byId('pdf-status'), workspace = byId('pdf-workspace'), canvas = byId('pdf-preview');
  var pageNumber = byId('pdf-page-number'), previous = byId('pdf-prev-page'), next = byId('pdf-next-page');
  var scanButton = byId('pdf-scan-button'), sampleButton = byId('pdf-sample-button'), drop = byId('pdf-drop-zone');
  var resultSection = byId('pdf-result-section'), resultText = byId('pdf-result-text'), copyButton = byId('pdf-copy-button');
  var openLink = byId('pdf-open-link'), resultStatus = byId('pdf-result-status'), noResult = byId('pdf-no-result');
  var pdf = null, loadingTask = null, renderTask = null, decoder = null, pendingDecode = null;
  var generation = 0, decodeId = 0, busy = false, isSample = false, selectedPage = 1, currentText = null;
  var pdfLibrary = null;
  var eventNames = ['pdf_qr_file_selected', 'pdf_qr_document_ready', 'pdf_qr_scan_start', 'pdf_qr_scan_result', 'pdf_qr_failure', 'pdf_qr_copy_result', 'pdf_qr_link_open'];
  function track(name, params) {
    if (window.location.hostname !== 'scanapp.org' || typeof window.gtag !== 'function' || eventNames.indexOf(name) < 0) return;
    var safe = { page_path: '/scan-qr-code-from-pdf/', content_group: 'pdf_tools', tool_variant: 'scan-qr-code-from-pdf', is_sample: isSample };
    ['outcome', 'reason', 'size_bucket', 'page_count_bucket', 'duration_bucket'].forEach(function (key) {
      if (params && typeof params[key] === 'string') safe[key] = params[key];
    });
    try { window.gtag('event', name, safe); } catch (error) { /* Keep the task independent of analytics. */ }
  }
  function setStatus(message, error) {
    status.textContent = message;
    status.classList.toggle('error', !!error);
  }
  function updateControls() {
    pageNumber.disabled = busy || !pdf;
    scanButton.disabled = busy || !pdf;
    previous.disabled = busy || !pdf || selectedPage <= 1;
    next.disabled = busy || !pdf || selectedPage >= pdf.numPages;
    workspace.setAttribute('aria-busy', String(busy));
  }
  function clearResult() {
    currentText = null;
    resultText.value = '';
    resultStatus.textContent = '';
    resultSection.hidden = true;
    noResult.hidden = true;
    openLink.hidden = true;
    openLink.removeAttribute('href');
    copyButton.disabled = false;
  }
  function stopDecode() {
    if (decoder) { decoder.terminate(); decoder = null; }
    if (pendingDecode) { var old = pendingDecode; pendingDecode = null; clearTimeout(old.timer); old.reject(new Error('cancelled')); }
  }
  function dispose() {
    generation++;
    if (renderTask) { renderTask.cancel(); renderTask = null; }
    stopDecode();
    if (loadingTask) { loadingTask.destroy().catch(function () {}); loadingTask = null; }
    pdf = null;
    busy = false;
    selectedPage = 1;
    canvas.width = canvas.height = 1;
    workspace.hidden = true;
    drop.hidden = false;
    pageNumber.value = '1';
    byId('pdf-page-count').textContent = '0';
    clearResult();
    updateControls();
  }
  async function getLibrary() {
    if (!pdfLibrary) {
      pdfLibrary = import('/assets/vendor/pdfjs/pdf.min.mjs').then(function (library) {
        library.GlobalWorkerOptions.workerSrc = '/assets/vendor/pdfjs/pdf.worker.min.mjs';
        return library;
      }).catch(function () { pdfLibrary = null; throw new Error('dependency_error'); });
    }
    return pdfLibrary;
  }
  function decode(image) {
    return new Promise(function (resolve, reject) {
      try {
        if (!decoder) {
          decoder = new Worker('/assets/js/pdf-qr-worker.js?v=20261122');
          decoder.onmessage = function (event) {
            if (!pendingDecode || event.data.id !== pendingDecode.id) return;
            var done = pendingDecode; pendingDecode = null; clearTimeout(done.timer);
            if (event.data.error) done.reject(new Error('decode_error'));
            else done.resolve(event.data);
          };
          decoder.onerror = function () {
            if (pendingDecode) { var failed = pendingDecode; pendingDecode = null; clearTimeout(failed.timer); failed.reject(new Error('decode_error')); }
            if (decoder) { decoder.terminate(); decoder = null; }
          };
        }
        var id = ++decodeId;
        pendingDecode = { id: id, resolve: resolve, reject: reject, timer: setTimeout(function () {
          var expired = pendingDecode; pendingDecode = null;
          if (decoder) { decoder.terminate(); decoder = null; }
          if (expired) expired.reject(new Error('decode_error'));
        }, 30000) };
        decoder.postMessage({ id: id, width: image.width, height: image.height, pixels: image.data.buffer }, [image.data.buffer]);
      } catch (error) {
        if (pendingDecode) { clearTimeout(pendingDecode.timer); pendingDecode = null; }
        reject(new Error('decode_error'));
      }
    });
  }
  async function renderAndScan() {
    if (!pdf || busy) return;
    var token = generation, started = performance.now();
    busy = true; updateControls(); clearResult();
    setStatus('Reading page ' + selectedPage + ' on your device…');
    track('pdf_qr_scan_start');
    try {
      var page = await pdf.getPage(selectedPage);
      if (token !== generation) return;
      var original = page.getViewport({ scale: 1 });
      var viewport = page.getViewport({ scale: core.renderScale(original.width, original.height) });
      canvas.width = Math.max(1, Math.floor(viewport.width));
      canvas.height = Math.max(1, Math.floor(viewport.height));
      var context = canvas.getContext('2d', { willReadFrequently: true });
      if (!context) throw new Error('render_error');
      renderTask = page.render({ canvas: canvas, canvasContext: context, viewport: viewport });
      await renderTask.promise;
      if (token !== generation) return;
      renderTask = null;
      var image = context.getImageData(0, 0, canvas.width, canvas.height);
      var result = await decode(image);
      if (token !== generation) return;
      var duration = performance.now() - started;
      if (result.found) {
        currentText = result.text;
        resultText.value = result.text;
        resultSection.hidden = false;
        var url = core.safeWebUrl(result.text);
        if (url) {
          openLink.textContent = 'Open ' + new URL(url).hostname;
          openLink.hidden = false;
        }
        setStatus('QR code found on page ' + selectedPage + '. Review its contents below.');
      } else {
        noResult.hidden = false;
        setStatus('No QR code was found on page ' + selectedPage + '. Try another page or a closer screenshot.');
      }
      track('pdf_qr_scan_result', { outcome: result.found ? 'found' : 'not_found', duration_bucket: duration < 2000 ? 'under_2s' : duration < 10000 ? '2_to_10s' : 'over_10s' });
    } catch (error) {
      if (token !== generation) return;
      setStatus('This page could not be read. Try again, another page, or the image scanner.', true);
      track('pdf_qr_scan_result', { outcome: 'error', reason: error.message === 'decode_error' ? 'decode_error' : 'render_error' });
    } finally {
      if (page) { try { page.cleanup(); } catch (error) { /* Replaced documents may already be destroyed. */ } }
      if (token === generation) { busy = false; updateControls(); }
    }
  }
  async function loadFile(file, sample) {
    dispose(); isSample = !!sample;
    var token = generation;
    track('pdf_qr_file_selected', { size_bucket: core.sizeBucket(file.size) });
    if (!file.size || file.size > core.maxBytes) {
      setStatus(file.size ? 'Choose a PDF smaller than 20 MB.' : 'This file is empty. Choose a PDF.', true);
      track('pdf_qr_failure', { reason: file.size ? 'too_large' : 'invalid_pdf' }); return;
    }
    busy = true; updateControls(); setStatus('Opening your PDF on this device…');
    try {
      var buffer = await file.arrayBuffer();
      if (token !== generation) return;
      if (!core.hasPdfHeader(new Uint8Array(buffer))) throw new Error('invalid_pdf');
      var library = await getLibrary();
      if (token !== generation) return;
      loadingTask = library.getDocument({
        data: buffer,
        cMapUrl: '/assets/vendor/pdfjs/cmaps/', cMapPacked: true,
        standardFontDataUrl: '/assets/vendor/pdfjs/standard_fonts/',
        wasmUrl: '/assets/vendor/pdfjs/wasm/', iccUrl: '/assets/vendor/pdfjs/iccs/',
        disableWorkerRendering: true, enableXfa: false, isImageDecoderSupported: false,
        maxImageSize: 16777216, canvasMaxAreaInBytes: 16777216
      });
      // Password entry is outside this pilot's supported scope.
      var opened = await Promise.race([
        loadingTask.promise,
        new Promise(function (_, reject) {
          loadingTask.onPassword = function () { reject(new Error('encrypted')); };
        })
      ]);
      if (token !== generation) return;
      if (opened.numPages > core.maxPages) throw new Error('page_limit');
      pdf = opened;
      byId('pdf-file-label').textContent = isSample ? 'Sample PDF' : file.name;
      byId('pdf-page-count').textContent = String(pdf.numPages);
      pageNumber.max = String(pdf.numPages); pageNumber.value = '1';
      workspace.hidden = false;
      drop.hidden = true;
      workspace.focus();
      track('pdf_qr_document_ready', { page_count_bucket: pdf.numPages === 1 ? '1' : pdf.numPages <= 10 ? '2_to_10' : '11_to_200' });
      busy = false; updateControls();
      await renderAndScan();
    } catch (error) {
      if (token !== generation) return;
      var reason = ['invalid_pdf', 'encrypted', 'page_limit', 'dependency_error'].indexOf(error.message) >= 0 ? error.message : 'unreadable';
      var messages = {
        invalid_pdf: 'This is not a readable PDF. Choose a PDF file.',
        encrypted: 'Password-protected PDFs are not supported. Open an unprotected copy on your device.',
        page_limit: 'This PDF has more than 200 pages. Choose a smaller document.',
        dependency_error: 'The PDF reader could not load. Check your connection and try again.',
        unreadable: 'This PDF could not be opened. It may be damaged or unsupported. Try another file or a screenshot.'
      };
      dispose(); setStatus(messages[reason], true);
      track('pdf_qr_failure', { reason: reason });
    } finally {
      if (token === generation) { busy = false; updateControls(); }
    }
  }
  byId('pdf-select-button').addEventListener('click', function () { input.value = ''; input.click(); });
  input.addEventListener('change', function () { if (input.files && input.files[0]) loadFile(input.files[0], false); });
  sampleButton.addEventListener('click', async function () {
    dispose(); var token = generation;
    setStatus('Loading the sample PDF…'); sampleButton.disabled = true;
    try {
      var response = await fetch('/assets/samples/qr-in-pdf.pdf', { credentials: 'omit' });
      if (!response.ok) throw new Error('sample');
      var blob = await response.blob();
      if (token === generation) await loadFile(new File([blob], 'sample.pdf', { type: 'application/pdf' }), true);
    } catch (error) { if (token === generation) setStatus('The sample could not load. Try again or choose your own PDF.', true); }
    finally { sampleButton.disabled = false; }
  });
  byId('pdf-reset-button').addEventListener('click', function () { dispose(); input.value = ''; setStatus('Choose another PDF, or try the sample.'); byId('pdf-select-button').focus(); });
  function selectPage(number) {
    if (!pdf || busy) return;
    selectedPage = Math.max(1, Math.min(pdf.numPages, Number.isFinite(number) ? Math.floor(number) : 1));
    pageNumber.value = String(selectedPage); renderAndScan();
  }
  pageNumber.addEventListener('change', function () { selectPage(Number(pageNumber.value)); });
  previous.addEventListener('click', function () { selectPage(selectedPage - 1); });
  next.addEventListener('click', function () { selectPage(selectedPage + 1); });
  scanButton.addEventListener('click', renderAndScan);
  drop.addEventListener('dragover', function (event) { event.preventDefault(); drop.classList.add('dragging'); });
  drop.addEventListener('dragleave', function () { drop.classList.remove('dragging'); });
  drop.addEventListener('drop', function (event) {
    event.preventDefault(); drop.classList.remove('dragging');
    if (event.dataTransfer && event.dataTransfer.files[0]) loadFile(event.dataTransfer.files[0], false);
  });
  copyButton.addEventListener('click', async function () {
    if (currentText === null) return;
    var text = currentText, token = generation;
    copyButton.disabled = true; resultStatus.textContent = '';
    try {
      await navigator.clipboard.writeText(text);
      if (token !== generation || text !== currentText) return;
      resultStatus.textContent = 'Result copied.';
      track('pdf_qr_copy_result', { outcome: 'copied' });
    } catch (error) {
      if (token !== generation || text !== currentText) return;
      resultStatus.textContent = 'Couldn’t copy. Select the text above to copy it manually.';
      track('pdf_qr_copy_result', { outcome: 'blocked' });
    } finally { if (token === generation) copyButton.disabled = false; }
  });
  openLink.addEventListener('click', function () {
    var url = currentText !== null && core.safeWebUrl(currentText);
    if (!url) return;
    // Keep decoded URLs out of anchor attributes read by automatic outbound-link analytics.
    window.open(url, '_blank', 'noopener,noreferrer');
    track('pdf_qr_link_open');
  });
  window.addEventListener('pagehide', dispose);
  updateControls();
})();
