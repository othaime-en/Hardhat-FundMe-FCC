// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";

error FundMe__NotOwner();

/**
 * @title A contract for crowdfunding
 * @author Othaimeen
 * @notice This contract is to demo a simple funding campaign.
 * @notice This uses the NatSpec convention
 * @dev The contract is based on the AggregatorV3Interface and implements s_priceFeeds as our library
 */
contract FundMe {
    using PriceConverter for uint256;

    // keeping track of who sends funds to this contract
    address[] private s_funders;
    mapping(address => uint256) private s_addressToAmountFunded; // It is common practice to add a prefix s_ to the variable name to indicate that it is a storage variable

    address private immutable i_owner;
    uint256 public constant MINIMUM_USD = 5 * 10**18;

    AggregatorV3Interface private s_priceFeed;

    modifier onlyOwner() {
        // require(msg.sender == owner, "Sender is not owner");
        if (msg.sender != i_owner) revert FundMe__NotOwner();
        _;
    }

    constructor(address s_priceFeedAddress) {
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(s_priceFeedAddress);
    }

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    /**
     * @notice This function funds this contract
     * @dev This implements price feeds as our library
     */
    function fund() public payable {
        // using payable allows this contract to hold funds or tokens
        // we want to be able to set a minimum value in USD
        // require(getConversionRate(msg.value) >= minimumUSD, "Didn't send enough");
        // using the PriceConverter library
        require(
            msg.value.getConversionRate(s_priceFeed) >= MINIMUM_USD,
            "Didn't send enough"
        );
        s_funders.push(msg.sender);
        s_addressToAmountFunded[msg.sender] = msg.value;
    }

    function withdraw() public onlyOwner {
        for (
            uint256 funderIndex = 0;
            funderIndex < s_funders.length;
            funderIndex++
        ) {
            // looping through the addresses in the s_funders array and
            // resetting the balances of these addresses in the s_addressToAmountFunded mappins
            address funder = s_funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }

        // lets reset the array
        s_funders = new address[](0);

        /* USING CALL: doesn't have a gas limit, returns boolean and some data
         * returns two variables a bool and data returned from the function call at the end
         * we can safely disregard the second variable since we didn't call invoke any function
         */
        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess, "Call failed");
    }

    function cheaperWithdraw() public payable onlyOwner {
        address[] memory funders = s_funders;
        for (
            uint256 funderIndex = 0;
            funderIndex < funders.length;
            funderIndex++
        ) {
            address funder = funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        s_funders = new address[](0);
        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess, "Call failed");
    }

    /**
     * @notice This section refactors the visibility of some of our variables.
     * @notice We have changed the visibility of most of our variables above to private
     * @dev Now we create getter functions so that we can acces them from outside the contract
     * @dev remember to change the variable names in the FundMe.test.js file and any other files
     */

    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getFunders(uint256 _index) public view returns (address) {
        require(_index < s_funders.length, "Index out of bounds");
        return s_funders[_index];
    }

    function getAddressToAmountFunded(address _funder)
        public
        view
        returns (uint256)
    {
        return s_addressToAmountFunded[_funder];
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }
}
