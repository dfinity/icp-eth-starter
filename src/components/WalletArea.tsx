import { ethers } from 'ethers';
import { useMetaMask } from 'metamask-react';
import { useEffect, useMemo } from 'react';
import { FaEthereum } from 'react-icons/fa';
import { styled } from 'styled-components/macro';
import tw from 'twin.macro';
import { useSessionStorage } from '../hooks/utils/useLocalStorage';
import { erc721Abi } from '../utils/abi/erc721';

const FormContainer = styled.form`
  ${tw`space-y-4`}

  label {
    ${tw`flex flex-col gap-2 w-full text-xl font-semibold`}
    > * {
      ${tw`text-lg font-normal`}
    }
  }

  input[type='text'],
  input[type='number'],
  textarea {
    ${tw`w-full border-2 p-2 rounded-lg`}
  }
`;

export const WalletAreaButton = tw.div`flex items-center gap-2 px-4 py-2 border-2 text-lg rounded-full cursor-pointer select-none bg-[#fff8] hover:bg-gray-100`;

export default function WalletArea() {
  // const user = useIdentity();
  const { status, connect, account, chainId, ethereum } = useMetaMask();
  const [nftUrl, setNftUrl] = useSessionStorage('ic-eth.nft-url', '');
  // const [nftImage, setNftImage] = useState<string>();

  const parseNft = (nftUrl: string) => {
    const groups =
      /https:\/\/(testnets\.)?opensea.io\/assets\/(\w+)\/0x(\w+)\/(\d+)/.exec(
        nftUrl,
      );
    if (!groups) {
      return;
    }
    const [, , network, address, tokenId] = groups;
    return {
      network,
      address,
      tokenId: Number(tokenId),
    };
  };

  const nft = useMemo(() => parseNft(nftUrl), [nftUrl]);

  console.log(nft); ////

  useEffect(() => {
    if (nft) {
      // handlePromise(
      //   ethereum
      //     .request('eth_call', {
      //       from: ethereum.selectedAddress,
      //       to: '',
      //       // value:
      //     })
      //     .then(() => {
      //       // let ethersProvider = new ethers.providers.Web3Provider(
      //       //   ethereum,
      //       //   'any',
      //       // );
      //       // let provider = ethers.getDefaultProvider(nft.network);

      //     }),
      //   undefined,
      //   'Error while requesting',
      // );

      let contract = new ethers.Contract(
        '0x7236dA2B814f496ef31b73b461Fbd3309EFe4dcE',
        erc721Abi,
        ethers.getDefaultProvider(nft.network),
      );
      contract
        .tokenURI(nft.tokenId)
        .then((uri) => console.log(uri), console.warn);
    }
  }, [ethereum, nft]);

  const getMetaMaskButton = () => {
    if (status === 'initializing') {
      return <div>Initializing...</div>;
    }
    if (status === 'notConnected') {
      return (
        <WalletAreaButton onClick={connect}>
          <FaEthereum />
          Connect to MetaMask
        </WalletAreaButton>
      );
    }
    if (status === 'connecting') {
      return <div>Connecting...</div>;
    }
    if (status === 'connected') {
      return (
        <div>
          Connected account {account} on chain ID {chainId}
        </div>
      );
    }
    return <div>MetaMask not available</div>;
  };

  return (
    <>
      <div tw="mx-auto">{getMetaMaskButton()}</div>
      <hr tw="my-5" />
      <FormContainer>
        <label>
          OpenSea NFT
          <input
            type="text"
            placeholder="Paste URL here"
            value={nftUrl}
            onChange={(e) => setNftUrl(e.target.value)}
          />
        </label>
      </FormContainer>
    </>
  );
}
