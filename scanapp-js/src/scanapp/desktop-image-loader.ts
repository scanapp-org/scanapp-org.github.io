/**
 * @fileoverview
 * Component for lazy loading large images for desktop usecase.
 * 
 * @author mebjas <minhazav@gmail.com>
 */

interface ImageInfo {
    url: string,
    width: number,
    height: number,
    alt: string,
    border?: string;
}

const idToUrlMap: { [id: string]: ImageInfo; } = {
    "image-place-holder-qr-placeholder": {
        url: "./assets/images/qr-result-placeholder.png",
        width: 161,
        height: 300,
        alt: "Scan to get results"
    },
    "image-place-holder-ftp-award": {
        url: "./assets/images/scanapp-ftp-award-250w.webp",
        width: 120,
        height: 131,
        alt: "top choice award by ftp"
    },
    "image-place-holder-ko-fi": {
        url: "https://storage.ko-fi.com/cdn/kofi2.png?v=3",
        width: 141,
        height: 36,
        alt: "Buy Me a Coffee at ko-fi.com",
        border: "0px"
    }
}

async function loadAndRender(parentContainer: HTMLElement, imageInfo: ImageInfo) {
    let image = new Image();
    image.width = imageInfo.width;
    image.height = imageInfo.height;
    image.alt = imageInfo.alt;
    image.onload = () => {
        parentContainer.appendChild(image);
    };
    if (imageInfo.border) {
        image.style.border = imageInfo.border;
    }
    image.src = imageInfo.url;
}

export async function loadAllDesktopImages() {
    for (const targetContainerId of Object.keys(idToUrlMap)) {
        const parentContainer = document.getElementById(targetContainerId) as HTMLElement | null;
        if (parentContainer) {
            parentContainer.innerHTML = "";
            await loadAndRender(parentContainer, idToUrlMap[targetContainerId]);
        }
    }
}
