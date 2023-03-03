/**
 * @fileoverview
 * Sponsorship section in ScanApp mobile app.
 * 
 * @author mebjas <minhazav@gmail.com>
 */

import {
    dockMobileNavBar,
    floatMobileNavBar,
    hideAllMobilePopupBanners,
    resetActiveFromAllMobileIcons
} from "./misc";
import { Logger } from "./logger";

type Callback = () => void;

export class MobileSponsorContainer {
    private readonly iconContainer = document.getElementById("navbar-menu-icon-sponsor")! as HTMLDivElement;
    private readonly bannerContainer = document.getElementById("mobile-sponsor-panel")! as HTMLDivElement;
    private readonly bannerCloseButton = document.getElementById("scan-sponsor-close")! as HTMLButtonElement;

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
                dockMobileNavBar();
                
                Logger.logSponsorMenuButtonOpenClick();
                onOpenListener();
            } else {
                this.bannerContainer.classList.remove("expanded");
                this.iconContainer.classList.remove("active");
                floatMobileNavBar();
                
                Logger.logSponsorMenuButtonCloseClick();
                onCloseListener();
            }

            this.isExpanded = !this.isExpanded;
        });

        this.bannerCloseButton.addEventListener("click", () => {
            this.bannerContainer.classList.remove("expanded");
            this.iconContainer.classList.remove("active");

            this.isExpanded = false;
            
            Logger.logSponsorMenuCloseButtonClick();
            onCloseListener();
        });
    }

    public static setup(onOpenListener: Callback, onCloseListener: Callback) {
        new MobileSponsorContainer(onOpenListener, onCloseListener);
    }
}
