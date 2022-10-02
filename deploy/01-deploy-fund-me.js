/* This is the main script for deploying the FundMe contract.
 * If we are on a development chain, we deploy MockV3Aggregator, get the address and assign it to ethUsdPriceFeedAddress
 * If we are on a testnet, we get the address of the real AggregatorV3 contract and assign it to ethUsdPriceFeedAddress
 */

const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { network } = require("hardhat")
const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    // alternating price feed addresses when we are on different chains
    // const ethUsdPriceFeedAddress = networkConfig[chainId].ethUsdPriceFeed
    let ethUsdPriceFeedAddress
    if (developmentChains.includes(network.name)) {
        // getting the most recent deployment of MockV3Aggregator
        // Use ethers.getContract if you are calling a function from whatever contract you retrieve.
        let ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId].ethUsdPriceFeed
    }

    const args = [ethUsdPriceFeedAddress]
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmation || 1,
    })
    log(`FundMe deployed by ${deployer} at ${fundMe.address}`)
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
