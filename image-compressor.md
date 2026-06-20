---
layout: tools
title: "Compress Images Online"
meta_title: "Compress Images Online — Private JPG, PNG & WebP Compressor"
meta_description: "Compress JPG, PNG, and WebP images privately in your browser. No upload, no signup, and no watermark. Resize and download your smaller image instantly."
permalink: /image-compressor/
---

<section class="tool-hero compressor-mobile-hero" aria-labelledby="compressor-title">
  <div class="hero-badge"><span class="desktop-only">Free • In your browser • No signup</span><span class="mobile-only">⚡ Runs on your phone · no upload</span></div>
  <h1 id="compressor-title"><span class="desktop-only">Compress images <span class="text-gradient">without losing quality.</span></span><span class="mobile-only">Compress images <span class="text-gradient">on the go.</span></span></h1>
  <p class="hero-copy">Shrink JPG, PNG, WebP, AVIF, GIF, SVG and BMP files by up to 80%. Drag them in, pick a quality, and download — all on your device.</p>
</section>

<div class="compressor-wrapper image-compressor-page">
  <!-- Main Compressor Card -->
  <section class="compressor-card" aria-label="Image compressor">
    <!-- Drop Zone -->
    <div class="drop-zone" id="drop-zone">
      <input id="image-input" type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml,image/bmp,image/avif,.png,.jpg,.jpeg,.webp,.gif,.svg,.bmp,.avif" multiple hidden>
      <div class="drop-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
          <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>
        </svg>
      </div>
      <h2><span class="desktop-only">Drop images here, or <span class="upload-trigger">click to upload</span></span><span class="mobile-only">Tap to add photos</span></h2>
      <p><span class="desktop-only">JPG, PNG, WebP, AVIF, GIF, SVG, BMP up to 50 MB each — batch up to 100 files</span><span class="mobile-only">JPG, PNG, WebP, AVIF · pick up to 100</span></p>
    </div>

    <!-- Global Controls -->
    <div class="compressor-controls">
      <div class="control-group">
        <div class="quality-label-row">
          <label for="quality">Quality</label>
          <span id="quality-value">72%</span>
        </div>
        <input id="quality" type="range" min="30" max="95" value="72" step="1">
        <div class="quality-scale mobile-only"><span>Smaller file</span><span>Best quality</span></div>
      </div>
      
      <div class="control-actions">
        <button id="add-images-btn" class="button button-secondary" type="button">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
          Add images
        </button>
        <button id="compress-all-btn" class="button button-primary" type="button">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L6.7 14.8c-.45-.83-.7-1.79-.7-2.8 0-3.31 2.69-6 6-6zm6.76 1.74L17.3 9.2c.44.84.7 1.79.7 2.8 0 3.31-2.69 6-6 6v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.24-4.26z"/></svg>
          Compress all
        </button>
      </div>
    </div>
    
    <!-- Advanced Settings Row -->
    <div class="extra-settings-row">
      <details class="extra-settings-details">
        <summary>Advanced settings (Max Width / Output Format)</summary>
        <div class="settings-grid">
          <div class="settings-item">
            <label for="max-width">Maximum width <span class="optional">(optional)</span></label>
            <input id="max-width" type="number" min="1" max="10000" placeholder="Keep original size" inputmode="numeric">
          </div>
          <div class="settings-item">
            <label for="output-format">Output format</label>
            <select id="output-format">
              <option value="auto">Smart (keeps transparency)</option>
              <option value="image/jpeg">JPG — best for photos</option>
              <option value="image/webp">WebP — smaller, modern</option>
              <option value="image/png">PNG — lossless</option>
              <option value="image/avif">AVIF — next-gen (browser dependent)</option>
              <option value="image/gif">GIF — graphics (falls back if unsupported)</option>
              <option value="image/bmp">BMP — bitmap</option>
            </select>
          </div>
        </div>
      </details>
    </div>

    <!-- Compression Queue List -->
    <div id="queue-container" class="queue-container" hidden>
      <div class="mobile-queue-heading mobile-only">
        <span><strong id="mobile-queue-count">0</strong> images</span>
        <button id="clear-all-btn" type="button">Clear</button>
      </div>
      <div id="compress-queue" class="compress-queue">
        <!-- Rows will be injected here dynamically -->
      </div>
      
      <!-- Footer Summary Bar inside the card -->
      <div id="queue-summary-bar" class="queue-summary-bar">
        <div class="summary-text" id="summary-text">
          <span class="desktop-only">Saved <strong id="summary-saved-bytes">0 B</strong> across <span id="summary-count">0</span> images — <strong id="summary-percentage">0%</strong> smaller</span>
          <span class="mobile-only mobile-summary-copy"><strong>Saved <span id="mobile-summary-saved-bytes">0 B</span></strong><span><span id="mobile-summary-percentage">0%</span> smaller · <span id="mobile-summary-count">0</span> images</span></span>
        </div>
        <button id="download-all-btn" class="button button-primary" type="button">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM17 13l-5 5-5-5h3V9h4v4h3z"/></svg>
          <span class="desktop-only">Download all (ZIP)</span><span class="mobile-only">Save all</span>
        </button>
      </div>
    </div>
  </section>

  <!-- Supported Formats Badge Row -->
  <div class="supported-formats-row">
    <span>Supports</span>
    <span class="format-badge">JPG</span>
    <span class="format-badge">PNG</span>
    <span class="format-badge">WebP</span>
    <span class="format-badge">AVIF</span>
    <span class="format-badge">GIF</span>
    <span class="format-badge">SVG</span>
    <span class="format-badge">BMP</span>
  </div>

  <!-- How It Works Section -->
  <section class="how-it-works-section">
    <h2>How it works</h2>
    <div class="steps-grid">
      <div class="step-card">
        <div class="step-number">1</div>
        <h3>Add your images</h3>
        <p>Drop files onto the page or click to upload. Batch up to 100 images at once.</p>
      </div>
      <div class="step-card">
        <div class="step-number">2</div>
        <h3>Choose a quality</h3>
        <p>Drag the quality slider and watch the savings update live. Tune settings as needed.</p>
      </div>
      <div class="step-card">
        <div class="step-number">3</div>
        <h3>Download</h3>
        <p>Grab compressed files one by one, or download everything as a single ZIP.</p>
      </div>
    </div>
  </section>

  <!-- FAQ Section -->
  <section class="faq-section">
    <h2>Frequently asked questions</h2>
    <div class="faq-accordion">
      <details class="faq-item">
        <summary class="faq-question">
          <span>Are my images uploaded to a server?</span>
          <span class="faq-icon" aria-hidden="true">+</span>
        </summary>
        <div class="faq-answer">
          <p>No. Compression runs entirely in your browser using your device. Your images never leave your computer, ensuring absolute privacy.</p>
        </div>
      </details>
      <details class="faq-item">
        <summary class="faq-question">
          <span>How much smaller will my files be?</span>
          <span class="faq-icon" aria-hidden="true">+</span>
        </summary>
        <div class="faq-answer">
          <p>Most JPG and PNG images shrink by 50–80% with no visible quality loss. You control the trade-off with the quality slider.</p>
        </div>
      </details>
      <details class="faq-item">
        <summary class="faq-question">
          <span>Is there a file size or count limit?</span>
          <span class="faq-icon" aria-hidden="true">+</span>
        </summary>
        <div class="faq-answer">
          <p>There is no hard limit — you can compress hundreds of images in a batch. Very large files are processed locally.</p>
        </div>
      </details>
      <details class="faq-item">
        <summary class="faq-question">
          <span>Which formats are supported?</span>
          <span class="faq-icon" aria-hidden="true">+</span>
        </summary>
        <div class="faq-answer">
          <p>JPG, PNG, WebP, AVIF, GIF, BMP, and SVG. You can keep the original format or convert while compressing.</p>
        </div>
      </details>
    </div>
  </section>
</div>
