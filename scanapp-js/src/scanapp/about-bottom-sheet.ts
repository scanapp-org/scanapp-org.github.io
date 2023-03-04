/**
 * @fileoverview
 * About section in ScanApp mobile app.
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

export class MobileAboutBottomSheet extends AbstractBottomSheet {
    private constructor(
        scrimController: MobileScrimController,
        onOpenCallback: AbstractBottomSheetCallback,
        onCloseCallback: AbstractBottomSheetCallback) {

        const menuIconElementId = "navbar-menu-icon-menu";
        const bottomSheetContainerElementId = "mobile-about-panel";
        const bottomSheetCloseButtonElementId = "scan-about-close";

        const loggingEvents: LoggingEvents = {
            logMenuButtonOpenClick() {
                Logger.logAboutMenuButtonOpenClick();
            },
            logMenuButtonCloseClick() {
                Logger.logAboutMenuButtonCloseClick();
            },
            logMenuCloseButtonClick() {
                Logger.logAboutBottomSheetButtonCloseClick();
            },
            logCloseFromOutside() {
                Logger.logAboutBottomSheetCloseFromOutside();
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
        return new MobileAboutBottomSheet(scrimController, onOpenCallback, onCloseCallback);
    }
}
