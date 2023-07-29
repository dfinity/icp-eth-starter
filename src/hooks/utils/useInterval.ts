import { useEffect } from 'react';

export default function useInterval(
  callback: (args: void) => void,
  interval?: number,
  delay?: number,
  ...rest: any[]
) {
  useEffect(() => {
    const id = setInterval(callback, interval, delay, ...rest);
    return () => clearInterval(id);
  });
}
