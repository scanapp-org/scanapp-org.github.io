/**
 * @fileoverview
 * Header for {@link Html5QrcodeScanner}.
 * 
 * @author mebjas <minhazav@gmail.com>
 * 
 * The word "QR Code" is registered trademark of DENSO WAVE INCORPORATED
 * http://www.denso-wave.com/qrcode/faqpatent-e.html
 */

/**
 * Different states of QR Code Scanner.
 */
export enum Html5QrcodeScannerStatus {
    STATUS_DEFAULT = 0,
    STATUS_SUCCESS = 1,
    STATUS_WARNING = 2,
    STATUS_REQUESTING_PERMISSION = 3,
}

// TODO(minhazav): Support localisation.
export class QrcodeScannerHeadderUi {

    private readonly container: HTMLDivElement;
    private readonly messageContainer: HTMLDivElement;

    constructor() {
        this.container = document.createElement("div");
        this.messageContainer = this.createMessageContainer();

        this.container.appendChild(this.messageContainer);
    }

    private createMessageContainer(): HTMLDivElement {
        const headerMessageContainer = document.createElement("div");
        headerMessageContainer.style.display = "none";
        headerMessageContainer.style.textAlign = "center";
        headerMessageContainer.style.fontSize = "14px";
        headerMessageContainer.style.padding = "2px 10px";
        headerMessageContainer.style.margin = "4px";
        headerMessageContainer.style.borderTop = "1px solid #f6f6f6";
        return headerMessageContainer;
    }

    public resetMessage() {
        this.messageContainer.style.display = "none";
    }

    public setHeaderMessage(messageText: string, scannerStatus?: Html5QrcodeScannerStatus) {
        if (!scannerStatus) {
            scannerStatus = Html5QrcodeScannerStatus.STATUS_DEFAULT;
        }

        this.messageContainer.innerText = messageText;
        this.messageContainer.style.display = "block";

        switch (scannerStatus) {
            case Html5QrcodeScannerStatus.STATUS_SUCCESS:
                this.messageContainer.style.background = "rgba(106, 175, 80, 0.26)";
                this.messageContainer.style.color = "#477735";
                break;
            case Html5QrcodeScannerStatus.STATUS_WARNING:
                this.messageContainer.style.background = "rgba(203, 36, 49, 0.14)";
                this.messageContainer.style.color = "#cb2431";
                break;
            case Html5QrcodeScannerStatus.STATUS_DEFAULT:
            default:
                this.messageContainer.style.background = "rgba(0, 0, 0, 0)";
                this.messageContainer.style.color = "rgb(17, 17, 17)";
                break;
        }
    }

    public static createAndRender(parentContainer: HTMLDivElement): QrcodeScannerHeadderUi {
        let headerUi = new QrcodeScannerHeadderUi();
        parentContainer.appendChild(headerUi.container);

        return headerUi;
    }
}