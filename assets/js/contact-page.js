(function () {
  'use strict';

  var button = document.querySelector('.contact-page-copy-button');
  var address = document.querySelector('.contact-page-address');
  var status = document.querySelector('.contact-page-copy-status');
  if (!button || !address || !status) return;

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
      if (window.location.hostname === 'scanapp.org' && typeof window.gtag === 'function') {
        try {
          window.gtag('event', 'contact_email_copy', { page_path: '/contact/', content_group: 'contact' });
        } catch (error) { /* Measurement must not change the copy result. */ }
      }
      resetTimer = window.setTimeout(function () { button.textContent = 'Copy email'; }, 2500);
    } catch (error) {
      status.textContent = 'Couldn’t copy. Select the email address above to copy it.';
    } finally {
      button.disabled = false;
    }
  });
})();
