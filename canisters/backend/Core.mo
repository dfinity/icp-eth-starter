import Types "Types";
import State "State";
import System "System";
import IcEth "canister:ic_eth";
import Principal "mo:base/Principal";
import Nat64 "mo:base/Nat64";
import History "History";

module {
  public class Core(installer : Principal, sys : System.System, _state : State.Stable.State, history : History.History) {

    let state = State.OOOf(sys, _state);
    public let logger = History.Logger(sys, history);

    func unreachable() : None {
      do { assert false; loop {} };
    };

    public func login(caller : Principal) : Types.Resp.Login {
      let log = logger.Begin(caller, #login);
      log.okWith(state.login(caller));
    };

    public func fastLogin(caller : Principal) : ?Types.Resp.Login {
      switch (state.principals.get(caller)) {
        case null null;
        case (?_) ?login(caller);
      };
    };

    public func connectEthWallet(caller : Principal, wallet : Types.EthWallet, signedPrincipal : Types.SignedPrincipal) : async Types.Resp.ConnectEthWallet {
      let log = logger.Begin(caller, #connectEthWallet(wallet, signedPrincipal));
      let checkOutcome = await IcEth.verify_ecdsa(wallet, Principal.toText caller, signedPrincipal);
      log.internal(#verifyEcdsaOutcome(checkOutcome));
      if (checkOutcome) {
        ignore (state.putWalletSignsPrincipal(wallet, caller, signedPrincipal));
      };
      log.okWith(checkOutcome);
    };

    public func setNfts(caller : Principal, nfts : [Types.Nft.Nft]) : async Bool {
      let log = logger.Begin(caller, #setNfts(nfts));
      for (nft in nfts.vals()) {
        let owner = await IcEth.get_nft_owner(nft.network, nft.contract, Nat64.fromNat(nft.tokenId));
        if (owner == nft.owner) {
          log.internal(#verifyOwnerOutcome(nft, true));
        } else {
          log.internal(#verifyOwnerOutcome(nft, false));
          return log.errWith(false);
        };
      };
      log.okWith(true);
    };

    public func getHistory(caller : Principal) : ?[History.Event] {
      do ? {
        // to do -- access control, maybe.
        logger.getEvents(0, logger.getSize());
      };
    };

  };
};
