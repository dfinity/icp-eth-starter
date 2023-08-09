import { useCallback, useEffect, useState } from 'react';

export type Refresh<T> = [T, () => Promise<T>];

export default function useRefresh<T>(
  refresh: () => Promise<T | undefined>,
): Refresh<T | undefined>;
export default function useRefresh<T>(
  refresh: () => Promise<T>,
  defaultValue: T,
): Refresh<T>;
export default function useRefresh<T>(
  refresh: () => Promise<T | undefined>,
  defaultValue?: T | undefined,
): Refresh<T | undefined> {
  const [value, setValue] = useState(defaultValue);
  const handleRefresh = useCallback(async () => {
    const value = await refresh();
    setValue(value);
    return value;
  }, [refresh]);
  useEffect(() => {
    handleRefresh();
  }, [handleRefresh]);
  return [value, handleRefresh];
}
