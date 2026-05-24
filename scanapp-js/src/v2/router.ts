import { PageId } from "./types";

export interface Page {
  id: PageId;
  getElement(): HTMLElement;
  onMount(): void;
  onUnmount(): void;
}

export class Router {
  private pages: Map<PageId, Page> = new Map();
  private activePageId: PageId | null = null;
  private container: HTMLElement;
  private listeners: Array<(pageId: PageId) => void> = [];

  constructor(container: HTMLElement) {
    this.container = container;
  }

  public register(page: Page): void {
    this.pages.set(page.id, page);
    const el = page.getElement();
    el.classList.add("page");
    this.container.appendChild(el);
  }

  public navigateTo(pageId: PageId): void {
    if (this.activePageId === pageId) return;
    
    const prevPage = this.activePageId ? this.pages.get(this.activePageId) : null;
    if (prevPage) {
      prevPage.getElement().classList.remove("active");
      prevPage.onUnmount();
    }

    const nextPage = this.pages.get(pageId);
    if (nextPage) {
      this.activePageId = pageId;
      nextPage.getElement().classList.add("active");
      nextPage.onMount();
      this.listeners.forEach(cb => cb(pageId));
    }
  }

  public getActivePageId(): PageId | null {
    return this.activePageId;
  }

  public onNavigation(callback: (pageId: PageId) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }
}
