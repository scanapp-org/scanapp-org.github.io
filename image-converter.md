---
layout: tools
title: "Convert Images Online"
meta_title: "Convert Images Online — Private Batch HEIC, PNG, JPG, WebP & SVG Converter"
meta_description: "Convert images to any format privately in your browser. Supports batch converting HEIC, PNG, JPG, WebP, SVG, GIF, BMP, TIFF, and PDF. No upload, no signup."
permalink: /image-converter/
tool_js:
  - /assets/js/jspdf.umd.min.js
  - /assets/js/heic2any.min.js
  - /assets/js/image-converter.js
---

<section class="tool-hero" aria-labelledby="converter-title">
  <div class="hero-badge">Free • In your browser • No signup</div>
  <h1 id="converter-title">Convert images <span class="text-gradient">to any format.</span></h1>
  <p class="hero-copy">Turn PNG, JPG, WebP, AVIF, HEIC and SVG into whatever you need. Batch convert in your browser — nothing is uploaded.</p>
</section>

<div class="compressor-wrapper">
  <!-- Main Converter Card -->
  <section class="compressor-card" aria-label="Image converter">
    <!-- Drop Zone -->
    <div class="drop-zone" id="drop-zone">
      <input id="image-input" type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml,image/bmp,image/tiff,image/heic,image/heif,.png,.jpg,.jpeg,.webp,.gif,.svg,.bmp,.tiff,.tif,.heic,.heif" multiple hidden>
      <div class="drop-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
          <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>
        </svg>
      </div>
      <h2>Drop images here, or <span class="upload-trigger">click to upload</span></h2>
      <p>PNG, JPG, WebP, AVIF, HEIC, SVG up to 50 MB each — batch up to 100 files</p>
    </div>

    <!-- Global Controls -->
    <div class="compressor-controls">
      <div class="control-group">
        <div class="quality-label-row">
          <label>Convert all to</label>
        </div>
        <div class="format-selectors" id="format-selectors">
          <button type="button" class="format-pill" data-format="image/png">PNG</button>
          <button type="button" class="format-pill" data-format="image/jpeg">JPG</button>
          <button type="button" class="format-pill active" data-format="image/webp">WEBP</button>
          <button type="button" class="format-pill" data-format="image/avif">AVIF</button>
          <button type="button" class="format-pill" data-format="image/gif">GIF</button>
          <button type="button" class="format-pill" data-format="application/pdf">PDF</button>
        </div>
      </div>
      
      <div class="control-actions">
        <button id="add-images-btn" class="button button-secondary" type="button">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
          Add images
        </button>
        <button id="convert-all-btn" class="button button-primary" type="button">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M19 8l-4 4h3c0 3.31-2.69 6-6 6-1.01 0-1.97-.25-2.8-.7l-1.46 1.46C8.97 19.54 10.43 20 12 20c4.42 0 8-3.58 8-8h3l-4-4zM6 12c0-3.31 2.69-6 6-6 1.01 0 1.97.25 2.8.7l1.46-1.46C15.03 4.46 13.57 4 12 4c-4.42 0-8 3.58-8 8H1l4 4 4-4H6z"/></svg>
          Convert all
        </button>
      </div>
    </div>
    
    <!-- Advanced Settings Row -->
    <div class="extra-settings-row">
      <details class="extra-settings-details">
        <summary>Advanced settings (Quality / Max Width)</summary>
        <div class="settings-grid">
          <div class="settings-item">
            <div class="quality-label-row">
              <label for="quality">Output Quality</label>
              <span id="quality-value">80%</span>
            </div>
            <input id="quality" type="range" min="30" max="95" value="80" step="1">
          </div>
          <div class="settings-item">
            <label for="max-width">Maximum width <span class="optional">(optional)</span></label>
            <input id="max-width" type="number" min="1" max="10000" placeholder="Keep original size" inputmode="numeric">
          </div>
        </div>
      </details>
    </div>

    <!-- Conversion Queue List -->
    <div id="queue-container" class="queue-container" hidden>
      <div id="compress-queue" class="compress-queue">
        <!-- Rows will be injected here dynamically -->
      </div>
      
      <!-- Footer Summary Bar inside the card -->
      <div id="queue-summary-bar" class="queue-summary-bar">
        <div class="summary-text" id="summary-text">
          <span id="summary-progress-count">0 of 0</span> converted — <strong id="summary-saved-bytes">0 B</strong> saved in <span id="summary-target-format">WEBP</span>
        </div>
        <button id="download-all-btn" class="button button-primary" type="button">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM17 13l-5 5-5-5h3V9h4v4h3z"/></svg>
          Download all (ZIP)
        </button>
      </div>
    </div>
  </section>

  <!-- Supported Formats Badge Row -->
  <div class="supported-formats-row">
    <span>Supports</span>
    <span class="format-badge">PNG</span>
    <span class="format-badge">JPG</span>
    <span class="format-badge">WebP</span>
    <span class="format-badge">AVIF</span>
    <span class="format-badge">HEIC</span>
    <span class="format-badge">SVG</span>
    <span class="format-badge">GIF</span>
    <span class="format-badge">BMP</span>
    <span class="format-badge">TIFF</span>
    <span class="format-badge">PDF</span>
  </div>

  <!-- How It Works Section -->
  <section class="how-it-works-section">
    <h2>How it works</h2>
    <div class="steps-grid">
      <div class="step-card">
        <div class="step-number">1</div>
        <h3>Add your images</h3>
        <p>Drop files of any supported type. Mix formats freely — convert them all in one batch.</p>
      </div>
      <div class="step-card">
        <div class="step-number">2</div>
        <h3>Pick a target format</h3>
        <p>Choose the output format once and it applies to every file, or set them individually.</p>
      </div>
      <div class="step-card">
        <div class="step-number">3</div>
        <h3>Download</h3>
        <p>Save converted files one by one, or download the whole batch as a ZIP.</p>
      </div>
    </div>
  </section>

  <!-- FAQ Section -->
  <section class="faq-section">
    <h2>Frequently asked questions</h2>
    <div class="faq-accordion">
      <details class="faq-item">
        <summary class="faq-question">
          <span>Do my files get uploaded anywhere?</span>
          <span class="faq-icon" aria-hidden="true">+</span>
        </summary>
        <div class="faq-answer">
          <p>No. Every conversion happens locally in your browser. Your images never touch a server, ensuring absolute privacy and security.</p>
        </div>
      </details>
      <details class="faq-item">
        <summary class="faq-question">
          <span>Can I convert HEIC photos from my iPhone?</span>
          <span class="faq-icon" aria-hidden="true">+</span>
        </summary>
        <div class="faq-answer">
          <p>Yes. You can drop HEIC/HEIF files and convert them to widely compatible formats like JPG, PNG, or WebP that work on all devices.</p>
        </div>
      </details>
      <details class="faq-item">
        <summary class="faq-question">
          <span>Does it keep transparency and quality?</span>
          <span class="faq-icon" aria-hidden="true">+</span>
        </summary>
        <div class="faq-answer">
          <p>Transparency is fully preserved for formats that support alpha channels (such as PNG, WebP, and AVIF). You can adjust the quality slider to control output compression.</p>
        </div>
      </details>
      <details class="faq-item">
        <summary class="faq-question">
          <span>Can I convert many images at once?</span>
          <span class="faq-icon" aria-hidden="true">+</span>
        </summary>
        <div class="faq-answer">
          <p>Yes — batch convert hundreds of images and download all converted images together in a single generated ZIP archive.</p>
        </div>
      </details>
    </div>
  </section>
</div>
