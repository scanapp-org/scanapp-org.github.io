---
layout: blog_post
title: "QR Codes and UPI: A Complete Guide to India's Payment Standard"
description: "UPI QR codes are the backbone of payments in India. Learn how BharatQR, UPI QR, and ScanApp work, how to scan and generate them, and solve scanning errors."
post-no: 26
toc: true
author: ScanApp Team
author_url: "https://scanapp.org"
---

The Unified Payments Interface (UPI) has turned India into a global leader in real-time, cashless payments. Walk into any metropolitan supermarket, a roadside tea stall, or a taxi in India, and you will see the familiar black-and-white grid: the **UPI QR code**.

By linking your bank account to a UPI-enabled app, you can transfer money instantly by scanning a QR code, eliminating account numbers, IFSC codes, and credit card swipe machines.

This guide provides a comprehensive breakdown of how UPI QR codes work, how to scan and generate them, and how to verify UPI payments safely.

---

## What is a UPI QR Code?

A **UPI QR code** is a standardized quick response barcode that encodes payment information matching the UPI protocol specifications. 

There are two main specifications used in India:
1. **Standard UPI QR**: Simple, consumer-facing codes containing a UPI ID (Virtual Payment Address or VPA) and optionally a name, amount, and transaction note.
2. **BharatQR**: A multi-channel QR code standard developed by NPCI, Mastercard, and Visa. It can route payments through UPI, debit cards, and credit cards simultaneously, commonly used by larger merchants.

---

## How to Scan a UPI QR Code

### Method 1: Using UPI Apps (Google Pay, PhonePe, Paytm, BHIM)
For everyday retail payments:
1. Open your preferred UPI application (e.g., BHIM, Google Pay, PhonePe, Paytm).
2. Tap the **Scan Any QR** button on the home screen.
3. Position your phone camera to capture the merchant’s QR code standee.
4. Enter the amount to pay (if it is a static merchant code).
5. Enter your secure **UPI PIN** to authorize and complete the transfer.

### Method 2: Scanning a Saved Image or Screenshot
If a business or client sends you their QR code via WhatsApp:
1. Download the QR code image to your device.
2. Open your UPI app and tap **Scan QR**.
3. Tap the **Gallery** icon (usually a photo image symbol in the scanner corner).
4. Select the downloaded QR code. The app will decode the VPA data and launch the payment window.

### Method 3: Parsing and Verifying UPI QR Payloads
Because QR code tampering (replacing real merchant codes with malicious ones) is on the rise, you can parse the payload using web tools like [ScanApp.org](https://scanapp.org) to verify the destination UPI ID before entering your UPI PIN:
1. Load [ScanApp.org](https://scanapp.org) in your browser.
2. Point your camera at the QR code or upload a screenshot.
3. ScanApp decodes the raw payload locally. You will see a URI scheme starting with `upi://pay?`.
4. Inspect the parameters to verify the merchant's real name and UPI ID.

---

## Technical Structure: How UPI QR Links are Encoded

UPI QR codes are simple text strings formatted as URIs. If you decode a standard UPI QR code on [ScanApp.org](https://scanapp.org), you will see a structure like this:

`upi://pay?pa=merchantname@okhdfcbank&pn=Merchant%20Name&mc=5411&tr=123456&tn=Payment%20for%20Services&am=250&cu=INR`

Key parameters explained:
* **`pa` (Payment Address)**: The destination UPI ID (VPA) where the money will be sent.
* **`pn` (Payee Name)**: The merchant or individual's name.
* **`am` (Amount)**: The pre-filled transaction value (optional).
* **`cu` (Currency)**: Standardized to `INR` (Indian Rupee).
* **`tn` (Transaction Note)**: A short message showing on statements (optional).
* **`mc` (Merchant Code)**: A 4-digit classification code defining the business type (optional).

---

## How to Generate a UPI QR Code

### 1. Generating Personal QR Codes (P2P)
For receiving money from friends or family:
1. Open Google Pay, PhonePe, or BHIM.
2. Tap on your **Profile Icon**.
3. Select **My QR Code** or **Receive Money**.
4. The app displays your personal QR code linked to your default bank account. Save or share the image.

### 2. Generating Custom/Dynamic QR Codes (For Websites & Invoices)
If you are a developer, freelancer, or store owner wanting to create a QR code for a specific billing amount, you can construct a UPI URL and encode it into a QR code using [ScanApp's Create QR page](https://scanapp.org/generate):
1. Construct the raw text link: `upi://pay?pa=yourUPIid@bank&pn=YourName&am=150&cu=INR` (replace values accordingly).
2. Go to the generator page at [ScanApp.org/generate](https://scanapp.org/generate).
3. Choose **Website / URL** as the QR type.
4. Paste your constructed `upi://` link into the input field.
5. Download the generated QR code as PNG or SVG to place on your PDF invoice.

---

## Troubleshooting UPI QR Code Issues

### 1. "Camera Not Working" or Black Screen
This is caused by missing app permission settings.
- **Android**: Go to Settings > Apps > [Your UPI App] > Permissions > Camera > Enable **Allow**.
- **iOS**: Go to Settings > [Your UPI App] > Toggle **Camera** to green.

### 2. "Amount Exceeds Limit" Error
UPI has standard transactional limits set by banks and the NPCI:
- Standard peer-to-peer (P2P) limits are generally ₹1 Lakh per day.
- Certain merchant accounts (P2M) like insurance or education allow up to ₹5 Lakhs.
- If the payment fails, ask the seller for their direct bank account number and IFSC code to perform an IMPS/NEFT bank transfer instead.

### 3. Scanning a Damaged or Faded Sticker
If a merchant standee is scratched or faded, mobile cameras will fail to lock focus.
- Use a dedicated web scanner like [ScanApp.org](https://scanapp.org). Because it leverages advanced WebAssembly decoding algorithms, it can decode low-contrast, distorted, or slightly damaged codes that standard app engines reject.

---

## Related Articles
* [Why You Should Avoid Downloading Dedicated QR Scanner Apps](/2026/05/24/why-you-should-avoid-downloading-qr-scanner-apps.html)
* [How to Scan QR Codes Completely Offline](/2026/05/24/how-to-scan-qr-codes-completely-offline.html)
* [Digital Product Passports and QR Codes](/2026/08/03/digital-product-passports-and-qr-codes.html)

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Can I scan a UPI QR code with any QR scanner app?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "You can scan a UPI QR code with any scanner (like ScanApp.org) to decode and verify its text and UPI ID parameters. However, to execute the actual monetary payment, you must open the decoded UPI link inside an authorized app like BHIM, Google Pay, PhonePe, or Paytm."
      }
    },
    {
      "@type": "Question",
      "name": "What is the UPI URL format to create a QR code?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The basic format is 'upi://pay?pa=recipient@bank&pn=RecipientName&am=Amount&cu=INR'. You can encode this URL using any QR code generator to create a scannable payment code."
      }
    },
    {
      "@type": "Question",
      "name": "Are there charges for paying via UPI QR codes?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. Peer-to-peer (P2P) and standard merchant payments made via UPI QR codes do not carry any transaction charges for consumers."
      }
    },
    {
      "@type": "Question",
      "name": "How can I scan a UPI QR code screenshot saved in my gallery?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Open your UPI payment app, tap 'Scan QR', and look for a photo/gallery icon on the scanning screen. Tap it, select the saved screenshot of the UPI QR, and the app will parse the payment details."
      }
    }
  ]
}
</script>
