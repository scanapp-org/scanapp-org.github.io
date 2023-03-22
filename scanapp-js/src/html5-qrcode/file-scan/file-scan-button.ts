/**
 * @fileoverview
 * Button for file selection.
 * 
 * @author mebjas <minhazav@gmail.com>
 * 
 * The word "QR Code" is registered trademark of DENSO WAVE INCORPORATED
 * http://www.denso-wave.com/qrcode/faqpatent-e.html
 */

import {Html5QrcodeScannerStrings} from "../strings";
import {
    BaseUiElementFactory,
    PublicUiElementIdAndClasses
} from "../ui/scanner/base";
import { OnFileSelected } from "./file-scan-core";

/** Button element for file based scanning. */
export class FileScanButton {

    private readonly onFileSelectedCallback: OnFileSelected;

    private readonly container: HTMLDivElement;
    private readonly labelElement: HTMLLabelElement;
    private readonly buttonElement: HTMLButtonElement;
    private readonly fileScanInput: HTMLInputElement;
    
    private constructor(onFileSelectedCallback: OnFileSelected) {
        this.onFileSelectedCallback = onFileSelectedCallback;

        this.container = this.createContainer();

        this.labelElement = this.createFileScanLabel();
        this.container.appendChild(this.labelElement);

        this.buttonElement = this.createButton(() => {
            this.labelElement.click();
        });
        this.setInitialButtonValue();
        this.labelElement.appendChild(this.buttonElement);

        this.fileScanInput = this.createHiddenFileInputElement();
        this.labelElement.appendChild(this.fileScanInput);
    }

    private createContainer() {
        let container = document.createElement("div");
        container.style.display = "inline-block";
        return container;
    }

    private createButton(onClickCallback: () => void): HTMLButtonElement {
        let button = BaseUiElementFactory.createElement<HTMLButtonElement>(
            "button",
            PublicUiElementIdAndClasses.FILE_SELECTION_BUTTON_ID);
        button.addEventListener("click", (_) => {
            onClickCallback();
        });    
        return button;
    }

    private createFileScanLabel(): HTMLLabelElement {
        let fileScanLabel = document.createElement("label");
        fileScanLabel.setAttribute("for", this.getFileScanInputId());
        fileScanLabel.style.display = "inline-block";
        return fileScanLabel;
    }

    private createHiddenFileInputElement(): HTMLInputElement {
        let inputFileElement
            = BaseUiElementFactory.createElement<HTMLInputElement>(
                "input", this.getFileScanInputId());
        inputFileElement.type = "file";
        inputFileElement.accept = "image/*";
        inputFileElement.style.display = "none";

         /*eslint complexity: ["error", 5]*/
         inputFileElement.addEventListener("change", (e: Event) => {
            if (e == null || e.target == null) {
                return;
            }
            let target: HTMLInputElement = e.target as HTMLInputElement;
            if (target.files && target.files.length === 0) {
                return;
            }
            let fileList: FileList = target.files!;
            const file: File = fileList[0];
            let fileName = file.name;
            this.setImageNameToButton(fileName);
            this.onFileSelectedCallback(file);
        });

        return inputFileElement;
    }

    private getFileScanInputId(): string {
        return "html5-qrcode-private-filescan-input";
    }

    public reset() {
        this.fileScanInput.value = "";
        this.setInitialButtonValue();
    }

    public setImageNameToButton(imageFileName: string) {
        const MAX_CHARS = 20;
        if (imageFileName.length > MAX_CHARS) {
            // Strip first 8
            // Strip last 8
            // Add 4 dots
            let start8Chars = imageFileName.substring(0, 8);
            let length = imageFileName.length;
            let last8Chars = imageFileName.substring(length - 8, length);
            imageFileName = `${start8Chars}....${last8Chars}`;
        }

        let newText = Html5QrcodeScannerStrings.fileSelectionChooseAnother()
            + " - "
            + imageFileName;
        this.buttonElement.innerText = newText;
    }

    private setInitialButtonValue() {
        // TODO: Add image.
        this.buttonElement.innerText = Html5QrcodeScannerStrings.fileSelectionChooseImage();
    }
    
    public disableInput() {
        this.fileScanInput.disabled = true;
    }

    public enableInput() {
        this.fileScanInput.disabled = false;
    }

    public static createAndRender(
        parentContainer: HTMLDivElement,
        onFileSelectedCallback: OnFileSelected): FileScanButton {
        let fileScanButton = new FileScanButton(onFileSelectedCallback);
        parentContainer.appendChild(fileScanButton.container);
        return fileScanButton;
    }
}
