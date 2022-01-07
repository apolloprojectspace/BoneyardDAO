import { addresses, DEFAULT_NETWORK } from 'src/constants';
import { LPBond, NetworkID, StableBond } from 'src/lib/Bond';
import { ReactComponent as HecUsdcImg } from "src/assets/tokens/HEC-USDC.svg";
import { ReactComponent as UsdcImg } from "src/assets/tokens/USDC.svg";
import { abi as ReserveHecUsdcContract } from "src/abi/reserves/HecUsdc.json";
import { abi as HecUsdcContract } from "src/abi/bonds/HecUsdcContract.json";
import { abi as DaiBondContract } from "src/abi/bonds/DaiContract.json";
import { abi as Dai4V3BondContract } from "src/abi/bonds/Dai44v3Contract.json";
import { abi as MimBondContract } from "src/abi/bonds/MimContract.json";

export const usdc = new StableBond({
    name: "usdc",
    displayName: "USDC",
    bondToken: "USDC",
    decimals: 6,
    bondIconSvg: UsdcImg,
    fourAddress: "0x76D03c384977B726bB1f5b261F6779834D8AD036",
    // oldfourAddress: "0x605c31dD24c71f0b732Ef33aC12CDce77fAC09B6",
    additionValue: -11428762623728,
    bondContractABI: DaiBondContract,
    networkAddrs: {
        [NetworkID.Mainnet]: {
            bondAddress: "0x5d05EF2654B9055895F21D7057095e2D7575f5A2",
            reserveAddress: addresses[DEFAULT_NETWORK].USDC_ADDRESS,
        },
        [NetworkID.Testnet]: {
            bondAddress: "",
            reserveAddress: "",
        },
    },
});

export const usdc4_v3 = new StableBond({
    name: "usdc4_v3",
    displayName: "USDC",
    bondToken: "USDC",
    bondIconSvg: UsdcImg,
    bondContractABI: Dai4V3BondContract,
    additionValue: 11428762623728,
    isFour: true,
    decimals: 6,
    isTotal: true,
    networkAddrs: {
        [NetworkID.Mainnet]: {
            bondAddress: "0x76D03c384977B726bB1f5b261F6779834D8AD036",
            reserveAddress: addresses[DEFAULT_NETWORK].USDC_ADDRESS,
        },
        [NetworkID.Testnet]: {
            bondAddress: "",
            reserveAddress: "",
        },
    },
});
export const usdc4 = new StableBond({
    name: "usdc4",
    displayName: "USDC",
    bondToken: "USDC",
    bondIconSvg: UsdcImg,
    bondContractABI: MimBondContract,
    isFour: true,
    decimals: 6,
    isTotal: true,
    isOld: true,
    networkAddrs: {
        [NetworkID.Mainnet]: {
            bondAddress: "0x605c31dD24c71f0b732Ef33aC12CDce77fAC09B6",
            reserveAddress: addresses[DEFAULT_NETWORK].USDC_ADDRESS,
        },
        [NetworkID.Testnet]: {
            bondAddress: "",
            reserveAddress: "",
        },
    },
});

export const usdc4_v2 = new StableBond({
    name: "usdc4_v2",
    displayName: "USDC",
    bondToken: "USDC",
    bondIconSvg: UsdcImg,
    bondContractABI: MimBondContract,
    // oldfourAddress: "0x605c31dD24c71f0b732Ef33aC12CDce77fAC09B6",
    isFour: true,
    isOld: true,
    decimals: 6,
    isTotal: true,
    networkAddrs: {
        [NetworkID.Mainnet]: {
            bondAddress: "0xD0373F236Be04EcF08F51fc4E3AdE7159D7cDe65",
            reserveAddress: addresses[DEFAULT_NETWORK].USDC_ADDRESS,
        },
        [NetworkID.Testnet]: {
            bondAddress: "",
            reserveAddress: "",
        },
    },
});

export const usdclp = new LPBond({
    name: "usdclp",
    displayName: "HEC-USDC LP",
    bondToken: "USDC",
    decimals: 6,
    fourAddress: "0xb9748C5408891ADE18E4494B178C793fDb485fa0",
    substractionValue: 2928586554767,
    bondIconSvg: HecUsdcImg,
    bondContractABI: HecUsdcContract,
    reserveContract: ReserveHecUsdcContract,
    networkAddrs: {
        [NetworkID.Mainnet]: {
            bondAddress: "0x3C57481f373Be0196A26A7d0a8E29E8CedC63ba1",
            reserveAddress: addresses[DEFAULT_NETWORK].USDCLP_ADDRESS,
        },
        [NetworkID.Testnet]: {
            bondAddress: "",
            reserveAddress: "",
        },
    },
    lpUrl:
        "https://swap.spiritswap.finance/#/add/0x04068DA6C83AFCFA0e13ba15A6696662335D5B75/0x5C4FDfc5233f935f20D2aDbA572F770c2E377Ab0",
});

export const usdclp4 = new LPBond({
    name: "usdclp4",
    displayName: "HEC-USDC LP",
    bondToken: "USDC",
    decimals: 6,
    isFour: true,
    isTotal: true,
    isOld: true,
    bondIconSvg: HecUsdcImg,
    bondContractABI: MimBondContract,
    reserveContract: ReserveHecUsdcContract,
    networkAddrs: {
        [NetworkID.Mainnet]: {
            bondAddress: "0xff6508aba1DAd81AACf3894374F291f82Dc024A8",
            reserveAddress: addresses[DEFAULT_NETWORK].USDCLP_ADDRESS,
        },
        [NetworkID.Testnet]: {
            bondAddress: "",
            reserveAddress: "",
        },
    },
    lpUrl:
        "https://swap.spiritswap.finance/#/add/0x04068DA6C83AFCFA0e13ba15A6696662335D5B75/0x5C4FDfc5233f935f20D2aDbA572F770c2E377Ab0",
});

export const usdclp4_v2 = new LPBond({
    name: "usdclp4_v2",
    displayName: "HEC-USDC LP",
    bondToken: "USDC",
    decimals: 6,
    isFour: true,
    isTotal: true,
    bondIconSvg: HecUsdcImg,
    bondContractABI: Dai4V3BondContract,
    reserveContract: ReserveHecUsdcContract,
    additionValue: 2928586554767,
    networkAddrs: {
        [NetworkID.Mainnet]: {
            bondAddress: "0xb9748C5408891ADE18E4494B178C793fDb485fa0",
            reserveAddress: addresses[DEFAULT_NETWORK].USDCLP_ADDRESS,
        },
        [NetworkID.Testnet]: {
            bondAddress: "",
            reserveAddress: "",
        },
    },
    lpUrl:
        "https://swap.spiritswap.finance/#/add/0x04068DA6C83AFCFA0e13ba15A6696662335D5B75/0x5C4FDfc5233f935f20D2aDbA572F770c2E377Ab0",
});