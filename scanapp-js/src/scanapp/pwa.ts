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

    public constructor() {
        window.addEventListener('beforeinstallprompt', (event) => {
            // Prevent Chrome 67 and earlier from automatically showing the prompt
            event.preventDefault();
            this.deferredPrompt = event;
            console.log("Deferred installation prompt.");
        });
    }

    private showPWAInstallPrompt() {
        if (!this.deferredPrompt) {
            // TODO: log this.
            return;
        }
        this.countShownInSession++;

        this.deferredPrompt.prompt();
        // Wait for the user to respond to the prompt
        this.deferredPrompt.userChoice.then((choiceResult: any) => {
            Logger.logA2hsBrowserPromptShown();
            if (choiceResult.outcome === 'accepted') {
                // console.log('User accepted the A2HS prompt');
                Logger.logA2hsDone();
            } else {
                Logger.logA2hsBrowserPromptCancelled();
            }
            this.deferredPrompt = undefined;
        });
    }

    private showPrompt() {
        this.showPWAInstallPrompt();
    }

    public optionallyShowPrompt(): any {
        let $this = this;
        if (!A2HS_SUPPORTED) {
            return;
        }
        if (this.countShownInSession > 0) {
            // Skipping showing prompt as already shown once in session.
            return;
        }

        if (!this.deferredPrompt) {
            // No deferred prompt, ignore.
            // Does this mean already installed?
            return
        }

        if (this.pwaHistoryManager.shouldShowPrompt()) {
            // Never show prompt set.
            return;
        }

        const TIMEOUT_MS = 1000;
        let timeout: any = setTimeout(function() {
            $this.showPrompt();
        }, TIMEOUT_MS);

        return timeout;
    }
}
