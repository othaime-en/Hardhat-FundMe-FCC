require("dotenv").config()
require("@nomiclabs/hardhat-etherscan")
require("@nomiclabs/hardhat-waffle")
require("hardhat-gas-reporter")
require("solidity-coverage")
require("hardhat-deploy")
require("./tasks/tasks")

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
const RINKEBY_RPC_URL = process.env.RINKEBY_RPC_URL
const PRIVATE_KEY = process.env.PRIVATE_KEY
const PRIVATE_KEY_2 = process.env.PRIVATE_KEY_2
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY

module.exports = {
    // solidity: "0.8.8",
    solidity: {
        compilers: [{ version: "0.8.8" }, { version: "0.6.6" }],
    },
    defaultNetwork: "hardhat",
    networks: {
        rinkeby: {
            url: RINKEBY_RPC_URL || "",
            accounts: [PRIVATE_KEY, PRIVATE_KEY_2],
            chainId: 4,
            blockConfirmations: 2,
        },
        localhost: {
            url: "http://localhost:8545",
        },
    },
    gasReporter: {
        enabled: process.env.REPORT_GAS ? true : false, // change to true or false if you are on windows.
        outputFile: "gas-report.txt",
        coinmarketcap: COINMARKETCAP_API_KEY,
        currency: "USD",
        noColors: true,
        token: "ETH",
    },
    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },
    namedAccounts: {
        deployer: { default: 0, 4: 1 },
        users: { default: 0 },
    },
}
