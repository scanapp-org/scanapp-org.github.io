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
    // private readonly container = document.getElementById("a2hs-container");
    // private readonly addButton = document.getElementById("a2hs-add");
    // private readonly cancelButton = document.getElementById("a2hs-cancel");
    // private readonly showNeverCheckbox = document.getElementById("a2hs-add-never");
    // private readonly sectionInfoMore = document.getElementById("section-info-more");
    private readonly pwaHistoryManager = new PwaHistoryManager();
    
    private deferredPrompt?: any; // TODO: Add strong typing.
    private countShownInSession = 0;

    public constructor() {
        window.addEventListener('beforeinstallprompt', (event) => {
            // Prevent Chrome 67 and earlier from automatically showing the prompt
            event.preventDefault();
            this.deferredPrompt = event;
            console.log("Deferred installation prompt.");
    
            // addButton.addEventListener("click", function() {
            //     let isShowNeverCheckboxChecked = showNeverCheckbox.checked;
            //     Logger.logA2hsAddButtonClicked(isShowNeverCheckboxChecked);
            //     showPWAInstallPrompt();
            // });
    
            // cancelButton.addEventListener("click", function() {
            //     let isShowNeverCheckboxChecked = showNeverCheckbox.checked;
            //     Logger.logA2hsCancelButtonClicked(isShowNeverCheckboxChecked);
            //     // TODO: Update pwaHistoryManager.
            //     if (isShowNeverCheckboxChecked) {
            //         pwaHistoryManager.setNeverShowPrompt();
            //     }
            //     hidePrompt();
            // });
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
                // sectionInfoMore.innerHTML
                //     = "Thanks for adding ScanApp to home screen.";
                // setTimeout(function() {
                //     hidePrompt();
                // }, 500);
            } else {
                // console.log('User dismissed the A2HS prompt');
                Logger.logA2hsBrowserPromptCancelled();
                // sectionInfoMore.innerHTML
                //     = "Click on \"Install\" to add ScanApp to home screen.";
            }
            this.deferredPrompt = undefined;
        });
    }

    private showPrompt() {
        // container.style.display = "flex";
        // container.style.top = "calc(25%)";
        // ++countShownInSession;
        // Logger.logA2hsPopupShown();
        this.showPWAInstallPrompt();
    }

    private hidePrompt() {
        // container.style.top = "calc(105%)";
        // container.style.display = "none";
    }

    public optionallyShowPrompt(): number | undefined {
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
        let timeout: number = setTimeout(function() {
            $this.showPrompt();
        }, TIMEOUT_MS);

        return timeout;
    }
}
