/**
 * @fileoverview
 * QR Scan Region for {@link Html5QrcodeScanner}.
 * 
 * @author mebjas <minhazav@gmail.com>
 * 
 * The word "QR Code" is registered trademark of DENSO WAVE INCORPORATED
 * http://www.denso-wave.com/qrcode/faqpatent-e.html
 */

export class QrScanRegion {

    private readonly ELEMENT_ID = "scan-region-id";

    private readonly topLevelElementId: string;
    private readonly container: HTMLDivElement;

    constructor(topLevelElementId: string) {
        this.topLevelElementId = topLevelElementId;
        this.container = this.createScanRegion();
    }

    private createScanRegion(): HTMLDivElement {
        const qrCodeScanRegion = document.createElement("div");
        qrCodeScanRegion.id = this.elementId();
        qrCodeScanRegion.style.textAlign = "center";
        qrCodeScanRegion.style.display = "flex";
        qrCodeScanRegion.style.justifyContent = "center";
        qrCodeScanRegion.style.flexDirection = "row";
        return qrCodeScanRegion;
    }

    // TODO: Migrate away from element ID.
    public elementId(): string {
        return `${this.topLevelElementId}_${this.ELEMENT_ID}`;
    }

    public static createAndRender(
        topLevelElementId: string,
        parentContainer: HTMLDivElement): QrScanRegion {
        let parentContainerWidth = Math.floor(parentContainer.clientWidth);
        let parentContainerHeight = Math.floor(parentContainer.clientHeight);
        let qrScanRegion = new QrScanRegion(topLevelElementId);
        parentContainer.appendChild(qrScanRegion.container);

        qrScanRegion.container.style.width = `${parentContainerWidth}px`;
        qrScanRegion.container.style.height = `${parentContainerHeight}px`;

        return qrScanRegion;
    }
}