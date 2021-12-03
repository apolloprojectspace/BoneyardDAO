import { ethers } from "ethers";

var contracts = require(__dirname + "/../contracts/compound-protocol.min.json").contracts;

export default class JumpRateModel {
  static RUNTIME_BYTECODE_HASHES = [
    "0x00f083d6c0022358b6b3565c026e815cfd6fc9dcd6c3ad1125e72cbb81f41b2a",
    "0x47d7a0e70c9e049792bb96abf3c7527c7543154450c6267f31b52e2c379badc7",
  ];

  initialized;

  baseRatePerBlock;
  multiplierPerBlock;
  jumpMultiplierPerBlock;
  kink;

  reserveFactorMantissa;

  async init(provider, interestRateModelAddress, assetAddress) {
    var contract = new ethers.Contract(
      interestRateModelAddress,
      JSON.parse(contracts["contracts/JumpRateModel.sol:JumpRateModel"].abi),
      provider,
    );
    this.baseRatePerBlock = ethers.BigNumber.from(await contract.baseRatePerBlock());
    this.multiplierPerBlock = ethers.BigNumber.from(await contract.multiplierPerBlock());
    this.jumpMultiplierPerBlock = ethers.BigNumber.from(await contract.jumpMultiplierPerBlock());
    this.kink = ethers.BigNumber.from(await contract.kink());

    contract = new ethers.Contract(
      assetAddress,
      JSON.parse(contracts["contracts/CTokenInterfaces.sol:CTokenInterface"].abi),
      provider,
    );
    this.reserveFactorMantissa = ethers.BigNumber.from(await contract.reserveFactorMantissa());
    this.reserveFactorMantissa.add(ethers.BigNumber.from(await contract.adminFeeMantissa()));
    this.reserveFactorMantissa.add(ethers.BigNumber.from(await contract.fuseFeeMantissa()));

    this.initialized = true;
  }

  async _init(provider, interestRateModelAddress, reserveFactorMantissa, adminFeeMantissa, fuseFeeMantissa) {
    var contract = ethers.Contract(
      interestRateModelAddress,
      JSON.parse(contracts["contracts/JumpRateModel.sol:JumpRateModel"].abi),
      provider,
    );
    this.baseRatePerBlock = ethers.BigNumber.from(await contract.baseRatePerBlock());
    this.multiplierPerBlock = ethers.BigNumber.from(await contract.multiplierPerBlock());
    this.jumpMultiplierPerBlock = ethers.BigNumber.from(await contract.jumpMultiplierPerBlock());
    this.kink = ethers.BigNumber.from(await contract.kink());

    this.reserveFactorMantissa = ethers.BigNumber.from(reserveFactorMantissa);
    this.reserveFactorMantissa.add(ethers.BigNumber.from(adminFeeMantissa));
    this.reserveFactorMantissa.add(ethers.BigNumber.from(fuseFeeMantissa));

    this.initialized = true;
  }

  async __init(
    baseRatePerBlock,
    multiplierPerBlock,
    jumpMultiplierPerBlock,
    kink,
    reserveFactorMantissa,
    adminFeeMantissa,
    fuseFeeMantissa,
  ) {
    this.baseRatePerBlock = ethers.BigNumber.from(baseRatePerBlock);
    this.multiplierPerBlock = ethers.BigNumber.from(multiplierPerBlock);
    this.jumpMultiplierPerBlock = ethers.BigNumber.from(jumpMultiplierPerBlock);
    this.kink = ethers.BigNumber.from(kink);

    this.reserveFactorMantissa = ethers.BigNumber.from(reserveFactorMantissa);
    this.reserveFactorMantissa.add(ethers.BigNumber.from(adminFeeMantissa));
    this.reserveFactorMantissa.add(ethers.BigNumber.from(fuseFeeMantissa));

    this.initialized = true;
  }

  getBorrowRate(utilizationRate) {
    if (!this.initialized) throw new Error("Interest rate model class not initialized.");

    if (utilizationRate.lte(this.kink)) {
      return utilizationRate.mul(this.multiplierPerBlock).div(1e18).add(this.baseRatePerBlock);
    } else {
      const normalRate = this.kink.mul(this.multiplierPerBlock).div(1e18).add(this.baseRatePerBlock);
      const excessUtil = utilizationRate.sub(this.kink);
      return excessUtil.mul(this.jumpMultiplierPerBlock).div(1e18).add(normalRate);
    }
  }

  getSupplyRate(utilizationRate) {
    if (!this.initialized) throw new Error("Interest rate model class not initialized.");

    const oneMinusReserveFactor = ethers.BigNumber.from(1e18).sub(this.reserveFactorMantissa);
    const borrowRate = this.getBorrowRate(utilizationRate);
    const rateToPool = borrowRate.mul(oneMinusReserveFactor).div(1e18);
    return utilizationRate.mul(rateToPool).div(1e18);
  }
}
