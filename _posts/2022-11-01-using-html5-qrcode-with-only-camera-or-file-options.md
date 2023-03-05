---
layout: blog_post
title:  Using Html5-qrcode with only Camera or File options
description: "In this article, I'll share how to use different scan types -  camera based and file based, depending upon the scenario."
post-no: 4
toc: true
image: "/assets/images/blog/post4/default_config.webp"
author: Mohsina
author_url: https://mohsinaav.github.io/
editor: Minhaz
editor_url: https://minhazav.dev
---

[Html5-qrcode](https://github.com/mebjas/html5-qrcode) is a light-weight library to easily integrate QR code scanning functionality 
to any web application. You can find out more about the project and it's implementation details on the project page on [Github](https://github.com/mebjas/html5-qrcode).

[ScanApp](https://scanapp.org) is the end to end implementation of the library by the same author.

By default, the library allows two type of scanning options

  - Camera based scan 
  - File based scan (Allows users to select any file on their device)

<div style="text-align: center; margin-bottom: 20px">
    <div style="display: flex; justify-content: center;">
        <img src="/assets/images/blog/post4/default_config.png" alt="Screenshot of default config">
    </div>
    <i>Screenshot of the app with default configuraion, before my pull request.</i>
</div>

Earlier, there was no option to change this default configuration i.e. developers who wanted to use the library had to show both camera and file scan options even if their use-case was limited to one of them. There were feature request to open this up as a configuration.
  
## The feature request
[This feature request](https://github.com/mebjas/html5-qrcode/issues/405) was raised seeking the support for controlling what all scan type should be rendered when using the library.

> This seemed like an impactful item for me to start contributing to this project.

## I added a configuration in `Html5QrcodeScanner` to support this
I was able to add a new configuration option, such that the user can

-   Either use only Camera based scan 
-   Or only File based scan
-   Or use both of them, this happens to be the default option as well.

To configure the feature with `Html5QrcodeScanner`, one need to simply set `supportedScanTypes` 
options like this.

```ts
let html5QrcodeScanner = new Html5QrcodeScanner(
    "reader", 
    { 
        fps: 10,
        qrbox: qrboxFunction,
        experimentalFeatures: {
            useBarCodeDetectorIfSupported: true
        },
        rememberLastUsedCamera: true,
        supportedScanTypes: [
            Html5QrcodeScanType.SCAN_TYPE_FILE, 
            Html5QrcodeScanType.SCAN_TYPE_CAMERA
        ],
        aspectRatio: 1.7777778
    });
```

**Note that**
```ts
{
    supportedScanTypes: [
        Html5QrcodeScanType.SCAN_TYPE_FILE, 
        Html5QrcodeScanType.SCAN_TYPE_CAMERA
    ]
}
```

Is this the relevant configuration here. Here's example of different scenarios.

### [1] User only needs the camera based scanning.
In this case, set the `supportedScanTypes` value like this.
```ts
supportedScanTypes: [ Html5QrcodeScanType.SCAN_TYPE_CAMERA ],
```

This will render the QR Scanner something like this

<div style="text-align: center; margin-bottom: 20px">
    <div style="display: flex; justify-content: center;">
        <img src="/assets/images/blog/post4/camera_only.png" alt="Screenshot of camera only config">
    </div>
    <i>Screenshot of app with camera only config.</i>
</div>


### [2] User only needs the file based scanning.
Here set the `supportedScanTypes` value like this.
```ts
{
    supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_FILE]
}
```

This will render the QR Scanner something like this

<div style="text-align: center; margin-bottom: 20px">
    <div style="display: flex; justify-content: center;">
        <img src="/assets/images/blog/post4/file_only.png" alt="Screenshot of file only config">
    </div>
    <i>Screenshot of app with file only config.</i>
</div>


### [3] User wants to support both camera and file based option
> This is the default option! And unless you have specific need to disable one
> of the two, I recommend you to use this.

If we don't set any value for `supportedScanTypes`, the library will support
both scanning types by default.

#### Bonus: Set file based scanning as default option while supporting both
A bonus addition to the feature was that -  the order of the config is also honoured by the library.
If you want to support both file and camera based scanning options but want to define file based option as the default you can just configure `supportedScanTypes` like this

```ts
{
    supportedScanTypes: [
        Html5QrcodeScanType.SCAN_TYPE_FILE, 
        Html5QrcodeScanType.SCAN_TYPE_CAMERA
    ]
}
```

This will render the QR Scanner something like this

<div style="text-align: center; margin-bottom: 20px">
    <div style="display: flex; justify-content: center;">
        <img src="/assets/images/blog/post4/file_first.png" alt="Screenshot of file first config">
    </div>
    <i>Screenshot of app with file first config.</i>
</div>

> Otherwise, by default the library renders camera based option as the default one.

#### Similarly, you can define camera based option to be the default one
> This happens to be the default scenario as well. So if you do nothing explicitly, library will behave in this fashion only.

```ts
{
    supportedScanTypes: [
        Html5QrcodeScanType.SCAN_TYPE_CAMERA,
        Html5QrcodeScanType.SCAN_TYPE_FILE
    ]
}
```

### If you pass arbitrary values, library will throw error!
I suppose this goes without saying!

> If you provide values other than the supported ones - the library will throw error.

## Summary

Developers can now modify the type of scanning method when using the `Html5QrcodeScanner` library.

-    Developers can choose to render only Camera support.
-    Developers can choose to render only File selection support.
-    Developers can choose to support both but select file or camera as the default option.

If you have any feedbacks, please share in comment section. For any bug report or feature request please report it to the [html5-qrcode library](https://github.com/mebjas/html5-qrcode) directly.
