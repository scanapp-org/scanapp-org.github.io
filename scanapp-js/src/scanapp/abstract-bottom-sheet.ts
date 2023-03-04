/**
 * @fileoverview
 * Abstract bottom sheet component.
 * 
 * @author mebjas <minhazav@gmail.com>
 */

import { HidableUiComponent } from "./core";
import {
    dockMobileNavBar,
    floatMobileNavBar,
    hideAllMobilePopupBanners,
    resetActiveFromAllMobileIcons
} from "./misc";
import { MobileScrimController } from "./mobile-scrim";

export interface LoggingEvents {
    logMenuButtonOpenClick(): void;
    logMenuButtonCloseClick(): void;
    logMenuCloseButtonClick(): void;
    logCloseFromOutside(): void;
}

export type AbstractBottomSheetCallback = () => void;

export abstract class AbstractBottomSheet implements HidableUiComponent {
    private readonly menuIcon: HTMLDivElement;
    private readonly bottomSheetContainer: HTMLDivElement;
    private readonly loggingEvents: LoggingEvents;

    private isExpanded = false;

    protected constructor(
        menuIconElementId: string,
        bottomSheetContainerElementId: string,
        bottomSheetCloseButtonElementId: string,
        scrimController: MobileScrimController,
        loggingEvents: LoggingEvents,
        onOpenCallback: AbstractBottomSheetCallback,
        onCloseCallback: AbstractBottomSheetCallback) {
        this.menuIcon = document.getElementById(menuIconElementId)! as HTMLDivElement;
        this.bottomSheetContainer = document.getElementById(bottomSheetContainerElementId)! as HTMLDivElement;
        this.loggingEvents = loggingEvents;
        
        const bottomSheetCloseButton = document.getElementById(bottomSheetCloseButtonElementId)! as HTMLButtonElement;

        this.menuIcon.addEventListener("click", () => {
            if (this.bottomSheetContainer.classList.contains("expanded")) {
                this.isExpanded = true;
            } else {
                this.isExpanded = false;
            }

            if (!this.isExpanded) {
                // expand the banner.
                hideAllMobilePopupBanners();
                resetActiveFromAllMobileIcons();

                scrimController.show();
                this.bottomSheetContainer.classList.add("expanded");
                this.menuIcon.classList.add("active");
                dockMobileNavBar();
                loggingEvents.logMenuButtonOpenClick();
                onOpenCallback();
            } else {
                scrimController.hide();
                loggingEvents.logMenuButtonCloseClick();
                this.hide();
                onCloseCallback();
            }

            this.isExpanded = !this.isExpanded;
        });

        bottomSheetCloseButton.addEventListener("click", () => {
            scrimController.hide();
            this.bottomSheetContainer.classList.remove("expanded");
            this.menuIcon.classList.remove("active");
            this.isExpanded = false;
            loggingEvents.logMenuCloseButtonClick();
            onCloseCallback();
        });
    }

    public hide(): void {
        this.bottomSheetContainer.classList.remove("expanded");
        this.menuIcon.classList.remove("active");
        floatMobileNavBar();
        this.loggingEvents.logCloseFromOutside();
    }
}
