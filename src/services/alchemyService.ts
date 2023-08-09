import { Alchemy, Network, Nft } from 'alchemy-sdk';
import { AlchemyProvider } from 'ethers';
import { useCallback } from 'react';
import useRefresh, { Refresh } from '../hooks/utils/useRefresh';

const apiKey = import.meta.env.VITE_ALCHEMY_API_KEY;
if (!apiKey) {
  console.warn('Alchemy API key not found!');
}

export function getAlchemyProvider(network: string) {
  return new AlchemyProvider(network, apiKey);
}

export function getAlchemy(network: Network): Alchemy {
  const alchemy = new Alchemy({
    apiKey,
    // network: Network.ETH_MAINNET,
    network,
  });
  return alchemy;
}

// export async function useNftsForOwner(
//   network: string,
//   owner: string,
//   page: number,
// ) {
//   const alchemy = getAlchemy(network);
//   const nfts = await alchemy.nft.getNftsForOwner(owner, {});
//   return nfts;
// }

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
