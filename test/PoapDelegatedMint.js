const { expect } = require("chai");

const { signMessage } = require("../utils/sign-message");

describe("Poap delegated mint contract", function () {
  let Poap;
  let PoapDelegatedMint;
  let contractPoap;
  let contractDelegatedMint;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  // Address that will sign the messages
  const poapSignerAddress = '0xc783df8a850f42e7F7e57013759C285caa701eB6';
  const poapSignerKey = '0xc5e8f61d1ab959b397eecc0a37a6517b8e67a0e7cf1f4bce5591f3ed80199122';

  // Address that will sign the messages
  const unknownSignerKey = '0x8b24fd94f1ce869d81a34b95351e7f97b2cd88a891d5c00abc33d0ec9501902e';

  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    Poap = await ethers.getContractFactory("Poap");
    contractPoap = await Poap.deploy();
    await contractPoap.deployed();

    PoapDelegatedMint = await ethers.getContractFactory("PoapDelegatedMint");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    // Deploying our contract
    contractDelegatedMint = await PoapDelegatedMint.deploy(contractPoap.address, poapSignerAddress);
    await contractDelegatedMint.deployed();
  });

  describe("Deployment", function () {

    it("Should set the right owner", async function () {
      expect(await contractDelegatedMint.owner()).to.equal(await owner.getAddress());
    });

    it("Should set the right valid signer", async function () {
      expect(await contractDelegatedMint.validSigner()).to.equal(poapSignerAddress);
    });

		it("Should set the right pauser", async function () {
			const address = await owner.getAddress()
			expect(await contractDelegatedMint.isPauser(address)).to.equal(true);
		});

    it("Should fail at an invalid signature", async function () {
      let eventValid = 1;
      let eventInvalid = 2;

      let tokenValid = 1;
      let tokenInvalid = 2;

      let receiverValid = await addr1.getAddress();
      let receiverInvalid = await addr2.getAddress();

      let signatureValid = signMessage(poapSignerKey, eventValid, tokenValid, receiverValid);
      let signatureInvalid = signMessage(poapSignerKey, eventInvalid, tokenInvalid, receiverInvalid);
      let signatureUnknown = signMessage(unknownSignerKey, eventValid, tokenValid, receiverValid);

      await expect(contractDelegatedMint.mintToken(eventValid, tokenInvalid, receiverInvalid, signatureValid)).to.be.revertedWith("Invalid signed message");
      await expect(contractDelegatedMint.mintToken(eventValid, tokenInvalid, receiverValid, signatureValid)).to.be.revertedWith("Invalid signed message");
      await expect(contractDelegatedMint.mintToken(eventValid, tokenValid, receiverInvalid, signatureValid)).to.be.revertedWith("Invalid signed message");
      await expect(contractDelegatedMint.mintToken(eventInvalid, tokenInvalid, receiverValid, signatureValid)).to.be.revertedWith("Invalid signed message");
      await expect(contractDelegatedMint.mintToken(eventInvalid, tokenValid, receiverValid, signatureValid)).to.be.revertedWith("Invalid signed message");
      await expect(contractDelegatedMint.mintToken(eventValid, tokenValid, receiverValid, signatureInvalid)).to.be.revertedWith("Invalid signed message");
      await expect(contractDelegatedMint.mintToken(eventValid, tokenValid, receiverValid, signatureUnknown)).to.be.revertedWith("Invalid signed message");
    });

    it("Should mint token after successful validation", async function () {
      let event = 1;
      let token = 2;
      let receiver1 = await addr1.getAddress();
      let signature = signMessage(poapSignerKey, event, token, receiver1);
      await contractDelegatedMint.mintToken(event, token, receiver1, signature);
      expect(await contractPoap.balanceOf(receiver1)).to.equal(1);
    });

    it("Should fail at a processed signature", async function () {
      let event = 1;
      let token = 1;
      let receiver = await addr1.getAddress();
      let signature = signMessage(poapSignerKey, event, token, receiver);

      // Mint valid token
      await contractDelegatedMint.mintToken(event, token, receiver, signature);
      expect(await contractPoap.balanceOf(receiver)).to.equal(1);

      // Submit the same transaction a second time
      await expect(contractDelegatedMint.mintToken(event, token, receiver, signature)).to.be.revertedWith("Signature already processed");
      expect(await contractPoap.balanceOf(receiver)).to.equal(1);
    });

    it("Should fail at a processed token", async function () {
			let event = 1;
			let token = 1;
			let receiver1 = await addr1.getAddress();
			let receiver2 = await addr2.getAddress();
			let signature1 = signMessage(poapSignerKey, event, token, receiver1);
			let signature2 = signMessage(poapSignerKey, event, token, receiver2);

			// Mint valid token
			await contractDelegatedMint.mintToken(event, token, receiver1, signature1);
			expect(await contractPoap.balanceOf(receiver1)).to.equal(1);

			// Submit the same transaction a second time
			await expect(contractDelegatedMint.mintToken(event, token, receiver2, signature2)).to.be.revertedWith("Token already processed");
			expect(await contractPoap.balanceOf(receiver2)).to.equal(0);
		});

    it("Should fail when the contract is paused", async function () {
			let event = 1;
			let token = 1;
			let receiver = await addr1.getAddress();
			let signature = signMessage(poapSignerKey, event, token, receiver);

			// Pause the contract
			await contractDelegatedMint.pause();
			// Mint valid token
			await expect(contractDelegatedMint.mintToken(event, token, receiver, signature)).to.be.revertedWith("Pausable: paused");
		});

    it("Should renounce as a PoapAdmin", async function () {
			await contractPoap.addAdmin(contractDelegatedMint.address);
			expect(await contractPoap.isAdmin(contractDelegatedMint.address)).to.be.equal(true);
			await contractDelegatedMint.renouncePaopAdmin();
			expect(await contractPoap.isAdmin(contractDelegatedMint.address)).to.be.equal(false);
		});

    it("Should allow multiple mints for same receiver", async function () {
      let event1 = 1;
      let token1 = 1;
      let event2 = 2;
      let token2 = 2;
      let receiver = await addr1.getAddress();
      let signature1 = signMessage(poapSignerKey, event1, token1, receiver);
      let signature2 = signMessage(poapSignerKey, event2, token2, receiver);

      // Mint valid token
      await contractDelegatedMint.mintToken(event1, token1, receiver, signature1);
      expect(await contractPoap.balanceOf(receiver)).to.equal(1);

      await contractDelegatedMint.mintToken(event2, token2, receiver, signature2);
      expect(await contractPoap.balanceOf(receiver)).to.equal(2);
    });

  });

});
