/**
 * @fileoverview
 * About section in ScanApp mobile app.
 * 
 * @author mebjas <minhazav@gmail.com>
 */

import {
    hideAllMobilePopupBanners,
    resetActiveFromAllMobileIcons
} from "./misc";
import { Logger } from "./logger";

type Callback = () => void;

export class MobileAboutContainer {
    private readonly iconContainer = document.getElementById("navbar-menu-icon-menu")! as HTMLDivElement;
    private readonly bannerContainer = document.getElementById("mobile-about-panel")! as HTMLDivElement;
    private readonly bannerCloseButton = document.getElementById("scan-about-close")! as HTMLButtonElement;

    private isExpanded = false;

    private constructor(
        onOpenListener: Callback,
        onCloseListener: Callback) {
        this.iconContainer.addEventListener("click", () => {
            if (this.bannerContainer.classList.contains("expanded")) {
                this.isExpanded = true;
            } else {
                this.isExpanded = false;
            }

            if (!this.isExpanded) {
                // expand the banner.
                hideAllMobilePopupBanners();
                resetActiveFromAllMobileIcons();
                this.bannerContainer.classList.add("expanded");
                this.iconContainer.classList.add("active");
                
                Logger.logAboutMenuButtonOpenClick();
                onOpenListener();
            } else {
                this.bannerContainer.classList.remove("expanded");
                this.iconContainer.classList.remove("active");
                
                Logger.logAboutMenuButtonCloseClick();
                onCloseListener();
            }

            this.isExpanded = !this.isExpanded;
        });

        this.bannerCloseButton.addEventListener("click", () => {
            this.bannerContainer.classList.remove("expanded");
            this.iconContainer.classList.remove("active");

            this.isExpanded = false;
            
            Logger.logAboutMenuCloseButtonClick();
            onCloseListener();
        });
    }

    public static setup(onOpenListener: Callback, onCloseListener: Callback) {
        new MobileAboutContainer(onOpenListener, onCloseListener);
    }
}
