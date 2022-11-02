---
layout: blog_post
title:  How to use different scan types
description: In this article, I'll share how to use different scan types - 
camera based and file based, depending upon the scenario.
post-no: 4
toc: true
image: 
author: Mohsina
author_url: [https://mohsinaav.github.io/]
---

Html5-qrcode is a light-weight library to easily integrate QR code scanning functionality 
to a web application. All implementation details are clearly stated in it’s github page - 
[html5-qrcode](https://github.com/mebjas/html5-qrcode). An end-to-end implementation is done 
by the author - [scanapp.org](https://scanapp.org/#reader).

By default, the library would allow two type of scanning options:
  - Camera based scan 
  - File based scan

![Screenshot of default config](/assets/images/blog/post4/default_config.png)

Initially, there was no option to change this default configuration and user has to show both the 
options even if not required.
  
## The feature request
A [feature request](https://github.com/mebjas/html5-qrcode/issues/405) was raised seeking an 
option to configure these options such that the user can choose the scanning type based on their
used case.

## Support added for `Html5QrcodeScanner`
I was able to edit this configuration, such that the user can either use only Camera based scan 
or only File based scan or use both in the default manner.Todo: add blob link here.1

To configure the feature with `Html5QrcodeScanner`, one need to simply set `supportedScanTypes` 
property like this.

```
let html5QrcodeScanner = new Html5QrcodeScanner(
    "reader", 
    { 
        fps: 10,
        qrbox: qrboxFunction,
        // Important notice: this is experimental feature, use it at your
        // own risk. See documentation in
        // mebjas@/html5-qrcode/src/experimental-features.ts
        experimentalFeatures: {
            useBarCodeDetectorIfSupported: true
        },
        rememberLastUsedCamera: true,
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_FILE, 
        Html5QrcodeScanType.SCAN_TYPE_CAMERA],
        aspectRatio: 1.7777778
    });
```

Let us analyse different scenarios.

### 1. User only needs the camera based scanning.
In this case, set the `supportedScanTypes` value like this.
```
supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
```
This is how it will look on scanapp.org.

![Screenshot of camera only config](/assets/images/blog/post4/camera_only.png)


### 2. User only needs the file based scanning.
Here set the `supportedScanTypes` value like this.
```
supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_FILE],
```
This is how it will look on scanapp.org.

![Screenshot of file only config](/assets/images/blog/post4/file_only.png)

### 3. Both scanning types.
Now, if we do not set any value for `supportedScanTypes`, by default the library will support
both scanning types. But, if the user wants to change the order of the scanning type on load, 
following can be done.

#### 3a. To make file based scanning, the default one.
Basicaly, first value would be used as the default value. In this case, set the 
`supportedScanTypes` value like this.
```
supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_FILE, 
      Html5QrcodeScanType.SCAN_TYPE_CAMERA],
```

This is how it will look on scanapp.org.

![Screenshot of file first config](/assets/images/blog/post4/file_first.png)

#### 3b. To make camera as the on load scanning type.
This is the default scenario.
```
supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA,
      Html5QrcodeScanType.SCAN_TYPE_FILE],
```

> NOTE: If the user provide any values other than those mentioned above, the library will 
> throw error.

Here's the summary:
The user can modify the type of scanning method from the `Html5QrcodeScanner` library - camera 
based or file based, by providing different set of values to `supportedScanTypes` property.

So, enjoy the library....
