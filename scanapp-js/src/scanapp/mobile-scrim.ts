/**
 * @fileoverview
 * Global scrim in ScanApp app (Mobile variant).
 * 
 * @author mebjas <minhazav@gmail.com>
 */

type Callback = () => void;

export class MobileScrimController {
    private readonly scrimContainer = document.getElementById("mobile-popup-scrim")! as HTMLDivElement;

    private constructor(onClickCallback: Callback) {
        this.scrimContainer.addEventListener("click", () => {
            onClickCallback();
            this.hide();
        });
    }

    public show() {
        this.scrimContainer.style.display = "block";
    }

    public hide() {
        this.scrimContainer.style.display = "none";
    }

    public static setup(onClickCallback: Callback): MobileScrimController {
        return new MobileScrimController(onClickCallback);
    }
}
