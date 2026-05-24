/**
 * @fileoverview
 * PWA for ScanApp.
 * 
 * @author mebjas <minhazav@gmail.com>
 */

import { Logger } from "./logger";

const A2HS_SUPPORTED = true;
export const PWA_ENABLED = true;

class PwaHistoryManager {
    private readonly doNotShowKey = "PWA-DO-NOT-SHOW-RPOMPT";
    private readonly doNotShowValue = "true";

    private doNotShowPwaPrompt: boolean;

    public constructor() {
        this.doNotShowPwaPrompt = localStorage.getItem(this.doNotShowKey) === this.doNotShowValue;
    }

    public setNeverShowPrompt() {
        localStorage.setItem(this.doNotShowKey, this.doNotShowValue);
        this.doNotShowPwaPrompt = true;
    }

    public shouldShowPrompt(): boolean {
        return !this.doNotShowPwaPrompt;
    }
}

export class PwaPromptManager {
    private readonly pwaHistoryManager = new PwaHistoryManager();
    
    private deferredPrompt?: any; // TODO: Add strong typing.
    private countShownInSession = 0;
    private readonly skippedReasonsLogged = new Set<string>();
    private readonly promptAvailableCallbacks: Array<() => void> = [];

    public constructor(private readonly defaultSource: string = "legacy_result_close") {
        window.addEventListener('beforeinstallprompt', (event) => {
            // Prevent Chrome 67 and earlier from automatically showing the prompt
            event.preventDefault();
            this.deferredPrompt = event;
            Logger.logA2hsBeforeInstallPromptCaptured(this.defaultSource);
            this.promptAvailableCallbacks.forEach(callback => callback());
            console.log("Deferred installation prompt.");
        });
    }

    public onPromptAvailable(callback: () => void) {
        this.promptAvailableCallbacks.push(callback);
    }

    public canShowPrompt(): boolean {
        return A2HS_SUPPORTED
            && Logger.getDisplayMode() !== "PWA_standalone"
            && this.countShownInSession === 0
            && !!this.deferredPrompt
            && this.pwaHistoryManager.shouldShowPrompt();
    }

    public logInstallBannerShown(source: string = this.defaultSource) {
        Logger.logA2hsInstallBannerShown(source);
    }

    public logInstallBannerClicked(source: string = this.defaultSource) {
        Logger.logA2hsInstallBannerClicked(source);
    }

    private logPromptSkippedOnce(reason: string, source: string) {
        const key = `${source}:${reason}`;
        if (this.skippedReasonsLogged.has(key)) {
            return;
        }
        this.skippedReasonsLogged.add(key);
        Logger.logA2hsPromptSkipped(reason, source);
    }

    private showPWAInstallPrompt(source: string) {
        if (!this.deferredPrompt) {
            this.logPromptSkippedOnce("no_deferred_prompt", source);
            return;
        }
        this.countShownInSession++;

        this.deferredPrompt.prompt();
        Logger.logA2hsBrowserPromptShown(source);

        // Wait for the user to respond to the prompt
        this.deferredPrompt.userChoice.then((choiceResult: any) => {
            if (choiceResult.outcome === 'accepted') {
                // console.log('User accepted the A2HS prompt');
                Logger.logA2hsDone(source);
            } else {
                Logger.logA2hsBrowserPromptCancelled(source);
            }
            this.deferredPrompt = undefined;
        });
    }

    private showPrompt(source: string) {
        this.showPWAInstallPrompt(source);
    }

    public optionallyShowPrompt(source: string = this.defaultSource, delayMs: number = 1000): any {
        let $this = this;
        if (!A2HS_SUPPORTED) {
            this.logPromptSkippedOnce("unsupported", source);
            return;
        }
        if (Logger.getDisplayMode() === "PWA_standalone") {
            this.logPromptSkippedOnce("already_pwa_standalone", source);
            return;
        }
        if (this.countShownInSession > 0) {
            // Skipping showing prompt as already shown once in session.
            this.logPromptSkippedOnce("already_shown_in_session", source);
            return;
        }

        if (!this.deferredPrompt) {
            // No deferred prompt, ignore.
            // Does this mean already installed?
            this.logPromptSkippedOnce("no_deferred_prompt", source);
            return
        }

        if (!this.pwaHistoryManager.shouldShowPrompt()) {
            // Never show prompt set.
            this.logPromptSkippedOnce("never_show_set", source);
            return;
        }

        if (delayMs <= 0) {
            this.showPrompt(source);
            return;
        }

        const TIMEOUT_MS = delayMs;
        let timeout: any = setTimeout(function() {
            $this.showPrompt(source);
        }, TIMEOUT_MS);

        return timeout;
    }
}
