/**
 * @fileoverview
 * UI functions.
 * 
 * @author mebjas <minhazav@gmail.com>
 */

import { isNullOrUndefined } from "../html5-qrcode/core";
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

export function createJsonObject(parentElem: HTMLElement, decodedText: string) {
    const object = JSON.parse(decodedText);
    if (isNullOrUndefined(object)) {
        throw "Unable to decode the decodedText as json";
    }

    function generateSpaces(depth: number) {
        const spacePerTab = 2;
        let text = "";
        for (let i = 0; i < depth * spacePerTab; ++i) {
            text += "&nbsp;"
        }
        return text;
    }

    function createValueElement(value: object) : HTMLSpanElement {
        function createContainerTags(tag: string) {
            const span = document.createElement("span");
            span.innerText = tag;
            return span;
        }

        const childValueElem = document.createElement("span");
        // TODO(minhazav): If the 'value' is array: fix the spaces, change ',' to black.
        childValueElem.innerText = `${value}`;
        childValueElem.style.color = "green";
        
        const valueElement = document.createElement("span");
        if (Array.isArray(value)) {
            valueElement.appendChild(createContainerTags("["));
            valueElement.appendChild(childValueElem);
            valueElement.appendChild(createContainerTags("]"));
        } else if (typeof value === "string") {
            valueElement.appendChild(createContainerTags("\""));
            valueElement.appendChild(childValueElem);
            valueElement.appendChild(createContainerTags("\""));
        } else {
            valueElement.appendChild(childValueElem);
        }
        return valueElement;
    }

    function recursivelyRender(parent: HTMLElement, obj: any, depth: number) {
        const keys: Array<string> = Object.keys(obj);
        console.log(keys);
        for (let i = 0; i < keys.length; ++i) {
            const key = keys[i];
            const value = obj[key];
            console.log("Processing ", key, value);
            if (Array.isArray(value) || typeof value !== "object") {
                const div = document.createElement("div");
                div.style.fontFamily = "monospace";
                div.innerHTML = `${generateSpaces(depth)}<b>${key}</b>: `;
                div.appendChild(createValueElement(value));
                parent.appendChild(div);
            } else {
                const div = document.createElement("div");
                div.style.fontFamily = "monospace";
                div.innerHTML = `${generateSpaces(depth)}<b>${key}</b>:`;
                parent.appendChild(div);
                recursivelyRender(parent, value, depth + 1);
            }
        }
    }

    console.log(object);
    recursivelyRender(parentElem, object, /* depth= */ 0);
}