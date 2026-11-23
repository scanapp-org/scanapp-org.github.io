/* Shared limits and safe result handling for the isolated PDF QR reader. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.ScanAppPdfQR = factory();
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';
  function hasPdfHeader(bytes) {
    var signature = [37, 80, 68, 70, 45];
    for (var i = 0; i <= Math.min(bytes.length - 5, 1023); i++) {
      if (signature.every(function (value, offset) { return bytes[i + offset] === value; })) return true;
    }
    return false;
  }
  function safeWebUrl(text) {
    if (!/^https?:\/\//i.test(text) || /[\u0000-\u0020\u007f]/.test(text)) return null;
    try {
      var url = new URL(text);
      return (url.protocol === 'https:' || url.protocol === 'http:') && !url.username && !url.password ? url.href : null;
    } catch (error) { return null; }
  }
  function renderScale(width, height) {
    if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) throw new Error('invalid_page');
    return Math.min(2.5, 1800 / Math.max(width, height), Math.sqrt(3000000 / (width * height)));
  }
  function sizeBucket(size) {
    if (size < 1024 * 1024) return 'under_1mb';
    return size <= 5 * 1024 * 1024 ? '1_to_5mb' : 'over_5mb';
  }
  return Object.freeze({ maxBytes: 20 * 1024 * 1024, maxPages: 200, hasPdfHeader: hasPdfHeader, safeWebUrl: safeWebUrl, renderScale: renderScale, sizeBucket: sizeBucket });
});
