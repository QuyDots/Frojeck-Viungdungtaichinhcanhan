require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();

const { RPC_URL="https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY", PRIVATE_KEY="0xYOUR_PRIVATE_KEY" } = process.env;

module.exports = {
  solidity: "0.8.19",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    sepolia: {
      url: RPC_URL || '',
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : []
    }
  }
};
