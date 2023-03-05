/**
 * @fileoverview
 * Main ScanApp app.
 * 
 * @author mebjas <minhazav@gmail.com>
 */

import { ScanType } from "./constants";
import { HidableUiComponent } from "./core";
import {
    hideBanners,
    isEmbeddedInIframe,
    showAntiEmbedWindow
} from "./misc";
import { MobileAboutBottomSheet } from "./about-bottom-sheet";
import { loadAllDesktopImages } from "./desktop-image-loader";
import { MobileHistoryBottomSheet } from "./history-bottom-sheet";
import { MobileSponsorBottomSheet } from "./sponsor-bottom-sheet";
import { MobileScrimController } from "./mobile-scrim";
import { QrResultViewer } from "./result-viewer"
import { PwaPromptManager } from "./pwa";
import { MinimisablePanels } from "./minimisable-panels";
import { Html5QrcodeScanner } from "../html5-qrcode/html5-qrcode-scanner";
import { Html5QrcodeScannerState } from "../html5-qrcode/state-manager";
import { Html5QrcodeResult } from "../html5-qrcode/core";
import { ScanResult } from "./scan-result";
import { Logger } from "./logger";

export class ScanApp {
    // Global viewer object, to be used for showing scan result as well as
    // history.
    private readonly qrResultViewer: QrResultViewer;
    private readonly pwaPromptManagerGlobal = new PwaPromptManager();
    private readonly listOfHidableUiComponents: Array<HidableUiComponent> = [];
    private readonly scrimController: MobileScrimController;
    
    private isFormFactorMobile: boolean;
    private isInIframe: boolean;
    private html5QrcodeScanner: Html5QrcodeScanner;
    private pwaTimeout?: number;

    public static createAndRender() {
        let isFormFactorMobile = screen.availWidth < 600;
        let scanApp = new ScanApp(isFormFactorMobile);
        scanApp.render();
    }

    private constructor(isFormFactorMobile: boolean) {
        this.isFormFactorMobile = isFormFactorMobile;
        this.qrResultViewer = new QrResultViewer(isFormFactorMobile);
        this.listOfHidableUiComponents.push(this.qrResultViewer);
        this.scrimController = MobileScrimController.setup(() => {
            this.onScrimClick();
        });

        this.isInIframe = isEmbeddedInIframe();
        if (this.isInIframe) {
            showAntiEmbedWindow();
        }

        this.html5QrcodeScanner = new Html5QrcodeScanner(
            "reader", 
            { 
                fps: 10,
                qrbox: this.qrboxFunction,
                useBarCodeDetectorIfSupported: true,
                rememberLastUsedCamera: true,
                aspectRatio: this.getAspectRatio(),
                showTorchButtonIfSupported: true,
                showZoomSliderIfSupported: true,
                defaultZoomValueIfSupported: 1.5,
                // supportedScanTypes: [
                    // Html5QrcodeScanType.SCAN_TYPE_CAMERA,
                    // Html5QrcodeScanType.SCAN_TYPE_FILE,
                // ]
            },
            /* verbose= */ false);
    }

    private getAspectRatio() {
        const FOR_MOBILE_ASPECT_RATIO = 4/3;
        // const FOR_MOBILE_ASPECT_RATIO = 16/9;
        const FOR_DESKTOP_ASPECT_RATIO = 4/3;

        return this.isFormFactorMobile ? FOR_MOBILE_ASPECT_RATIO : FOR_DESKTOP_ASPECT_RATIO;
    }

    private render() {
        // Render the rest of UI first.
        this.setupMinimizeButtons();
        this.setupBannerListeners();

        // TODO(minhazav): Make this optional from API.
        let qrCodeErrorCallback = undefined;
        this.html5QrcodeScanner.render((decodedText: string, decodedResult: Html5QrcodeResult) => {
            this.onScanSuccess(decodedText, decodedResult);
        },
        qrCodeErrorCallback,
        this.isFormFactorMobile);
        Logger.logScanStart(this.isInIframe, "camera");

        if (this.isFormFactorMobile) {
            // About section
            const onOpenListener = () => {
                this.html5QrcodeScanner.pause(/* shouldPauseVideo= */ true);
            };
            const onCloseListener = () => {
                this.html5QrcodeScanner.resume();
            }
    
            this.listOfHidableUiComponents.push(
                MobileAboutBottomSheet.setup(this.scrimController, onOpenListener, onCloseListener));
            this.listOfHidableUiComponents.push(
                MobileSponsorBottomSheet.setup(this.scrimController, onOpenListener, onCloseListener));
        }
    }

    private onScrimClick() {
        for (const uiElement of this.listOfHidableUiComponents) {
            uiElement.hide();
        }
    }

    private onScanSuccess(decodedText: string, decodedResult: Html5QrcodeResult) {
        if (this.pwaTimeout) {
            clearTimeout(this.pwaTimeout);
            this.pwaTimeout = undefined;
        }

        if (this.html5QrcodeScanner.getState() !== Html5QrcodeScannerState.NOT_STARTED) {
            this.html5QrcodeScanner.pause(/* shouldPauseVideo= */ true);
        }

        this.scrimController.show();

        let scanType = ScanType.SCAN_TYPE_CAMERA;
        if (this.html5QrcodeScanner.getState() === Html5QrcodeScannerState.NOT_STARTED) {
            scanType = ScanType.SCAN_TYPE_FILE;
        }
        let scanResult = ScanResult.create(decodedText, decodedResult, scanType);
        this.qrResultViewer.render(
            scanResult,
            () => this.onScanResultCloseButtonClickCallback());
        // TODO(mohsinav): Save scanResult to history manager.
    }

    private onScanResultCloseButtonClickCallback() {
        this.scrimController.hide();

        if (this.html5QrcodeScanner.getState() === Html5QrcodeScannerState.PAUSED) {
            this.html5QrcodeScanner.resume();
        }

        this.pwaTimeout = this.pwaPromptManagerGlobal.optionallyShowPrompt();
    }

    // Code snippet to navigate the user to #reader directly. Makes sense when
    // aspect ratio is 16/9
    // location.href = "#reader";
    private qrboxFunction(viewfinderWidth: number, viewfinderHeight: number) {
        // Square QR Box, with size = 80% of the min edge.
        var minEdgeSizeThreshold = 250;
        var edgeSizePercentage = 0.75;

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

    private setupMinimizeButtons() {
        // Result container.
        var resultContainerMinimizeActionDiv = document.getElementById("result-panel-minimize-action")! as HTMLDivElement;
        var resultContaineBody = document.getElementById("result-panel-body-id")! as HTMLDivElement;

        console.assert(resultContainerMinimizeActionDiv != null);
        console.assert(resultContaineBody != null);
        
        var resultContainerMinimizablePanel = new MinimisablePanels(
            resultContainerMinimizeActionDiv, resultContaineBody);
        resultContainerMinimizablePanel.setup();

        // History container
        var historyContainerMinimizeActionDiv = document.getElementById("history-panel-minimize-action")! as HTMLDivElement;
        var historyContaineBody = document.getElementById("history-panel-body-id")! as HTMLDivElement;

        console.assert(historyContainerMinimizeActionDiv != null);
        console.assert(historyContaineBody != null);
        
        var historyContainerMinimizablePanel = new MinimisablePanels(
            historyContainerMinimizeActionDiv, historyContaineBody);
        historyContainerMinimizablePanel.setup();
    }

    private setupBannerListeners() {
        document.querySelectorAll(".banner-close").forEach(closeButton => {
            closeButton.addEventListener("click", () => {
                hideBanners();
            });
        });
    }

}
