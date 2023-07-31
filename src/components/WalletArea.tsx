import { useMetaMask } from 'metamask-react';
import { FaEthereum } from 'react-icons/fa';
import tw from 'twin.macro';

export const WalletAreaButton = tw.div`flex items-center gap-2 px-4 py-2 border-2 text-lg rounded-full cursor-pointer select-none bg-[#fff8] hover:bg-gray-100`;

export default function WalletArea() {
  // const user = useIdentity();
  const { status, connect, account, chainId /* , ethereum */ } = useMetaMask();

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
    <div>
      <div tw="mx-auto">{getMetaMaskButton()}</div>
    </div>
  );
}
