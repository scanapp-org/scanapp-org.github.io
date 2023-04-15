---
permalink: "/demo/html5qrcode-class-staging"
title: Demo of Html5Qrcode class
layout: demo
description: How to use Html5Qrcode class
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
   QR code scanning demo using <code style="font-size: 24pt">Html5Qrcode</code> class.
</div>
<div class="container">
	<div class="row">
		<div class="col-md-12" style="text-align: center;margin-bottom: 20px;">
			<div id="reader" style="display: inline-block;"></div>
			<div class="empty"></div>
            <div id="scanned-result"></div>
            <div>
                <select id="facingMode">
                    <option value="user">user</option>
                    <option value="environment">environment</option>
                </select>
                <button id="start">Start Scanning</button>
            </div>
            <br />
            <div>Select a camera facing mode from the menu above and press "Start Scanning".</div>
            <div>
                <strong>Important Note:</strong>
                This demo only works as expected on mobile devices
            </div>
            <div id="generated-code" style="border: 1px solid silver; padding: 10px; margin-top: 20px; text-align: left">
                Generated code will come here...
            </div>
		</div>
	</div>
</div>


<script src="/assets/js/html5-qrcode.min.v2.3.8.js"></script>
<script src="/assets/js/demo/html5qrcode-class.js"></script>
