const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const fs = require("fs");

// Chercher les certificats mkcert — deux emplacements possibles
let certKey = null;
let certFile = null;

if (fs.existsSync("localhost+1-key.pem") && fs.existsSync("localhost+1.pem")) {
  certKey = fs.readFileSync("localhost+1-key.pem");
  certFile = fs.readFileSync("localhost+1.pem");
} else if (fs.existsSync("certs/localhost.key") && fs.existsSync("certs/localhost.crt")) {
  // Note: les fichiers ont été nommés de façon inversée par l'utilisateur
  // localhost.crt contient la clé privée, localhost.key contient le certificat
  certKey = fs.readFileSync("certs/localhost.crt");
  certFile = fs.readFileSync("certs/localhost.key");
}

module.exports = {
  entry: {
    taskpane: "./src/taskpane/taskpane.js",
    functions: "./src/functions/functions.js",
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
    clean: true,
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: "src/taskpane/taskpane.html", to: "taskpane.html" },
        { from: "src/taskpane/taskpane.css", to: "taskpane.css" },
        { from: "src/functions/functions.html", to: "functions.html" },
        { from: "src/functions/functions.json", to: "functions.json" },
        { from: "manifest.xml", to: "manifest.xml" },
        {
          from: "assets",
          to: "assets",
          noErrorOnMissing: true,
        },
      ],
    }),
  ],
  devServer: {
    port: 3001,
    server: certKey
      ? {
          type: "https",
          options: {
            key: certKey,
            cert: certFile,
          },
        }
      : "https",
    static: {
      directory: path.join(__dirname, "dist"),
    },
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    devMiddleware: {
      writeToDisk: true,
    },
  },
};
