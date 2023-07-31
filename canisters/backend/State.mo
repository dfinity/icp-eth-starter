import Types "Types";
import Relate "Relate";
import System "System";

import Iter "mo:base/Iter";
import Principal "mo:base/Principal";

module {

    public let EthWallet = Types.EthWallet;
    public type EthWallet = Types.EthWallet;
    public type CreateSuccess = Types.CreateSuccess;
    public type SignatureCheckSuccess = Types.SignatureCheckSuccess;
    public type SignedPrincipal = Types.SignedPrincipal;
    
    public module Stable {    
        
        public type State = {
            //
            // Entities
            //
            principals : Relate.Stable.Map<Principal, CreateSuccess>;
            ethWallets : Relate.Stable.Map<EthWallet, CreateSuccess>;

            //
            // Relations
            //
            walletSignsPrincipal : Relate.Stable.TernRel<EthWallet, Principal, SignatureCheckSuccess>;
        };
        
        public func initialState() : State {
            {
                principals = Relate.Stable.emptyMap();
                ethWallets = Relate.Stable.emptyMap();
                walletSignsPrincipal = Relate.Stable.emptyTernRel();
            }
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

        public let principals = Relate.OO.Map<Principal, CreateSuccess>(state.principals, Principal.hash, Principal.equal);
        public let ethWallets = Relate.OO.Map<EthWallet, CreateSuccess>(state.ethWallets, EthWallet.hash, EthWallet.equal);

        public let walletSignsPrincipal = Relate.OO.TernRel<EthWallet, Principal, SignatureCheckSuccess>(
          state.walletSignsPrincipal, (EthWallet.hash, Principal.hash), (EthWallet.equal, Principal.equal));

        // Gets the first login time, possibly this time.
        public func login(p : Principal) : CreateSuccess {
            switch(principals.get(p)) {
            case null {
                     let c = {
                         createTime = sys.time();
                     };
                     principals.put(p, c);
                     c
                 };
            case (?c) c;
            }
        };

        public func getWalletsForPrincipal(p : Principal) : [EthWallet] {
            let data = walletSignsPrincipal.getRelatedRight(p);
            let wallets = Iter.map<(EthWallet, SignatureCheckSuccess),EthWallet> (data, func (w : EthWallet, c : SignatureCheckSuccess) : EthWallet { w } );
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
            succ
        };

        // Get latest timestamp for a checked signature, and the signature, if any.
        public func hasWalletSignsPrincipal(w : EthWallet, p : Principal) : ?SignatureCheckSuccess {
            walletSignsPrincipal.get(w, p)
        };

    }
}
