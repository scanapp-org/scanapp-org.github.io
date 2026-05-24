export enum PageId {
  SCAN = "scan",
  HISTORY = "history",
  CREATE = "create",
  SETTINGS = "settings"
}

export enum CodeCategory {
  URL = "url",
  TEXT = "text",
  WIFI = "wifi",
  UPI = "upi",
  PHONE = "phone",
  UNKNOWN = "unknown"
}

export interface ScanResult {
  text: string;
  format: string;
  category: CodeCategory;
  timestamp: string;
  saved?: boolean;
}

export interface Theme {
  name: string;
  displayName: string;
  isDark: boolean;
  variables: Record<string, string>;
}
