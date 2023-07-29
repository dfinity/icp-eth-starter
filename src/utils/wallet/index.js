import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory } from './wallet.did.js';

export const createWallet = (canisterId, options = {}) => {
  const agent = options.agent || new HttpAgent({ ...options.agentOptions });
  if (options.agent && options.agentOptions) {
    console.warn(
      'Detected both agent and agentOptions passed to createActor. Ignoring agentOptions and proceeding with the provided agent.',
    );
  }
  if (process.env.DFX_NETWORK !== 'ic') {
    agent.fetchRootKey().catch((err) => {
      console.warn(
        'Unable to fetch root key. Check to ensure that your local replica is running',
      );
      console.error(err);
    });
  }
  return Actor.createActor(idlFactory, {
    agent,
    canisterId,
    ...options.actorOptions,
  });
};
