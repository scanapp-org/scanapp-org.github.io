---
layout: blog_post
title: "Why HTML5-QRCode is the Leading JavaScript QR Scanner Library"
description: "An in-depth look at html5-qrcode, the open-source library powering ScanApp, and why developers choose it for web-based scanning."
post-no: 13
toc: true
author: ScanApp Team
author_url: "https://scanapp.org"
---

When building web applications that require QR or barcode scanning, developers historically had to rely on native plugins or paid wrappers. Today, **html5-qrcode** is the most popular open-source library for client-side scanning on the web.

In this post, we discuss the core features of `html5-qrcode` and why we chose it to power ScanApp.org.

---

## What makes html5-qrcode stand out?

Developed as an open-source project, `html5-qrcode` provides a lightweight wrapper around browser camera APIs and decoding libraries:

* **No Server Dependency**: All image processing and mathematical matrix calculations run in the user's browser via WebWorkers and JavaScript.
* **Broad Code Support**: Decodes standard QR codes alongside common 1D retail barcodes (UPC, EAN, Code 39, Code 128, etc.).
* **Cross-Browser Compatibility**: Handles camera controls across iOS (Safari), Android (Chrome/Firefox), and desktop operating systems smoothly.
* **Adaptive Scanning**: Dynamically scales scanning areas and adjusts frames-per-second (FPS) to optimize battery life on mobile devices.

---

## Integrating It Into Your Project

To add standard web camera scanning to your own website:

```javascript
// Install library via npm or include via CDN script
const html5QrCode = new Html5Qrcode("reader");

html5QrCode.start(
  { facingMode: "environment" }, // Use back camera
  {
    fps: 10,                    // 10 frames per second
    qrbox: { width: 250, height: 250 }
  },
  (decodedText, decodedResult) => {
    // Success callback
    console.log(`Scan result: ${decodedText}`);
  },
  (errorMessage) => {
    // Silent parsing errors or camera warnings
  }
).catch((err) => {
  // Permission or hardware errors
});
```

---

## Why ScanApp Picked html5-qrcode

When the ScanApp team evaluated scanning libraries in early development, we benchmarked five options:

- **html5-qrcode** (maintained by @mebjas)
- **ZXing-js** (port of the Java ZXing library)
- **Quagga2** (community fork of QuaggaJS, focused on 1D barcodes)
- **jsQR** (lightweight QR-only decoder)
- **Dynamsoft Barcode Reader JS** (commercial)

`html5-qrcode` won on three axes that matter:

1. **Format breadth.** Handles QR plus the full 1D barcode set (UPC, EAN, Code 128, Code 39) and 2D formats like Aztec and Data Matrix in a single bundle.
2. **Camera handling on iOS Safari.** This is the single biggest source of failure in browser scanning. `html5-qrcode` handles iOS quirks (orientation, permission re-prompts, picture-in-picture stalls) better than the alternatives.
3. **Active maintenance.** Issues get triaged, PRs get reviewed, and breaking changes are clearly documented.

`jsQR` is faster for QR-only use cases but doesn't decode any 1D barcodes. `ZXing-js` matches the format set but ships a larger bundle and is less actively maintained. `Quagga2` is excellent for retail barcode work but lacks QR support. `Dynamsoft` is technically excellent but requires a paid license — incompatible with our free, open-source positioning.

---

## Bundle Size and Performance

`html5-qrcode` is approximately 230 KB minified + gzipped (varies slightly by version). On a modern phone, decoding runs at 10–30 FPS depending on camera resolution and viewport size. ScanApp pins FPS at 10 to balance speed against battery life.

For comparison:
- `jsQR`: ~50 KB (QR only)
- `ZXing-js` (full): ~400 KB
- `Quagga2`: ~120 KB (1D barcodes only)
- `Dynamsoft`: ~600 KB + WASM

The 230 KB cost gets you everything in one library, which beats stitching together three libraries to cover the format matrix.

---

## Common Integration Patterns

### Drag-and-drop image scanning

```javascript
const fileInput = document.getElementById('file-input');
const html5QrCode = new Html5Qrcode("reader");

fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  try {
    const result = await html5QrCode.scanFile(file, true);
    console.log("Decoded:", result);
  } catch (err) {
    console.error("Decode failed:", err);
  }
});
```

### Switching cameras

```javascript
const cameras = await Html5Qrcode.getCameras();
// Pick the back camera if available
const backCam = cameras.find(c => c.label.toLowerCase().includes('back')) || cameras[0];
html5QrCode.start({ deviceId: backCam.id }, config, onSuccess, onError);
```

### Restricting to specific formats

```javascript
const config = {
  fps: 10,
  qrbox: 250,
  formatsToSupport: [
    Html5QrcodeSupportedFormats.QR_CODE,
    Html5QrcodeSupportedFormats.EAN_13,
    Html5QrcodeSupportedFormats.UPC_A
  ]
};
```

This is how ScanApp's [ISBN scanner](/isbn/) restricts itself to ISBN-13 — by filtering formats client-side after the standard EAN-13 decode.

---

## Pitfalls to Watch For

- **iOS Safari camera permission UX is unique.** The first time the user grants permission, Safari prompts inline; afterward it's cached. Test the "denied" path carefully — your error UI should explain how to re-enable in Settings.
- **The `qrbox` config affects performance.** Smaller decode windows are faster but require the user to aim more precisely. ScanApp uses 250×250 px at standard density for a balance.
- **HTTPS is required** for browser camera APIs. Local development on `localhost` works; deploying to plain HTTP breaks camera access entirely.
- **`facingMode: "environment"`** doesn't always select the back camera on Android. On multi-camera phones (ultrawide + standard + telephoto), Android may pick the ultrawide, which has the wrong focal length. Always enumerate cameras explicitly and pick by label.

---

## When to Pick a Different Library

- **QR-only use case, bundle-size critical:** Use `jsQR`.
- **1D retail barcode only, no QR:** Use `Quagga2`.
- **Enterprise commercial product with budget:** `Dynamsoft` has the highest accuracy and best support, but requires licensing.
- **Need to ship in a native app via WebView:** Either `html5-qrcode` works, or use the platform-native scanner (Apple Vision, ML Kit) and avoid web entirely.

For most open-source web projects that need a scanner, `html5-qrcode` is the right default.

---

## Frequently Asked Questions

### Is html5-qrcode open source?
Yes. It's released under the Apache 2.0 license and developed publicly on GitHub.

### Does html5-qrcode work on iPhone?
Yes. It uses the standard WebRTC `getUserMedia` API which is supported in Safari on iOS 11+. Camera permission must be granted by the user on first use.

### What barcode formats does html5-qrcode support?
QR Code, Aztec, Code 39, Code 93, Code 128, Codabar, Data Matrix, EAN-13, EAN-8, ITF, MaxiCode, PDF417, RSS-14, UPC-A, and UPC-E.

### Does html5-qrcode upload images to a server?
No. All decoding runs in the user's browser. Nothing is uploaded.

### Why does ScanApp use html5-qrcode?
Format breadth, iOS Safari handling, active maintenance, and open-source licensing — all in a single 230 KB bundle.

---

## Related Reading

- [Why You Should Avoid Downloading QR Code Scanner Apps](/2026/05/24/why-you-should-avoid-downloading-qr-scanner-apps/)
- [How to Scan QR Codes Completely Offline](/2026/05/24/how-to-scan-qr-codes-completely-offline/)
- [ScanApp Barcode Scanner](/barcode/)

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Is html5-qrcode open source?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. It's released under the Apache 2.0 license and developed publicly on GitHub."
      }
    },
    {
      "@type": "Question",
      "name": "Does html5-qrcode work on iPhone?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. It uses the standard WebRTC getUserMedia API which is supported in Safari on iOS 11+. Camera permission must be granted by the user on first use."
      }
    },
    {
      "@type": "Question",
      "name": "What barcode formats does html5-qrcode support?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "QR Code, Aztec, Code 39, Code 93, Code 128, Codabar, Data Matrix, EAN-13, EAN-8, ITF, MaxiCode, PDF417, RSS-14, UPC-A, and UPC-E."
      }
    },
    {
      "@type": "Question",
      "name": "Does html5-qrcode upload images to a server?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. All decoding runs in the user's browser. Nothing is uploaded."
      }
    },
    {
      "@type": "Question",
      "name": "Why does ScanApp use html5-qrcode?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Format breadth, iOS Safari handling, active maintenance, and open-source licensing — all in a single 230 KB bundle."
      }
    }
  ]
}
</script>
