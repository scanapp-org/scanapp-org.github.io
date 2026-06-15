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
    private isContentInjected = false;

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
            () => {
                if (!this.isContentInjected) {
                    MobileSponsorBottomSheet.injectIframe();
                    this.isContentInjected = true;
                }
                onOpenCallback();
            },
            onCloseCallback);
    }

    public static setup(
        scrimController: MobileScrimController,
        onOpenCallback: AbstractBottomSheetCallback,
        onCloseCallback: AbstractBottomSheetCallback): HidableUiComponent {
        return new MobileSponsorBottomSheet(scrimController, onOpenCallback, onCloseCallback);
    }

    private static injectIframe() {
        const container = document.getElementById("mobile-sponsor-panel-body")! as HTMLDivElement;

        const tryPushAd = () => {
            if (container.offsetWidth > 0) {
                container.innerHTML = "";

                const ins = document.createElement("ins");
                ins.className = "adsbygoogle";
                ins.style.display = "block";
                ins.setAttribute("data-ad-client", "ca-pub-1311871960161162");
                ins.setAttribute("data-ad-slot", "8739501923");
                ins.setAttribute("data-ad-format", "auto");
                ins.setAttribute("data-full-width-responsive", "true");
                container.appendChild(ins);

                const script2 = document.createElement("script");
                script2.innerHTML = "setTimeout(function() { (window.adsbygoogle = window.adsbygoogle || []).push({}); }, 100);";
                container.appendChild(script2);
            } else {
                setTimeout(tryPushAd, 200);
            }
        };
        setTimeout(tryPushAd, 50);
    }
}
