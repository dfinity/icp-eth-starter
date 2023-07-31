import Types "Types";
import State "State";
import System "System";

module {
    public class Core(installer : Principal, sys : System.System, _state : State.Stable.State) {
        
        let state = State.OOOf(sys, _state);

        func unreachable() : None {
            do { assert false; loop {} }
        };
        
        public func login(caller : Principal) : Types.Resp.Login {
            // to do -- logging.
            let succ = state.login(caller);
            { succ with principal = caller ; ethWallets = state.getWalletsForPrincipal(caller) }
        };
        
        // to do --
        // use Rust canister to verify that wallet signed caller Principal.
        // returns true when this succeeds and false otherwise.
        
        public func connectEthWallet(caller : Principal, wallet : Types.EthWallet, signedPrincipal : Types.SignedPrincipal) : async Types.Resp.ConnectEthWallet {
            // to do -- logging.

            let checkOutcome = false;
            // to do -- actually check.
            
            if (checkOutcome) {                
                let succ = state.putWalletSignsPrincipal(wallet, caller, signedPrincipal);
                true
            } else {
                false
            }
        };

    }
}
