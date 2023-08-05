import { Alchemy, Network } from 'alchemy-sdk';
import { AlchemyProvider } from 'ethers';

const apiKey = process.env.VITE_ALCHEMY_API_KEY;
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
