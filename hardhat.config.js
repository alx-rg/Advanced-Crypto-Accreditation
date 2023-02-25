require("@nomiclabs/hardhat-ethers");
require('dotenv').config();

module.exports = {
  defaultNetwork: "goerli",
  networks: {
    hardhat: {
    },
    goerli: {
      url: "https://goerli.infura.io/v3/af7be33c06e146e8b81c44a12531cd50",
      accounts: [process.env.PRIVATE_KEY]
    }
  },
  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
}


// module.exports = {
//   defaultNetwork: "bsc",
//   networks: {
//     hardhat: {
//     },
//     bsc: {
//       url: "https://data-seed-prebsc-1-s1.binance.org:8545",
//       chainId: 97,
//       gasPrice: 20000000000,
//       accounts: [process.env.PRIVATE_KEY]
//     }
//   },
//   solidity: {
//     version: "0.8.17",
//     settings: {
//       optimizer: {
//         enabled: true,
//         runs: 200
//       }
//     }
//   },
// }

// goerli: {
//   url: "https://goerli.infura.io/v3/af7be33c06e146e8b81c44a12531cd50", // <---- YOUR INFURA ID! (or it won't work)
//   //      url: "https://speedy-nodes-nyc.moralis.io/XXXXXXXXXXXXXXXXXXXXXXXXX/eth/goerli", // <---- YOUR MORALIS ID! (not limited to infura)
//   accounts: {
//     mnemonic: mnemonic(),
//   },
// },

// priority rookie leisure predict gap differ column impact long around clap large