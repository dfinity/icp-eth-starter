// to do -- make this module into a MOPS package.
import Trie "mo:base/Trie";
import Hash "mo:base/Hash";
import Iter "mo:base/Iter";
import List "mo:base/List";

module {

  public type HashPair<X, Y> = (
    X -> Hash.Hash,
    Y -> Hash.Hash,
  );

  public type EqualPair<X, Y> = (
    (X, X) -> Bool,
    (Y, Y) -> Bool,
  );

  func key<X>(h : X -> Hash.Hash, key : X) : Trie.Key<X> {
    { key; hash = h(key) };
  };

  func iterEmpty<X>() : Iter.Iter<X> {
    object { public func next() : ?X { null } };
  };

  func iterAll<X>(t : Trie.Trie<X, ()>) : Iter.Iter<X> = object {
    var stack = ?(t, null) : List.List<Trie.Trie<X, ()>>;
    public func next() : ?X {
      switch stack {
        case null { null };
        case (?(trie, stack2)) {
          switch trie {
            case (#empty) {
              stack := stack2;
              next();
            };
            case (#leaf({ keyvals = null })) {
              stack := stack2;
              next();
            };
            case (#leaf({ size = c; keyvals = ?((k2, _), kvs) })) {
              stack := ?(#leaf({ size = c -1; keyvals = kvs }), stack2);
              ?k2.key;
            };
            case (#branch(br)) {
              stack := ?(br.left, ?(br.right, stack2));
              next();
            };
          };
        };
      };
    };
  };

  func iterAllPairs<X, Y>(t : Trie.Trie<X, Y>) : Iter.Iter<(X, Y)> = object {
    var stack = ?(t, null) : List.List<Trie.Trie<X, Y>>;
    public func next() : ?(X, Y) {
      switch stack {
        case null { null };
        case (?(trie, stack2)) {
          switch trie {
            case (#empty) {
              stack := stack2;
              next();
            };
            case (#leaf({ keyvals = null })) {
              stack := stack2;
              next();
            };
            case (#leaf({ size = c; keyvals = ?((k2, v2), kvs) })) {
              stack := ?(#leaf({ size = c -1; keyvals = kvs }), stack2);
              ?(k2.key, v2);
            };
            case (#branch(br)) {
              stack := ?(br.left, ?(br.right, stack2));
              next();
            };
          };
        };
      };
    };
  };

  // Relation structures that can be stored directly in stable vars.
  public module Stable {

    // Function from A to B, represented as a data structure.
    public type Map<A, B> = {
      var map : Trie.Trie<A, B>;
    };

    public func emptyMap<A, B>() : Map<A, B> { { var map = Trie.empty() } };

    // Unary relation among A.
    public type UnRel<A> = {
      var map : Trie.Trie<A, ()>;
    };

    public func emptyUnRel<A>() : UnRel<A> { { var map = Trie.empty() } };

    // Binary relation among A and B,
    // stored in way that permits efficiently collecting
    //  - all B related to an A.
    //  - all A related to a B.
    public type BinRel<A, B> = {
      var aB : Trie.Trie2D<A, B, ()>;
      var bA : Trie.Trie2D<B, A, ()>;
    };

    public func emptyBinRel<A, B>() : BinRel<A, B> {
      {
        var aB = Trie.empty();
        var bA = Trie.empty();
      };
    };

    // Ternary relation among A, B, C,
    // stored in way that permits efficiently collecting
    //  - all (B, C) related to an A.
    //  - all (A, C) related to a B.
    public type TernRel<A, B, C> = {
      var aB : Trie.Trie2D<A, B, C>;
      var bA : Trie.Trie2D<B, A, C>;
    };

    public func emptyTernRel<A, B, C>() : TernRel<A, B, C> {
      {
        var aB = Trie.empty();
        var bA = Trie.empty();
      };
    };

  };

  // Ergonomic, invariant-enforcing, object-oriented wrappers for relations, rebuilt on upgrade.
  public module OO {

    public class Map<A, B>(
      stableMap : Stable.Map<A, B>,
      hash : A -> Hash.Hash,
      equal : (A, A) -> Bool,
    ) {
      public func clear() {
        stableMap.map := Trie.empty();
      };

      public func put(a : A, b : B) {
        stableMap.map := Trie.put(stableMap.map, key(hash, a), equal, b).0;
      };

      public func update(a : A, f : B -> B) {
        switch (get(a)) {
          case null { assert false };
          case (?b) {
            stableMap.map := Trie.put(stableMap.map, key(hash, a), equal, f b).0;
          };
        };
      };

      public func get(a : A) : ?B {
        Trie.get(stableMap.map, key(hash, a), equal);
      };

      public func remove(a : A) {
        stableMap.map := Trie.remove(stableMap.map, key(hash, a), equal).0;
      };

      public func entries() : Iter.Iter<(A, B)> {
        iterAllPairs(stableMap.map);
      };
    };

    /// General binary relation.
    public class BinRel<A, B>(
      stableBinRel : Stable.BinRel<A, B>,
      hash : HashPair<A, B>,
      equal : EqualPair<A, B>,
    ) {
      public func clear() {
        stableBinRel.aB := Trie.empty();
        stableBinRel.bA := Trie.empty();
      };

      public func has(a : A, b : B) : Bool {
        let t = Trie.find(stableBinRel.aB, key<A>(hash.0, a), equal.0);
        switch t {
          case null false;
          case (?t) {
            Trie.find<B, ()>(t, key<B>(hash.1, b), equal.1) != null;
          };
        };
      };

      public func getRelatedLeft(a : A) : Iter.Iter<B> {
        let t = Trie.find(stableBinRel.aB, key<A>(hash.0, a), equal.0);
        switch t {
          case null { iterEmpty() };
          case (?t) { iterAll<B>(t) };
        };
      };

      public func getRelatedRight(b : B) : Iter.Iter<A> {
        let t = Trie.find(stableBinRel.bA, key<B>(hash.1, b), equal.1);
        switch t {
          case null { iterEmpty() };
          case (?t) { iterAll<A>(t) };
        };
      };

      public func put(p : (A, B)) {
        let k0 = key(hash.0, p.0);
        let k1 = key(hash.1, p.1);
        stableBinRel.aB := Trie.put2D(stableBinRel.aB, k0, equal.0, k1, equal.1, ());
        stableBinRel.bA := Trie.put2D(stableBinRel.bA, k1, equal.1, k0, equal.0, ());
      };

      public func remove(p : (A, B)) {
        let k0 = key(hash.0, p.0);
        let k1 = key(hash.1, p.1);
        stableBinRel.aB := Trie.remove2D(stableBinRel.aB, k0, equal.0, k1, equal.1).0;
        stableBinRel.bA := Trie.remove2D(stableBinRel.bA, k1, equal.1, k0, equal.0).0;
      };
    };

    /// General unary relation.
    public class UnRel<A>(
      stableUnRel : Stable.UnRel<A>,
      hash : A -> Hash.Hash,
      equal : (A, A) -> Bool,
    ) {
      public func clear() {
        stableUnRel.map := Trie.empty();
      };

      public func has(a : A) : Bool {
        Trie.find(stableUnRel.map, key<A>(hash, a), equal) == ?();
      };

      public func put(a : A) {
        let k0 = key<A>(hash, a);
        stableUnRel.map := Trie.put(stableUnRel.map, k0, equal, ()).0;
      };

      public func remove(a : A) {
        let k0 = key(hash, a);
        stableUnRel.map := Trie.remove(stableUnRel.map, k0, equal).0;
      };
    };

    /// Ternary relation where C is functionally determined by the two other components.
    public class TernRel<A, B, C>(
      stableTernRel : Stable.TernRel<A, B, C>,
      hash : HashPair<A, B>,
      equal : EqualPair<A, B>,
    ) {
      public func clear() {
        stableTernRel.aB := Trie.empty();
        stableTernRel.bA := Trie.empty();
      };

      public func getRelatedLeft(a : A) : Iter.Iter<(B, C)> {
        let t = Trie.find(stableTernRel.aB, key<A>(hash.0, a), equal.0);
        switch t {
          case null { iterEmpty() };
          case (?t) { iterAllPairs(t) };
        };
      };

      public func getRelatedRight(b : B) : Iter.Iter<(A, C)> {
        let t = Trie.find(stableTernRel.bA, key<B>(hash.1, b), equal.1);
        switch t {
          case null { iterEmpty() };
          case (?t) { iterAllPairs(t) };
        };
      };

      public func put(t : (A, B, C)) {
        let k0 = key(hash.0, t.0);
        let k1 = key(hash.1, t.1);
        stableTernRel.aB := Trie.put2D(stableTernRel.aB, k0, equal.0, k1, equal.1, t.2);
        stableTernRel.bA := Trie.put2D(stableTernRel.bA, k1, equal.1, k0, equal.0, t.2);
      };

      public func remove(t : (A, B)) {
        let k0 = key(hash.0, t.0);
        let k1 = key(hash.1, t.1);
        stableTernRel.aB := Trie.remove2D(stableTernRel.aB, k0, equal.0, k1, equal.1).0;
        stableTernRel.bA := Trie.remove2D(stableTernRel.bA, k1, equal.1, k0, equal.0).0;
      };

      public func get(a : A, b : B) : ?C {
        let t = Trie.find(stableTernRel.aB, key<A>(hash.0, a), equal.0);
        switch t {
          case null null;
          case (?t) {
            Trie.find<B, C>(t, key<B>(hash.1, b), equal.1);
          };
        };
      };

    };
  };
};
