import { NetworkID, CustomBond, BondType } from "src/lib/Bond";
import { addresses, DEFAULT_NETWORK } from "src/constants";
import { ReactComponent as wFTMImg } from "src/assets/tokens/wFTM.svg";
import { abi as FtmBondContract } from "src/abi/bonds/FtmContract.json";
import { abi as FtmBondContractV2 } from "src/abi/bonds/FtmContractV2.json";
import { abi as ierc20Abi } from "src/abi/IERC20.json";

export const ftm = new CustomBond({
    name: "ftm",
    displayName: "wFTM",
    lpUrl: "",
    bondType: BondType.StableAsset,
    bondToken: "WFTM",
    bondIconSvg: wFTMImg,
    isOld: true,
    bondContractABI: FtmBondContract,
    reserveContract: ierc20Abi, // The Standard ierc20Abi since they're normal tokens
    networkAddrs: {
        [NetworkID.Mainnet]: {
            bondAddress: "0x72De9F0e51cA520379a341318870836FdCaf03B9",
            reserveAddress: addresses[DEFAULT_NETWORK].WFTM_ADDRESS,
        },
        [NetworkID.Testnet]: {
            bondAddress: "",
            reserveAddress: "",
        },
    },
    customTreasuryBalanceFunc: async function (this: CustomBond, networkID, provider) {
        const ethBondContract = this.getContractForBond(networkID, provider);
        let ethPrice = await ethBondContract.assetPrice();
        ethPrice = ethPrice / Math.pow(10, 8);
        const token = this.getContractForReserve(networkID, provider);
        let ftmAmount = await token.balanceOf(addresses[networkID].TREASURY_ADDRESS);
        ftmAmount = ftmAmount / Math.pow(10, 18);
        return ftmAmount * ethPrice;
    },
});
export const ftmv2 = new CustomBond({
    name: "ftmv2",
    displayName: "wFTM",
    lpUrl: "",
    bondType: BondType.StableAsset,
    bondToken: "WFTM",
    fourAddress: "0xE07fC828f104c523D1E16eBe93f958a521A9f8b3",
    bondIconSvg: wFTMImg,
    bondContractABI: FtmBondContractV2,
    reserveContract: ierc20Abi, // The Standard ierc20Abi since they're normal tokens
    networkAddrs: {
        [NetworkID.Mainnet]: {
            bondAddress: "0x97EaE2a5eB6BF0725b2d9AC2D7D5b27a97b0A8d3",
            reserveAddress: addresses[DEFAULT_NETWORK].WFTM_ADDRESS,
        },
        [NetworkID.Testnet]: {
            bondAddress: "",
            reserveAddress: "",
        },
    },
    customTreasuryBalanceFunc: async function (this: CustomBond, networkID, provider) {
        const ethBondContract = this.getContractForBond(networkID, provider);
        let ethPrice = await ethBondContract.assetPrice();
        ethPrice = ethPrice / Math.pow(10, 8);
        const token = this.getContractForReserve(networkID, provider);
        let ftmAmount = await token.balanceOf(addresses[networkID].TREASURY_ADDRESS);
        ftmAmount = ftmAmount / Math.pow(10, 18);
        return ftmAmount * ethPrice;
    },
});