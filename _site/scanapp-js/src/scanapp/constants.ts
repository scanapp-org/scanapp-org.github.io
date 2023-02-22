/**
 * @fileoverview
 * Constants for ScanApp.
 * 
 * @author mebjas <minhazav@gmail.com>
 */

export enum CodeType {
    TYPE_TEXT = 1,
    TYPE_URL = 2,
    TYPE_PHONE = 3,
    TYPE_WIFI = 4,
    TYPE_UPI = 5
}

export function codeTypeToString(codeType: CodeType): string {
    switch(codeType) {
        case CodeType.TYPE_TEXT:
            return "Text";
        case CodeType.TYPE_URL:
            return "Url";
        case CodeType.TYPE_PHONE:
            return "Phone";
        case CodeType.TYPE_WIFI:
            return "Wifi";
        case CodeType.TYPE_UPI:
            return "Upi";
    }
}

export enum ScanType {
    SCAN_TYPE_CAMERA = 1,
    SCAN_TYPE_FILE = 2,
}

export function scanTypeToString(scanType: ScanType): string {
    switch(scanType) {
        case ScanType.SCAN_TYPE_CAMERA:
            return "Camera";
        case ScanType.SCAN_TYPE_FILE:
            return "File";
    }
}

export const IS_DEBUG = location.host.indexOf("127.0.0.1") !== -1;

export const QR_RESULT_HEADER_FROM_SCAN = "Scanned result";
// TODO(mohsinaav): Use this as title when result is loaded from history.
export const QR_RESULT_HEADER_FROM_HISTORY = "Scan result from History";
