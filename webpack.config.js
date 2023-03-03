const path = require("path");

const VERSION = "2.3.8";

module.exports = {
    // bundling mode
    mode: "production",
    // entry files
    entry: "./scanapp-js/src/index.ts",
    // output bundles (location)
    output: {
        path: path.resolve( __dirname, "scanapp-js/dist" ),
        filename: "scanapp-js.pro.min.js",
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
        minimize: false,
        usedExports: true
    }
};
