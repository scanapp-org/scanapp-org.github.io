import { ScanResult, CodeCategory } from "../types";
import { h, s } from "../utils/dom";
import { isMobile } from "../utils/detect";
import { appShell } from "../app-shell";
import { Logger } from "../../scanapp/logger";

export interface InstallBannerOptions {
  shouldShow: () => boolean;
  onShown: () => void;
  onClick: () => void;
}

export class ResultPanel {
  private element: HTMLElement;
  private scrimElement?: HTMLElement;
  private currentResult: ScanResult | null = null;
  private onCloseCallback: () => void;
  
  // UI Bindings
  private typeIconWrapper!: HTMLElement;
  private typeTitle!: HTMLElement;
  private typeValue!: HTMLElement;
  private contentCard!: HTMLElement;
  private formatVal!: HTMLElement;
  private timeVal!: HTMLElement;
  private actionOpenBtn!: HTMLButtonElement;
  private actionShareBtn!: HTMLButtonElement;
  private actionPaymentBtn!: HTMLButtonElement;
  private installBannerElement!: HTMLElement;
  private placeholderElement!: HTMLElement;
  private contentViewElement!: HTMLElement;
  private collapsedTab!: HTMLElement;
  private kofiElement!: HTMLElement;
  private isKofiIframeInjected = false;
  private kofiIframeContainer!: HTMLElement;
  private installBannerShownForCurrentResult = false;

  private isAlwaysVisible(): boolean {
    return window.innerWidth >= 1200;
  }

  constructor(onClose: () => void, private readonly installBannerOptions?: InstallBannerOptions) {
    this.onCloseCallback = onClose;
    
    // Create scrim for mobile view
    if (isMobile()) {
      this.scrimElement = h("div", {
        class: "mobile-scrim-v2",
        onClick: () => this.hide()
      });
      document.getElementById("scanapp-root")?.appendChild(this.scrimElement);
    }

    this.element = this.createPanel();
    this.collapsedTab = this.createCollapsedTab();
    
    const root = document.getElementById("scanapp-root");
    if (root) {
      root.appendChild(this.collapsedTab);
      root.appendChild(this.element);
    }

    // Initial state: on widescreen >= 1200px show placeholder, on smaller desktop/mobile show content panel inside sheet
    if (this.isAlwaysVisible()) {
      this.placeholderElement.style.display = "flex";
      this.contentViewElement.style.display = "none";
    } else {
      this.placeholderElement.style.display = "none";
      this.contentViewElement.style.display = "flex";
    }
  }

  public show(result: ScanResult): void {
    this.currentResult = result;
    this.installBannerShownForCurrentResult = false;

    // Set badge info
    this.updateTypeUI(result.category, result.text);
    
    // Set format & time metadata
    this.formatVal.textContent = result.format;
    const date = new Date(result.timestamp);
    this.timeVal.textContent = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // Set content body
    this.contentCard.innerHTML = "";
    if (result.category === CodeCategory.URL) {
      // Ensure proper link prefix
      let url = result.text;
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        url = "https://" + url;
      }
      this.contentCard.appendChild(h("a", { href: url, target: "_blank", rel: "noopener noreferrer" }, result.text));
      this.actionOpenBtn.style.display = "flex";
    } else {
      this.contentCard.textContent = result.text;
      this.actionOpenBtn.style.display = "none";
    }
    this.actionPaymentBtn.style.display = result.category === CodeCategory.UPI ? "flex" : "none";
    this.refreshInstallBanner();

    // Toggle views inside panel
    if (this.placeholderElement) this.placeholderElement.style.display = "none";
    if (this.contentViewElement) this.contentViewElement.style.display = "flex";
    if (this.kofiElement) this.kofiElement.style.display = "none";

    // Toggle visibility
    this.element.classList.add("show");
    if (this.scrimElement) {
      this.scrimElement.classList.add("show");
    }

    // Check share API support
    if (!navigator.share) {
      this.actionShareBtn.style.opacity = "0.4";
    } else {
      this.actionShareBtn.style.opacity = "1";
    }
  }

  public refreshInstallBanner(): void {
    if (!this.installBannerElement || !this.installBannerOptions) {
      return;
    }

    const shouldShow = !!this.currentResult && this.installBannerOptions.shouldShow();
    this.installBannerElement.style.display = shouldShow ? "flex" : "none";
    if (shouldShow && !this.installBannerShownForCurrentResult) {
      this.installBannerShownForCurrentResult = true;
      this.installBannerOptions.onShown();
    }
  }

  public hide(): void {
    if (!this.isAlwaysVisible()) {
      this.element.classList.remove("show");
      if (this.scrimElement) {
        this.scrimElement.classList.remove("show");
      }
      if (this.kofiElement) this.kofiElement.style.display = "none";
    } else {
      // On widescreen >= 2500px, keep the panel visible but switch back to the placeholder view
      if (this.placeholderElement) this.placeholderElement.style.display = "flex";
      if (this.contentViewElement) this.contentViewElement.style.display = "none";
      if (this.kofiElement) this.kofiElement.style.display = "none";
    }
    this.currentResult = null;
    this.onCloseCallback();
  }

  private createPanel(): HTMLElement {
    // Icons
    const closeIcon1 = s("svg", { viewBox: "0 0 24 24" },
      s("path", { d: "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" })
    );

    const closeIcon2 = s("svg", { viewBox: "0 0 24 24" },
      s("path", { d: "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" })
    );

    const openIcon = s("svg", { viewBox: "0 0 24 24" },
      s("path", { d: "M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z" })
    );

    const copyIcon = s("svg", { viewBox: "0 0 24 24" },
      s("path", { d: "M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" })
    );

    const shareIcon = s("svg", { viewBox: "0 0 24 24" },
      s("path", { d: "M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z" })
    );

    this.typeIconWrapper = h("div", { class: "result-type-icon-wrapper" });
    this.typeTitle = h("span", { class: "result-type-title" }, "TEXT");
    this.typeValue = h("span", { class: "result-type-value" }, "Plain Text");
    this.contentCard = h("div", { class: "result-content-card" });
    this.formatVal = h("span", { class: "result-meta-val" }, "QR_CODE");
    this.timeVal = h("span", { class: "result-meta-val" }, "12:00:00 PM");

    this.actionOpenBtn = h("button", {
      class: "action-strip-btn",
      onClick: () => this.handleOpen()
    }, openIcon, h("span", {}, "Open"));

    this.actionShareBtn = h("button", {
      class: "action-strip-btn",
      onClick: () => this.handleShare()
    }, shareIcon, h("span", {}, "Share"));

    const paymentIcon = s("svg", { viewBox: "0 0 24 24" },
      s("path", { d: "M5 4h14v2H5V4zm0 4h9.5a4.5 4.5 0 0 1 0 9H12l4 3H12.8l-4-3H5v-2h9.5a2.5 2.5 0 0 0 0-5H5V8zm0 3h14v2H5v-2z" })
    );

    this.actionPaymentBtn = h("button", {
      class: "action-strip-btn",
      style: { display: "none" },
      onClick: () => this.handlePayment()
    }, paymentIcon, h("span", {}, "Pay"));

    const actionCopyBtn = h("button", {
      class: "action-strip-btn",
      onClick: () => this.handleCopy()
    }, copyIcon, h("span", {}, "Copy"));

    const downloadIcon = s("svg", { viewBox: "0 0 24 24" },
      s("path", { d: "M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" })
    );

    const actionDownloadBtn = h("button", {
      class: "action-strip-btn",
      onClick: () => this.handleDownload()
    }, downloadIcon, h("span", {}, "Download"));

    const installIcon = s("svg", { viewBox: "0 0 24 24" },
      s("path", { d: "M5 20h14v-2H5v2zM19 9h-4V3H9v6H5l7 7 7-7z" })
    );

    this.installBannerElement = h("button", {
      class: "pwa-install-banner",
      style: { display: "none" },
      onClick: () => {
        if (!this.installBannerOptions) return;
        this.installBannerOptions.onClick();
        this.refreshInstallBanner();
      }
    },
      h("span", { class: "pwa-install-banner-icon" }, installIcon),
      h("span", { class: "pwa-install-banner-copy" },
        h("span", { class: "pwa-install-banner-title" }, "Add ScanApp to homescreen"),
        h("span", { class: "pwa-install-banner-subtitle" }, "Open faster next time")
      ),
      s("svg", { viewBox: "0 0 24 24", class: "pwa-install-banner-chevron" },
        s("path", { d: "M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" })
      )
    );

    // Build placeholder view elements
    const phoneSvg = s("svg", {
      viewBox: "0 0 100 160",
      width: "120",
      height: "192",
      class: "placeholder-phone-svg"
    },
      s("rect", { x: "15", y: "10", width: "70", height: "140", rx: "14", fill: "none", stroke: "currentColor", "stroke-width": "2.5" }),
      s("path", { d: "M40 10a1 1 0 0 1 1 1v4a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3v-4a1 1 0 0 1 1-1", fill: "none", stroke: "currentColor", "stroke-width": "2" }),
      s("text", { x: "50", y: "40", "font-size": "7", "font-weight": "700", "text-anchor": "middle", fill: "currentColor", "letter-spacing": "1" }, "QR SCAN"),
      s("path", { d: "M30 65h6M30 65v6M70 65h-6M70 65v6M30 105h6M30 105v-6M70 105h-6M70 105v-6", fill: "none", stroke: "currentColor", "stroke-width": "1.5" }),
      s("g", { fill: "currentColor" },
        s("rect", { x: "34", y: "69", width: "8", height: "8" }),
        s("rect", { x: "36", y: "71", width: "4", height: "4", fill: "var(--sa-surface)" }),
        s("rect", { x: "58", y: "69", width: "8", height: "8" }),
        s("rect", { x: "60", y: "71", width: "4", height: "4", fill: "var(--sa-surface)" }),
        s("rect", { x: "34", y: "93", width: "8", height: "8" }),
        s("rect", { x: "36", y: "95", width: "4", height: "4", fill: "var(--sa-surface)" }),
        s("rect", { x: "46", y: "69", width: "2", height: "2" }),
        s("rect", { x: "50", y: "71", width: "2", height: "2" }),
        s("rect", { x: "44", y: "75", width: "4", height: "2" }),
        s("rect", { x: "54", y: "73", width: "2", height: "4" }),
        s("rect", { x: "46", y: "81", width: "6", height: "2" }),
        s("rect", { x: "58", y: "81", width: "4", height: "2" }),
        s("rect", { x: "34", y: "85", width: "2", height: "4" }),
        s("rect", { x: "40", y: "87", width: "4", height: "2" }),
        s("rect", { x: "48", y: "85", width: "2", height: "6" }),
        s("rect", { x: "54", y: "89", width: "6", height: "2" }),
        s("rect", { x: "62", y: "87", width: "4", height: "2" }),
        s("rect", { x: "44", y: "93", width: "2", height: "4" }),
        s("rect", { x: "48", y: "97", width: "6", height: "2" }),
        s("rect", { x: "58", y: "93", width: "2", height: "2" }),
        s("rect", { x: "62", y: "95", width: "4", height: "2" }),
        s("rect", { x: "58", y: "99", width: "8", height: "2" })
      ),
      s("line", { x1: "25", y1: "85", x2: "75", y2: "85", stroke: "var(--sa-primary)", "stroke-width": "2", "stroke-linecap": "round" }),
      s("text", { x: "50", y: "125", "font-size": "6", "font-style": "italic", "text-anchor": "middle", fill: "var(--sa-text-secondary)" }, "scanning...")
    );

    const placeholderHeader = h("div", { class: "result-header-v2" },
      h("h3", {}, "Scan Result"),
      h("button", {
        class: "close-sheet-btn",
        "aria-label": "Close scan result panel",
        title: "Close",
        onClick: () => this.hide()
      }, closeIcon1)
    );

    const pageData = (window as any).scanappPageData || {};
    const displayTitle = pageData.title || "QR Code Scanner - ScanApp";
    const displayDesc = pageData.description || "Use ScanApp to scan QR codes or different types of Bar Codes on your web browser using camera or images on the device. Scanning is supported on PC, Mac, Android or IOS and works 100% free! No signups required!";

    this.placeholderElement = h("div", { class: "result-placeholder-view" },
      placeholderHeader,
      h("div", { class: "result-placeholder-info" },
        h("h2", {}, displayTitle),
        h("p", {}, displayDesc),
        h("div", { class: "result-placeholder-local-pill" }, "Scanning is done locally on your device")
      ),
      h("div", { class: "result-placeholder-divider" },
        h("span", {}, "Scan Result"),
        s("svg", { viewBox: "0 0 24 24", class: "chevron-icon" },
          s("path", { d: "M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z" })
        )
      ),
      h("div", { class: "result-placeholder-empty-state" },
        phoneSvg,
        h("span", {}, "Scan to get results")
      ),
      this.createSupportCard()
    );

    // Build content view elements
    this.contentViewElement = h("div", { class: "result-content-view" },
      h("div", { class: "result-header-v2" },
        h("h3", {}, "Scan Result"),
        h("button", {
          class: "close-sheet-btn",
          "aria-label": "Close scan result panel",
          title: "Close",
          onClick: () => this.hide()
        }, closeIcon2)
      ),
      h("div", { class: "result-body-v2" },
        h("div", { class: "result-type-card" },
          this.typeIconWrapper,
          h("div", { class: "result-type-details" },
            this.typeTitle,
            this.typeValue
          )
        ),
        this.contentCard,
        h("div", { class: "result-meta-list" },
          h("div", { class: "result-meta-item" },
            h("span", { class: "result-meta-label" }, "Barcode Format"),
            this.formatVal
          ),
          h("div", { class: "result-meta-item" },
            h("span", { class: "result-meta-label" }, "Scanned Time"),
            this.timeVal
          )
        ),
        h("div", { class: "result-actions-strip" },
          this.actionOpenBtn,
          this.actionPaymentBtn,
          actionCopyBtn,
          this.actionShareBtn,
          actionDownloadBtn
        )
      ),
      h("div", { class: "scan-another-footer" },
        this.installBannerElement,
        h("button", { class: "primary-btn", onClick: () => this.hide() }, "Scan Another"),
        this.createSupportCard()
      )
    );

    const backIcon = s("svg", { viewBox: "0 0 24 24" },
      s("path", { d: "M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" })
    );

    const closeIcon3 = s("svg", { viewBox: "0 0 24 24" },
      s("path", { d: "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" })
    );

    this.kofiIframeContainer = h("div", { class: "support-iframe-container" });

    this.kofiElement = h("div", { class: "result-kofi-view" },
      h("div", { class: "result-header-v2" },
        h("div", { style: "display: flex; align-items: center; gap: 8px;" },
          h("button", {
            class: "kofi-back-btn",
            "aria-label": "Back to scan result",
            title: "Back",
            onClick: () => this.hideKoFi()
          }, backIcon),
          h("h3", {}, "Support ScanApp")
        ),
        h("button", {
          class: "close-sheet-btn",
          "aria-label": "Close support panel",
          title: "Close",
          onClick: () => this.hide()
        }, closeIcon3)
      ),
      h("div", { class: "result-body-v2", style: "padding: 12px;" },
        this.kofiIframeContainer
      )
    );
    this.kofiElement.style.display = "none";

    // Compile panel DOM
    return h("div", { class: "result-panel-v2" },
      this.placeholderElement,
      this.contentViewElement,
      this.kofiElement
    );
  }

  private handleOpen(): void {
    if (!this.currentResult || this.currentResult.category !== CodeCategory.URL) return;
    let url = this.currentResult.text;
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }
    Logger.logUrlAction(() => {
      window.open(url, "_blank", "noopener,noreferrer");
    });
  }

  private async handleCopy(): Promise<void> {
    if (!this.currentResult) return;
    Logger.logActionCopy();
    try {
      await navigator.clipboard.writeText(this.currentResult.text);
      appShell.showToast("Copied to clipboard!");
    } catch (err) {
      appShell.showToast("Failed to copy.");
    }
  }

  private async handleShare(): Promise<void> {
    if (!this.currentResult) return;
    Logger.logActionShare();
    if (!navigator.share) {
      // Fallback to copy
      this.handleCopy();
      return;
    }

    try {
      const shareData: ShareData = {
        title: "Scan Result - ScanApp",
        text: this.currentResult.text
      };
      if (this.currentResult.category === CodeCategory.URL) {
        let url = this.currentResult.text;
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
          url = "https://" + url;
        }
        shareData.url = url;
      }
      await navigator.share(shareData);
    } catch (e) {
      // User cancelled or error
      console.log("Share failed or cancelled", e);
    }
  }

  private handlePayment(): void {
    if (!this.currentResult || this.currentResult.category !== CodeCategory.UPI) return;
    Logger.logPaymentAction();
    try {
      window.location.href = decodeURIComponent(this.currentResult.text);
      appShell.showToast("Opening payment app...");
    } catch (err) {
      console.error("Payment action failed:", err);
      appShell.showToast("Payment action failed.");
    }
  }

  private handleDownload(): void {
    if (!this.currentResult) return;
    Logger.logActionDownload();
    try {
      const mimeType = "text/plain";
      const fileName = "scanapp_download.txt";
      const link = document.createElement("a");
      const blob = new Blob([this.currentResult.text], { type: mimeType });
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", fileName);
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 100);
      appShell.showToast("Download started!");
    } catch (err) {
      console.error("Download failed:", err);
      appShell.showToast("Failed to download.");
    }
  }

  private updateTypeUI(category: CodeCategory, text: string): void {
    this.typeIconWrapper.innerHTML = "";
    
    let pathD = "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"; // default info icon
    let titleStr = "TEXT";
    let descStr = "Plain Text";

    if (category === CodeCategory.URL) {
      pathD = "M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z";
      titleStr = "LINK / URL";
      try {
        const host = new URL(text.startsWith("http") ? text : `https://${text}`).hostname;
        descStr = host || "Website URL";
      } catch (e) {
        descStr = "Website URL";
      }
    } else if (category === CodeCategory.PHONE) {
      pathD = "M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z";
      titleStr = "PHONE NUMBER";
      descStr = text.replace("tel:", "");
    } else if (category === CodeCategory.WIFI) {
      pathD = "M12 3C7.31 3 3.07 4.9 0 8l1.41 1.41C4.01 6.8 7.84 5 12 5s7.99 1.8 10.59 4.41L24 8c-3.07-3.1-7.31-5-12-5zm0 8c-2.69 0-5.12 1.1-6.89 2.87L6.5 15.3c1.41-1.41 3.35-2.3 5.5-2.3s4.09.89 5.5 2.3l1.41-1.41C17.12 12.1 14.69 11 12 11zm0 4c-1.34 0-2.56.55-3.44 1.44l1.41 1.41C10.5 17.3 11.22 17 12 17s1.5.3 2.03.88l1.41-1.41C14.56 15.55 13.34 15 12 15z";
      titleStr = "WI-FI CONFIG";
      const ssidMatch = text.match(/S:([^;]+)/);
      descStr = ssidMatch ? `Network: ${ssidMatch[1]}` : "Wireless Network";
    } else if (category === CodeCategory.UPI) {
      pathD = "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z";
      titleStr = "PAYMENT / UPI";
      try {
        const upiUrl = new URL(text);
        const payee = upiUrl.searchParams.get("pn");
        descStr = payee ? `Payee: ${payee}` : "UPI Payment";
      } catch (e) {
        descStr = "UPI Payment";
      }
    }

    const iconSvg = s("svg", { viewBox: "0 0 24 24" }, s("path", { d: pathD }));
    this.typeIconWrapper.appendChild(iconSvg);
    this.typeTitle.textContent = titleStr;
    this.typeValue.textContent = descStr;
  }

  private createCollapsedTab(): HTMLElement {
    const barcodeIcon = s("svg", { viewBox: "0 0 24 24", class: "tab-icon" },
      s("path", { d: "M3 5h2v14H3zm4 0h1v14H7zm3 0h2v14h-2zm4 0h1v14h-1zm3 0h3v14h-3z" })
    );

    const chevronIcon = s("svg", { viewBox: "0 0 24 24", class: "tab-chevron" },
      s("path", { d: "M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" })
    );

    return h("div", {
      class: "result-collapsed-tab",
      onClick: () => this.showPanelFromTab()
    },
      chevronIcon,
      barcodeIcon,
      h("div", { class: "tab-text" }, "SCAN RESULT")
    );
  }

  private showPanelFromTab(): void {
    Logger.logBetaResultPanelCollapsedTabOpen(!!this.currentResult);
    if (this.currentResult) {
      this.placeholderElement.style.display = "none";
      this.contentViewElement.style.display = "flex";
    } else {
      this.placeholderElement.style.display = "flex";
      this.contentViewElement.style.display = "none";
    }
    this.element.classList.add("show");
  }

  private createSupportCard(): HTMLElement {
    const adContainer = h("div", {
      class: "result-panel-support-card",
      style: "display: block; width: auto; background: transparent; border: none; min-height: 100px; text-align: center;"
    });

    const tryPushAd = () => {
      if (adContainer.offsetWidth > 0) {
        adContainer.innerHTML = "";

        const ins = document.createElement("ins");
        ins.className = "adsbygoogle";
        ins.style.display = "block";
        ins.setAttribute("data-ad-client", "ca-pub-1311871960161162");
        ins.setAttribute("data-ad-slot", "8739501923");
        ins.setAttribute("data-ad-format", "auto");
        ins.setAttribute("data-full-width-responsive", "true");
        adContainer.appendChild(ins);

        const script2 = document.createElement("script");
        script2.innerHTML = "setTimeout(function() { (window.adsbygoogle = window.adsbygoogle || []).push({}); }, 100);";
        adContainer.appendChild(script2);
      } else {
        setTimeout(tryPushAd, 200);
      }
    };
    setTimeout(tryPushAd, 50);

    return adContainer;
  }

  private showKoFi(): void {
    Logger.logBetaKoFiSupportClick("result_panel");
    this.placeholderElement.style.display = "none";
    this.contentViewElement.style.display = "none";
    this.kofiElement.style.display = "flex";

    if (!this.isKofiIframeInjected) {
      this.injectKofiIframe();
      this.isKofiIframeInjected = true;
    }
  }

  private hideKoFi(): void {
    this.kofiElement.style.display = "none";
    if (this.currentResult) {
      this.placeholderElement.style.display = "none";
      this.contentViewElement.style.display = "flex";
    } else {
      this.placeholderElement.style.display = "flex";
      this.contentViewElement.style.display = "none";
    }
  }

  private injectKofiIframe(): void {
    const tryPushAd = () => {
      if (this.kofiIframeContainer.offsetWidth > 0) {
        this.kofiIframeContainer.innerHTML = "";

        const ins = document.createElement("ins");
        ins.className = "adsbygoogle";
        ins.style.display = "block";
        ins.setAttribute("data-ad-client", "ca-pub-1311871960161162");
        ins.setAttribute("data-ad-slot", "8739501923");
        ins.setAttribute("data-ad-format", "auto");
        ins.setAttribute("data-full-width-responsive", "true");
        this.kofiIframeContainer.appendChild(ins);

        const script2 = document.createElement("script");
        script2.innerHTML = "setTimeout(function() { (window.adsbygoogle = window.adsbygoogle || []).push({}); }, 100);";
        this.kofiIframeContainer.appendChild(script2);
      } else {
        setTimeout(tryPushAd, 200);
      }
    };
    setTimeout(tryPushAd, 50);
  }
}
