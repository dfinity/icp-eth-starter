import { useEffect } from 'react';

export default function useTimeout(
  callback: (args: void) => void,
  ms?: number,
  ...rest: any[]
) {
  useEffect(() => {
    const id = setTimeout(callback, ms, ...rest);
    return () => clearTimeout(id);
  });
}
