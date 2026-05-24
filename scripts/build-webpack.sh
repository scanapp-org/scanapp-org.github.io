#!/bin/bash
## Build Script
echo "Initiating webpack build sequence."

export NODE_OPTIONS=--openssl-legacy-provider

VERSION="2.6.1.beta"

node node_modules/webpack-cli/bin/cli.js

mkdir -p scanapp-js/minified
cp "./scanapp-js/dist/scanapp-js.pro.min.js" "./scanapp-js/minified/scanapp-js.pro.min.v${VERSION}.js"
echo "Copied the webpack script to ./scanapp-js/minified/scanapp-js.pro.min.v${VERSION}.js"

cp "./scanapp-js/minified/scanapp-js.pro.min.v${VERSION}.js" "./assets/js/scanapp-js.pro.min.v${VERSION}.js"

# Copy the v2 bundle
cp "./scanapp-js/dist/scanapp-v2.min.js" "./assets/js/scanapp-v2.min.js"
echo "Copied scanapp-v2.min.js to ./assets/js/scanapp-v2.min.js"

echo "Webpack building done."

echo "Cleaning up..."

rm -rf ./scanapp-js/minified
rm -rf ./scanapp-js/dist
rm -rf ./scanapp-js/src/html5-qrcode/*/*.d.ts
rm -rf ./scanapp-js/src/scanapp/*/*.d.ts
