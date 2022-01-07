import { addresses, DEFAULT_NETWORK } from 'src/constants';
import { StableBond, NetworkID, LPBond } from 'src/lib/Bond';
import { ReactComponent as DaiImg } from "src/assets/tokens/DAI.svg";
import { abi as Dai4V3BondContract } from "src/abi/bonds/Dai44v3Contract.json";
import { abi as DaiBondContract } from "src/abi/bonds/DaiContract.json";
import { abi as MimBondContract } from "src/abi/bonds/MimContract.json";
import { ReactComponent as HecDaiimg } from "src/assets/tokens/HEC-DAI.svg";
import { abi as BondHecDaiContract } from "src/abi/bonds/HecDaiContract.json";
import { abi as ReserveHecDaiContract } from "src/abi/reserves/HecDai.json";


export const dai = new StableBond({
    name: "dai",
    displayName: "DAI",
    bondToken: "DAI",
    bondIconSvg: DaiImg,
    bondContractABI: DaiBondContract,
    isOld: true,
    fourAddress: "0xE1Cc7FE3E78aEfe6f93D1614A09156fF296Bc81E",
    // oldfourAddress: "0xe8fd4630800bA4335801D1b104B07328Ae415605",
    additionValue: -10779154199735267171249192,
    networkAddrs: {
        [NetworkID.Mainnet]: {
            bondAddress: "0x4099EB0e82Ffa0048E4BF037a9743ca05Ec561D7",
            reserveAddress: addresses[DEFAULT_NETWORK].DAI_ADDRESS,
        },
        [NetworkID.Testnet]: {
            bondAddress: "",
            reserveAddress: "",
        },
    },
});
export const dai_v2 = new StableBond({
    name: "dai_v2",
    displayName: "DAI",
    bondToken: "DAI",
    bondIconSvg: DaiImg,
    bondContractABI: DaiBondContract,
    fourAddress: "0xE1Cc7FE3E78aEfe6f93D1614A09156fF296Bc81E",
    // oldfourAddress: "0xe8fd4630800bA4335801D1b104B07328Ae415605",
    additionValue: -10779154199735267171249192,
    networkAddrs: {
        [NetworkID.Mainnet]: {
            bondAddress: "0x4FE87D1A4f39d668Fc6B8106cE5100189CBbD3e6",
            reserveAddress: addresses[DEFAULT_NETWORK].DAI_ADDRESS,
        },
        [NetworkID.Testnet]: {
            bondAddress: "",
            reserveAddress: "",
        },
    },
});

export const dai4_v3 = new StableBond({
    name: "dai4_v3",
    displayName: "DAI",
    bondToken: "DAI",
    bondIconSvg: DaiImg,
    isFour: true,
    isTotal: true,
    bondContractABI: Dai4V3BondContract,
    additionValue: 10779154199735267171249192,
    networkAddrs: {
        [NetworkID.Mainnet]: {
            bondAddress: "0xE1Cc7FE3E78aEfe6f93D1614A09156fF296Bc81E",
            reserveAddress: addresses[DEFAULT_NETWORK].DAI_ADDRESS,
        },
        [NetworkID.Testnet]: {
            bondAddress: "",
            reserveAddress: "",
        },
    },
});

export const dai4 = new StableBond({
    name: "dai4",
    displayName: "DAI",
    bondToken: "DAI",
    bondIconSvg: DaiImg,
    isFour: true,
    isTotal: true,
    bondContractABI: MimBondContract,
    isOld: true,
    networkAddrs: {
        [NetworkID.Mainnet]: {
            bondAddress: "0xe8fd4630800bA4335801D1b104B07328Ae415605",
            reserveAddress: addresses[DEFAULT_NETWORK].DAI_ADDRESS,
        },
        [NetworkID.Testnet]: {
            bondAddress: "",
            reserveAddress: "",
        },
    },
});

export const dai4_v2 = new StableBond({
    name: "dai4_v2",
    displayName: "DAI",
    bondToken: "DAI",
    bondIconSvg: DaiImg,
    isFour: true,
    // isTotal: true,
    // oldfourAddress: "0xe8fd4630800bA4335801D1b104B07328Ae415605",
    bondContractABI: MimBondContract,
    isOld: true,
    networkAddrs: {
        [NetworkID.Mainnet]: {
            bondAddress: "0x23337B675375507CE218df5F92f1a71252DAB3E5",
            reserveAddress: addresses[DEFAULT_NETWORK].DAI_ADDRESS,
        },
        [NetworkID.Testnet]: {
            bondAddress: "",
            reserveAddress: "",
        },
    },
});

export const dailp = new LPBond({
    name: "dailp_v1",
    displayName: "HEC-DAI LP v1",
    bondToken: "DAI",
    bondIconSvg: HecDaiimg,
    bondContractABI: BondHecDaiContract,
    reserveContract: ReserveHecDaiContract,
    isOld: true,
    networkAddrs: {
        [NetworkID.Mainnet]: {
            bondAddress: "0xA1224c353cdCB03eB70FbA44dADC137F39E5EF7d",
            reserveAddress: addresses[DEFAULT_NETWORK].DAILP_ADDRESS,
        },
        [NetworkID.Testnet]: {
            bondAddress: "",
            reserveAddress: "",
        },
    },
    lpUrl:
        "https://spookyswap.finance/add/0x5C4FDfc5233f935f20D2aDbA572F770c2E377Ab0/0x8D11eC38a3EB5E956B052f67Da8Bdc9bef8Abf3E",
});

export const dailp_v2 = new LPBond({
    name: "dailp_v2",
    displayName: "HEC-DAI LP",
    bondToken: "DAI",
    bondIconSvg: HecDaiimg,
    bondContractABI: BondHecDaiContract,
    reserveContract: ReserveHecDaiContract,
    fourAddress: "0x124C23a4119122f05a4C9D2287Ed19fC00f8059a",
    substractionValue: 3473949271670657599,
    networkAddrs: {
        [NetworkID.Mainnet]: {
            bondAddress: "0x6c9b3a47a28a39fea65e99d97895e717df1706d0",
            reserveAddress: addresses[DEFAULT_NETWORK].DAILP_ADDRESS,
        },
        [NetworkID.Testnet]: {
            bondAddress: "",
            reserveAddress: "",
        },
    },
    lpUrl:
        "https://spookyswap.finance/add/0x5C4FDfc5233f935f20D2aDbA572F770c2E377Ab0/0x8D11eC38a3EB5E956B052f67Da8Bdc9bef8Abf3E",
});

export const dailp4 = new LPBond({
    name: "dai_lp4",
    displayName: "HEC-DAI LP",
    bondToken: "DAI",
    bondIconSvg: HecDaiimg,
    isFour: true,
    isTotal: true,
    isOld: true,
    bondContractABI: MimBondContract,
    reserveContract: ReserveHecDaiContract,
    networkAddrs: {
        [NetworkID.Mainnet]: {
            bondAddress: "0xfF40F40E376030394B154dadcB4173277633b405",
            reserveAddress: addresses[DEFAULT_NETWORK].DAILP_ADDRESS,
        },
        [NetworkID.Testnet]: {
            bondAddress: "",
            reserveAddress: "",
        },
    },
    lpUrl:
        "https://spookyswap.finance/add/0x5C4FDfc5233f935f20D2aDbA572F770c2E377Ab0/0x8D11eC38a3EB5E956B052f67Da8Bdc9bef8Abf3E",
});

export const dailp4_v2 = new LPBond({
    name: "dailp4_v2",
    displayName: "HEC-DAI LP",
    bondToken: "DAI",
    bondIconSvg: HecDaiimg,
    isFour: true,
    isTotal: true,
    bondContractABI: Dai4V3BondContract,
    reserveContract: ReserveHecDaiContract,
    additionValue: 3473949271670657599,
    networkAddrs: {
        [NetworkID.Mainnet]: {
            bondAddress: "0x124C23a4119122f05a4C9D2287Ed19fC00f8059a",
            reserveAddress: addresses[DEFAULT_NETWORK].DAILP_ADDRESS,
        },
        [NetworkID.Testnet]: {
            bondAddress: "",
            reserveAddress: "",
        },
    },
    lpUrl:
        "https://spookyswap.finance/add/0x5C4FDfc5233f935f20D2aDbA572F770c2E377Ab0/0x8D11eC38a3EB5E956B052f67Da8Bdc9bef8Abf3E",
});