export declare enum Html5QrcodeScannerStatus {
    STATUS_DEFAULT = 0,
    STATUS_SUCCESS = 1,
    STATUS_WARNING = 2,
    STATUS_REQUESTING_PERMISSION = 3
}
export declare class QrcodeScannerHeadderUi {
    private readonly container;
    private readonly messageContainer;
    constructor();
    private createMessageContainer;
    resetMessage(): void;
    setHeaderMessage(messageText: string, scannerStatus?: Html5QrcodeScannerStatus): void;
    static createAndRender(parentContainer: HTMLDivElement): QrcodeScannerHeadderUi;
}
