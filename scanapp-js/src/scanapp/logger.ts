/**
 * @fileoverview
 * Logger class for ScanApp.
 * 
 * @author mebjas <minhazav@gmail.com>
 */

declare let gtag: Function;

type RunnableCallback = () => void;

export class Logger {
    public static logScanStart (isEmbeddedInIframe: boolean, scanType: string)  {
        gtag('event', 'ScanStart', {
            'event_category': scanType,
            'event_label': `embed=${isEmbeddedInIframe}`,
        });
    }

    public static logScanRestart() {
        gtag('event', 'ScanStart', {
            'event_category': 'Restart',
            'event_label': 'NA',
        });

        gtag('event', 'ScanRestart', {
            'event_category': 'Restart',
            'event_label': 'NA',
        });
    }

    public static logScanSuccess(scanType: string, codeType: string) {
        gtag('event', 'ScanSuccess', {
            'event_category': scanType,
            'event_label': codeType,
        });

        // TODO(minhazav): Remove this if the custom events in gtag can handle
        // this.
        var scanTypeEvent = `ScanSuccess_${scanType}`;
        gtag('event', scanTypeEvent, {
            'event_category': 'codeType',
            'event_label': 'NA',
        });
    }

    public static logActionCopy() {
        gtag('event', 'Action-Copy', {});
    }

    public static logActionShare() {
        gtag('event', 'Action-Share', {});
        gtag('event', 'share', {});
    }

    public static logActionDownload() {
        gtag('event', 'Action-Download', {});
    }

    public static logPaymentAction() {
        gtag('event', 'Action-Payment', {});
    }

    public static logUrlAction(callback: RunnableCallback) {
        gtag('event', 'Action-Url', {
            'event_callback': function() {
                callback();
            }
        });
    }

    public static logAntiEmbedWindowShown() {
        gtag('event', 'Anti-Embed-Window', {});
    }

    public static logAntiEmbedActionNavigateToScanApp(callback: RunnableCallback) {
        gtag('event', 'Anti-Embed-Action', {
            'event_category': 'NavigateToScanapp',
            'event_callback': function() {
                callback();
            }
        });
    }

    public static logAntiEmbedActionContinueHere(callback: RunnableCallback) {
        gtag('event', 'Anti-Embed-Action', {
            'event_category': 'Continue',
            'event_callback': function() {
                callback();
            }
        });
    }

    public static logDisplayMode(displayMode: string) {
        gtag("event", `DisplayMode_${displayMode}`, {});
    }

    public static logA2hsPopupShown() {
        gtag("event", "A2hs-popup-shown", {});
    }

    public static logA2hsAddButtonClicked(isShowNeverCheckboxChecked: boolean) {
        gtag("event", "A2hs-add-button-clicked", {
            'event_label': isShowNeverCheckboxChecked === true
                ? "true" : "false"
        });
    }

    public static logA2hsCancelButtonClicked(isShowNeverCheckboxChecked: boolean) {
        gtag("event", "A2hs-cancel-button-clicked", {
            'event_label': isShowNeverCheckboxChecked === true
                ? "true" : "false"
        });
    }

    public static logA2hsBrowserPromptShown() {
        gtag("event", "A2hs-browser-prompt-shown", {});
    }

    public static logA2hsDone() {
        gtag("event", "A2hs-done", {});
    }

    public static logA2hsBrowserPromptCancelled() {
        gtag("event", "A2hs-browser-prompt-cancelled", {});
    }

    public static logFtpBacklinkClick(callback: RunnableCallback) {
        gtag('event', 'Ftp-Backlink-Action', {
            'event_callback': function() {
                callback();
            }
        });
    } 

    public static logAboutMenuButtonOpenClick() {
        gtag('event', 'MobileNavBar_AboutButton_OpenClick', {});
    }

    public static logAboutMenuButtonCloseClick() {
        gtag('event', 'MobileNavBar_AboutButton_CloseClick', {});
    }

    public static logAboutBottomSheetButtonCloseClick() {
        gtag('event', 'MobileNavBar_AboutBottomSheet_CloseButtonClick', {});
    }

    public static logAboutBottomSheetCloseFromOutside() {
        gtag('event', 'MobileNavBar_AboutuBottomSheet_CloseFromOutside', {});
    }

    public static logHistoryMenuButtonOpenClick() {
        gtag('event', 'MobileNavBar_HistoryButton_OpenClick', {});
    }

    public static logHistoryMenuButtonCloseClick() {
        gtag('event', 'MobileNavBar_HistoryButton_CloseClick', {});
    }

    public static logHistoryBottomSheetCloseButtonClick() {
        gtag('event', 'MobileNavBar_HistoryBottomSheet_CloseButtonClick', {});
    }

    public static logHistoryBottomSheetCloseFromOutside() {
        gtag('event', 'MobileNavBar_HistoryBottomSheet_CloseFromOutside', {});
    }

    public static logSponsorMenuButtonOpenClick() {
        gtag('event', 'MobileNavBar_SponsorButton_OpenClick', {});
    }

    public static logSponsorMenuButtonCloseClick() {
        gtag('event', 'MobileNavBar_SponsorButton_CloseClick', {});
    }

    public static logSponsorBottomSheetCloseButtonClick() {
        gtag('event', 'MobileNavBar_SponsorBottomSheet_CloseButtonClick', {});
    }

    public static logSponsorBottomSheetCloseFromOutside() {
        gtag('event', 'MobileNavBar_SponsorBottomSheet_CloseFromOutside', {});
    }

    public static logUrlQuickActionClick() {
        gtag('event', 'QuickAction_Url_Click', {});
    }
}
