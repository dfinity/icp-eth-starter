import { useEffect } from 'react';

type Listener = () => any;
type Options = any;

type AddListener = (key: string, listener: Listener, options?: Options) => any;
type RemoveListener = (key: string, listener: Listener) => any;

type ListenerTarget =
  | { addEventListener: AddListener; removeEventListener: RemoveListener }
  | { on: AddListener; off: RemoveListener };

export default function useListener(
  target: ListenerTarget,
  event: string,
  listener: Listener,
  options: Options,
) {
  useEffect(() => {
    if (!target) {
      return;
    }
    const domTarget = 'addEventListener' in target;
    if (domTarget) {
      target.addEventListener(event, listener, options);
    } else {
      target.on(event, listener, options);
    }
    return () => {
      if (domTarget) {
        target.removeEventListener(event, listener);
      } else {
        target.off(event, listener);
      }
    };
  }, [target, event, listener, options]);
  return listener;
}
