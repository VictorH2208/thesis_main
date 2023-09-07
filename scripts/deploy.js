// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const path = require("path");
const TokenArtifact = require("../artifacts/contracts/IDToken.sol/IDToken.json");

async function main() {
  if (network.name === "hardhat") {
    console.warn(
      "You are trying to deploy a contract to the Hardhat Network, which" +
        "gets automatically created and destroyed every time. Use the Hardhat" +
        " option '--network localhost'"
    );
  }

  //let provider = await new ethers.providers.JsonRpcProvider("http://localhost:8545");
  //const deployer = provider.getSigner(contractAddress.Deployer);
  const [deployer,addr1, addr2, addr3, addr4] = await ethers.getSigners();
  console.log(
    "Deploying the contracts with the account:",
    await deployer.getAddress()
  );

  //const Token = await ethers.getContractFactory("IDToken");
  const Token = new ethers.ContractFactory(TokenArtifact.abi,TokenArtifact.bytecode,deployer);
  const token = await Token.connect(deployer).deploy();
  await token.deployed();

  console.log("Token address:", token.address);

  // We also save the contract's artifacts and address in the frontend directory
  saveFrontendFiles(token,deployer);
}

function saveFrontendFiles(token,deployer) {
  const fs = require("fs");
  const contractsDir = path.join(__dirname, "..", "src", "contracts");

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    path.join(contractsDir, "contract-address.json"),
    JSON.stringify({ Contract: token.address, Deployer: deployer.address }, undefined, 2)
  );

  const TokenArtifact = artifacts.readArtifactSync("IDToken");

  fs.writeFileSync(
    path.join(contractsDir, "IDToken.json"),
    JSON.stringify(TokenArtifact, null, 2)
  );

  const frontendContractsDir = path.join(__dirname, "..", "django_project", "frontend", "src", "artifacts", "contracts", "IDToken");
  if (!fs.existsSync(frontendContractsDir)) {
    fs.mkdirSync(frontendContractsDir);
  }

  fs.writeFileSync(
    path.join(frontendContractsDir, "contract-address.json"),
    JSON.stringify({ Contract: token.address, Deployer: deployer.address }, undefined, 2)
  );

  fs.writeFileSync(
    path.join(frontendContractsDir, "IDToken.json"),
    JSON.stringify(TokenArtifact, null, 2)
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
