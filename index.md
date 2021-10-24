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
        <div id="worspace-header">
            Scanned result & history
        </div>
        <div id="no-result-container hidden">Scan to get results</div>
        <div id="new-scanned-result">
            <div class="header">
                New <span id="scan-result-code-type">{code}</span> detected!
            </div>
            <div class="section">
                <div class="image" id="scan-result-image"></div>
                <div class="data">
                    <table id="result_table">
                        <tr>
                            <!-- <td>Parsed</td> -->
                            <td colspan="2">
                                <div>
                                    <div class="badge">
                                        <div class="badge-icon">
                                            <span><b>Type</b></span>
                                        </div>
                                        <div class="badge-text">
                                            <span id="scan-result-badge-body">{type}</span>
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
                        <tr>
                            <td>Text</td>
                            <td>
                                <div id="scan-result-text">{text result here}</div>
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


<div class="banners-container">
  <div class="banners">
    <div class="banner error">
      <div class="banner-icon"><i data-eva="alert-circle-outline" data-eva-fill="#ffffff" data-eva-height="48" data-eva-width="48"></i></div>
      <div class="banner-message" id="banner-error-message">{}</div>
      <div class="banner-close" onclick="hideBanners()"><i data-eva="close-outline" data-eva-fill="#ffffff"></i></div>
    </div>
    <div class="banner success">
      <div class="banner-icon"><i data-eva="checkmark-circle-outline" data-eva-fill="#ffffff" data-eva-height="48" data-eva-width="48"></i></div>
      <div class="banner-message" id="banner-success-message">{}</div>
      <div class="banner-close" onclick="hideBanners()"><i data-eva="close-outline" data-eva-fill="#ffffff"></i></div>
    </div>
  </div>
</div>

<!-- Scripts -->
<script src="https://unpkg.com/eva-icons" onload="eva.replace()"></script>
<script src="/assets/js/html5-qrcode.min.js"></script>
<script src="/assets/js/app.js"></script>