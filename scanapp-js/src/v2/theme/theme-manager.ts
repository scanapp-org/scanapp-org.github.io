import { Storage } from "../utils/storage";
import { THEMES, ThemeInfo } from "./themes";

export class ThemeManager {
  private static readonly STORAGE_KEY = "scanapp-v2-theme";
  private currentTheme: string = "dark";
  private listeners: Array<(theme: ThemeInfo) => void> = [];

  constructor() {
    const saved = Storage.get(ThemeManager.STORAGE_KEY);
    if (saved && THEMES.some(t => t.id === saved)) {
      this.currentTheme = saved;
    } else {
      this.currentTheme = "dark";
    }
    this.applyTheme(this.currentTheme);
  }

  public getActiveTheme(): ThemeInfo {
    return THEMES.find(t => t.id === this.currentTheme) || THEMES[0];
  }

  public getAllThemes(): ThemeInfo[] {
    return THEMES;
  }

  public setTheme(themeId: string): void {
    if (!THEMES.some(t => t.id === themeId)) return;
    this.currentTheme = themeId;
    Storage.set(ThemeManager.STORAGE_KEY, themeId);
    this.applyTheme(themeId);
    
    const themeInfo = this.getActiveTheme();
    this.listeners.forEach(cb => cb(themeInfo));
  }

  public onChange(callback: (theme: ThemeInfo) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  private applyTheme(themeId: string): void {
    document.documentElement.setAttribute("data-theme", themeId);
    
    // Update theme-color meta tag for mobile browser UI
    const theme = THEMES.find(t => t.id === themeId);
    const metaThemeColor = document.querySelector("meta[name='theme-color']");
    if (metaThemeColor) {
      if (themeId === "light") {
        metaThemeColor.setAttribute("content", "#f9fafb");
      } else if (themeId === "dark") {
        metaThemeColor.setAttribute("content", "#0a0a0c");
      } else if (themeId === "monokai") {
        metaThemeColor.setAttribute("content", "#272822");
      } else if (themeId === "dracula") {
        metaThemeColor.setAttribute("content", "#282a36");
      } else if (themeId === "nord") {
        metaThemeColor.setAttribute("content", "#2e3440");
      } else if (themeId === "solarized-dark") {
        metaThemeColor.setAttribute("content", "#002b36");
      }
    }
  }
}
