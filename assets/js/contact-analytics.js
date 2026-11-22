(function () {
  'use strict';

  if (window.location.hostname !== 'scanapp.org' || window.__scanappContactAnalyticsInitialized) {
    return;
  }
  window.__scanappContactAnalyticsInitialized = true;

  var measurementId = 'G-2KZEP7DPYH';
  var pagePath = window.location.pathname;
  var pageLocation = window.location.origin + pagePath;
  var isContactPage = /^\/contact\/?$/.test(pagePath);

  // Reuse the page's existing tag/queue; other page families own their GA loader.
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== 'function') {
    window.gtag = function () { window.dataLayer.push(arguments); };
  }

  if (isContactPage) {
    var referrer = '';
    if (document.referrer) {
      try {
        var referrerUrl = new URL(document.referrer);
        referrer = referrerUrl.origin + referrerUrl.pathname;
      } catch (e) { /* Omit an invalid referrer. */ }
    }
    window.gtag('js', new Date());
    window.gtag('config', measurementId, {
      page_location: pageLocation,
      page_path: pagePath,
      page_referrer: referrer,
      content_group: 'contact'
    });

    if (!document.querySelector('script[src*="googletagmanager.com/gtag/js?id=' + measurementId + '"]')) {
      var script = document.createElement('script');
      script.async = true;
      script.src = 'https://www.googletagmanager.com/gtag/js?id=' + measurementId;
      document.head.appendChild(script);
    }
  }

  document.addEventListener('click', function (event) {
    if (event.defaultPrevented) return;
    var target = event.target;
    if (target && target.nodeType === 3) target = target.parentElement;
    var link = target && typeof target.closest === 'function' && target.closest('a[href]');
    if (!link) return;

    var destination;
    try { destination = new URL(link.href, window.location.href); } catch (e) { return; }

    if (link.classList.contains('scanapp-contact-link') &&
        destination.origin === window.location.origin &&
        /^\/contact\/?$/.test(destination.pathname)) {
      window.gtag('event', 'contact_link_click', {
        page_location: pageLocation,
        page_path: pagePath,
        destination_path: '/contact/',
        link_placement: 'footer'
      });
      return;
    }

    var isEmailButton = link.classList.contains('contact-page-email-button');
    var isEmailAddress = link.classList.contains('contact-page-address');
    if (isContactPage && destination.protocol === 'mailto:' && (isEmailButton || isEmailAddress)) {
      // Click intent only: do not record the address, subject, message or link text.
      window.gtag('event', 'contact_email_click', {
        page_location: pageLocation,
        page_path: pagePath,
        content_group: 'contact',
        link_type: isEmailButton ? 'button' : 'address'
      });
    }
  });
})();
