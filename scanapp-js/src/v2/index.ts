import { appShell } from "./app-shell";
import { PageId } from "./types";
import { ScanPage } from "./pages/scan-page/scan-page";
import { ComingSoonPage } from "./pages/coming-soon-page";
import { IS_DEBUG } from "../scanapp/constants";
import { Logger } from "../scanapp/logger";

function docReady(func: () => void) {
  if (document.readyState === "complete" || document.readyState === "interactive") {
    setTimeout(func, 1);
  } else {
    document.addEventListener("DOMContentLoaded", func);
  }
}

docReady(() => {
  const router = appShell.getRouter();
  
  // Register pages
  router.register(new ScanPage());
  router.register(new ComingSoonPage(PageId.HISTORY, "History"));
  router.register(new ComingSoonPage(PageId.CREATE, "Create QR"));
  router.register(new ComingSoonPage(PageId.SETTINGS, "Settings"));

  // Navigate to ScanPage by default
  appShell.navigateTo(PageId.SCAN);
});

// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/sw.js')
    .then(() => {
      // Service worker loaded
    })
    .catch((err) => {
      console.warn('Service Worker registration failed:', err);
    });
}

window.addEventListener('DOMContentLoaded', () => {
  let displayMode = Logger.getDisplayMode();
  if (IS_DEBUG) {
    console.log('DISPLAY_MODE_LAUNCH:', displayMode);
  } else {
    Logger.logDisplayMode(displayMode);
  }
});
