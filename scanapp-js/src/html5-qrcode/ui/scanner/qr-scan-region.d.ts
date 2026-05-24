export declare class QrScanRegion {
    private readonly ELEMENT_ID;
    private readonly topLevelElementId;
    private readonly container;
    constructor(topLevelElementId: string);
    private createScanRegion;
    elementId(): string;
    static createAndRender(topLevelElementId: string, parentContainer: HTMLDivElement): QrScanRegion;
}
