/**
 * @fileoverview
 * Sponsorship section in ScanApp mobile app.
 * 
 * @author mebjas <minhazav@gmail.com>
 */

import {
    AbstractBottomSheet,
    AbstractBottomSheetCallback,
    LoggingEvents,
} from "./abstract-bottom-sheet";
import { HidableUiComponent } from "./core";
import { Logger } from "./logger";
import { MobileScrimController } from "./mobile-scrim";

export class MobileSponsorBottomSheet extends AbstractBottomSheet {
    private constructor(
        scrimController: MobileScrimController,
        onOpenCallback: AbstractBottomSheetCallback,
        onCloseCallback: AbstractBottomSheetCallback) {
        const menuIconElementId = "navbar-menu-icon-sponsor";
        const bottomSheetContainerElementId = "mobile-sponsor-panel";
        const bottomSheetCloseButtonElementId = "scan-sponsor-close";

        const loggingEvents: LoggingEvents = {
            logMenuButtonOpenClick() {
                Logger.logSponsorMenuButtonOpenClick();
            },
            logMenuButtonCloseClick() {
                Logger.logSponsorMenuButtonCloseClick();
            },
            logMenuCloseButtonClick() {
                Logger.logSponsorBottomSheetCloseButtonClick();
            },
            logCloseFromOutside() {
                Logger.logSponsorBottomSheetCloseFromOutside();
            }
        };

        super(menuIconElementId,
            bottomSheetContainerElementId,
            bottomSheetCloseButtonElementId,
            scrimController,
            loggingEvents,
            onOpenCallback,
            onCloseCallback);
    }

    public static setup(
        scrimController: MobileScrimController,
        onOpenCallback: AbstractBottomSheetCallback,
        onCloseCallback: AbstractBottomSheetCallback): HidableUiComponent {
        return new MobileSponsorBottomSheet(scrimController, onOpenCallback, onCloseCallback);
    }

    public static injectIframe() {
        const container = document.getElementById("mobile-sponsor-panel-body")! as HTMLDivElement;
        let iframe = document.createElement("iframe");
        iframe.id = "kofiframe";
        container.appendChild(iframe);

        iframe.src = "https://ko-fi.com/minhazav/?hidefeed=true&widget=true&embed=true&preview=true";
        iframe.style.border = "none";
        iframe.style.width = "100%";
        iframe.style.background = "#f9f9f9";
        iframe.style.marginTop = "10px";

        iframe.height = "712";
        iframe.title = "Ko-fi minhaz";
    }
}
