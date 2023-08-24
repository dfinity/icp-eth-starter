import 'twin.macro';
import { useNftMetadata } from '../services/alchemyService';
import { Nft } from '../services/historyService';
import { abbreviateAddress, abbreviatePrincipal } from '../utils/abbreviate';
import Tooltip from './utils/Tooltip';

interface NftCardProps {
  nft: Nft;
  principal?: string | undefined;
  time?: Date | undefined;
}

export default function NftCard({ nft, principal, time }: NftCardProps) {
  const [metadata] = useNftMetadata(nft.network, nft.contract, nft.tokenId);

  const url = `https://${
    nft.network === 'mainnet'
      ? 'opensea.io/assets/ethereum'
      : `testnets.opensea.io/assets/${nft.network}`
  }/${nft.contract}/${nft.tokenId}`;

  if (!metadata) {
    return null;
  }
  return (
    <a
      tw="block p-5 bg-white rounded-3xl space-y-3 drop-shadow-2xl cursor-pointer"
      href={url}
      target="_blank"
      rel="noreferrer"
    >
      <div tw="flex items-center gap-3">
        {!!metadata.media.length && (
          <img
            tw="w-full rounded-2xl max-w-[100px]"
            alt="NFT preview"
            src={metadata.media[0].gateway}
          />
        )}
        <div tw="space-y-2 text-xs sm:text-sm">
          {!!metadata.title && (
            <div tw="text-base sm:text-xl font-bold">{metadata.title}</div>
          )}
          <div>
            {!!time && <div>{time.toLocaleString()}</div>}
            <div>{abbreviateAddress(nft.owner)}</div>
            {!!principal && (
              <Tooltip content={principal}>
                <>{abbreviatePrincipal(principal)}</>
              </Tooltip>
            )}
          </div>
        </div>
      </div>
    </a>
  );
}
