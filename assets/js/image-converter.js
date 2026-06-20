(function () {
  'use strict';

  var MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB
  var fileQueue = [];
  var targetFormat = 'image/webp'; // default
  var lastTriggerSource = 'unknown';

  // DOM Elements
  var input = document.getElementById('image-input');
  var dropZone = document.getElementById('drop-zone');
  var addImagesBtn = document.getElementById('add-images-btn');
  var convertAllBtn = document.getElementById('convert-all-btn');
  var downloadAllBtn = document.getElementById('download-all-btn');
  var quality = document.getElementById('quality');
  var qualityValue = document.getElementById('quality-value');
  var maxWidth = document.getElementById('max-width');
  var queueContainer = document.getElementById('queue-container');
  var compressQueue = document.getElementById('compress-queue');
  var summarySavedBytes = document.getElementById('summary-saved-bytes');
  var summaryProgressCount = document.getElementById('summary-progress-count');
  var summaryTargetFormat = document.getElementById('summary-target-format');
  var mobileQueueCount = document.getElementById('mobile-queue-count');
  var clearAllBtn = document.getElementById('clear-all-btn');
  var mobileSummaryProgressCount = document.getElementById('mobile-summary-progress-count');
  var mobileSummarySavedBytes = document.getElementById('mobile-summary-saved-bytes');
  var mobileSummaryTargetFormat = document.getElementById('mobile-summary-target-format');

  function event(name, params) {
    if (window.scanappToolEvent) window.scanappToolEvent(name, params);
  }

  function bytes(value) {
    if (value === 0) return '0 B';
    if (value < 1024) return value + ' B';
    if (value < 1024 * 1024) return (value / 1024).toFixed(1) + ' KB';
    return (value / (1024 * 1024)).toFixed(2) + ' MB';
  }

  function fileBaseName(name) {
    return name.replace(/\.[^/.]+$/, '') || 'image';
  }

  function extension(mimeType) {
    if (mimeType === 'image/webp') return 'webp';
    if (mimeType === 'image/png') return 'png';
    if (mimeType === 'image/avif') return 'avif';
    if (mimeType === 'image/gif') return 'gif';
    if (mimeType === 'image/bmp') return 'bmp';
    if (mimeType === 'application/pdf') return 'pdf';
    return 'jpg';
  }

  function formatLabel(mimeType) {
    if (mimeType === 'image/webp') return 'WEBP';
    if (mimeType === 'image/png') return 'PNG';
    if (mimeType === 'image/avif') return 'AVIF';
    if (mimeType === 'image/gif') return 'GIF';
    if (mimeType === 'image/bmp') return 'BMP';
    if (mimeType === 'application/pdf') return 'PDF';
    return 'JPG';
  }

  function validImage(file) {
    if (!file || !file.name) return false;
    var ext = file.name.split('.').pop().toLowerCase();
    var validExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'bmp', 'tiff', 'tif', 'heic', 'heif'];
    return (file.type && file.type.indexOf('image/') === 0) || validExtensions.indexOf(ext) !== -1;
  }

  // Handle files adding
  function addFiles(files) {
    if (!files || files.length === 0) return;
    
    var addedCount = 0;
    for (var i = 0; i < files.length; i++) {
      var file = files[i];
      if (!validImage(file)) {
        alert('File "' + file.name + '" is not a supported format.');
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        alert('Image "' + file.name + '" exceeds the 50 MB file size limit.');
        continue;
      }
      if (fileQueue.length >= 100) {
        alert('Maximum of 100 images can be processed in a batch.');
        break;
      }

      var id = 'file-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      var previewUrl = null;
      var isHeic = file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif') || file.type === 'image/heic' || file.type === 'image/heif';
      
      // For standard images, create object URL immediately. For HEIC, we will do it on-the-fly.
      if (!isHeic) {
        previewUrl = URL.createObjectURL(file);
      }

      var item = {
        id: id,
        file: file,
        status: 'pending', // pending, compressing, done, error
        progress: 0,
        originalSize: file.size,
        compressedSize: 0,
        compressedBlob: null,
        compressedUrl: null,
        compressedName: null,
        previewUrl: previewUrl,
        errorMsg: null,
        isHeic: isHeic,
        removed: false
      };

      fileQueue.push(item);
      renderQueueRow(item);
      addedCount++;
      
      event('file_selected', { file_type: file.type || 'image/heic', size: file.size, source: lastTriggerSource });
    }
    lastTriggerSource = 'unknown';

    if (addedCount > 0) {
      queueContainer.hidden = false;
      updateQueueCount();
      // Auto convert the newly added files
      convertPending();
    }
  }

  function renderQueueRow(item) {
    if (item.removed) return;
    var row = document.getElementById('row-' + item.id);
    if (!row) {
      row = document.createElement('div');
      row.className = 'queue-row';
      row.id = 'row-' + item.id;
      compressQueue.appendChild(row);
    }

    var sourceFormat = (item.file.type.split('/')[1] || item.file.name.split('.').pop() || 'img').toUpperCase();
    if (sourceFormat === 'JPEG') sourceFormat = 'JPG';
    if (sourceFormat === 'SVG+XML') sourceFormat = 'SVG';

    var sizesHtml = '<span>' + bytes(item.originalSize) + '</span>';
    if (item.status === 'done') {
      var targetLabel = formatLabel(item.compressedBlob.type || targetFormat);
      sizesHtml = '<span class="queue-savings-badge" style="background:rgba(var(--sa-primary-rgb),0.08);color:var(--sa-primary);margin-left:0;margin-right:6px;">' + sourceFormat + ' ➔ ' + targetLabel + '</span>' +
                  '<span>' + bytes(item.originalSize) + '</span>' +
                  '<span class="queue-arrow">➔</span>' +
                  '<span class="queue-sizes-compressed">' + bytes(item.compressedSize) + '</span>';
    } else if (item.status === 'error') {
      sizesHtml = '<span style="color:var(--sa-danger)">' + (item.errorMsg || 'Failed') + '</span>';
    } else if (item.status === 'compressing') {
      sizesHtml = '<span style="color:var(--sa-muted)">' + (item.errorMsg || 'Converting...') + '</span>';
    } else {
      sizesHtml = '<span style="color:var(--sa-muted)">In queue</span>';
    }

    var progressClass = 'progress-bar-fill';
    if (item.status === 'compressing') {
      progressClass += ' compressing';
    }

    var thumbHtml = '';
    if (item.previewUrl) {
      thumbHtml = '<img class="queue-thumb" src="' + item.previewUrl + '" alt="Thumbnail">';
    } else {
      thumbHtml = '<div class="queue-format-icon">' + sourceFormat + '</div>';
    }

    row.innerHTML = 
      '<div class="queue-thumb-container">' +
        thumbHtml +
        '<div class="queue-file-info">' +
          '<div class="queue-filename" title="' + item.file.name + '">' + item.file.name + '</div>' +
          '<div class="queue-sizes">' + sizesHtml + '</div>' +
        '</div>' +
      '</div>' +
      '<div class="queue-progress-container">' +
        '<div class="progress-track">' +
          '<div class="' + progressClass + '" style="width: ' + item.progress + '%"></div>' +
        '</div>' +
      '</div>' +
      '<div class="queue-actions">' +
        '<a id="download-btn-' + item.id + '" class="icon-btn" title="Download converted file" ' + 
          (item.status === 'done' ? 'href="' + item.compressedUrl + '" download="' + item.compressedName + '"' : 'style="pointer-events: none; opacity: 0.3;"') + '>' +
          '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM17 13l-5 5-5-5h3V9h4v4h3z"/></svg>' +
        '</a>' +
        '<button id="remove-btn-' + item.id + '" class="icon-btn" title="Remove" type="button">' +
          '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>' +
        '</button>' +
      '</div>';

    // Hook events
    document.getElementById('remove-btn-' + item.id).addEventListener('click', function() {
      removeItem(item.id);
    });

    var dl = document.getElementById('download-btn-' + item.id);
    if (dl && item.status === 'done') {
      dl.addEventListener('click', function() {
        event('download_clicked', { tool: 'image_converter', filename: item.compressedName });
      });
    }
  }

  function removeItem(id) {
    var index = -1;
    for (var i = 0; i < fileQueue.length; i++) {
      if (fileQueue[i].id === id) {
        index = i;
        break;
      }
    }
    if (index === -1) return;

    var item = fileQueue[index];
    item.removed = true;
    event('remove_item_clicked', { filename: item.file.name, status: item.status });
    if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
    if (item.compressedUrl) URL.revokeObjectURL(item.compressedUrl);

    var row = document.getElementById('row-' + id);
    if (row) row.parentNode.removeChild(row);

    fileQueue.splice(index, 1);
    updateQueueCount();

    if (fileQueue.length === 0) {
      queueContainer.hidden = true;
    } else {
      updateSummary();
    }
  }

  function updateQueueCount() {
    if (mobileQueueCount) mobileQueueCount.textContent = fileQueue.length;
  }

  function clearAll() {
    for (var i = 0; i < fileQueue.length; i++) {
      fileQueue[i].removed = true;
      if (fileQueue[i].previewUrl) URL.revokeObjectURL(fileQueue[i].previewUrl);
      if (fileQueue[i].compressedUrl) URL.revokeObjectURL(fileQueue[i].compressedUrl);
    }
    fileQueue = [];
    compressQueue.innerHTML = '';
    queueContainer.hidden = true;
    updateQueueCount();
    updateSummary();
    event('clear_all_clicked', { tool: 'image_converter' });
  }

  function processImageConversion(item, imgElement, callback) {
    if (item.removed) {
      if (callback) callback();
      return;
    }
    try {
      var canvas = document.createElement('canvas');
      var width = imgElement.naturalWidth || imgElement.width;
      var height = imgElement.naturalHeight || imgElement.height;

      var widthLimit = Number(maxWidth.value);
      if (widthLimit && width > widthLimit) {
        height = Math.round(height * (widthLimit / width));
        width = widthLimit;
      }

      canvas.width = width;
      canvas.height = height;

      var ctx = canvas.getContext('2d');

      // If output is JPEG or PDF, fill transparent background with white
      if (targetFormat === 'image/jpeg' || targetFormat === 'application/pdf') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
      }

      ctx.drawImage(imgElement, 0, 0, width, height);
      item.progress = 80;
      renderQueueRow(item);

      // Handle PDF generation separately
      if (targetFormat === 'application/pdf') {
        if (window.jspdf && window.jspdf.jsPDF) {
          var doc = new window.jspdf.jsPDF({
            orientation: width > height ? 'landscape' : 'portrait',
            unit: 'px',
            format: [width, height]
          });
          // Add standard JPEG representation to PDF
          var dataUrl = canvas.toDataURL('image/jpeg', Number(quality.value) / 100);
          doc.addImage(dataUrl, 'JPEG', 0, 0, width, height);
          var pdfBlob = doc.output('blob');
          
          handleBlobResult(pdfBlob);
        } else {
          // Fallback to PNG if jspdf isn't loaded
          canvas.toBlob(handleBlobResult, 'image/png');
        }
      } else {
        canvas.toBlob(handleBlobResult, targetFormat, Number(quality.value) / 100);
      }

      function handleBlobResult(blob) {
        if (item.removed) {
          if (callback) callback();
          return;
        }
        if (!blob) {
          item.status = 'error';
          item.errorMsg = 'Blob encoding failed';
          item.progress = 100;
          renderQueueRow(item);
          if (callback) callback();
          return;
        }

        item.status = 'done';
        item.progress = 100;
        item.compressedSize = blob.size;
        item.compressedBlob = blob;
        if (item.compressedUrl) URL.revokeObjectURL(item.compressedUrl);
        item.compressedUrl = URL.createObjectURL(blob);
        item.compressedName = fileBaseName(item.file.name) + '-converted.' + extension(blob.type || targetFormat);

        renderQueueRow(item);
        updateSummary();
        event('processing_success', { output_type: blob.type || targetFormat, output_size: blob.size });
        if (callback) callback();
      }

    } catch (err) {
      item.status = 'error';
      item.errorMsg = 'Canvas draw failed';
      item.progress = 100;
      renderQueueRow(item);
      if (callback) callback();
    }
  }

  function compressItem(item, callback) {
    if (item.status === 'compressing') {
      if (callback) callback();
      return;
    }

    item.status = 'compressing';
    item.progress = 20;
    renderQueueRow(item);

    // HEIC/HEIF Decoder support
    if (item.isHeic) {
      if (window.heic2any) {
        item.errorMsg = 'Decoding HEIC...';
        renderQueueRow(item);

        window.heic2any({
          blob: item.file,
          toType: 'image/jpeg',
          quality: 0.85
        }).then(function (convertedBlob) {
          if (item.removed) {
            if (callback) callback();
            return;
          }
          var jpegUrl = URL.createObjectURL(convertedBlob);
          item.previewUrl = jpegUrl;
          item.progress = 40;
          item.errorMsg = 'Loading converted image...';
          renderQueueRow(item);

          var img = new Image();
          img.onload = function () {
            if (item.removed) {
              if (callback) callback();
              return;
            }
            item.progress = 60;
            renderQueueRow(item);
            processImageConversion(item, img, callback);
          };
          img.onerror = function () {
            item.status = 'error';
            item.errorMsg = 'Decoded load failed';
            item.progress = 100;
            renderQueueRow(item);
            if (callback) callback();
          };
          img.src = jpegUrl;
        }).catch(function (err) {
          item.status = 'error';
          item.errorMsg = 'HEIC decode failed';
          item.progress = 100;
          renderQueueRow(item);
          if (callback) callback();
        });
      } else {
        item.status = 'error';
        item.errorMsg = 'HEIC decoder missing';
        item.progress = 100;
        renderQueueRow(item);
        if (callback) callback();
      }
      return;
    }

    // Standard format processing
    var img = new Image();
    img.onload = function () {
      if (item.removed) {
        if (callback) callback();
        return;
      }
      item.progress = 50;
      renderQueueRow(item);
      processImageConversion(item, img, callback);
    };

    img.onerror = function () {
      item.status = 'error';
      item.errorMsg = 'Load failed';
      item.progress = 100;
      renderQueueRow(item);
      if (callback) callback();
    };

    img.src = item.previewUrl;
  }

  function convertPending() {
    var pendingItems = [];
    for (var i = 0; i < fileQueue.length; i++) {
      if (fileQueue[i].status === 'pending') {
        pendingItems.push(fileQueue[i]);
      }
    }

    if (pendingItems.length === 0) return;

    var index = 0;
    function next() {
      if (index >= pendingItems.length) return;
      compressItem(pendingItems[index], function() {
        index++;
        next();
      });
    }
    next();
  }

  function convertAll() {
    if (fileQueue.length === 0) return;

    var index = 0;
    function next() {
      if (index >= fileQueue.length) {
        updateSummary();
        return;
      }
      var item = fileQueue[index];
      item.status = 'pending';
      item.progress = 0;
      compressItem(item, function() {
        index++;
        next();
      });
    }
    next();
  }

  function updateSummary() {
    var totalOriginal = 0;
    var totalCompressed = 0;
    var doneCount = 0;

    for (var i = 0; i < fileQueue.length; i++) {
      var item = fileQueue[i];
      if (item.status === 'done') {
        totalOriginal += item.originalSize;
        totalCompressed += item.compressedSize;
        doneCount++;
      }
    }

    summaryProgressCount.textContent = doneCount + ' of ' + fileQueue.length;
    if (mobileSummaryProgressCount) mobileSummaryProgressCount.textContent = doneCount + ' of ' + fileQueue.length;
    var saved = totalOriginal - totalCompressed;
    summarySavedBytes.textContent = bytes(saved >= 0 ? saved : 0);
    if (mobileSummarySavedBytes) mobileSummarySavedBytes.textContent = bytes(saved >= 0 ? saved : 0);
    summaryTargetFormat.textContent = formatLabel(targetFormat);
    if (mobileSummaryTargetFormat) mobileSummaryTargetFormat.textContent = formatLabel(targetFormat);

    downloadAllBtn.disabled = (doneCount === 0);
  }

  function downloadAllZip() {
    var doneItems = [];
    for (var i = 0; i < fileQueue.length; i++) {
      if (fileQueue[i].status === 'done') {
        doneItems.push(fileQueue[i]);
      }
    }

    if (doneItems.length === 0) return;

    event('download_all_clicked', { count: doneItems.length });
    downloadAllBtn.disabled = true;
    var zip = new JSZip();

    for (var i = 0; i < doneItems.length; i++) {
      var item = doneItems[i];
      zip.file(item.compressedName, item.compressedBlob);
    }

    zip.generateAsync({ type: 'blob' }).then(function (content) {
      var url = URL.createObjectURL(content);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'scanapp-images-converted.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      downloadAllBtn.disabled = false;
      event('zip_download_success', { count: doneItems.length });
    }).catch(function (err) {
      alert('Failed to generate ZIP file: ' + err.message);
      downloadAllBtn.disabled = false;
    });
  }

  // Event Listeners
  dropZone.addEventListener('click', function () {
    lastTriggerSource = 'click_to_upload';
    input.click();
  });
  addImagesBtn.addEventListener('click', function () {
    lastTriggerSource = 'add_images_button';
    input.click();
  });
  input.addEventListener('change', function () {
    addFiles(input.files);
    input.value = '';
  });

  quality.addEventListener('input', function () {
    qualityValue.textContent = quality.value + '%';
  });

  // Re-convert automatically when settings change if queue is present
  quality.addEventListener('change', function () {
    event('quality_changed', { value: parseInt(quality.value, 10) });
    convertAll();
  });
  maxWidth.addEventListener('change', function () {
    event('max_width_changed', { value: maxWidth.value ? parseInt(maxWidth.value, 10) : 'original' });
    convertAll();
  });

  // Format selector tab actions
  var pills = document.querySelectorAll('#format-selectors .format-pill');
  for (var i = 0; i < pills.length; i++) {
    (function (pill) {
      pill.addEventListener('click', function () {
        for (var j = 0; j < pills.length; j++) {
          pills[j].classList.remove('active');
        }
        pill.classList.add('active');
        targetFormat = pill.getAttribute('data-format');
        event('format_pill_selected', { format: targetFormat });
        updateSummary();
        convertAll(); // re-convert everything to the newly chosen format!
      });
    })(pills[i]);
  }

  convertAllBtn.addEventListener('click', function () {
    event('convert_all_clicked', { queue_size: fileQueue.length });
    convertAll();
  });
  downloadAllBtn.addEventListener('click', downloadAllZip);
  if (clearAllBtn) clearAllBtn.addEventListener('click', clearAll);

  // Drag and Drop
  ['dragenter', 'dragover'].forEach(function (type) {
    dropZone.addEventListener(type, function (e) {
      e.preventDefault();
      dropZone.classList.add('dragging');
    });
  });

  ['dragleave', 'drop'].forEach(function (type) {
    dropZone.addEventListener(type, function (e) {
      e.preventDefault();
      dropZone.classList.remove('dragging');
    });
  });

  dropZone.addEventListener('drop', function (e) {
    lastTriggerSource = 'drag_and_drop';
    addFiles(e.dataTransfer.files);
  });

  // Clipboard Paste Support
  window.addEventListener('paste', function (e) {
    var items = e.clipboardData && e.clipboardData.items;
    if (!items) return;
    var files = [];
    for (var i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image/') === 0) {
        var f = items[i].getAsFile();
        if (f) files.push(f);
      }
    }
    if (files.length > 0) {
      lastTriggerSource = 'clipboard_paste';
      addFiles(files);
    }
  });

  // Auto-expand advanced settings on desktop (screens wider than 768px)
  var extraSettings = document.querySelector('.extra-settings-details');
  if (extraSettings) {
    if (window.innerWidth > 768) {
      extraSettings.open = true;
    }
    extraSettings.addEventListener('toggle', function () {
      event('advanced_settings_toggled', { open: extraSettings.open });
    });
  }

  // FAQ toggles
  document.querySelectorAll('.faq-item').forEach(function (faqItem) {
    faqItem.addEventListener('toggle', function () {
      var questionEl = faqItem.querySelector('.faq-question span');
      var question = questionEl ? questionEl.textContent.trim() : 'Unknown';
      event('faq_toggled', { question: question, open: faqItem.open });
    });
  });

  // Log load event
  event('tool_page_view', { tool: 'image_converter' });
}());
