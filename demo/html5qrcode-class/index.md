---
permalink: "/demo/html5qrcode-class"
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
<div>
    This is work in progress demo using <code>Html5Qrcode</code>.
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
		</div>
	</div>
</div>


<script src="/assets/js/html5-qrcode.min.js"></script>
<script src="/assets/js/demo/html5qrcode-class.js"></script>
