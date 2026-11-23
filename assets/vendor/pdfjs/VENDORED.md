# Vendored pdfjs-dist

Version: 6.5.438

Official npm distribution: https://registry.npmjs.org/pdfjs-dist/-/pdfjs-dist-6.5.438.tgz

Npm archive integrity: `sha512-vg8Pw1x+AFKy4AMDvhuWl5cOYV8d698UoEANoFFhc79hqXDnZQqnOXoxw3HG907WHOg1JYOvLhP756boddFxpA==`

The browser entry and parsing worker are copied verbatim from `legacy/build/pdf.min.mjs` and `legacy/build/pdf.worker.min.mjs`. Supporting cmaps, standard_fonts, wasm and iccs directories are copied verbatim with their licenses. Source maps, viewer/editor/sandbox UI, renderer worker and Node dependencies are not shipped. The canvas-only integration uses `disableWorkerRendering: true`; it does not enable scripting or annotations.

Load supporting data from same-origin paths ending in `/`; set `cMapPacked: true`. Retain the PDFDocumentLoadingTask and call its `destroy()` method on replacement/reset. PDFDocumentProxy has no `destroy()` method in this version.

Upstream README and license are included. Installed from the official npm registry in an isolated temporary directory with install scripts disabled. The dependency graph had zero known advisories reported by npm audit on November 22, 2026; this is not a security guarantee. Updates require renewed rendering/decoding and browser tests.
