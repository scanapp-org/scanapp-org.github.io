---
layout: blog_post
title: "How to Safely Extract Plain Text and Contact Info from QR Codes"
description: "Not all QR codes point to websites. Learn how to decode and copy raw text, Wi-Fi credentials, and contact cards from QR codes safely."
post-no: 16
toc: true
author: ScanApp Team
author_url: "https://scanapp.org"
---

Most people assume scanning a QR code will always open a website in their browser. However, QR codes can contain various data formats. If you scan these with your phone's default camera, it may trigger actions automatically (like adding a contact or joining a network) which can sometimes be annoying or insecure.

Here is how to preview and copy the raw contents of any QR code safely.

---

## What Types of Non-URL Data Can QR Codes Store?

1. **Plain Text**: Simple alphanumeric strings, serial numbers, or notes.
2. **Wi-Fi Credentials**: Format `WIFI:S:NetworkName;T:WPA;P:Password;;` which tells your phone to connect automatically.
3. **vCard (Contact Cards)**: Details like name, phone number, email, and company that import into your address book.
4. **Geo-location**: Latitude and longitude coordinates to launch map services.

---

## Scanning to Copy Raw Text Securely

If you scan a QR code using [ScanApp.org](https://scanapp.org):

* **No Auto-execution**: Instead of launching a link or opening a prompt automatically, ScanApp decodes and displays the raw text inside a secure preview container.
* **Copy Button**: Easily copy the plain text, Wi-Fi password, or vCard details to your clipboard with a single click.
* **Format Parsers**: Built-in parsers help identify the code's data type, letting you choose how you want to interact with it.
