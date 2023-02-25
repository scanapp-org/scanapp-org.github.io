/**
 * @fileoverview
 * ScanResult for ScanApp.
 * 
 * @author mebjas <minhazav@gmail.com>
 */

import { ScanType } from "./constants";
import { Html5QrcodeResult } from "../html5-qrcode/core";

export class ScanResult {
    public readonly decodedText: string;
    public readonly decodedResult: Html5QrcodeResult;
    public readonly scanType: ScanType;
    public readonly codeFormatName: string;
    public readonly dateTime: Date;

    public constructor(
        decodedText: string,
        decodedResult: Html5QrcodeResult,
        scanType: ScanType,
        codeFormatName: string,
        dateTime: Date) {
        this.decodedText = decodedText;
        this.decodedResult = decodedResult;
        this.scanType = scanType;
        this.codeFormatName = codeFormatName;
        this.dateTime = dateTime;
    }

    public static create(
        decodedText: string,
        decodedResult: Html5QrcodeResult,
        scanType: ScanType): ScanResult {
        if (!decodedResult.result.format) {
            throw "format is undefined";
        }
        let codeFormatName = decodedResult.result.format.formatName;
        let dateTime = new Date();
        return new ScanResult(
            decodedText,
            decodedResult,
            scanType,
            codeFormatName,
            dateTime);
    }
}