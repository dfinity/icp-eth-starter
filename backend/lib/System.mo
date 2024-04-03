import Time "mo:base/Time";
import Cycles "mo:base/ExperimentalCycles";

module {
  public type Time = Int;
  public type System = {
    time : () -> Time;
    cyclesBalance : () -> Nat;
  };

  public class IC() {
    public func time() : Time {
      Time.now();
    };
    public func cyclesBalance() : Nat {
      Cycles.balance();
    };
  };

  public class UnitTest(deltaTime : Nat) {
    public var _time : Time = 0;
    public var _cyclesBalance = 0;

    public func time() : Time {
      let t0 = _time;
      _time += deltaTime;
      t0;
    };
    public func cyclesBalance() : Nat {
      _cyclesBalance;
    };
  };

};
