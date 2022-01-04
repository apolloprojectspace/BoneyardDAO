import { LPBond, NetworkID } from 'src/lib/Bond';
import { ReactComponent as HecgOHMImg } from "src/assets/tokens/HEC-gOHM.svg";
import { abi as MimBondContract } from "src/abi/bonds/MimContract.json";
import { abi as ReserveHecDaiContract } from "src/abi/reserves/HecDai.json";
import { abi as Dai4V3BondContract } from "src/abi/bonds/Dai44v3Contract.json";

export const gohmlp = new LPBond({
    name: "gohmlp",
    displayName: "HEC-gOHM LP",
    bondToken: "gOHM",
    bondIconSvg: HecgOHMImg,
    isTotal: true,
    bondContractABI: MimBondContract,
    reserveContract: ReserveHecDaiContract,
    networkAddrs: {
        [NetworkID.Mainnet]: {
            bondAddress: "0xde13DD3BCA9CBac23F46e5C587b48320F5f5c483",
            reserveAddress: "0xEb7942E26368b2052CBbDa2c054482F00436ef7B",
        },
        [NetworkID.Testnet]: {
            bondAddress: "",
            reserveAddress: "",
        },
    },
    lpUrl:
        "https://swap.spiritswap.finance/#/add/0x91fa20244Fb509e8289CA630E5db3E9166233FDc/0x5C4FDfc5233f935f20D2aDbA572F770c2E377Ab0",
});

export const gohmlp4 = new LPBond({
    name: "gohmlp4",
    displayName: "HEC-gOHM LP",
    bondToken: "gOHM",
    bondIconSvg: HecgOHMImg,
    isFour: true,
    isTotal: true,
    isOld: true,
    bondContractABI: MimBondContract,
    reserveContract: ReserveHecDaiContract,
    networkAddrs: {
        [NetworkID.Mainnet]: {
            bondAddress: "0xE07fC828f104c523D1E16eBe93f958a521A9f8b3",
            reserveAddress: "0xEb7942E26368b2052CBbDa2c054482F00436ef7B",
        },
        [NetworkID.Testnet]: {
            bondAddress: "",
            reserveAddress: "",
        },
    },
    lpUrl:
        "https://swap.spiritswap.finance/#/add/0x91fa20244Fb509e8289CA630E5db3E9166233FDc/0x5C4FDfc5233f935f20D2aDbA572F770c2E377Ab0",
});

export const gohmlp4_v2 = new LPBond({
    name: "gohmlp4_v2",
    displayName: "HEC-gOHM LP",
    bondToken: "gOHM",
    bondIconSvg: HecgOHMImg,
    isFour: true,
    isTotal: true,
    bondContractABI: Dai4V3BondContract,
    reserveContract: ReserveHecDaiContract,
    additionValue: 6514934792972525,
    networkAddrs: {
        [NetworkID.Mainnet]: {
            bondAddress: "0x3f1dCf0E2c8407CB71D2C6F41F943c7352F00a94",
            reserveAddress: "0xEb7942E26368b2052CBbDa2c054482F00436ef7B",
        },
        [NetworkID.Testnet]: {
            bondAddress: "",
            reserveAddress: "",
        },
    },
    lpUrl:
        "https://swap.spiritswap.finance/#/add/0x91fa20244Fb509e8289CA630E5db3E9166233FDc/0x5C4FDfc5233f935f20D2aDbA572F770c2E377Ab0",
});