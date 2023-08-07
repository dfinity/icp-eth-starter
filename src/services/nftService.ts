import { Nft } from 'alchemy-sdk';
import { useCallback } from 'react';
import useRefresh, { Refresh } from '../hooks/utils/useRefresh';
import { getAlchemy } from './alchemyService';

export function useNftMetadata(
  network: string,
  contract: string,
  tokenId: number | string | bigint,
): Refresh<Nft | null | undefined> {
  const refresh = useCallback(
    () =>
      getAlchemy(`eth-${network}` as any)
        .nft.getNftMetadata(contract, tokenId, {})
        .catch((err) => {
          console.error(err);
          return null;
        }),
    [contract, network, tokenId],
  );
  return useRefresh(refresh);
}
