# Localized landing pages

This directory holds the translated content for ScanApp's per-market landing pages.
Each YAML file under `_data/locales/` becomes a fully indexable, hreflang-linked
landing page at `https://scanapp.org/<code>/`.

## Architecture in one diagram

```
_data/locales/ph.yml ──┐
                       ├──► _layouts/locale.html ──► _layouts/empty_beta.html ──► HTML page
ph/index.md (stub) ────┘                          (head, hreflang, JSON-LD, canonical)
```

Each locale page = 1 data file (YAML) + 1 layout (shared) + 1 stub (3 lines).

## How indexing works

Each locale page produces:

1. **Self-canonical** — `<link rel="canonical" href="https://scanapp.org/ph/" />`
   so Google treats `/ph/` as its own indexable URL, not a duplicate of `/`.
2. **hreflang alternates** — both `<link rel="alternate">` in the HTML head AND
   `<xhtml:link>` in the sitemap, listing every other locale + the English default.
   This tells Google "this page is for tl-PH; the Hindi version is at /in/, etc."
3. **`<html lang="tl">`** (and `dir="rtl"` for Urdu) so Google and screen readers
   recognize the locale.
4. **Crawler-visible SEO content** — `_layouts/locale.html` renders the localized
   H1, H2s, intro paragraph, FAQ, payment apps, and use cases into an sr-only block.
   The JS app paints over the top for users; Google sees the full text.
5. **FAQPage JSON-LD** — translated Q&As marked up as structured data, eligible
   for rich-result snippets in the local Google market.
6. **WebApplication JSON-LD** — locale-aware `inLanguage` + `description`.
7. **Sitemap inclusion** — every locale is in `sitemap.xml` with hreflang
   `<xhtml:link>` alternates.
8. **Bidirectional internal linking** — every locale links back to `/` with
   `hreflang="en"`, and `/` lists every locale via hreflang alternates.

## To add a new locale

Assume you want to add `vn` (Vietnam, Vietnamese — `vi-VN`):

1. Copy `ph.yml` to `vn.yml` and translate every field.
2. Update the metadata block at the top:
   ```yaml
   _locale_code: vn
   _language: vi
   _hreflang: vi-VN
   _country_name_en: Vietnam
   _country_name_local: Việt Nam
   _url_path: /vn/
   ```
3. Create `vn/index.md` with:
   ```yaml
   ---
   layout: locale
   locale: vn
   permalink: /vn/
   ---
   ```
4. Rebuild. The page is automatically wired into the sitemap, gets bidirectional
   hreflang from every other locale, and is canonicalized to itself.

That's it. No code changes anywhere.

## RTL languages

Urdu (`pk.yml`) is right-to-left. Mark it by adding `_text_direction: rtl` at
the top of the data file. The layout reads this and emits `dir="rtl"` on the
`<html>` tag and on the sr-only SEO block. If you add a new RTL locale
(Arabic, Hebrew, Persian, Sindhi), set the same flag.

## Translation review status

Every data file starts with `_review_status: pending-native-review`. This field
is a tracker, not a behavior gate — the page is published regardless. The intent
is so you can `grep -r "pending-native-review" _data/locales/` to find which
locales still need a native speaker pass.

**Once a native speaker has reviewed a locale**, change the flag to:
- `_review_status: reviewed-{name}-{YYYYMMDD}` — e.g., `reviewed-ana-cruz-20260601`

The current six locales (PH, IN, MY, ID, PK, BD) are LLM-drafted. **They should
not be promoted past "ship to crawlers" until reviewed.** LLM-drafted Tagalog
and Urdu in particular are known to drift on idiomatic CTAs and brand voice.

### Native-review checklist

For each locale, the reviewer should verify:

- [ ] **CTAs and microcopy** ("Try now", "See more", "Open scanner") read naturally
- [ ] **Payment app descriptions** are factually correct (e.g., GCash supports scan-to-receive, not just scan-to-pay)
- [ ] **Brand names** (GCash, Maya, JazzCash, bKash) match official capitalization
- [ ] **Tone** is consistent (formal vs. informal "you" — आप vs. तुम in Hindi; tagalog "ka" vs. "kayo")
- [ ] **Currency and price phrasing** doesn't imply ScanApp has paid features
- [ ] **Tech terms** (browser, camera, signup) are phrased the way locals actually search — sometimes the English loanword outperforms a translated one
- [ ] **No broken Unicode** — Devanagari, Bangla, Urdu, and Bahasa diacritics all render

## What each locale file contains

Field-by-field reference (see any `*.yml` for an example):

| Field | Purpose | SEO impact |
|---|---|---|
| `meta.title` | `<title>` tag | Primary ranking signal |
| `meta.description` | `<meta description>` | CTR lever in SERPs |
| `meta.page_visible_description` | Passed to JS app | Renders to user-visible UI |
| `h1` | sr-only `<h1>` | Primary on-page ranking signal |
| `intro` | Paragraph after H1 | Topical relevance |
| `features` | Bullet list | Long-tail keyword surface |
| `how_to` | 4-step process | Eligible for HowTo schema if added |
| `payment_examples` | Country-specific QR apps | Captures vernacular payment queries |
| `use_cases` | Common scenarios | Long-tail queries (e.g., "WiFi QR Pakistan") |
| `faq` | 6 Q&As | Becomes FAQPage JSON-LD; rich-result eligible |
| `cta_title` / `cta_body` | Conversion text | UX, not SEO |
| `footer_links` | Internal links | Crawl budget — points crawlers at /blog, /support |

## Why subdirectory, not subdomain or ccTLD

- **`scanapp.org/ph/`** (chosen) — inherits the main domain's authority. One sitemap. Easiest to maintain.
- **`ph.scanapp.org`** — Google treats subdomains as separate sites for ranking. Authority does not transfer automatically. Avoid.
- **`scanapp.ph`** (ccTLD) — strongest geo-targeting signal but requires buying and maintaining a domain per market. Reconsider if a single locale grows past 500K monthly clicks.

## Common gotchas

1. **Don't add a locale page that is "just the English page translated word-for-word."** Google flags that as low-value duplicate content. The payment examples and use cases per locale are what make these pages non-duplicate.
2. **Don't canonicalize a locale page to `/`.** It will be deindexed. Self-canonical is the rule.
3. **Don't put translated content only in `<noscript>`.** Google's render pass executes JS, so noscript content is weaker than sr-only content that's in the main DOM.
4. **Don't forget hreflang is bidirectional.** If `/ph/` says "Hindi version is at /in/", then `/in/` must say "Tagalog version is at /ph/". The sitemap and the layout both handle this automatically — just don't manually break it.
5. **RTL locales need both `dir="rtl"` on `<html>` AND in the sr-only block.** The layout does this if `_text_direction: rtl` is set. Manually testing in a browser confirms correct rendering.

## Where to look in the codebase

| File | Role |
|---|---|
| `_data/locales/<code>.yml` | Translated content (you edit this) |
| `_data/locales/README.md` | This file |
| `_layouts/locale.html` | Renders the localized SEO block + FAQ schema |
| `_layouts/empty_beta.html` | Reads `page.locale`, emits hreflang/canonical/metadata |
| `<code>/index.md` | 3-line stub mapping a URL to a locale |
| `sitemap.xml` | Iterates locales, emits `<xhtml:link>` alternates |
