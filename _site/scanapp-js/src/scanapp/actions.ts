/**
 * @fileoverview
 * Actions for ScanApp.
 * 
 * @author mebjas <minhazav@gmail.com>
 */

import { showBanner } from "./misc";

export function copyToClipboard(decodedText: string) {
    navigator.clipboard.writeText(decodedText)
        .then(() => {
            showBanner("Text copied");
        }).catch((_) => {
            showBanner("Failed to copy", false);
        });
}