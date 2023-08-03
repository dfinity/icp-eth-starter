import Text "mo:base/Text";
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
  };

  public type EthWallet = EthWallet.Address;
  public type SignedPrincipal = EthWallet.SignedPrincipal;

  // Stored in stable memory, for each wallet-principal pair we check:
  public type SignatureCheckSuccess = {
    signedPrincipal : SignedPrincipal;
    checkTime : System.Time;
  };
};
