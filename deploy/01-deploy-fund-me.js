/*
 * async function deployFunc(hre) {
 *   const { getNamedAccounts, deployments } = hre
 *   same as hre.getNamedAccounts() and hre.deployments
 * }
 * module.exports = deployFunc
 */

// const helperConfig = require("../helper-hardhat-config")
// const networkConfig = helperConfig.networkConfig
const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { network } = require("hardhat")
const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments // same as deployments.deploy or deployments.log
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    // alternating price feed addresses when we are on different chains
    // const ethUsdPriceFeedAddress = networkConfig[chainId].ethUsdPriceFeed
    let ethUsdPriceFeedAddress
    if (developmentChains.includes(network.name)) {
        let ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId].ethUsdPriceFeed
    }

    /*
     * when working with hardhat or localhost, we need to use mocks in place of modulirized contracts
     * this is because the contracts are not deployed on the blockchain/testnet we are working on
     * so we need to use a minimal version of it in our local testing. Check out 00-deploy-mocks.js
     */
    const args = [ethUsdPriceFeedAddress]
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args, // put priceFeedAddress here
        log: true,
        waitConfirmations: network.config.blockConfirmation || 6,
    })
    log("********************************************************")

    // adding a verification mechanism to verify contracts deployed on rinkeby
    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundMe.address, [ethUsdPriceFeedAddress])
    }
}

module.exports.tags = ["all", "fundme"]
