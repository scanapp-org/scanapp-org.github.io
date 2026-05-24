import { PageId } from "../types";
import { h, s } from "../utils/dom";
import { ThemeManager } from "../theme/theme-manager";
import { Logger } from "../../scanapp/logger";

export class DesktopSidebar {
  private element: HTMLElement;
  private onNavigateCallback: (pageId: PageId) => void;
  private themeManager: ThemeManager;
  private onSupportClickCallback?: () => void;
  private activePage: PageId = PageId.SCAN;
  private buttons: Map<PageId, HTMLElement> = new Map();

  constructor(
    themeManager: ThemeManager,
    onNavigate: (pageId: PageId) => void,
    onSupportClick?: () => void
  ) {
    this.themeManager = themeManager;
    this.onNavigateCallback = onNavigate;
    this.onSupportClickCallback = onSupportClick;
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

    // Blog Icon (File Text)
    const blogIcon = s("svg", { viewBox: "0 0 24 24" },
      s("path", { d: "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" })
    );

    // Medium Icon (Ellipses)
    const mediumIcon = s("svg", { viewBox: "0 0 24 24" },
      s("path", { d: "M12 12c0 3.037-1.79 5.5-4 5.5S4 15.037 4 12s1.79-5.5 4-5.5 4 2.463 4 5.5zm6.5 0c0 2.761-.67 5-1.5 5s-1.5-2.239-1.5-5 .67-5 1.5-5 1.5 2.239 1.5 5zm3.5 0c0 2.21-.224 4-.5 4s-.5-1.79-.5-4 .224-4 .5-4 .5 1.79.5 4z" })
    );

    const scanBtn = h("button", {
      class: "sidebar-item active",
      onClick: () => this.handleNavigate(PageId.SCAN)
    }, scanIcon, h("span", {}, "Scan QR"));

    const blogBtn = h("a", {
      href: "/blog/",
      target: "_blank",
      class: "sidebar-item"
    }, blogIcon, h("span", {}, "Blog"));

    const mediumBtn = h("a", {
      href: "https://medium.com/qr-code",
      target: "_blank",
      class: "sidebar-item"
    }, mediumIcon, h("span", {}, "Medium"));

    const supportIcon = s("svg", { viewBox: "0 0 24 24" },
      s("path", { d: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 16h-2v-2h2v2zm1.07-7.75l-.9.92C12.45 11.9 12 12.5 12 14h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.75z" })
    );

    const supportBtn = h("a", {
      href: "/support/",
      target: "_blank",
      class: "sidebar-item"
    }, supportIcon, h("span", {}, "Help & FAQ"));

    this.buttons.set(PageId.SCAN, scanBtn);

    // Privacy & Support Cards for Sidebar
    const shieldCheckIcon = s("svg", { viewBox: "0 0 24 24" },
      s("path", { d: "M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" })
    );

    const dropNote = h("div", { class: "sidebar-drop-note" },
      h("span", { class: "sidebar-drop-note-icon" }, "💡"),
      h("span", { class: "sidebar-drop-note-text" }, "Drag & drop image anywhere to scan")
    );

    const privacyCard = h("div", { class: "sidebar-privacy-card" },
      h("div", { class: "sidebar-privacy-icon-wrapper" }, shieldCheckIcon),
      h("div", { class: "sidebar-privacy-content" },
        h("span", { class: "sidebar-privacy-title" }, "Local & Private"),
        h("span", { class: "sidebar-privacy-desc" }, "Scans are processed 100% locally in your browser. Your data never leaves your device.")
      )
    );



    // Theme selector dropdown
    const themeSelect = h("select", {
      id: "desktop-theme-select",
      name: "theme",
      class: "theme-select",
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

    const themeSelector = h("div", { class: "theme-selector-container" },
      h("label", { htmlFor: "desktop-theme-select" }, "Theme"),
      themeSelect
    );

    // Collapsed theme icon
    const themeIconSvg = s("svg", { viewBox: "0 0 24 24", width: "20", height: "20", fill: "currentColor" },
      s("path", { d: "M12 3a9 9 0 0 0 9 9 9.005 9.005 0 0 1-9-9zm9.93 8.58A10.01 10.01 0 0 0 12 2.07 10 10 0 1 0 21.93 12c.07-.33-.2-.59-.5-.59-.28 0-.47.16-.5.42A8.997 8.997 0 0 1 12 20a9 9 0 0 1-9-9 9 9 0 0 1 9-9c.35 0 .69.03 1.03.09.26.04.47-.15.47-.43 0-.4-.26-.57-.59-.5A10.05 10.05 0 0 0 12 1.07V1v1.07zm-7.69.58h.01-.01z" })
    );

    const themeCollapsedBtn = h("button", {
      class: "theme-picker-collapsed-btn",
      "aria-label": "Cycle theme",
      title: "Cycle theme",
      onClick: () => {
        const all = this.themeManager.getAllThemes();
        const active = this.themeManager.getActiveTheme();
        const idx = all.findIndex(t => t.id === active.id);
        const nextIdx = (idx + 1) % all.length;
        this.themeManager.setTheme(all[nextIdx].id);
      }
    }, themeIconSvg);

    // Extra footer credits
    const sidebarExtraFooter = h("div", { class: "sidebar-extra-footer" },
      h("div", { class: "sidebar-footer-credits" }, "Built with ❤️ by ScanApp")
    );

    const upgradeBanner = h("div", { class: "upgrade-banner-sidebar" },
      h("div", { class: "upgrade-banner-content" },
        h("span", { class: "upgrade-banner-text" }, "ScanApp has been upgraded!"),
        h("a", {
          href: "/version1",
          class: "upgrade-banner-link",
          onClick: () => Logger.logUpgradeBannerClick()
        }, "Go to version 1")
      )
    );

    return h("aside", { class: "desktop-sidebar" },
      h("div", { class: "sidebar-logo" },
        h("img", { src: "/assets/images/svgs/logo.svg", alt: "logo" }),
        h("span", {}, "ScanApp")
      ),
      h("div", { class: "sidebar-menu" },
        scanBtn,
        blogBtn,
        mediumBtn,
        supportBtn,
        themeSelector,
        upgradeBanner,
        dropNote,
        privacyCard
      ),
      h("div", { class: "sidebar-footer" },
        sidebarExtraFooter,
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
