/**
 * @fileoverview
 * Main ScanApp app.
 * 
 * @author mebjas <minhazav@gmail.com>
 */

import {
    QR_RESULT_HEADER_FROM_SCAN,
    ScanType
} from "./constants";
import {
    isEmbeddedInIframe,
    showAntiEmbedWindow
} from "./misc";
import { QrResultViewer } from "./result-viewer"
import { PwaPromptManager } from "./pwa";
import { Html5QrcodeScanner } from "../html5-qrcode/html5-qrcode-scanner";
import { Html5QrcodeScannerState } from "../html5-qrcode/state-manager";
import { Html5QrcodeResult } from "../html5-qrcode/core";
import { ScanResult } from "./scan-result";
import { Logger } from "./logger";

export class ScanApp {
    // Global viewer object, to be used for showing scan result as well as
    // history.
    private readonly qrResultViewer = new QrResultViewer();
    private readonly pwaPromptManagerGlobal = new PwaPromptManager();
    
    private isInIframe: boolean;
    private html5QrcodeScanner: Html5QrcodeScanner;
    private pwaTimeout?: number;

    public static createAndRender() {
        let scanApp = new ScanApp();
        scanApp.render();
    }

    private constructor() {
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
                aspectRatio: 4/3,
                showTorchButtonIfSupported: true,
                showZoomSliderIfSupported: true,
                defaultZoomValueIfSupported: 1.5,
                // supportedScanTypes: [
                //     Html5QrcodeScanType.SCAN_TYPE_CAMERA,
                //     Html5QrcodeScanType.SCAN_TYPE_FILE,
                // ]
            },
            /* verbose= */ false);
    }

    private render() {
        // TODO(minhazav): Make this optional from API.
        let qrCodeErrorCallback = undefined;
        this.html5QrcodeScanner.render(this.onScanSuccess, qrCodeErrorCallback);
        Logger.logScanStart(this.isInIframe, "camera");
    }

    private onScanSuccess(decodedText: string, decodedResult: Html5QrcodeResult) {
        if (this.pwaTimeout) {
            clearTimeout(this.pwaTimeout);
            this.pwaTimeout = undefined;
        }

        console.log(decodedText, decodedResult);
        if (this.html5QrcodeScanner.getState() !== Html5QrcodeScannerState.NOT_STARTED) {
            this.html5QrcodeScanner.pause(/* shouldPauseVideo= */ true);
        }

        let scanType = ScanType.SCAN_TYPE_CAMERA;
        if (this.html5QrcodeScanner.getState() === Html5QrcodeScannerState.NOT_STARTED) {
            scanType = ScanType.SCAN_TYPE_FILE;
        }
        let scanResult = ScanResult.create(decodedText, decodedResult, scanType);
        this.qrResultViewer.render(
            QR_RESULT_HEADER_FROM_SCAN,
            scanResult,
            this.onScanResultCloseButtonClickCallback);
        // TODO(mohsinav): Save scanResult to history manager.
    }

    private onScanResultCloseButtonClickCallback() {
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

}
