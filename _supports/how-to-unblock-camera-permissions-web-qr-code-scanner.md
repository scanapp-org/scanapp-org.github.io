---
layout: support_page
title: "How to Unblock Camera Permissions for Web QR Code Scanners"
description: "Step-by-step guide to allow camera access for ScanApp and other web QR code scanners on Safari, Chrome, iOS, Android, Windows, and Mac."
toc: true
---

Web-based QR code scanners like **ScanApp.org** run directly in your browser without requiring any download or installation. However, to scan physical codes, the browser must first obtain permission to use your device's camera. 

If you accidentally clicked **"Block"** or **"Don't Allow"** when prompted, or if your camera isn't turning on, this guide will help you manually unblock camera access.

---

## Why Browser Camera Permissions are Safe

Unlike native scanner apps downloaded from app stores, web apps like ScanApp decode QR codes and barcodes **locally on your device** (client-side) using WebAssembly. 
* Your camera feed is **never uploaded** to any server.
* No personal data or scan history is transmitted.
* Camera access is only active while the ScanApp tab is open and running.

---

## How to Grant Camera Permission on iOS (iPhone & iPad)

Apple devices require permission at both the **system level** and the **browser level**.

### Step 1: Allow Camera in iOS System Settings
1. Open the **Settings** app on your iPhone or iPad.
2. Scroll down and tap your browser (e.g., **Safari** or **Chrome**).
3. Under *Allow Safari/Chrome to Access*, toggle the **Camera** switch to **ON** (green).

### Step 2: Allow Camera in Safari Browser Settings
1. Open Safari and go to [ScanApp.org](https://scanapp.org).
2. Tap the **aA** (or settings icon) on the left side of the address bar.
3. Tap **Website Settings**.
4. Tap **Camera** and set it to **Allow**.
5. Refresh the webpage.

---

## How to Grant Camera Permission on Android

Android handles permissions within the Chrome browser settings or device settings.

### Method 1: Change Permission in Chrome Settings (Fastest)
1. Open Chrome and go to [ScanApp.org](https://scanapp.org).
2. Tap the **Padlock icon** (or settings icon) in the address bar next to the URL.
3. Tap **Permissions** or **Site settings**.
4. Set **Camera** access to **Allow**.
5. Refresh the page.

### Method 2: Allow Camera in Android Settings
1. Open your phone's **Settings** app.
2. Tap **Apps** (or *Apps & Notifications*).
3. Find and tap **Chrome** (or your preferred mobile browser).
4. Tap **Permissions** → **Camera**.
5. Select **Allow only while using the app**.

---

## How to Grant Camera Permission on Desktop (Mac & Windows)

### Google Chrome & Microsoft Edge (Mac / PC)
1. Visit [ScanApp.org](https://scanapp.org).
2. Click the **Padlock/Tune icon** directly to the left of the website URL in the address bar.
3. Toggle the **Camera** setting to **Allow** (or slide the switch to the right).
4. Click the **Reload** button when prompted by the browser.

### Safari on macOS
1. Open Safari and navigate to [ScanApp.org](https://scanapp.org).
2. In the top menu bar, click **Safari** → **Settings for scanapp.org...** (or *Settings for This Website...*).
3. In the pop-up menu next to **Camera**, select **Allow**.
4. Refresh the page.

---

## Troubleshooting Common Camera Errors

If camera permissions are granted but you still see a black screen:

* **Camera in Use by Another Application**: Close background apps that use the webcam (such as Zoom, Teams, Skype, Slack, or Discord) and reload ScanApp.
* **Device Has Multiple Cameras**: ScanApp allows you to switch cameras. Look for the camera selector dropdown in the scanning panel to cycle between front, back, or external webcams.
* **Incognito / Private Browsing Mode**: Some browsers restrict hardware permissions in private tabs. Try loading ScanApp in a normal browsing tab.
* **Hardware Issues**: Ensure your camera works by opening your device's native Camera app. If it fails there, your webcam or camera module might be disconnected or damaged.

---

## Related Guides

* [How to Scan a QR Code on Windows 11](/supports/how-to-scan-qr-code-windows-11/)
* [How to Scan a QR Code on iPhone](/supports/how-do-I-scan-a-qr-code-on-my-iphone/)
* [How to Scan a QR Code on Android](/supports/how-to-scan-qr-code-android/)
* [Can a Webcam Scan a QR Code?](/supports/can-a-webcam-scan-a-qr-code/)

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Why is my browser-based QR scanner not opening the camera?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "This usually happens because camera permissions were previously denied (blocked) or the camera is in use by another application like Zoom or Teams. You can unblock it by clicking the padlock icon in the browser address bar and selecting 'Allow' for the camera."
      }
    },
    {
      "@type": "Question",
      "name": "How do I unblock the camera on my iPhone for Safari?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Go to iOS Settings -> Safari and make sure Camera access is enabled. Then open Safari, tap the 'aA' icon in the address bar, select Website Settings, and set Camera to Allow."
      }
    },
    {
      "@type": "Question",
      "name": "How do I allow camera access on Chrome for Android?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Navigate to scanapp.org, tap the Padlock icon left of the URL in the address bar, select site settings, and change the Camera permission to Allow."
      }
    },
    {
      "@type": "Question",
      "name": "Can I use ScanApp in private/incognito browsing modes?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, but some browsers block hardware access (like cameras) in private mode by default. If you encounter errors, open a standard browsing tab to scan."
      }
    }
  ]
}
</script>
