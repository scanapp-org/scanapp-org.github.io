import { h, s } from "../utils/dom";
import { ThemeManager } from "../theme/theme-manager";

export class SettingsPanel {
  private element: HTMLElement;
  private scrimElement?: HTMLElement;
  private themeManager: ThemeManager;

  constructor(themeManager: ThemeManager) {
    this.themeManager = themeManager;

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

    const logoImg = h("img", {
      src: "/assets/images/svgs/logo.svg",
      alt: "ScanApp Logo",
      class: "settings-logo"
    });

    const headerTitle = h("div", { class: "settings-header-title-container" },
      logoImg,
      h("span", { class: "settings-header-text" }, "ScanApp")
    );

    const themeSelect = h("select", {
      class: "settings-theme-select",
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
        h("span", { class: "settings-option-label" }, "Theme"),
        h("span", { class: "settings-option-sublabel" }, "Choose UI appearance")
      ),
      themeSelect
    );

    const body = h("div", { class: "settings-body-v2" },
      themeOptionRow
    );

    const footer = h("div", { class: "settings-footer-v2" },
      h("div", { class: "settings-footer-links" },
        h("a", { href: "/blog/", target: "_blank", class: "settings-footer-link" }, "Blog"),
        h("span", { class: "settings-footer-separator" }, "•"),
        h("a", { href: "https://medium.com/qr-code", target: "_blank", class: "settings-footer-link" }, "Medium")
      ),
      h("div", { class: "settings-footer-credits" }, "Built with ❤️ by ScanApp")
    );

    return h("div", { class: "settings-panel-v2" },
      h("div", { class: "settings-header-v2" },
        headerTitle,
        h("button", { class: "close-sheet-btn", onClick: () => this.hide() }, closeIcon)
      ),
      body,
      footer
    );
  }
}
