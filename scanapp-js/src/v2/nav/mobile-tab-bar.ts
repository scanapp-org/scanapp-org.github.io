import { PageId } from "../types";
import { h, s } from "../utils/dom";

export class MobileTabBar {
  private element: HTMLElement;
  private onNavigateCallback: (pageId: PageId) => void;
  private onSettingsCallback: () => void;
  private activePage: PageId = PageId.SCAN;
  private items: Map<PageId, HTMLElement> = new Map();

  constructor(onNavigate: (pageId: PageId) => void, onSettings: () => void) {
    this.onNavigateCallback = onNavigate;
    this.onSettingsCallback = onSettings;
    this.element = this.createTabBar();
  }

  public getElement(): HTMLElement {
    return this.element;
  }

  public setActivePage(pageId: PageId): void {
    const prevItem = this.items.get(this.activePage);
    if (prevItem) prevItem.classList.remove("active");

    const nextItem = this.items.get(pageId);
    if (nextItem) nextItem.classList.add("active");

    this.activePage = pageId;
  }

  private createTabBar(): HTMLElement {
    // Scan Icon (QR)
    const scanIcon = s("svg", { viewBox: "0 0 24 24" },
      s("path", { d: "M3 11h8V3H3v8zm2-6h4v4H5V5zM3 21h8v-8H3v8zm2-6h4v4H5v-4zM13 3v8h8V3h-8zm6 6h-4V5h4v4zM19 19h2v2h-2zm-6-6h2v2h-2zm2 2h2v2h-2zm-2 2h2v2h-2zm2-2h2v-2h2v2h-2v2h-2zm2-4h2v2h-2zm-4 0h2v2h-2zm2 2h-2v2h2v-2z" })
    );

    // Settings Icon (Gear)
    const settingsIcon = s("svg", { viewBox: "0 0 24 24" },
      s("path", { d: "M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" })
    );

    const scanItem = h("button", {
      class: "mobile-tab-item active",
      onClick: () => this.handleNavigate(PageId.SCAN)
    }, scanIcon, h("span", {}, "Scan"));

    const settingsItem = h("button", {
      class: "mobile-tab-item",
      onClick: () => this.onSettingsCallback()
    }, settingsIcon, h("span", {}, "Settings"));

    this.items.set(PageId.SCAN, scanItem);
    this.items.set(PageId.SETTINGS, settingsItem);

    return h("nav", { class: "mobile-tab-bar" },
      scanItem,
      settingsItem
    );
  }

  private handleNavigate(pageId: PageId): void {
    const item = this.items.get(pageId);
    if (item && item.classList.contains("disabled")) return;
    this.onNavigateCallback(pageId);
  }
}
