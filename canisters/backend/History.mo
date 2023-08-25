import Error "mo:base/Error";
import Cycles "mo:base/ExperimentalCycles";
import Int "mo:base/Int";
import Iter "mo:base/Iter";
import Seq "mo:sequence/Sequence";
import Stream "mo:sequence/Stream";
import System "lib/System";

import Types "Types";

module {

  public type Request = {
    #login;
    #connectEthWallet : (Types.EthWallet, Types.SignedPrincipal);
    #isNftOwned : Types.Nft.Nft;
    #addNfts : [Types.Nft.Nft];
    #filterAddress : Types.Address.Address;
  };

  public type Response = {
    #ok;
    #err;
  };

  public type RequestId = Nat;

  public type Internal = {
    #verifyEcdsaOutcome : Bool;
    #verifyOwnerOutcome : (Types.Nft.Nft, Bool);
  };

  public type Event = {
    #install : {
      time : System.Time;
      cyclesBalance : ?Nat;
      installer : Principal;
    };
    #request : {
      requestId : RequestId;
      time : System.Time;
      caller : Principal;
      cyclesBalance : ?Nat;
      request : Request;
    };
    #internal : {
      requestId : RequestId;
      internal : Internal;
    };
    #response : {
      requestId : RequestId;
      response : Response;
    };
  };

  public type History = {
    var nextRequestId : Nat;
    var events : Seq.Sequence<Event>;
  };

  public func init(sys : System.System, installer : Principal) : History {
    let cyclesBalance = ?sys.cyclesBalance();
    {
      var nextRequestId = 1;
      var events = Seq.make(#install { time = sys.time(); installer; cyclesBalance });
    };
  };

  public type ReqLog = {
    internal : Internal -> ();
    ok : () -> ();
    okWith : <A>(A) -> A;
  };

  ///
  /// OO interface for `Main` canister to log all of its state-affecting update behavior.
  /// Of particular interest are access control checks, and their outcomes.
  ///
  public class Logger(sys : System.System, history : History) {

    let levels : Stream.Stream<Nat32> = Stream.Bernoulli.seedFrom(Int.abs(sys.time()));

    public func getEvents(start : Nat, size : Nat) : [Event] {
      let (_, slice, _) = Seq.slice(history.events, start, size);
      let i : Iter.Iter<Event> = Seq.iter(slice, #fwd);
      Iter.toArray(i);
    };

    public func getSize() : Nat {
      Seq.size(history.events);
    };

    func add(event : Event) {
      history.events := Seq.pushBack<Event>(
        history.events,
        levels.next(),
        event,
      );
    };
    public class Begin(caller : Principal, request : Request) : ReqLog {

      let requestId = history.nextRequestId;
      do {
        history.nextRequestId += 1;
        let cyclesBalance = ?sys.cyclesBalance();
        add(#request { time = sys.time(); caller; request; requestId; cyclesBalance });
      };

      func addResponse(response : Response) {
        add(#response({ requestId; response }));
      };

      public func internal(internal : Internal) {
        add(#internal { requestId; internal });
      };

      public func ok() : () {
        addResponse(#ok);
      };

      public func err() : () {
        addResponse(#err);
      };

      public func okWith<X>(x : X) : X {
        ok();
        x;
      };

      public func errWith<X>(x : X) : X {
        err();
        x;
      };

    };
  };
};
