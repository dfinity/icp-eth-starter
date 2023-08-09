import 'twin.macro';
import { usePublicNfts } from '../../services/historyService';
import NftList from '../NftList';
import Page from '../utils/Page';

export default function HomePage() {
  const nfts = usePublicNfts();

  return (
    <Page tw="space-y-4">
      <div tw="space-y-2">
        <h1 tw="font-semibold text-2xl cursor-default">NFT Time Capsules</h1>
        <h2 tw="opacity-60">
          Prove your ownership of an Ethereum NFT at a given point in time with
          the Internet Computer.
        </h2>
      </div>
      {!!nfts && <NftList items={nfts} />}
    </Page>
  );
}
