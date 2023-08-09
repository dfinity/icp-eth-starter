import 'twin.macro';
import { useNftMetadata } from '../services/alchemyService';
import { Nft } from '../services/historyService';
import Loading from './utils/Loading';

interface NftCardProps {
  nft: Nft;
  principal?: string | undefined;
  time?: Date | undefined;
}

export default function NftCard({ nft, principal, time }: NftCardProps) {
  const [metadata] = useNftMetadata(nft.network, nft.contract, nft.tokenId);

  return (
    <div tw="p-5 bg-white rounded-full space-y-3 drop-shadow-2xl">
      {metadata ? (
        <div tw="flex items-center gap-3">
          {!!metadata.media.length && (
            <img
              tw="w-full rounded-full max-w-[100px]"
              alt="NFT preview"
              src={metadata.media[0].gateway}
            />
          )}
          <div tw="space-y-2 text-sm">
            {!!metadata.title && (
              <div tw="text-2xl sm:text-xl font-bold">{metadata.title}</div>
            )}
            <div>
              <div>{nft.owner}</div>
              {!!principal && <div>{principal}</div>}
              {!!time && <div>{time.toLocaleString()}</div>}
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
