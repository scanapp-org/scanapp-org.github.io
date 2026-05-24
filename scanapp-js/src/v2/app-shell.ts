import { h } from "./utils/dom";
import { isMobile } from "./utils/detect";
import { ThemeManager } from "./theme/theme-manager";
import { Router } from "./router";
import { DesktopSidebar } from "./nav/desktop-sidebar";
import { MobileTabBar } from "./nav/mobile-tab-bar";
import { PageId } from "./types";
import { Logger } from "../scanapp/logger";
import { SupportPanel } from "./result/support-panel";
import { SettingsPanel } from "./result/settings-panel";

export class AppShell {
  private themeManager: ThemeManager;
  private router!: Router;
  private sidebar?: DesktopSidebar;
  private tabBar?: MobileTabBar;
  private toastContainer!: HTMLElement;
  private toastTimeout?: any;
  private currentPageId: PageId = PageId.SCAN;
  private supportPanel?: SupportPanel;
  private settingsPanel?: SettingsPanel;
  private static instance: AppShell;

  public static getInstance(): AppShell {
    if (!AppShell.instance) {
      AppShell.instance = new AppShell();
    }
    return AppShell.instance;
  }

  private constructor() {
    this.themeManager = new ThemeManager();
    this.initLayout();
  }

  private initLayout(): void {
    const root = document.getElementById("scanapp-root");
    if (!root) {
      console.error("Mount point #scanapp-root not found.");
      return;
    }
    root.innerHTML = ""; // Clear mount point

    // Create toast container
    this.toastContainer = h("div", { class: "toast-container-v2" });

    // Router View
    const routerView = h("div", { class: "router-view" });
    this.router = new Router(routerView);

    // Main App Content Container
    const appContent = h("div", { class: "app-content" },
      routerView,
      this.toastContainer
    );

    if (isMobile()) {
       // Mobile Layout
       this.tabBar = new MobileTabBar(
         (pageId) => this.navigateTo(pageId),
         () => this.showSettingsPanel()
       );
       appContent.appendChild(this.tabBar.getElement());

       const mobileUpgradeBanner = h("div", { class: "upgrade-banner-mobile" },
         h("div", { class: "upgrade-banner-content" },
           h("span", {}, "ScanApp has been upgraded! "),
           h("a", {
             href: "/version1",
             class: "upgrade-banner-link",
             onClick: () => Logger.logUpgradeBannerClick()
           }, "Go to version 1")
         )
       );
       appContent.insertBefore(mobileUpgradeBanner, routerView);

       root.appendChild(appContent);

       // Auto hide after 5 seconds
       setTimeout(() => {
         mobileUpgradeBanner.classList.add("fade-out");
         setTimeout(() => {
           mobileUpgradeBanner.remove();
         }, 300);
       }, 5000);
    } else {
      // Desktop Layout
      this.sidebar = new DesktopSidebar(
        this.themeManager,
        (pageId) => this.navigateTo(pageId),
        () => this.showSupportPanel()
      );
      root.appendChild(this.sidebar.getElement());
      root.appendChild(appContent);
    }

    // Handle viewport resize to dynamically adjust layout
    window.removeEventListener("resize", this.handleResize);
    window.addEventListener("resize", this.handleResize);
  }

  public getRouter(): Router {
    return this.router;
  }

  public getThemeManager(): ThemeManager {
    return this.themeManager;
  }

  public navigateTo(pageId: PageId): void {
    const prevPage = this.currentPageId;
    this.currentPageId = pageId;

    if (prevPage === PageId.HISTORY && pageId !== PageId.HISTORY) {
      Logger.logHistoryMenuButtonCloseClick();
    } else if (prevPage === PageId.SETTINGS && pageId !== PageId.SETTINGS) {
      Logger.logAboutMenuButtonCloseClick();
    }

    if (pageId === PageId.HISTORY) {
      Logger.logHistoryMenuButtonOpenClick();
    } else if (pageId === PageId.SETTINGS) {
      Logger.logAboutMenuButtonOpenClick();
    }

    this.router.navigateTo(pageId);
    if (this.sidebar) this.sidebar.setActivePage(pageId);
    if (this.tabBar) this.tabBar.setActivePage(pageId);
  }

  public showSupportPanel(): void {
    if (!this.supportPanel) {
      this.supportPanel = new SupportPanel();
    }
    this.supportPanel.show();
  }

  public showSettingsPanel(): void {
    if (!this.settingsPanel) {
      this.settingsPanel = new SettingsPanel(this.themeManager, () => {
        this.settingsPanel?.hide();
        this.showSupportPanel();
      });
    }
    this.settingsPanel.show();
  }

  public showToast(message: string, durationMs: number = 2500): void {
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastContainer.textContent = message;
    this.toastContainer.classList.add("show");
    
    this.toastTimeout = setTimeout(() => {
      this.toastContainer.classList.remove("show");
    }, durationMs);
  }

  private handleResize = (): void => {
    const currentMobile = isMobile();
    const hasSidebar = !!this.sidebar;
    const hasTabBar = !!this.tabBar;

    if (currentMobile && hasSidebar) {
      // Re-initialize for Mobile
      this.initLayout();
    } else if (!currentMobile && hasTabBar) {
      // Re-initialize for Desktop
      this.initLayout();
    }
  };
}
export const appShell = AppShell.getInstance();
