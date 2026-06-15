import { h, s } from "../utils/dom";
import { Logger } from "../../scanapp/logger";

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
    Logger.logBetaSupportPanelClose();
    this.element.classList.remove("show");
    if (this.scrimElement) {
      this.scrimElement.classList.remove("show");
    }
  }

  private injectIframe(): void {
    const tryPushAd = () => {
      if (this.iframeContainer.offsetWidth > 0) {
        this.iframeContainer.innerHTML = "";

        const ins = document.createElement("ins");
        ins.className = "adsbygoogle";
        ins.style.display = "block";
        ins.setAttribute("data-ad-client", "ca-pub-1311871960161162");
        ins.setAttribute("data-ad-slot", "8739501923");
        ins.setAttribute("data-ad-format", "auto");
        ins.setAttribute("data-full-width-responsive", "true");
        this.iframeContainer.appendChild(ins);

        const script2 = document.createElement("script");
        script2.innerHTML = "setTimeout(function() { (window.adsbygoogle = window.adsbygoogle || []).push({}); }, 100);";
        this.iframeContainer.appendChild(script2);
      } else {
        setTimeout(tryPushAd, 200);
      }
    };
    setTimeout(tryPushAd, 50);
  }

  private createPanel(): HTMLElement {
    const closeIcon = s("svg", { viewBox: "0 0 24 24" },
      s("path", { d: "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" })
    );

    this.iframeContainer = h("div", { class: "support-iframe-container" });

    return h("div", { class: "support-panel-v2" },
      h("div", { class: "support-header-v2" },
        h("h3", {}, "Support ScanApp"),
        h("button", {
          class: "close-sheet-btn",
          "aria-label": "Close support panel",
          title: "Close",
          onClick: () => this.hide()
        }, closeIcon)
      ),
      h("div", { class: "support-body-v2" },
        this.iframeContainer
      )
    );
  }
}
