const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");

describe("Token contract", function () {
    // We define a fixture to reuse the same setup in every test. We use
    // loadFixture to run this setup once, snapshot that state, and reset Hardhat
    // Network to that snapshot in every test.
    async function deployTokenFixture() {
      // Get the ContractFactory and Signers here.
      const Token = await ethers.getContractFactory("IDToken");
      const [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();
  
      // To deploy our contract, we just have to call Token.deploy() and await
      // its deployed() method, which happens once its transaction has been
      // mined.
      const idToken = await Token.deploy();
  
      await idToken.deployed();
  
      // Fixtures can return anything you consider useful for your tests
      return { Token, idToken, owner, addr1, addr2, addr3, addr4 };
    }
/*
    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            const { idToken, owner } = await loadFixture(deployTokenFixture);
            await expect(await idToken.owner()).to.equal(owner.address);
          });
    });

    describe("Issuance", function(){
        it("Should emit Transfer event when token issued", async function () {
            const { idToken, owner, addr1} = await loadFixture(deployTokenFixture);
            expect(await idToken.issue(addr1.address,"")).to.emit(idToken,"Transfer").withArgs(owner.address, addr1.address, 1);
        });
        it("Should mint token to the correct address", async function () {
            const { idToken, owner, addr1 } = await loadFixture(deployTokenFixture);
            await idToken.issue(addr1.address,"");
            const mintedToken = await idToken.tokenOf(addr1.address);
            expect(await idToken.ownerOf(mintedToken)).to.equal(addr1.address);
        });
        it("Should not mint more than one token to an address", async function (){
            const { idToken, owner, addr1 } = await loadFixture(deployTokenFixture);
            await idToken.issue(addr1.address,"");
            await expect(idToken.issue(addr1.address,"")).to.be.reverted;
        });
        it("Should revert if called by not owner", async function (){
            const { idToken, owner, addr1 } = await loadFixture(deployTokenFixture);
            expect(idToken.connect(addr1).issue(addr1.address,"")).to.be.reverted;
        });
        it("Should mint tokens to different users", async function (){
            const { idToken, owner, addr1, addr2 } = await loadFixture(deployTokenFixture);
            await idToken.issue(addr1.address,"");
            await idToken.issue(addr2.address,"");
            const mintedToken1 = await idToken.tokenOf(addr1.address);
            const mintedToken2 = await idToken.tokenOf(addr2.address);
            await expect(await idToken.ownerOf(mintedToken1)).to.equal(addr1.address);
            expect(await idToken.ownerOf(mintedToken2)).to.equal(addr2.address);
        });
    });
    describe("Updating",function (){
        it("Should update if called by holder", async function (){
            const { idToken, owner, addr1 } = await loadFixture(deployTokenFixture);
            await idToken.issue(addr1.address,"");
            const mintedToken = await idToken.tokenOf(addr1.address);
            await idToken.connect(addr1).updateURI(mintedToken,"newuri");
            //await expect(await idToken.connect(addr1).updateURI(mintedToken,"newuri")).to.emit(idToken,"URIUpdate").withArgs(mintedToken,"newuri");
            expect(await idToken.tokenURI(mintedToken)).to.equal("newuri");
        });
        it("Should revert if called by anyone else", async function (){
            const { idToken, owner, addr1, addr2} = await loadFixture(deployTokenFixture);
            await idToken.issue(addr1.address,"");
            const mintedToken = await idToken.tokenOf(addr1.address);
            await expect(idToken.updateURI(mintedToken,"newuri")).to.be.reverted;
            expect(idToken.connect(addr2).updateURI(mintedToken,"newuri")).to.be.reverted;
        });
        it("Should revoke token if called by contract owner", async function (){
            const { idToken, owner, addr1, addr2} = await loadFixture(deployTokenFixture);
            await idToken.issue(addr1.address,"");
            const mintedToken = await idToken.tokenOf(addr1.address);
            await idToken.revoke(mintedToken);
            //await expect(await idToken.revoke(mintedToken)).to.emit(idToken,"Transfer").withArgs(addr1.address,ethers.constants.AddressZero,mintedToken);
            expect(idToken.tokenOf(addr1.address)).to.be.reverted;
        });
        it("Should revert if revoke called by anyone else", async function (){
            const { idToken, owner, addr1, addr2} = await loadFixture(deployTokenFixture);
            await idToken.issue(addr1.address,"");
            const mintedToken = await idToken.tokenOf(addr1.address);
            await expect(idToken.connect(addr2).revoke(mintedToken)).to.be.reverted;
            expect(idToken.connect(addr2).revoke(mintedToken)).to.be.reverted;
        });
    });
    describe("Verifiable Credentials", function(){
        //it("Should emit Credential Issued event when token issued", async function () {
        //    const { idToken, owner, addr1} = await loadFixture(deployTokenFixture);
        //    const msgHash = ethers.utils.hashMessage("msg");
        //    const msgBytes = ethers.utils.arrayify(msgHash) // create binary hash
        //    const signature = await addr1.signMessage("msg");
        //    const publicKey = ethers.utils.recoverPublicKey(msgBytes, signature);
        //    //await expect(await idToken.addCredential(0,publicKey)).to.emit(idToken,"CredentialIssued").withArgs(0);
        //    await idToken.connect(owner).addCredential(0,publicKey,addr1.address)
        //    //await expect(await idToken.connect(owner).addCredential(0,publicKey,addr1.address)).to.emit(idToken,"CredentialIssued").withArgs(0);
        });
        it("Should assign the correct signer", async function () {
            const { idToken, owner, addr1} = await loadFixture(deployTokenFixture);

            const msgHash = ethers.utils.hashMessage("msg");
            const msgBytes = ethers.utils.arrayify(msgHash) // create binary hash
            const signature = await addr1.signMessage("msg");
            const publicKey = ethers.utils.recoverPublicKey(msgBytes, signature);

            //await idToken.connect(addr1).addCredential(0,publicKey);
            await idToken.connect(owner).addCredential(0,publicKey,addr1.address);

            const signerAddress = await idToken.signerOf(0);
            const pubkey = await idToken.pubKeyOf(0);
            const computedAddress = await ethers.utils.computeAddress(pubkey);

            expect(computedAddress).to.equal(signerAddress);
            expect(signerAddress).to.equal(addr1.address);
            expect(pubkey).to.equal(publicKey);
        });
        it("Should revoke credential if called by signer", async function () {
            const { idToken, owner, addr1} = await loadFixture(deployTokenFixture);

            const msgHash = ethers.utils.hashMessage("msg");
            const msgBytes = ethers.utils.arrayify(msgHash) // create binary hash
            const signature = await addr1.signMessage("msg");
            const publicKey = ethers.utils.recoverPublicKey(msgBytes, signature);

            //await idToken.connect(addr1).addCredential(0,publicKey);
            await idToken.connect(owner).addCredential(0,publicKey,addr1.address);
            await idToken.connect(addr1).revokeCredential(0);
            expect(idToken.signerOf(0)).to.be.reverted;
        });
        it("Should revert if revoked by not signer",async function () {
            const { idToken, owner, addr1, addr2} = await loadFixture(deployTokenFixture);

            const msgHash = ethers.utils.hashMessage("msg");
            const msgBytes = ethers.utils.arrayify(msgHash) // create binary hash
            const signature = await addr1.signMessage("msg");
            const publicKey = ethers.utils.recoverPublicKey(msgBytes, signature);

            //await idToken.connect(addr1).addCredential(0,publicKey);
            await idToken.connect(owner).addCredential(0,publicKey,addr1.address);
            expect(idToken.connect(addr2).revokeCredential(0)).to.be.reverted;
        });
    });
*/
    describe("Deployment", function () {
        it("Issue Token", async function () {
            const { idToken, owner, addr1, addr2, addr3, addr4 } = await loadFixture(deployTokenFixture);
            await idToken.issue(addr1.address,"");
            await idToken.issue(addr2.address,"");
            await idToken.issue(addr3.address,"");
            await idToken.issue(addr4.address,"");
            await idToken.revoke(0);
            await idToken.revoke(1);
            await idToken.revoke(2);
            await idToken.revoke(3);
        });
        it("Issue VC", async function () {
            const { idToken, owner, addr1} = await loadFixture(deployTokenFixture);
            const msgHash = ethers.utils.hashMessage("msg");
            const msgBytes = ethers.utils.arrayify(msgHash) // create binary hash
            const signature = await addr1.signMessage("msg");
            const publicKey = ethers.utils.recoverPublicKey(msgBytes, signature);
            await idToken.connect(owner).addCredential(0,publicKey,addr1.address);
            await idToken.connect(owner).addCredential(1,publicKey,addr1.address);
            await idToken.connect(owner).addCredential(2,publicKey,addr1.address);
            await idToken.connect(owner).addCredential(3,publicKey,addr1.address);
            await idToken.connect(addr1).revokeCredential(0);
            await idToken.connect(addr1).revokeCredential(1);
            await idToken.connect(addr1).revokeCredential(2);
            await idToken.connect(addr1).revokeCredential(3);
        });
    });
})