import 'twin.macro';
import { usePublicNfts } from '../../services/historyService';
import Page from '../utils/Page';
import NftCard from '../NftCard';

export default function HomePage() {
  const nfts = usePublicNfts();

  return (
    <Page tw="space-y-4">
      <div tw="font-semibold text-2xl cursor-default">Hello</div>
      <div tw="sm:(p-4 bg-[#0002]) space-y-3 min-h-[300px] rounded-xl overflow-y-scroll">
        {nfts?.map((publicNft, i) => (
          <div key={i}>
            <NftCard nft={{ ...publicNft.nft }}></NftCard>
          </div>
        ))}
      </div>
    </Page>
  );
}
