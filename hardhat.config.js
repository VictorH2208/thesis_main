require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-ethers");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  mocha: {
    timeout: 1000000
  },
  defaultNetwork: "localhost",
  networks: {
      localhost: {
          blockGasLimit: 600000000 // Network block gasLimit
      },
  },
};
