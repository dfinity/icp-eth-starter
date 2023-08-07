import { backend } from '../declarations/backend';

// Dev console access
(window as any).BACKEND = backend;

export function getBackend() {
  return backend;
}

export function getNetwork(): string | undefined {
  return window.process?.env.DFX_NETWORK;
}

export function isLocalNetwork(): boolean {
  const network = getNetwork();
  return !network || network === 'local';
}
