/**
 * @fileoverview
 * Misc functions, to be moved to separate classes.
 * 
 * @author mebjas <minhazav@gmail.com>
 */

import { CodeCategory } from "./constants";
import { Logger } from "./logger";

export function showBanner(message: string, isSuccessMessage?: boolean): void {
    hideBanners();
    var selector = ".banner.success";
    var textId = "banner-success-message";
    if (isSuccessMessage === false) {
        selector = ".banner.error";
        textId = "banner-error-message";
    }

    const bannerContainer = document.getElementById(textId);
    const bannerQuerySelector = document.querySelector(selector);
    if (bannerContainer) {
        bannerContainer.innerText = message;
    }

    requestAnimationFrame(() => {
        if (bannerQuerySelector) {
            bannerQuerySelector.classList.add("visible");       
        }
    });
};
  
export function hideBanners(): void {
    document
        .querySelectorAll(".banner.visible")
        .forEach((b) => b.classList.remove("visible"));
};

export function shareResult(decodedText: string, codeType?: CodeCategory) {
    const shareData: ShareData = {
        title: "Scan result from Scanapp.org",
        text: decodedText,
    };

    if (codeType && codeType === CodeCategory.TYPE_URL) {
        shareData.url = decodedText;
    }

    navigator.share(shareData).then(() => {
        showBanner("Shared successfully");
    }).catch((_) => {
        showBanner("Sharing cancelled or failed", false);
    });
}

function isNullOrUndefined(obj: any) {
    return !(obj && obj !== null);
}

function isUrl(decodedText: string): boolean {
    var expression1 = /^((javascript:[\w-_]+(\([\w-_\s,.]*\))?)|(mailto:([\w\u00C0-\u1FFF\u2C00-\uD7FF-_]+\.)*[\w\u00C0-\u1FFF\u2C00-\uD7FF-_]+@([\w\u00C0-\u1FFF\u2C00-\uD7FF-_]+\.)*[\w\u00C0-\u1FFF\u2C00-\uD7FF-_]+)|(\w+:\/\/(([\w\u00C0-\u1FFF\u2C00-\uD7FF-]+\.)*([\w\u00C0-\u1FFF\u2C00-\uD7FF-]*\.?))(:\d+)?(((\/[^\s#$%^&*?]+)+|\/)(\?[\w\u00C0-\u1FFF\u2C00-\uD7FF:;&%_,.~+=-]+)?)?(#[\w\u00C0-\u1FFF\u2C00-\uD7FF-_]+)?))$/g;
    var regexExp1 = new RegExp(expression1);
    if (decodedText.match(regexExp1)) {
       return true;
    }

    var expression2 = /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g;
    var regexExp2 = new RegExp(expression2);

    if (decodedText.match(regexExp2)) {
       return true;
    }
    return false;
}

function isPhoneNumber(decodedText: string): boolean {
    var expression = /tel:[+]*[0-9]{3,}/g;
    var regexExp = new RegExp(expression);
    return !isNullOrUndefined(decodedText.match(regexExp));
}

function isWifi(decodedText: string): boolean {
    var expression = /WIFI:S:(.*);T:(.*);P:(.*);H:(.*);;/g;
    var regexExp = new RegExp(expression);
    return !isNullOrUndefined(decodedText.match(regexExp));  
}

function isUpi(decodedText: string): boolean {
    try {
        var upiUri = new URL(decodedText);
        if (!upiUri || upiUri == null) {
            return false;
        }
        return upiUri.protocol === "upi:";
    } catch (err) {
        return false;
    }
}

// TODO(minhazav): Add logging for the detected type.
export function detectType(decodedText: string): CodeCategory {
    if (isUrl(decodedText)) {
        return CodeCategory.TYPE_URL;
    }

    if (isPhoneNumber(decodedText)) {
        return CodeCategory.TYPE_PHONE;
    }

    if (isWifi(decodedText)) {
        return CodeCategory.TYPE_WIFI;
    }

    if (isUpi(decodedText)) {
        return CodeCategory.TYPE_UPI;
    }

    return CodeCategory.TYPE_TEXT;
}

export function isEmbeddedInIframe() {
    return (window !== window.parent);
}

export function showAntiEmbedWindow() {
    let iframeAlertSection =  document.getElementById("iframe-alert")!;
    iframeAlertSection.style.display = "block";
    Logger.logAntiEmbedWindowShown();

    // Trigger Ads
    let adsbygoogle = (window as any).adsbygoogle || [];
    adsbygoogle.push({});

    var naviateToScanAppButton: HTMLButtonElement = document.getElementById("iframe-alert-actions-navigate")! as HTMLButtonElement;
    var continueHereButton: HTMLButtonElement = document.getElementById("iframe-alert-actions-continue")! as HTMLButtonElement;

    function navigateToScanapp() {
        naviateToScanAppButton.removeEventListener("click", navigateToScanapp);
        naviateToScanAppButton.disabled = true;
        Logger.logAntiEmbedActionNavigateToScanApp(function() {
            window.parent.location.href = "https://scanapp.org#referral=anti-embed";
        })
    }
    naviateToScanAppButton.addEventListener("click", navigateToScanapp);

    var continueHereTimeLeft = 6;
    continueHereButton.disabled = true;
    function updateTimer() {
        continueHereTimeLeft--;
        continueHereButton.innerText = `Continue here (${continueHereTimeLeft})`;
        if (continueHereTimeLeft > 0) {
            setTimeout(updateTimer, 1000);
        } else {
            continueHereButton.innerText = `Continue using here`;
            continueHereButton.disabled = false;
        }
    }
    updateTimer();

    function continueHere() {
        continueHereButton.disabled = true;
        continueHereButton.removeEventListener("click", continueHere);
        Logger.logAntiEmbedActionContinueHere(function() {
            iframeAlertSection.style.display = "none";
        });
    }
    continueHereButton.addEventListener("click", continueHere);
}