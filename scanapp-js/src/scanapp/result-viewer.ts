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
import { HidableUiComponent } from "./core";
import { Logger } from "./logger";
import { 
    dockMobileNavBar,
    floatMobileNavBar,
    hideAllMobilePopupBanners,
    hideBanners,
    resetActiveFromAllMobileIcons,
    showBanner,
    shareResult,
    detectType
} from "./misc";
import { ScanResult } from "./scan-result";
import {
    createLinkTyeUi,
    createWifiTyeUi,
    createUpiTypeUi,
    createJsonObject
} from "./ui";
import { QuickActionHandler } from "./quick-action-handler";

interface LastRenderedResult {
    text: string;
    type: CodeCategory;
};

type OnCloseCallback = () => void;

/** Class for rendering result of QR scanning. */
export class QrResultViewer implements HidableUiComponent {
    private readonly placeHolderContainer = document.getElementById("result-panel-placeholder")!;

    private readonly parentContainer = document.getElementById("result-panel-container")!;
    private readonly scanResultCodeType = document.getElementById("scan-result-code-type");
    private readonly scanResultImage = document.getElementById("scan-result-image");
    private readonly scanResultTextRow = document.getElementById("scan-result-text-row")! as HTMLTableRowElement;
    private readonly scanResultText = document.getElementById("scan-result-text");
    private readonly scanResultBadgeBody = document.getElementById("scan-result-badge-body");
    private readonly scanResultParsed: HTMLDivElement = document.getElementById("scan-result-parsed")! as HTMLDivElement;

    private readonly actionShareImage = document.getElementById("action-share")!;
    private readonly actionCopyImage = document.getElementById("action-copy")!;
    private readonly actionPaymentImage = document.getElementById("action-payment")!;
    private readonly actionUrlImage = document.getElementById("action-url")!;
    private readonly actionDownload = document.getElementById("action-download")!;
    private readonly scanResultClose = document.getElementById("scan-result-close");
    private readonly scanResultFooter = document.getElementById("body-footer");
    private readonly mobileNavBarQrIcon = document.getElementById("navbar-menu-icon-qr")! as HTMLDivElement;

    private readonly quickActionHandler = QuickActionHandler.create();

    private readonly isFormFactorMobile: boolean = false;

    private lastRenderedResult?: LastRenderedResult;
    private onCloseCallback?: OnCloseCallback;

    public constructor(isFormFactorMobile: boolean) {
        this.isFormFactorMobile = isFormFactorMobile;

        this.renderInternal();
        this.addListeners();
    }

    private renderInternal() {
        this.scanResultImage!.style.display = "none";
    }

    private hideResultViewerDesktop() {
        this.hideResultViewerCommon();
        this.hideResultContainer();
        this.placeHolderContainer.style.display = "block";
    }

    private hideResultViewerMobile() {
        this.hideResultViewerCommon();
        this.hideResultContainer();
        // Don't show the placeholder for mobile version.
    }

    private hideResultViewerCommon() {
        hideBanners();
        if (this.onCloseCallback) {
            Logger.logScanRestart();
            this.onCloseCallback();
        }
    }

    private addListeners() {
        // Close button.
        this.scanResultClose!.addEventListener("click", () => {
            this.hide();            
        });

        // Clipboard.
        if (navigator.clipboard) {
            this.actionCopyImage.addEventListener("click", () => {
                hideBanners();
                copyToClipboard(this.scanResultText!.innerText);
                Logger.logActionCopy();
            });
        } else {
            this.actionCopyImage!.style.display = "none";
        }

        // Payment button.
        this.actionPaymentImage.addEventListener("click", (_) => {
            hideBanners();
            if (this.lastRenderedResult) {
                var upiLink = decodeURIComponent(this.lastRenderedResult.text);
                location.href = upiLink;
                showBanner("Payment action only works if UPI payment apps are installed.");
                Logger.logPaymentAction();
            } else {
                // TODO(minhazav): Take action when last result doesn't have value.
                console.error("payment action without lastRenderedResult.");
            }
        });

        // Url action
        this.actionUrlImage.addEventListener("click", () => {
            Logger.logUrlAction(() => {
                if (this.lastRenderedResult) {
                    let link = document.createElement("a");
                    link.setAttribute("href", this.lastRenderedResult.text);
                    link.setAttribute("target", "blank_");
                    link.click();
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
            this.actionShareImage.addEventListener("click", () => {
                hideBanners();
                if (this.lastRenderedResult) {
                    shareResult(this.lastRenderedResult.text, this.lastRenderedResult.type);
                    Logger.logActionShare();
                } else {
                    // TODO(minhazav): Take action when last result doesn't have value.
                    console.error("Share action without lastRenderedResult.");
                }
            });
        } else {
            this.actionShareImage.style.display = "none";
        }

        // Download button.
        this.actionDownload.addEventListener("click", () => {
            if (!this.lastRenderedResult) {
                return;
            }

            Logger.logActionDownload();
            const mimeType = "text/plain";
            const fileName = "scanapp_download.txt";
            const link = document.createElement("a");
            const blob = new Blob([this.lastRenderedResult.text], {type: mimeType});
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", fileName);
            link.click();
        });
        
    }

    private showResultContainer() {
        this.placeHolderContainer.style.display = "none";
        
        if (this.isFormFactorMobile) {
            hideAllMobilePopupBanners();
            dockMobileNavBar();
            this.parentContainer.classList.add("expanded");

            resetActiveFromAllMobileIcons();
            this.mobileNavBarQrIcon.classList.remove("inactive");
            this.mobileNavBarQrIcon.classList.add("active");
        } else {
            this.parentContainer.style.display = "block";
        }
    }

    private hideResultContainer() {
        if (this.isFormFactorMobile) {
            hideAllMobilePopupBanners();

            floatMobileNavBar();
            this.mobileNavBarQrIcon.classList.remove("active");
            this.mobileNavBarQrIcon.classList.add("inactive");
        } else {
            this.parentContainer.style.display = "none";
        }
    }

    public hide(): void {
        if (this.isFormFactorMobile) {
            this.hideResultViewerMobile();
        } else {
            this.hideResultViewerDesktop();
        }
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

        if (codeType == CodeCategory.TYPE_JSON_OBJ) {
            createJsonObject(parentElem, decodedText);
            return parentElem;
        }

        parentElem.innerText = decodedText;
        return parentElem;
    }

    private shouldShowTextResult(codeCategory: CodeCategory) {
        if (codeCategory == CodeCategory.TYPE_TEXT
            || codeCategory == CodeCategory.TYPE_URL) {
            return false;
        } 
        return true;
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
        this.onCloseCallback = onCloseCallback;

        let codeFormatName = scanResult.codeFormatName;
        this.scanResultCodeType!.innerText = codeFormatName;
        this.scanResultText!.innerText = scanResult.decodedText;
        let codeCategory = detectType(scanResult.decodedText);
        if (this.shouldShowTextResult(codeCategory)) {
            this.scanResultTextRow.style.removeProperty("display");
        } else {
            this.scanResultTextRow.style.display = "none";
        }

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

        if (codeCategory == CodeCategory.TYPE_URL) {
            this.quickActionHandler.display(scanResult.decodedText);
        } else {
            this.quickActionHandler.hide();
        }

        // Show / hide views.
        this.scanResultFooter!.style.display = (onCloseCallback) ? "block" : "none";
        this.showResultContainer();
    }
}
