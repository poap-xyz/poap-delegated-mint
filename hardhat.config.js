require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");

const { infuraId, etherscanKey } = require('./secrets.json');

module.exports = {
  solidity: "0.5.15",
  networks: {
    mainnet: {
      url: `https://mainnet.infura.io/v3/${infuraId}`
    }
  },
  etherscan: {
    apiKey: etherscanKey
  }
};
