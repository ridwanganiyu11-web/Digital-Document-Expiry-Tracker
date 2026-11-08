/**
 * Hardhat / Ethers Deployment Script for DocumentExpiryRegistry
 * Network: Bohr Testnet (Chain ID 968)
 * RPC: https://rpc.bohr.life
 * Explorer: https://scan.bohr.life
 */

const hre = require("hardhat");

async function main() {
  console.log("Deploying DocumentExpiryRegistry to Bohr Testnet (Chain ID 968)...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const DocumentExpiryRegistry = await hre.ethers.getContractFactory("DocumentExpiryRegistry");
  const registry = await DocumentExpiryRegistry.deploy();

  await registry.waitForDeployment();
  const address = await registry.getAddress();

  console.log("DocumentExpiryRegistry successfully deployed to:", address);
  console.log(`Verify on BohrScan: https://scan.bohr.life/address/${address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

