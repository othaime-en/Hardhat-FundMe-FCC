# Advanced Sample Hardhat Project

This project demonstrates an advanced Hardhat use case, integrating other tools commonly used alongside Hardhat in the ecosystem.

The project comes with a sample contract, a test for that contract, a sample script that deploys that contract, and an example of a task implementation, which simply lists the available accounts. It also comes with a variety of other tools, preconfigured to work with the project code.

Try running some of the following tasks:

```shell
yarn hardhat accounts
yarn hardhat compile
yarn hardhat clean
yarn hardhat node
yarn hardhat help
yarn hardhat block-number --network rinkeby
REPORT_GAS=true yarn hardhat test
yarn hardhat run scripts/deploy.js
node scripts/deploy.js
yarn coverage
yarn test
yarn format
yarn lint
yarn lint:fix
```

# Etherscan verification

To try out Etherscan verification, you first need to deploy a contract to an Ethereum network that's supported by Etherscan, such as Ropsten.

In this project, copy the .env.example file to a file named .env, and then edit it to fill in the details. Enter your Etherscan API key, your Ropsten node URL (eg from Alchemy), and the private key of the account which will send the deployment transaction. With a valid .env file in place, first deploy your contract:

```shell
yarn hardhat run --network rinkeby scripts/run.js
```

Then, copy the deployment address and paste it in to replace `DEPLOYED_CONTRACT_ADDRESS` in this command:

```shell
yarn hardhat verify --network rinkeby DEPLOYED_CONTRACT_ADDRESS "Hello, Hardhat!"
```
