import { addresses, DEFAULT_NETWORK } from 'src/constants';
import { StableBond, NetworkID } from 'src/lib/Bond';
import { abi as MimBondContract } from "src/abi/bonds/MimContract.json";
import { abi as Dai4V3BondContract } from "src/abi/bonds/Dai44v3Contract.json";
import { abi as DaiBondContract } from "src/abi/bonds/DaiContract.json";
import { ReactComponent as MimImg } from "src/assets/tokens/MIM.svg";

export const mim4 = new StableBond({
    name: "mim4",
    displayName: "MIM",
    bondToken: "MIM",
    bondIconSvg: MimImg,
    bondContractABI: DaiBondContract,
    isFour: true,
    isOld: true,
    networkAddrs: {
        [NetworkID.Mainnet]: {
            bondAddress: "0xb26be27f6f980efb07ae757d0a6a372671eacf7f",
            reserveAddress: addresses[DEFAULT_NETWORK].MIM_ADDRESS,
        },
        [NetworkID.Testnet]: {
            bondAddress: "",
            reserveAddress: "",
        },
    },
});

export const mim4_v2 = new StableBond({
    name: "mim4_v2",
    displayName: "MIM",
    bondToken: "MIM",
    bondIconSvg: MimImg,
    bondContractABI: MimBondContract,
    isFour: true,
    isOld: true,
    // isTotal: true,
    // oldfourAddress: "0xb26be27f6f980efb07ae757d0a6a372671eacf7f",
    networkAddrs: {
        [NetworkID.Mainnet]: {
            bondAddress: "0x8565f642180fE388F942460B66ABa9c2ca7F02Ed",
            reserveAddress: addresses[DEFAULT_NETWORK].MIM_ADDRESS,
        },
        [NetworkID.Testnet]: {
            bondAddress: "",
            reserveAddress: "",
        },
    },
});

export const mim4_v3 = new StableBond({
    name: "mim4_v3",
    displayName: "MIM",
    bondToken: "MIM",
    bondIconSvg: MimImg,
    bondContractABI: Dai4V3BondContract,
    isFour: true,
    isTotal: true,
    additionValue: 11758486289734011153413695,
    networkAddrs: {
        [NetworkID.Mainnet]: {
            bondAddress: "0x923645052B8370D40BA13867B85fC58B2f94987b",
            reserveAddress: addresses[DEFAULT_NETWORK].MIM_ADDRESS,
        },
        [NetworkID.Testnet]: {
            bondAddress: "",
            reserveAddress: "",
        },
    },
});

export const mim = new StableBond({
    name: "mim",
    displayName: "MIM",
    bondToken: "MIM",
    bondIconSvg: MimImg,
    bondContractABI: MimBondContract,
    isTotal: true,
    networkAddrs: {
        [NetworkID.Mainnet]: {
            bondAddress: "0xa695750b8439AB2AfBd88310946C99747C5B3A2E",
            reserveAddress: addresses[DEFAULT_NETWORK].MIM_ADDRESS,
        },
        [NetworkID.Testnet]: {
            bondAddress: "",
            reserveAddress: "",
        },
    },
});