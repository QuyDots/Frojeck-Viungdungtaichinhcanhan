async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deploying with account', deployer.address);
  const Factory = await ethers.getContractFactory('PersonalFinance');
  const contract = await Factory.deploy();
  await contract.deployed();
  console.log('PersonalFinance deployed to:', contract.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
