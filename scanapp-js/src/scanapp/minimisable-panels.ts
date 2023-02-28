/**
 * @fileoverview
 * Result viewer in ScanApp app.
 * 
 * @author mebjas <minhazav@gmail.com>
 */

export class MinimisablePanels {

    private readonly expandLessImageSrc: string = "./assets/images/icons/expand_less.svg";
    private readonly expandLessAltString: string = "Minimize";
    private readonly expandMoreImageSrc: string = "./assets/images/icons/expand_more.svg";
    private readonly expandMoreAltString: string = "Expand";

    private readonly minimizeActionElement: HTMLDivElement;
    private readonly minimizeActionImage: HTMLImageElement;
    private readonly panelBody: HTMLDivElement;

    private isMinimised: boolean = false;

    constructor(minimizeActionElement: HTMLDivElement, panelBody: HTMLDivElement) {
        this.minimizeActionElement = minimizeActionElement;
        this.panelBody = panelBody;
        this.minimizeActionImage = minimizeActionElement.getElementsByTagName("img")[0];

        this.isMinimised = panelBody.style.display === "none";
    }

    public setup() {
        let $this = this;
        this.minimizeActionElement.addEventListener("click", () => {
            const currentState = $this.isMinimised;
            // TODO: Add slideup animation.
            if (currentState) {
                // minimized --> show;
                $this.panelBody.style.display = "block";
                $this.minimizeActionImage.src = $this.expandLessImageSrc;
                $this.minimizeActionImage.alt = $this.expandLessAltString;
            } else {
                // show --> minimize
                $this.panelBody.style.display = "none";
                $this.minimizeActionImage.src = $this.expandMoreImageSrc;
                $this.minimizeActionImage.alt = $this.expandMoreAltString; 
            }

            $this.isMinimised = !currentState;
        });
    }
}
