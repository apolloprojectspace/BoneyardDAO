import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react";

import Fuse from "../index";
import { initFuseWithProviders } from "./web3Providers";
import { Provider, StaticJsonRpcProvider } from "@ethersproject/providers";
import { useAddress } from "../../hooks";

export interface RariContextData {
  fuse: Fuse;
  isAuthed: boolean;
  address: string;
}

export const EmptyAddress = "0x0000000000000000000000000000000000000000";

export const RariContext = createContext<RariContextData | undefined>(undefined);

// TODO Use real provider
export const RariProvider = ({ provider: _provider, children }: { provider: Provider; children: ReactNode }) => {
  const address = useAddress();

  const provider = new StaticJsonRpcProvider("https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161");

  const [fuse, setFuse] = useState<Fuse>(initFuseWithProviders(provider));

  // useEffect(() => {
  //   setFuse(initFuseWithProviders(provider));
  // }, [provider]);

  const value = useMemo(
    () => ({
      fuse,
      isAuthed: address !== EmptyAddress,
      address,
    }),
    [address, fuse],
  );

  return <RariContext.Provider value={value}>{children}</RariContext.Provider>;
};

export function useRari() {
  const context = useContext(RariContext);

  if (context === undefined) {
    throw new Error(`useRari must be used within a RariProvider`);
  }

  return context;
}
