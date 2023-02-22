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
}