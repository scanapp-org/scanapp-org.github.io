/**
 * @fileoverview
 * Core camera library implementations.
 * 
 * @author mebjas <minhazav@gmail.com>
 */

import {
    Camera,
    CameraCapabilities,
    CameraCapability,
    RangeCameraCapability,
    CameraRenderingOptions,
    RenderedCamera,
    RenderingCallbacks,
    Html5QrcodeCameraRenderingConstraints,
    BooleanCameraCapability
} from "./core";

/** Interface for a range value. */
interface RangeValue {
    min: number;
    max: number;
    step: number;
}

/** Abstract camera capability class. */
abstract class AbstractCameraCapability<T> implements CameraCapability<T> {
    protected readonly name: string;
    protected readonly track: MediaStreamTrack;

    constructor(name: string, track: MediaStreamTrack) {
        this.name = name;
        this.track = track;
    }

    public isSupported(): boolean {
        // TODO(minhazav): Figure out fallback for getCapabilities()
        // in firefox.
        // https://developer.mozilla.org/en-US/docs/Web/API/Media_Capture_and_Streams_API/Constraints
        if (!this.track.getCapabilities) {
            return false;
        }
        return this.name in this.track.getCapabilities();
    }

    public apply(value: T): Promise<void> {
        let constraint: any = {};
        constraint[this.name] = value;
        let constraints = { advanced: [ constraint ] };
        return this.track.applyConstraints(constraints);
    }

    public value(): T | null {
        let settings: any = this.track.getSettings();
        if (this.name in settings) {
            let settingValue = settings[this.name];
            return settingValue;
        }

        return null;
    }
}

abstract class AbstractRangeCameraCapability extends AbstractCameraCapability<number> {
    constructor(name: string, track: MediaStreamTrack) {
       super(name, track);
    }

    public min(): number {
        return this.getCapabilities().min;
    }

    public max(): number {
        return this.getCapabilities().max;
    }

    public step(): number {
        return this.getCapabilities().step;
    }

    public apply(value: number): Promise<void> {
        let constraint: any = {};
        constraint[this.name] = value;
        let constraints = {advanced: [ constraint ]};
        return this.track.applyConstraints(constraints);
    }

    private getCapabilities(): RangeValue {
        this.failIfNotSupported();
        let capabilities: any = this.track.getCapabilities();
        let capability: any = capabilities[this.name];
        return {
            min: capability.min,
            max: capability.max,
            step: capability.step,
        };
    }

    private failIfNotSupported() {
        if (!this.isSupported()) {
            throw new Error(`${this.name} capability not supported`);
        }
    }
}

//#region Camera feature implementations
/** Zoom feature. */
class ZoomFeatureImpl extends AbstractRangeCameraCapability {
    constructor(track: MediaStreamTrack) {
        super("zoom", track);
    }
}

/** Torch feature. */
class TorchFeatureImpl extends AbstractCameraCapability<boolean> {
    constructor(track: MediaStreamTrack) {
        super("torch", track);
    }
}

//#endregion

/** Implementation of {@link CameraCapabilities}. */
class CameraCapabilitiesImpl implements CameraCapabilities {
    private readonly track: MediaStreamTrack;
    
    constructor(track: MediaStreamTrack) {
        this.track = track;
    }

    zoomFeature(): RangeCameraCapability {
        return new ZoomFeatureImpl(this.track);
    }

    torchFeature(): BooleanCameraCapability {
        return new TorchFeatureImpl(this.track);
    }
}

/** Returns the first track in the {@code mediaStream} or else fail. */
function getFirstTrackOrFail(mediaStream: MediaStream): MediaStreamTrack {
    if (!mediaStream.active) {
        throw "The mediaStream is not active.";
    }

    if (mediaStream.getVideoTracks().length === 0) {
        throw "No video tracks found";
    }

    return mediaStream.getVideoTracks()[0];
}


function setupVideoSurface(
    mediaStream: MediaStream,
    clientWidth: number,
    clientHeight: number,
    renderingConstraints: Html5QrcodeCameraRenderingConstraints,
    callbacks: RenderingCallbacks): HTMLVideoElement {
    const videoElement = document.createElement("video");
    const mediaTrack = getFirstTrackOrFail(mediaStream);
    let videoAspectRatio = 0;
    if (!mediaTrack.getSettings().width || !mediaTrack.getSettings().height) {
        if (renderingConstraints == Html5QrcodeCameraRenderingConstraints.CONSTRAINT_BY_WIDTH_AND_HEIGHT) {
            console.error("width or height not available in mediaTrack, renderingConstraints reset to CONSTRAINT_BY_WIDTH");
            renderingConstraints = Html5QrcodeCameraRenderingConstraints.CONSTRAINT_BY_WIDTH;
        }
    } else {
        videoAspectRatio = mediaTrack.getSettings().width! /  mediaTrack.getSettings().height!;
    }


    if (renderingConstraints == Html5QrcodeCameraRenderingConstraints.CONSTRAINT_BY_WIDTH) {
        videoElement.style.width = `${clientWidth}px`;
    } else if (renderingConstraints == Html5QrcodeCameraRenderingConstraints.CONSTRAINT_BY_HEIGHT) {
        videoElement.style.height = `${clientHeight}px`;
    } else {
        const containerAspectRatio = clientWidth / clientHeight;
        let newVideoWidth = clientWidth;
        let newVideoHeight = clientHeight;

        if (containerAspectRatio > videoAspectRatio) {
            console.log(`clientWidth, clientHeight => ${clientWidth}, ${clientHeight}`)
            console.log(`containerAspectRatio > videoAspectRatio => ${containerAspectRatio}, ${videoAspectRatio}`)
            // Scenario example
            // Container = 16x9; Video = 16x12 (4:3)
            // Video height needs to be brought down to 9.
            newVideoHeight = clientHeight;
            newVideoWidth = Math.floor(newVideoHeight * videoAspectRatio);
            console.log(`newVideoWidth, newVideoHeight => ${newVideoWidth}, ${newVideoHeight}`)
        } else if (containerAspectRatio < videoAspectRatio) {
            console.log(`clientWidth, clientHeight => ${clientWidth}, ${clientHeight}`)
            console.log(`containerAspectRatio < videoAspectRatio => ${containerAspectRatio}, ${videoAspectRatio}`)
            // Scenario example
            // Container = 16x12 (4:3); Video = 16x9 (4:3)
            // Video height needs to be brought down to 9.
            newVideoWidth = clientWidth;
            newVideoHeight = Math.floor(newVideoWidth / videoAspectRatio);
            console.log(`newVideoWidth, newVideoHeight => ${newVideoWidth}, ${newVideoHeight}`)
        }
        videoElement.style.width = `${newVideoWidth}px`;
        videoElement.style.height = `${newVideoHeight}px`;
    }

    videoElement.style.display = "block";
    videoElement.muted = true;
    videoElement.setAttribute("muted", "true");
    (<any>videoElement).playsInline = true;

    videoElement.onabort = () => {
        throw "RenderedCameraImpl video surface onabort() called";
    };

    videoElement.onerror = () => {
        throw "RenderedCameraImpl video surface onerror() called";
    };

    let onVideoStart = () => {
        const videoWidth = videoElement.clientWidth;
        const videoHeight = videoElement.clientHeight;
        callbacks.onRenderSurfaceReady(videoWidth, videoHeight);
        videoElement.removeEventListener("playing", onVideoStart);
    };

    videoElement.addEventListener("playing", onVideoStart);
    videoElement.srcObject = mediaStream;
    videoElement.play();

    return videoElement;
}


/** Implementation of {@link RenderedCamera}. */
class RenderedCameraImpl implements RenderedCamera {

    private readonly parentElement: HTMLElement;
    private readonly mediaStream: MediaStream;
    private readonly surface: HTMLVideoElement;

    private isClosed: boolean = false;

    private constructor(
        parentElement: HTMLElement,
        surface: HTMLVideoElement,
        mediaStream: MediaStream) {
        this.parentElement = parentElement;
        this.surface = surface;
        this.mediaStream = mediaStream;
    }

    static async create(
        parentElement: HTMLElement,
        mediaStream: MediaStream,
        options: CameraRenderingOptions,
        callbacks: RenderingCallbacks)
        : Promise<RenderedCamera> {
        if (options.aspectRatio) {
            let aspectRatioConstraint = {
                aspectRatio: options.aspectRatio!
            };
            await getFirstTrackOrFail(mediaStream).applyConstraints(
                aspectRatioConstraint);
        }

        const renderingConstraints = options.renderingConstraints;
        const videoSurface = setupVideoSurface(
            mediaStream,
            parentElement.clientWidth,
            parentElement.clientHeight,
            renderingConstraints,
            callbacks);
        parentElement.appendChild(videoSurface);
        
        let renderedCamera = new RenderedCameraImpl(parentElement, videoSurface, mediaStream);
        return renderedCamera;
    }

    private failIfClosed() {
        if (this.isClosed) {
            throw "The RenderedCamera has already been closed.";
        }
    }

    //#region Public APIs.
    public pause(): void {
        this.failIfClosed();
        this.surface.pause();
    }

    public resume(onResumeCallback: () => void): void {
        this.failIfClosed();
        let $this = this;

        const onVideoResume = () => {
            // Transition after 200ms to avoid the previous canvas frame being
            // re-scanned.
            setTimeout(onResumeCallback, 200);
            $this.surface.removeEventListener("playing", onVideoResume);
        };

        this.surface.addEventListener("playing", onVideoResume);
        this.surface.play();
    }

    public isPaused(): boolean {
        this.failIfClosed();
        return this.surface.paused;
    }

    public getSurface(): HTMLVideoElement {
        this.failIfClosed();
        return this.surface;
    }

    public getRunningTrackCapabilities(): MediaTrackCapabilities {
        return getFirstTrackOrFail(this.mediaStream).getCapabilities();
    }

    public getRunningTrackSettings(): MediaTrackSettings {
        return getFirstTrackOrFail(this.mediaStream).getSettings();
    }

    public async applyVideoConstraints(constraints: MediaTrackConstraints)
        : Promise<void> {
        if ("aspectRatio" in constraints) {
            throw "Changing 'aspectRatio' in run-time is not yet supported.";
        }

        return getFirstTrackOrFail(this.mediaStream).applyConstraints(constraints);
    }

    public close(): Promise<void> {
        if (this.isClosed) {
            // Already closed.
            return Promise.resolve();
        }

        let $this = this;
        return new Promise((resolve, _) => {
            let tracks = $this.mediaStream.getVideoTracks();
            const tracksToClose = tracks.length;
            var tracksClosed = 0;
            $this.mediaStream.getVideoTracks().forEach((videoTrack) => {
                $this.mediaStream.removeTrack(videoTrack);
                videoTrack.stop();
                ++tracksClosed;
    
                if (tracksClosed >= tracksToClose) {
                    $this.isClosed = true;
                    $this.parentElement.removeChild($this.surface);
                    resolve();
                }
            });
    
            
        });
    }

    getCapabilities(): CameraCapabilities {
        return new CameraCapabilitiesImpl(getFirstTrackOrFail(this.mediaStream));
    }
    //#endregion
}

/** Default implementation of {@link Camera} interface. */
export class CameraImpl implements Camera {
    private readonly mediaStream: MediaStream;

    private constructor(mediaStream: MediaStream) {
        this.mediaStream = mediaStream;
    }

    async render(
        parentElement: HTMLElement,
        options: CameraRenderingOptions,
        callbacks: RenderingCallbacks)
        : Promise<RenderedCamera> {
        return RenderedCameraImpl.create(
            parentElement, this.mediaStream, options, callbacks);
    }

    static async create(videoConstraints: MediaTrackConstraints)
        : Promise<Camera> {
        if (!navigator.mediaDevices) {
            throw "navigator.mediaDevices not supported";
        }
        let constraints: MediaStreamConstraints = {
            audio: false,
            video: videoConstraints
        };

        let mediaStream = await navigator.mediaDevices.getUserMedia(
            constraints);
        return new CameraImpl(mediaStream);
    }
}
