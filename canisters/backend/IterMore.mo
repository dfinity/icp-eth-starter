import Trie "mo:base/Trie";
import Iter "mo:base/Iter";
import Int "mo:base/Int";

// This module "extends" the module Iter, until we can merge into base, perhaps.
module {
  public type Iter<X> = Iter.Iter<X>;

  // "inherit" map, toArray and others from Iter.
  public let map = Iter.map;
  public let toArray = Iter.toArray;

  // to do -- open PR for motoko-base.
  public func trie2D<X, Y, Z>(t : Trie.Trie2D<X, Y, Z>) : Iter<(X, Y, Z)> {
    // maybe there's a way to elimninate some type args, but they
    // seemed required at the time of authoring them.
    flatten(
      Iter.map<(X, Trie.Trie<Y, Z>), Iter<(X, Y, Z)>>(
        Trie.iter<X, Trie.Trie<Y, Z>>(t),
        func(x : X, t2 : Trie.Trie<Y, Z>) : Iter<(X, Y, Z)> {
          Iter.map<(Y, Z), (X, Y, Z)>(
            Trie.iter<Y, Z>(t2),
            func(y : Y, z : Z) : (X, Y, Z) { (x, y, z) },
          );
        },
      )
    );
  };

  // to do -- open PR for motoko-base.
  public func flatten<X>(i : Iter<Iter<X>>) : Iter<X> {
    object {
      var inner = i.next();
      public func next() : ?X {
        switch inner {
          case null null;
          case (?j) {
            switch (j.next()) {
              case (?x) ?x;
              case null { inner := i.next(); next() };
            };
          };
        };
      };
    };
  };

  // to do -- open PR for motoko-base.
  public func append<X>(i1 : Iter<X>, i2 : Iter<X>) : Iter<X> {
    object {
      public func next() : ?X {
        switch (i1.next()) {
          case (?x) ?x;
          case null i2.next();
        };
      };
    };
  };

  // to do -- open PR for motoko-base.
  public func all<X>(iters : [Iter<X>]) : Iter<X> {
    var all = object { public func next() : ?X { null } };
    var i : Int = iters.size() - 1;
    loop {
      all := append(iters[Int.abs(i)], all);
      i := i - 1;
      if (i < 0) {
        return all;
      };
    };
  };

  public func mapFilter<X, Y>(xs : Iter<X>, f : X -> ?Y) : Iter<Y> {
    object {
      public func next() : ?Y {
        loop {
          switch (xs.next()) {
            case (null) {
              return null;
            };
            case (?x) {
              switch (f(x)) {
                case null {};
                case (?y) { return ?y };
              };
            };
          };
        };
        null;
      };
    };
  };

};
