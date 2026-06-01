---
layout: blog_post
title: "What is Quishing? How to Safely Scan QR Codes and Verify Links"
description: "QR code phishing (quishing) is on the rise. Learn how quishing works, how to spot malicious codes, and how browser scanners help you verify links safely."
post-no: 21
toc: true
author: ScanApp Team
author_url: "https://scanapp.org"
---

The popularity of QR codes for restaurant menus, parking payments, and digital tickets has caught the attention of cybercriminals. The result is a growing cyber threat known as **"Quishing"** (QR Phishing).

Unlike traditional phishing emails that contain links your email security filters can easily block, quishing uses image-based QR codes that bypass automated detection. If you scan one, you might be redirected to a credential-harvesting site.

Here is a guide on how quishing works, how to identify malicious QR codes, and how to verify links safely using browser-based local scanners.

---

## What is Quishing?

**Quishing** is a social engineering attack that uses QR codes to trick users into visiting malicious websites, downloading malware, or sending payments to scammers. 

Because QR codes are just visual representations of data (most commonly web URLs), humans cannot read them with the naked eye. You must trust that the scanner will decode the pattern correctly and lead you to the expected destination. Scammers exploit this trust in two primary ways:

1. **Digital Phishing (Emails & SMS)**: Attackers send an email prompting you to "scan this QR code to update your security settings" or "verify your account." Secure Email Gateways (SEGs) scan the email text for malicious links, but often ignore image attachments containing QR codes.
2. **Physical Tampering**: Attackers print stickers with malicious QR codes and place them directly over legitimate codes on restaurant tables, parking meters, or public transit advertisements.

---

## 5 Warning Signs of a Malicious QR Code

Before scanning any QR code, look out for these warning signs:

* **Sticker Overlays**: In public spaces, run your finger over the QR code. If it feels like a sticker pasted over the original sign or flyer, **do not scan it**.
* **Urgent or Threatening Calls to Action (CTAs)**: Be suspicious of text like "Scan now or your account will be suspended" or "Scan to claim your $100 reward immediately."
* **Shortened or Weird Domains**: Check the destination URL. Look for odd subdomains, spelling variations (e.g., `paypal-security-update.com` instead of `paypal.com`), or suspicious URL shorteners.
* **Requests for Personal Information**: Safe QR codes (like a restaurant menu or Wi-Fi login) should never prompt you to enter credentials, credit cards, or download software.
* **Lack of Context**: Avoid scanning random QR codes printed on light poles, bathroom stalls, or sent from unknown phone numbers.

---

## How to Safely Inspect Links Before Launching Them

Many native smartphone camera apps are set to immediately redirect you to the website once a QR code is detected. This auto-launch behavior removes your chance to verify the destination.

To stay safe, use these practices:

1. **Disable Auto-Redirects**: Check your phone's camera settings and turn off automatic URL opening.
2. **Use a Security-First Scanner**: Browser-based utilities like [ScanApp.org](https://scanapp.org) act as a buffer. When ScanApp scans a QR code:
   * It decodes the text locally in your browser.
   * It displays the raw decoded URL or text on your screen.
   * It gives you options to copy the text or inspect the link.
   * It **never automatically redirects you** to the target site, letting you verify the domain name first.

---

## Why Browser Scanning is Inherently Safer

Many free QR code scanner apps in the App Store and Google Play Store are adware or fleeceware that track your location and sell your scanning history to ad networks. 

Web-based scanners like ScanApp execute all calculations **locally on your device** via WebAssembly. The image processing occurs in sandboxed browser memory, ensuring your camera feed and decoded links are never uploaded to an external server.

---

## Related Reading

* [Why You Should Avoid Downloading QR Code Scanner Apps](/2026/05/24/why-you-should-avoid-downloading-qr-scanner-apps.html)
* [How to Scan a QR Code on Windows 11](/supports/how-to-scan-qr-code-windows-11/)
* [How to Scan a QR Code from an Image, Photo, or Screenshot](/supports/how-to-scan-qr-code-from-image-or-photo/)

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is quishing?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Quishing is short for QR code phishing. It is a scam where bad actors use malicious QR codes, either printed on stickers in public or embedded in emails, to redirect users to phishing sites or distribute malware."
      }
    },
    {
      "@type": "Question",
      "name": "How can I tell if a QR code is safe to scan?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Check if a physical QR code is a sticker glued over the original. Never scan codes requesting password changes via email. Use a scanner like ScanApp that displays the URL preview and lets you verify the domain before visiting."
      }
    },
    {
      "@type": "Question",
      "name": "Do QR codes contain viruses?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A QR code itself is just static text or a link and cannot contain a virus. However, the URL it links to can lead to websites that exploit browser vulnerabilities, download malicious APK files, or trick you into entering credentials."
      }
    }
  ]
}
</script>
