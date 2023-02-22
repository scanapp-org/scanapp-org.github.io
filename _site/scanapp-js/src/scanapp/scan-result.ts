/**
 * @fileoverview
 * ScanResult for ScanApp.
 * 
 * @author mebjas <minhazav@gmail.com>
 */

import {
    CodeType,
    ScanType
} from "./constants";

export class ScanResult {
    public readonly decodedText: string;
    public readonly decodedResult: any; // TODO: fix
    public readonly scanType: ScanType;
    public readonly codeType: CodeType;
    public readonly dateTime: Date;

    public constructor(
        decodedText: string,
        decodedResult: any,
        scanType: ScanType,
        codeType: CodeType,
        dateTime: Date) {
        this.decodedText = decodedText;
        this.decodedResult = decodedResult;
        this.scanType = scanType;
        this.codeType = codeType;
        this.dateTime = dateTime;
    }

    public static create(
        decodedText: string,
        decodedResult: any,  // TODO: fix
        scanType: ScanType): ScanResult {
        let codeType = decodedResult.result.format.formatName;
        let dateTime = new Date();
        return new ScanResult(
            decodedText,
            decodedResult,
            scanType,
            codeType,
            dateTime);
    }
}