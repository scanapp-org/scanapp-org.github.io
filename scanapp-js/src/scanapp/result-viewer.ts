/**
 * @fileoverview
 * Result viewer in ScanApp app.
 * 
 * @author mebjas <minhazav@gmail.com>
 */

import { copyToClipboard } from "./actions";
import {
    CodeCategory,
    codeCategoryToString,
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
    type: CodeCategory;
};

type OnCloseCallback = () => void;

/** Class for rendering result of QR scanning. */
export class QrResultViewer {
    private readonly placeHolderContainer = document.getElementById("result-panel-placeholder")!;

    private readonly parentContainer = document.getElementById("result-panel-container")!;
    private readonly scanResultCodeType = document.getElementById("scan-result-code-type");
    private readonly scanResultImage = document.getElementById("scan-result-image");
    private readonly scanResultText = document.getElementById("scan-result-text");
    private readonly scanResultBadgeBody = document.getElementById("scan-result-badge-body");
    private readonly scanResultParsed: HTMLDivElement = document.getElementById("scan-result-parsed")! as HTMLDivElement;

    private readonly actionShareImage = document.getElementById("action-share");
    private readonly actionCopyImage = document.getElementById("action-copy");
    private readonly actionPaymentImage = document.getElementById("action-payment");
    private readonly actionUrlImage = document.getElementById("action-url");
    private readonly scanResultClose = document.getElementById("scan-result-close");
    // private readonly noResultContainer = document.getElementById("no-result-container");
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

            $this.placeHolderContainer.style.display = "block";
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
        let navigatorCopy: any = navigator;
        // For some reason typescript think share is always supported.
        if (navigatorCopy.share) {
            this.actionShareImage!.addEventListener("click", function() {
                hideBanners();
                if ($this.lastRenderedResult) {
                    shareResult($this.lastRenderedResult.text, $this.lastRenderedResult.type);
                    Logger.logActionShare();
                } else {
                    // TODO(minhazav): Take action when last result doesn't have value.
                    console.error("Share action without lastRenderedResult.");
                }
                $this.shareOrCopySupported = true;
            });
        } else {
            this.actionShareImage!.style.display = "none";
            $this.shareOrCopySupported = false;
        }
    }

    private showResultContainer() {
        this.placeHolderContainer.style.display = "none";
        this.parentContainer.style.display = "block";
        // this.container!.style.borderTop = "1px solid black";
        // this.parentContainer!.style.border = "1px solid silver";
    }

    private hideResultContainer() {
        this.parentContainer.style.display = "none";
        // this.parentContainer!.style.border = "1px solid #ffffff00";    
    }

    private createParsedResult(decodedText: string, codeType: CodeCategory): HTMLElement {
        let parentElem = document.createElement("div");
        // Action image changes
        this.actionPaymentImage!.style.display = (codeType === CodeCategory.TYPE_UPI) ?
            "inline-block" : "none";
        this.actionUrlImage!.style.display = (codeType === CodeCategory.TYPE_URL) ?
            "inline-block" : "none";

        if (codeType === CodeCategory.TYPE_URL || codeType === CodeCategory.TYPE_PHONE) {
            createLinkTyeUi(parentElem, decodedText, codeType);
            return parentElem;
        }

        if (codeType === CodeCategory.TYPE_WIFI) {
            createWifiTyeUi(parentElem, decodedText);
            return parentElem;
        }

        if (codeType === CodeCategory.TYPE_UPI) {
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
        scanResult: ScanResult, onCloseCallback: OnCloseCallback) {
        console.log("render() called.");
        this.onCloseCallback = onCloseCallback;

        let codeFormatName = scanResult.codeFormatName;
        this.scanResultCodeType!.innerText = codeFormatName;
        this.scanResultText!.innerText = scanResult.decodedText;
        let codeCategory = detectType(scanResult.decodedText);
        let codeCategoryName = codeCategoryToString(codeCategory);
        let scanTypeName = scanTypeToString(scanResult.scanType);
        Logger.logScanSuccess(scanTypeName, codeCategoryName);
        
        this.lastRenderedResult = {
            text: scanResult.decodedText,
            type: codeCategory
        };

        this.scanResultBadgeBody!.innerText = codeCategoryName;
        this.scanResultParsed.innerHTML = "";
        this.scanResultParsed.appendChild(
            this.createParsedResult(scanResult.decodedText, codeCategory));

        // Show / hide views.
        this.scanResultFooter!.style.display = (onCloseCallback) ? "block" : "none";
        this.showResultContainer();
    }
}
