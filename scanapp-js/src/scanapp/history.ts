/**
 * @fileoverview
 * History for ScanApp.
 * 
 * @author mebjas <minhazav@gmail.com>
 */

import { ScanResult } from "./scan-result";

export class HistoryItem {
    public readonly scanResult: ScanResult;

    public constructor(scanResult: ScanResult) {
        this.scanResult = scanResult;
    }

    public render(parentElement: HTMLElement) {}
}

export class HistoryManager {
    
    private readonly parentElement: HTMLElement;
    private historyList: Array<HistoryItem>;

    public constructor(parentElement: HTMLElement) {
        this.parentElement = parentElement;

        this.historyList = [];
    }

    private flushToDisk() {
        // Save the serialized this._historyList to disk.
        console.log("todo: saving history to disk")
    }

    public add(historyItem: HistoryItem) {
        this.historyList.push(historyItem);
        this.flushToDisk();
        this.render();
    }

    private render() {
        this.parentElement.innerHTML = "";
        // render reverse.
        for (var i = this.historyList.length - 1; i >= 0; i--) {
            var historyItem = this.historyList[i];
            historyItem.render(this.parentElement);
        }
    }
}