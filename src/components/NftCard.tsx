import 'twin.macro';
import { useNftMetadata } from '../services/alchemyService';
import { Nft } from '../services/historyService';
import { abbreviateAddress, abbreviatePrincipal } from '../utils/abbreviate';
import Loading from './utils/Loading';
import Tooltip from './utils/Tooltip';

interface NftCardProps {
  nft: Nft;
  principal?: string | undefined;
  time?: Date | undefined;
}

export default function NftCard({ nft, principal, time }: NftCardProps) {
  const [metadata] = useNftMetadata(nft.network, nft.contract, nft.tokenId);
  // const breakpoint = useBreakpoint();
  // const isMobile = breakpoint === 'xs';

  return (
    <div tw="p-5 bg-white rounded-3xl space-y-3 drop-shadow-2xl">
      {metadata ? (
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
      ) : metadata === undefined ? (
        <div tw="flex w-full items-center">
          <Loading />
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}
