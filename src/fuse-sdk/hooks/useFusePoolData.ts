import { useQuery } from "react-query";

import { useRari } from "../helpers/RariContext";
import { fetchFusePoolData, FusePoolData } from "../helpers/fetchFusePoolData";

export const useFusePoolData = (poolId: number | undefined): FusePoolData | undefined => {
  const { fuse, address } = useRari();

  const { data } = useQuery(`${poolId} poolData ${address}`, () => {
    return fetchFusePoolData(poolId, address, fuse);
  });

  return data;
};
