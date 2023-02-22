/**
 * @fileoverview
 * Result viewer in ScanApp app.
 * 
 * @author mebjas <minhazav@gmail.com>
 */

import { copyToClipboard } from "./actions";
import {
    CodeType,
    codeTypeToString,
    scanTypeToString
} from "./constants";
import { Logger } from "./logger";
import { 
    hideBanners,
    showBanner,
    shareResult,
    detectType
} from "./misc";
import { ScanResult } from "./scan-result";
import {
    createLinkTyeUi,
    createWifiTyeUi,
    createUpiTypeUi
} from "./ui";

interface LastRenderedResult {
    text: string;
    type: CodeType;
};

type OnCloseCallback = () => void;

/** Class for rendering result of QR scanning. */
export class QrResultViewer {
    private readonly parentContainer = document.getElementById("result");
    private readonly container = document.getElementById("new-scanned-result");
    private readonly header = document.getElementById("qr-result-viewer-header");
    private readonly scanResultCodeType = document.getElementById("scan-result-code-type");
    private readonly scanResultImage = document.getElementById("scan-result-image");
    private readonly scanResultText = document.getElementById("scan-result-text");
    private readonly scanResultBadgeBody = document.getElementById("scan-result-badge-body");
    private readonly scanResultParsed: HTMLDivElement = document.getElementById("scan-result-parsed") as HTMLDivElement;

    private readonly actionShareImage = document.getElementById("action-share");
    private readonly actionCopyImage = document.getElementById("action-copy");
    private readonly actionPaymentImage = document.getElementById("action-payment");
    private readonly actionUrlImage = document.getElementById("action-url");
    private readonly scanResultClose = document.getElementById("scan-result-close");
    private readonly noResultContainer = document.getElementById("no-result-container");
    private readonly scanResultFooter = document.getElementById("body-footer");

    private shareOrCopySupported: boolean = false;
    private lastRenderedResult?: LastRenderedResult;
    private onCloseCallback?: OnCloseCallback;

    public constructor() {
        this.renderInternal();
        this.addListeners();
    }

    private renderInternal() {
        this.scanResultImage!.style.display = "none";
    }

    private addListeners() {
        let $this = this;

        // Close button.
        this.scanResultClose!.addEventListener("click", function() {
            hideBanners();
            $this.hideResultContainer();
            if ($this.onCloseCallback) {
                Logger.logScanRestart();
                $this.onCloseCallback();
            }
    
            $this.noResultContainer!.classList.remove("hidden");
        });

        // Clipboard.
        if (navigator.clipboard) {
            this.actionCopyImage!.addEventListener("click", function() {
                hideBanners();
                copyToClipboard($this.scanResultText!.innerText);
                Logger.logActionCopy();
            });
            $this.shareOrCopySupported = true;
        } else {
            this.actionCopyImage!.style.display = "none";
        }

        // Payment button.
        this.actionPaymentImage!.addEventListener("click", (_) => {
            hideBanners();
            if ($this.lastRenderedResult) {
                var upiLink = decodeURIComponent($this.lastRenderedResult.text);
                location.href = upiLink;
                showBanner("Payment action only works if UPI payment apps are installed.");
                Logger.logPaymentAction();
            } else {
                // TODO(minhazav): Take action when last result doesn't have value.
                console.error("payment action without lastRenderedResult.");
            }
        });

        // Url action
        this.actionUrlImage!.addEventListener("click", function() {
            Logger.logUrlAction(function() {
                if ($this.lastRenderedResult) {
                    location.href = $this.lastRenderedResult.text;
                } else {
                    // TODO(minhazav): Take action when last result doesn't have value.
                    console.error("URL action without lastRenderedResult.");
                }
            });
        });

        // Share button.
        // if (navigator.share) {
        this.actionShareImage!.addEventListener("click", function() {
            hideBanners();
            if ($this.lastRenderedResult) {
                shareResult($this.lastRenderedResult.text, $this.lastRenderedResult.type);
                Logger.logActionShare();
            } else {
                // TODO(minhazav): Take action when last result doesn't have value.
                console.error("Share action without lastRenderedResult.");
            }
        });
        this.shareOrCopySupported = true;
        // } else {
        //     this.actionShareImage!.style.display = "none";
        // }
    }

    private showResultContainer() {
        this.header!.style.display = "block";
        this.container!.style.display = "flex";
        this.container!.style.borderTop = "1px solid black";
        this.parentContainer!.style.border = "1px solid silver";
    }

    private hideResultContainer() {
        this.header!.style.display = "none";
        this.container!.style.display = "none";
        this.parentContainer!.style.border = "1px solid #ffffff00";    
    }

    private createParsedResult(decodedText: string, codeType: CodeType): HTMLElement {
        let parentElem = document.createElement("div");
        // Action image changes
        this.actionPaymentImage!.style.display = (codeType === CodeType.TYPE_UPI) ?
            "inline-block" : "none";
        this.actionUrlImage!.style.display = (codeType === CodeType.TYPE_URL) ?
            "inline-block" : "none";

        if (codeType === CodeType.TYPE_URL || codeType === CodeType.TYPE_PHONE) {
            createLinkTyeUi(parentElem, decodedText, codeType);
            return parentElem;
        }

        if (codeType === CodeType.TYPE_WIFI) {
            createWifiTyeUi(parentElem, decodedText);
            return parentElem;
        }

        if (codeType === CodeType.TYPE_UPI) {
            createUpiTypeUi(parentElem, decodedText);
            return parentElem;
        }

        parentElem.innerText = decodedText;
        return parentElem;
    }

    /**
     * Renders data to the view.
     * 
     * @param {String} viewerTitle - title of the container.
     * @param {ScanResult} scanResult - result of scanning.
     * @param {Function} onCloseCallback - callback to be called when "close and scan
     *    another" button is clicked.
     */
    public render(
        viewerTitle: string, scanResult: ScanResult, onCloseCallback: OnCloseCallback) {
        this.onCloseCallback = onCloseCallback;
        this.header!.innerText = viewerTitle;
        this.noResultContainer!.classList.add("hidden");

        let codeTypeName = codeTypeToString(scanResult.codeType);
        this.scanResultCodeType!.innerText = codeTypeName;
        this.scanResultText!.innerText = scanResult.decodedText;
        let codeType = detectType(scanResult.decodedText);
        codeTypeName = codeTypeToString(codeType);
        Logger.logScanSuccess(codeTypeName, codeTypeName);
        
        this.lastRenderedResult = {
            text: scanResult.decodedText,
            type: codeType
        };

        this.scanResultBadgeBody!.innerText = codeTypeName;
        // if (this.scanResultParsed!.replaceChildren) {
        // let container: ParentNode = this.scanResultParsed;
        // container.replaceChildren();
        // } else {
        this.scanResultParsed!.innerHTML = "";
        // }
        this.scanResultParsed!.appendChild(
            this.createParsedResult(scanResult.decodedText, codeType));

        // Show / hide views.
        this.scanResultFooter!.style.display = (onCloseCallback)
            ? "block" : "none";
        this.showResultContainer();
    }
}
