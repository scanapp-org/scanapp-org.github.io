import { CodeCategory, ScanResult } from "../types";

export function detectCategory(text: string): CodeCategory {
  if (isUrl(text)) return CodeCategory.URL;
  if (isPhoneNumber(text)) return CodeCategory.PHONE;
  if (isWifi(text)) return CodeCategory.WIFI;
  if (isUpi(text)) return CodeCategory.UPI;
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

function isUrl(text: string): boolean {
  const expression1 = /^((javascript:[\w-_]+(\([\w-_\s,.]*\))?)|(mailto:([\w\u00C0-\u1FFF\u2C00-\uD7FF-_]+\.)*[\w\u00C0-\u1FFF\u2C00-\uD7FF-_]+@([\w\u00C0-\u1FFF\u2C00-\uD7FF-_]+\.)*[\w\u00C0-\u1FFF\u2C00-\uD7FF-_]+)|(\w+:\/\/(([\w\u00C0-\u1FFF\u2C00-\uD7FF-]+\.)*([\w\u00C0-\u1FFF\u2C00-\uD7FF-]*\.?))(:\d+)?(((\/[^\s#$%^&*?]+)+|\/)(\?[\w\u00C0-\u1FFF\u2C00-\uD7FF:;&%_,.~+=-]+)?)?(#[\w\u00C0-\u1FFF\u2C00-\uD7FF-_]+)?))$/g;
  const regexExp1 = new RegExp(expression1);
  if (text.match(regexExp1)) return true;

  const expression2 = /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g;
  const regexExp2 = new RegExp(expression2);
  if (text.match(regexExp2)) return true;

  return false;
}

function isPhoneNumber(text: string): boolean {
  const expression = /tel:[+]*[0-9]{3,}/g;
  const regexExp = new RegExp(expression);
  return !!text.match(regexExp);
}

function isWifi(text: string): boolean {
  const expression = /WIFI:S:(.*);T:(.*);P:(.*);H:(.*);;/g;
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
