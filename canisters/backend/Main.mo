import System "lib/System";

import Types "Types";
import Core "Core";
import State "State";
import History "History";
import Snapshot "Snapshot";

shared ({ caller = installer }) actor class Main() {

  let sys = System.IC();
  stable var _state_v0 : State.Stable.State = State.Stable.initialState(sys);
  stable var _history_v0 : History.History = History.init(sys, installer);

  let core = Core.Core(installer, sys, _state_v0, _history_v0);

  /// Login and fetch user details. Creates an account if none exists for the caller principal.
  public shared ({ caller }) func login() : async Types.Resp.Login {
    core.login(caller);
  };

  /// If you've already created an account, you can use this method to speed up the login process.
  public query ({ caller }) func fastLogin() : async ?Types.Resp.Login {
    core.fastLogin(caller);
  };

  /// Get a list of connected Ethereum wallets.
  public query ({ caller }) func getEthWallets() : async Types.Resp.GetEthWallets {
    core.getEthWallets(caller);
  };

  /// Connect a new Ethereum wallet, using the given ECDSA signature for authorization.
  public shared ({ caller }) func connectEthWallet(wallet : Types.EthWallet, signedPrincipal : Types.SignedPrincipal) : async Types.Resp.ConnectEthWallet {
    await core.connectEthWallet(caller, wallet, signedPrincipal);
  };

  /// Check if an NFT is currently owned by the given principal.
  public shared ({ caller }) func isNftOwned(principal : Principal, nft : Types.Nft.Nft) : async Bool {
    await core.isNftOwned(caller, principal, nft);
  };

  /// Verify that the given NFTs are owned by the caller, and store the results.
  public shared ({ caller }) func addNfts(nfts : [Types.Nft.Nft]) : async Bool {
    await core.addNfts(caller, nfts);
  };

  /// Retrieve the NFTs which were previously verified via `addNfts()`.
  public query ({ caller }) func getNfts() : async [Types.Nft.Nft] {
    core.getNfts(caller);
  };

  /// Hides all NFTs with the given smart contract or wallet address.
  public shared ({ caller }) func filterAddress(address : Types.Address.Address) : async Bool {
    await core.filterAddress(caller, address);
  };

  /// Retrieve the full log for this canister.
  public query ({ caller }) func getHistory() : async ?[History.Event] {
    core.getHistory(caller);
  };

  /// Retrieve a public-facing log for this canister.
  public query ({ caller }) func getPublicHistory() : async [Types.PublicEvent] {
    core.getPublicHistory(caller);
  };

  /// Retrieve a Candid representation of the canister's internal state.
  public query ({ caller }) func getState() : async ?[Snapshot.Entry] {
    core.getState(caller);
  };

};
