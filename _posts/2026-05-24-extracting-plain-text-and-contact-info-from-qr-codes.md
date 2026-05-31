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

---

## Recognizing Each QR Format from the Decoded Text

When you decode a QR at [scanapp.org](https://scanapp.org), the first few characters tell you what you're looking at:

| Prefix | Format | What it does |
|---|---|---|
| `http://` or `https://` | URL | Opens a web page in your browser |
| `WIFI:` | WiFi credentials | Joins a network on iOS/Android |
| `BEGIN:VCARD` | vCard contact | Adds a contact to your address book |
| `MATMSG:` | Email draft | Composes a pre-filled email |
| `SMSTO:` | SMS draft | Pre-fills an SMS to a number |
| `tel:` | Phone number | Initiates a call |
| `geo:` | Geo coordinates | Opens in Maps |
| `BEGIN:VEVENT` | iCalendar event | Adds an event to your calendar |
| `bitcoin:` / `ethereum:` | Cryptocurrency address | Pre-fills a wallet transfer |
| Plain text (no prefix) | Free-form text | Could be a coupon code, serial number, note |

If you recognize the prefix, you know what action your phone *would* take if you scanned with the stock camera — and you can decide whether you want that action or just want the raw text.

---

## Decoding a WiFi QR Code Without Joining

A common scenario: you have a printed WiFi QR code and want the password to share verbally, not actually join the network on your phone.

1. Open [scanapp.org](https://scanapp.org) and upload or scan the QR.
2. The decoded text looks like `WIFI:T:WPA;S:HomeNetwork;P:correcthorsebatterystaple;;`.
3. The string after `P:` is the password.
4. Copy it without ever tapping "Join Network."

This is also how you reveal a forgotten password from a QR code you saved earlier.

---

## Decoding a vCard Without Auto-Adding to Contacts

vCard QR codes from business cards, conference badges, or networking events look like:

```
BEGIN:VCARD
VERSION:3.0
N:Smith;Jane
FN:Jane Smith
ORG:Acme Inc.
TEL:+1-555-1234
EMAIL:jane@acme.com
URL:https://acme.com
END:VCARD
```

Decoding at [scanapp.org](https://scanapp.org) shows the raw fields. You can:

- Copy individual fields (just the email, just the phone) without adding the rest.
- Inspect before adding — is this really who you want in your address book?
- Save to a text file or paste into your CRM instead of your phone contacts.

---

## Why This Matters for Privacy

When your stock camera auto-executes a QR code, you give up two things:

1. **Visibility.** You can't preview the destination before the action fires.
2. **Choice.** You can't decide "just give me the URL, don't open it."

Browser scanners that don't auto-execute give you both back. For unfamiliar QR codes — at parking meters, on flyers, on packaging — this preview-first workflow is a meaningful privacy improvement.

---

## Frequently Asked Questions

### How do I see the raw text inside a QR code without opening it?
Open [scanapp.org](https://scanapp.org) and scan or upload the QR code. The decoded text appears in a preview without triggering any action.

### Can I copy a WiFi password from a QR code without joining the network?
Yes. Decode the QR at [scanapp.org](https://scanapp.org) — the password is the part after `P:` in the decoded text. Copy it without tapping any "Join" prompt.

### How do I extract contact details from a vCard QR code?
Scan or upload the QR at [scanapp.org](https://scanapp.org). The decoded vCard shows each field (name, phone, email, company). Copy what you need without adding the full contact to your phone.

### Why does my iPhone camera open links automatically?
iOS treats QR-encoded URLs as actionable and prompts to open them. To preview the URL first, scan at [scanapp.org](https://scanapp.org) instead — the link appears as plain text you can inspect before tapping.

### What does `BEGIN:VCARD` mean in a QR code?
It marks a vCard (virtual business card) format. The QR encodes a contact's name, phone, email, and company.

---

## Related Reading

- [How to Connect to WiFi by Scanning a QR Code](/2026/06/01/how-to-connect-to-wifi-by-scanning-a-qr-code/)
- [Why You Should Avoid Downloading QR Code Scanner Apps](/2026/05/24/why-you-should-avoid-downloading-qr-scanner-apps/)
- [How to Scan a QR Code from an Image or Photo](/supports/how-to-scan-qr-code-from-image-or-photo/)

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How do I see the raw text inside a QR code without opening it?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Open scanapp.org and scan or upload the QR code. The decoded text appears in a preview without triggering any action."
      }
    },
    {
      "@type": "Question",
      "name": "Can I copy a WiFi password from a QR code without joining the network?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Decode the QR at scanapp.org — the password is the part after P: in the decoded text. Copy it without tapping any Join prompt."
      }
    },
    {
      "@type": "Question",
      "name": "How do I extract contact details from a vCard QR code?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Scan or upload the QR at scanapp.org. The decoded vCard shows each field (name, phone, email, company). Copy what you need without adding the full contact to your phone."
      }
    },
    {
      "@type": "Question",
      "name": "Why does my iPhone camera open links automatically?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "iOS treats QR-encoded URLs as actionable and prompts to open them. To preview the URL first, scan at scanapp.org instead — the link appears as plain text you can inspect before tapping."
      }
    },
    {
      "@type": "Question",
      "name": "What does BEGIN:VCARD mean in a QR code?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "It marks a vCard (virtual business card) format. The QR encodes a contact's name, phone, email, and company."
      }
    }
  ]
}
</script>
