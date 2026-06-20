---
layout: support_page
title: How to Use ScanApp Online Image Converter
description: "Learn how to use ScanApp's free batch image converter to convert files locally, troubleshoot format issues, and output PDF documents."
toc: true
---

ScanApp's Image Converter is a web-based, offline-first batch utility that allows you to convert images between major formats (HEIC, PNG, JPG, WebP, AVIF, SVG, GIF, BMP, and PDF) without uploading files to a server.

---

## Supported Formats

Our converter supports both reading (importing) and writing (exporting) for a wide range of formats:

### Input Formats (What you can import)
- **Standard Raster**: PNG, JPG/JPEG, WebP, GIF, BMP, TIFF/TIF.
- **Apple HEIC/HEIF**: High efficiency photos from iOS devices.
- **Vectors**: SVG.

### Output Formats (What you can convert to)
- **PNG**: Best for graphic elements and logos. Preserves transparency.
- **JPG**: Best for photographs. Fills transparent backgrounds with white.
- **WebP**: Modern web format with high compression rates and alpha support.
- **AVIF**: Next-gen compression. (Note: Only encodes if supported by your browser).
- **GIF**: Decodes and outputs static images.
- **PDF**: Wraps the image into a standard page-size PDF document.

---

## Advanced Options

### 1. Output Quality
Adjust the slider to balance file size and visual fidelity:
- **80% (Default)**: Best for standard conversions.
- **90%+**: Keeps original details crisp, but produces larger files.

### 2. Maximum Width
You can optionally enter a maximum pixel width (e.g. `1920` for standard HD). If the input image is wider than this limit, it will be scaled down proportionally. This is highly useful for optimizing ultra-high-res camera captures before sending them.

---

## Troubleshooting & FAQs

### Why is my HEIC file not converting?
- Make sure you are using a modern browser. HEIC decoding requires a JavaScript decoder which executes inside your browser tab; older browsers may run out of memory or fail to parse the scripts.
- Ensure the file is not corrupted.

### Why is AVIF conversion falling back to PNG?
AVIF encoding is supported in newer versions of Chrome, Edge, and Opera, but is not yet fully supported by Safari and Firefox engines. If your browser does not support encoding to AVIF, ScanApp automatically falls back to PNG or JPEG format so that your conversion does not fail.

### Can I convert animated GIFs?
Our browser-side converter will parse the first frame of the GIF and convert it to a static image in your target format.
