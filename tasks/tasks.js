// This is just a sample task page.
const { task } = require("hardhat/config")

task("accounts", "Prints the list of hardhat accounts").setAction(
    async (taskArgs, hre) => {
        const accounts = await hre.ethers.getSigners()

        for (account of accounts) {
            console.log(account.address)
        }
    }
)

task(
    "block-number",
    "Prints the latest block number",
    async (taskArgs, hre) => {
        const blockNumber = await hre.ethers.provider.getBlockNumber()
        console.log(blockNumber)
    }
)

module.exports = {}
