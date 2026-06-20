---
layout: blog_post
title: "How to Convert HEIC and SVG Images Locally in Your Browser"
description: "Tired of online converters uploading your photos? Learn how to convert Apple HEIC and SVG images to PNG, JPG, and WebP completely offline in your browser."
post-no: 19
toc: true
author: ScanApp Team
author_url: "https://scanapp.org"
---

If you use an Apple device like an iPhone or iPad, you've likely run into compatibility issues with **HEIC** (High Efficiency Image Container) files. While HEIC is fantastic for saving storage space, it isn't supported on many Windows applications, older web browsers, or school portal uploads.

Similarly, **SVG** (Scalable Vector Graphics) is a vector format widely used by designers, but rasterizing it to PNG or JPG is often necessary before publishing it to social media or inserting it into documents.

Traditional online image converters solve this by uploading your images to remote servers. At ScanApp, we believe your files should stay on your device. We've updated our suite with a **100% private batch image converter** that converts HEIC and SVG files directly in your web browser.

---

## The Technology: How We Convert HEIC Offline

Browsers do not natively know how to decode Apple's HEIC format. To make offline HEIC conversion possible:
1. ScanApp loads a client-side library called `heic2any` inside your browser.
2. When you drop a HEIC image, the library decompresses the image data into raw pixels using JavaScript entirely on your device.
3. The raw image data is rendered onto an offscreen canvas and encoded into standard formats like JPG, PNG, or WebP.

Since the decoding and encoding happen inside your browser's memory sandbox, no data is sent to the internet. It is fast, secure, and works even when you are offline (on an airplane, in a train, or in areas with poor cellular reception).

---

## Features of the New Image Converter

The ScanApp Image Converter comes equipped with:
- **Batch Processing**: Select or drag up to 100 images at once. Mix different source formats (e.g. drop 3 HEICs, 2 SVGs, and a PNG).
- **One-Click Target Format**: Set a global target format (PNG, JPG, WebP, AVIF, GIF, or PDF) and convert the entire batch with a single click.
- **Image-to-PDF Conversion**: Package any set of images into standard PDF documents directly on your device.
- **Custom Quality & Width**: Scale down image widths and adjust quality percentages to control output file sizes.

---

## Step-by-Step Guide

1. Go to the [ScanApp Image Converter](https://scanapp.org/image-converter/).
2. Select the format you wish to convert your files to from the pill selectors (e.g. **WEBP**).
3. Drag and drop your HEIC, SVG, PNG, or JPG files into the upload box (or click to pick files).
4. Tap **Convert all** or click individual download buttons on each file row.
5. If converting a batch, click **Download all (ZIP)** to grab all converted files in a single, offline ZIP package.
