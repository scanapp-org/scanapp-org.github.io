/**
 * @fileoverview
 * Abstraction over {@link Html5Qrcode}.
 * 
 * @author mebjas <minhazav@gmail.com>
 */

import { CameraCapabilities } from "./camera/core";

/** Interface for {@link Html5Qrcode} handler. */
export interface Html5QrcodeHandler {
    start(cameraId: string): Promise<void>;
    stop(): Promise<void>;
    switchTo(newCameraId: string): Promise<void>;
    getRunningTrackCameraCapabilities(): CameraCapabilities;
    delegateErrorMessage(message: string): void;
}
