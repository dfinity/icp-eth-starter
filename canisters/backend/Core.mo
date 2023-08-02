import Types "Types";
import State "State";
import System "System";
import IcEth "canister:ic_eth";
import Principal "mo:base/Principal";

module {
  public class Core(installer : Principal, sys : System.System, _state : State.Stable.State) {

    let state = State.OOOf(sys, _state);

    func unreachable() : None {
      do { assert false; loop {} };
    };

    public func login(caller : Principal) : Types.Resp.Login {
      // to do -- logging.
      state.login(caller);
    };

    public func fastLogin(caller : Principal) : ?Types.Resp.Login {
      switch (state.principals.get(caller)) {
        case null null;
        case (?_) ?login(caller);
      };
    };

    public func connectEthWallet(caller : Principal, wallet : Types.EthWallet, signedPrincipal : Types.SignedPrincipal) : async Types.Resp.ConnectEthWallet { 
      // to do -- logging.
     let checkOutcome = await IcEth.verify_ecdsa(wallet, Principal.toText caller, signedPrincipal);
      if (checkOutcome) {
        let succ = state.putWalletSignsPrincipal(wallet, caller, signedPrincipal);
        true;
      } else {
        false;
      };
    };

    public func setNfts(caller : Principal, nfts : [Types.Nft.Nft]) : async Bool {
        // to do -- logging.
        //  get_nft_owner : (network : text, nft_contract_address : text, token_id : nat64) -> (text);
        for (nft in nfts.vals()) {
            let owner = await IcEth.get_nft_owner(nft.network, nft.contract, nft.tokenId);
            if(owner == nft.owner) {
                // log success
            } else {
                // log failure
                return false
            }
        };
        true
    };

  };
};
