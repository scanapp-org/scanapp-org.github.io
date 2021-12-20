var scanning = false;
var scanningRequested = false;
var html5qrcode = new Html5Qrcode("reader");

function docReady(fn) {
    // see if DOM is already available
    if (document.readyState === "complete" || document.readyState === "interactive") {
        // call on next available tick
        setTimeout(fn, 1);
    } else {
        document.addEventListener("DOMContentLoaded", fn);
    }
}

function startScanning(facingMode) {
    console.log(facingMode)
    var results = document.getElementById('scanned-result');
	var lastMessage;
	var codesFound = 0;
	function onScanSuccess(qrCodeMessage) {
		if (lastMessage !== qrCodeMessage) {
			lastMessage = qrCodeMessage;
			++codesFound;
			results.innerHTML += `<div>[${codesFound}] - ${qrCodeMessage}</div>`;
		}
	}
    return html5qrcode.start(
        { facingMode: facingMode },
        { fps: 10, qrbox: 250 },
        onScanSuccess);
}

function stopScanning() {
    return html5qrcode.stop();
}

docReady(function() {
    var button = document.getElementById('start');
    var facingModeSelect = document.getElementById('facingMode');
    button.addEventListener('click', function() {
        if (!scanning) {
            button.disabled = true;
            facingModeSelect.disabled = true;
            startScanning(facingModeSelect.value)
            .then(_ => {
                scanning = true;
                button.disabled = false;
                button.innerHTML = "Stop Scanning";
            })
            .catch(err => {
                button.disabled = false;
                facingModeSelect.disabled = false;
                alert(err);
            })
        } else {
            button.disabled = true;
            stopScanning()
            .then(_ => {
                scanning = false;
                button.disabled = false;
                facingModeSelect.disabled = false;
                button.innerHTML = "Start Scanning";
            })
            .catch(err => {
                button.disabled = false;
                alert(err);
            }) 
        }
    });
});