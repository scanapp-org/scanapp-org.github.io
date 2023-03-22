/**
 * @fileoverview
 * Complete Scanner build on top of {@link Html5Qrcode}.
 * - Decode QR Code using web cam or smartphone camera
 * 
 * @author mebjas <minhazav@gmail.com>
 * 
 * The word "QR Code" is registered trademark of DENSO WAVE INCORPORATED
 * http://www.denso-wave.com/qrcode/faqpatent-e.html
 */
import {
    Html5QrcodeConstants,
    Html5QrcodeScanType,
    QrcodeSuccessCallback,
    QrcodeErrorCallback,
    Html5QrcodeResult,
    Html5QrcodeError,
    Html5QrcodeErrorFactory,
    BaseLoggger,
    Logger,
    isNullOrUndefined,
    checkNotNullOrUndefined
} from "./core";
import { CameraCapabilities, Html5QrcodeCameraRenderingConstraints } from "./camera/core";
import {
    Html5Qrcode,
    Html5QrcodeConfigs,
    Html5QrcodeCameraScanConfig,
    Html5QrcodeFullConfig,
} from "./html5-qrcode";
import { Html5QrcodeHandler } from "./html5-qrcode-handler";
import { Html5QrcodeScannerStrings } from "./strings";
import { PersistedDataManager } from "./storage";
import { Html5QrcodeScannerState } from "./state-manager";
import { ScanTypeSelector } from "./ui/scanner/scan-type-selector";
import {
    Html5QrcodeScannerStatus,
    QrcodeScannerHeadderUi
} from "./ui/scanner/header";
import { QrScanRegion } from "./ui/scanner/qr-scan-region";
import { QrScanDashboard } from "./ui/scanner/qr-scan-dashboard";
import { OnFileSelected } from "./file-scan/file-scan-core";
import { FileDropListenerUi } from "./file-scan/file-drop-listener";

//#region Internal interfaces
/**
 * Interface for controlling different aspects of {@class Html5QrcodeScanner}.
 */
interface Html5QrcodeScannerConfig
    extends Html5QrcodeCameraScanConfig, Html5QrcodeConfigs {

    /**
     * If {@code true} the library will remember if the camera permissions
     * were previously granted and what camera was last used. If the permissions
     * is already granted for "camera", QR code scanning will automatically
     * start for previously used camera.
     * 
     * Note: default value is {@code true}.
     */
    rememberLastUsedCamera?: boolean | undefined;

    /**
     * Sets the desired scan types to be supported in the scanner.
     * 
     *  - Not setting a value will follow the default order supported by
     *      library.
     *  - First value would be used as the default value. Example:
     *    - [SCAN_TYPE_CAMERA, SCAN_TYPE_FILE]: Camera will be default type,
     *      user can switch to file based scan.
     *    - [SCAN_TYPE_FILE, SCAN_TYPE_CAMERA]: File based scan will be default
     *      type, user can switch to camera based scan.
     *  - Setting only value will disable option to switch to other. Example:
     *    - [SCAN_TYPE_CAMERA] - Only camera based scan supported.
     *    - [SCAN_TYPE_FILE] - Only file based scan supported.
     *  - Setting wrong values or multiple values will fail.
     */
    supportedScanTypes?: Array<Html5QrcodeScanType> | [];

    /**
     * If {@code true} the rendered UI will have button to turn flash on or off
     * based on device + browser support.
     * 
     * Note: default value is {@code false}.
     */
    showTorchButtonIfSupported?: boolean | undefined;

    /**
     * If {@code true} the rendered UI will have slider to zoom camera based on
     * device + browser support.
     * 
     * Note: default value is {@code false}.
     * 
     * TODO(minhazav): Document this API, currently hidden.
     */
    showZoomSliderIfSupported?: boolean | undefined;

    /**
     * Default zoom value if supported.
     * 
     * Note: default value is 1x.
     * 
     * TODO(minhazav): Document this API, currently hidden.
     */
    defaultZoomValueIfSupported?: number | undefined;
}

function toHtml5QrcodeCameraScanConfig(config: Html5QrcodeScannerConfig)
    : Html5QrcodeCameraScanConfig {
    return {
        fps: config.fps,
        qrbox: config.qrbox,
        aspectRatio: config.aspectRatio,
        disableFlip: config.disableFlip,
        videoConstraints: config.videoConstraints,
        renderingConstraints: Html5QrcodeCameraRenderingConstraints.CONSTRAINT_BY_WIDTH_AND_HEIGHT
    };
}

function toHtml5QrcodeFullConfig(
    config: Html5QrcodeConfigs, verbose: boolean | undefined)
    : Html5QrcodeFullConfig {
    return {
        formatsToSupport: config.formatsToSupport,
        useBarCodeDetectorIfSupported: config.useBarCodeDetectorIfSupported,
        experimentalFeatures: config.experimentalFeatures,
        verbose: verbose
    };
}
//#endregion

// End to end scanner library.
export class Html5QrcodeScannerBeta implements Html5QrcodeHandler {

    //#region private fields
    private elementId: string;
    private config: Html5QrcodeScannerConfig;
    private verbose: boolean;
    private currentScanType: Html5QrcodeScanType;
    private persistedDataManager: PersistedDataManager;
    private scanTypeSelector: ScanTypeSelector;
    private logger: Logger;

    // Initally null fields.
    private html5Qrcode: Html5Qrcode | undefined;
    private qrCodeSuccessCallback: QrcodeSuccessCallback | undefined;
    private qrCodeErrorCallback: QrcodeErrorCallback | undefined;
    private lastMatchFound: string | null = null;

    private headerUi: QrcodeScannerHeadderUi | null = null;
    private qrScanRegion: QrScanRegion | null = null;
    private qrScanDashboard: QrScanDashboard | null = null;
    //#endregion

    /**
     * Creates instance of this class.
     *
     * @param elementId Id of the HTML element.
     * @param config Extra configurations to tune the code scanner.
     * @param verbose - If true, all logs would be printed to console. 
     */
    public constructor(
        elementId: string,
        config: Html5QrcodeScannerConfig | undefined,
        verbose: boolean | undefined) {
        this.elementId = elementId;
        this.config = this.createConfig(config);
        this.verbose = verbose === true;

        if (!document.getElementById(elementId)) {
            throw `HTML Element with id=${elementId} not found`;
        }

        this.scanTypeSelector = new ScanTypeSelector(
            this.config.supportedScanTypes);
        this.currentScanType = this.scanTypeSelector.getDefaultScanType();

        this.logger = new BaseLoggger(this.verbose);

        this.persistedDataManager = new PersistedDataManager();
        if (config!.rememberLastUsedCamera !== true) {
            this.persistedDataManager.reset();
        }
    }

    /**
     * Renders the User Interface.
     * 
     * @param qrCodeSuccessCallback Callback called when an instance of a QR
     * code or any other supported bar code is found.
     * @param qrCodeErrorCallback optional, callback called in cases where no
     * instance of QR code or any other supported bar code is found.
     */
    public render(
        qrCodeSuccessCallback: QrcodeSuccessCallback,
        qrCodeErrorCallback: QrcodeErrorCallback | undefined) {
        this.lastMatchFound = null;

        // Add wrapper to success callback.
        this.qrCodeSuccessCallback
            = (decodedText: string, result: Html5QrcodeResult) => {
            if (qrCodeSuccessCallback) {
                qrCodeSuccessCallback(decodedText, result);
            } else {
                if (this.lastMatchFound === decodedText) {
                    return;
                }

                this.lastMatchFound = decodedText;
                this.setHeaderMessage(
                    Html5QrcodeScannerStrings.lastMatch(decodedText),
                    Html5QrcodeScannerStatus.STATUS_SUCCESS);
            }
        };

        // Add wrapper to failure callback
        this.qrCodeErrorCallback =
            (errorMessage: string, error: Html5QrcodeError) => {
            if (qrCodeErrorCallback) {
                qrCodeErrorCallback(errorMessage, error);
            }
        };

        const parentElement = document.getElementById(this.elementId);
        if (!parentElement) {
            throw `HTML Element with id=${this.elementId} not found`;
        }
        parentElement.innerHTML = "";
        this.createBasicLayout(parentElement!);
        this.html5Qrcode = new Html5Qrcode(
            checkNotNullOrUndefined(this.qrScanRegion, "qrScanRegion").elementId(),
            toHtml5QrcodeFullConfig(this.config, this.verbose));
    }

    //#region State related public APIs
    /**
     * Pauses the ongoing scan.
     * 
     * Notes:
     * -   Should only be called if camera scan is ongoing.
     * 
     * @param shouldPauseVideo (Optional, default = false) If {@code true}
     * the video will be paused.
     * 
     * @throws error if method is called when scanner is not in scanning state.
     */
    public pause(shouldPauseVideo?: boolean) {
        if (isNullOrUndefined(shouldPauseVideo) || shouldPauseVideo !== true) {
            shouldPauseVideo = false;
        }

        this.getHtml5QrcodeOrFail().pause(shouldPauseVideo);
    }
    
    /**
     * Resumes the paused scan.
     * 
     * If the video was previously paused by setting {@code shouldPauseVideo}
     * to {@code true} in {@link Html5QrcodeScanner#pause(shouldPauseVideo)},
     * calling this method will resume the video.
     * 
     * Notes:
     * -   Should only be called if camera scan is ongoing.
     * -   With this caller will start getting results in success and error
     * callbacks.
     * 
     * @throws error if method is called when scanner is not in paused state.
     */
    public resume() {
        this.getHtml5QrcodeOrFail().resume();
    }

    /**
     * Gets state of the camera scan.
     *
     * @returns state of type {@enum Html5QrcodeScannerState}.
     */
    public getState(): Html5QrcodeScannerState {
       return this.getHtml5QrcodeOrFail().getState();
    }

    /**
     * Removes the QR Code scanner UI.
     * 
     * @returns Promise which succeeds if the cleanup is complete successfully,
     *  fails otherwise.
     */
    public clear(): Promise<void> {
        const emptyHtmlContainer = () => {
            const mainContainer = document.getElementById(this.elementId);
            if (mainContainer) {
                mainContainer.innerHTML = "";
                this.resetBasicLayout(mainContainer);
            }
        }

        if (this.html5Qrcode) {
            return new Promise((resolve, reject) => {
                if (!this.html5Qrcode) {
                    resolve();
                    return;
                }
                if (this.html5Qrcode.isScanning) {
                    this.html5Qrcode.stop().then((_) => {
                        if (!this.html5Qrcode) {
                            resolve();
                            return;
                        }

                        this.html5Qrcode.clear();
                        emptyHtmlContainer();
                        resolve();
                    }).catch((error) => {
                        if (this.verbose) {
                            this.logger.logError(
                                "Unable to stop qrcode scanner", error);
                        }
                        reject(error);
                    });
                } else {
                    // Assuming file based scan was ongoing.
                    this.html5Qrcode.clear();
                    emptyHtmlContainer();
                    resolve();
                }
            });
        }

        return Promise.resolve();
    }
    //#endregion

    //#region Beta APIs to modify running stream state.
    /**
     * Returns the capabilities of the running video track.
     * 
     * Read more: https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrack/getConstraints
     * 
     * Note: Should only be called if {@code Html5QrcodeScanner#getState()}
     *   returns {@code Html5QrcodeScannerState#SCANNING} or 
     *   {@code Html5QrcodeScannerState#PAUSED}.
     *
     * @returns the capabilities of a running video track.
     * @throws error if the scanning is not in running state.
     */
    public getRunningTrackCapabilities(): MediaTrackCapabilities {
        return this.getHtml5QrcodeOrFail().getRunningTrackCapabilities();
    }

    /**
     * Returns the object containing the current values of each constrainable
     * property of the running video track.
     * 
     * Read more: https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrack/getSettings
     * 
     * Note: Should only be called if {@code Html5QrcodeScanner#getState()}
     *   returns {@code Html5QrcodeScannerState#SCANNING} or 
     *   {@code Html5QrcodeScannerState#PAUSED}.
     *
     * @returns the supported settings of the running video track.
     * @throws error if the scanning is not in running state.
     */
    public getRunningTrackSettings(): MediaTrackSettings {
        return this.getHtml5QrcodeOrFail().getRunningTrackSettings();
    }

    /**
     * Apply a video constraints on running video track from camera.
     *
     * Note: Should only be called if {@code Html5QrcodeScanner#getState()}
     *   returns {@code Html5QrcodeScannerState#SCANNING} or 
     *   {@code Html5QrcodeScannerState#PAUSED}.
     *
     * @param {MediaTrackConstraints} specifies a variety of video or camera
     *  controls as defined in
     *  https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints
     * @returns a Promise which succeeds if the passed constraints are applied,
     *  fails otherwise.
     * @throws error if the scanning is not in running state.
     */
    public applyVideoConstraints(videoConstaints: MediaTrackConstraints)
        : Promise<void> {
        return this.getHtml5QrcodeOrFail().applyVideoConstraints(videoConstaints);
    }
    //#endregion

    //#region Html5QrcodeHandler implementation
    start(cameraId: string): Promise<void> {
        return checkNotNullOrUndefined(this.html5Qrcode, "html5Qrcode")
        .start(
            cameraId,
            toHtml5QrcodeCameraScanConfig(this.config),
            checkNotNullOrUndefined(this.qrCodeSuccessCallback, "qrCodeSuccessCallback"),
            checkNotNullOrUndefined(this.qrCodeErrorCallback, "qrCodeErrorCallback"))
            .then((_) => { /* No op */})
            .catch((error) => {
                this.setHeaderMessage(error, Html5QrcodeScannerStatus.STATUS_WARNING);
            });
    }

    stop(): Promise<void> {
        // cameraActionStopButton.disabled = true;
        return checkNotNullOrUndefined(this.html5Qrcode, "html5Qrcode")
            .stop()
            .catch((error) => {
                this.setHeaderMessage(
                    error, Html5QrcodeScannerStatus.STATUS_WARNING);
                throw error;
            });
    }

    switchTo(newCameraId: string): Promise<void> {
        return this.stop()
            .then((_) => this.start(newCameraId))
            .catch((error) => {
                this.setHeaderMessage(error, Html5QrcodeScannerStatus.STATUS_WARNING);
                throw error;
            });
    }

    getRunningTrackCameraCapabilities(): CameraCapabilities {
        return checkNotNullOrUndefined(this.html5Qrcode, "html5Qrcode")
            .getRunningTrackCameraCapabilities();
    }

    delegateErrorMessage(message: string): void {
        this.setHeaderMessage(message, Html5QrcodeScannerStatus.STATUS_WARNING);
    }
    //#endregion

    //#region Private methods
    private getHtml5QrcodeOrFail() {
        if (!this.html5Qrcode) {
            throw "Code scanner not initialized.";
        }
        return this.html5Qrcode!;
    }

    private createConfig(config: Html5QrcodeScannerConfig | undefined)
        : Html5QrcodeScannerConfig {
        if (config) {
            if (!config.fps) {
                config.fps = Html5QrcodeConstants.SCAN_DEFAULT_FPS;
            }

            if (config.rememberLastUsedCamera !== (
                !Html5QrcodeConstants.DEFAULT_REMEMBER_LAST_CAMERA_USED)) {
                config.rememberLastUsedCamera
                    = Html5QrcodeConstants.DEFAULT_REMEMBER_LAST_CAMERA_USED;
            }

            if (!config.supportedScanTypes) {
                config.supportedScanTypes
                    = Html5QrcodeConstants.DEFAULT_SUPPORTED_SCAN_TYPE;
            }

            return config;
        }

        return {
            fps: Html5QrcodeConstants.SCAN_DEFAULT_FPS,
            rememberLastUsedCamera:
                Html5QrcodeConstants.DEFAULT_REMEMBER_LAST_CAMERA_USED,
            supportedScanTypes:
                Html5QrcodeConstants.DEFAULT_SUPPORTED_SCAN_TYPE
        };
    }

    private createBasicLayout(parent: HTMLElement) {
        // Setup stype for parent element.
        parent.style.position = "relative";
        parent.style.padding = "0px";

        let mainContainer = document.createElement("div");
        mainContainer.style.width = "100%";
        mainContainer.style.height = "100%";
        mainContainer.style.overflow = "none";
        mainContainer.style.padding = "0px";
        mainContainer.style.margin = "0px";
        mainContainer.style.overflow = "none";
        parent.appendChild(mainContainer);

        this.headerUi = QrcodeScannerHeadderUi.createAndRender(mainContainer);
        this.qrScanRegion = QrScanRegion.createAndRender(this.elementId, mainContainer);
        // At this point, thinking of not support the scan type option very well.

        const onFileSelected: OnFileSelected = (file: File) => {
            if (!this.html5Qrcode) {
                throw "html5Qrcode not defined";
            }

            // @minhavav - ScanApp changes.
            // if (!ScanTypeSelector.isFileScanType($this.currentScanType)) {
            //     return;
            // }

            this.setHeaderMessage(Html5QrcodeScannerStrings.loadingImage());
            this.html5Qrcode.scanFileV2(file, /* showImage= */ true)
                .then((html5qrcodeResult: Html5QrcodeResult) => {
                    this.resetHeaderMessage();
                    this.qrCodeSuccessCallback!(
                        html5qrcodeResult.decodedText,
                        html5qrcodeResult);
                })
                .catch((error) => {
                    this.setHeaderMessage(
                        error, Html5QrcodeScannerStatus.STATUS_WARNING);
                    this.qrCodeErrorCallback!(
                        error, Html5QrcodeErrorFactory.createFrom(error));
                });
        };

        // TODO(minhazav): Can this be moved to Html5QrcodeHandler?
        const cameraQueryHandler = () => {
            this.queryCameraListAndRender();
        };

        this.qrScanDashboard = QrScanDashboard.createAndRender(
            mainContainer,
            this.currentScanType,
            this.scanTypeSelector,
            this.persistedDataManager,
            /* html5QrcodeHandler= */ this,
            this.config.defaultZoomValueIfSupported,
            onFileSelected,
            cameraQueryHandler,);

        // Render drag and drop label
        // TODO(minhazav): Add handling for the case when file is dragged into
        // the container, when the camera based scan is ongoing.
        FileDropListenerUi.createAndRender(
            mainContainer, (file: File) => {
                this.qrScanDashboard?.optionallySetImageName(file.name);
                onFileSelected(file);
            });
    }

    private queryCameraListAndRender() {
        Html5Qrcode.getCameras().then((cameras) => {
            // By this point the user has granted camera permissions.
            this.persistedDataManager.setHasPermission(/* hasPermission */ true);
            this.resetHeaderMessage();
            if (cameras && cameras.length > 0) {
                checkNotNullOrUndefined(this.qrScanDashboard, "qrScanDashboard")
                    .renderCamera(cameras);
            } else {
                this.setHeaderMessage(
                    Html5QrcodeScannerStrings.noCameraFound(),
                    Html5QrcodeScannerStatus.STATUS_WARNING);
                checkNotNullOrUndefined(this.qrScanDashboard, "qrScanDashboard")
                    .enablePermissionButton();
            }
        }).catch((error) => {
            this.persistedDataManager.setHasPermission(
                /* hasPermission */ false);
            checkNotNullOrUndefined(this.qrScanDashboard, "qrScanDashboard")
                .enableOrSetupPermissionButton();
            this.setHeaderMessage(
                error, Html5QrcodeScannerStatus.STATUS_WARNING);
            // $this.showHideScanTypeSwapLink(true);
        });
    }

    private resetBasicLayout(mainContainer: HTMLElement) {
        mainContainer.style.border = "none";
    }

    private resetHeaderMessage() {
        checkNotNullOrUndefined(this.headerUi, "headerUi").resetMessage();
    }

    private setHeaderMessage(
        messageText: string, scannerStatus?: Html5QrcodeScannerStatus) {
        checkNotNullOrUndefined(this.headerUi, "headerUi")
            .setHeaderMessage(messageText, scannerStatus);
    }
    //#endregion
}
