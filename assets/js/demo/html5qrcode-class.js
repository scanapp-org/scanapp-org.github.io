var scanning = false;
var scanningRequested = false;
var html5qrcode = new Html5Qrcode("reader");
var generatedCodeSection = document.getElementById("generated-code");

function docReady(fn) {
    // see if DOM is already available
    if (document.readyState === "complete" || document.readyState === "interactive") {
        // call on next available tick
        setTimeout(fn, 1);
    } else {
        document.addEventListener("DOMContentLoaded", fn);
    }
}

function generateCode(facing) {
    return "<html>\n"
        + "<body>\n"
        + "<div id=\"reader\"></div>\n"
        + "<script>\n"
        + "\tvar html5qrcode = new Html5Qrcode(\"reader\");\n"
        + "\tfunction onScanSuccess(qrCodeMessage) {\n"
        + "\t\t/* success condition here... *./\n"
        + "\t}\n"
        + "\n"
        + "\thtml5qrcode.start(\n"
        + "\t\t{ facingMode: \"" + facing +"\" },\n"
        + "\t\t{ fps: 10, qrbox: 250 }\n"
        + "\t\tonScanSuccess);\n"
        + "\n"
        + "</script>\n"
        + "</body>\n"
        + "</html>\n";
}

function renderCode(facing) {
    generatedCodeSection.innerHTML = "";
    var preElement = document.createElement("pre");
    preElement.innerText = generateCode(facing);
    generatedCodeSection.appendChild(preElement);
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

    renderCode(facingMode);
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