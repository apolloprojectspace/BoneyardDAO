import { useQuery } from "react-query";

import { useRari } from "../helpers/RariContext";
import ERC20ABI from "../../abi/ERC20.json";
import { ETH_TOKEN_DATA } from "./useTokenData";
import { Provider } from "@ethersproject/providers";
import { ethers } from "ethers";
import Big from "big.js";

export const fetchTokenBalance = async (tokenAddress: string, provider: Provider, address: string): Promise<Big> => {
  let stringBalance;

  if (tokenAddress === ETH_TOKEN_DATA.address || tokenAddress === "NO_ADDRESS_HERE_USE_WETH_FOR_ADDRESS") {
    stringBalance = await provider.getBalance(address);
  } else {
    const contract = new ethers.Contract(tokenAddress, ERC20ABI as any, provider);

    stringBalance = await contract.balanceOf(address);
  }

  return Big(stringBalance);
};

export function useTokenBalance(tokenAddress: string, customAddress?: string) {
  const { fuse, address } = useRari();

  const addressToCheck = customAddress ?? address;

  return useQuery(tokenAddress + " balanceOf " + addressToCheck, () =>
    fetchTokenBalance(tokenAddress, fuse.provider, addressToCheck),
  );
}
