import { Principal } from '@dfinity/principal';
import { useEffect, useState } from 'react';
import {
  FaLock,
  FaLongArrowAltLeft,
  FaLongArrowAltRight,
} from 'react-icons/fa';
import tw from 'twin.macro';
import { getNetwork } from '../services/backendService';
import useIdentity, { refreshUser } from '../services/userService';
import {
  depositCycles,
  useWalletAuthorized,
  useWalletBalance,
  withdrawCycles,
} from '../services/walletService';
import { displayCycles } from '../utils/cycles';
import { handleError } from '../utils/handlers';
import CyclesAmount from './CyclesAmount';

export const WalletAreaButton = tw.div`px-4 py-2 border-2 text-lg rounded-full cursor-pointer select-none bg-[#fff8] hover:bg-gray-100`;

// export interface WalletAreaProps {}

export default function WalletArea(/* {}: WalletAreaProps */) {
  const user = useIdentity();
  const [walletId, setWalletId] = useState<string>('');
  // const [computedWalletBalance, setComputedWalletBalance] = useState<string>();
  const walletAuthorized = useWalletAuthorized();
  const [sendAmount, setSendAmount] = useState('');
  const [refreshingUser, setRefreshingUser] = useState(false);

  let walletPrincipal: Principal | undefined;
  try {
    // Check if user input is a valid principal
    if (walletId) {
      walletPrincipal = Principal.fromText(walletId || '?');
    }
  } catch (err) {
    if (
      !(err as { message?: string })?.message?.includes(
        'may not be a valid Principal ID',
      )
    ) {
      handleError(err);
    }
  }

  // Get balance of valid wallet principal
  const [walletBalance, fetchWalletBalance] = useWalletBalance(
    walletPrincipal?.toString(),
  );
  const displayedWalletBalance =
    walletBalance ?? undefined; /* ?? computedWalletBalance */

  useEffect(() => {
    const wallet = user?.detail.wallet;
    if (wallet) {
      setWalletId(wallet);
    }
  }, [user?.detail.wallet]);

  return (
    <div tw="space-y-5">
      <label>
        Cycles wallet
        <input
          type="text"
          tw="mb-0 p-2 rounded-lg text-lg"
          css={[walletId && !walletPrincipal && tw`border-red-600`]}
          placeholder="Paste wallet principal here"
          value={walletId}
          onChange={(e) => {
            setWalletId(e.target.value?.trim());
          }}
          onBlur={() => {
            console.log(
              'Updating wallet:',
              walletPrincipal && String(walletPrincipal),
            );
            // handlePromise(
            //   getBackend().update_wallet(wrap(walletPrincipal)),
            //   undefined,
            //   'Error while updating wallet!',
            // );
          }}
        />
      </label>
      <div tw="flex flex-col sm:flex-row gap-4 sm:gap-8 items-center justify-between">
        <CyclesAmount
          amount={displayedWalletBalance}
          loading={walletBalance === undefined}
          topLabel="Wallet"
          bottomLabel={<FaLongArrowAltRight tw="invisible" />}
          onClick={walletBalance !== undefined ? fetchWalletBalance : undefined}
        />
        <div tw="flex flex-col gap-3">
          <input
            type="number"
            tw="mb-0 p-2 rounded-lg text-lg"
            placeholder="0 TC"
            value={sendAmount}
            onChange={(e) => setSendAmount(e.target.value)}
          />
          <WalletAreaButton
            tw="flex items-center justify-center font-semibold py-3"
            onClick={() => {
              const amount = Number(sendAmount) * 1e12;
              if (amount > 0) {
                depositCycles(walletId, String(amount)).then(() =>
                  fetchWalletBalance(),
                );
              }
            }}
          >
            Deposit <FaLongArrowAltRight tw="ml-3 rotate-90 sm:rotate-0" />
          </WalletAreaButton>
          <WalletAreaButton
            tw="flex items-center justify-center font-semibold py-3"
            onClick={() => {
              const amount = Number(sendAmount) * 1e12;
              if (amount > 0) {
                withdrawCycles(walletId, String(amount)).then(() =>
                  fetchWalletBalance(),
                );
              }
            }}
          >
            <FaLongArrowAltLeft tw="mr-3 rotate-90 sm:rotate-0" /> Withdraw
          </WalletAreaButton>
        </div>
        <CyclesAmount
          amount={
            refreshingUser
              ? undefined
              : user
              ? user.detail.unlockedCycles /* + user.detail.lockedCycles */
              : 0
          }
          topLabel="IC ~ ETH"
          bottomLabel={
            +(user?.detail.lockedCycles || 0) ? (
              <div tw="flex items-center gap-3">
                <FaLock />
                {displayCycles(user?.detail.lockedCycles)}
              </div>
            ) : (
              <FaLongArrowAltLeft tw="invisible" />
            )
          }
          onClick={
            !refreshingUser
              ? () => {
                  setRefreshingUser(true);
                  refreshUser().finally(() => setRefreshingUser(false));
                }
              : undefined
          }
        />
      </div>
      {
        <div tw="mt-2 pt-2 space-y-4 text-teal-600">
          {!walletId ? (
            <>
              <div>Find your wallet address with the following command:</div>
              <code tw="block bg-[#0001] p-1">dfx identity get-wallet</code>
            </>
          ) : (
            !walletAuthorized &&
            user && (
              <>
                <div>Run the following command to authorize this wallet:</div>
                <code tw="block bg-[#0001] p-1">
                  dfx wallet{' '}
                  {getNetwork() ? `--network=${getNetwork()}` : undefined}{' '}
                  authorize {String(user.client.getIdentity().getPrincipal())}
                </code>
              </>
            )
          )}
        </div>
      }
    </div>
  );
}
