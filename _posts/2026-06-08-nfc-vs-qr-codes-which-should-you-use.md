---
layout: blog_post
title: "NFC vs QR Codes: Which Should You Use?"
description: "NFC tags and QR codes solve overlapping problems. Compare cost, range, security, and user experience to choose the right one for your use case."
post-no: 16
toc: true
author: ScanApp Team
author_url: "https://scanapp.org"
---

NFC tags and QR codes both let a phone trigger an action — open a URL, join a WiFi network, save a contact, launch an app — without typing. They look interchangeable from the user's side. They are not. The right choice depends on cost, distance, hardware, and how much you care about analytics.

Here is a clear breakdown for anyone choosing between the two for a product, restaurant menu, business card, marketing campaign, or smart-home setup.

---

## TL;DR

- **Use a QR code** when you need zero hardware cost, scale to thousands of locations, work on every phone (including iPhones in restricted modes), and want a printed visual element.
- **Use an NFC tag** when you want a tap-only interaction with no camera, want to embed in physical objects (badges, posters, product packaging), and your audience uses NFC-capable phones (most modern devices).
- **In practice, many products use both** — printed QR code visible to everyone, NFC tag hidden inside for tap-to-action convenience.

---

## How They Work

| Trait | QR Code | NFC Tag |
|---|---|---|
| Reading method | Camera scans visible pattern | Phone touches tag (within ~4 cm) |
| Hardware needed | None — just the printed code | NFC chip (~$0.10–$0.50 each) |
| Phone requirement | Any camera-enabled phone | NFC-capable phone (most iPhones since iPhone 7, most Androids since 2014) |
| Distance | Anywhere the camera can focus (cm to meters) | Within ~4 cm of the tag |
| Visible? | Yes — must be visible to be scanned | Optional — can be hidden under stickers, behind plastic, in objects |
| Rewritable? | No (you'd reprint) | Yes (rewritable NTAG213/215/216 tags) |

The fundamental difference is *line of sight*. QR codes need to be seen; NFC tags need to be touched. That changes where each one is useful.

---

## Cost

A QR code is **free** — you generate it once and print it. An NFC tag costs between **$0.10 and $0.50** per unit at volume, plus the cost of placing it. For 10,000 menus, that's a $1,000–$5,000 difference. For a single business card, it's noise.

If your product is consumed at scale (restaurant table tents, parking signs, posters), QR codes win on cost alone.

---

## User Experience

Tapping an NFC tag is **faster and feels more magical** than scanning a QR code. There's no "aim the camera" step. But:

- iPhones require iOS 14+ to read NFC tags from the home screen without an app. Older iPhones need an NFC reader app.
- Some Android phones have NFC disabled by default in Settings.
- NFC fails silently if the user doesn't know to tap — a QR code is at least obvious.

A QR code is **dumber but more universal**. Anyone with a smartphone made in the last decade can scan one. There's no "supported device" question.

---

## Security

Both formats are equally insecure by default — a printed QR code or an NFC tag can be replaced or overlaid by an attacker to redirect to a phishing site (the "quishing" attack is well-documented).

- **NFC tags** can be password-protected and locked read-only, which prevents tampering after deployment.
- **QR codes** can't be locked, but they can be signed (e.g., with a short URL that points to a verified domain).

For a public-facing parking meter or restaurant table, both formats need the same defense: visible branding, a short verified URL, and an audit process to check for tampered codes.

---

## Range and Placement

| Scenario | Better choice | Why |
|---|---|---|
| Restaurant menu on a table | QR code | Customers scan from across the table without leaning over |
| Conference badge | NFC | Tap to exchange contact info instantly |
| Museum exhibit label | Either | NFC for repeat visitors, QR for first-timers |
| Product packaging | Both | Visible QR for marketing, hidden NFC for authenticity check |
| Smart-home automation (Apple Shortcuts, Tasker triggers) | NFC | No camera needed, tap a sticker on a wall to trigger a scene |
| Marketing poster | QR | Visible from a distance, no need to reach the wall |
| Business card | NFC | Tap-to-save contact without scanning |

---

## Analytics

QR codes can route through a tracked short link (Bitly, Rebrandly, Branch, your own redirector) to give you scan counts, geolocation estimates, and device type. NFC tags can encode any URL too, so the analytics story is identical for both — the limit is the redirect target, not the medium.

There is no "native" analytics for either format. Whatever URL the user lands on is what generates the data.

---

## When NFC Wins

- **Apple Action Button & Shortcuts:** Tap an NFC tag to trigger an iOS Shortcut. No camera, no app launch.
- **Tap-to-pay style interactions:** Loyalty programs, vending machines, room access.
- **Repeat interactions:** A tag on your desk that runs the same Shortcut every workday — taps feel native, scans feel tedious.
- **Discreet placement:** Hidden under packaging or behind a sticker so the visible design isn't cluttered with a QR pattern.

---

## When QR Codes Win

- **Mass distribution:** Posters, menus, packaging at thousands of locations — printing is essentially free.
- **Universal compatibility:** Every smartphone since 2017 can scan a QR code without setup. NFC requires a capable device with NFC enabled.
- **Long-range scanning:** From across a room, across a parking lot, off a billboard.
- **Verifiable visually:** Users can see the QR code is the real one, not a stuck-on overlay (if you train them to check).

---

## Best Practice: Use Both When You Can

Premium products often embed both. The visible QR code handles marketing scans, social shares, and first-time customers. The hidden NFC tag offers a faster, more delightful tap-to-act experience for repeat users.

Some examples in the wild:

- **Premium wine bottles:** Visible QR for label info, NFC under the foil for authenticity verification.
- **Hotel room keycards:** NFC for room access, printed QR on the back for hotel WiFi.
- **Conference badges:** NFC for contact exchange, QR for ticket scanning at sessions.

---

## How to Scan Each Online

- **QR code:** Open [scanapp.org](https://scanapp.org) in any browser and use your camera or upload an image. Works on iPhone, Android, Windows, Mac, and Linux.
- **NFC tag:** Tap with an NFC-capable phone. On Android, the Web NFC API lets browsers read tags directly. On iPhone, use the native Tag Reader (Settings → Control Center → add NFC Tag Reader on older iPhones; automatic on iPhone XS and later).

---

## Frequently Asked Questions

### Are NFC tags more secure than QR codes?
Slightly, when locked and password-protected. Both are vulnerable to physical replacement attacks — the underlying URL matters more than the medium.

### Can iPhones read NFC tags?
Yes. iPhone 7 and newer can read NFC tags. iPhone XS and newer read tags automatically from the lock screen with no setup. Older models need the NFC Tag Reader added to Control Center.

### Why do restaurants use QR codes instead of NFC?
Cost and reach. A printed QR code on every table costs cents. Equivalent NFC tags cost dollars at volume, and not every guest's phone has NFC enabled.

### Do QR codes work without internet?
The decoding works offline — [scanapp.org](https://scanapp.org) decodes locally in your browser. But following the link inside the QR code requires internet.

### Which lasts longer outdoors, NFC or QR?
NFC tags survive better in weather (no visible degradation), but their adhesive can fail. QR codes are vulnerable to fading and physical damage. Both should be laminated or housed in protective casing outdoors.

---

## Related Reading

- [How to Connect to WiFi by Scanning a QR Code](/2026/06/01/how-to-connect-to-wifi-by-scanning-a-qr-code/)
- [Why You Should Avoid Downloading QR Code Scanner Apps](/2026/05/24/why-you-should-avoid-downloading-qr-scanner-apps/)
- [How to Scan a QR Code on Android](/supports/how-to-scan-qr-code-android/)
