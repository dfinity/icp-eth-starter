import Types "Types";

import Iter "mo:base/Iter";
import Principal "mo:base/Principal";
import Int "mo:base/Int";
import Seq "mo:sequence/Sequence";
import Stream "mo:sequence/Stream";
import Iter_ "lib/IterMore";
import Relate "lib/Relate";
import System "lib/System";

module {

  public let Address = Types.Address;
  public type EthWallet = Types.EthWallet;
  public type CreateSuccess = Types.CreateSuccess;
  public type SignatureCheckSuccess = Types.SignatureCheckSuccess;
  public type OwnershipCheckSuccess = Types.OwnershipCheckSuccess;
  public type SignedPrincipal = Types.SignedPrincipal;

  public let NftId = Types.Nft.Id;
  public type NftId = Types.Nft.Id.Id;
  public type Nft = Types.Nft.Nft;

  public module Stable {

    public type PublicHistory = {
      var events : Seq.Sequence<Types.PublicEvent>;
    };

    public type State = {
      //
      // Public History (for Homepage)
      //
      publicHistory : PublicHistory;

      //
      // Entities
      //
      principals : Relate.Stable.Map<Principal, CreateSuccess>;
      ethWallets : Relate.Stable.Map<EthWallet, CreateSuccess>;
      ethNfts : Relate.Stable.Map<NftId, Nft>;
      filteredAddresses : Relate.Stable.Map<Address.Address, ()>;

      //
      // Relations
      //
      walletSignsPrincipal : Relate.Stable.TernRel<EthWallet, Principal, SignatureCheckSuccess>;
      walletOwnsNft : Relate.Stable.TernRel<EthWallet, NftId, OwnershipCheckSuccess>;
    };

    public func initialState(sys : System.System) : State {
      {
        publicHistory = {
          var events = Seq.make(#install { time = sys.time() });
        };

        principals = Relate.Stable.emptyMap();
        ethWallets = Relate.Stable.emptyMap();
        ethNfts = Relate.Stable.emptyMap();
        filteredAddresses = Relate.Stable.emptyMap();

        walletSignsPrincipal = Relate.Stable.emptyTernRel();
        walletOwnsNft = Relate.Stable.emptyTernRel();
      };
    };
  };

  // Linked objected-oriented and stable state of a Core.
  //
  // Compared to Core, Core adds:
  // - logging (absent here).
  // - access control (absent here).
  // - interactions with other services/canisters (absent here).
  //
  public class OOOf(sys : System.System, state : Stable.State) {

    let levels : Stream.Stream<Nat32> = Stream.Bernoulli.seedFrom(Int.abs(sys.time()));

    public let principals = Relate.OO.Map<Principal, CreateSuccess>(state.principals, Principal.hash, Principal.equal);
    public let ethWallets = Relate.OO.Map<EthWallet, CreateSuccess>(state.ethWallets, Address.hash, Address.equal);

    public let ethNfts = Relate.OO.Map<NftId, Nft>(state.ethNfts, NftId.hash, NftId.equal);

    public let filteredAddresses = Relate.OO.UnRel<Address.Address>(state.filteredAddresses, Address.hash, Address.equal);

    public let walletSignsPrincipal = Relate.OO.TernRel<EthWallet, Principal, SignatureCheckSuccess>(
      state.walletSignsPrincipal,
      (Address.hash, Principal.hash),
      (Address.equal, Principal.equal),
    );

    public let walletOwnsNft = Relate.OO.TernRel<EthWallet, NftId, OwnershipCheckSuccess>(
      state.walletOwnsNft,
      (Address.hash, NftId.hash),
      (Address.equal, NftId.equal),
    );

    // Gets the first login time, possibly this time.
    public func login(p : Principal) : CreateSuccess {
      switch (principals.get(p)) {
        case null {
          let c = {
            createTime = sys.time();
          };
          principals.put(p, c);
          c;
        };
        case (?c) c;
      };
    };

    public func getWalletsForPrincipal(p : Principal) : [EthWallet] {
      let data = walletSignsPrincipal.getRelatedRight(p);
      let wallets = Iter.map<(EthWallet, SignatureCheckSuccess), EthWallet>(data, func(w, c) : EthWallet { w });
      Iter.toArray(wallets)

    };

    // Side-effect:
    // overwrites the timestamp of any prior check with the current time.
    public func putWalletSignsPrincipal(w : EthWallet, p : Principal, s : SignedPrincipal) : SignatureCheckSuccess {
      let succ = {
        checkTime = sys.time();
        signedPrincipal = s;
      };
      walletSignsPrincipal.put(w, p, succ);
      succ;
    };

    // Get latest timestamp for a checked signature, and the signature, if any.
    public func hasWalletSignsPrincipal(w : EthWallet, p : Principal) : ?SignatureCheckSuccess {
      walletSignsPrincipal.get(w, p);
    };

    func emit(event : Types.PublicEvent) {
      state.publicHistory.events := Seq.pushBack<Types.PublicEvent>(
        state.publicHistory.events,
        levels.next(),
        event,
      );
    };

    public func emitAddNftEvent(principal : Principal, wallet : EthWallet, nft : Nft) {
      emit(#addNft { principal; nft; wallet; time = sys.time() });
    };

    public func getPublicHistory() : Iter.Iter<Types.PublicEvent> {
      Iter_.filterMap<Types.PublicEvent, Types.PublicEvent>(
        Seq.iter(state.publicHistory.events, #bwd),
        func(e : Types.PublicEvent) : ?Types.PublicEvent {
          switch (e) {
            case (#addNft(e)) {
              if (
                not filteredAddresses.has(e.nft.contract) and not filteredAddresses.has(e.nft.owner)
              ) ? #addNft(e) else null;
            };
            case (e) ?e;
          };
        },
      );
    };

  };
};
