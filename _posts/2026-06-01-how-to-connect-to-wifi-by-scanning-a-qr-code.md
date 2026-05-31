---
layout: blog_post
title: "How to Connect to WiFi by Scanning a QR Code"
description: "Skip typing the password. Scan a WiFi QR code with your phone or laptop to join the network instantly on iPhone, Android, Windows, and Mac."
post-no: 15
toc: true
author: ScanApp Team
author_url: "https://scanapp.org"
---

Typing a 20-character WiFi password on a guest's phone is the worst part of inviting people over. WiFi QR codes solve this completely — one scan, and the device joins the network. Most modern phones can generate and read WiFi QR codes without any extra app.

Here is how to use them, and how to scan one if your phone doesn't natively support it.

---

## What a WiFi QR Code Actually Contains

A WiFi QR code encodes a short string in this format:

```
WIFI:T:WPA;S:NetworkName;P:Password;;
```

- `T` is the encryption type (WPA, WPA2, WEP, or `nopass` for open networks).
- `S` is the SSID (network name).
- `P` is the password.

When a phone scans this string, the operating system recognizes the `WIFI:` prefix and offers to join the network directly — no manual entry. The encoding is documented in the IEEE-published [Wi-Fi Alliance Wi-Fi Easy Connect](https://www.wi-fi.org/discover-wi-fi/wi-fi-easy-connect) spec.

---

## How to Scan a WiFi QR Code on iPhone

1. Open the **Camera app**.
2. Point it at the WiFi QR code.
3. A banner appears that says **"Join '<network name>'"**.
4. Tap the banner — iOS joins the network automatically.

iOS 11+ supports WiFi QR codes natively. No app needed.

---

## How to Scan a WiFi QR Code on Android

1. Open the **Camera app** (or **Google Lens**).
2. Point at the QR code.
3. A chip appears showing the network name. Tap **"Connect to network"**.
4. Android joins the WiFi without revealing the password.

On some older Android phones, you need to open the **Settings → Network & Internet → Wi-Fi → QR code icon** instead — the camera tile is hidden inside the Wi-Fi settings.

---

## How to Scan a WiFi QR Code on Windows 11 or Mac

Neither Windows 11 nor macOS lets you join WiFi by scanning a QR code directly — but you can still use the QR code to learn the password and connect manually.

1. Open [scanapp.org](https://scanapp.org) in any browser.
2. Hold the WiFi QR code in front of your webcam (or upload a photo).
3. ScanApp shows the decoded string. Copy the password.
4. Open WiFi settings, choose the network name, and paste the password.

This is also the fastest way to reveal a WiFi password if you have a printed QR code but lost the written password.

---

## How to Generate a WiFi QR Code for Your Network

The fastest way is on your phone:

- **iPhone:** Open **Settings → Wi-Fi**, tap your connected network, tap **Share Password** (or generate a QR code from the WiFi sharing menu in iOS 16+).
- **Android (Pixel, OnePlus, Samsung):** Open **Settings → Network & Internet → Internet**, tap your connected network, tap the **QR code icon** next to the network name. Android generates a printable QR code instantly.

Print it, tape it to the fridge, and you'll never type a password again.

---

## Security: Should You Print a WiFi QR Code?

A WiFi QR code is exactly as secure as the password itself — anyone who can see the code can join the network. Best practice:

- For your **home guest network**, printing the QR code on a fridge magnet is fine.
- For your **main home network**, keep the QR code somewhere only guests you trust will see it.
- For an **office**, generate a QR code for the guest VLAN, not the production network.
- Never post your WiFi QR code on social media or a public website — it's the same as sharing your password.

---

## Frequently Asked Questions

### Can I connect to WiFi by scanning a QR code without an app?
Yes. iPhone and Android both support WiFi QR codes natively in the Camera app. No third-party app needed.

### How do I scan a WiFi QR code on Windows 11?
Open [scanapp.org](https://scanapp.org) in your browser and hold the QR code in front of the webcam. Copy the decoded password and paste it into the WiFi settings.

### Can I see the WiFi password from a QR code?
Yes. Scan the QR code at [scanapp.org](https://scanapp.org) — the decoded string includes the password in plain text. Useful if you have a printed QR code but lost the written password.

### Does scanning a WiFi QR code work for 5GHz networks?
Yes. The QR code encodes the SSID and password — the band (2.4 GHz vs 5 GHz) is selected automatically by the device based on signal and capability.

### What if my phone doesn't show a "Join Network" prompt?
Make sure the QR code uses the correct `WIFI:` prefix format. If it's a plain text QR code containing only the password, you'll need to copy/paste it into WiFi settings manually.

---

## Related Reading

- [How to Find Your WiFi Password Using a QR Code](/2026/06/15/how-to-find-your-wifi-password-using-a-qr-code/)
- [NFC vs QR Codes: Which Should You Use?](/2026/06/08/nfc-vs-qr-codes-which-should-you-use/)
- [How to Scan a QR Code on Android](/supports/how-to-scan-qr-code-android/)
- [How to Scan a QR Code on Windows 11](/supports/how-to-scan-qr-code-windows-11/)
