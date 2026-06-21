(function () {
  'use strict';

  const config = window.scanappToolConfig || {};
  const input = document.getElementById('video-input');
  const dropZone = document.getElementById('video-drop-zone');
  const workspace = document.getElementById('video-workspace');
  const video = document.getElementById('video-preview');
  const timeline = document.getElementById('frame-time');
  const timelineLabel = document.getElementById('frame-time-label');
  const durationLabel = document.getElementById('timeline-duration');
  const processButton = document.getElementById('process-video-btn');
  const replaceButton = document.getElementById('replace-video-btn');
  const status = document.getElementById('video-status');
  const progressWrap = document.getElementById('video-progress-wrap');
  const progress = document.getElementById('video-progress');
  const result = document.getElementById('video-result');
  const resultImage = document.getElementById('result-image');
  const resultSummary = document.getElementById('result-summary');
  const download = document.getElementById('download-video-result');
  let file = null;
  let sourceUrl = '';
  let resultUrl = '';
  let seeking = false;

  if (!input || !dropZone || !video) return;

  function track(name, params) {
    if (window.scanappToolEvent) window.scanappToolEvent(name, params || {});
  }

  function formatTime(seconds) {
    const safe = Math.max(0, Number(seconds) || 0);
    const minutes = Math.floor(safe / 60);
    const remainder = safe - minutes * 60;
    return String(minutes).padStart(2, '0') + ':' + remainder.toFixed(2).padStart(5, '0');
  }

  function formatBytes(bytes) {
    if (!bytes) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    return (bytes / Math.pow(1024, index)).toFixed(index ? 1 : 0) + ' ' + units[index];
  }

  function sizeBucket(bytes) {
    if (bytes < 5e6) return 'under_5mb';
    if (bytes < 25e6) return '5_25mb';
    if (bytes < 100e6) return '25_100mb';
    return 'over_100mb';
  }

  function setStatus(message, isError) {
    status.textContent = message || '';
    status.classList.toggle('error', Boolean(isError));
  }

  function setProgress(value) {
    progressWrap.hidden = value === null;
    progress.style.width = value === null ? '0%' : Math.round(value * 100) + '%';
  }

  function resetResult() {
    result.hidden = true;
    resultImage.removeAttribute('src');
    download.removeAttribute('href');
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    resultUrl = '';
  }

  function seekTo(seconds) {
    const target = Math.min(Math.max(0, Number(seconds) || 0), Math.max(0, video.duration - 0.001));
    if (Math.abs(video.currentTime - target) < 0.015 && video.readyState >= 2) return Promise.resolve();
    return new Promise(function (resolve, reject) {
      const timeout = window.setTimeout(function () {
        cleanup();
        reject(new Error('The browser could not seek to that frame.'));
      }, 8000);
      function cleanup() {
        window.clearTimeout(timeout);
        video.removeEventListener('seeked', done);
        video.removeEventListener('loadeddata', done);
        video.removeEventListener('error', failed);
      }
      function done() { cleanup(); resolve(); }
      function failed() { cleanup(); reject(new Error('This video could not be decoded.')); }
      video.addEventListener('seeked', done, { once: true });
      if (Math.abs(video.currentTime - target) < 0.015) video.addEventListener('loadeddata', done, { once: true });
      video.addEventListener('error', failed, { once: true });
      video.currentTime = target;
    });
  }

  function canvasForFrame(widthSetting) {
    const sourceWidth = video.videoWidth;
    const sourceHeight = video.videoHeight;
    const requested = Number(widthSetting) || sourceWidth;
    const width = Math.max(1, Math.min(requested, sourceWidth));
    const height = Math.max(1, Math.round(sourceHeight * width / sourceWidth));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.getContext('2d').drawImage(video, 0, 0, width, height);
    return canvas;
  }

  function canvasBlob(canvas, type, quality) {
    return new Promise(function (resolve, reject) {
      canvas.toBlob(function (blob) {
        if (blob) resolve(blob);
        else reject(new Error('The browser could not create this image format.'));
      }, type, quality);
    });
  }

  function showResult(blob, extension, label) {
    resetResult();
    resultUrl = URL.createObjectURL(blob);
    resultImage.src = resultUrl;
    resultSummary.textContent = label + ' · ' + formatBytes(blob.size);
    const base = (file.name.replace(/\.[^.]+$/, '') || 'video') + '-' + config.variant;
    download.href = resultUrl;
    download.download = base + '.' + extension;
    result.hidden = false;
    result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    track('processing_success', { output_type: extension, output_size_bucket: sizeBucket(blob.size) });
  }

  async function captureFrame() {
    const format = document.getElementById('frame-format').value;
    const width = document.getElementById('output-width').value;
    const quality = Number(document.getElementById('frame-quality').value) / 100;
    await seekTo(timeline.value);
    const canvas = canvasForFrame(width);
    const blob = await canvasBlob(canvas, format, quality);
    showResult(blob, format === 'image/png' ? 'png' : 'jpg', canvas.width + ' × ' + canvas.height + ' image');
  }

  async function createGif() {
    if (typeof window.GIF !== 'function') throw new Error('The GIF encoder did not load. Please refresh and try again.');
    const startInput = document.getElementById('gif-start');
    const endInput = document.getElementById('gif-end');
    const start = Math.max(0, Number(startInput.value) || 0);
    const end = Math.min(video.duration, Number(endInput.value) || 0);
    const clipDuration = end - start;
    const maxDuration = Number(config.maxGifDuration) || 12;
    if (clipDuration <= 0) throw new Error('End time must be after start time.');
    if (clipDuration > maxDuration + 0.01) throw new Error('Choose a clip no longer than ' + maxDuration + ' seconds.');

    const fps = Number(document.getElementById('gif-fps').value) || 8;
    const requestedWidth = Number(document.getElementById('output-width').value) || 480;
    const width = Math.min(requestedWidth, video.videoWidth);
    const height = Math.round(video.videoHeight * width / video.videoWidth);
    const frameCount = Math.max(1, Math.floor(clipDuration * fps) + 1);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    const encoder = new window.GIF({
      workers: Math.min(2, navigator.hardwareConcurrency || 2),
      quality: Number(document.getElementById('gif-quality').value) || 10,
      width: width,
      height: height,
      workerScript: '/assets/js/gif.worker.js'
    });

    for (let index = 0; index < frameCount; index += 1) {
      const time = Math.min(end, start + index / fps);
      setStatus('Capturing frame ' + (index + 1) + ' of ' + frameCount + '…');
      setProgress((index / frameCount) * 0.7);
      await seekTo(time);
      context.drawImage(video, 0, 0, width, height);
      encoder.addFrame(canvas, { copy: true, delay: Math.round(1000 / fps) });
    }

    setStatus('Encoding GIF on your device…');
    return new Promise(function (resolve, reject) {
      encoder.on('progress', function (value) { setProgress(0.7 + value * 0.3); });
      encoder.on('finished', function (blob) { resolve({ blob: blob, width: width, height: height }); });
      encoder.on('abort', function () { reject(new Error('GIF encoding was interrupted.')); });
      encoder.render();
    });
  }

  async function processVideo() {
    if (!file || processButton.disabled) return;
    video.pause();
    resetResult();
    processButton.disabled = true;
    setProgress(0);
    setStatus(config.mode === 'gif' ? 'Preparing frames…' : 'Capturing selected frame…');
    track('processing_started', { processing_mode: config.mode });
    try {
      if (config.mode === 'gif') {
        const gif = await createGif();
        showResult(gif.blob, 'gif', gif.width + ' × ' + gif.height + ' GIF');
      } else {
        await captureFrame();
      }
      setStatus('Done — your file is ready.');
      setProgress(1);
    } catch (error) {
      setStatus(error.message || 'Unable to process this video.', true);
      setProgress(null);
      track('processing_failed', { error_type: (error.name || 'processing_error').toLowerCase() });
    } finally {
      processButton.disabled = false;
    }
  }

  function loadFile(selected) {
    if (!selected) return;
    if (!selected.type.startsWith('video/') && !/\.(mp4|webm|mov)$/i.test(selected.name)) {
      setStatus('Choose an MP4, WebM or MOV video.', true);
      return;
    }
    if (selected.size > 500 * 1024 * 1024) {
      setStatus('Choose a video smaller than 500 MB for reliable in-browser processing.', true);
      return;
    }
    file = selected;
    resetResult();
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    sourceUrl = URL.createObjectURL(file);
    video.src = sourceUrl;
    document.getElementById('video-file-name').textContent = file.name;
    setStatus('Reading video metadata…');
    track('file_selected', { file_type: selected.type || 'unknown', file_size_bucket: sizeBucket(selected.size) });
  }

  video.addEventListener('loadedmetadata', async function () {
    const duration = video.duration;
    if (!Number.isFinite(duration) || !video.videoWidth) {
      setStatus('This video has no readable duration or frames.', true);
      return;
    }
    timeline.max = Math.max(0, duration - 0.001);
    const initial = config.mode === 'thumbnail' ? Math.min(duration * 0.1, 5) : Math.min(Number(config.defaultTime) || 0, duration);
    timeline.value = initial;
    timelineLabel.textContent = formatTime(initial);
    durationLabel.textContent = formatTime(duration);
    document.getElementById('video-metadata').textContent = formatTime(duration) + ' · ' + video.videoWidth + ' × ' + video.videoHeight + ' · ' + formatBytes(file.size);
    if (config.mode === 'gif') {
      document.getElementById('gif-start').max = duration.toFixed(2);
      document.getElementById('gif-end').max = duration.toFixed(2);
      document.getElementById('gif-end').value = Math.min(duration, Number(config.maxGifDuration) || 12).toFixed(1);
    }
    dropZone.hidden = true;
    workspace.hidden = false;
    setStatus('Move the timeline to choose a frame.');
    try { await seekTo(initial); } catch (error) { setStatus(error.message, true); }
  });

  timeline.addEventListener('input', function () {
    timelineLabel.textContent = formatTime(timeline.value);
    if (seeking) return;
    seeking = true;
    window.requestAnimationFrame(function () {
      video.currentTime = Number(timeline.value);
      seeking = false;
    });
  });
  video.addEventListener('timeupdate', function () {
    if (!video.seeking && document.activeElement !== timeline) {
      timeline.value = video.currentTime;
      timelineLabel.textContent = formatTime(video.currentTime);
    }
  });
  timeline.addEventListener('change', function () { track('timeline_changed', { position_bucket: Math.round((Number(timeline.value) / video.duration) * 10) * 10 }); });

  const frameQuality = document.getElementById('frame-quality');
  if (frameQuality) frameQuality.addEventListener('input', function () { document.getElementById('frame-quality-label').textContent = frameQuality.value + '%'; });

  dropZone.addEventListener('click', function () { input.click(); });
  dropZone.addEventListener('keydown', function (event) { if (event.key === 'Enter' || event.key === ' ') input.click(); });
  dropZone.tabIndex = 0;
  dropZone.addEventListener('dragover', function (event) { event.preventDefault(); dropZone.classList.add('dragover'); });
  dropZone.addEventListener('dragleave', function () { dropZone.classList.remove('dragover'); });
  dropZone.addEventListener('drop', function (event) { event.preventDefault(); dropZone.classList.remove('dragover'); loadFile(event.dataTransfer.files[0]); });
  input.addEventListener('change', function () { loadFile(input.files[0]); input.value = ''; });
  replaceButton.addEventListener('click', function () { input.click(); });
  processButton.addEventListener('click', processVideo);
  download.addEventListener('click', function () { track('download_clicked', { output_type: download.download.split('.').pop() }); });
  window.addEventListener('beforeunload', function () { if (sourceUrl) URL.revokeObjectURL(sourceUrl); if (resultUrl) URL.revokeObjectURL(resultUrl); });
  track('tool_page_view', { processing_mode: config.mode });
})();
