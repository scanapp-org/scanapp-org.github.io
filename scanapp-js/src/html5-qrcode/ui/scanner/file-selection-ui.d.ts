import { OnFileSelected } from "../../file-scan/file-scan-core";
export declare class FileSelectionUi {
    private readonly fileBasedScanRegion;
    private readonly fileScanButton;
    private constructor();
    private createTextElement;
    hide(): void;
    show(): void;
    isShowing(): boolean;
    resetValue(): void;
    setImageNameToButton(imageFileName: string): void;
    private createFileBasedScanRegion;
    static create(buttonContainer: HTMLDivElement, textContainer: HTMLDivElement, showOnRender: boolean, onFileSelected: OnFileSelected): FileSelectionUi;
}
