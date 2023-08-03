import { useCallback } from 'react';
import useRefresh, { Refresh } from '../hooks/utils/useRefresh';
import { handlePromise } from '../utils/handlers';
import { getBackend } from './backendService';
import useIdentity from './userService';

export function useEthAddresses(): Refresh<string[] | null | undefined> {
  const user = useIdentity();
  const onRefresh = useCallback(
    () =>
      handlePromise(
        (async () => {
          if (user) {
            return null;
          }
          return getBackend().getEthWallets();
        })(),
        'Verifying address...',
        'Error while verifying address!',
      ),
    [user],
  );
  return useRefresh(onRefresh);
}
