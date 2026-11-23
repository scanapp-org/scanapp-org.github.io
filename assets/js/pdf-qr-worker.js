/* Decode pixels locally, away from the page's UI thread. No network/user content APIs. */
importScripts('/assets/vendor/jsqr/jsQR.js');
self.onmessage = function (event) {
  var job = event.data;
  if (!job || !Number.isInteger(job.width) || !Number.isInteger(job.height) || job.width < 1 || job.height < 1 || job.width * job.height > 3100000 || !(job.pixels instanceof ArrayBuffer) || job.pixels.byteLength !== job.width * job.height * 4) {
    self.postMessage({ id: job && job.id, error: 'invalid_pixels' });
    return;
  }
  try {
    var result = jsQR(new Uint8ClampedArray(job.pixels), job.width, job.height, { inversionAttempts: 'attemptBoth' });
    self.postMessage({ id: job.id, found: !!result, text: result ? result.data : '' });
  } catch (error) {
    self.postMessage({ id: job.id, error: 'decode_error' });
  }
};
