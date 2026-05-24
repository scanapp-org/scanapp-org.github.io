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

    public static getDisplayMode(): string {
        if (window.matchMedia('(display-mode: standalone)').matches
            || (navigator as any).standalone === true) {
            return 'PWA_standalone';
        }
        return 'Browser_tab';
    }

    public static logDisplayMode(displayMode: string) {
        gtag("event", `DisplayMode_${displayMode}`, {});
    }

    private static logA2hsEvent(eventName: string, source?: string, extraParams: {[key: string]: string} = {}) {
        if (typeof gtag !== 'function') {
            return;
        }

        gtag("event", eventName, {
            'event_category': 'PWA',
            'event_label': source || 'unknown',
            'display_mode': Logger.getDisplayMode(),
            'source': source || 'unknown',
            ...extraParams,
        });
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

    public static logA2hsBrowserPromptShown(source?: string) {
        Logger.logA2hsEvent("A2hs-browser-prompt-shown", source);
    }

    public static logA2hsDone(source?: string) {
        Logger.logA2hsEvent("A2hs-done", source);
    }

    public static logA2hsBrowserPromptCancelled(source?: string) {
        Logger.logA2hsEvent("A2hs-browser-prompt-cancelled", source);
    }

    public static logA2hsBeforeInstallPromptCaptured(source?: string) {
        Logger.logA2hsEvent("A2hs-beforeinstallprompt-captured", source);
    }

    public static logA2hsPromptSkipped(reason: string, source?: string) {
        Logger.logA2hsEvent("A2hs-prompt-skipped", source, {
            'reason': reason,
        });
    }

    public static logA2hsInstallBannerShown(source?: string) {
        Logger.logA2hsEvent("A2hs-install-banner-shown", source);
    }

    public static logA2hsInstallBannerClicked(source?: string) {
        Logger.logA2hsEvent("A2hs-install-banner-clicked", source);
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

    private static logBetaEvent(eventName: string, label?: string) {
        if (typeof gtag === 'function') {
            const eventParams: {[key: string]: string} = {
                'event_category': 'BetaUi',
            };
            if (label) {
                eventParams['event_label'] = label;
            }
            gtag('event', eventName, eventParams);
        }
    }

    public static logBetaTorchToggle(isOn: boolean) {
        Logger.logBetaEvent('Beta_Torch_Toggle', isOn ? 'on' : 'off');
    }

    public static logBetaViewfinderModeToggle(mode: string) {
        Logger.logBetaEvent('Beta_ViewfinderMode_Toggle', mode);
    }

    public static logBetaCameraPopover(action: string) {
        Logger.logBetaEvent('Beta_CameraPopover', action);
    }

    public static logBetaCameraSwitch(outcome: string) {
        Logger.logBetaEvent('Beta_CameraSwitch', outcome);
    }

    public static logBetaFilePickerOpen(source: string) {
        Logger.logBetaEvent('Beta_FilePicker_Open', source);
    }

    public static logBetaDragDropOverlayShown() {
        Logger.logBetaEvent('Beta_DragDrop_OverlayShown');
    }

    public static logBetaDragDropFileDropped(source: string) {
        Logger.logBetaEvent('Beta_DragDrop_FileDropped', source);
    }

    public static logBetaThemeChange(themeId: string) {
        Logger.logBetaEvent('Beta_Theme_Change', themeId);
    }

    public static logBetaSupportPanelOpen(source: string) {
        Logger.logBetaEvent('Beta_SupportPanel_Open', source);
    }

    public static logBetaSupportPanelClose() {
        Logger.logBetaEvent('Beta_SupportPanel_Close');
    }

    public static logBetaResultPanelCollapsedTabOpen(hasResult: boolean) {
        Logger.logBetaEvent(
            'Beta_ResultPanel_CollapsedTabOpen',
            hasResult ? 'with_result' : 'empty');
    }

    public static logBetaKoFiSupportClick(source: string) {
        Logger.logBetaEvent('Beta_KoFiSupport_Click', source);
    }

    public static logUpgradeBannerClick() {
        if (typeof gtag === 'function') {
            gtag('event', 'UpgradeBanner_Click', {});
        }
    }
}
