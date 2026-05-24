export interface ThemeInfo {
  id: string;
  name: string;
  isDark: boolean;
}

export const THEMES: ThemeInfo[] = [
  { id: "dark", name: "Dark Default", isDark: true },
  { id: "light", name: "Light Mode", isDark: false },
  { id: "monokai", name: "Monokai", isDark: true },
  { id: "dracula", name: "Dracula", isDark: true },
  { id: "nord", name: "Nord", isDark: true },
  { id: "solarized-dark", name: "Solarized Dark", isDark: true }
];
