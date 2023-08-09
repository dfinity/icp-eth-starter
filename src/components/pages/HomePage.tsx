import 'twin.macro';
import { usePublicNfts } from '../../services/historyService';
import NftList from '../NftList';
import Page from '../utils/Page';

export default function HomePage() {
  const nfts = usePublicNfts();

  return (
    <Page tw="space-y-4">
      <div tw="font-semibold text-2xl cursor-default">NFT Time Capsules</div>
      {/* <div tw="sm:(p-4 bg-[#0002]) space-y-3 min-h-[300px] rounded-xl overflow-y-scroll"> */}
      {!!nfts && <NftList items={nfts} />}
      {/* </div> */}
    </Page>
  );
}
