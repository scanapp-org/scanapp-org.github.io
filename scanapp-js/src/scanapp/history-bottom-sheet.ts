/**
 * @fileoverview
 * History UI section in ScanApp mobile app.
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

export class MobileHistoryBottomSheet extends AbstractBottomSheet {
    private constructor(
        scrimController: MobileScrimController,
        onOpenCallback: AbstractBottomSheetCallback,
        onCloseCallback: AbstractBottomSheetCallback) {

        const menuIconElementId = "navbar-menu-icon-history";
        const bottomSheetContainerElementId = "mobile-history-panel";
        const bottomSheetCloseButtonElementId = "scan-history-close";

        const loggingEvents: LoggingEvents = {
            logMenuButtonOpenClick() {
                Logger.logHistoryMenuButtonOpenClick();
            },
            logMenuButtonCloseClick() {
                Logger.logHistoryMenuButtonCloseClick();
            },
            logMenuCloseButtonClick() {
                Logger.logHistoryBottomSheetCloseButtonClick();
            },
            logCloseFromOutside() {
                Logger.logHistoryBottomSheetCloseFromOutside();
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
        return new MobileHistoryBottomSheet(scrimController, onOpenCallback, onCloseCallback);
    }
}
