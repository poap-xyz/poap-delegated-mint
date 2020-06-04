<h1 align="center">POAP Delegated minting</h1>
<p align="center">🎖️ Claim your badges without waiting 🎖️</p>

## Inspiration ##
Many [POAP](https://www.poap.xyz) users can't wait for their tokens and are willing to pay the cost of the transaction in order to get it as soon as possible when the Gas Price of the network is too high.

Given the protocol architecture, it's possible to have a contract authorized to mint tokens for the events. The challenge here is to make sure that the requests for mint are valid.

With a simple signed message from the POAP administrator account it's possible to verify it on the EVM and mint the token.

### Signed message ###
The signed messages include the event identifier and the address that will receive the token. 

As the receiver address might not be the sender, the contract will receive both params and the signature to validate it.

In the utils folder, the [sign-message.js](./utils/sign-message.js) file there's a sample script of how the signature should be made by the POAP admin account.

## Setup ##
This project uses [buidler](https://buidler.dev) to compile, test and deploy the contracts.

Install dependencies
```
yarn install
```


## Useful commands ##

```bash
yarn compile        # Compile contract
yarn chain          # Run a local network
yarn test           # Run tests
```

### Deploy ###
Copy of `.env.template` to `.env` and complete with your variables before running the script below
```bash
npx buidler run scripts/deploy.js
```

#### Verifying the contract ####
Used [solidity-flattner](https://github.com/BlockCatIO/solidity-flattener) with the following command
```bash
solidity_flattener contracts/PoapDelegatedMint.sol --solc-paths="@openzeppelin/=$(pwd)/node_modules/@openzeppelin/" --output PoapDelegatedMintFlattened.sol
```

## Deployed contracts ##
 - Mainnet: [0xAac2497174f2Ec4069A98375A67D798db8a05337](https://etherscan.io/address/0xAac2497174f2Ec4069A98375A67D798db8a05337)
 - Ropsten: [0x2f3c23b50396EcB55C73956B069CF04e493bdEf9](https://ropsten.etherscan.io/address/0x2f3c23b50396EcB55C73956B069CF04e493bdEf9)

## TODO list ##
- [x] Add tests for token minting
- [x] Create a deploy script


## Going live ##
Before going live, it's necessary to:
- [x] Add the deployed address contract as a POAP event minter
- [x] Add an endpoint to the POAP server to validate a QR claim and sign the corresponding message
- [x] Change the [POAP claim frontend](https://app.poap.xyz/claim) to allow users to pay the gas of their token mint
