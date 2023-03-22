#!/bin/bash
## Build Script
echo "Initiating webpack build sequence."

export NODE_OPTIONS=--openssl-legacy-provider

VERSION="2.6.1.beta"

webpack

## Script copied to dist/html5-qrcode.min.js
## Fork content of 'webpack_append_data.min.js' to final js file to
## make classes global to be backwards compatible.
# cat scripts/webpack_append_data.min.js >> dist/scanapp-js.pro.min.js

mkdir -p scanapp-js/minified
cp "./scanapp-js/dist/scanapp-js.pro.min.js" "./scanapp-js/minified/scanapp-js.pro.min.v${VERSION}.js"
echo "Copied the webpack script to ./scanapp-jsminified/scanapp-js.pro.min.v${VERSION}.js"

cp "./scanapp-js/minified/scanapp-js.pro.min.v${VERSION}.js" "./assets/js/scanapp-js.pro.min.v${VERSION}.js"

echo "Webpack building done."

echo "Cleaning up..."

rm -rf ./scanapp-js/minified
rm -rf ./scanapp-js/dist
rm -rf ./scanapp-js/src/html5-qrcode/*/*.d.ts
rm -rf ./scanapp-js/src/scanapp/*/*.d.ts
