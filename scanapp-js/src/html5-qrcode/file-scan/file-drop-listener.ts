/**
 * @fileoverview
 * Drag and drop listener for file based selection.
 * 
 * @author mebjas <minhazav@gmail.com>
 * 
 * The word "QR Code" is registered trademark of DENSO WAVE INCORPORATED
 * http://www.denso-wave.com/qrcode/faqpatent-e.html
 */

import { Html5QrcodeScannerStrings } from "../strings";
import { OnFileSelected } from "./file-scan-core";

/** UI class for handling image file drag and drop. */
export class FileDropListenerUi {

    private readonly onFileSelectedCallback: OnFileSelected;
    private readonly fileDropRegion: HTMLDivElement;

    private constructor(onFileSelectedCallback: OnFileSelected) {
        this.onFileSelectedCallback = onFileSelectedCallback;
        this.fileDropRegion = this.createFileDropRegion();
    }

    private setupDragAndDropListeners(parentElement: HTMLDivElement) {
        let counter = 0;

        parentElement.addEventListener("dragenter", (event) => {
            counter++;
            this.showDropRegion();
            event.stopPropagation();
            event.preventDefault();
        });

        parentElement.addEventListener("dragleave", (event) => {
            counter--;
            if (counter == 0) {
                this.hideDropRegion();
            }
            event.stopPropagation();
            event.preventDefault();
        });

        parentElement.addEventListener("dragover", (event) => {
            this.showDropRegion();
            event.stopPropagation();
            event.preventDefault();
        });

        /*eslint complexity: ["error", 10]*/
        parentElement.addEventListener("drop", (event) => {
            counter = 0;
            event.stopPropagation();
            event.preventDefault();

            this.hideDropRegion();

            var dataTransfer = event.dataTransfer;
            if (dataTransfer) {
                let files = dataTransfer.files;
                if (!files || files.length === 0) {
                    return;
                }
                let isAnyFileImage = false;
                for (let i = 0; i < files.length; ++i) {
                    let file = files.item(i);
                    if (!file) {
                        continue;
                    }
                    let imageType = /image.*/;

                    // Only process images.
                    if (!file.type.match(imageType)) {
                        continue;
                    }

                    isAnyFileImage = true;
                    this.onFileSelectedCallback(file);
                    this.fileDropRegion.innerText
                        = Html5QrcodeScannerStrings.dragAndDropMessage();
                    break;
                }
                
                // None of the files were images.
                if (!isAnyFileImage) {
                    this.fileDropRegion.innerText
                        = Html5QrcodeScannerStrings.dragAndDropMessageOnlyImages();
                }
            }

        });
    }

    private showDropRegion() {
        this.fileDropRegion.style.display = "flex";
    }

    private hideDropRegion() {
        this.fileDropRegion.style.display = "none";
    }

    private createFileDropRegion(): HTMLDivElement {
        let fileDropRegion = document.createElement("div");
        fileDropRegion.innerText
            = Html5QrcodeScannerStrings.dragAndDropMessage();

        fileDropRegion.setAttribute("element-type", "drag-and-drop-region");
        fileDropRegion.style.width = "100%";
        fileDropRegion.style.height = "100%";

        fileDropRegion.style.position = "absolute";
        fileDropRegion.style.top = "0px";
        fileDropRegion.style.left = "0px";

        fileDropRegion.style.color = "white";
        fileDropRegion.style.fontWeight = "400";
        fileDropRegion.style.fontSize = "20pt";

        fileDropRegion.style.background = "black";
        fileDropRegion.style.opacity = "0.8";
        
        fileDropRegion.style.justifyContent = "center";
        fileDropRegion.style.flexDirection = "column";
        fileDropRegion.style.textAlign = "center";
        fileDropRegion.style.display = "none";
        return fileDropRegion;
    }

    public static createAndRender(
        parentElement: HTMLDivElement,
        onFileSelectedCallback: OnFileSelected): FileDropListenerUi {
        let fileDropListenerUi = new FileDropListenerUi(onFileSelectedCallback);
        parentElement.appendChild(fileDropListenerUi.fileDropRegion);
        fileDropListenerUi.setupDragAndDropListeners(parentElement);
        return fileDropListenerUi;
    }
}
