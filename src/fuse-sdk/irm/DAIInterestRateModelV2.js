import JumpRateModel from "./JumpRateModel.js";
import { ethers } from "ethers";

var contracts = require(__dirname + "/../contracts/compound-protocol.min.json").contracts;

export default class DAIInterestRateModelV2 extends JumpRateModel {
  static RUNTIME_BYTECODE_HASH = "0x4b4c4f6386fd72d3f041a03e9eee3945189457fcf4299e99098d360a9f619539";

  initialized;

  dsrPerBlock;

  cash;
  borrows;
  reserves;

  async init(provider, interestRateModelAddress, assetAddress) {
    await super.init(provider, interestRateModelAddress, assetAddress);

    var contract = new ethers.Contract(
      interestRateModelAddress,
      JSON.parse(contracts["contracts/DAIInterestRateModelV2.sol:DAIInterestRateModelV2"].abi),
      provider,
    );
    this.dsrPerBlock = ethers.BigNumber.from(await contract.dsrPerBlock());

    contract = new ethers.Contract(
      assetAddress,
      JSON.parse(contracts["contracts/CTokenInterfaces.sol:CTokenInterface"].abi),
      provider,
    );
    this.cash = ethers.BigNumber.from(await contract.getCash());
    this.borrows = ethers.BigNumber.from(await contract.totalBorrowsCurrent());
    this.reserves = ethers.BigNumber.from(await contract.totalReserves());
  }

  async _init(provider, interestRateModelAddress, reserveFactorMantissa, adminFeeMantissa, fuseFeeMantissa) {
    await super._init(provider, interestRateModelAddress, reserveFactorMantissa, adminFeeMantissa, fuseFeeMantissa);

    var contract = new ethers.Contract(
      interestRateModelAddress,
      JSON.parse(contracts["contracts/DAIInterestRateModelV2.sol:DAIInterestRateModelV2"].abi),
      provider,
    );
    this.dsrPerBlock = ethers.BigNumber.from(await contract.dsrPerBlock());

    this.cash = ethers.BigNumber.from(0);
    this.borrows = ethers.BigNumber.from(0);
    this.reserves = ethers.BigNumber.from(0);
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
    await super.__init(
      baseRatePerBlock,
      multiplierPerBlock,
      jumpMultiplierPerBlock,
      kink,
      reserveFactorMantissa,
      adminFeeMantissa,
      fuseFeeMantissa,
    );
    this.dsrPerBlock = ethers.BigNumber.from(0); // TODO: Make this work if DSR ever goes positive again
    this.cash = ethers.BigNumber.from(0);
    this.borrows = ethers.BigNumber.from(0);
    this.reserves = ethers.BigNumber.from(0);
  }

  getSupplyRate(utilizationRate) {
    if (!this.initialized) throw new Error("Interest rate model class not initialized.");

    const protocolRate = super.getSupplyRate(utilizationRate, this.reserveFactorMantissa);
    const underlying = this.cash.add(this.borrows).sub(this.reserves);

    if (underlying.isZero()) {
      return protocolRate;
    } else {
      const cashRate = this.cash.mul(this.dsrPerBlock).div(underlying);
      return cashRate.add(protocolRate);
    }
  }
}
