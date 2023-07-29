import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface _SERVICE {
  'verify_ecdsa' : ActorMethod<[string, string, string], boolean>,
}
