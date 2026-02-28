# ScanApp — QR Code & Barcode Scanner

> Source code for **[scanapp.org](https://scanapp.org)** — a free, open-source, privacy-first QR code and barcode scanner that runs entirely in your browser.

[![License: Apache-2.0](https://img.shields.io/github/license/scanapp-org/scanapp-org.github.io)](./LICENSE.md)
[![Issues](https://img.shields.io/github/issues/scanapp-org/scanapp-org.github.io)](https://github.com/scanapp-org/scanapp-org.github.io/issues)
[![Stars](https://img.shields.io/github/stars/scanapp-org/scanapp-org.github.io)](https://github.com/scanapp-org/scanapp-org.github.io/stargazers)

---

## What Is This?

ScanApp is a web application that lets you scan QR codes and barcodes using your device's camera or by uploading an image file — directly in the browser. No app install needed, no account required, and no data ever leaves your device.

It is the end-to-end reference implementation for the [`html5-qrcode`](https://github.com/mebjas/html5-qrcode) library.

**Live app → [scanapp.org](https://scanapp.org)**

---

## Features

- 📷 **Camera scanning** — live viewfinder via webcam or phone camera
- 🖼 **File scanning** — upload an image to decode codes from it
- 🔲 **Wide format support** — QR Code, Aztec, Code 39/93/128, EAN-8/13, UPC-A/E, PDF 417, Data Matrix, ITF, and more
- 🔒 **100% local processing** — all decoding happens on-device; nothing is uploaded
- 📱 **Works everywhere** — Android, iOS, Windows, macOS; Chrome, Firefox, Safari, Edge, Opera
- ⚡ **Progressive Web App (PWA)** — installable on any platform, with a service worker for offline support
- 🌙 **Dark mode** — follows system preference
- 📋 **Scan history** — results saved locally in your browser session
- 🔗 **Result actions** — copy text, open URLs, share results, or make payments from scan output

---

## Tech Stack

| Layer | Technology |
|---|---|
| Scanner engine | [`mebjas/html5-qrcode`](https://github.com/mebjas/html5-qrcode) |
| Site framework | [Jekyll](https://jekyllrb.com/) (GitHub Pages) |
| Scripting | TypeScript (compiled via Webpack) |
| Styling | SCSS |
| PWA | Service Worker (`sw.js`) + Web App Manifest |
| Hosting | GitHub Pages — `scanapp.org` via CNAME |

---

## Project Structure

```
/
├── index.html              # Main scanner application
├── index.md                # Jekyll landing content
├── barcode.md              # Barcode-specific page
├── beta.md                 # Beta features page
├── sw.js                   # Service worker (PWA / offline support)
├── _config.yml             # Jekyll site configuration
├── _layouts/               # Jekyll page layouts
├── _includes/              # Jekyll partials
├── _posts/                 # Blog posts
├── _supports/              # Support articles
├── _sass/                  # SCSS stylesheets
├── assets/                 # Images, icons, SVGs, compiled JS/CSS
├── demo/                   # Standalone demo pages
├── scanapp-js/             # ScanApp JS integration files
├── scripts/                # Build and utility scripts
├── webpack.config.js       # Webpack bundler config (TypeScript → JS)
├── tsconfig.json           # TypeScript compiler config
├── Gemfile                 # Ruby gems for Jekyll
├── package.json            # Node dependencies and build scripts
├── sitemap.xml             # SEO sitemap
├── robots.txt              # Crawler rules
└── LICENSE.md              # Apache-2.0
```

---

## Running Locally

### Prerequisites

- [Ruby](https://www.ruby-lang.org/) + [Bundler](https://bundler.io/) (for Jekyll)
- [Node.js](https://nodejs.org/) + npm (for TypeScript / Webpack)

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/scanapp-org/scanapp-org.github.io.git
cd scanapp-org.github.io

# 2. Install Ruby dependencies
bundle install

# 3. Install Node dependencies
npm install

# 4. Build the TypeScript sources
npm run build

# 5. Serve the site locally with Jekyll
bundle exec jekyll serve
```

Open [http://localhost:4000](http://localhost:4000) in your browser.

> **Note:** Camera access requires HTTPS in most browsers. For local development with a real device camera, consider using a tunnelling tool like [ngrok](https://ngrok.com/) or serving with a self-signed certificate.

---

## Supported Code Formats

| Format | Format | Format |
|---|---|---|
| QR Code | Aztec | Code 39 |
| Code 93 | Code 128 | ITF |
| EAN-13 | EAN-8 | PDF 417 |
| UPC-A | UPC-E | Data Matrix |
| RSS 14 | RSS Expanded | MaxiCode |

---

## Supported Platforms

| Platform | Chrome | Firefox | Safari | Edge | Opera |
|---|---|---|---|---|---|
| **PC / Mac** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Android** | ✅ | ✅ | — | ✅ | ✅ |
| **iOS** | ✅ *(≥ 15.1)* | ✅ *(≥ 15.1)* | ✅ | ✅ | — |

Scanning from a local image file is supported on all platforms as a fallback where inline camera access is unavailable.

---

## Privacy

All scanning is performed **locally on your device**. No image data, scan results, or personal information is ever transmitted to any server. The site does not require login or account creation of any kind.

---

## Contributing

Bug reports and feature requests are welcome via [GitHub Issues](https://github.com/scanapp-org/scanapp-org.github.io/issues).

If you want to contribute code:

1. Fork the repository
2. Make changes to the TypeScript source files or Jekyll templates
3. Run `npm run build` to recompile
4. Test locally with `bundle exec jekyll serve`
5. Open a pull request with a clear description of what you changed and why

---

## Related Projects

- **[mebjas/html5-qrcode](https://github.com/mebjas/html5-qrcode)** — The underlying scanning library powering ScanApp
- **[scanapp-org/html5-qrcode-react](https://github.com/scanapp-org/html5-qrcode-react)** — React wrapper for `html5-qrcode`
- **[ScanApp Docs](https://scanapp.org/html5-qrcode-docs/)** — Full API documentation for `html5-qrcode`

---

## License

[Apache-2.0](./LICENSE.md) © [scanapp-org](https://github.com/scanapp-org)
