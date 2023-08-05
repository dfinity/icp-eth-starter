import Types "Types";
import Core "Core";
import State "State";

import System "System";
import History "History";
import Snapshot "Snapshot";

shared ({ caller = installer }) actor class Main() {

  let sys = System.IC();
  stable var _state_v0 : State.Stable.State = State.Stable.initialState(sys);
  stable var _history_v0 : History.History = History.init(sys, installer);

  let core = Core.Core(installer, sys, _state_v0, _history_v0);

  public shared ({ caller }) func login() : async Types.Resp.Login {
    core.login(caller);
  };

  public query ({ caller }) func fastLogin() : async ?Types.Resp.Login {
    core.fastLogin(caller);
  };

  public query ({ caller }) func getEthWallets() : async Types.Resp.GetEthWallets {
    core.getEthWallets(caller);
  };

  public shared ({ caller }) func connectEthWallet(wallet : Types.EthWallet, signedPrincipal : Types.SignedPrincipal) : async Types.Resp.ConnectEthWallet {
    await core.connectEthWallet(caller, wallet, signedPrincipal);
  };

  public shared ({ caller }) func isNftOwned(caller : Principal, nft : Types.Nft.Nft) : async Bool {
    await core.isNftOwned(caller, nft);
  };

  public shared ({ caller }) func addNfts(nfts : [Types.Nft.Nft]) : async Bool {
    await core.addNfts(caller, nfts);
  };

  public query ({ caller }) func getNfts(nfts : [Types.Nft.Nft]) : async [Types.Nft.Nft] {
    core.getNfts(caller);
  };

  public shared ({ caller }) func getHistory() : async ?[History.Event] {
    core.getHistory(caller);
  };

  public query ({ caller }) func getPublicHistory() : async [Types.PublicEvent] {
    core.getPublicHistory(caller);
  };

  public shared ({ caller }) func getState() : async ?[Snapshot.Entry] {
    core.getState(caller);
  };

};
