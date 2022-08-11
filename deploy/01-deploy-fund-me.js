/* This is the main script for deploying the FundMe contract.
 * The Main determinant is ethUsdPriceFeedAddress which is obtained by the if statement
 * If we are on a development chain, we deploy MockV3Aggregator, get the address and assign it to ethUsdPriceFeedAddress
 * If we are on a testnet, we get the address of the real AggregatorV3 contract and assign it to ethUsdPriceFeedAddress
 */

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
        // getting the most recent deployment of MockV3Aggregator and assigning its address as the ethUsdPriceFeedAddress
        let ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId].ethUsdPriceFeed
    }

    const args = [ethUsdPriceFeedAddress]
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args, // put priceFeedAddress here
        log: true,
        waitConfirmations: network.config.blockConfirmation || 1, // change if you are working with a testnet
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
