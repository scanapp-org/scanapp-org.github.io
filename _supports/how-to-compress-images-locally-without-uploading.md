---
layout: support_page
title: How to Compress Images Locally Without Uploading
description: "Confused about how browser-based image compression works? Learn how to shrink JPG, PNG, WebP, and AVIF images offline and privately on your device."
toc: true
---

Unlike traditional online image optimizers, ScanApp's image compressor does not upload your files to any remote server. It executes all processing on your device using HTML5 Canvas APIs, ensuring absolute privacy.

This support page covers common questions, settings, and troubleshooting tips for our offline image compressor.

---

## How Offline Compression Works

When you drag and drop or upload an image to ScanApp:
1. The browser loads the file as a local object URL.
2. An offscreen HTML5 `<canvas>` element draws the image data.
3. The browser re-encodes the image to your selected output format and quality using standard browser APIs (`canvas.toBlob`).
4. The compressed blob is served back as a download link.

Since all operations occur within your browser's execution thread, no data leaves your device. 

---

## Adjusting Settings for Best Results

### 1. Quality Slider
The slider controls the encoding quality:
- **70% - 80% (Recommended)**: Ideal balance. Drastically reduces file size (often by 70%) with zero visible difference.
- **30% - 50%**: Maximum compression. Good for documents or fast transfers where minor compression artifacts are acceptable.

### 2. Maximum Width
If you are uploading high-resolution photos (e.g., 4000px wide from a phone camera), they can be unnecessarily large for email or web use. Entering a **Maximum width** (like `1920` or `1200`) will scale the image down proportionally while maintaining aspect ratio, saving even more space.

### 3. Output Formats
- **Smart (Default)**: Keeps transparency for PNG and SVG files (converting them to WebP), and compresses others to high-compatibility JPEG.
- **JPG**: Best for photographs. Note: JPG does not support transparent backgrounds and will fill transparent regions with white.
- **WebP**: Modern format supporting transparency and excellent compression. 
- **PNG**: Lossless compression. File sizes will remain relatively large but retain pixel-perfect quality.
- **AVIF**: Next-generation format (highly compressed). Supported natively by modern browsers (e.g. Chrome, Opera).

---

## Troubleshooting

### Why is the compressed image larger than the original?
This can happen if:
- You upload an already highly optimized image and compress it with a high quality setting (like 90%+).
- You convert a compressed JPG to lossless PNG format.
To fix this, lower the quality slider or reduce the maximum width.

### Why is AVIF/GIF output not working?
Some older browsers do not support writing/encoding to newer formats like AVIF. If your browser does not support encoding to your selected output format, ScanApp will automatically fall back to a compatible format (like PNG or JPG) to prevent file corruption.
