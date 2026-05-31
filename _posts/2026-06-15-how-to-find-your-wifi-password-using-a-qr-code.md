---
layout: blog_post
title: "How to Find Your WiFi Password Using a QR Code"
description: "Lost your WiFi password? Generate a QR code from your connected phone, scan it at scanapp.org, and the password is right there in plain text."
post-no: 17
toc: true
author: ScanApp Team
author_url: "https://scanapp.org"
---

You're connected to your home WiFi on your phone but can't remember the password to give it to a guest. Your router is in a closet, the sticker is faded, and the password isn't saved anywhere obvious. There's a faster way: generate a WiFi QR code from your phone, then scan it to reveal the password in plain text.

This works on iPhone, Android, and any device already connected to the network.

---

## On Android (Pixel, Samsung, OnePlus, Xiaomi)

Android exposes a QR code for any saved network — and that QR code contains the password.

1. Open **Settings → Network & Internet → Internet** (older Android: **Settings → Wi-Fi**).
2. Tap your connected network.
3. Tap the **QR code icon** next to the network name. On Samsung, tap **QR Code** at the bottom of the network details screen.
4. Android shows the QR code. Below it, on most devices, the password is printed in plain text too.

If your version of Android only shows the QR code without the password, screenshot it, then scan the screenshot at [scanapp.org](https://scanapp.org):

1. Take a screenshot of the QR code.
2. Open [scanapp.org](https://scanapp.org) on another device.
3. Tap **Upload Image** and select the screenshot.
4. The decoded string looks like `WIFI:T:WPA;S:MyNetwork;P:MyPassword;;`. The text after `P:` is your password.

---

## On iPhone (iOS 16 and later)

iPhones running iOS 16+ can share a saved WiFi password via QR code from the Settings app:

1. Open **Settings → Wi-Fi**.
2. Tap your connected network.
3. Tap **Password** — Face ID or Touch ID will reveal it.
4. The password is shown in plain text. You can also choose **Show QR code**.

If you want the QR code itself: open the iPhone Camera app, point it at the QR code on the screen, and the password appears in the join-network banner.

---

## On Windows 11

Windows stores WiFi passwords in plain text, accessible from PowerShell or the network settings UI:

1. Open **Settings → Network & Internet → Wi-Fi → Manage known networks**.
2. Click your network.
3. Click **View Wi-Fi security key**.

If the device isn't currently connected, run this in PowerShell:

```powershell
netsh wlan show profile name="YourNetworkName" key=clear
```

The line marked **Key Content** is the password.

---

## On Mac

macOS stores WiFi passwords in Keychain Access:

1. Open **Keychain Access** (Cmd+Space → "Keychain Access").
2. Search for the network name.
3. Double-click the entry, check **Show password**, and authenticate with your Mac password.

There's no built-in WiFi QR code generator in macOS, but you can use any WiFi QR generator with the SSID and password from Keychain.

---

## What If You're Not Connected?

If no device on the network is connected, you can't reveal the password without physical access to the router. Look for the default password printed on a sticker on the underside or back of the router (often labeled **Wireless Key**, **WPA2 Key**, or **PIN**). If someone changed it and forgot, the only fix is to factory-reset the router.

---

## Security Note

A WiFi QR code is functionally identical to the password itself. Anyone who can see or photograph the code can join the network. Don't post your home WiFi QR code on social media, on a public website, or in a shared Slack channel. For shared spaces, generate a separate guest network with its own password and QR code.

---

## Frequently Asked Questions

### How do I see my WiFi password from a QR code?
Scan the QR code at [scanapp.org](https://scanapp.org). The decoded text contains `P:YourPassword` — that's the password in plain text.

### Can I find my WiFi password without a QR code?
Yes. On iPhone (iOS 16+), Android (Pixel & most modern devices), Windows 11, and macOS, the password is viewable in network settings with biometric or admin authentication.

### Why won't my phone show the WiFi password?
On older Android versions and pre-iOS 16 iPhones, the password is not exposed in plain text — only as a shareable QR code. Generate the QR code and decode it at [scanapp.org](https://scanapp.org).

### Is it safe to share my WiFi QR code?
Only with people you trust to use the network. The QR code reveals the password to anyone who scans it.

### Can I change the WiFi password back if I see it?
You don't need to. Reading the password doesn't change it. The password stays valid until you change it in the router admin panel.

---

## Related Reading

- [How to Connect to WiFi by Scanning a QR Code](/2026/06/01/how-to-connect-to-wifi-by-scanning-a-qr-code/)
- [NFC vs QR Codes: Which Should You Use?](/2026/06/08/nfc-vs-qr-codes-which-should-you-use/)
- [How to Scan a QR Code on Android](/supports/how-to-scan-qr-code-android/)
- [How to Scan a QR Code on Windows 11](/supports/how-to-scan-qr-code-windows-11/)
