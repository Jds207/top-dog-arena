const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");

module.exports = {
  mode: "development",
  plugins: [
    new ModuleFederationPlugin({
      name: "shell",
      remotes: {
        nftMarketplace: "nftMarketplace@http://localhost:4202/remoteEntry.js",
      },
      shared: {
        "@angular/core": { singleton: true },
        "@angular/common": { singleton: true },
      },
    }),
  ],
};
