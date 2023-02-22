/**
 * @fileoverview
 * Backlink handling file.
 * 
 * @author mebjas <minhazav@gmail.com>
 */

import { Logger } from "./logger";

export function overrideFtpBacklink() {
    let ftpBacklink = document.getElementById("ftp-backlink");
    if (!ftpBacklink) {
        throw "ftpBacklink not found";
    }
    ftpBacklink.addEventListener("click", function(event) {
        event.preventDefault();
        let currentTarget: any = event.currentTarget;
        if (currentTarget) {
            let hyperLink = currentTarget.href;
            Logger.logFtpBacklinkClick(function() {
                location.href = hyperLink;
            });
        }
        return false;
    });
}
