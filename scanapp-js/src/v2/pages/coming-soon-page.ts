import { Page } from "../router";
import { PageId } from "../types";
import { h, s } from "../utils/dom";

export class ComingSoonPage implements Page {
  public id: PageId;
  private element: HTMLElement;
  private title: string;

  constructor(id: PageId, title: string) {
    this.id = id;
    this.title = title;
    this.element = this.createPage();
  }

  public getElement(): HTMLElement {
    return this.element;
  }

  public onMount(): void {}
  public onUnmount(): void {}

  private createPage(): HTMLElement {
    const iconPath = this.getIconPath();
    const iconSvg = s("svg", { viewBox: "0 0 24 24" }, s("path", { d: iconPath }));

    return h("div", { class: "subpage-container" },
      h("div", { class: "subpage-header" },
        h("h2", {}, this.title)
      ),
      h("div", { class: "coming-soon-card" },
        iconSvg,
        h("h3", {}, "Coming Soon"),
        h("p", {}, `The ${this.title} feature is currently under development. It will be available in Stage 2/3 of the ScanApp v2 rebuild.`)
      )
    );
  }

  private getIconPath(): string {
    switch (this.id) {
      case PageId.HISTORY:
        return "M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z";
      case PageId.CREATE:
        return "M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h-2v4h4v2z";
      case PageId.SETTINGS:
        return "M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z";
      default:
        return "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z";
    }
  }
}
