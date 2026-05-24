export class Storage {
  public static get(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn("Storage.get error:", e);
      return null;
    }
  }

  public static set(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn("Storage.set error:", e);
    }
  }

  public static remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn("Storage.remove error:", e);
    }
  }
}
