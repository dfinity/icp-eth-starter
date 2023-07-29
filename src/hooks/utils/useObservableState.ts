import { useCallback, useEffect, useState } from 'react';
import { ObservableValue } from '../../utils/makeObservable';

export default function useObservableState<T>(
  observable: ObservableValue<T>,
): [T, (value: T) => void] {
  const [value, setValueState] = useState(observable.get());

  useEffect(() => observable.subscribe(setValueState), [observable]);

  const setValue = useCallback(
    (value: T) => observable.set(value),
    [observable],
  );

  return [value, setValue];
}
