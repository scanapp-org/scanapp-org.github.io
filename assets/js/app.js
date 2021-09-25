function docReady(fn) {
    // see if DOM is already available
    if (document.readyState === "complete" || document.readyState === "interactive") {
        // call on next available tick
        setTimeout(fn, 1);
    } else {
        document.addEventListener("DOMContentLoaded", fn);
    }
}

/** Ugly function to write the results to a table dynamically. */
function printScanResultPretty(codeId, decodedText, decodedResult) {
	let resultSection = document.getElementById('scanned-result');
    let tableBodyId = "scanned-result-table-body";
    if (!document.getElementById(tableBodyId)) {
        let table = document.createElement("table");
        table.className = "styled-table";
        table.style.width = "100%";
        resultSection.appendChild(table);

        let theader = document.createElement('thead');
        let trow = document.createElement('tr');
        let th1 = document.createElement('td');
        th1.innerText = "Count";
        let th2 = document.createElement('td');
        th2.innerText = "Format";
        let th3 = document.createElement('td');
        th3.innerText = "Result";
        trow.appendChild(th1);
        trow.appendChild(th2);
        trow.appendChild(th3);
        theader.appendChild(trow);
        table.appendChild(theader);

        let tbody = document.createElement("tbody");
        tbody.id = tableBodyId;
        table.appendChild(tbody);
    }

    let tbody = document.getElementById(tableBodyId);
    let trow = document.createElement('tr');
    let td1 = document.createElement('td');
    td1.innerText = `${codeId}`;
    let td2 = document.createElement('td');
    td2.innerText = `${decodedResult.result.format.formatName}`;
    let td3 = document.createElement('td');
    td3.innerText = `${decodedText}`;
    trow.appendChild(td1);
    trow.appendChild(td2);
    trow.appendChild(td3);
    tbody.appendChild(trow);
}

docReady(function() {
	var lastMessage;
	var codeId = 0;
	function onScanSuccess(decodedText, decodedResult) {
        /**
         * If you following the code example of this page by looking at the
         * source code of the demo page - good job!!
         * 
         * Tip: update this function with a success callback of your choise.
         */
		if (lastMessage !== decodedText) {
			lastMessage = decodedText;
            printScanResultPretty(codeId, decodedText, decodedResult);
            ++codeId;
		}
	}

	let html5QrcodeScanner = new Html5QrcodeScanner(
        "reader", 
        { 
            fps: 10,
            qrbox: 250,
            // Important notice: this is experimental feature, use it at your
            // own risk. See documentation in
            // mebjas@/html5-qrcode/src/experimental-features.ts
            experimentalFeatures: {
                useBarCodeDetectorIfSupported: true
            },
            rememberLastUsedCamera: true
        });
	html5QrcodeScanner.render(onScanSuccess);
});