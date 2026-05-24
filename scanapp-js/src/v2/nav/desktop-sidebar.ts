import { PageId } from "../types";
import { h, s } from "../utils/dom";
import { ThemeManager } from "../theme/theme-manager";

export class DesktopSidebar {
  private element: HTMLElement;
  private onNavigateCallback: (pageId: PageId) => void;
  private themeManager: ThemeManager;
  private activePage: PageId = PageId.SCAN;
  private buttons: Map<PageId, HTMLElement> = new Map();

  constructor(themeManager: ThemeManager, onNavigate: (pageId: PageId) => void) {
    this.themeManager = themeManager;
    this.onNavigateCallback = onNavigate;
    this.element = this.createSidebar();
  }

  public getElement(): HTMLElement {
    return this.element;
  }

  public setActivePage(pageId: PageId): void {
    const prevButton = this.buttons.get(this.activePage);
    if (prevButton) prevButton.classList.remove("active");

    const nextButton = this.buttons.get(pageId);
    if (nextButton) nextButton.classList.add("active");

    this.activePage = pageId;
  }

  private createSidebar(): HTMLElement {
    // Scan Icon (QR)
    const scanIcon = s("svg", { viewBox: "0 0 24 24" },
      s("path", { d: "M3 11h8V3H3v8zm2-6h4v4H5V5zM3 21h8v-8H3v8zm2-6h4v4H5v-4zM13 3v8h8V3h-8zm6 6h-4V5h4v4zM19 19h2v2h-2zm-6-6h2v2h-2zm2 2h2v2h-2zm-2 2h2v2h-2zm2-2h2v-2h2v2h-2v2h-2zm2-4h2v2h-2zm-4 0h2v2h-2zm2 2h-2v2h2v-2z" })
    );

    // History Icon (Clock)
    const historyIcon = s("svg", { viewBox: "0 0 24 24" },
      s("path", { d: "M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z" })
    );

    // Create Icon (Add Box)
    const createIcon = s("svg", { viewBox: "0 0 24 24" },
      s("path", { d: "M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h-2v4h4v2z" })
    );

    // Saved Icon (Bookmark)
    const savedIcon = s("svg", { viewBox: "0 0 24 24" },
      s("path", { d: "M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z" })
    );

    // Settings Icon (Gear)
    const settingsIcon = s("svg", { viewBox: "0 0 24 24" },
      s("path", { d: "M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" })
    );

    const scanBtn = h("button", {
      class: "sidebar-item active",
      onClick: () => this.handleNavigate(PageId.SCAN)
    }, scanIcon, h("span", {}, "Scan QR"));

    const historyBtn = h("button", {
      class: "sidebar-item disabled", // Stage 2
      onClick: () => this.handleNavigate(PageId.HISTORY)
    }, historyIcon, h("span", {}, "History"));

    const createBtn = h("button", {
      class: "sidebar-item disabled", // Stage 3
      onClick: () => this.handleNavigate(PageId.CREATE)
    }, createIcon, h("span", {}, "Create QR"));

    const savedBtn = h("button", {
      class: "sidebar-item disabled", // Stage 2
      onClick: () => {}
    }, savedIcon, h("span", {}, "Saved"));

    const settingsBtn = h("button", {
      class: "sidebar-item disabled", // Stage 2
      onClick: () => this.handleNavigate(PageId.SETTINGS)
    }, settingsIcon, h("span", {}, "Settings"));

    this.buttons.set(PageId.SCAN, scanBtn);
    this.buttons.set(PageId.HISTORY, historyBtn);
    this.buttons.set(PageId.CREATE, createBtn);
    this.buttons.set(PageId.SETTINGS, settingsBtn);

    // Theme selector dropdown
    const themeSelect = h("select", {
      class: "theme-select",
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

    const themeSelector = h("div", { class: "theme-selector-container" },
      h("label", {}, "Theme"),
      themeSelect
    );

    // Collapsed theme icon
    const themeIconSvg = s("svg", { viewBox: "0 0 24 24", width: "20", height: "20", fill: "currentColor" },
      s("path", { d: "M12 3a9 9 0 0 0 9 9 9.005 9.005 0 0 1-9-9zm9.93 8.58A10.01 10.01 0 0 0 12 2.07 10 10 0 1 0 21.93 12c.07-.33-.2-.59-.5-.59-.28 0-.47.16-.5.42A8.997 8.997 0 0 1 12 20a9 9 0 0 1-9-9 9 9 0 0 1 9-9c.35 0 .69.03 1.03.09.26.04.47-.15.47-.43 0-.3-.26-.57-.59-.5A10.05 10.05 0 0 0 12 1.07V1v1.07zm-7.69.58h.01-.01z" })
    );

    const themeCollapsedBtn = h("button", {
      class: "theme-picker-collapsed-btn",
      onClick: () => {
        const all = this.themeManager.getAllThemes();
        const active = this.themeManager.getActiveTheme();
        const idx = all.findIndex(t => t.id === active.id);
        const nextIdx = (idx + 1) % all.length;
        this.themeManager.setTheme(all[nextIdx].id);
      }
    }, themeIconSvg);

    return h("aside", { class: "desktop-sidebar" },
      h("div", { class: "sidebar-logo" },
        h("img", { src: "/assets/svg/scanapp.svg", alt: "logo" }),
        h("span", {}, "ScanApp")
      ),
      h("div", { class: "sidebar-menu" },
        scanBtn,
        historyBtn,
        createBtn,
        savedBtn,
        settingsBtn
      ),
      h("div", { class: "sidebar-footer" },
        themeSelector,
        themeCollapsedBtn
      )
    );
  }

  private handleNavigate(pageId: PageId): void {
    const btn = this.buttons.get(pageId);
    if (btn && btn.classList.contains("disabled")) return;
    this.onNavigateCallback(pageId);
  }
}
