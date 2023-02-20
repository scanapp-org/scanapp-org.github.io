#!/bin/bash
## Build Script
echo "Initiating webpack build sequence."

export NODE_OPTIONS=--openssl-legacy-provider

VERSION="2.3.8"

webpack

## Script copied to dist/html5-qrcode.min.js
## Fork content of 'webpack_append_data.min.js' to final js file to
## make classes global to be backwards compatible.
cat scripts/webpack_append_data.min.js >> dist/scanapp-js.pro.min.js

cp "dist/scanapp-js.pro.min.js" "minified/scanapp-js.pro.min.v${VERSION}.js"
echo "Copied the webpack script to minified/scanapp-js.pro.min.v${VERSION}.js"

echo "Webpack building done."
