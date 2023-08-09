import {
  Nft as CandidNft,
  PublicEvent,
} from '../declarations/backend/backend.did';
import useObservableState from '../hooks/utils/useObservableState';
import { handleError } from '../utils/handlers';
import makeObservable from '../utils/makeObservable';
import { getBackend } from './backendService';
import { USER_STORE } from './userService';

export type TokenType = 'erc721' | 'erc1155';

export interface Nft {
  tokenId: string;
  contract: string;
  owner: string;
  network: string;
  tokenType: TokenType;
}

export interface PublicNft {
  nft: Nft;
  wallet: String;
  principal: string;
  time: Date;
}

export const PUBLIC_HISTORY_STORE = makeObservable<
  PublicEvent[] | null | undefined
>();
export const NFT_LIST_STORE = makeObservable<Nft[] | null | undefined>();

export function unwrapNft(nft: CandidNft): Nft {
  return {
    tokenId: String(nft.tokenId),
    contract: nft.contract,
    owner: nft.owner,
    network: nft.network,
    tokenType: Object.keys(nft)[0] as TokenType,
  };
}

USER_STORE.callAndSubscribe(refreshHistory);

export async function refreshHistory() {
  const user = USER_STORE.get();
  if (!user) {
    PUBLIC_HISTORY_STORE.set(null);
    return;
  }
  PUBLIC_HISTORY_STORE.set(
    await getBackend()
      .getPublicHistory()
      .catch((err) => {
        handleError(err, 'Error while fetching canister history!');
        return null;
      }),
  );
  NFT_LIST_STORE.set(
    await getBackend()
      .getNfts()
      .then((nfts) => nfts.map(unwrapNft))
      .catch((err) => {
        handleError(err, 'Error while fetching NFT list!');
        return null;
      }),
  );
}

export function usePublicNfts(): PublicNft[] | null | undefined {
  const history = useObservableState(PUBLIC_HISTORY_STORE)[0];
  if (!history) {
    return history;
  }
  const results: PublicNft[] = [];
  history?.forEach((history) => {
    if ('addNft' in history) {
      const event = history.addNft;
      results.push({
        nft: unwrapNft(event.nft),
        wallet: event.wallet,
        principal: event.principal.toString(),
        time: new Date(Number(event.time)),
      });
    }
  });
  return results;
}

export function useNfts(): Nft[] | null | undefined {
  return useObservableState(NFT_LIST_STORE)[0];
}
