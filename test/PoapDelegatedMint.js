const { expect } = require("chai");

const utils = require("../utils/sign-message")

describe("Poap delegated mint contract", function () {
  let PoapDelegatedMint;
  let contract;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  // Address of the POAP contract deployed
  const poapContract = '0x22c1f6050e56d2876009903609a2cc3fef83b415';

  // Address that will sign the messages
  const poapSignerAddress = '0xc783df8a850f42e7F7e57013759C285caa701eB6';
  const poapSignerKey = '0xc5e8f61d1ab959b397eecc0a37a6517b8e67a0e7cf1f4bce5591f3ed80199122';

  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    PoapDelegatedMint = await ethers.getContractFactory("PoapDelegatedMint");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    // Deploying our contract
    contract = await PoapDelegatedMint.deploy(poapContract, poapSignerAddress);
    await contract.deployed();
  });

  describe("Deployment", function () {

    it("Should set the right owner", async function () {
      expect(await contract.owner()).to.equal(await owner.getAddress());
    });

    it("Should set the right valid signer", async function () {
      expect(await contract.validSigner()).to.equal(poapSignerAddress);
    });
  });

});
