import { backend } from '../declarations/backend';

// Dev console access
(window as any).BACKEND = backend;

export function getBackend() {
  return backend;
}

export function getNetwork(): string | undefined {
  return import.meta.env.DFX_NETWORK;
}

export function isLocalNetwork(): boolean {
  return !getNetwork() || getNetwork() === 'local';
}
