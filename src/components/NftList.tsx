import 'twin.macro';
import { VerifiedNft } from '../services/historyService';
import NftCard from './NftCard';

interface NftListProps {
  items: VerifiedNft[];
}

export default function NftList({ items }: NftListProps) {
  return (
    <div tw="flex gap-3">
      {items.map((item, i) => (
        <div key={i}>
          <NftCard
            nft={{ ...item.nft }}
            principal={item.principal}
            time={item.time}
          />
        </div>
      ))}
    </div>
  );
}
