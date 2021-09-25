---
layout: empty
title: ScanApp - QR Code scanner for web
---
<link rel="canonical" href="https://scanapp.org"/>

<!-- todo(mebjas): Move this to a CSS file. -->
<style>
body {
    padding: 0px;
    margin: 0px;
}
#reader {
    width: 100%;
}

.empty {
    display: block;
    width: 100%;
    height: 20px;
}
</style>

<div id="reader"></div>
<div class="empty"></div>
<div id="scanned-result"></div>

<script src="/assets/js/html5-qrcode.min.js"></script>
<script src="/assets/js/app.js"></script>