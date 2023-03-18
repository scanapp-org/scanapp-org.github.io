---
permalink: "/demo/html5qrcodescanner-class"
title: Demo of Html5QrcodeScanner class
layout: demo
description: How to use Html5QrcodeScanner class
---

<style>
#reader {
    width: 640px;
}
@media(max-width: 600px) {
	#reader {
		width: 300px;
	}
}
.empty {
    display: block;
    width: 100%;
    height: 20px;
}
</style>
<link rel="stylesheet"
      href="//cdnjs.cloudflare.com/ajax/libs/highlight.js/10.0.3/styles/default.min.css">
<div style="text-align: center; font-size: 24pt">
   QR code / Barcode scanning demo using <code style="font-size: 24pt">Html5QrcodeScanner</code> class.
</div>
<br />
<div class="container">
	<div class="row">
		<div class="col-md-12" style="text-align: center;margin-bottom: 20px;">
			<div id="reader" style="display: inline-block;"></div>
			<div class="empty"></div>
			<div id="scanned-result"></div>
		</div>
        <!-- <button id="test-button">test</button> -->
	</div>
</div>


<script src="https://unpkg.com/html5-qrcode/html5-qrcode.min.js"></script>
<script src="/assets/js/demo/html5qrcodescanner-class.js"></script>
