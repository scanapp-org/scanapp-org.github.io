import { Html5Qrcode, Html5QrcodeCameraScanConfig } from "../../html5-qrcode/html5-qrcode";
import { CameraDevice, CameraCapabilities, Html5QrcodeCameraRenderingConstraints } from "../../html5-qrcode/camera/core";
import { CodeCategory, ScanResult } from "../types";
import { parseScanResult } from "../result/result-parser";
import { isMobile } from "../utils/detect";

export class CameraManager {
  private html5Qrcode: Html5Qrcode | null = null;
  private elementId: string;
  private isScanning: boolean = false;
  private activeCameraId: string | null = null;

  public onScanSuccessCallback?: (result: ScanResult) => void;
  public onScanErrorCallback?: (error: string) => void;

  constructor(elementId: string) {
    this.elementId = elementId;
  }

  private getOrInitHtml5Qrcode(): Html5Qrcode {
    if (!this.html5Qrcode) {
      this.html5Qrcode = new Html5Qrcode(
        this.elementId,
        {
          verbose: false,
          experimentalFeatures: {
            useBarCodeDetectorIfSupported: true,
          }
        });
    }
    return this.html5Qrcode;
  }

  public async listCameras(): Promise<CameraDevice[]> {
    try {
      return await Html5Qrcode.getCameras();
    } catch (e) {
      console.error("Failed to list cameras:", e);
      return [];
    }
  }

  public async startCamera(cameraId: string, _isCoverMode: boolean = true): Promise<void> {
    if (this.isScanning) {
      await this.stopCamera();
    }

    const scanner = this.getOrInitHtml5Qrcode();
    const config: Html5QrcodeCameraScanConfig = {
      fps: 15,
      qrbox: undefined,
      aspectRatio: isMobile() ? 16 / 9 : 4 / 3,
      renderingConstraints: Html5QrcodeCameraRenderingConstraints.CONSTRAINT_BY_WIDTH_AND_HEIGHT
    };

    return new Promise<void>((resolve, reject) => {
      scanner.start(
        cameraId,
        config,
        (decodedText, result) => {
          this.handleSuccess(decodedText, result.result.format?.formatName || "QR_CODE");
        },
        (error) => {
          if (this.onScanErrorCallback) {
            this.onScanErrorCallback(error);
          }
        }
      )
      .then(() => {
        this.isScanning = true;
        this.activeCameraId = cameraId;
        resolve();
      })
      .catch((err) => {
        reject(err);
      });
    });
  }

  public async stopCamera(): Promise<void> {
    if (!this.isScanning || !this.html5Qrcode) return;

    try {
      await this.html5Qrcode.stop();
    } catch (e) {
      console.warn("Error stopping camera:", e);
    } finally {
      this.isScanning = false;
      this.activeCameraId = null;
    }
  }

  public pause(): void {
    if (this.isScanning && this.html5Qrcode) {
      try {
        this.html5Qrcode.pause(true);
      } catch (e) {
        console.warn("Pause camera error:", e);
      }
    }
  }

  public resume(): void {
    if (this.isScanning && this.html5Qrcode) {
      try {
        this.html5Qrcode.resume();
      } catch (e) {
        console.warn("Resume camera error:", e);
      }
    }
  }

  public async scanFile(file: File): Promise<ScanResult> {
    const scanner = this.getOrInitHtml5Qrcode();
    // Scan file natively using scanFileV2 of html5-qrcode
    const res = await scanner.scanFileV2(file, false);
    return parseScanResult(res.decodedText, res.result.format?.formatName || "QR_CODE");
  }

  public getCapabilities(): CameraCapabilities | null {
    if (this.isScanning && this.html5Qrcode) {
      try {
        return this.html5Qrcode.getRunningTrackCameraCapabilities();
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  public getSettings(): MediaTrackSettings | null {
    if (this.isScanning && this.html5Qrcode) {
      try {
        return this.html5Qrcode.getRunningTrackSettings();
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  public async setTorch(on: boolean): Promise<void> {
    if (!this.isScanning || !this.html5Qrcode) return;
    try {
      const caps = this.html5Qrcode.getRunningTrackCameraCapabilities();
      if (caps.torchFeature().isSupported()) {
        await caps.torchFeature().apply(on);
      }
    } catch (e) {
      console.warn("Failed to set torch:", e);
    }
  }

  public getActiveCameraId(): string | null {
    return this.activeCameraId;
  }

  public getIsScanning(): boolean {
    return this.isScanning;
  }

  private handleSuccess(decodedText: string, formatName: string): void {
    const parsed = parseScanResult(decodedText, formatName);
    if (this.onScanSuccessCallback) {
      this.onScanSuccessCallback(parsed);
    }
  }
}
