use std::{rc::Rc, str::FromStr};

use candid::candid_method;
use eth_rpc::call_contract;
use ethers_core::{
    abi::{self, Contract, Token},
    types::{Address, RecoveryMessage, Signature},
};
use util::to_hex;

mod eth_rpc;
mod util;

/// Required for HTTPS outcalls.
pub use eth_rpc::transform;

// Load relevant ABIs (Ethereum equivalent of Candid interfaces)
thread_local! {
    static ERC_721: Rc<Contract> = Rc::new(include_abi!("../abi/erc721.json"));
    static ERC_1155: Rc<Contract> = Rc::new(include_abi!("../abi/erc1155.json"));
}

/// Verify an ECDSA signature (message signed by an Ethereum wallet).
#[ic_cdk_macros::query]
#[candid_method]
pub fn verify_ecdsa(eth_address: String, message: String, signature: String) -> bool {
    Signature::from_str(&signature)
        .unwrap()
        .verify(
            RecoveryMessage::Data(message.into_bytes()),
            Address::from_str(&eth_address).unwrap(),
        )
        .is_ok()
}

/// Find the owner of an ERC-721 NFT by calling the Ethereum blockchain.
#[ic_cdk_macros::update]
#[candid_method]
pub async fn erc721_owner_of(network: String, contract_address: String, token_id: u64) -> String {
    // TODO: whitelist / access control
    // TODO: cycles estimation for HTTP outcalls

    let abi = ERC_721.with(Rc::clone);
    let result = call_contract(
        &network,
        contract_address,
        abi.function("ownerOf").unwrap(),
        &[abi::Token::Uint(token_id.into())],
    )
    .await;
    match result.get(0) {
        Some(Token::Address(a)) => to_hex(a.as_bytes()),
        _ => panic!("Unexpected JSON output"),
    }
}

/// Find the balance of an ERC-1155 token by calling the Ethereum blockchain.
#[ic_cdk_macros::update]
#[candid_method]
pub async fn erc1155_balance_of(
    network: String,
    contract_address: String,
    owner_address: String,
    token_id: u64,
) -> u64 {
    // TODO: use `candid::Nat` in place of `u64`

    let owner_address =
        ethers_core::types::Address::from_str(&owner_address).expect("Invalid owner address");

    let abi = ERC_721.with(Rc::clone);
    let result = call_contract(
        &network,
        contract_address,
        abi.function("ownerOf").unwrap(),
        &[
            abi::Token::Address(owner_address.into()),
            abi::Token::Uint(token_id.into()),
        ],
    )
    .await;
    match result.get(0) {
        Some(Token::Uint(n)) => n.as_u64(),
        _ => panic!("Unexpected JSON output"),
    }
}
