import { addresses, DEFAULT_NETWORK } from 'src/constants';
import { StableBond, NetworkID, LPBond } from 'src/lib/Bond';
import { ReactComponent as FraxImg } from "src/assets/tokens/FRAX.svg";
import { abi as MimBondContract } from "src/abi/bonds/MimContract.json";
import { abi as Dai4V3BondContract } from "src/abi/bonds/Dai44v3Contract.json";
import { ReactComponent as HecFraxImg } from "src/assets/tokens/HEC-FRAX.svg";
import { abi as ReserveHecDaiContract } from "src/abi/reserves/HecDai.json";

export const frax = new StableBond({
    name: "frax",
    displayName: "FRAX",
    bondToken: "FRAX",
    bondIconSvg: FraxImg,
    bondContractABI: MimBondContract,
    isTotal: true,
    networkAddrs: {
        [NetworkID.Mainnet]: {
            bondAddress: "0xA4E87A25bC9058e4eC193151558c3c5D02cebE31",
            reserveAddress: addresses[DEFAULT_NETWORK].FRAX_ADDRESS,
        },
        [NetworkID.Testnet]: {
            bondAddress: "",
            reserveAddress: "",
        },
    },
});

export const frax4 = new StableBond({
    name: "frax4",
    displayName: "FRAX",
    bondToken: "FRAX",
    bondIconSvg: FraxImg,
    bondContractABI: MimBondContract,
    isTotal: true,
    isFour: true,
    isOld: true,
    networkAddrs: {
        [NetworkID.Mainnet]: {
            bondAddress: "0xC798e6A22996C554739Df607B7eF1d6d435FDBd9",
            reserveAddress: addresses[DEFAULT_NETWORK].FRAX_ADDRESS,
        },
        [NetworkID.Testnet]: {
            bondAddress: "",
            reserveAddress: "",
        },
    },
});

export const frax4_v2 = new StableBond({
    name: "frax4_v2",
    displayName: "FRAX",
    bondToken: "FRAX",
    bondIconSvg: FraxImg,
    bondContractABI: Dai4V3BondContract,
    additionValue: 2753958999712421391905854,
    isTotal: true,
    isFour: true,
    networkAddrs: {
        [NetworkID.Mainnet]: {
            bondAddress: "0xa2E8B8513bC380c0d003652Faa510CC4cA69C674",
            reserveAddress: addresses[DEFAULT_NETWORK].FRAX_ADDRESS,
        },
        [NetworkID.Testnet]: {
            bondAddress: "",
            reserveAddress: "",
        },
    },
});

export const fraxlp = new LPBond({
    name: "fraxlp",
    displayName: "HEC-FRAX LP",
    bondToken: "FRAX",
    bondIconSvg: HecFraxImg,
    isTotal: true,
    bondContractABI: MimBondContract,
    reserveContract: ReserveHecDaiContract,
    networkAddrs: {
        [NetworkID.Mainnet]: {
            bondAddress: "0xde02631d898acd1bb8ff928c0f0ffa0cf29ab374",
            reserveAddress: addresses[DEFAULT_NETWORK].FRAXLP_ADDRESS,
        },
        [NetworkID.Testnet]: {
            bondAddress: "",
            reserveAddress: "",
        },
    },
    lpUrl:
        "https://spookyswap.finance/add/0x5C4FDfc5233f935f20D2aDbA572F770c2E377Ab0/0xdc301622e621166bd8e82f2ca0a26c13ad0be355",
});

export const fraxlp4 = new LPBond({
    name: "fraxlp4",
    displayName: "HEC-FRAX LP",
    bondToken: "FRAX",
    bondIconSvg: HecFraxImg,
    isTotal: true,
    isFour: true,
    isOld: true,
    bondContractABI: MimBondContract,
    reserveContract: ReserveHecDaiContract,
    networkAddrs: {
        [NetworkID.Mainnet]: {
            bondAddress: "0x09eb3B10a13DD705C17ced39c35aeEA0D419D0BB",
            reserveAddress: addresses[DEFAULT_NETWORK].FRAXLP_ADDRESS,
        },
        [NetworkID.Testnet]: {
            bondAddress: "",
            reserveAddress: "",
        },
    },
    lpUrl:
        "https://spookyswap.finance/add/0x5C4FDfc5233f935f20D2aDbA572F770c2E377Ab0/0xdc301622e621166bd8e82f2ca0a26c13ad0be355",
});

export const fraxlp4_v2 = new LPBond({
    name: "fraxlp4_v2",
    displayName: "HEC-FRAX LP",
    bondToken: "FRAX",
    bondIconSvg: HecFraxImg,
    isTotal: true,
    isFour: true,
    bondContractABI: Dai4V3BondContract,
    reserveContract: ReserveHecDaiContract,
    additionValue: 3985611879256544134,
    networkAddrs: {
        [NetworkID.Mainnet]: {
            bondAddress: "0x8Bcc78704AcD903200937B68CdAbfF72CA2Aedff",
            reserveAddress: addresses[DEFAULT_NETWORK].FRAXLP_ADDRESS,
        },
        [NetworkID.Testnet]: {
            bondAddress: "",
            reserveAddress: "",
        },
    },
    lpUrl:
        "https://spookyswap.finance/add/0x5C4FDfc5233f935f20D2aDbA572F770c2E377Ab0/0xdc301622e621166bd8e82f2ca0a26c13ad0be355",
});