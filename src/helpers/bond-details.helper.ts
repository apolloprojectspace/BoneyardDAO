import { JsonRpcProvider, StaticJsonRpcProvider } from '@ethersproject/providers';
import { BigNumber, ethers } from 'ethers';
import { addresses } from 'src/constants';
import { abi as aggregatorAbi } from "../abi/aggregatorContract.json";

export interface GlobalBondData {
    Contract: string;
    BondPriceInUSD: BigNumber;
    BondTerms: BondTerms;
    MaxPayout: BigNumber;
    name: string;
    StandardizedDebtRatio: BigNumber;
    TotalDebt: BigNumber;
    TotalPrinciple: BigNumber;
}

interface BondTerms {
    controlVariable: BigNumber;
    fee: BigNumber;
    maxDebt: BigNumber;
    maxPayout: BigNumber;
    minimumPrice: BigNumber;
    vestingTerm: BigNumber;
}

export interface GetUserBondDetails {
    Contract: string;
    Info: Info;
    PendingPayout: BigNumber;
    PercentVested: BigNumber;
}

interface Info {
    LastBlock: BigNumber;
    Payout: BigNumber;
    PricePaid: BigNumber;
    Vesting: BigNumber;
}

interface AggregatorContract {
    globalBondData: () => GlobalBondData[];
    perUserBondData: (address: string) => GetUserBondDetails[];
}

export async function getAllBondDetails(networkId: number, provider: StaticJsonRpcProvider | JsonRpcProvider): Promise<GlobalBondData[]> {
    const aggregatorContract = new ethers.Contract(addresses[networkId].AGGREGATOR_ADDRESS as string, aggregatorAbi, provider) as unknown as AggregatorContract;
    const globalBondData = await aggregatorContract.globalBondData();
    return globalBondData;
}
export async function getUserBondDetails(networkId: number, provider: StaticJsonRpcProvider | JsonRpcProvider, address: string): Promise<GetUserBondDetails[]> {
    const aggregatorContract = new ethers.Contract(addresses[networkId].AGGREGATOR_ADDRESS as string, aggregatorAbi, provider) as unknown as AggregatorContract;
    const userBondData = await aggregatorContract.perUserBondData(address);
    return userBondData;
}