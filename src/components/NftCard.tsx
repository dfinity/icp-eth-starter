import { Nft } from '../declarations/backend/backend.did';
import { useNftMetadata } from '../services/alchemyService';
import Loading from './utils/Loading';
import 'twin.macro';

interface NftCardProps {
  nft: Nft;
}

export default function NftCard({ nft }: NftCardProps) {
  const [metadata] = useNftMetadata(nft.network, nft.contract, nft.tokenId);

  return (
    <div tw="p-5 bg-white rounded-lg space-y-3 drop-shadow-2xl max-w-[200px]">
      {metadata ? (
        <>
          {!!metadata.title && (
            <div tw="text-2xl sm:text-xl font-bold">{metadata.title}</div>
          )}
          {!!metadata.media.length && (
            <img
              tw="w-full rounded-xl"
              alt="NFT preview"
              src={metadata.media[0].gateway}
            />
          )}
          {/* {!!metadata.description && (
            <div tw="sm:text-xl">{metadata.description}</div>
          )} */}
        </>
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
