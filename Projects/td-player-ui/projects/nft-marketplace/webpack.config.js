const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");

module.exports = {
  mode: "development",
  plugins: [
    new ModuleFederationPlugin({
      name: "nftMarketplace",
      filename: "remoteEntry.js",
      exposes: {
        "./Component": "./src/app/nft-marketplace/nft-marketplace.component.ts",
      },
      shared: {
        "@angular/core": { singleton: true },
        "@angular/common": { singleton: true },
      },
    }),
  ],
};
