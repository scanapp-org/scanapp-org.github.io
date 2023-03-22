/**
 * @fileoverview
 * File for file selection UI handling.
 * 
 * @author mebjas <minhazav@gmail.com>
 * 
 * The word "QR Code" is registered trademark of DENSO WAVE INCORPORATED
 * http://www.denso-wave.com/qrcode/faqpatent-e.html
 */

import {Html5QrcodeScannerStrings} from "../../strings";
import { FileScanButton } from "../../file-scan/file-scan-button";
import { OnFileSelected } from "../../file-scan/file-scan-core";

/** UI class for file selection handling. */
export class FileSelectionUi {

    private readonly fileBasedScanRegion: HTMLDivElement;
    private readonly fileScanButton: FileScanButton;

    /** Creates object and renders. */
    private constructor(
        buttonContainer: HTMLDivElement,
        textContainer: HTMLDivElement,
        showOnRender: boolean,
        onFileSelected: OnFileSelected) {
        this.fileBasedScanRegion = this.createFileBasedScanRegion();
        this.fileBasedScanRegion.style.display
            = showOnRender ? "inline-block" : "none";
        buttonContainer.appendChild(this.fileBasedScanRegion);

        this.fileScanButton = FileScanButton.createAndRender(
            this.fileBasedScanRegion, onFileSelected);
            textContainer.appendChild(this.createTextElement());
    }

    private createTextElement(): HTMLDivElement {
        let textElement = document.createElement("div");
        textElement.innerText = Html5QrcodeScannerStrings.orDropAnImageToScan();
        textElement.style.color = "#000000";
        textElement.style.fontWeight = "400";
        textElement.style.fontSize = "16px";
        return textElement;
    }

    //#region Public APIs.
    /** Hide the file selection UI. */
    public hide() {
        this.fileBasedScanRegion.style.display = "none";
        this.fileScanButton.disableInput();
    }

    /** Show the file selection UI. */
    public show() {
        this.fileBasedScanRegion.style.display = "inline-block";
        this.fileScanButton.enableInput();
    }

    /** Returns {@code true} if UI container is displayed. */
    public isShowing(): boolean {
        return this.fileBasedScanRegion.style.display === "inline-block";
    }

    /** Reset the file selection value */
    public resetValue() {
        this.fileScanButton.reset();
    }

    public setImageNameToButton(imageFileName: string) {
        this.fileScanButton.setImageNameToButton(imageFileName);
    }
    //#endregion

    //#region private APIs
    private createFileBasedScanRegion(): HTMLDivElement {
        let fileBasedScanRegion = document.createElement("div");
        fileBasedScanRegion.style.textAlign = "center";
        fileBasedScanRegion.style.margin = "auto";
        return fileBasedScanRegion;
    }
    //#endregion

    /**
     * Creates a file selection UI and renders.
     * 
     * @param parentElement parent div element to render the UI to.
     * @param parentElement top level container for setting up drag and drop UI.
     * @param showOnRender if {@code true}, the UI will be shown upon render
     *  else hidden.
     * @param onFileSelected callback to be called when file selection changes.
     * 
     * @returns Instance of {@code FileSelectionUi}.
     */
    public static create(
        buttonContainer: HTMLDivElement,
        textContainer: HTMLDivElement,
        showOnRender: boolean,
        onFileSelected: OnFileSelected): FileSelectionUi {
        let button = new FileSelectionUi(
            buttonContainer, textContainer, showOnRender, onFileSelected);
        return button;
    }
} 
