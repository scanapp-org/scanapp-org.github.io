/**
 * @fileoverview - Global export file.
 * HTML5 QR code & barcode scanning library.
 * - Decode QR Code.
 * - Decode different kinds of barcodes.
 * - Decode using web cam, smart phone camera or using images on local file
 *   system.
 *
 * @author mebjas <minhazav@gmail.com>
 *
 * The word "QR Code" is registered trademark of DENSO WAVE INCORPORATED
 * http://www.denso-wave.com/qrcode/faqpatent-e.html
 */

import { IS_DEBUG } from "./scanapp/constants";
import { PWA_ENABLED } from "./scanapp/pwa";
import { ScanApp } from "./scanapp/app";
import { Logger } from "./scanapp/logger";
import { overrideFtpBacklink } from "./scanapp/back-link";

function docReady(func: ( )=> void) {
    // see if DOM is already available
    if (document.readyState === "complete" || document.readyState === "interactive") {
        // call on next available tick
        setTimeout(func, 1);
    } else {
        document.addEventListener("DOMContentLoaded", func);
    }
}

docReady(() => {
    ScanApp.createAndRender();
    overrideFtpBacklink();
});

////////////////////////////////////////////////////////////////////////////////
//    Register Service Worker for PWA.
////////////////////////////////////////////////////////////////////////////////
if (PWA_ENABLED) {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker
          .register('/sw.js')
          .then(() => {
            if (IS_DEBUG) {
                console.log('Service Worker Registered');
            }
        });
    }
}

////////////////////////////////////////////////////////////////////////////////
//    Tracking weather app is being loaded on web on PWA
////////////////////////////////////////////////////////////////////////////////

window.addEventListener('DOMContentLoaded', () => {
    let displayMode = 'Browser_tab';
    if (window.matchMedia('(display-mode: standalone)').matches) {
      displayMode = 'PWA_standalone';
    }
    if (IS_DEBUG) {
        // Log launch display mode to analytics
        console.log('DISPLAY_MODE_LAUNCH:', displayMode);
    } else {
        Logger.logDisplayMode(displayMode);
    }
});