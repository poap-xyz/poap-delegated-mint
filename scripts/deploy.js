require('dotenv').config()
const { getEnvVariable } = require("../utils/sign-message");

async function main() {
  // Deploy variables
  const network = getEnvVariable('NETWORK');
  const poapContractAddress = getEnvVariable('POAP_ADDRESS');
  const poapSignerAddress = getEnvVariable('SIGNER_ADDRESS');
  const privateKey = getEnvVariable('PK_DEPLOYER');

  let provider = network === 'localhost' ? new ethers.providers.JsonRpcProvider('http://localhost:9545') : new ethers.getDefaultProvider(network);
  const deployer = new ethers.Wallet(privateKey, provider);

  console.log(
    "Deploying the contracts with the account:",
    await deployer.getAddress()
  );

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const PoapDelegatedMint = await ethers.getContractFactory("PoapDelegatedMint", deployer);
  const contract = await PoapDelegatedMint.deploy(poapContractAddress, poapSignerAddress);
  await contract.deployed();

  console.log("Contract address:", contract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
