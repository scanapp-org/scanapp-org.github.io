import { h, s } from "../utils/dom";
import { appShell } from "../app-shell";

export class SupportPanel {
  private element: HTMLElement;
  private scrimElement?: HTMLElement;
  private isIframeInjected = false;
  private iframeContainer!: HTMLElement;

  constructor() {
    this.scrimElement = h("div", {
      class: "mobile-scrim-v2",
      onClick: () => this.hide()
    });
    document.getElementById("scanapp-root")?.appendChild(this.scrimElement);

    this.element = this.createPanel();
    document.getElementById("scanapp-root")?.appendChild(this.element);
  }

  public show(): void {
    if (!this.isIframeInjected) {
      this.injectIframe();
      this.isIframeInjected = true;
    }
    this.element.classList.add("show");
    if (this.scrimElement) {
      this.scrimElement.classList.add("show");
    }
  }

  public hide(): void {
    this.element.classList.remove("show");
    if (this.scrimElement) {
      this.scrimElement.classList.remove("show");
    }
  }

  private injectIframe(): void {
    this.iframeContainer.innerHTML = "";
    const iframe = document.createElement("iframe");
    iframe.id = "kofiframe-v2";
    iframe.src = "https://ko-fi.com/minhazav/?hidefeed=true&widget=true&embed=true&preview=true";
    iframe.style.border = "none";
    iframe.style.width = "100%";
    iframe.style.height = "520px";
    iframe.style.background = "transparent";
    iframe.style.borderRadius = "12px";
    iframe.title = "Ko-fi minhaz";
    this.iframeContainer.appendChild(iframe);
  }

  private createPanel(): HTMLElement {
    const closeIcon = s("svg", { viewBox: "0 0 24 24" },
      s("path", { d: "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" })
    );

    this.iframeContainer = h("div", { class: "support-iframe-container" });

    return h("div", { class: "support-panel-v2" },
      h("div", { class: "support-header-v2" },
        h("h3", {}, "Support ScanApp"),
        h("button", { class: "close-sheet-btn", onClick: () => this.hide() }, closeIcon)
      ),
      h("div", { class: "support-body-v2" },
        this.iframeContainer
      )
    );
  }
}
