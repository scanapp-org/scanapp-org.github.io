let TYPE_TEXT = "TEXT";
let TYPE_URL = "URL";
let TYPE_PHONE = "PHONE NUMBER";
let TYPE_WIFI = "WIFI";
let TYPE_UPI = "UPI";

let QR_RESULT_HEADER_FROM_SCAN = "Scanned result";
// TODO(mohsinaav): Use this as title when result is loaded from history.
let QR_RESULT_HEADER_FROM_HISTORY = "Scan result from History";

//#region Gtag event handler
let Logger = {
    logScanStart: function(isEmbeddedInIframe)  {
        gtag('event', 'ScanStart', {
            'event_category': 'Start',
            'event_label': `embed=${isEmbeddedInIframe}`,
        });
    },

    logScanRestart: function() {
        gtag('event', 'ScanStart', {
            'event_category': 'Restart',
            'event_label': 'NA',
        });
    },

    logScanSuccess: function(scanType, codeType) {
        gtag('event', 'ScanSuccess', {
            'event_category': scanType,
            'event_label': codeType,
        });

        var scanTypeEvent = `ScanSuccess_${scanType}`;
        gtag('event', scanTypeEvent, {
            'event_category': 'codeType',
            'event_label': 'NA',
        });
    },

    logActionCopy: function() {
        gtag('event', 'Action-Copy', {});
    },

    logActionShare: function() {
        gtag('event', 'Action-Share', {});
        gtag('event', 'share', {});
    },

    logPaymentAction: function() {
        gtag('event', 'Action-Payment', {});
    },

    logAntiEmbedWindowShown: function() {
        gtag('event', 'Anti-Embed-Window', {});
    },

    logAntiEmbedActionNavigateToScanApp: function(callback) {
        gtag('event', 'Anti-Embed-Action', {
            'event_category': 'NavigateToScanapp',
            'event_callback': function() {
                callback();
            }
        });
    },

    logAntiEmbedActionContinueHere: function(callback) {
        gtag('event', 'Anti-Embed-Action', {
            'event_category': 'Continue',
            'event_callback': function() {
                callback();
            }
        });
    }
};
//#endregion

//#region banner
function showBanner(message, isSuccessMessage) {
    hideBanners();
    selector = ".banner.success";
    textId = "banner-success-message";
    if (isSuccessMessage === false) {
        selector = ".banner.error";
        textId = "banner-error-message";
    }

    document.getElementById(textId).innerText = message;
    requestAnimationFrame(() => {
        const banner = document.querySelector(selector);
        banner.classList.add("visible");
    });
};
  
function hideBanners(e) {
    document
        .querySelectorAll(".banner.visible")
        .forEach((b) => b.classList.remove("visible"));
};

function shareResult(decodedText, decodedResultType) {
    const shareData = {
        title: "Scan result from Scanapp.org",
        text: decodedText,
    };

    if (decodedResultType == TYPE_URL) {
        shareData.url = decodedText;
    }

    navigator.share(shareData).then(function() {
        showBanner("Shared successfully");
    }).catch(function(error) {
        showBanner("Sharing cancelled or failed", false);
    });
}
//#endregion

//#region TYPE UI
function createLinkTyeUi(parentElem, decodedText, type) {
    var link = document.createElement("a");
    link.href = decodedText;
    if (type == TYPE_PHONE) {
        decodedText = decodedText.toLowerCase().replace("tel:", "");
    }
    link.innerText = decodedText;
    parentElem.appendChild(link);
}

function addKeyValuePairUi(parentElem, key, value) {
    var elem = document.createElement("div");
    var keySpan = document.createElement("span");
    keySpan.style.fontWeight = "bold";
    keySpan.style.marginRight = "10px";
    keySpan.innerText = key;
    elem.appendChild(keySpan);

    var valueSpan = document.createElement("span");
    valueSpan.innerText = value;
    elem.appendChild(valueSpan);

    parentElem.appendChild(elem);
}

function createWifiTyeUi(parentElem, decodedText) {
    var expression = /WIFI:S:(.*);T:(.*);P:(.*);H:(.*);;/g;
    var regexExp = new RegExp(expression);
    var result = regexExp.exec(decodedText);
    addKeyValuePairUi(parentElem, "SSID", result[1]);
    addKeyValuePairUi(parentElem, "Type", result[2]);
    addKeyValuePairUi(parentElem, "Password", result[3]);
}

function createUpiTypeUi(parentElem, decodedText) {
    // var expression = /upi:\/\/pay\?cu=(.*)&pa=(.*)&pn=(.*)/g;
    // var regexExp = new RegExp(expression);
    // var result = regexExp.exec(decodedText);
    var upiUri = new URL(decodedText);
    var searchParams = upiUri.searchParams;
    var cu = searchParams.get("cu");
    if (cu && cu != null) {
        addKeyValuePairUi(parentElem, "Currency", cu);
    }
    addKeyValuePairUi(
        parentElem, "Payee address", searchParams.get("pa"));

    var pn = searchParams.get("pn");
    if (pn && pn != null) {
        addKeyValuePairUi(parentElem, "Payee Name", pn);
    }
}
//#endregion

//#region type detection
function isUrl(decodedText) {
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

function isPhoneNumber(decodedText) {
    var expression = /tel:[+]*[0-9]{3,}/g;
    var regexExp = new RegExp(expression);
    return decodedText.match(regexExp);
}

function isWifi(decodedText) {
    var expression = /WIFI:S:(.*);T:(.*);P:(.*);H:(.*);;/g;
    var regexExp = new RegExp(expression);
    return decodedText.match(regexExp);  
}

function isUpi(decodedText) {
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

function detectType(decodedText) {
    if (isUrl(decodedText)) {
        return TYPE_URL;
    }

    if (isPhoneNumber(decodedText)) {
        return TYPE_PHONE;
    }

    if (isWifi(decodedText)) {
        return TYPE_WIFI;
    }

    if (isUpi(decodedText)) {
        return TYPE_UPI;
    }

    return TYPE_TEXT;
}
//#endregion

//#region Actions
function copyToClipboard(decodedText) {
    navigator.clipboard.writeText(decodedText)
        .then(function() {
            showBanner("Text copied");
        }).catch(function(error) {
            showBanner("Failed to copy", false);
        });
}
//#endregion

//#region history
// TODO(mohsinaav): Replace with ScanResult.
let HistoryItem = function(
    decodedText, decodedResult, scanType, codeType, dateTime) {
    this._decodedText = decodedText;
    this._decodedResult = decodedResult;
    this._scanType = scanType;
    this._codeType = codeType;
    this._dateTime = dateTime;
} 
HistoryItem.prototype.decodedText = function() {
    return this._decodedText;
}
HistoryItem.prototype.decodedResult = function() {
    return this._decodedResult;
}
HistoryItem.prototype.scanType = function() {
    return this._scanType;
}
HistoryItem.prototype.codeType = function() {
    return this._codeType;
}
HistoryItem.prototype.dateTime = function() {
    return this._dateTime;
}

let HistoryManager = function() {
    // Load history from disk
    this._historyList = [];

    this.flushToDisk = function() {
        // Save the serialized this._historyList to disk.
        console.log("todo: saving history to disk")
    }
}
HistoryManager.prototype.add = function(historyItem) {
    this._historyList.push(historyItem);
    this.flushToDisk();
    this.render();
}
HistoryManager.prototype.render = function(rootElement) {
    rootElement.innerHtml = "";
    // render reverse.
    for (var i = this._historyList.length - 1; i >= 0; i--) {
        var historyItem = this._historyList[i];
        historyItem.render(rootElement);
    }
}
//#endregion

//#region UI rendering
let ScanResult = function(
    decodedText, decodedResult, scanType, codeType, dateTime) {
    this._decodedText = decodedText;
    this._decodedResult = decodedResult;
    this._scanType = scanType;
    this._codeType = codeType;
    this._dateTime = dateTime;
} 
ScanResult.prototype.decodedText = function() {
    return this._decodedText;
}
ScanResult.prototype.decodedResult = function() {
    return this._decodedResult;
}
ScanResult.prototype.scanType = function() {
    return this._scanType;
}
ScanResult.prototype.codeType = function() {
    return this._codeType;
}
ScanResult.prototype.dateTime = function() {
    return this._dateTime;
}

// Factory methods to create {@link ScanResult}.
function createScanResult(decodedText, decodedResult, scanType) {
    let codeType = decodedResult.result.format.formatName;
    let dateTime = new Date();
    return new ScanResult(
        decodedText,
        decodedResult,
        scanType,
        codeType,
        dateTime);
}
//#endregion

/** UI for the scan app results */

/** Class for rendering result of QR scanning. */
let QrResultViewer = function() {
    let __this = this;

    let container = document.getElementById("new-scanned-result");
    let header = document.getElementById("qr-result-viewer-header");
    let scanResultCodeType = document.getElementById("scan-result-code-type");
    let scanResultImage = document.getElementById("scan-result-image");
    let scanResultText = document.getElementById("scan-result-text");
    let scanResultBadgeBody = document.getElementById("scan-result-badge-body");
    let scanResultParsed = document.getElementById("scan-result-parsed");

    let actionShareImage = document.getElementById("action-share");
    let actionCopyImage = document.getElementById("action-copy");
    let actionPaymentImage = document.getElementById("action-payment");
    let scanResultClose = document.getElementById("scan-result-close");
    let noResultContainer = document.getElementById("no-result-container");
    let scanResultFooter = document.getElementById("body-footer");

    // TODO(mebjas): fix -- scanResultImage --
    scanResultImage.style.display = "none";

    let lastRenderedResult = {
        text: null,
        type: null,
    };

    /** ---- listeners ---- */
    scanResultClose.addEventListener("click", function() {
        hideBanners();
        container.style.display = "none";
        if (__this.onCloseCallback) {
            Logger.logScanRestart();
            if (__this.onCloseCallback) {
                __this.onCloseCallback();
            }
        }

        noResultContainer.classList.remove("hidden");
    });

    var shareOrCopySupported = false;
    if (navigator.clipboard) {
        actionCopyImage.addEventListener("click", function() {
            hideBanners();
            copyToClipboard(scanResultText.innerText);
            Logger.logActionCopy();
        });
        shareOrCopySupported = true;
    } else {
        actionCopyImage.style.display = "none";
    }

    actionPaymentImage.addEventListener("click", function(event) {
        hideBanners();
        var upiLink = decodeURIComponent(lastRenderedResult.text);
        location.href = upiLink;
        showBanner("Payment action only works if UPI payment apps are installed.");
        Logger.logPaymentAction();
    });

    if (navigator.share) {
        actionShareImage.addEventListener("click", function() {
            hideBanners();
            shareResult(lastRenderedResult.text, lastRenderedResult.type);
            Logger.logActionShare();
        });
        shareOrCopySupported = true;
    } else {
        actionShareImage.style.display = "none";
    }

    function createParsedResult(decodedText, type) {
        let parentElem = document.createElement("div");
        // Action image changes
        if (type == TYPE_UPI) {
            actionPaymentImage.style.display = "inline-block";
        } else {
            actionPaymentImage.style.display = "none";
        }

        if (type == TYPE_URL || type == TYPE_PHONE) {
            createLinkTyeUi(parentElem, decodedText, type);
            return parentElem;
        }

        if (type == TYPE_WIFI) {
            createWifiTyeUi(parentElem, decodedText);
            return parentElem;
        }

        if (type == TYPE_UPI) {
            createUpiTypeUi(parentElem, decodedText);
            return parentElem;
        }

        parentElem.innerText = decodedText;
        return parentElem;
    }

    this.__render = function (viewerTitle, scanResult, onCloseCallback) {
        __this.onCloseCallback = onCloseCallback;
        header.innerText = viewerTitle;
        noResultContainer.classList.add("hidden");

        scanResultCodeType.innerText = scanResult.codeType();
        scanResultText.innerText = scanResult.decodedText();
        let codeType = detectType(scanResult.decodedText());

        Logger.logScanSuccess(scanResult.scanType(), codeType);
        lastRenderedResult.text = scanResult.decodedText();
        lastRenderedResult.type = codeType;

        scanResultBadgeBody.innerText = codeType;
        if (scanResultParsed.replaceChildren) {
            scanResultParsed.replaceChildren();
        } else {
            scanResultParsed.innerHTML = "";
        }
        scanResultParsed.appendChild(createParsedResult(
            scanResult.decodedText(), codeType));

        // Show / hide views.
        scanResultFooter.style.display = (onCloseCallback)
            ? "block" : "none";
        container.style.display = "block";
    }
}

/**
 * Renders data to the view.
 * 
 * @param {String} viewerTitle - title of the container.
 * @param {ScanResult} scanResult - result of scanning.
 * @param {Function} onCloseCallback - callback to be called when "close and scan
 *    another" button is clicked.
 */
QrResultViewer.prototype.render = function(
    viewerTitle, scanResult, onCloseCallback) {
    this.__render(viewerTitle, scanResult, onCloseCallback);
}

/** other global functions */
function isEmbeddedInIframe() {
    return (window !== window.parent);
}

function showAntiEmbedWindow() {
    document.getElementById("iframe-alert").style.display = "block";
    Logger.logAntiEmbedWindowShown();

    var naviateToScanAppButton = document.getElementById("iframe-alert-actions-navigate");
    var continueHereButton = document.getElementById("iframe-alert-actions-continue");

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
            document.getElementById("iframe-alert").style.display = "none";
        });
    }
    continueHereButton.addEventListener("click", continueHere);
}

function docReady(fn) {
    // see if DOM is already available
    if (document.readyState === "complete" || document.readyState === "interactive") {
        // call on next available tick
        setTimeout(fn, 1);
    } else {
        document.addEventListener("DOMContentLoaded", fn);
    }
}

docReady(function() {
    var isInIframe = isEmbeddedInIframe();
    if (isInIframe) {
        showAntiEmbedWindow();
    }

    // Global viewer object, to be used for showing scan result as well as
    // history.
    let qrResultViewer = new QrResultViewer();

    location.href = "#reader";
    var qrboxFunction = function(viewfinderWidth, viewfinderHeight) {
        // Square QR Box, with size = 80% of the min edge.
        var minEdgeSizeThreshold = 250;
        var edgeSizePercentage = 0.8;

        var minEdgeSize = (viewfinderWidth > viewfinderHeight) ?
            viewfinderHeight : viewfinderWidth;
        var qrboxEdgeSize = Math.floor(minEdgeSize * edgeSizePercentage);
        if (qrboxEdgeSize < minEdgeSizeThreshold) {
            if (minEdgeSize < minEdgeSizeThreshold) {
                return {width: minEdgeSize, height: minEdgeSize};
            } else {
                return {
                    width: minEdgeSizeThreshold,
                    height: minEdgeSizeThreshold
                };
            }
        }
        return {width: qrboxEdgeSize, height: qrboxEdgeSize};
    }

	let html5QrcodeScanner = new Html5QrcodeScanner(
        "reader", 
        { 
            fps: 10,
            qrbox: qrboxFunction,
            // Important notice: this is experimental feature, use it at your
            // own risk. See documentation in
            // mebjas@/html5-qrcode/src/experimental-features.ts
            experimentalFeatures: {
                useBarCodeDetectorIfSupported: true
            },
            rememberLastUsedCamera: true,
            aspectRatio: 1.7777778,
            showTorchButtonIfSupported: true
        });

    let onScanResultCloseButtonClickCallback = function() {
        if (html5QrcodeScanner.getState() 
            === Html5QrcodeScannerState.PAUSED) {
            html5QrcodeScanner.resume();
        }
    }

    function onScanSuccess(decodedText, decodedResult) {
        console.log(decodedText, decodedResult);
        if (html5QrcodeScanner.getState() 
            !== Html5QrcodeScannerState.NOT_STARTED) {
            html5QrcodeScanner.pause(/* shouldPauseVideo= */ true);
        }

        let scanType = "camera";
        if (html5QrcodeScanner.getState() 
            === Html5QrcodeScannerState.NOT_STARTED) {
            scanType = "file";
        }
        let scanResult = createScanResult(decodedText, decodedResult, scanType);
        qrResultViewer.render(
            QR_RESULT_HEADER_FROM_SCAN,
            scanResult,
            onScanResultCloseButtonClickCallback);
        // TODO(mohsinav): Save scanResult to history manager.
    }
	html5QrcodeScanner.render(onScanSuccess);
    Logger.logScanStart(isInIframe);
});