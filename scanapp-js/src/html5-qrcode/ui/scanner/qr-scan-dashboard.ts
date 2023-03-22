/**
 * @fileoverview
 * QR Scan Dashboard for {@link Html5QrcodeScanner}.
 * 
 * @author mebjas <minhazav@gmail.com>
 * 
 * The word "QR Code" is registered trademark of DENSO WAVE INCORPORATED
 * http://www.denso-wave.com/qrcode/faqpatent-e.html
 */

import {
    BaseUiElementFactory,
    PublicUiElementIdAndClasses
} from "./base";
import { CameraZoomUi } from "./camera-zoom-ui";
import { FileSelectionUi } from "./file-selection-ui";
import { ScanTypeSelector } from "./scan-type-selector";
import { CameraSelectionUi } from "./camera-selection-ui";
import { TorchButton } from "./torch-button";
import { CameraPermissions } from "../../camera/permissions";
import {
    checkNotNullOrUndefined,
    Html5QrcodeScanType,
    isValidString,
    clip
} from "../../core";
import { Html5QrcodeHandler } from "../../html5-qrcode-handler";
import { PersistedDataManager } from "../../storage";
import { OnFileSelected } from "../../file-scan/file-scan-core";
import { Html5QrcodeScannerStrings } from "../../strings";
import { CameraDevice } from "../../camera/core";
import {
    ASSET_FILE_SCAN,
    ASSET_CAMERA_SCAN,
} from "../../image-assets";

type Runnable = () => void;
type OnCameraSwitch = (newCameraId: string) => Promise<void>;
type OnCameraStop = () => Promise<void>;
type OnCameraStarted = (selectedCameraId: string) => Promise<void>;

/** Camera switcher UI element. */
class CameraSwitcher {
    private readonly switchButton: HTMLButtonElement;
    private readonly cameraList: Array<CameraDevice>;
    private readonly onCameraSwitch: OnCameraSwitch;
    
    private currentCameraIndex: number;

    private constructor(
        cameraList: Array<CameraDevice>,
        selectedCameraId: string,
        onCameraSwitch: OnCameraSwitch,
        rightMargin: number) {
        if (cameraList.length < 2) {
            throw "Minimum 2 camera's needed for camera switcher";
        }
        this.cameraList = cameraList;
        this.currentCameraIndex = CameraSwitcher.findSelectedCameraId(
            cameraList, selectedCameraId);
        this.switchButton = this.createSwitchButton(rightMargin);
        this.onCameraSwitch = onCameraSwitch;
    }

    private static findSelectedCameraId(
        cameraList: Array<CameraDevice>,
        selectedCameraId: string) {
        for (let i = 0; i < cameraList.length; ++i) {
            if (cameraList[i].id === selectedCameraId) {
                return i;
            }
        }
        throw `${selectedCameraId} not found in cameraList`;
    }

    private createSwitchButton(rightMargin: number): HTMLButtonElement {
        const button = BaseUiElementFactory.createElement<HTMLButtonElement>(
            "button", PublicUiElementIdAndClasses.CAMERA_SWITCH_BUTTON_ID);
        button.style.marginRight = `${rightMargin}px`;
        
        // TODO(minhazav): Change with image.
        const text =  Html5QrcodeScannerStrings.switchCamera();
        button.innerText = `${text} (${this.currentCameraIndex + 1}/${this.cameraList.length})`;
        
        button.addEventListener("click", () => {
            const newCameraIndex
                = (this.currentCameraIndex + 1) % this.cameraList.length;
            const newCameraId = this.cameraList[newCameraIndex].id;
            button.disabled = true;
            this.onCameraSwitch(newCameraId)
                .then(() => {
                    button.disabled = false
                });
            // No need to handle the failure cases in this case
            // as in case of failure, the whole parent UI would be
            // reset.
        });
        return button;
    }

    public static createAndRender(
        parentContainer: HTMLDivElement,
        cameraList: Array<CameraDevice>,
        selectedCameraId: string,
        onCameraSwitch: OnCameraSwitch,
        rightMargin?: number): CameraSwitcher {
        const cameraSwitcher = new CameraSwitcher(
            cameraList,
            selectedCameraId,
            onCameraSwitch,
            rightMargin ? rightMargin : 0);
        parentContainer.appendChild(cameraSwitcher.switchButton);
        return cameraSwitcher;
    }
}

/** Camera stop scanning element. */
class StopScanningButton {
    private readonly stopButton: HTMLButtonElement;
    private readonly onCameraStop: OnCameraStop;

    private constructor(
        onCameraStop: OnCameraStop,
        leftMargin: number) {
        this.stopButton = this.createStopButton(leftMargin);
        this.onCameraStop = onCameraStop;
    }

    private createStopButton(leftMargin: number): HTMLButtonElement {
        const button = BaseUiElementFactory.createElement<HTMLButtonElement>(
            "button", PublicUiElementIdAndClasses.CAMERA_STOP_BUTTON_ID);
        button.style.marginLeft = `${leftMargin}px`;
        button.innerText
            = Html5QrcodeScannerStrings.scanButtonStopScanningText();
        
        button.addEventListener("click", () => {
            button.disabled = true;
            // No need to handle success case, as in case of success this
            // button should get removed.
            this.onCameraStop().catch((_) => {
                button.disabled = false;
            });
        });
        return button;
    }

    public static createAndRender(
        parentContainer: HTMLDivElement,
        onCameraStop: OnCameraStop,
        leftMargin?: number): StopScanningButton {
        const stopScanningButton = new StopScanningButton(
            onCameraStop, leftMargin ? leftMargin : 0);
        parentContainer.appendChild(stopScanningButton.stopButton);
        return stopScanningButton;
    }
}

/** Camera start scanning element. */
class StartScanningUi {
    private readonly onCameraStarted: OnCameraStarted;

    private readonly cameraSelectionUi: CameraSelectionUi;
    private readonly startButton: HTMLButtonElement;

    constructor(
        parentElement: HTMLDivElement,
        cameraList: Array<CameraDevice>,
        selectedCameraId: string,
        onCameraStarted: OnCameraStarted) {
        this.onCameraStarted = onCameraStarted;

        this.cameraSelectionUi = CameraSelectionUi.create(
            parentElement, cameraList);
        this.cameraSelectionUi.setValue(selectedCameraId);

        this.startButton = this.createStartButton();
        parentElement.appendChild(this.startButton);
    }

    private createStartButton(): HTMLButtonElement {
        const button = BaseUiElementFactory.createElement<HTMLButtonElement>(
            "button", PublicUiElementIdAndClasses.CAMERA_START_BUTTON_ID);
        button.style.marginLeft = "5px";
        button.innerText
            = Html5QrcodeScannerStrings.scanButtonStartScanningText();
        
        button.addEventListener("click", () => {
            this.cameraSelectionUi.disable();
            button.disabled = true;
            const cameraId = this.cameraSelectionUi.getValue();
            // No need to handle success case, as in case of success this
            // button should get removed.
            this.onCameraStarted(cameraId).catch((_) => {
                button.disabled = false;
                this.cameraSelectionUi.enable();
            });
        });
        return button;
    }

    public static createAndRender(
        parentElement: HTMLDivElement,
        cameraList: Array<CameraDevice>,
        selectedCameraId: string,
        onCameraStarted: OnCameraStarted): StartScanningUi {
        const startScanningUi = new StartScanningUi(
            parentElement, cameraList, selectedCameraId, onCameraStarted);
        return startScanningUi;
    }
}

/** Full QR Scanning Dashboard. */
export class QrScanDashboard {
    private readonly scanTypeSelector: ScanTypeSelector;
    private readonly persistedDataManager: PersistedDataManager;
    private readonly html5QrcodeHandler: Html5QrcodeHandler;
    private readonly defaultZoomValueIfSupported: number | undefined;
    private readonly onFileSelectedCallback: OnFileSelected;
    private readonly cameraQueryHandler: Runnable;

    private readonly container: HTMLDivElement;
    private readonly childContainer: HTMLDivElement;

    private topDashboard: HTMLDivElement = this.createTopDashboard();
    private middleDashboard: HTMLDivElement = this.createMiddleDashboard();
    private bottomDashboard: HTMLDivElement = this.createBottomDashboard();

    private cameraScanImage: HTMLImageElement | null = null;
    private fileScanImage: HTMLImageElement | null = null;
    private requestPermissionButton: HTMLButtonElement | null = null;
    private fileScanUi: FileSelectionUi | null = null;

    constructor(
        scanTypeSelector: ScanTypeSelector,
        persistedDataManager: PersistedDataManager,
        html5QrcodeHandler: Html5QrcodeHandler,
        defaultZoomValueIfSupported: number | undefined,
        onFileSelectedCallback: OnFileSelected,
        cameraQueryHandler: Runnable) {
        this.scanTypeSelector = scanTypeSelector;
        this.persistedDataManager = persistedDataManager;
        this.html5QrcodeHandler = html5QrcodeHandler;
        this.defaultZoomValueIfSupported = defaultZoomValueIfSupported;
        this.onFileSelectedCallback = onFileSelectedCallback;
        this.cameraQueryHandler = cameraQueryHandler;

        this.childContainer = this.createChildContainer();
        this.container = this.createDashboard(this.childContainer);
        this.setupCleanDashboard();
    }

    private createChildContainer(): HTMLDivElement {
        const childContainer = document.createElement("div");
        childContainer.style.display = "flex";
        childContainer.style.justifyContent = "center";
        childContainer.style.flexDirection = "column";
        return childContainer;
    }

    private createDashboard(childContainer: HTMLDivElement): HTMLDivElement {
        const dashboard = document.createElement("div");
        dashboard.style.width = "100%";
        dashboard.style.position = "absolute";
        dashboard.style.bottom = "0px";
        dashboard.appendChild(childContainer);
        return dashboard;
    }

    private createTopDashboard(): HTMLDivElement {
        const element = document.createElement("div");
        element.setAttribute("this-is", "top-dash");
        return element;
    }

    private createMiddleDashboard(): HTMLDivElement {
        const element = document.createElement("div");
        element.setAttribute("this-is", "middle-dash");
        return element;
    }

    private createBottomDashboard(): HTMLDivElement {
        const element = document.createElement("div");
        element.setAttribute("this-is", "bottom-dash");
        return element;
    }

    private setupCleanDashboard() {
        this.childContainer.innerHTML = "";
        this.requestPermissionButton = null;
        this.fileScanUi = null;

        this.topDashboard = this.createTopDashboard();
        this.middleDashboard = this.createMiddleDashboard();
        this.bottomDashboard = this.createBottomDashboard();

        this.childContainer.appendChild(this.topDashboard);
        this.childContainer.appendChild(this.middleDashboard);
        this.childContainer.appendChild(this.bottomDashboard);
    }

    private setupNonCameraFileOnlyDash(onFileSelectedCallback: OnFileSelected) {
        this.setupCleanDashboard();
        
        this.container.style.removeProperty("bottom");
        this.container.style.top = "0px";
        this.container.style.display = "flex";
        this.container.style.justifyContent = "center";
        this.container.style.flexDirection = "column";
        this.container.style.width = "100%";
        this.container.style.height = "100%";

        // Style for Top dash.
        this.topDashboard.style.display = "inline-block";
        this.topDashboard.style.margin = "auto";
        this.topDashboard.style.textAlign = "center";

        // Style for Middle dash.
        this.middleDashboard.style.textAlign = "center";

        // Style for bottom dash.
        this.bottomDashboard.style.marginTop = "10px";
        this.bottomDashboard.style.textAlign = "center";

        this.renderFileScanImage();
        this.renderFileScanUi(
            this.middleDashboard,
            this.bottomDashboard,
            onFileSelectedCallback);
    }

    private setupNonCameraDash() {
        this.setupCleanDashboard();
        
        this.container.style.removeProperty("bottom");
        this.container.style.top = "0px";
        this.container.style.display = "flex";
        this.container.style.justifyContent = "center";
        this.container.style.flexDirection = "column";
        this.container.style.width = "100%";
        this.container.style.height = "100%";

        // Style for Top dash.
        this.topDashboard.style.display = "inline-block";
        this.topDashboard.style.margin = "auto";
        this.topDashboard.style.textAlign = "center";

        // Style for Middle dash.
        this.middleDashboard.style.textAlign = "center";
        
        // Style for bottom dash.
        this.bottomDashboard.style.marginTop = "10px";
        this.bottomDashboard.style.textAlign = "center";

        if (this.scanTypeSelector.isCameraScanRequired()) {
            this.requestPermissionButton = this.createPermissionButton(
                this.cameraQueryHandler);
            this.renderCameraScanImage(() => {
                this.topDashboard.appendChild(this.requestPermissionButton!)
            });

            this.middleDashboard.style.marginTop = "40px";

        } else {
            this.renderFileScanImage();
        }
 
        this.renderFileScanUi(
            this.middleDashboard,
            this.bottomDashboard,
            this.onFileSelectedCallback);
    }

    private setupNonCameraDashWithoutPermissionButton(
        cameraList: Array<CameraDevice>,
        selectedCameraId: string) {
        if (!this.scanTypeSelector.isCameraScanRequired()) {
            throw "Race condition, setupNonCameraDashWithoutPermissionButton "
                + " shouldn't be called without camera scan support.";
        }
        this.setupCleanDashboard();
        
        this.container.style.removeProperty("bottom");
        this.container.style.top = "0px";
        this.container.style.display = "flex";
        this.container.style.justifyContent = "center";
        this.container.style.flexDirection = "column";
        this.container.style.width = "100%";
        this.container.style.height = "100%";

        // Style for Top dash.
        this.topDashboard.style.display = "inline-block";
        this.topDashboard.style.margin = "auto";
        this.topDashboard.style.textAlign = "center";

        // Style for bottom dash.
        this.bottomDashboard.style.marginTop = "10px";
        this.bottomDashboard.style.textAlign = "center";

        this.middleDashboard.style.marginTop = "40px";
        this.middleDashboard.style.textAlign = "center";
        
        const onCameraStarted = (selectedCameraId: string): Promise<void> => {
            return this.renderCameraInternal(cameraList, selectedCameraId);
        };

        this.renderCameraScanImage(() => {
            StartScanningUi.createAndRender(
                this.topDashboard,
                cameraList,
                selectedCameraId,
                onCameraStarted);
        });
        this.renderFileScanUi(
            this.middleDashboard,
            this.bottomDashboard,
            this.onFileSelectedCallback);
    }

    private setupCameraDash() {
        this.setupCleanDashboard();
        
        this.container.style.removeProperty("top");
        this.container.style.removeProperty("height");
        this.container.style.bottom = "0px";
        this.container.style.display = "flex";
        this.container.style.justifyContent = "center";
        this.container.style.flexDirection = "column";
        this.container.style.width = "100%";
        this.container.style.padding = "20px 0px 20px 0px";

        // Style for Top dash.
        this.topDashboard.style.display = "inline-block";
        this.topDashboard.style.margin = "auto";
        this.topDashboard.style.textAlign = "center";

        this.middleDashboard.style.display = "inline-block";
        this.middleDashboard.style.margin = "auto";
        this.middleDashboard.style.textAlign = "center";

        // Style for bottom dash.
        this.bottomDashboard.style.marginTop = "10px";
        this.bottomDashboard.style.textAlign = "center";
    }

    private renderCameraScanImage(postImageLoadedRunnable: Runnable) {
        const imageContainer = document.createElement("div");
        imageContainer.style.marginBottom = "10px";
        if (this.cameraScanImage) {
            this.topDashboard.innerHTML = "";
            imageContainer.appendChild(this.cameraScanImage);
            this.topDashboard.appendChild(imageContainer);
            postImageLoadedRunnable();
            return;
        }

        this.cameraScanImage = new Image;
        this.cameraScanImage.onload = (_) => {
            this.topDashboard.innerHTML = "";
            imageContainer.appendChild(this.cameraScanImage!);
            this.topDashboard.appendChild(imageContainer);
            postImageLoadedRunnable();
        }
        this.cameraScanImage.width = 64;
        this.cameraScanImage.style.opacity = "0.8";
        this.cameraScanImage.src = ASSET_CAMERA_SCAN;
        this.cameraScanImage.alt = Html5QrcodeScannerStrings.cameraScanAltText();
    }

    private renderFileScanImage() {
        const imageContainer = document.createElement("div");
        imageContainer.style.marginBottom = "10px";
        
        if (this.fileScanImage) {
            this.topDashboard.innerHTML = "";
            imageContainer.appendChild(this.fileScanImage);
            this.topDashboard.appendChild(imageContainer);
            return;
        }

        this.fileScanImage = new Image;
        this.fileScanImage.onload = (_) => {
            this.topDashboard.innerHTML = "";
            imageContainer.appendChild(this.fileScanImage!);
            this.topDashboard.appendChild(imageContainer);
        }
        this.fileScanImage.width = 64;
        this.fileScanImage.style.opacity = "0.8";
        this.fileScanImage.src = ASSET_FILE_SCAN;
        this.fileScanImage.alt = Html5QrcodeScannerStrings.fileScanAltText();
    }

    private renderFileScanUi(
        buttonContainer: HTMLDivElement,
        textContainer: HTMLDivElement,
        onFileSelectedCallback: OnFileSelected) {
        // let showOnRender = ScanTypeSelector.isFileScanType(this.currentScanType);
        let showOnRender = true;
        this.fileScanUi = FileSelectionUi.create(
            buttonContainer,
            textContainer,
            showOnRender,
            onFileSelectedCallback);
    }

    private createPermissionButton(onPermissionButtonClicked: () => void): HTMLButtonElement {
        const requestPermissionButton = BaseUiElementFactory
            .createElement<HTMLButtonElement>(
                "button", PublicUiElementIdAndClasses.CAMERA_PERMISSION_BUTTON_ID);
        requestPermissionButton.innerText
            = Html5QrcodeScannerStrings.cameraPermissionTitle();

        requestPermissionButton.style.fontSize = "16px";

        requestPermissionButton.addEventListener("click", () => {
            requestPermissionButton.disabled = true;
            onPermissionButtonClicked();
        });

        return requestPermissionButton;
    }

    public enablePermissionButton() {
        checkNotNullOrUndefined(
            this.requestPermissionButton, "requestPermissionButton")
            .disabled = false;
    }

    public enableOrSetupPermissionButton() {
        if (this.requestPermissionButton) {
            this.requestPermissionButton.disabled = false;
        } else {
            // Case when the permission button generation was skipped
            // likely due to persistedDataManager indicated permissions
            // exists.
            // This should ideally never happen, but if it so happened that
            // the camera retrieval failed, we want to create button this
            // time.
            this.setupNonCameraDash();
        }
    }

    public renderCamera(
        cameraList: Array<CameraDevice>) {
        if (cameraList.length == 0) {
            throw "renderCamera(..) called without camera's";
        }
        const lastUsedCameraId = this.persistedDataManager.getLastUsedCameraId();
        let selectedCameraId = cameraList[0].id;
        if (isValidString(lastUsedCameraId)) {
            selectedCameraId = lastUsedCameraId!;
        }

        this.renderCameraInternal(cameraList, selectedCameraId);
    }

    private renderCameraInternal(
        cameraList: Array<CameraDevice>, selectedCameraId: string): Promise<void> {
        this.setupCleanDashboard();
        return this.html5QrcodeHandler.start(selectedCameraId)
            .then((_) => {
                this.renderCameraDashboard(cameraList, selectedCameraId);
            }).catch((_) => {
                this.setupNonCameraDash();
            });
    }

    private renderCameraDashboard(
        cameraList: Array<CameraDevice>,
        selectedCameraId: string) {
        const onCameraSwitch = (newCameraId: string): Promise<void> => {
            this.setupCleanDashboard();
            return this.html5QrcodeHandler.switchTo(newCameraId)
                .then((_) => {
                    this.renderCameraDashboard(cameraList, newCameraId);
                    this.persistedDataManager.setLastUsedCameraId(newCameraId);
                })
                .catch((_) => {
                    // Nothing else can be done at this point.
                    this.setupNonCameraDash();
                });
        }

        const onCameraStop = (): Promise<void> => {
            return this.html5QrcodeHandler.stop().then((_) => {
                this.setupNonCameraDashWithoutPermissionButton(cameraList, selectedCameraId);
            });
        }

        this.setupCameraDash();
        const cameraCapabilities = this.html5QrcodeHandler.getRunningTrackCameraCapabilities();
        const zoomCapability = cameraCapabilities.zoomFeature();
        if (zoomCapability.isSupported()) {
            // Render zoom handler.
            const cameraZoomUi: CameraZoomUi = CameraZoomUi.create(
                this.topDashboard, /* renderOnCreate= */ false);
            cameraZoomUi.setOnCameraZoomValueChangeCallback((zoomValue) => {
                zoomCapability.apply(zoomValue);
            });
            let defaultZoom = 1;
            if (this.defaultZoomValueIfSupported) {
                defaultZoom = this.defaultZoomValueIfSupported;
            }
            defaultZoom = clip(
                defaultZoom, zoomCapability.min(), zoomCapability.max());
            cameraZoomUi.setValues(
                zoomCapability.min(),
                zoomCapability.max(),
                defaultZoom,
                zoomCapability.step(),
            );
            cameraZoomUi.show();
        }

        // Render switch button.
        const switchButtonRightMargin = 5;
        if (cameraList.length > 1) {
            CameraSwitcher.createAndRender(
                this.middleDashboard,
                cameraList,
                selectedCameraId,
                onCameraSwitch,
                switchButtonRightMargin);
        }
        
        // Render image selecter.
        // TODO(minhazav): Change background of the text and color.
        this.renderFileScanUi(
            this.middleDashboard,
            this.bottomDashboard,
            this.onFileSelectedCallback);

        // Render torch handler
        const torchCapability = cameraCapabilities.torchFeature();
        if (torchCapability.isSupported()) {
            // TODO: render zoom handler.
            TorchButton.create(
                this.middleDashboard,
                cameraCapabilities.torchFeature(),
                { marginLeft: "5px" },
                // Callback in case of torch action failure.
                (errorMessage) => {
                    this.html5QrcodeHandler.delegateErrorMessage(errorMessage);
                });
        }

        // Render stop button.
        const stopButtonLeftMargin = 5;
        StopScanningButton.createAndRender(
            this.middleDashboard, onCameraStop, stopButtonLeftMargin);
    }

    public optionallySetImageName(fileName: string) {
        this.fileScanUi?.setImageNameToButton(fileName);
    }

    public static createAndRender(
        parentContainer: HTMLDivElement,
        currentScanType: Html5QrcodeScanType,
        scanTypeSelector: ScanTypeSelector,
        persistedDataManager: PersistedDataManager,
        html5QrcodeHandler: Html5QrcodeHandler,
        defaultZoomValueIfSupported: number | undefined,
        onFileSelectedCallback: OnFileSelected,
        cameraQueryHandler: Runnable,
        ): QrScanDashboard {
        const dashboard = new QrScanDashboard(
            scanTypeSelector,
            persistedDataManager,
            html5QrcodeHandler,
            defaultZoomValueIfSupported,
            onFileSelectedCallback,
            cameraQueryHandler);
        parentContainer.appendChild(dashboard.container);

        // Reasons to render camera version.
        // onlyRenderFileBasedScan = True;
        // Or support camera but don't have permission!
        const hasMoreThanOneScanType = scanTypeSelector.hasMoreThanOneScanType();
        const isCurrentScanTypeFile = currentScanType === Html5QrcodeScanType.SCAN_TYPE_FILE;
        const onlyRenderFileBasedScan = !hasMoreThanOneScanType && isCurrentScanTypeFile;
        if (onlyRenderFileBasedScan) {
            dashboard.setupNonCameraFileOnlyDash(onFileSelectedCallback);
            return dashboard;
        }

        if (persistedDataManager.hasCameraPermissions()) {
            CameraPermissions.hasPermissions().then(
                (hasPermissions: boolean) => {
                if (hasPermissions) {
                    // Have permission, render camera and dashboard.
                    cameraQueryHandler();
                } else {
                    persistedDataManager.setHasPermission(/* hasPermission */ false);
                    // Don't have permission, render non camera UI.
                    dashboard.setupNonCameraDash();
                }
            }).catch((_: any) => {
                persistedDataManager.setHasPermission(/* hasPermission */ false);
                // Don't have permission, render non camera UI.
                dashboard.setupNonCameraDash();
            });
        } else {
            dashboard.setupNonCameraDash();
        }
        return dashboard;
    }
}
