import { h, s } from "../utils/dom";
import { ThemeManager } from "../theme/theme-manager";
import { Logger } from "../../scanapp/logger";

export class SettingsPanel {
  private element: HTMLElement;
  private scrimElement?: HTMLElement;
  private themeManager: ThemeManager;
  private onSupportClickCallback: () => void;

  constructor(themeManager: ThemeManager, onSupportClick: () => void) {
    this.themeManager = themeManager;
    this.onSupportClickCallback = onSupportClick;

    this.scrimElement = h("div", {
      class: "mobile-scrim-v2",
      onClick: () => this.hide()
    });
    document.getElementById("scanapp-root")?.appendChild(this.scrimElement);

    this.element = this.createPanel();
    document.getElementById("scanapp-root")?.appendChild(this.element);
  }

  public show(): void {
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

  private createPanel(): HTMLElement {
    const closeIcon = s("svg", { viewBox: "0 0 24 24" },
      s("path", { d: "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" })
    );

    const heartIcon = s("svg", { viewBox: "0 0 24 24" },
      s("path", { d: "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" })
    );

    const logoImg = h("img", {
      src: "/assets/icons/pwa-192x192.png",
      alt: "ScanApp Logo",
      class: "settings-logo"
    });

    const headerTitle = h("div", { class: "settings-header-title-container" },
      logoImg,
      h("span", { class: "settings-header-text" }, "ScanApp")
    );

    const themeSelect = h("select", {
      id: "settings-theme-select",
      name: "theme",
      class: "settings-theme-select",
      "aria-label": "Theme",
      onChange: (e: any) => this.themeManager.setTheme(e.target.value)
    },
      ...this.themeManager.getAllThemes().map(t =>
        h("option", {
          value: t.id,
          selected: t.id === this.themeManager.getActiveTheme().id
        }, t.name)
      )
    );

    // Watch for theme changes externally
    this.themeManager.onChange((theme) => {
      themeSelect.value = theme.id;
    });

    const themeOptionRow = h("div", { class: "settings-option-row" },
      h("div", { class: "settings-option-info" },
        h("label", { class: "settings-option-label", htmlFor: "settings-theme-select" }, "Theme"),
        h("span", { class: "settings-option-sublabel" }, "Choose UI appearance")
      ),
      themeSelect
    );

    // Support Banner Card
    const openSupport = () => {
      Logger.logBetaKoFiSupportClick("settings_panel");
      this.onSupportClickCallback();
    };

    const supportBanner = h("div", {
      class: "support-banner-card",
      role: "button",
      tabindex: "0",
      onClick: openSupport,
      onKeyDown: (event: KeyboardEvent) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openSupport();
        }
      }
    },
      h("div", { class: "support-banner-icon-wrapper" }, heartIcon),
      h("div", { class: "support-banner-content" },
        h("span", { class: "support-banner-title" }, "Support ScanApp"),
        h("span", { class: "support-banner-desc" }, "Keep scanning ad-free! Support the creator with a donation.")
      ),
      h("span", { class: "support-banner-arrow" }, "→")
    );

    const shieldCheckIcon = s("svg", { viewBox: "0 0 24 24" },
      s("path", { d: "M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" })
    );

    const privacyCard = h("div", { class: "settings-privacy-card" },
      h("div", { class: "settings-privacy-icon-wrapper" }, shieldCheckIcon),
      h("div", { class: "settings-privacy-content" },
        h("span", { class: "settings-privacy-title" }, "Local & Private"),
        h("span", { class: "settings-privacy-desc" }, "Scanning is fully local inside your browser. No camera feed or barcode data is ever sent to any server.")
      )
    );

    const body = h("div", { class: "settings-body-v2" },
      themeOptionRow,
      privacyCard,
      supportBanner
    );

    const footer = h("div", { class: "settings-footer-v2" },
      h("div", { class: "settings-footer-links" },
        h("a", { href: "/blog/", target: "_blank", class: "settings-footer-link" }, "Blog"),
        h("span", { class: "settings-footer-separator" }, "•"),
        h("a", { href: "/support/", target: "_blank", class: "settings-footer-link" }, "Help & FAQ"),
        h("span", { class: "settings-footer-separator" }, "•"),
        h("a", { href: "https://medium.com/qr-code", target: "_blank", class: "settings-footer-link" }, "Medium")
      ),
      h("div", { class: "settings-footer-credits" }, "Built with ❤️ by ScanApp")
    );

    return h("div", { class: "settings-panel-v2" },
      h("div", { class: "settings-header-v2" },
        headerTitle,
        h("button", {
          class: "close-sheet-btn",
          "aria-label": "Close settings panel",
          title: "Close",
          onClick: () => this.hide()
        }, closeIcon)
      ),
      body,
      footer
    );
  }
}
