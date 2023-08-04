import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Hash "mo:base/Hash";
import System "System";

module {

  public type CreateSuccess = {
    createTime : System.Time;
  };

  public module Resp {

    public type Login = CreateSuccess;

    public type GetEthWallets = [EthWallet];
    public type ConnectEthWallet = Bool;
  };

  public module Address {
    public type Address = Text;
    public let hash = Text.hash;
    public let equal = Text.equal;
  };

  public module EthWallet {
    public type Address = Address.Address;
    public type SignedPrincipal = Text;
  };

  public module Nft {
    public type Nft = {
      owner : Address.Address;
      contract : Address.Address;
      tokenType : TokenType;
      tokenId : Nat;
      network : Text;
    };
    public type TokenType = {
      #erc721;
      #erc1155;
    };
    public module Id {
      public type Id = {
        contract : Address.Address;
        tokenId : Nat;
        network : Text;
      };
      public func fromNft(n : Nft) : Id { n };
      public func hash(n : Id) : Hash.Hash {
        Text.hash(n.network # "/" # n.contract # "/" # Nat.toText(n.tokenId));
      };
      public func equal(n1 : Id, n2 : Id) : Bool {
        n1 == n2;
      };
    };
  };

  public type EthWallet = EthWallet.Address;
  public type SignedPrincipal = EthWallet.SignedPrincipal;

  // Stored in stable memory, for each wallet-principal pair we check:
  public type SignatureCheckSuccess = {
    signedPrincipal : SignedPrincipal;
    checkTime : System.Time;
  };

  public type OwnershipCheckSuccess = {
    checkTime : System.Time;
  };
};
