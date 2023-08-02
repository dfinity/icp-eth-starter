import { type Nft } from 'alchemy-sdk';
import { useMetaMask } from 'metamask-react';
import { useEffect, useMemo, useState } from 'react';
import { FaEthereum, FaSignOutAlt } from 'react-icons/fa';
import { styled } from 'styled-components/macro';
import tw from 'twin.macro';
import { useSessionStorage } from '../hooks/utils/useLocalStorage';
import { getAlchemy } from '../services/alchemyService';
import { handlePromise } from '../utils/handlers';
import { LoginAreaButton } from './LoginArea';
import useIdentity, { logout } from '../services/userService';

const FormContainer = styled.form`
  /* ${tw`space-y-4`}

  label {
    ${tw`flex flex-col gap-2 w-full text-xl font-semibold`}
    > * {
      ${tw`text-lg font-normal`}
    }
  } */

  input[type='text'],
  input[type='number'],
  textarea {
    ${tw`w-full border-2 p-2 rounded-lg`}
  }
`;

export const WalletAreaButton = tw.div`flex items-center gap-2 px-4 py-2 border-2 text-lg rounded-full cursor-pointer select-none bg-[#fff8] hover:bg-gray-100`;

export default function WalletArea() {
  const user = useIdentity();
  const { status, connect, account, ethereum } = useMetaMask();
  const [nftUrl, setNftUrl] = useSessionStorage('ic-eth.nft-url', '');
  const [nftResult, setNftResult] = useState<{ nft: Nft } | { err: string }>();

  const parseNft = (nftUrl: string) => {
    const groups =
      /https:\/\/(testnets\.)?opensea.io\/assets\/(\w+)\/(\w+)\/(\d+)/.exec(
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

  const nftInfo = useMemo(() => parseNft(nftUrl), [nftUrl]);

  useEffect(() => {
    if (nftInfo) {
      handlePromise(
        (async () => {
          try {
            // TODO: handle situation where `tokenURI()` is not implemented
            // let contract = new ethers.Contract(
            //   nft.address,
            //   erc721Abi,
            //   getAlchemyProvider(nft.network),
            // );
            // const uri = await contract.tokenURI(nft.tokenId);
            // const meta = await (await fetch(uri)).json();
            const nft = await getAlchemy(
              `eth-${nftInfo.network}` as any,
            ).nft.getNftMetadata(nftInfo.address, nftInfo.tokenId, {});
            setNftResult({ nft });
          } catch (err) {
            console.warn(err);
            setNftResult({ err: String(err) });
          }
        })(),
      );
    }
  }, [ethereum, nftInfo]);

  const getMetaMaskButton = () => {
    if (status === 'notConnected') {
      return (
        <WalletAreaButton onClick={connect}>
          <FaEthereum />
          Connect to MetaMask
        </WalletAreaButton>
      );
    }
    if (status === 'initializing') {
      return <div tw="opacity-60">Initializing...</div>;
    }
    if (status === 'connecting') {
      return <div tw="opacity-60">Connecting...</div>;
    }
    if (status === 'connected') {
      return (
        <div tw="flex flex-col md:flex-row items-center">
          <div tw="flex-1 text-xl text-gray-600">
            <div tw="flex items-center gap-2">
              {/* <FaEthereum tw="hidden sm:block text-3xl" /> */}
              <div>
                Ethereum address:
                <div tw="text-sm font-bold mt-1 overflow-x-auto">{account}</div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div>
        <a
          tw="text-blue-500"
          href="https://metamask.io/"
          target="_blank"
          rel="noreferrer"
        >
          MetaMask is required for this Dapp
        </a>
      </div>
    );
  };

  return (
    <>
      {!!user && (
        <>
          <div tw="flex flex-col md:flex-row items-center">
            <div tw="flex-1 text-xl text-gray-600">
              Internet Computer principal:
              <div tw="text-sm font-bold mt-1">
                {user.client.getIdentity().getPrincipal().toString()}
              </div>
            </div>
            <div tw="flex flex-col items-center mt-3 sm:mt-0">
              <LoginAreaButton
                tw="flex gap-1 items-center text-base px-4"
                onClick={() =>
                  handlePromise(logout(), undefined, 'Error while signing out!')
                }
              >
                <FaSignOutAlt />
                <span tw="font-semibold select-none ml-1">Sign out</span>
              </LoginAreaButton>
            </div>
          </div>
          <hr tw="my-5" />
        </>
      )}
      <div tw="mx-auto">{getMetaMaskButton()}</div>
      <hr tw="my-5" />
      <FormContainer>
        <label>
          <div tw="text-xl text-gray-600 mb-1">OpenSea NFT:</div>
          <input
            type="text"
            placeholder="Paste URL here"
            value={nftUrl}
            onChange={(e) => setNftUrl(e.target.value)}
          />
          {nftInfo && nftResult ? (
            <>
              {'nft' in nftResult && (
                <div tw="mt-3 max-w-[500px] mx-auto">
                  <NftView nft={nftResult.nft} />
                </div>
              )}
              {'err' in nftResult && (
                <div tw="text-red-600">{nftResult.err}</div>
              )}
            </>
          ) : (
            <a
              tw="text-blue-500"
              href="https://opensea.io/account"
              target="_blank"
              rel="noreferrer"
            >
              Account page
            </a>
          )}
        </label>
      </FormContainer>
    </>
  );
}

function NftView({ nft }: { nft: Nft }) {
  return (
    <div tw="p-5 sm:p-6 bg-white rounded-xl space-y-3 drop-shadow-2xl">
      {!!nft.title && (
        <div tw="text-2xl sm:text-3xl font-bold">{nft.title}</div>
      )}
      {!!nft.media.length && (
        <img
          tw="w-full rounded-xl"
          alt="NFT preview"
          src={nft.media[0].gateway}
        />
      )}
      {!!nft.description && <div tw="sm:text-xl">{nft.description}</div>}
    </div>
  );
}
