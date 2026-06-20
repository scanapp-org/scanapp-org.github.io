(function () {
  'use strict';

  var MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB
  var fileQueue = [];

  // DOM Elements
  var input = document.getElementById('image-input');
  var dropZone = document.getElementById('drop-zone');
  var addImagesBtn = document.getElementById('add-images-btn');
  var compressAllBtn = document.getElementById('compress-all-btn');
  var downloadAllBtn = document.getElementById('download-all-btn');
  var quality = document.getElementById('quality');
  var qualityValue = document.getElementById('quality-value');
  var maxWidth = document.getElementById('max-width');
  var outputFormat = document.getElementById('output-format');
  var queueContainer = document.getElementById('queue-container');
  var compressQueue = document.getElementById('compress-queue');
  var summarySavedBytes = document.getElementById('summary-saved-bytes');
  var summaryCount = document.getElementById('summary-count');
  var summaryPercentage = document.getElementById('summary-percentage');

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
    return 'jpg';
  }

  function validImage(file) {
    return file && file.type && file.type.indexOf('image/') === 0;
  }

  // Handle files adding
  function addFiles(files) {
    if (!files || files.length === 0) return;
    
    var addedCount = 0;
    for (var i = 0; i < files.length; i++) {
      var file = files[i];
      if (!validImage(file)) {
        alert('File "' + file.name + '" is not a valid image.');
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
      var previewUrl = URL.createObjectURL(file);
      
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
        errorMsg: null
      };

      fileQueue.push(item);
      renderQueueRow(item);
      addedCount++;
      
      event('file_selected', { file_type: file.type, size: file.size });
    }

    if (addedCount > 0) {
      queueContainer.hidden = false;
      // Auto compress the newly added files
      compressPending();
    }
  }

  function renderQueueRow(item) {
    var row = document.getElementById('row-' + item.id);
    if (!row) {
      row = document.createElement('div');
      row.className = 'queue-row';
      row.id = 'row-' + item.id;
      compressQueue.appendChild(row);
    }

    var sizesHtml = '<span>' + bytes(item.originalSize) + '</span>';
    if (item.status === 'done') {
      var savings = Math.round(((item.originalSize - item.compressedSize) / item.originalSize) * 100);
      sizesHtml = '<span>' + bytes(item.originalSize) + '</span>' +
                  '<span class="queue-arrow">➔</span>' +
                  '<span class="queue-sizes-compressed">' + bytes(item.compressedSize) + '</span>' +
                  '<span class="queue-savings-badge">-' + Math.max(0, savings) + '%</span>';
    } else if (item.status === 'error') {
      sizesHtml = '<span style="color:var(--sa-danger)">' + (item.errorMsg || 'Failed') + '</span>';
    }

    var progressClass = 'progress-bar-fill';
    if (item.status === 'compressing') {
      progressClass += ' compressing';
    }

    var format = item.file.type.split('/')[1] || 'img';
    if (format === 'jpeg') format = 'jpg';
    if (format === 'svg+xml') format = 'svg';

    var thumbHtml = '';
    // Use canvas thumbnail preview for common raster formats, display fallback format text otherwise
    if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'avif'].indexOf(format.toLowerCase()) !== -1) {
      thumbHtml = '<img class="queue-thumb" src="' + item.previewUrl + '" alt="Thumbnail">';
    } else {
      thumbHtml = '<div class="queue-format-icon">' + format.toUpperCase() + '</div>';
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
        '<a id="download-btn-' + item.id + '" class="icon-btn" title="Download image" ' + 
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
        event('download_clicked', { tool: 'image_compressor', filename: item.compressedName });
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
    if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
    if (item.compressedUrl) URL.revokeObjectURL(item.compressedUrl);

    var row = document.getElementById('row-' + id);
    if (row) row.parentNode.removeChild(row);

    fileQueue.splice(index, 1);

    if (fileQueue.length === 0) {
      queueContainer.hidden = true;
    } else {
      updateSummary();
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

    var img = new Image();
    img.onload = function () {
      item.progress = 50;
      renderQueueRow(item);

      try {
        var canvas = document.createElement('canvas');
        var width = img.naturalWidth;
        var height = img.naturalHeight;

        var widthLimit = Number(maxWidth.value);
        if (widthLimit && width > widthLimit) {
          height = Math.round(height * (widthLimit / width));
          width = widthLimit;
        }

        canvas.width = width;
        canvas.height = height;

        var ctx = canvas.getContext('2d');

        var mimeType = outputFormat.value;
        if (mimeType === 'auto') {
          // smart mapping: transparent images become WebP, standard images become JPEG
          mimeType = (item.file.type === 'image/png' || item.file.type === 'image/svg+xml') ? 'image/webp' : 'image/jpeg';
        }

        if (mimeType === 'image/jpeg') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, width, height);
        }

        ctx.drawImage(img, 0, 0, width, height);
        item.progress = 80;
        renderQueueRow(item);

        canvas.toBlob(function (blob) {
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
          
          var finalMime = blob.type || mimeType;
          item.compressedName = fileBaseName(item.file.name) + '-compressed.' + extension(finalMime);

          renderQueueRow(item);
          updateSummary();
          event('processing_success', { output_type: finalMime, output_size: blob.size });
          if (callback) callback();
        }, mimeType, Number(quality.value) / 100);
      } catch (err) {
        item.status = 'error';
        item.errorMsg = 'Compression failed';
        item.progress = 100;
        renderQueueRow(item);
        if (callback) callback();
      }
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

  function compressPending() {
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

  function compressAll() {
    if (fileQueue.length === 0) return;

    var index = 0;
    function next() {
      if (index >= fileQueue.length) return;
      // Mark as pending first if it was already processed to force re-compressing
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

    summaryCount.textContent = doneCount;
    var saved = totalOriginal - totalCompressed;
    summarySavedBytes.textContent = bytes(saved >= 0 ? saved : 0);

    var pct = 0;
    if (totalOriginal > 0) {
      pct = Math.round((saved / totalOriginal) * 100);
    }
    summaryPercentage.textContent = Math.max(0, pct) + '%';

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
      a.download = 'scanapp-images-compressed.zip';
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
  dropZone.addEventListener('click', function () { input.click(); });
  addImagesBtn.addEventListener('click', function () { input.click(); });
  input.addEventListener('change', function () {
    addFiles(input.files);
    input.value = '';
  });

  quality.addEventListener('input', function () {
    qualityValue.textContent = quality.value + '%';
  });

  // Re-compress automatically when settings change if queue is present
  quality.addEventListener('change', function () {
    compressAll();
  });
  maxWidth.addEventListener('change', function () {
    compressAll();
  });
  outputFormat.addEventListener('change', function () {
    compressAll();
  });

  compressAllBtn.addEventListener('click', compressAll);
  downloadAllBtn.addEventListener('click', downloadAllZip);

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
      addFiles(files);
    }
  });

  // Auto-expand advanced settings on desktop (screens wider than 768px)
  var extraSettings = document.querySelector('.extra-settings-details');
  if (extraSettings && window.innerWidth > 768) {
    extraSettings.open = true;
  }

  // Log load event
  event('tool_page_view', { tool: 'image_compressor' });
}());
