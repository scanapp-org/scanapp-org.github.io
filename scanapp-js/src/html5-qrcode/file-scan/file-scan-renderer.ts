/**
 * @fileoverview
 * Component for rendering file based scanning.
 * 
 * @author mebjas <minhazav@gmail.com>
 * 
 * The word "QR Code" is registered trademark of DENSO WAVE INCORPORATED
 * http://www.denso-wave.com/qrcode/faqpatent-e.html
 */

import {
    QrcodeRegionBounds
} from "../core";

export class FileScanRenderer {

    private readonly container: HTMLDivElement;
    private readonly canvasElement: HTMLCanvasElement;
    private readonly context: CanvasRenderingContext2D;

    private containerWidth?: number;
    private containerHeight?: number;

    private zoomLevel = 0;
    private xOffset = 0;
    private yOffset = 0;

    constructor(
        parentWidth: number,
        parentHeight: number) {
        this.container = this.createContainer(parentWidth, parentHeight);
        this.canvasElement = this.createCanvasElement();
        this.context = this.getContext();
        this.container.appendChild(this.canvasElement);
    }

    private createContainer(parentWidth: number, parentHeight: number) {
        const container = document.createElement("div");
        // Height of "Scanner Paused" label is 24px
        const heightOfTopBanner = 40;
        const margin = 15;
        this.containerWidth = parentWidth - 2 * margin;
        this.containerHeight = parentHeight - heightOfTopBanner - margin;
        
        container.style.width = `${this.containerWidth}px`;
        container.style.height = `${this.containerHeight}px`;

        container.style.position = "absolute";
        container.style.top = `${heightOfTopBanner}px`;
        container.style.left = `${margin}px`;
        container.style.background = "white";
        container.style.borderRadius = "10px";
        container.style.border = "1px solid #979797";
        container.appendChild(this.createCloseButton());
        return container;
    }

    private createCloseButton(): HTMLDivElement {
        const closeButton = document.createElement("div");
        closeButton.style.display = "flex";
        closeButton.style.justifyContent = "center";
        closeButton.style.flexDirection = "row";
        closeButton.style.display = "flex";
        closeButton.style.width = "20px";
        closeButton.style.height = "20px";
        closeButton.style.borderRadius = "20px";
        closeButton.style.position = "absolute";
        closeButton.style.top = "5px";
        closeButton.style.right = "5px";
        closeButton.style.background = "#ff9c9c";
        closeButton.style.border = "1px solid black";
        closeButton.style.cursor = "pointer";
        closeButton.innerText = "X";
        closeButton.style.fontWeight = "100";

        closeButton.addEventListener("click", () => {

        });

        closeButton.addEventListener("mouseover", () => {
            closeButton.style.background = "#ff5b5b";
            closeButton.style.fontWeight = "400";

        });

        closeButton.addEventListener("mouseout", () => {
            closeButton.style.background = "#ff9c9c";
            closeButton.style.fontWeight = "100";
        });

        return closeButton;
    }

    private createCanvasElement(): HTMLCanvasElement {
        const canvasWidth = this.getContainerWidth();
        const canvasHeight = this.getContainerHeight();
        const canvasElement = document.createElement("canvas");
        canvasElement.style.width = `${canvasWidth}px`;
        canvasElement.style.height = `${canvasHeight}px`;
        canvasElement.style.display = "inline-block";
        return canvasElement;
    }

    private getContext(): CanvasRenderingContext2D {
        const context = this.canvasElement.getContext("2d");
        if (!context) {
            throw "Unable to get 2d context from canvas";
        }
        context.canvas.width = this.getContainerWidth();
        context.canvas.height = this.getContainerHeight();
        return context!;
    }

    private getContainerWidth() {
        return this.containerWidth!;
    }

    private getContainerHeight() {
        return this.containerHeight!;
    }

    public renderImage(inputImage: HTMLImageElement) {
        this.context.clearRect(0, 0, this.canvasElement.width, this.canvasElement.width);
        const imageWidth = inputImage.width;
        const imageHeight = inputImage.height;
        const config = this.computeCanvasDrawConfig(
            imageWidth,
            imageHeight,
            this.getContainerWidth(),
            this.getContainerHeight());
        // More reference
        // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage
        this.context.drawImage(
            inputImage,
            /* sx= */ 0,
            /* sy= */ 0,
            /* sWidth= */ imageWidth,
            /* sHeight= */ imageHeight,
            /* dx= */ config.x,
            /* dy= */  config.y,
            /* dWidth= */ config.width,
            /* dHeight= */ config.height);
    }

    private computeCanvasDrawConfig(
        imageWidth: number,
        imageHeight: number,
        containerWidth: number,
        containerHeight: number): QrcodeRegionBounds {

        if (imageWidth <= containerWidth
            && imageHeight <= containerHeight) {
            // no downsampling needed.
            const xoffset = (containerWidth - imageWidth) / 2;
            const yoffset = (containerHeight - imageHeight) / 2;
            return {
                x: xoffset,
                y: yoffset,
                width: imageWidth,
                height: imageHeight
            };
        } else {
            const formerImageWidth = imageWidth;
            const formerImageHeight = imageHeight;
            if (imageWidth > containerWidth) {
                imageHeight = (containerWidth / imageWidth) * imageHeight;
                imageWidth = containerWidth;
            }

            if (imageHeight > containerHeight) {
                imageWidth = (containerHeight / imageHeight) * imageWidth;
                imageHeight = containerHeight;
            }

            // this.logger.log(
            //     "Image downsampled from "
            //     + `${formerImageWidth}X${formerImageHeight}`
            //     + ` to ${imageWidth}X${imageHeight}.`);

            return this.computeCanvasDrawConfig(
                imageWidth, imageHeight, containerWidth, containerHeight);
        }
    }
   
    public static createAndRender(parentElement: HTMLElement): FileScanRenderer {
        const containerWidth = parentElement.clientWidth;
        const containerHeight = parentElement.clientHeight;
        const fileScanRenderer = new FileScanRenderer(containerWidth, containerHeight);
        parentElement.appendChild(fileScanRenderer.container);
        return fileScanRenderer;
    }
}
