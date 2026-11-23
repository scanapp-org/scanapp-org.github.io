import { CodeCategory, ScanResult } from "../types";

export function detectCategory(text: string): CodeCategory {
  if (isWifi(text)) return CodeCategory.WIFI;
  if (isUpi(text)) return CodeCategory.UPI;
  if (isPhoneNumber(text)) return CodeCategory.PHONE;
  if (getEmailUri(text)) return CodeCategory.EMAIL;
  if (getWebUrl(text)) return CodeCategory.URL;
  return CodeCategory.TEXT;
}

export function parseScanResult(text: string, format: string): ScanResult {
  return {
    text,
    format,
    category: detectCategory(text),
    timestamp: new Date().toISOString()
  };
}

/** Return an explicit web destination only when the entire payload is a URL. */
export function getWebUrl(text: string): string | null {
  const candidate = text.trim();
  if (!candidate || /[\s\u0000-\u001f\u007f\\]/.test(candidate)) return null;
  const explicitHttp = /^https?:\/\//i.test(candidate);
  if (!explicitHttp && !/^[^:/?#@]+\.[^:/?#@]+(?::\d{1,5})?(?:[/?#].*)?$/.test(candidate)) return null;
  try {
    const url = new URL(explicitHttp ? candidate : `https://${candidate}`);
    if ((url.protocol !== "http:" && url.protocol !== "https:") || !url.hostname || url.username || url.password) return null;
    if (!explicitHttp && !/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+(?:[a-z]{2,63}|xn--[a-z0-9-]+)$/i.test(url.hostname)) return null;
    return url.href;
  } catch (_err) {
    return null;
  }
}

/** Preserve mailto recipients/query encoding; never turn it into a web URL. */
export function getEmailUri(text: string): string | null {
  const candidate = text.trim();
  if (/[<>"\\\u0000-\u001f\u007f]/.test(candidate)) return null;
  if (!/^mailto:[^\s/?#@]+@[^\s/?#@]+\.[^\s/?#@]+(?:\?[^\s#]*)?$/i.test(candidate)) return null;
  try {
    const uri = new URL(candidate);
    return uri.protocol === "mailto:" ? candidate : null;
  } catch (_err) {
    return null;
  }
}

function isPhoneNumber(text: string): boolean {
  const expression = /^tel:\+?[0-9]{3,}[0-9(). -]*(?:;[a-z0-9-]+=[^;\s]+)*$/i;
  const regexExp = new RegExp(expression);
  return !!text.match(regexExp);
}

function isWifi(text: string): boolean {
  const expression = /^WIFI:(?=[\s\S]*\bS:)[\s\S]*;;$/i;
  const regexExp = new RegExp(expression);
  return !!text.match(regexExp);
}

function isUpi(text: string): boolean {
  try {
    const upiUri = new URL(text);
    return upiUri.protocol === "upi:";
  } catch (err) {
    return false;
  }
}
