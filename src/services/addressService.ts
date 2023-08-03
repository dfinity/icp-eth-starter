import { useCallback } from 'react';
import useObservableState from '../hooks/utils/useObservableState';
import { handleError, handlePromise } from '../utils/handlers';
import makeObservable from '../utils/makeObservable';
import { getBackend } from './backendService';
import { USER_STORE } from './userService';

export const ADDRESSES_STORE = makeObservable<string[] | null>();

USER_STORE.callAndSubscribe(() => refreshAddresses());

export async function refreshAddresses() {
  try {
    const user = USER_STORE.get();
    if (!user) {
      ADDRESSES_STORE.set(null);
      return;
    }
    ADDRESSES_STORE.set(await getBackend().getEthWallets());
  } catch (err) {
    handleError('Error while fetching Ethereum addresses!');
    ADDRESSES_STORE.set(null);
  }
}

export function useAddressVerified(
  address: string,
  ethereum: any,
): [boolean | undefined, () => void] {
  const [addresses] = useObservableState(ADDRESSES_STORE);
  const verify = useCallback(() => {
    handlePromise(
      verifyAddress(address, ethereum),
      'Verifying wallet...',
      'Error while verifying wallet!',
    );
  }, [address, ethereum]);
  return [
    !addresses ? undefined : !!address && !!addresses?.includes(address),
    verify,
  ];
}

async function verifyAddress(address: string, ethereum: any): Promise<boolean> {
  const user = USER_STORE.get();
  if (!user) {
    return false;
  }
  const principal = user.client.getIdentity().getPrincipal().toString();
  const message = principal; // TODO: human-readable message?
  const signature = await ethereum.request({
    method: 'personal_sign',
    params: [`0x${toHex(message)}`, address],
  });
  const succeeded = await getBackend().connectEthWallet(address, signature);
  if (succeeded) {
    refreshAddresses();
  }
  return succeeded;
}

const toHex = (str: string) => {
  var result = '';
  for (var i = 0; i < str.length; i++) {
    result += str.charCodeAt(i).toString(16);
  }
  return result;
};
