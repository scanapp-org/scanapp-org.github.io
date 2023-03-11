/**
 * @fileoverview
 * UI for quick action.
 * 
 * @author mebjas <minhazav@gmail.com>
 */

import { Logger } from "./logger";

export class QuickActionHandler {

    private readonly DATA_ATTRIBUTE_NAME = "data-ur";

    private readonly actionContiner = document.getElementById("scan-quick-action")! as HTMLDivElement;
    private readonly headerTextUrl = document.getElementById("scan-quick-action-header-text")! as HTMLSpanElement;
    private readonly actionBodyContainer = document.getElementById("scan-quick-action-body")! as HTMLDivElement;
    private readonly actionBodyTitle = document.getElementById("scan-quick-action-body-title")! as HTMLDivElement;
    private readonly actionBodyDescription = document.getElementById("scan-quick-action-body-description")! as HTMLDivElement;

    private constructor() {
        this.actionContiner.addEventListener("click", () => {
            const url = this.actionContiner.getAttribute(this.DATA_ATTRIBUTE_NAME);
            if (!url) {
                return;
            }

            location.href = url;
            Logger.logUrlQuickActionClick();
        })
    }

    private showContainer() {
        this.actionContiner.style.display = "block";
    }

    public hide() {
        this.actionContiner.style.display = "none";
    }

    private showBody() {
        this.actionBodyContainer.style.display = "block";
    }

    private hideBody() {
        this.actionBodyContainer.style.display = "none";
    }

    public display(url: string) {
        this.headerTextUrl.innerText = url;
        this.hideBody();
        this.showContainer();
        this.actionContiner.setAttribute(this.DATA_ATTRIBUTE_NAME, url);

        // TODO: Show some intermediate loading
        this.loadDataAndRender(url);
    }

    private loadDataAndRender(url: string) {
        let xmlHttpRequest = new XMLHttpRequest();
        xmlHttpRequest.onreadystatechange = () => {
            if (xmlHttpRequest.readyState === 4) {
              const data = JSON.parse(xmlHttpRequest.responseText);
              this.renderData(data);
            }
        }
        
        const dataUrl = `https://jsonlink.io/api/extract?url=${url}`;
        xmlHttpRequest.open('GET', dataUrl, /* async= */ true);
        xmlHttpRequest.send();
    }

    private renderData(data: any) {
        if (!data) {
            return;
        }

        let showBody = false;
        if (data.title) {
            this.actionBodyTitle.innerText = data.title;
            showBody = true;
        }

        if (data.description) {
            this.actionBodyDescription.innerText = data.description;
            showBody = true;
        }

        if (showBody) {
            // TODO: Log this or may be add attribute and log during click.
            this.showBody();
        }
    }

    public static create() {
        return new QuickActionHandler();
    }
}
