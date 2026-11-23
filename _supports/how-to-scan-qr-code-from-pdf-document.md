---
layout: support_page
title: "How to Scan a QR Code from a PDF Document"
description: "Read a QR code directly from a PDF on your device, or use a screenshot when needed. Step-by-step help for phones and computers."
toc: true
---

Tickets, invoices, and guides often contain QR codes inside a PDF. When the PDF is already on your phone or computer, you do not need another device to read it.

**[Open the PDF QR code scanner](/scan-qr-code-from-pdf/)** to choose your document and scan a selected page directly. Your PDF is processed on your device, without a document upload or account.

## Method 1: Read the QR Code Directly from the PDF

Use the [ScanApp PDF QR code scanner](/scan-qr-code-from-pdf/) for an unencrypted PDF of up to **20 MB and 200 pages**. The tool looks for **one QR code on the selected page at a time**. It does not automatically scan every page or guarantee that it will find every code on a page. Other barcode types are not supported by this PDF tool.

<h3 id="choose-pdf">1. Choose your PDF</h3>

Open the tool and choose a PDF from your device. You can also try the sample PDF before selecting your own file. Password-protected PDFs are not supported; use the screenshot method below if you can view the document in your PDF reader.

<h3 id="select-page">2. Select the page containing the QR code</h3>

Use the page controls to locate the code. Check the page preview, then scan the selected page. If a page has more than one QR code, use a screenshot of the individual code you want to read instead.

<h3 id="read-result">3. Read or copy the result</h3>

When a QR code is found, check the decoded text before opening a link. You can copy the result. If no code is found, check that you selected the right page or try the screenshot method with a larger, clearer view of the code.

## Method 2: Save a Screenshot and Scan the Image

A screenshot is useful when the PDF cannot be opened by the tool, a page has several QR codes, or a small code needs a closer crop. Include the white margin around the code.

### On Windows 10 & Windows 11

1. Open the PDF and display the page containing the QR code.
2. Press **Windows + Shift + S** and select the area around the code.
3. Open the capture in **Snipping Tool** and save it as an image file.
4. Open the [ScanApp image scanner](/).
5. Choose **Upload image** and select the saved screenshot, or drag the image file into the scanner.

### On macOS

1. Open the PDF and display the QR code.
2. Press **Command + Shift + 4** and select the area around the code. The screenshot normally saves to your Desktop.
3. Open the [ScanApp image scanner](/).
4. Choose **Upload image** and select the screenshot, or drag the saved image file into the scanner.

### On iPhone & Android

1. Open the PDF and display the QR code.
2. Take a screenshot using your phone's screenshot controls.
3. Open the [ScanApp image scanner](/) in your browser.
4. Tap **Upload image** and select the screenshot from your photos or files.

## Method 3: Export an Embedded QR Image

Some PDF editors can save an embedded image as a separate file. If your reader offers this option, save the QR image and select it using **Upload image** in the [ScanApp image scanner](/). If image export is unavailable, use a screenshot instead.

## Document Privacy and Result Safety

PDF rendering and QR reading in the PDF tool run locally in your browser. The selected document and decoded QR contents are not uploaded for processing. This is separate from normal website requests for page assets and analytics.

A successfully decoded QR code does not establish that a link, payment request, ticket, or document is trustworthy. Review the result and its destination before acting on it.

## Troubleshooting a Code That Is Not Found

* **Check the page:** The direct PDF tool scans the page you selected, not the entire document.
* **Keep the white margin:** A screenshot cropped against the black squares can be harder to read.
* **Use a clearer view:** Zoom in within your PDF reader before taking a screenshot. Enlarging a blurry source cannot restore missing detail.
* **Isolate one code:** For pages containing several codes, save a screenshot of the individual QR code you need.
* **Check the code type:** The direct PDF tool reads QR codes. For a different supported barcode type, use a screenshot with the main [QR and barcode scanner](/).

## Related Guides

* [How to Scan a QR Code from an Image, Photo, or Screenshot](/supports/how-to-scan-qr-code-from-image-or-photo/)
* [How to Scan a QR Code on Windows 11](/supports/how-to-scan-qr-code-windows-11/)
* [How to Scan a QR Code on Laptop, PC, or Mac](/supports/how-to-scan-qr-code-on-laptop-pc-or-mac)

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to Scan a QR Code from a PDF Document",
  "description": "Choose a supported PDF, select a page, and read one QR code locally in your browser. A saved screenshot is an alternative when needed.",
  "step": [
    {
      "@type": "HowToStep",
      "name": "Choose your PDF",
      "text": "Open the ScanApp PDF QR code scanner and choose an unencrypted PDF of up to 20 MB and 200 pages.",
      "url": "https://scanapp.org{{ page.url }}#choose-pdf"
    },
    {
      "@type": "HowToStep",
      "name": "Select the page",
      "text": "Select the page containing the QR code, check its preview, and scan the selected page. The tool looks for one QR code at a time.",
      "url": "https://scanapp.org{{ page.url }}#select-page"
    },
    {
      "@type": "HowToStep",
      "name": "Read or copy the result",
      "text": "Review the decoded text before opening a link, or copy the result. If no code is found, check the selected page or use a screenshot of the individual QR code.",
      "url": "https://scanapp.org{{ page.url }}#read-result"
    }
  ]
}
</script>
