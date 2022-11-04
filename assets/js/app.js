let TYPE_TEXT = "TEXT";
let TYPE_URL = "URL";
let TYPE_PHONE = "PHONE NUMBER";
let TYPE_WIFI = "WIFI";
let TYPE_UPI = "UPI";

let QR_RESULT_HEADER_FROM_SCAN = "Scanned result";
let QR_RESULT_HEADER_FROM_HISTORY = "Scan result from History";

let QR_HISTORY_CLOSE_BUTTON_SRC = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAQgAAAEIBarqQRAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAE1SURBVDiNfdI7S0NBEAXgLya1otFgpbYSbISAgpXYi6CmiH9KCAiChaVga6OiWPgfRDQ+0itaGVNosXtluWwcuMzePfM4M3sq8lbHBubwg1dc4m1E/J/N4ghDPOIsfk/4xiEao5KX0McFljN4C9d4QTPXuY99jP3DsIoDPGM6BY5i5yI5R7O4q+ImFkJY2DCh3cAH2klyB+9J1xUMMAG7eCh1a+Mr+k48b5diXrFVwwLuS+BJ9MfR7+G0FHOHhTHhnXNWS87VDF4pcnfQK4Ep7XScNLmPTZgURNKKYENYWDpzW1BhscS1WHS8CDgURFJQrWcoF3c13KKbgg1BYQfy8xZWEzTTw1QZbAoKu8FqJnktdu5hcVSHmchiILzzuaDQvjBzV2m8yohCE1jHfPx/xhU+y4G/D75ELlRJsSYAAAAASUVORK5CYII="

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
let HistoryManager = function() {
    // Load history from disk    
    this._historyList = this.retrieve();
    let historyFooter = document.getElementById("history-footer");
    let historyListContainer = document.getElementById("history-list");
    let noHistoryContainer = document.getElementById("no-history-container");
    let clearHistory = document.getElementById("clear-history");

    // this.flushToDisk();
    this.flushToDisk = function(){
        localStorage.setItem("historyList", JSON.stringify(this._historyList));
    }

    this.checkIfHistoryExists();

    clearHistory.addEventListener("click", function() {
        historyFooter.classList.add("hidden");
        localStorage.removeItem("historyList");
        historyListContainer.innerHTML = "";
        noHistoryContainer.classList.remove("hidden");     
        window.location.reload();   
    });
}

HistoryManager.prototype.retrieve = function() {
    let historyArrayFromStorage = localStorage.getItem("historyList") ? JSON.parse(localStorage.getItem("historyList")) : [];
    let historyList = [];
    for (var i = 0; i < historyArrayFromStorage.length; i++) {
        var item = historyArrayFromStorage[i];
        var historyItem = new ScanResult(
            item._decodedText, item._decodedResult, item._scanType, item._codeType, item._dateTime, item._uid);
        historyList.push(historyItem);
    }
    return historyList;
}

HistoryManager.prototype.add = function(historyItem, rootElement) {
    this.checkDuplicate(historyItem);
    this.flushToDisk();
    this.render(rootElement);
}

HistoryManager.prototype.checkDuplicate = function(historyItem) {
    // function added to avoid adding duplicate items to history.
    for (var i = 0; i < this._historyList.length; i++) {
        if (this._historyList[i].decodedText() === historyItem.decodedText() &&
        this._historyList[i].uid === historyItem.uid) {
            return;
        }
    }
    // add the new history item to the list.
    this._historyList.push(historyItem);
}

HistoryManager.prototype.render = function(rootElement) {
    rootElement.innerHtml = "";
    if (rootElement.childElementCount > 0) {
        rootElement.replaceChildren();  
    }
    // render reverse.
    for (var i = this._historyList.length - 1; i >= 0; i--) {
        var historyItem = createScanResult(
            this._historyList[i].decodedText(),
            this._historyList[i].decodedResult(),
            this._historyList[i].scanType(),
            this._historyList[i].uid()) ;
        this.renderEachItem(historyItem, rootElement);
    }

    let historyParent = document.getElementsByClassName("history-item-parent");    
    for(var i = 0; i < historyParent.length; i++) {
        let historyLink = historyParent[i].children[0];
        let scanResult = this.getScanResult(historyLink.innerHTML, historyLink.id.split('-')[3]);
        historyLink.addEventListener("click", function() {
            let qrResultViewer = new QrResultViewer();
            qrResultViewer.render(QR_RESULT_HEADER_FROM_HISTORY, scanResult, false);
        });

        let historyDeleteImage = historyParent[i].children[1];
        historyDeleteImage.addEventListener("click", function() {
            deleteSingleHistoryItem(scanResult.decodedText(), scanResult.uid());   
        });
    } 
}

// to get the scan result from the html element
HistoryManager.prototype.getScanResult = function(decodedText, uid) {
    for (var i = 0; i < this._historyList.length; i++) {
        if (this._historyList[i].decodedText() === decodedText || 
        this._historyList[i].uid() === uid) {
            let scanResult = createScanResult(
                this._historyList[i].decodedText(),
                this._historyList[i].decodedResult(),
                this._historyList[i].scanType(),
                this._historyList[i].uid());
            return scanResult;
        }
    }
    return null;
}

HistoryManager.prototype.renderEachItem = function(historyItem, rootElement) {
    var div = document.createElement("div");
    div.style.padding = "10px";
    div.style.border = "1px solid silver";
    div.className = "history-item-parent";

    var a = document.createElement('a');
    a.innerHTML = historyItem.decodedText();
    a.style.textDecoration = "none";
    a.href = "#";
    a.className = "history-item";
    a.id = "history-item-id-" + historyItem.uid();

    var del_img = document.createElement('img');
    del_img.id = "del-img-" + historyItem.uid();
    del_img.className = "history-item-delete-button";
    del_img.src = QR_HISTORY_CLOSE_BUTTON_SRC;

    div.appendChild(a);
    div.appendChild(del_img);
    rootElement.appendChild(div);
}

HistoryManager.prototype.checkIfHistoryExists = function () {
    let ifHistoryExists = localStorage.getItem("historyList") ? true : false;
    let noHistoryContainer = document.getElementById("no-history-container");
    let historySectionContainer = document.getElementById("history-section");
    let historyListContainer = document.getElementById("history-list");
    let historyFooter = document.getElementById("history-footer");

    if (ifHistoryExists) {
        noHistoryContainer.classList.add("hidden");
        historySectionContainer.style.display = "block";
        this.render(historyListContainer);
        historyFooter.classList.remove("hidden");
    }
    else {
        noHistoryContainer.classList.remove("hidden");
        // noHistoryContainer.style.display = "block";
        historySectionContainer.style.display = "none";
        historyFooter.classList.add("hidden");
    }
}

function deleteSingleHistoryItem(decodedText, uid) {
    let historyArrayFromStorage = JSON.parse(localStorage.getItem("historyList"));
    for (var i = 0; i < historyArrayFromStorage.length; i++) {
        if (historyArrayFromStorage[i]._decodedText === decodedText || 
        historyArrayFromStorage[i]._uid === uid) {
            historyArrayFromStorage.splice(i, 1);
            localStorage.setItem("historyList", JSON.stringify(historyArrayFromStorage));
            // Confirm if this is fine.
            window.location.reload();
        }
    }
    //if localStorage is empty
}
//#endregion

//#region UI rendering
let ScanResult = function(
    decodedText, decodedResult, scanType, codeType, dateTime, uid) {
    this._decodedText = decodedText;
    this._decodedResult = decodedResult;
    this._scanType = scanType;
    this._codeType = codeType ? codeType : decodedResult.result.format.formatName;
    this._dateTime = dateTime ? dateTime : new Date();
    this._uid = uid ? uid : Math.random().toString(16).slice(2);
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
ScanResult.prototype.uid = function() {
    return this._uid;
}

// Factory methods to create {@link ScanResult}.
function createScanResult(decodedText, decodedResult, scanType, uid) {
    let codeType = decodedResult.result.format.formatName;
    let dateTime = new Date();
    return new ScanResult(
        decodedText,
        decodedResult,
        scanType,
        codeType,
        dateTime,
        uid);
}
//#endregion

/** UI for the scan app results */
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
    let scanResultFooter = document.getElementById("body-footer");
    let noResultContainer = document.getElementById("no-result-container");

    let noHistoryContainer = document.getElementById("no-history-container");
    let historyContainer = document.getElementById("history-section");
    let historyFooter = document.getElementById("history-footer");

    // TODO(mebjas): fix -- scanResultImage --
    scanResultImage.style.display = "none";

    let lastRenderedResult = {
        text: null,
        type: null,
    };

    /** ---- listeners ---- */
    // Todo: edit this part
    scanResultClose.addEventListener("click", function() {
        hideBanners();
        container.style.display = "none";
        if (__this.onCloseCallback) {
            Logger.logScanRestart();
            if(__this.onCloseCallback) {
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


    this.__render = function(viewerTitle, scanResult, onCloseCallback) {
        __this.onCloseCallback = onCloseCallback;
        header.innerText = viewerTitle;

        noResultContainer.classList.add("hidden");
        noHistoryContainer.classList.add("hidden");
        historyFooter.classList.remove("hidden");

        if (viewerTitle == QR_RESULT_HEADER_FROM_SCAN){
            scanResultCodeType.innerText = "New " + scanResult.codeType() + " detected!";
        }
        else if (viewerTitle == QR_RESULT_HEADER_FROM_HISTORY){
            scanResultCodeType.innerText = "Retrieved " + scanResult.codeType() + " !";
        }

        // scanResultCodeType.innerText = scanResult.codeType();
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
        scanResultParsed.appendChild(createParsedResult(scanResult.decodedText(), codeType));
        container.style.display = "block";
        historyContainer.style.display = "block";
        scanResultFooter.style.display = (onCloseCallback) ? "block" : "none";
    }
}

/** 
 * Renders the scan result.
 * 
 * @param {String} viewerTitle - title of the container.
 * @param {scanResult} scanResult - result of scanning object.
 * @param {Function} onCloseCallback - callback to be called when "close and scan another" button is closed.
 */
QrResultViewer.prototype.render = function(viewerTitle, scanResult, onCloseCallback) {
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

    // Global viwer object, to be used for showing scan results as well as history.
    var qrResultViewer = new QrResultViewer();
    var historyManager = new HistoryManager();
    let historyListContainer = document.getElementById("history-list");

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
            aspectRatio: 1.7777778
        });
    
    let onScanResultCloseButtonClickCallback = function(){
        if(html5QrcodeScanner.getState() == Html5QrcodeScannerState.PAUSED){
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

        let scanResult = new ScanResult(decodedText, decodedResult, scanType);
        qrResultViewer.render(
            QR_RESULT_HEADER_FROM_SCAN,
            scanResult,
            onScanResultCloseButtonClickCallback
        );
        // Todo: save scanResult to HistoryManager
        historyManager.add(scanResult, historyListContainer);
    }

    html5QrcodeScanner.render(onScanSuccess);
    Logger.logScanStart(isInIframe);
});