// ScanApp QR Generator Controller

document.addEventListener("DOMContentLoaded", () => {
  // --- ANALYTICS LOGGING ---
  const logEvent = (action, params = {}) => {
    if (window.gtag) {
      window.gtag("event", `generate_${action}`, params);
    } else if (window.dataLayer) {
      window.dataLayer.push({
        event: `generate_${action}`,
        ...params
      });
    }
  };

  // --- STATE ---
  const state = {
    contentType: "website",
    qrData: "https://scanapp.org",
    
    // QR Code Styling settings
    width: 1000,
    height: 1000,
    dotsColor: "#10b981",
    dotsColor2: "#059669",
    dotsColorType: "single", // "single" or "gradient"
    dotsGradientType: "linear",
    dotsGradientRotation: 0,
    dotsType: "rounded",
    
    bgColor: "#ffffff",
    bgColor2: "#ffffff",
    bgColorType: "single",
    bgGradientType: "linear",
    bgGradientRotation: 0,
    
    cornersSquareType: "extra-rounded",
    cornersSquareColor: "#10b981",
    cornersDotType: "dot",
    cornersDotColor: "#10b981",
    
    // Logo
    logoPreset: "none",
    logoDataUrl: null,
    logoSize: 0.3, // 0.1 to 0.5
    logoMargin: 10,
    
    // Frame
    frameStyle: "none", // "none", "border", "bottom-text"
    frameText: "SCAN ME",
    frameColor: "#10b981",
    frameTextColor: "#ffffff",
    
    // Artistic Background Image
    bgImageDataUrl: null,
    artisticContrast: 0.6, // 0 to 1 (0 = dark overlay, 1 = image only)
    
    // Save Options
    downloadSize: 1024,
    downloadFormat: "png", // "png", "svg", "pdf"
  };

  // --- INITIALIZE QR CODE STYLING ---
  let qrCodeStylingInstance = null;
  const qrPreviewContainer = document.getElementById("qr-preview-target");

  function initQrStyling() {
    if (typeof QRCodeStyling === "undefined") {
      console.error("QRCodeStyling library not loaded yet.");
      setTimeout(initQrStyling, 200);
      return;
    }
    
    const options = getQrOptions(300, 300);
    qrCodeStylingInstance = new QRCodeStyling(options);
    qrPreviewContainer.innerHTML = "";
    qrCodeStylingInstance.append(qrPreviewContainer);
  }

  // --- GET QR OPTIONS MAPPING ---
  function getQrOptions(w, h) {
    const dotsOptions = {
      type: state.dotsType,
    };
    
    if (state.dotsColorType === "gradient") {
      dotsOptions.gradient = {
        type: state.dotsGradientType,
        rotation: (state.dotsGradientRotation * Math.PI) / 180,
        colorStops: [
          { offset: 0, color: state.dotsColor },
          { offset: 1, color: state.dotsColor2 },
        ],
      };
    } else {
      dotsOptions.color = state.dotsColor;
    }

    const backgroundOptions = {
      color: state.bgColorType === "transparent" ? "transparent" : state.bgColor,
    };
    
    if (state.bgColorType === "gradient") {
      backgroundOptions.gradient = {
        type: state.bgGradientType,
        rotation: (state.bgGradientRotation * Math.PI) / 180,
        colorStops: [
          { offset: 0, color: state.bgColor },
          { offset: 1, color: state.bgColor2 },
        ],
      };
    }

    const cornersSquareOptions = {
      type: state.cornersSquareType,
      color: state.cornersSquareColor,
    };

    const cornersDotOptions = {
      type: state.cornersDotType,
      color: state.cornersDotColor,
    };

    // Handle Logo Image
    let logoImage = undefined;
    if (state.logoPreset !== "none") {
      logoImage = getLogoPresetUrl(state.logoPreset);
    } else if (state.logoDataUrl) {
      logoImage = state.logoDataUrl;
    }

    return {
      width: w,
      height: h,
      type: "svg",
      data: state.qrData || " ",
      margin: 15,
      qrOptions: {
        typeNumber: 0,
        mode: "Byte",
        errorCorrectionLevel: "H", // High error correction to allow logo / image overlay
      },
      dotsOptions,
      backgroundOptions,
      cornersSquareOptions,
      cornersDotOptions,
      image: logoImage,
      imageOptions: {
        crossOrigin: "anonymous",
        hideBackgroundDots: true,
        imageSize: state.logoSize,
        margin: state.logoMargin,
      },
    };
  }

  function getLogoPresetUrl(preset) {
    switch (preset) {
      case "scanapp": return "/assets/images/svgs/logo.svg";
      case "globe": return "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2310b981'><path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z'/></svg>";
      case "wifi": return "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2310b981'><path d='M12 21l-12-12c4.97-4.97 13.03-4.97 18 0l-6 12zm0-15.28c-2.91 0-5.83.91-8.08 2.73l2.08 2.08c1.69-1.17 3.73-1.81 6-1.81s4.31.64 6 1.81l2.08-2.08c-2.25-1.82-5.17-2.73-8.08-2.73zm0 5.4c-1.42 0-2.84.45-3.94 1.34l3.94 3.94 3.94-3.94c-1.1-1.01-2.52-1.34-3.94-1.34z'/></svg>";
      case "whatsapp": return "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2325D366'><path d='M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.717-1.458L0 24zm6.59-4.846c1.6.95 3.16 1.458 4.787 1.459 5.441 0 9.863-4.417 9.866-9.86.002-2.637-1.023-5.116-2.884-6.98C16.486 1.886 14.013 1.86 11.39 1.86c-5.45 0-9.87 4.42-9.873 9.866-.001 2.03.53 4.02 1.534 5.768L2.04 21.06l3.943-.906zm11.353-7.532c-.3-.15-1.771-.875-2.045-.974-.275-.1-.475-.15-.674.15-.2.3-.775.974-.95 1.174-.175.2-.35.225-.65.075-1.02-.513-1.688-1.002-2.355-2.14-.175-.3-.175-.556-.025-.706.136-.135.3-.35.45-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.675-1.625-.925-2.225-.244-.588-.492-.51-.674-.519-.174-.009-.374-.01-.573-.01-.2 0-.525.075-.8.375-.275.3-1.05 1.025-1.05 2.5s1.075 2.9 1.225 3.1c.15.2 2.11 3.22 5.11 4.52.714.31 1.27.496 1.7.635.718.227 1.37.195 1.887.118.577-.087 1.772-.725 2.02-.1.25-.1.25-.1.25-.1s-.075-.375-.175-.525z'/></svg>";
      case "facebook": return "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%231877F2'><path d='M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z'/></svg>";
      case "twitter": return "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23000000'><path d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z'/></svg>";
      case "instagram": return "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23E1306C'><path d='M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z'/></svg>";
      case "youtube": return "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23FF0000'><path d='M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.516 0-9.387.507A3.003 3.003 0 0 0 .502 6.163C0 8.07 0 12 0 12s0 3.93.502 5.837a3.003 3.003 0 0 0 2.11 2.11C4.484 20.455 12 20.455 12 20.455s7.517 0 9.387-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.93 24 12 24 12s0-3.93-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z'/></svg>";
      case "bitcoin": return "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23F7931A'><path d='M23.633 13.568c-.472 2.808-2.4 4.417-5.006 4.917v5.515h-3.093v-5.263c-.808.2-1.636.368-2.455.518v4.745H9.986v-4.745c-.754.015-1.5.015-2.222.015h-4.67v-3.093h2.386c1.3-.015 1.573-.393 1.786-1.573v-7.94c-.23-1.18-.5-1.558-1.786-1.573H.845V1.238h4.67c.72 0 1.44.015 2.155.03V-.005h3.092v1.545c.808-.135 1.636-.285 2.455-.417V-.005h3.093v1.365c2.72.485 4.962 1.83 5.344 4.887.31 2.47-.852 3.865-2.585 4.542 2.09.68 3.562 2.124 3.208 4.779zm-7.683-6.52c.23-1.395-.87-2.146-2.385-2.387v4.618c1.515-.135 2.155-.71 2.155-2.231zm.71 6.84c.25-1.517-.97-2.34-2.617-2.52v4.992c1.646-.075 2.37-.625 2.37-2.472z'/></svg>";
      default: return null;
    }
  }

  // --- RE-RENDER PREVIEW ---
  function updatePreview() {
    if (!qrCodeStylingInstance) return;
    
    // Compile content based on active content type
    compileContent();

    // Configure wrapper mockup design
    const frameEl = document.getElementById("qr-preview-frame");
    frameEl.className = "qr-frame-wrapper";
    frameEl.style.borderColor = "#ffffff"; // reset
    frameEl.style.backgroundColor = "#ffffff";
    
    const textEl = document.getElementById("qr-frame-text");
    textEl.textContent = state.frameText;
    textEl.style.backgroundColor = state.frameColor;
    textEl.style.color = state.frameTextColor;

    if (state.frameStyle === "border") {
      frameEl.classList.add("frame-border");
      frameEl.style.borderColor = state.frameColor;
    } else if (state.frameStyle === "bottom-text") {
      frameEl.classList.add("frame-bottom-text");
      frameEl.style.borderColor = state.frameColor;
    }

    // Refresh styling inside qr-code-styling
    const newOptions = getQrOptions(300, 300);
    qrCodeStylingInstance.update(newOptions);

    // If artistic background is set, render the blend visual badge
    const badge = frameEl.querySelector(".artistic-preview-badge");
    if (state.bgImageDataUrl) {
      if (!badge) {
        const badgeEl = document.createElement("div");
        badgeEl.className = "artistic-preview-badge";
        badgeEl.textContent = "Artistic Blending Active";
        frameEl.appendChild(badgeEl);
      }
    } else if (badge) {
      badge.remove();
    }
  }

  // --- COMPILE CONTENT FROM INPUTS ---
  function compileContent() {
    let data = "";
    
    switch (state.contentType) {
      case "website":
        data = getVal("web-url") || "https://scanapp.org";
        break;
      case "text":
        data = getVal("text-content") || "";
        break;
      case "wifi":
        const ssid = getVal("wifi-ssid") || "";
        const pwd = getVal("wifi-password") || "";
        const enc = getVal("wifi-encryption") || "WPA";
        const hidden = document.getElementById("wifi-hidden").checked;
        data = `WIFI:S:${ssid};T:${enc};P:${pwd};H:${hidden ? "true" : "false"};;`;
        break;
      case "vcard":
        const fn = getVal("vcard-first") || "";
        const ln = getVal("vcard-last") || "";
        const org = getVal("vcard-company") || "";
        const title = getVal("vcard-title") || "";
        const tel = getVal("vcard-phone") || "";
        const email = getVal("vcard-email") || "";
        const url = getVal("vcard-web") || "";
        const adr = getVal("vcard-address") || "";
        data = `BEGIN:VCARD\nVERSION:3.0\nN:${ln};${fn};;;\nFN:${fn} ${ln}\nORG:${org}\nTITLE:${title}\nTEL;TYPE=CELL:${tel}\nEMAIL;TYPE=PREF,INTERNET:${email}\nURL:${url}\nADR;TYPE=WORK:;;${adr};;;;\nEND:VCARD`;
        break;
      case "mecard":
        const mName = getVal("mecard-name") || "";
        const mPhone = getVal("mecard-phone") || "";
        const mEmail = getVal("mecard-email") || "";
        const mWeb = getVal("mecard-web") || "";
        data = `MECARD:N:${mName};TEL:${mPhone};EMAIL:${mEmail};URL:${mWeb};;`;
        break;
      case "pdf":
        data = getVal("pdf-url") || "";
        break;
      case "appstore":
        data = getVal("app-url") || "";
        break;
      case "playstore":
        data = getVal("play-url") || "";
        break;
      case "location":
        const lat = getVal("loc-lat") || "0";
        const lng = getVal("loc-lng") || "0";
        data = `https://maps.google.com/maps?q=${lat},${lng}`;
        break;
      case "facebook":
        data = getVal("fb-url") || "";
        break;
      case "twitter":
        data = getVal("tw-url") || "";
        break;
      case "youtube":
        data = getVal("yt-url") || "";
        break;
      case "event":
        const evTitle = getVal("ev-title") || "";
        const evLoc = getVal("ev-location") || "";
        const evStart = formatDateTime(getVal("ev-start") || "");
        const evEnd = formatDateTime(getVal("ev-end") || "");
        const evDesc = getVal("ev-desc") || "";
        data = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:${evTitle}\nLOCATION:${evLoc}\nDTSTART:${evStart}\nDTEND:${evEnd}\nDESCRIPTION:${evDesc}\nEND:VEVENT\nEND:VCALENDAR`;
        break;
      case "bitcoin":
        const addr = getVal("btc-address") || "";
        const amt = getVal("btc-amount") || "";
        const msg = getVal("btc-message") || "";
        data = `bitcoin:${addr}?amount=${amt}&message=${encodeURIComponent(msg)}`;
        break;
      case "email":
        const eMail = getVal("email-to") || "";
        const eSub = getVal("email-subject") || "";
        const eBody = getVal("email-body") || "";
        data = `mailto:${eMail}?subject=${encodeURIComponent(eSub)}&body=${encodeURIComponent(eBody)}`;
        break;
      case "phone":
        data = `tel:${getVal("phone-num") || ""}`;
        break;
      case "sms":
        data = `smsto:${getVal("sms-num") || ""}:${getVal("sms-msg") || ""}`;
        break;
    }
    
    state.qrData = data;
  }

  function getVal(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : "";
  }

  function formatDateTime(val) {
    if (!val) return "";
    // convert YYYY-MM-DDTHH:MM to YYYYMMDDTHHMMSSZ (iCal standard UTC)
    const cleaned = val.replace(/[^0-9T]/g, "");
    return cleaned + "00Z";
  }

  // --- ATTACH EVENT LISTENERS FOR CONTENT TYPE CARDS ---
  document.querySelectorAll(".content-type-card").forEach((card) => {
    card.addEventListener("click", () => {
      document.querySelectorAll(".content-type-card").forEach((c) => c.classList.remove("active"));
      card.classList.add("active");
      
      const type = card.dataset.type;
      state.contentType = type;
      logEvent("select_content_type", { type });
      
      // Hide all dynamic inputs
      document.querySelectorAll(".dynamic-inputs").forEach((div) => {
        div.style.display = "none";
      });
      
      // Show selected inputs
      const targetDiv = document.getElementById(`inputs-${type}`);
      if (targetDiv) targetDiv.style.display = "flex";
      
      updatePreview();
    });
  });

  // Listen to input changes in any field inside inputs forms
  document.querySelectorAll(".dynamic-inputs input, .dynamic-inputs textarea, .dynamic-inputs select").forEach((input) => {
    input.addEventListener("input", updatePreview);
    input.addEventListener("change", updatePreview);
  });

  // --- DESIGN PANEL LISTENERS ---
  
  // Dots styling
  document.querySelectorAll(".shape-option-card").forEach((card) => {
    card.addEventListener("click", () => {
      document.querySelectorAll(".shape-option-card").forEach((c) => c.classList.remove("active"));
      card.classList.add("active");
      
      state.dotsType = card.dataset.shape;
      logEvent("change_dots_type", { shape: card.dataset.shape });
      
      // Also update hidden select if any external libraries/forms read it
      const selectEl = document.getElementById("dots-type");
      if (selectEl) selectEl.value = card.dataset.shape;
      
      updatePreview();
    });
  });

  document.getElementById("dots-type").addEventListener("change", (e) => {
    state.dotsType = e.target.value;
    updatePreview();
  });

  // Dots Color Mode
  document.getElementById("dots-color-mode").addEventListener("change", (e) => {
    state.dotsColorType = e.target.value;
    const gradSettings = document.getElementById("dots-gradient-settings");
    if (state.dotsColorType === "gradient") {
      gradSettings.style.display = "flex";
    } else {
      gradSettings.style.display = "none";
    }
    updatePreview();
  });

  document.getElementById("dots-color-1").addEventListener("input", (e) => {
    state.dotsColor = e.target.value;
    document.getElementById("dots-color-1-text").value = e.target.value.toUpperCase();
    updatePreview();
  });

  document.getElementById("dots-color-1-text").addEventListener("input", (e) => {
    if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
      state.dotsColor = e.target.value;
      document.getElementById("dots-color-1").value = e.target.value;
      updatePreview();
    }
  });

  document.getElementById("dots-color-2").addEventListener("input", (e) => {
    state.dotsColor2 = e.target.value;
    document.getElementById("dots-color-2-text").value = e.target.value.toUpperCase();
    updatePreview();
  });

  document.getElementById("dots-color-2-text").addEventListener("input", (e) => {
    if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
      state.dotsColor2 = e.target.value;
      document.getElementById("dots-color-2").value = e.target.value;
      updatePreview();
    }
  });

  document.getElementById("dots-gradient-type").addEventListener("change", (e) => {
    state.dotsGradientType = e.target.value;
    updatePreview();
  });

  document.getElementById("dots-gradient-angle").addEventListener("input", (e) => {
    state.dotsGradientRotation = parseInt(e.target.value, 10);
    document.getElementById("dots-gradient-angle-val").textContent = e.target.value + "°";
    updatePreview();
  });

  // Background styling
  document.getElementById("bg-color-mode").addEventListener("change", (e) => {
    state.bgColorType = e.target.value;
    const gradSettings = document.getElementById("bg-gradient-settings");
    const solidRow = document.getElementById("bg-solid-row");
    
    if (state.bgColorType === "gradient") {
      gradSettings.style.display = "flex";
      solidRow.style.display = "flex";
    } else if (state.bgColorType === "transparent") {
      gradSettings.style.display = "none";
      solidRow.style.display = "none";
    } else {
      gradSettings.style.display = "none";
      solidRow.style.display = "flex";
    }
    updatePreview();
  });

  document.getElementById("bg-color-1").addEventListener("input", (e) => {
    state.bgColor = e.target.value;
    document.getElementById("bg-color-1-text").value = e.target.value.toUpperCase();
    updatePreview();
  });

  document.getElementById("bg-color-1-text").addEventListener("input", (e) => {
    if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
      state.bgColor = e.target.value;
      document.getElementById("bg-color-1").value = e.target.value;
      updatePreview();
    }
  });

  document.getElementById("bg-color-2").addEventListener("input", (e) => {
    state.bgColor2 = e.target.value;
    document.getElementById("bg-color-2-text").value = e.target.value.toUpperCase();
    updatePreview();
  });

  document.getElementById("bg-color-2-text").addEventListener("input", (e) => {
    if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
      state.bgColor2 = e.target.value;
      document.getElementById("bg-color-2").value = e.target.value;
      updatePreview();
    }
  });

  document.getElementById("bg-gradient-type").addEventListener("change", (e) => {
    state.bgGradientType = e.target.value;
    updatePreview();
  });

  document.getElementById("bg-gradient-angle").addEventListener("input", (e) => {
    state.bgGradientRotation = parseInt(e.target.value, 10);
    document.getElementById("bg-gradient-angle-val").textContent = e.target.value + "°";
    updatePreview();
  });

  // Corners
  document.getElementById("corners-square-type").addEventListener("change", (e) => {
    state.cornersSquareType = e.target.value;
    updatePreview();
  });

  document.getElementById("corners-square-color").addEventListener("input", (e) => {
    state.cornersSquareColor = e.target.value;
    document.getElementById("corners-square-color-text").value = e.target.value.toUpperCase();
    updatePreview();
  });

  document.getElementById("corners-square-color-text").addEventListener("input", (e) => {
    if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
      state.cornersSquareColor = e.target.value;
      document.getElementById("corners-square-color").value = e.target.value;
      updatePreview();
    }
  });

  document.getElementById("corners-dot-type").addEventListener("change", (e) => {
    state.cornersDotType = e.target.value;
    updatePreview();
  });

  document.getElementById("corners-dot-color").addEventListener("input", (e) => {
    state.cornersDotColor = e.target.value;
    document.getElementById("corners-dot-color-text").value = e.target.value.toUpperCase();
    updatePreview();
  });

  document.getElementById("corners-dot-color-text").addEventListener("input", (e) => {
    if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
      state.cornersDotColor = e.target.value;
      document.getElementById("corners-dot-color").value = e.target.value;
      updatePreview();
    }
  });

  // Logo selection
  document.querySelectorAll(".logo-preset-card").forEach((card) => {
    card.addEventListener("click", () => {
      document.querySelectorAll(".logo-preset-card").forEach((c) => c.classList.remove("active"));
      card.classList.add("active");
      state.logoPreset = card.dataset.preset;
      logEvent("select_logo_preset", { preset: card.dataset.preset });
      updatePreview();
    });
  });

  // Custom Logo upload
  const logoInput = document.getElementById("logo-upload-input");
  document.getElementById("logo-upload-zone").addEventListener("click", () => {
    logoInput.click();
  });

  logoInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      state.logoDataUrl = event.target.result;
      state.logoPreset = "none";
      
      // Update UI preview card states
      document.querySelectorAll(".logo-preset-card").forEach((c) => c.classList.remove("active"));
      document.getElementById("uploaded-logo-preview-box").style.display = "flex";
      document.getElementById("uploaded-logo-img").src = event.target.result;
      
      logEvent("upload_custom_logo");
      updatePreview();
    };
    reader.readAsDataURL(file);
  });

  document.getElementById("remove-uploaded-logo").addEventListener("click", () => {
    state.logoDataUrl = null;
    logoInput.value = "";
    document.getElementById("uploaded-logo-preview-box").style.display = "none";
    logEvent("remove_custom_logo");
    updatePreview();
  });

  document.getElementById("logo-size-range").addEventListener("input", (e) => {
    state.logoSize = parseFloat(e.target.value);
    document.getElementById("logo-size-val").textContent = Math.round(e.target.value * 100) + "%";
    logEvent("change_logo_size", { size: state.logoSize });
    updatePreview();
  });

  // Frame Settings
  document.getElementById("frame-style-select").addEventListener("change", (e) => {
    state.frameStyle = e.target.value;
    const textGroup = document.getElementById("frame-text-group");
    if (state.frameStyle !== "none") {
      textGroup.style.display = "flex";
    } else {
      textGroup.style.display = "none";
    }
    logEvent("change_frame_style", { style: state.frameStyle });
    updatePreview();
  });

  document.getElementById("frame-text-input").addEventListener("input", (e) => {
    state.frameText = e.target.value;
    updatePreview();
  });

  document.getElementById("frame-color-input").addEventListener("input", (e) => {
    state.frameColor = e.target.value;
    updatePreview();
  });

  document.getElementById("frame-text-color-input").addEventListener("input", (e) => {
    state.frameTextColor = e.target.value;
    updatePreview();
  });

  // Artistic Background Image
  const artBgInput = document.getElementById("art-bg-upload-input");
  document.getElementById("art-bg-upload-zone").addEventListener("click", () => {
    artBgInput.click();
  });

  artBgInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      state.bgImageDataUrl = event.target.result;
      
      // Update UI
      document.getElementById("uploaded-art-preview-box").style.display = "flex";
      document.getElementById("uploaded-art-img").src = event.target.result;
      
      logEvent("upload_art_background");
      updatePreview();
    };
    reader.readAsDataURL(file);
  });

  document.getElementById("remove-uploaded-art").addEventListener("click", () => {
    state.bgImageDataUrl = null;
    artBgInput.value = "";
    document.getElementById("uploaded-art-preview-box").style.display = "none";
    logEvent("remove_art_background");
    updatePreview();
  });

  document.getElementById("art-contrast-range").addEventListener("input", (e) => {
    state.artisticContrast = parseFloat(e.target.value);
    document.getElementById("art-contrast-val").textContent = Math.round(e.target.value * 100) + "%";
    logEvent("change_art_contrast", { value: state.artisticContrast });
    updatePreview();
  });

  // Save Settings
  document.getElementById("download-size").addEventListener("input", (e) => {
    state.downloadSize = parseInt(e.target.value, 10);
    document.getElementById("download-size-val").textContent = e.target.value + " x " + e.target.value + " px";
    logEvent("change_download_size", { size: state.downloadSize });
  });

  document.getElementById("download-format").addEventListener("change", (e) => {
    state.downloadFormat = e.target.value;
    logEvent("change_download_format", { format: state.downloadFormat });
  });

  // --- GEOLOCATION HELPER ---
  const geoBtn = document.getElementById("loc-get-current");
  if (geoBtn) {
    geoBtn.addEventListener("click", () => {
      if (navigator.geolocation) {
        geoBtn.textContent = "Locating...";
        geoBtn.disabled = true;
        navigator.geolocation.getCurrentPosition(
          (position) => {
            document.getElementById("loc-lat").value = position.coords.latitude.toFixed(6);
            document.getElementById("loc-lng").value = position.coords.longitude.toFixed(6);
            geoBtn.textContent = "Use Current Location";
            geoBtn.disabled = false;
            updatePreview();
          },
          (err) => {
            showToast("Failed to get location: " + err.message);
            geoBtn.textContent = "Use Current Location";
            geoBtn.disabled = false;
          }
        );
      } else {
        showToast("Geolocation is not supported by your browser.");
      }
    });
  }

  // --- ACCORDION TOGGLE LOGIC ---
  document.querySelectorAll(".accordion-header").forEach((header) => {
    header.addEventListener("click", () => {
      const accordion = header.closest(".accordion");
      const isExpanded = accordion.classList.contains("expanded");
      
      // Collapse all other accordions
      document.querySelectorAll(".accordion").forEach((acc) => {
        acc.classList.remove("expanded");
        acc.querySelector(".accordion-content").style.maxHeight = null;
      });

      if (!isExpanded) {
        accordion.classList.add("expanded");
        const content = accordion.querySelector(".accordion-content");
        content.style.maxHeight = content.scrollHeight + 100 + "px";
      }
      logEvent("toggle_accordion", {
        section: accordion.id || "unknown",
        expanded: !isExpanded
      });
    });
  });

  // Expand the first accordion by default
  const firstAcc = document.querySelector(".accordion");
  if (firstAcc) {
    firstAcc.classList.add("expanded");
    const content = firstAcc.querySelector(".accordion-content");
    content.style.maxHeight = content.scrollHeight + 100 + "px";
  }

  // --- TOAST DISPLAY ---
  function showToast(message) {
    const toast = document.getElementById("toast-msg-container");
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => {
      toast.classList.remove("show");
    }, 3000);
  }

  // --- DOWNLOAD ORCHESTRATOR ---
  const dwnBtn = document.getElementById("download-trigger");
  dwnBtn.addEventListener("click", () => {
    dwnBtn.disabled = true;
    logEvent("download", {
      format: state.downloadFormat,
      size: state.downloadSize
    });
    dwnBtn.innerHTML = `
      <svg class="animate-spin" viewBox="0 0 24 24" fill="none" style="animation: spin 1s linear infinite; width:20px; height:20px;">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" style="opacity:0.25;"></circle>
        <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg> Generating...`;

    // Wait a brief tick to allow rendering indicator
    setTimeout(() => {
      executeDownload()
        .then(() => {
          showToast("QR Code downloaded successfully!");
        })
        .catch((err) => {
          console.error(err);
          showToast("Download failed. Please try again.");
        })
        .finally(() => {
          dwnBtn.disabled = false;
          dwnBtn.innerHTML = `
            <svg viewBox="0 0 24 24"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM17 13l-5 5-5-5h3V9h4v4h3z"/></svg>
            Download QR Code`;
        });
    }, 100);
  });

  // Core download promise
  function executeDownload() {
    return new Promise((resolve, reject) => {
      const format = state.downloadFormat;
      const size = state.downloadSize;
      
      if (format === "svg" && !state.bgImageDataUrl) {
        // Direct SVG export
        // Construct SVG wrapping qr code + frame
        qrCodeStylingInstance.getRawData("svg")
          .then((blob) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              const svgText = e.target.result;
              const finalSvg = wrapSvgWithFrame(svgText, size);
              downloadBlob(new Blob([finalSvg], { type: "image/svg+xml" }), "scanapp-qr.svg");
              resolve();
            };
            reader.onerror = reject;
            reader.readAsText(blob);
          })
          .catch(reject);
      } else if (format === "pdf") {
        // Draw to final canvas first, then wrap in jsPDF
        getFinalCanvas(size)
          .then((canvas) => {
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({
              orientation: "portrait",
              unit: "mm",
              format: "a4"
            });
            
            const imgData = canvas.toDataURL("image/png");
            // Center the QR Code on A4 page (width 210mm, height 297mm)
            const qrWidthMm = 120;
            const qrHeightMm = (canvas.height / canvas.width) * qrWidthMm;
            const x = (210 - qrWidthMm) / 2;
            const y = (297 - qrHeightMm) / 2;
            
            // Add decorative elements in PDF
            pdf.setFillColor(10, 10, 12); // dark premium background
            pdf.rect(0, 0, 210, 297, "F");
            
            // Draw the QR Code canvas
            pdf.addImage(imgData, "PNG", x, y, qrWidthMm, qrHeightMm);
            
            // Header text in PDF
            pdf.setTextColor(255, 255, 255);
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(22);
            pdf.text("ScanApp Secure QR Code", 105, y - 20, { align: "center" });
            
            pdf.setTextColor(16, 185, 129);
            pdf.setFontSize(12);
            pdf.text("100% Private & Locally Generated", 105, y - 12, { align: "center" });
            
            // Footer in PDF
            pdf.setTextColor(156, 163, 175);
            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(10);
            pdf.text("Generated via scanapp.org/generate", 105, y + qrHeightMm + 20, { align: "center" });
            
            pdf.save("scanapp-qr.pdf");
            resolve();
          })
          .catch(reject);
      } else {
        // Default PNG / JPG or SVG with background image (rendered as PNG fallback)
        getFinalCanvas(size)
          .then((canvas) => {
            canvas.toBlob((blob) => {
              downloadBlob(blob, `scanapp-qr.${format}`);
              resolve();
            }, `image/${format === "jpg" ? "jpeg" : "png"}`, 0.95);
          })
          .catch(reject);
      }
    });
  }

  // --- CANVAS COMPOSITOR ---
  function getFinalCanvas(size) {
    return new Promise((resolve, reject) => {
      // 1. Create offline canvas
      const canvas = document.createElement("canvas");
      
      // Calculate height based on frame choice
      let canvasWidth = size;
      let canvasHeight = size;
      
      if (state.frameStyle === "bottom-text") {
        // bottom-text frame requires extra space at the bottom (approx 15% of width)
        canvasHeight = size + Math.round(size * 0.15);
      }
      
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      const ctx = canvas.getContext("2d");
      
      // 2. Draw Artistic Background image if available
      if (state.bgImageDataUrl) {
        const bgImg = new Image();
        bgImg.crossOrigin = "anonymous";
        bgImg.onload = () => {
          // Draw aspect fill
          const scale = Math.max(canvasWidth / bgImg.width, canvasHeight / bgImg.height);
          const x = (canvasWidth - bgImg.width * scale) / 2;
          const y = (canvasHeight - bgImg.height * scale) / 2;
          ctx.drawImage(bgImg, x, y, bgImg.width * scale, bgImg.height * scale);
          
          // Draw dark/light mask overlay to enhance readability
          ctx.fillStyle = state.bgColorType === "light" ? "rgba(255,255,255," + (1 - state.artisticContrast) + ")" : "rgba(0,0,0," + (1 - state.artisticContrast) + ")";
          ctx.fillRect(0, 0, canvasWidth, canvasHeight);
          
          // Next step: Draw the QR Code & Frame
          drawQrAndFrameOnCanvas(canvas, ctx, size, resolve, reject);
        };
        bgImg.onerror = reject;
        bgImg.src = state.bgImageDataUrl;
      } else {
        // Fill canvas solid white or transparent
        if (state.bgColorType === "transparent") {
          ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        } else {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        }
        drawQrAndFrameOnCanvas(canvas, ctx, size, resolve, reject);
      }
    });
  }

  function drawQrAndFrameOnCanvas(canvas, ctx, size, resolve, reject) {
    const qrSize = Math.round(size * 0.85); // 85% of standard square size
    const qrX = Math.round((size - qrSize) / 2);
    const qrY = Math.round((size - qrSize) / 2);

    // Draw frame styling on canvas first
    if (state.frameStyle === "border") {
      ctx.strokeStyle = state.frameColor;
      ctx.lineWidth = Math.round(size * 0.03); // 3% of width
      ctx.lineJoin = "round";
      // Draw border just outside QR boundary
      const pad = Math.round(size * 0.04);
      ctx.strokeRect(qrX - pad, qrY - pad, qrSize + pad * 2, qrSize + pad * 2);
    } else if (state.frameStyle === "bottom-text") {
      // Draw solid colored border box
      ctx.strokeStyle = state.frameColor;
      ctx.lineWidth = Math.round(size * 0.03);
      ctx.lineJoin = "round";
      
      const pad = Math.round(size * 0.04);
      const frameX = qrX - pad;
      const frameY = qrY - pad;
      const frameW = qrSize + pad * 2;
      const frameH = qrSize + pad * 2 + Math.round(size * 0.11);
      
      ctx.strokeRect(frameX, frameY, frameW, frameH);
      
      // Draw solid bottom background block
      ctx.fillStyle = state.frameColor;
      ctx.fillRect(frameX, frameY + frameH - Math.round(size * 0.11), frameW, Math.round(size * 0.11));
      
      // Write text in center of bottom block
      ctx.fillStyle = state.frameTextColor;
      const fontSize = Math.round(size * 0.05); // 5% of size
      ctx.font = `800 ${fontSize}px 'Outfit', -apple-system, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        state.frameText, 
        frameX + frameW / 2, 
        frameY + frameH - Math.round(size * 0.055)
      );
    }

    // Now render QR code at the output size onto a hidden temporary element
    const hiddenRender = document.createElement("div");
    hiddenRender.style.display = "none";
    document.body.appendChild(hiddenRender);

    const renderOpts = getQrOptions(qrSize, qrSize);
    // Make sure we force canvas type for hidden rendering
    renderOpts.type = "canvas";
    // If artistic background is set, let's keep the QR background transparent on canvas 
    // so it overlays correctly on top of background image
    if (state.bgImageDataUrl) {
      renderOpts.backgroundOptions = { color: "transparent" };
    }

    const tempQr = new QRCodeStyling(renderOpts);
    tempQr.append(hiddenRender);

    // Wait for the SVG/Canvas to fully draw inside library
    setTimeout(() => {
      const qrCanvas = hiddenRender.querySelector("canvas");
      if (qrCanvas) {
        // Draw the QR Code image in the center
        ctx.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize);
        hiddenRender.remove();
        resolve(canvas);
      } else {
        hiddenRender.remove();
        reject(new Error("Failed to render QR Code on Canvas"));
      }
    }, 150);
  }

  // --- SVG WRAPPER FOR FRAME DOWNLOADS ---
  function wrapSvgWithFrame(svgString, size) {
    if (state.frameStyle === "none") return svgString;
    
    // Parse SVG node
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgString, "image/svg+xml");
    const qrSvg = svgDoc.documentElement;
    
    // Calculate new height & boundaries
    const pad = Math.round(size * 0.06);
    const qrSize = Math.round(size * 0.85);
    const qrX = Math.round((size - qrSize) / 2);
    const qrY = Math.round((size - qrSize) / 2);

    let viewBoxHeight = size;
    if (state.frameStyle === "bottom-text") {
      viewBoxHeight = size + Math.round(size * 0.15);
    }
    
    // Adjust QR svg attributes to position it in center
    qrSvg.setAttribute("x", qrX.toString());
    qrSvg.setAttribute("y", qrY.toString());
    qrSvg.setAttribute("width", qrSize.toString());
    qrSvg.setAttribute("height", qrSize.toString());

    // Create wrapper SVG element
    const wrapper = svgDoc.createElementNS("http://www.w3.org/2000/svg", "svg");
    wrapper.setAttribute("width", size.toString());
    wrapper.setAttribute("height", viewBoxHeight.toString());
    wrapper.setAttribute("viewBox", `0 0 ${size} ${viewBoxHeight}`);
    wrapper.setAttribute("xmlns", "http://www.w3.org/2000/svg");

    // Add font definitions if not present
    const defs = svgDoc.createElementNS("http://www.w3.org/2000/svg", "defs");
    defs.innerHTML = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@800&amp;display=swap');
        .frame-text {
          font-family: 'Outfit', -apple-system, sans-serif;
          font-weight: 800;
        }
      </style>
    `;
    wrapper.appendChild(defs);

    // If border style
    if (state.frameStyle === "border") {
      const border = svgDoc.createElementNS("http://www.w3.org/2000/svg", "rect");
      const offset = Math.round(size * 0.04);
      border.setAttribute("x", (qrX - offset).toString());
      border.setAttribute("y", (qrY - offset).toString());
      border.setAttribute("width", (qrSize + offset * 2).toString());
      border.setAttribute("height", (qrSize + offset * 2).toString());
      border.setAttribute("rx", "12");
      border.setAttribute("ry", "12");
      border.setAttribute("fill", "none");
      border.setAttribute("stroke", state.frameColor);
      border.setAttribute("stroke-width", Math.round(size * 0.03).toString());
      wrapper.appendChild(border);
    } 
    // If bottom-text frame style
    else if (state.frameStyle === "bottom-text") {
      const offset = Math.round(size * 0.04);
      const frameX = qrX - offset;
      const frameY = qrY - offset;
      const frameW = qrSize + offset * 2;
      const frameH = qrSize + offset * 2 + Math.round(size * 0.11);
      const strokeW = Math.round(size * 0.03);

      // Main outline border
      const border = svgDoc.createElementNS("http://www.w3.org/2000/svg", "rect");
      border.setAttribute("x", frameX.toString());
      border.setAttribute("y", frameY.toString());
      border.setAttribute("width", frameW.toString());
      border.setAttribute("height", frameH.toString());
      border.setAttribute("rx", "16");
      border.setAttribute("ry", "16");
      border.setAttribute("fill", "none");
      border.setAttribute("stroke", state.frameColor);
      border.setAttribute("stroke-width", strokeW.toString());
      wrapper.appendChild(border);

      // Solid colored bottom block
      const bottomBar = svgDoc.createElementNS("http://www.w3.org/2000/svg", "rect");
      bottomBar.setAttribute("x", (frameX).toString());
      bottomBar.setAttribute("y", (frameY + frameH - Math.round(size * 0.11)).toString());
      bottomBar.setAttribute("width", (frameW).toString());
      bottomBar.setAttribute("height", Math.round(size * 0.11).toString());
      bottomBar.setAttribute("fill", state.frameColor);
      // mask rounded corner using bottom corner radius
      bottomBar.setAttribute("rx", "2");
      wrapper.appendChild(bottomBar);

      // Text label
      const text = svgDoc.createElementNS("http://www.w3.org/2000/svg", "text");
      text.setAttribute("x", (frameX + frameW / 2).toString());
      text.setAttribute("y", (frameY + frameH - Math.round(size * 0.055)).toString());
      text.setAttribute("fill", state.frameTextColor);
      text.setAttribute("font-size", Math.round(size * 0.05).toString());
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("dominant-baseline", "central");
      text.setAttribute("class", "frame-text");
      text.textContent = state.frameText;
      wrapper.appendChild(text);
    }

    wrapper.appendChild(qrSvg);
    return new XMLSerializer().serializeToString(wrapper);
  }

  function downloadBlob(blob, filename) {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // --- INITIALIZE ---
  initQrStyling();
});
