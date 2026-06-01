---
layout: support_page
title: "How to Scan a QR Code from a PDF Document"
description: "Learn how to easily read and decode a QR code embedded inside a digital PDF document (such as tickets, bills, or ebooks) without using a camera."
toc: true
---

Many organizations send tickets, boarding passes, invoices, or guides as digital PDF documents. Often, these PDFs contain a QR code that you need to scan. But if the PDF is on the screen of the device you are currently using, you cannot point your camera at it.

Fortunately, you don't need a second device or camera. You can extract and scan a QR code from a PDF document using **ScanApp.org**. 

Here is the complete step-by-step workflow for mobile and desktop devices.

---

## Method 1: The Screenshot and Upload Trick (Desktop & Mobile)

The easiest way to scan a QR code from a PDF is to capture a screenshot of the code and upload it directly to ScanApp.

### On Windows 10 & Windows 11
1. Open the PDF on your screen and scroll to the page containing the QR code.
2. Press the **Windows Key + Shift + S** to launch the Snipping Tool.
3. Click and drag a rectangle over the QR code to take a snapshot of it. (The image is copied to your clipboard).
4. Navigate to [ScanApp.org](https://scanapp.org) in Chrome, Edge, or Firefox.
5. Click on the scan area and press **Ctrl + V** to paste the screenshot. ScanApp will decode it instantly.

### On macOS
1. Open the PDF on your screen.
2. Press **Command + Shift + 4** to turn your cursor into a crosshair.
3. Click and drag to capture a box around the QR code. The screenshot will save to your Desktop.
4. Go to [ScanApp.org](https://scanapp.org) in your browser.
5. Click the **Upload File** icon and drag the screenshot file from your Desktop into the scanner area.

### On iPhone & Android
1. Open the PDF on your phone's screen and locate the QR code.
2. Take a screenshot (usually by pressing the **Power + Volume Down** buttons on Android, or **Power + Volume Up** on iPhone).
3. Navigate to [ScanApp.org](https://scanapp.org) in your mobile browser.
4. Tap the **Scan Image File** button (folder icon).
5. Select the screenshot from your photo library.

---

## Method 2: Extracting the Image from the PDF
If you are using a PDF reader (like Adobe Acrobat or Google Chrome's PDF viewer) on a computer:
1. Right-click the QR code image within the PDF document.
2. Select **Save Image As...** or **Copy Image**.
3. If copied, paste it directly into [ScanApp.org](https://scanapp.org). If saved, upload the saved image file.

---

## Why ScanApp is Safe for Financial & Invoice PDFs

Because invoices, tickets, and official documents contain sensitive personal information, security is critical.
* Unlike other online PDF scanner websites, ScanApp **never uploads your documents or images to a server**.
* The image decoding script runs entirely client-side using JavaScript WebAssembly.
* Your data remains private, local, and secure in your browser.

---

## Troubleshooting Failed Screenshot Scans

If ScanApp fails to decode the QR code from your PDF screenshot, try these adjustments:
* **Avoid Tight Cropping**: Ensure you capture the white margin (the "quiet zone") surrounding the black squares of the QR code. If the crop is too close to the borders, the scanner won't recognize it.
* **Increase Zoom Level**: Before taking the screenshot, zoom in on the PDF to make the QR code larger and higher resolution.
* **Check Screen Glare**: If you are taking a photo of a screen instead of a direct screenshot, glare or moiré patterns can disrupt decoding. Always use screenshots when possible.

---

## Related Guides

* [How to Scan a QR Code from an Image, Photo, or Screenshot](/supports/how-to-scan-qr-code-from-image-or-photo/)
* [How to Scan a QR Code on Windows 11](/supports/how-to-scan-qr-code-windows-11/)
* [How to Scan a QR Code on Laptop, PC, or Mac](/supports/how-to-scan-qr-code-on-laptop-pc-or-mac/)

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to Scan a QR Code from a PDF Document",
  "description": "Step-by-step instructions to take a screenshot of a QR code in a PDF and scan it online without a camera.",
  "step": [
    {
      "@type": "HowToStep",
      "name": "Locate the QR code",
      "text": "Open your PDF file and scroll to the section containing the QR code.",
      "url": "https://scanapp.org/supports/how-to-scan-qr-code-from-pdf-document/#locate"
    },
    {
      "@type": "HowToStep",
      "name": "Take a screenshot",
      "text": "Use your device shortcuts (e.g. Win+Shift+S on Windows, Cmd+Shift+4 on Mac, or physical button shortcuts on mobile) to capture the QR code.",
      "url": "https://scanapp.org/supports/how-to-scan-qr-code-from-pdf-document/#screenshot"
    },
    {
      "@type": "HowToStep",
      "name": "Paste or upload to ScanApp",
      "text": "Go to scanapp.org. Click the upload button and select your screenshot, or paste it directly using Ctrl+V or Cmd+V.",
      "url": "https://scanapp.org/supports/how-to-scan-qr-code-from-pdf-document/#upload"
    }
  ]
}
</script>
