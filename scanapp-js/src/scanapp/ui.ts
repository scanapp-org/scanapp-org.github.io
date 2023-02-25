/**
 * @fileoverview
 * UI functions.
 * 
 * @author mebjas <minhazav@gmail.com>
 */

import { CodeCategory } from "./constants";

export function createLinkTyeUi(
    parentElem: HTMLElement, decodedText: string, codeType: CodeCategory) {
    var link = document.createElement("a");
    link.href = decodedText;
    if (codeType === CodeCategory.TYPE_PHONE) {
        decodedText = decodedText.toLowerCase().replace("tel:", "");
    }
    link.innerText = decodedText;
    parentElem.appendChild(link);
}

function addKeyValuePairUi(parentElem: HTMLElement, key: string, value: string) {
    var elem = document.createElement("div");
    var keySpan = document.createElement("span");
    keySpan.style.fontWeight = "bold";
    keySpan.style.marginRight = "10px";
    keySpan.innerText = key;
    elem.appendChild(keySpan);

    var valueSpan = document.createElement("span");
    valueSpan.innerText = value;
    elem.appendChild(valueSpan);

    parentElem.appendChild(elem);
}

export function createWifiTyeUi(parentElem: HTMLElement, decodedText: string) {
    var expression = /WIFI:S:(.*);T:(.*);P:(.*);H:(.*);;/g;
    var regexExp = new RegExp(expression);
    var result = regexExp.exec(decodedText);
    if (result) {
        addKeyValuePairUi(parentElem, "SSID", result[1]);
        addKeyValuePairUi(parentElem, "Type", result[2]);
        addKeyValuePairUi(parentElem, "Password", result[3]);
    }
}

export function createUpiTypeUi(parentElem: HTMLElement, decodedText: string) {
    // var expression = /upi:\/\/pay\?cu=(.*)&pa=(.*)&pn=(.*)/g;
    // var regexExp = new RegExp(expression);
    // var result = regexExp.exec(decodedText);
    var upiUri = new URL(decodedText);
    var searchParams: URLSearchParams = upiUri.searchParams;

    const cu = searchParams.get("cu");
    if (cu && cu != null) {
        addKeyValuePairUi(parentElem, "Currency", cu);
    }

    const pa = searchParams.get("pa");
    if (pa && pa != null) {
        addKeyValuePairUi(parentElem, "Payee address", pa);
    }
    
    const pn = searchParams.get("pn");
    if (pn && pn != null) {
        addKeyValuePairUi(parentElem, "Payee Name", pn);
    }
}