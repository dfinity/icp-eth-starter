import Types "Types";
import Core "Core";
import State "State";

import System "System";

shared ({ caller = installer }) actor class Main() {

  stable var _state_v0 : State.Stable.State = State.Stable.initialState();

  let core = Core.Core(installer, System.IC(), _state_v0);

  public shared ({ caller }) func login() : async Types.Resp.Login {
    core.login(caller);
  };

  public shared ({ caller }) func connectEthWallet(wallet : Types.EthWallet, signedPrincipal : Types.SignedPrincipal) : async Types.Resp.ConnectEthWallet {
    await core.connectEthWallet(caller, wallet, signedPrincipal);
  };
};
