const path = require("path");
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
    // bundling mode
    mode: "production",
    // entry files
    entry: {
        "scanapp-js.pro.min": "./scanapp-js/src/index.ts",
        "scanapp-v2.min": "./scanapp-js/src/v2/index.ts"
    },
    // output bundles (location)
    output: {
        path: path.resolve( __dirname, "scanapp-js/dist" ),
        filename: "[name].js",
        library: "__Html5QrcodeLibrary__",
    },
    // file resolutions
    resolve: {
        extensions: [ ".ts", ".js" ],
    },
    target: "web",
    module: {
        rules: [
            {
                test: /\.tsx?/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
        ]
    },
    optimization: {
        minimize: true,
        usedExports: true
    },
    plugins: [
        // new BundleAnalyzerPlugin()
    ]
};
