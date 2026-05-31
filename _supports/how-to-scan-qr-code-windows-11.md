---
layout: support_page
title: "How to Scan a QR Code on Windows 11"
description: "Scan a QR code on Windows 11 using ScanApp.org, the Windows Camera app, or the Snipping Tool — no install, no signup, works with any webcam."
toc: true
---

Windows 11 still does not ship with a dedicated QR code scanner like iPhone and Android do. The good news: you can decode any QR code in seconds using your webcam, a screenshot, or an image file — without installing anything from the Microsoft Store.

Here are the four reliable methods, ranked from fastest to most niche.

---

## Method 1: Use ScanApp.org in Your Browser (Fastest)

This works on Chrome, Edge, Firefox, and Brave on Windows 11 — anything with webcam access.

1. **Visit [scanapp.org](https://scanapp.org)** in any modern browser.
2. **Click "Request Camera Permission"** and choose **Allow** when Windows prompts you.
3. **Hold the QR code in front of your webcam.** Make sure the entire code fits in the frame.
4. The decoded result appears immediately — tap the link to open it or copy the value to your clipboard.

Everything happens in your browser. No images or scan data are uploaded to a server, so it's safe to use for sensitive QR codes like WiFi passwords or payment links.

---

## Method 2: Scan a QR Code from a Screenshot

If the QR code is already on your screen — in an email, on a website, or inside a PDF — you don't need a webcam at all.

1. **Press `Windows + Shift + S`** to launch the Snipping Tool overlay.
2. **Drag a rectangle** around the QR code. The screenshot is automatically copied to your clipboard.
3. **Visit [scanapp.org](https://scanapp.org)** and click the **Upload Image** icon.
4. **Paste the screenshot** (Ctrl+V) or save it and drag it into the upload area.
5. ScanApp decodes the QR code instantly.

---

## Method 3: Use the Windows Camera App (Limited)

Windows 11 includes a built-in Camera app, but its QR code detection is inconsistent.

1. **Open the Camera app** from the Start menu.
2. **Switch to "Barcode" mode** — click the mode icon on the left side and choose **Barcode** (only available on some Windows 11 builds).
3. **Hold the QR code** in front of your laptop's webcam.
4. The result appears in a notification.

If you don't see a Barcode mode, your version of the Camera app doesn't support it. Use [scanapp.org](https://scanapp.org) instead.

---

## Method 4: Use the Snipping Tool's Built-In QR Reader (Windows 11 23H2+)

Recent Windows 11 builds added basic QR decoding to the Snipping Tool's text-extraction feature.

1. **Take a screenshot** of the QR code with `Windows + Shift + S`.
2. **Open the Snipping Tool** notification or app.
3. **Click "Text actions"** (the small icon at the top of the screenshot).
4. If the QR code contains a URL, the Snipping Tool surfaces a clickable link.

This is convenient but limited — it generally only handles URL QR codes, not WiFi credentials, contact cards, or payment codes. For everything else, [scanapp.org](https://scanapp.org) is more reliable.

---

## Troubleshooting Webcam Issues on Windows 11

* **Camera permission blocked:** Open **Settings → Privacy & security → Camera** and make sure both **Camera access** and **Let apps access your camera** are turned on, plus your specific browser is allowed.
* **Camera in use by another app:** Close Zoom, Teams, OBS, Discord, or any other app that may be holding the webcam.
* **Low-light QR code:** Move closer to a light source or print the QR code on white paper to improve contrast.
* **Old laptop with no webcam:** Use the screenshot method (Method 2) — no camera needed.

---

## Frequently Asked Questions

### Does Windows 11 have a built-in QR code scanner?
Not really. The Camera app has a limited Barcode mode on some builds, and the Snipping Tool can detect QR-encoded URLs after a screenshot, but neither is a dedicated scanner. [ScanApp.org](https://scanapp.org) is the most reliable option.

### How do I scan a QR code on Windows 11 without an app?
Open [scanapp.org](https://scanapp.org) in Chrome or Edge, allow camera access, and hold the QR code in front of your webcam. Or screenshot the code with `Windows + Shift + S` and upload it.

### Can I scan a QR code from an email or website on Windows 11?
Yes. Press `Windows + Shift + S`, snip the QR code, and paste it into the upload area at [scanapp.org](https://scanapp.org).

### Do I need to install anything from the Microsoft Store?
No. Browser-based scanning at [scanapp.org](https://scanapp.org) works without any install or signup.

### How do I scan a WiFi QR code on Windows 11 to join a network?
Scan it at [scanapp.org](https://scanapp.org) to reveal the SSID and password, then add the network manually in **Settings → Network & Internet → Wi-Fi → Manage known networks**.

---

## Try ScanApp on Other Platforms

- [Scan a QR code on iPhone](/supports/how-do-I-scan-a-qr-code-on-my-iphone/)
- [Scan a QR code on Android](/supports/how-to-scan-qr-code-android/)
- [Scan a QR code on a laptop, PC, or Mac](/supports/how-to-scan-qr-code-on-laptop-pc-or-mac/)
- [Scan a QR code from an image or photo](/supports/how-to-scan-qr-code-from-image-or-photo/)

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Does Windows 11 have a built-in QR code scanner?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Not really. The Camera app has a limited Barcode mode on some builds, and the Snipping Tool can detect QR-encoded URLs after a screenshot, but neither is a dedicated scanner. scanapp.org is the most reliable option."
      }
    },
    {
      "@type": "Question",
      "name": "How do I scan a QR code on Windows 11 without an app?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Open scanapp.org in Chrome or Edge, allow camera access, and hold the QR code in front of your webcam. Or screenshot the code with Windows + Shift + S and upload it."
      }
    },
    {
      "@type": "Question",
      "name": "Can I scan a QR code from an email or website on Windows 11?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Press Windows + Shift + S, snip the QR code, and paste it into the upload area at scanapp.org."
      }
    },
    {
      "@type": "Question",
      "name": "Do I need to install anything from the Microsoft Store?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. Browser-based scanning at scanapp.org works without any install or signup."
      }
    },
    {
      "@type": "Question",
      "name": "How do I scan a WiFi QR code on Windows 11 to join a network?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Scan it at scanapp.org to reveal the SSID and password, then add the network manually in Settings → Network & Internet → Wi-Fi → Manage known networks."
      }
    }
  ]
}
</script>
