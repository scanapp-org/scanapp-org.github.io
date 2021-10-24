let TYPE_TEXT = "TEXT";
let TYPE_URL = "URL";
let TYPE_PHONE = "PHONE NUMBER";

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

//#region type detection
function isUrl(decodedText) {
   let expression1 = /^((javascript:[\w-_]+(\([\w-_\s,.]*\))?)|(mailto:([\w\u00C0-\u1FFF\u2C00-\uD7FF-_]+\.)*[\w\u00C0-\u1FFF\u2C00-\uD7FF-_]+@([\w\u00C0-\u1FFF\u2C00-\uD7FF-_]+\.)*[\w\u00C0-\u1FFF\u2C00-\uD7FF-_]+)|(\w+:\/\/(([\w\u00C0-\u1FFF\u2C00-\uD7FF-]+\.)*([\w\u00C0-\u1FFF\u2C00-\uD7FF-]*\.?))(:\d+)?(((\/[^\s#$%^&*?]+)+|\/)(\?[\w\u00C0-\u1FFF\u2C00-\uD7FF:;&%_,.~+=-]+)?)?(#[\w\u00C0-\u1FFF\u2C00-\uD7FF-_]+)?))$/g;
   let regexExp1 = new RegExp(expression1);
   if (decodedText.match(regexExp1)) {
       return true;
   }

   let expression2 = /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g;
   let regexExp2 = new RegExp(expression2);

   if (decodedText.match(regexExp2)) {
       return true;
   }
   return false;
}

function isPhoneNumber(decodedText) {
    let expression = /tel:[+]*[0-9]{3,}/g;
    let regexExp = new RegExp(expression);
    return decodedText.match(regexExp);
}

function detectType(decodedText) {
    if (isUrl(decodedText)) {
        return TYPE_URL;
    }

    if (isPhoneNumber(decodedText)) {
        return TYPE_PHONE;
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

/** UI for the scan app results */
let QrResult = function(onCloseCallback) {
    let container = document.getElementById("new-scanned-result");
    let scanResultCodeType = document.getElementById("scan-result-code-type");
    let scanResultImage = document.getElementById("scan-result-image");
    let scanResultText = document.getElementById("scan-result-text");
    let scanResultBadgeBody = document.getElementById("scan-result-badge-body");
    let scanResultParsed = document.getElementById("scan-result-parsed");

    let actionShareImage = document.getElementById("action-share");
    let actionCopyImage = document.getElementById("action-copy");
    let scanResultClose = document.getElementById("scan-result-close");
    let noResultContainer = document.getElementById("no-result-container");

    // TODO(mebjas): fix -- scanResultImage --
    scanResultImage.style.display = "none";

    let lastScan = {
        text: null,
        type: null,
    };

    /** ---- listeners ---- */
    scanResultClose.addEventListener("click", function() {
        hideBanners();
        container.style.display = "none";
        if (onCloseCallback) {
            ga('send', 'event', 'ScanRestart', '', scanResultClose);
            onCloseCallback();
        }

        noResultContainer.classList.remove("hidden");
    });

    actionCopyImage.addEventListener("click", function() {
        copyToClipboard(scanResultText.innerText);
    });

    if (navigator.share) {
        actionShareImage.addEventListener("click", function() {
            shareResult(lastScan.text, lastScan.type);
        });
    } else {
        actionShareImage.style.display = "none";
    }


    function toFriendlyCodeType(codeType) {
        return codeType;
    }

    function createParsedResult(decodedText, type) {
        let elem = document.createElement("div");
        if (type == TYPE_URL || type == TYPE_PHONE) {
            let link = document.createElement("a");
            link.href = decodedText;
            if (type == TYPE_PHONE) {
                decodedText = decodedText.toLowerCase().replace("tel:", "");
            }
            link.innerText = decodedText;
            elem.appendChild(link);
            return elem;
        }

        elem.innerText = decodedText;
        return elem;
    }

    this.__onScanSuccess = function(decodedText, decodedResult) {
        noResultContainer.classList.add("hidden");

        scanResultCodeType.innerText
            = toFriendlyCodeType(decodedResult.result.format.formatName);
        scanResultText.innerText = decodedText;
        let codeType = detectType(decodedText);

        lastScan.text = decodedText;
        lastScan.type = codeType;

        scanResultBadgeBody.innerText = codeType;
        scanResultParsed.replaceChildren();
        scanResultParsed.appendChild(createParsedResult(decodedText, codeType));
        container.style.display = "block";
    }
}

QrResult.prototype.onScanSuccess = function(decodedText, decodedResult) {
    this.__onScanSuccess(decodedText, decodedResult);
}

/** other global functions */
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
    location.href = "#reader";
	let html5QrcodeScanner = new Html5QrcodeScanner(
        "reader", 
        { 
            fps: 10,
            qrbox: {width: 250, height: 250},
            // Important notice: this is experimental feature, use it at your
            // own risk. See documentation in
            // mebjas@/html5-qrcode/src/experimental-features.ts
            experimentalFeatures: {
                useBarCodeDetectorIfSupported: true
            },
            rememberLastUsedCamera: true,
            aspectRatio: 1.7777778
        });

    let qrResultHandler = new QrResult(function() {
        if (html5QrcodeScanner.getState() 
            === Html5QrcodeScannerState.PAUSED) {
            html5QrcodeScanner.resume();
        }
    });

    function onScanSuccess(decodedText, decodedResult) {
        if (html5QrcodeScanner.getState() 
            !== Html5QrcodeScannerState.NOT_STARTED) {
            html5QrcodeScanner.pause();
        }

        let scanType = "camera";
        if (html5QrcodeScanner.getState() 
            === Html5QrcodeScannerState.NOT_STARTED) {
            scanType = "file";
        }
        qrResultHandler.onScanSuccess(decodedText, decodedResult);
        ga('send', 'event', 'ScanSuccess', scanType);
    }
	html5QrcodeScanner.render(onScanSuccess);

    ga('send', 'event', 'ScanStart', '');
});