const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");


module.exports = {
    mode: 'development', // oder production

    entry: './src/index.js',

    node: {
        global: false,
        __filename: false,
        __dirname: false,

    },

    resolve: {

        fallback: {
            "fs": false,
            "path": false,
            "crypto": false,
        }
    },

    plugins: [
        new CopyPlugin({
            patterns: [
                { from: 'node_modules/sql.js/dist/sql-wasm.wasm', to: '' },
            ],
        }),
    ],

    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist'),
    },

    devServer: {
        contentBase: 'dist', //Hier sucht der Webserver nach Dateien
    },
};