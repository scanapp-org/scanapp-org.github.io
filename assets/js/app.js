/** UI for the scan app results */
let QrResult = function() {
    let container = document.getElementById("new-scanned-result");
    let scanResultCodeType = document.getElementById("scan-result-code-type");
    let scanResultImage = document.getElementById("scan-result-image");
    let scanResultText = document.getElementById("scan-result-text");
    let scanResultBadgeBody = document.getElementById("scan-result-badge-body");
    let scanResultParsed = document.getElementById("scan-result-parsed");

    let actionShareImage = document.getElementById("action-share");
    let actionCopyImage = document.getElementById("action-copy");
    let scanResultClose = document.getElementById("scan-result-close");

    /** ---- listeners ---- */
    scanResultClose.addEventListener("click", function() {
        container.style.display = "none";
    });

    function toFriendlyCodeType(codeType) {
        return codeType;
    }

    function determineType(decodedText) {
        return "URL";
    }

    this.__onScanSuccess = function(decodedText, decodedResult) {
        console.log(decodedText, decodedResult);
        scanResultCodeType.innerText
            = toFriendlyCodeType(decodedResult.result.format.formatName);
        scanResultText.innerText = decodedText;
        scanResultBadgeBody.innerText = determineType(decodedText);
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
    let qrResultHandler = new QrResult();

	function onScanSuccess(decodedText, decodedResult) {
        qrResultHandler.onScanSuccess(decodedText, decodedResult);
	}

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
	html5QrcodeScanner.render(onScanSuccess);
});