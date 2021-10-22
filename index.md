---
layout: empty
title: ScanApp - QR Code scanner for web
---
<link rel="canonical" href="https://scanapp.org"/>
<link rel="stylesheet" href="/assets/app.css">

<div id="scanapp-container">
    <div id="scanner">
        <div id="logo">
            <img src="/assets/svg/scanapp.svg" />
        </div>
        <div id="reader"></div>
    </div>
    <div id="workspace">
        <div id="new-scanned-result">
            <div class="header">
                New <span id="scan-result-code-type">{code}</span> detected!
            </div>
            <div class="section">
                <div class="image" id="scan-result-image"></div>
                <div class="data">
                    <table id="result_table">
                        <tr>
                            <td>Text</td>
                            <td>
                                <div id="scan-result-text">{text result here}</div>
                            </td>
                        </tr>
                        <tr>
                            <td>Parsed</td>
                            <td>
                                <div>
                                    <div class="badge">
                                        <div class="badge-icon">
                                            <span><b>Type</b></span>
                                        </div>
                                        <div class="badge-text">
                                            <span id="scan-result-badge-body">Phone number</span>
                                        </div>
                                    </div>
                                </div>
                                <div id="scan-result-parsed">{parsed result here}</div>
                            </td>
                        </tr>
                        <tr>
                            <td>Actions</td>
                            <td>
                                <img class="action_image" id="action-share" 
                                    src="./assets/svg/share-svgrepo-com.svg">
                                <img class="action_image" id="action-copy" 
                                    src="./assets/svg/copy-svgrepo-com.svg">
                            </td>
                        </tr>
                    </table>
                    <div id="body-footer">
                        <button id="scan-result-close">Close and scan another</button>
                    </div>
                </div>
                <div class="footer">
                    Scanning done locally on your device.
                    <br>
                    Built with <3 using html5-qrcode
                    <br>
                    <a href="https://github.com/scanapp-org/scanapp-org.github.io/issues/new">report issue</a> |
                    <a href="https://minhazav.dev">contact us</a> | 
                    <a href="https://blog.minhazav.dev">blog</a>
                </div>
            </div>
        </div>
    </div>
</div>

<script src="/assets/js/html5-qrcode.min.js"></script>
<script src="/assets/js/app.js"></script>