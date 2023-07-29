import useObservableState from './useObservableState';
import makeObservable, { ObservableValue } from '../../utils/makeObservable';
import { useCallback } from 'react';

const storageMap = new Map<Storage, Map<string, ObservableValue<any>>>();

function makePropertyObservable<T>(
  parent: Storage,
  key: string,
  defaultValue: T,
): ObservableValue<T> {
  let observableMap = storageMap.get(parent);
  if (!observableMap) {
    observableMap = new Map();
    storageMap.set(parent, observableMap);
  }

  if (observableMap.has(key)) {
    // throw new Error(`Local storage observable already exists for key: ${key}`);
    return observableMap.get(key)!;
  }
  let observable: ObservableValue<T>;
  try {
    const item = parent[key];
    observable = makeObservable(item ? JSON.parse(item) : defaultValue);
  } catch (err) {
    console.error(err);
    observable = makeObservable(defaultValue);
  }
  observableMap.set(key, observable);
  observable.subscribe((value) => {
    try {
      if (value !== undefined) {
        parent[key] = JSON.stringify(value);
      } else {
        delete parent[key];
      }
    } catch (err) {
      console.error(err);
    }
  });
  return observable;
}

export function makeSessionStorageObservable<T>(key: string, defaultValue?: T) {
  return makePropertyObservable(sessionStorage, key, defaultValue);
}

export function makeLocalStorageObservable<T>(key: string, defaultValue?: T) {
  return makePropertyObservable(localStorage, key, defaultValue);
}

function usePropertyStorage<T>(
  storage: Storage,
  key: string,
  defaultValue: T,
): [T, (newValue: T) => void] {
  // Find or create global observable value for key
  const observable =
    storageMap.get(storage)?.get(key) ||
    makePropertyObservable(storage, key, defaultValue);

  const [storedValue, setStoredValue] = useObservableState(observable);

  const setValue = useCallback(
    <T>(value: T) => {
      const valueToStore: any =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
    },
    [storedValue, setStoredValue],
  );

  return [
    storedValue,
    setValue,
    // observable,
  ];
}

export function useSessionStorage<T>(
  key: string,
): [T | undefined, (newValue: T | undefined) => void];
export function useSessionStorage<T>(
  key: string,
  defaultValue: T,
): [T, (newValue: T) => void];
export function useSessionStorage<T>(key: string, defaultValue?: T) {
  return usePropertyStorage(sessionStorage, key, defaultValue);
}

export function useLocalStorage<T>(
  key: string,
): [T | undefined, (newValue: T | undefined) => void];
export function useLocalStorage<T>(
  key: string,
  defaultValue: T,
): [T, (newValue: T) => void];
export default function useLocalStorage<T>(key: string, defaultValue?: T) {
  return usePropertyStorage(localStorage, key, defaultValue);
}
