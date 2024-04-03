import Types "Types";
import State "State";

import Trie "mo:base/Trie";
import Iter "lib/IterMore";

module {
  type EthWallet = Types.EthWallet;
  type CreateSuccess = Types.CreateSuccess;
  type Nft = Types.Nft.Nft;
  type NftId = Types.Nft.Id.Id;

  public type Entry = {
    #principal : (Principal, CreateSuccess);
    #ethWallet : (EthWallet, CreateSuccess);
    #ethNft : Nft;
    #walletSignsPrincipal : (EthWallet, Principal, Types.SignatureCheckSuccess);
    #walletOwnsNft : (EthWallet, NftId, Types.OwnershipCheckSuccess);
  };

  /// Construct Entry values.
  module Cons {
    public func principal((p : Principal, c : CreateSuccess)) : Entry {
      #principal(p, c);
    };
    public func ethWallet((w : EthWallet, c : CreateSuccess)) : Entry {
      #ethWallet(w, c);
    };
    public func ethNft((_ : NftId, n : Nft)) : Entry {
      #ethNft(n);
    };
    public func walletSignsPrincipal((w : EthWallet, p : Principal, c : Types.SignatureCheckSuccess)) : Entry {
      #walletSignsPrincipal(w, p, c);
    };
    public func walletOwnsNft((w : EthWallet, n : NftId, c : Types.OwnershipCheckSuccess)) : Entry {
      #walletOwnsNft(w, n, c);
    };
  };

  public type Chunk = [Entry];

  public func getAll(s : State.Stable.State) : Chunk {
    let principals = Iter.map(
      Trie.iter(s.principals.map),
      Cons.principal,
    );

    let ethWallets = Iter.map(
      Trie.iter(s.ethWallets.map),
      Cons.ethWallet,
    );

    let ethNfts = Iter.map(
      Trie.iter(s.ethNfts.map),
      Cons.ethNft,
    );

    let walletSignsPrincipal = Iter.map(
      Iter.trie2D(s.walletSignsPrincipal.aB),
      Cons.walletSignsPrincipal,
    );

    let walletOwnsNft = Iter.map(
      Iter.trie2D(s.walletOwnsNft.aB),
      Cons.walletOwnsNft,
    );

    let all = Iter.all([principals, ethWallets, ethNfts, walletSignsPrincipal, walletOwnsNft]);

    Iter.toArray(all);
  };
};
