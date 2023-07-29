import { Actor } from '@dfinity/agent';
import { IDL } from '@dfinity/candid';
import { Principal } from '@dfinity/principal';
import { useCallback, useEffect, useState } from 'react';
import useObservableState from '../hooks/utils/useObservableState';
import { displayCycles } from '../utils/cycles';
import { handlePromise } from '../utils/handlers';
import makeObservable from '../utils/makeObservable';
import { createWallet } from '../utils/wallet';
import { getBackend } from './backendService';
import { USER_STORE, refreshUser } from './userService';
import { wrap } from '../utils/unwrap';

export const WALLET_AUTHORIZED_STORE = makeObservable(true);

export function useWalletAuthorized(): boolean {
  return useObservableState(WALLET_AUTHORIZED_STORE)[0];
}

function getWalletActor(canisterId: string) {
  const actor = createWallet(canisterId, {
    agent: Actor.agentOf(getBackend()),
  });

  // TODO: cache?
  return actor;
}

export async function getWalletBalance(canisterId: string): Promise<string> {
  const wallet = getWalletActor(canisterId);

  try {
    const result = String((await wallet.wallet_balance()).amount);
    WALLET_AUTHORIZED_STORE.set(true);
    return result;
  } catch (err) {
    if (
      (err as { message?: string })?.message?.includes(
        'Only a controller or custodian can call this method',
      )
    ) {
      WALLET_AUTHORIZED_STORE.set(false);
    }
    throw err;
  }
}

export async function depositCycles(
  canisterId: string,
  amount: string,
): Promise<void> {
  return handlePromise(
    (async () => {
      const principal = Principal.fromText(canisterId);
      const wallet = getWalletActor(canisterId);

      // Ensure account is created beforehand
      await getBackend().deposit_cycles(principal);

      const user = USER_STORE.get();
      if (!user) {
        throw new Error('Not authenticated');
      }

      // Send cycles
      let args = IDL.encode(
        [IDL.Principal],
        [user.client.getIdentity().getPrincipal()],
      );
      await wallet.wallet_call128({
        canister: Actor.canisterIdOf(getBackend()),
        method_name: 'deposit_cycles',
        args: [...new Uint8Array(args)],
        cycles: BigInt(amount),
      });

      await refreshUser();
    })(),
    `Depositing ${displayCycles(amount)}...`,
    'Error while depositing cycles!',
  );
}

export async function withdrawCycles(
  canisterId: string,
  amount: string,
): Promise<void> {
  return handlePromise(
    (async () => {
      const principal = Principal.fromText(canisterId);

      await getBackend().withdraw_cycles(BigInt(amount), wrap(principal));

      await refreshUser();
    })(),
    `Withdrawing ${displayCycles(amount)}...`,
    'Error while withdrawing cycles!',
  );
}

export function useWalletBalance(
  canisterId: string | undefined,
): [string | null | undefined, () => void] {
  const [balance, setBalance] = useState<string | null>();

  const fetchBalance = useCallback(() => {
    if (!canisterId) {
      setBalance(null);
      return;
    }
    setBalance(undefined);
    if (canisterId) {
      getWalletBalance(canisterId).then(setBalance, (err) => {
        setBalance(null);
        console.warn(err);
      });
    }
  }, [canisterId]);

  useEffect(fetchBalance, [fetchBalance]);

  return [balance, fetchBalance];
}
