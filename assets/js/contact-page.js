(function () {
  'use strict';

  var button = document.querySelector('.contact-page-copy-button');
  var address = document.querySelector('.contact-page-address');
  var status = document.querySelector('.contact-page-copy-status');
  if (!button || !address || !status) return;

  var pagePath = window.location.pathname;
  var isSidebar = button.getAttribute('data-contact-placement') === 'sidebar';
  var contentGroup = isSidebar ? 'support' : 'contact';
  function track(name, extra) {
    if (window.location.hostname !== 'scanapp.org' || typeof window.gtag !== 'function') return;
    var params = { page_path: pagePath, content_group: contentGroup };
    if (isSidebar) params.link_placement = 'sidebar';
    if (extra) params.link_type = extra;
    try { window.gtag('event', name, params); } catch (error) { /* Preserve the action result. */ }
  }
  if (isSidebar) {
    var emailButton = document.querySelector('.support-contact-card .contact-page-email-button');
    if (emailButton) emailButton.addEventListener('click', function () { track('contact_email_click', 'button'); });
    address.addEventListener('click', function () { track('contact_email_click', 'address'); });
  }
  button.hidden = false;
  var resetTimer;
  button.addEventListener('click', async function () {
    if (button.disabled) return;
    window.clearTimeout(resetTimer);
    button.disabled = true;
    button.textContent = 'Copy email';
    status.textContent = '';
    try {
      if (!navigator.clipboard || typeof navigator.clipboard.writeText !== 'function') {
        throw new Error('Clipboard unavailable');
      }
      await navigator.clipboard.writeText(address.textContent.trim());
      button.textContent = 'Copied!';
      status.textContent = 'Email address copied.';
      track('contact_email_copy');
      resetTimer = window.setTimeout(function () { button.textContent = 'Copy email'; }, 2500);
    } catch (error) {
      status.textContent = 'Couldn’t copy. Select the email address above to copy it.';
    } finally {
      button.disabled = false;
    }
  });
})();
