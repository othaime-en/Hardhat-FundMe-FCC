const { assert, expect } = require("chai")
const { deployments, ethers, getNamedAccounts } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

// Our units tests will only run on development chains (hardhat, and localhost)
!developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async () => {
          let fundMe,
              deployer,
              mockV3Aggregator,
              sendValue = ethers.utils.parseEther("1") // converts to wei
          beforeEach(async () => {
              // similar to const accounts = await ethers.getSigners(); accountZero = accounts[0]
              deployer = (await getNamedAccounts()).deployer
              // Will go through all our scripts in the deploy folder and deploy them
              await deployments.fixture(["all"])
              // This will give us the most recently deployed FundMe contract and attach it to the deployer account so that whenever we call the a function from FundMe, it will be
              fundMe = await ethers.getContract("FundMe", deployer)
              mockV3Aggregator = await ethers.getContract(
                  "MockV3Aggregator",
                  deployer
              )
          })

          describe("constructor", async () => {
              it("sets the aggregator addresses correctly", async () => {
                  const response = await fundMe.getPriceFeed()
                  assert.equal(response, mockV3Aggregator.address)
              })
          })

          describe("fund", async () => {
              it("fails if you don't send enough ETH", async () => {
                  await expect(fundMe.fund()).to.be.revertedWith(
                      "Didn't send enough"
                  ) // we expect this to fail because we didn't send any eth
              })

              it("updates the amount funded data structure", async () => {
                  await fundMe.fund({ value: sendValue })
                  const response = await fundMe.getAddressToAmountFunded(
                      deployer
                  )
                  assert.equal(response.toString(), sendValue.toString())
              })

              it("Adds funder to array of getFunders", async () => {
                  await fundMe.fund({ value: sendValue })
                  const funder = await fundMe.getFunders(0)
                  assert.equal(funder, deployer)
              })
          })

          describe("Withdraw", async () => {
              beforeEach(async () => {
                  await fundMe.fund({ value: sendValue })
              })

              it("withdraw ETH from a single founder", async () => {
                  //Arrange
                  const startingFundMeBalance =
                      await ethers.provider.getBalance(fundMe.address)
                  const startingDeployerBalance =
                      await ethers.provider.getBalance(deployer)

                  // Act
                  const transactionResponse = await fundMe.withdraw()
                  const transactionReciept = await transactionResponse.wait(1)

                  // Getting the gas used in the transaction
                  const { gasUsed, effectiveGasPrice } = transactionReciept
                  const gasCost = effectiveGasPrice.mul(gasUsed)

                  const endingFundMeBalance = await ethers.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance =
                      await ethers.provider.getBalance(deployer)

                  // Assert
                  assert.equal(endingFundMeBalance.toString(), "0")
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  )
              })

              it("allows us to withdraw with multiple getFunders", async () => {
                  const accounts = await ethers.getSigners()
                  // simulating multiple funding transactions
                  for (let i = 1; i < 6; i++) {
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i]
                      )
                      await fundMeConnectedContract.fund({ value: sendValue })
                  }

                  const startingFundMeBalance =
                      await ethers.provider.getBalance(fundMe.address)
                  const startingDeployerBalance =
                      await ethers.provider.getBalance(deployer)

                  // Act
                  const transactionResponse = await fundMe.withdraw()
                  const transactionReciept = await transactionResponse.wait(1)

                  // Getting the gas used in the transaction
                  const { gasUsed, effectiveGasPrice } = transactionReciept
                  const gasCost = effectiveGasPrice.mul(gasUsed)

                  const endingFundMeBalance = await ethers.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance =
                      await ethers.provider.getBalance(deployer)

                  // Assert
                  assert.equal(endingFundMeBalance.toString(), "0")
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  )

                  // Make sure the getFunders are reset properly
                  await expect(fundMe.getFunders(0)).to.be.reverted

                  // looping through all the funding accounts and make sure their balances are zero
                  for (let i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.getAddressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      )
                  }
              })

              it("Only allows the owner to withdraw", async () => {
                  const accounts = await ethers.getSigners()
                  const attacker = accounts[1]
                  const attackerConnectedContract = await fundMe.connect(
                      attacker
                  )
                  await expect(
                      attackerConnectedContract.withdraw()
                  ).to.be.revertedWith("FundMe__NotOwner")
              })

              it("testing the cheaper withdraw function", async () => {
                  const accounts = await ethers.getSigners()
                  // simulating multiple funding transactions
                  for (let i = 1; i < 6; i++) {
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i]
                      )
                      await fundMeConnectedContract.fund({ value: sendValue })
                  }

                  const startingFundMeBalance =
                      await ethers.provider.getBalance(fundMe.address)
                  const startingDeployerBalance =
                      await ethers.provider.getBalance(deployer)

                  // Act
                  const transactionResponse = await fundMe.cheaperWithdraw()
                  const transactionReciept = await transactionResponse.wait(1)

                  // Getting the gas used in the transaction
                  const { gasUsed, effectiveGasPrice } = transactionReciept
                  const gasCost = effectiveGasPrice.mul(gasUsed)

                  const endingFundMeBalance = await ethers.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance =
                      await ethers.provider.getBalance(deployer)

                  // Assert
                  assert.equal(endingFundMeBalance.toString(), "0")
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  )

                  // Make sure the getFunders are reset properly
                  await expect(fundMe.getFunders(0)).to.be.reverted

                  // looping through all the funding accounts and make sure their balances are zero
                  for (let i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.getAddressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      )
                  }
              })
          })
      })
