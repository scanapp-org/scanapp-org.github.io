import { Page } from "../../router";
import { PageId, ScanResult } from "../../types";
import { h, s } from "../../utils/dom";
import { CameraManager } from "../../camera/camera-manager";
import { ResultPanel } from "../../result/result-panel";
import { CameraDevice } from "../../../html5-qrcode/camera/core";
import { appShell } from "../../app-shell";
import { Logger } from "../../../scanapp/logger";
import { isMobile } from "../../utils/detect";
import { PwaPromptManager } from "../../../scanapp/pwa";

export class ScanPage implements Page {
  public id = PageId.SCAN;
  private element: HTMLElement;
  private cameraManager: CameraManager;
  private resultPanel!: ResultPanel;
  private readonly pwaPromptManager = new PwaPromptManager("beta_install_banner");

  // Viewport elements
  private viewportWrapper!: HTMLElement;
  private cameraReader!: HTMLElement;
  private viewfinderOverlay!: HTMLElement;
  private floatingControlsLeft!: HTMLElement;
  private floatingControlsRight!: HTMLElement;
  private cameraPopover!: HTMLElement;
  private cameraLoader!: HTMLElement;
  private permissionArrow!: HTMLElement;
  
  // Floating button elements
  private torchBtn!: HTMLButtonElement;
  private cameraBtn!: HTMLButtonElement;
  private fitBtn!: HTMLButtonElement;
  private fileBtn!: HTMLButtonElement;

  private fallbackUI!: HTMLElement;
  private dragZone!: HTMLElement;
  private fileInputHelper!: HTMLInputElement;
  private dropOverlay!: HTMLElement;

  // State
  private isCoverMode: boolean = true;
  private isTorchOn: boolean = false;
  private availableCameras: CameraDevice[] = [];
  private popoverOpen: boolean = false;

  constructor() {
    const savedCoverMode = localStorage.getItem("scanapp_cover_mode");
    if (savedCoverMode !== null) {
      this.isCoverMode = savedCoverMode === "true";
    } else {
      this.isCoverMode = isMobile(); // True (cover/full-screen) on mobile, false (fit/resolution) on desktop web
    }

    this.element = this.createPageStructure();
    
    // Instantiate camera target ID
    this.cameraManager = new CameraManager("camera-reader-v2");
    
    this.initCameraCallbacks();
    this.initResultPanel();
    this.initDragDrop();
  }

  public getElement(): HTMLElement {
    return this.element;
  }

  public async onMount(): Promise<void> {
    this.resultPanel.hide();
    await this.startScanSequence();
  }

  public async onUnmount(): Promise<void> {
    this.closePopover();
    this.isTorchOn = false;
    this.torchBtn.classList.remove("active");
    await this.cameraManager.stopCamera();
  }

  private initCameraCallbacks(): void {
    this.cameraManager.onScanSuccessCallback = (result: ScanResult) => {
      this.cameraManager.pause();
      Logger.logScanSuccess("camera", result.category);
      // Play a subtle beep or scan sound (optional, let's show toast/result panel)
      this.resultPanel.show(result);
    };

    this.cameraManager.onScanErrorCallback = (_err) => {
      // Quietly ignore frame decode errors (normal behaviour)
    };
  }

  private initResultPanel(): void {
    this.resultPanel = new ResultPanel(() => {
      Logger.logScanRestart();

      // Resume camera when panel is closed
      this.cameraManager.resume();
    }, {
      shouldShow: () => this.pwaPromptManager.canShowPrompt(),
      onShown: () => this.pwaPromptManager.logInstallBannerShown("beta_result_sheet"),
      onClick: () => {
        this.pwaPromptManager.logInstallBannerClicked("beta_result_sheet");
        this.pwaPromptManager.optionallyShowPrompt("beta_result_sheet", 0);
      },
    });
    this.pwaPromptManager.onPromptAvailable(() => this.resultPanel.refreshInstallBanner());
  }

  private showLoader(message: string = "Initializing camera..."): void {
    const textEl = this.cameraLoader.querySelector(".camera-loader-text");
    if (textEl) textEl.textContent = message;
    this.cameraLoader.classList.add("show");
  }

  private hideLoader(): void {
    this.cameraLoader.classList.remove("show");
  }

  private async startScanSequence(): Promise<void> {
    this.showFallback(false);
    this.showLoader("Waiting for camera permissions...");
    
    try {
      const cameras = await this.cameraManager.listCameras();
      this.availableCameras = cameras;

      if (cameras.length === 0) {
        this.hideLoader();
        this.showFallback(true, "No camera devices found. You can still scan files.");
        return;
      }

      // Populate camera popover
      this.renderCameraPopoverOptions();

      // Retrieve saved camera settings
      const savedLabel = localStorage.getItem("scanapp_selected_camera_label");
      const savedId = localStorage.getItem("scanapp_selected_camera_id");

      let selectedCamera = cameras[0];

      if (savedLabel || savedId) {
        const matchByLabel = cameras.find(c => c.label === savedLabel);
        if (matchByLabel) {
          selectedCamera = matchByLabel;
        } else {
          const matchById = cameras.find(c => c.id === savedId);
          if (matchById) {
            selectedCamera = matchById;
          }
        }
      } else {
        // Auto select camera (prefer back/environment camera)
        const backCam = cameras.find(c => 
          c.label.toLowerCase().includes("back") || 
          c.label.toLowerCase().includes("environment") ||
          c.label.toLowerCase().includes("rear")
        );
        if (backCam) {
          selectedCamera = backCam;
        }
      }

      this.showLoader("Starting camera...");
      await this.cameraManager.startCamera(selectedCamera.id, this.isCoverMode);
      this.saveActiveCamera(selectedCamera.id);
      Logger.logScanStart(window.self !== window.top, "camera");
      
      // Update camera UI controls
      this.updateCameraControlsUI();
      this.hideLoader();
      
    } catch (e: any) {
      this.hideLoader();
      console.warn("Camera start sequence failed:", e);
      this.showFallback(true, "Camera access denied or failed. Please check browser permissions.");
    }
  }

  private updateCameraControlsUI(): void {
    // Show/hide torch button depending on camera capabilities
    const caps = this.cameraManager.getCapabilities();
    const showTorch = !!(caps && caps.torchFeature().isSupported());
    this.torchBtn.style.display = showTorch ? "flex" : "none";

    // Toggle camera swap button if multiple cameras
    const showCamera = this.availableCameras.length > 1;
    this.cameraBtn.style.display = showCamera ? "flex" : "none";

    // Hide left container if both controls are hidden
    this.floatingControlsLeft.style.display = (showTorch || showCamera) ? "flex" : "none";
  }

  private saveActiveCamera(cameraId: string): void {
    const activeCam = this.availableCameras.find(c => c.id === cameraId);
    if (activeCam) {
      localStorage.setItem("scanapp_selected_camera_label", activeCam.label);
      localStorage.setItem("scanapp_selected_camera_id", activeCam.id);
    }
  }

  private showFallback(show: boolean, message: string = ""): void {
    if (show) {
      this.viewportWrapper.style.display = "none";
      this.fallbackUI.style.display = "flex";
      this.permissionArrow.style.display = "flex";
      if (message) {
        const desc = this.fallbackUI.querySelector(".fallback-desc");
        if (desc) desc.textContent = message;
      }
    } else {
      this.viewportWrapper.style.display = "flex";
      this.fallbackUI.style.display = "none";
      this.permissionArrow.style.display = "none";
    }
  }

  private createPageStructure(): HTMLElement {
    // Custom icons
    const torchIcon = s("svg", { viewBox: "0 0 24 24" },
      s("path", { d: "M7 2v11h3v9l7-12h-4l4-8z" })
    );

    const cameraIcon = s("svg", { viewBox: "0 0 24 24" },
      s("path", { d: "M21 6h-1.5a.5.5 0 0 1-.5-.5A1.502 1.502 0 0 0 17.5 4h-6A1.502 1.502 0 0 0 10 5.5a.5.5 0 0 1-.5.5H8V5H4v1H3a2.002 2.002 0 0 0-2 2v10a2.002 2.002 0 0 0 2 2h18a2.002 2.002 0 0 0 2-2V8a2.002 2.002 0 0 0-2-2zm1 12a1.001 1.001 0 0 1-1 1H3a1.001 1.001 0 0 1-1-1V8a1.001 1.001 0 0 1 1-1h2V6h2v1h2.5A1.502 1.502 0 0 0 11 5.5a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 .5.5A1.502 1.502 0 0 0 19.5 7H21a1.001 1.001 0 0 1 1 1zM8.2 13h-1a4.796 4.796 0 0 1 8.8-2.644V9h1v3h-3v-1h1.217A3.79 3.79 0 0 0 8.2 13zm7.6 0h1A4.796 4.796 0 0 1 8 15.644V17H7v-3h3v1H8.783a3.79 3.79 0 0 0 7.017-2z" }),
      s("path", { fill: "none", d: "M0 0h24v24H0z" })
    );

    const fitIcon = s("svg", { viewBox: "0 0 24 24" },
      s("path", { d: "M15 3h6v6h-2V5h-4V3zM9 3H3v6h2V5h4V3zm10 16v-4h2v6h-6v-2h4zM5 15H3v6h6v-2H5v-4z" })
    );

    const fileIcon = s("svg", { viewBox: "0 0 24 24" },
      s("path", { d: "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5.04-6.71l-2.75 3.54-1.96-2.36L6.5 17h11l-3.54-4.71zM8.5 11c.828 0 1.5-.672 1.5-1.5S9.328 8 8.5 8 7 8.672 7 9.5 7.672 11 8.5 11z" })
    );

    this.cameraReader = h("div", {
      id: "camera-reader-v2",
      class: `camera-container-v2 ${!this.isCoverMode ? "fit-resolution" : ""}`
    });
    
    // Viewfinder
    this.viewfinderOverlay = h("div", { class: "viewfinder-overlay" },
      h("div", { class: "viewfinder-status-label" }, "Scan with privacy"),
      h("div", { class: "viewfinder-box" },
        h("div", { class: "viewfinder-corner top-left" }),
        h("div", { class: "viewfinder-corner top-right" }),
        h("div", { class: "viewfinder-corner bottom-left" }),
        h("div", { class: "viewfinder-corner bottom-right" }),
        h("div", { class: "viewfinder-laser" })
      )
    );

    // Controls
    this.torchBtn = h("button", {
      class: "control-btn",
      style: { display: "none" },
      onClick: () => this.handleToggleTorch()
    }, torchIcon);

    this.cameraBtn = h("button", {
      class: "control-btn",
      style: { display: "none" },
      onClick: (e: Event) => this.handleToggleCameraPopover(e)
    }, cameraIcon);

    this.fitBtn = h("button", {
      class: `control-btn ${this.isCoverMode ? "active" : ""}`,
      onClick: () => this.handleToggleFitMode()
    }, fitIcon);

    this.fileBtn = h("button", {
      class: "control-btn",
      onClick: () => this.triggerFileSelect("toolbar")
    }, fileIcon);

    this.cameraPopover = h("div", { class: "camera-popover" });

    this.cameraLoader = h("div", { class: "camera-loader-v2" },
      h("div", { class: "camera-loader-spinner" }),
      h("div", { class: "camera-loader-text" }, "Initializing camera...")
    );

    this.floatingControlsLeft = h("div", { class: "floating-controls-left" },
      this.torchBtn,
      this.cameraBtn
    );

    this.floatingControlsRight = h("div", { class: "floating-controls-right" },
      this.fitBtn,
      this.fileBtn
    );

    // Document click to close popover
    document.addEventListener("click", (e) => {
      if (this.popoverOpen && !this.cameraPopover.contains(e.target as Node) && !this.cameraBtn.contains(e.target as Node)) {
        this.closePopover();
      }
    });

    this.viewportWrapper = h("div", { class: "scanner-viewport-wrapper" },
      this.cameraReader,
      this.viewfinderOverlay,
      this.cameraLoader,
      this.floatingControlsLeft,
      this.floatingControlsRight,
      this.cameraPopover
    );

    // Build Fallback UI
    this.fileInputHelper = h("input", {
      type: "file",
      accept: "image/*",
      style: { display: "none" },
      onChange: (e: any) => this.handleFileSelected(e)
    }) as HTMLInputElement;

    const dragDropIcon = s("svg", { viewBox: "0 0 24 24" },
      s("path", { d: "M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM19 18H6c-2.21 0-4-1.79-4-4 0-2.05 1.53-3.76 3.56-3.97l1.07-.11.5-.95C8.08 7.14 9.94 6 12 6c2.62 0 4.88 1.86 5.39 4.43l.3 1.5 1.53.11c1.56.1 2.78 1.41 2.78 2.96 0 1.65-1.35 3-3 3zM8 13h2.55v3h2.9v-3H16l-4-4z" })
    );

    this.dragZone = h("div", {
      class: "drag-drop-zone",
      onClick: () => this.triggerFileSelect("drag_zone")
    },
      dragDropIcon,
      h("h4", {},
        h("span", { class: "desktop-text" }, "Drag and drop QR Code image"),
        h("span", { class: "mobile-text" }, "Choose image from photo library")
      ),
      h("p", { style: { fontSize: "0.8rem", color: "var(--sa-text-secondary)" } },
        h("span", { class: "desktop-text" }, "Or click to browse files from device"),
        h("span", { class: "mobile-text" }, "Drag & drop also supported")
      )
    );

    this.fallbackUI = h("div", { class: "permission-fallback", style: { display: "none" } },
      this.fileInputHelper,
      h("div", { class: "fallback-illustration" },
        s("svg", { viewBox: "0 0 24 24", fill: "currentColor" },
          s("path", { d: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" })
        )
      ),
      h("h3", { class: "fallback-title" }, "Camera Access Required"),
      h("p", { class: "fallback-desc" }, "Please grant camera permission to scan, or choose a file below."),
      h("div", { class: "fallback-action-container" },
        h("button", { class: "primary-btn", onClick: () => this.startScanSequence() }, "Try Again"),
        h("button", { class: "secondary-btn", onClick: () => this.triggerFileSelect("fallback_button") }, "Upload Image")
      ),
      this.dragZone,
      h("br"),
      h("div", { class: "permission-guide-box" },
        h("h4", {}, "How to Grant Camera Permissions:"),
        h("ol", {},
          h("li", {}, "Click the lock/settings icon in the browser address bar."),
          h("li", {}, "Locate the 'Camera' setting and change it to 'Allow'."),
          h("li", {}, "Reload the page to start scanning.")
        )
      )
    );

    this.permissionArrow = h("div", { class: "permission-arrow-indicator", style: { display: "none" } },
      s("svg", {
        viewBox: "0 0 24 24",
        class: "permission-arrow-svg",
        fill: "none",
        stroke: "currentColor",
        "stroke-width": "2.5",
        "stroke-linecap": "round",
        "stroke-linejoin": "round"
      },
        s("line", { x1: "17", y1: "17", x2: "7", y2: "7" }),
        s("polyline", { points: "7 17 7 7 17 7" })
      ),
      h("div", { class: "permission-arrow-label" }, "Tap lock icon to enable camera")
    );

    this.dropOverlay = h("div", { class: "app-drop-overlay" },
      h("div", { class: "app-drop-overlay-box" },
        s("svg", { viewBox: "0 0 24 24", class: "drop-icon" },
          s("path", { d: "M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z" })
        ),
        h("h2", {}, "Drop image here to scan"),
        h("p", {}, "ScanApp will automatically detect any QR codes or barcodes")
      )
    );

    return h("div", { class: "scan-page-container" },
      this.viewportWrapper,
      this.fallbackUI,
      this.permissionArrow,
      this.dropOverlay
    );
  }

  private handleToggleTorch(): void {
    this.isTorchOn = !this.isTorchOn;
    this.cameraManager.setTorch(this.isTorchOn);
    Logger.logBetaTorchToggle(this.isTorchOn);
    if (this.isTorchOn) {
      this.torchBtn.classList.add("active");
      appShell.showToast("Torch On");
    } else {
      this.torchBtn.classList.remove("active");
      appShell.showToast("Torch Off");
    }
  }

  private handleToggleFitMode(): void {
    this.isCoverMode = !this.isCoverMode;
    localStorage.setItem("scanapp_cover_mode", String(this.isCoverMode));
    Logger.logBetaViewfinderModeToggle(this.isCoverMode ? "cover" : "fit");
    if (this.isCoverMode) {
      this.fitBtn.classList.add("active");
      this.cameraReader.classList.remove("fit-resolution");
      appShell.showToast("Viewfinder Mode: Full Screen");
    } else {
      this.fitBtn.classList.remove("active");
      this.cameraReader.classList.add("fit-resolution");
      appShell.showToast("Viewfinder Mode: Fit Aspect Ratio");
    }

    // Restart camera with new constraint
    const activeId = this.cameraManager.getActiveCameraId();
    if (activeId) {
      this.showLoader("Adjusting aspect ratio...");
      this.cameraManager.startCamera(activeId, this.isCoverMode)
        .then(() => {
          this.hideLoader();
        })
        .catch(err => {
          this.hideLoader();
          console.warn("Failed to apply aspect fit:", err);
        });
    }
  }

  private handleToggleCameraPopover(e: Event): void {
    e.stopPropagation();
    if (this.availableCameras.length === 2) {
      // Simply swap/toggle cameras!
      const activeId = this.cameraManager.getActiveCameraId();
      const otherCam = this.availableCameras.find(c => c.id !== activeId);
      if (otherCam) {
        this.handleSelectCamera(otherCam.id);
      }
    } else {
      if (this.popoverOpen) {
        this.closePopover();
      } else {
        this.openPopover();
      }
    }
  }

  private openPopover(): void {
    this.cameraPopover.classList.add("show");
    this.popoverOpen = true;
    Logger.logBetaCameraPopover("open");
  }

  private closePopover(): void {
    const wasOpen = this.popoverOpen;
    this.cameraPopover.classList.remove("show");
    this.popoverOpen = false;
    if (wasOpen) {
      Logger.logBetaCameraPopover("close");
    }
  }

  private renderCameraPopoverOptions(): void {
    this.cameraPopover.innerHTML = "";
    
    const activeId = this.cameraManager.getActiveCameraId();

    this.availableCameras.forEach((cam) => {
      const isSelected = cam.id === activeId;
      const option = h("button", {
        class: `camera-option-item ${isSelected ? "selected" : ""}`,
        onClick: () => this.handleSelectCamera(cam.id)
      }, cam.label || `Camera ${cam.id.substring(0, 5)}`);
      
      this.cameraPopover.appendChild(option);
    });
  }

  private async handleSelectCamera(cameraId: string): Promise<void> {
    this.closePopover();
    this.showLoader("Switching camera...");
    try {
      await this.cameraManager.startCamera(cameraId, this.isCoverMode);
      this.saveActiveCamera(cameraId);
      this.renderCameraPopoverOptions(); // refresh selected state
      this.updateCameraControlsUI();
      this.hideLoader();
      Logger.logBetaCameraSwitch("success");
      appShell.showToast("Switched Camera");
    } catch (e) {
      this.hideLoader();
      Logger.logBetaCameraSwitch("failure");
      appShell.showToast("Failed to switch camera");
    }
  }

  private triggerFileSelect(source: string): void {
    Logger.logBetaFilePickerOpen(source);
    this.fileInputHelper.value = "";
    this.fileInputHelper.click();
  }

  private async handleFileSelected(e: any): Promise<void> {
    const files = e.target.files;
    if (files && files.length > 0) {
      await this.processImageFile(files[0]);
    }
  }

  private async processImageFile(file: File): Promise<void> {
    appShell.showToast("Processing image...");
    try {
      const result = await this.cameraManager.scanFile(file);
      this.cameraManager.pause();
      Logger.logScanSuccess("file", result.category);
      this.resultPanel.show(result);
    } catch (err) {
      console.warn("Scan file failed:", err);
      appShell.showToast("No QR / Barcode detected in image.");
    }
  }

  private initDragDrop(): void {
    const handleDrag = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const hasFiles = (e: DragEvent) => {
      if (!e.dataTransfer) return false;
      return Array.from(e.dataTransfer.types).includes("Files");
    };

    let dragCounter = 0;

    window.addEventListener("dragenter", (e: DragEvent) => {
      handleDrag(e);
      if (!hasFiles(e)) return;
      dragCounter++;
      if (dragCounter === 1) {
        this.dropOverlay.classList.add("active");
        Logger.logBetaDragDropOverlayShown();
      }
    });

    window.addEventListener("dragover", (e: DragEvent) => {
      handleDrag(e);
      if (hasFiles(e) && e.dataTransfer) {
        e.dataTransfer.dropEffect = "copy";
      }
    });

    window.addEventListener("dragleave", (e: DragEvent) => {
      handleDrag(e);
      if (!hasFiles(e)) return;
      dragCounter--;
      if (dragCounter <= 0) {
        dragCounter = 0;
        this.dropOverlay.classList.remove("active");
      }
    });

    window.addEventListener("drop", async (e: DragEvent) => {
      handleDrag(e);
      dragCounter = 0;
      this.dropOverlay.classList.remove("active");

      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        Logger.logBetaDragDropFileDropped("window");
        await this.processImageFile(files[0]);
      }
    });

    // Also bind fallback UI drag zone to support clicks and keep visual dragover local styling if dragged inside fallback dragzone
    this.dragZone.addEventListener("dragenter", (e) => {
      handleDrag(e);
      this.dragZone.classList.add("dragover");
    });
    this.dragZone.addEventListener("dragover", handleDrag);
    this.dragZone.addEventListener("dragleave", (e) => {
      handleDrag(e);
      this.dragZone.classList.remove("dragover");
    });
    this.dragZone.addEventListener("drop", async (e: DragEvent) => {
      handleDrag(e);
      this.dragZone.classList.remove("dragover");
      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        Logger.logBetaDragDropFileDropped("fallback_drag_zone");
        await this.processImageFile(files[0]);
      }
    });
  }
}
