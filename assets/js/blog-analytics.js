(function () {
  'use strict';

  // Scope copied blog templates to the first-party production site.
  if (window.location.hostname !== 'scanapp.org' || window.__scanappBlogAnalyticsInitialized) {
    return;
  }
  window.__scanappBlogAnalyticsInitialized = true;

  var measurementId = 'G-2KZEP7DPYH';
  var contentGroup = /^\/supports?\//.test(window.location.pathname) ? 'support' : 'blog';
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    page_location: window.location.origin + window.location.pathname,
    page_path: window.location.pathname,
    content_group: contentGroup
  });

  // Record the next tool chosen, never the link query, file data or decoded text.
  document.addEventListener('click', function (event) {
    var link = event.target.closest && event.target.closest('a[href]');
    if (!link) return;
    var destination;
    try { destination = new URL(link.href, window.location.href); } catch (e) { return; }
    if (destination.origin !== window.location.origin) return;
    if (!/^\/(?:$|(?:generate|image-compressor|image-converter|barcode|isbn|scan-qr-code-from-pdf)\/?$)/.test(destination.pathname)) {
      return;
    }
    window.gtag('event', 'content_tool_click', {
      content_group: contentGroup,
      destination_path: destination.pathname
    });
  });

  var script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=' + measurementId;
  document.head.appendChild(script);
})();
