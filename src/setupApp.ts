import { Actor } from '@dfinity/agent';
import { getBackend, getNetwork } from './services/backendService';

export const applicationName = 'ICP + Ethereum';

// if (
//   window.location.hostname.endsWith('.icp0.io') ||
//   window.location.hostname.endsWith('.ic0.app')
// ) {
//   // Custom domain name
//   window.location.hostname = 'custom.hostname.org';
// }

const dfxPort = 4943;
const url = new URL(window.location.href);
const canisterId = url.searchParams.get('canisterId');
if (canisterId && url.port === String(dfxPort)) {
  url.searchParams.delete('canisterId');
  // Rewrite to localhost subdomain
  window.location.href = `http://${canisterId}.localhost:${dfxPort}?${url.searchParams}`;
}

const agent = Actor.agentOf(getBackend());
if (getNetwork() === 'ic') {
  (agent as any)._host = 'https://icp-api.io/';
}
