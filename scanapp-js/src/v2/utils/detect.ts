export function isMobile(): boolean {
  return window.innerWidth <= 768;
}

export function isIframe(): boolean {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
}

export function isAndroid(): boolean {
  return /Android/i.test(navigator.userAgent);
}

export function isIOS(): boolean {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}
