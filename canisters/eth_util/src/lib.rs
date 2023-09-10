use std::{rc::Rc, str::FromStr};

use candid::candid_method;
use ic_eth::core::{
    abi::{Contract, Token},
    types::{Address, RecoveryMessage, Signature},

use ic_eth;;::call_contract;
use ic_eth::util::to_hex;

const HTTP_CYCLES: u128 = 100_000_000;
const MAX_RESPONSE_BYTES: u64 = 1000;

// Load relevant ABIs (Ethereum equivalent of Candid interfaces)
thread_local! {
    static ERC_721: Rc<Contract> = Rc::new(include_abi!("../abi/erc721.json"));
    static ERC_1155: Rc<Contract> = Rc::new(include_abi!("../abi/erc1155.json"));
}

/// Choose the relevant JSON-RPC endpoint for the given network.
fn get_rpc_endpoint(network: &str) -> &'static str {
    match network {
        "mainnet" | "ethereum" => "https://cloudflare-eth.com/v1/mainnet",
        "goerli" => "https://ethereum-goerli.publicnode.com",
        "sepolia" => "https://rpc.sepolia.org",
        _ => panic!("Unsupported network: {}", network),
    }
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
    // TODO: access control
    // TODO: cycles estimation for HTTP outcalls

    let abi = &ERC_721.with(Rc::clone);
    let result = call_contract(
        get_rpc_endpoint(&network),
        contract_address,
        abi,
        "ownerOf",
        &[Token::Uint(token_id.into())],
        HTTP_CYCLES,
        Some(MAX_RESPONSE_BYTES),
    )
    .await;
    match result.get(0) {
        Some(Token::Address(a)) => to_hex(a.as_bytes()),
        _ => panic!("Unexpected result"),
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

    let abi = &ERC_1155.with(Rc::clone);
    let result = call_contract(
        get_rpc_endpoint(&network),
        contract_address,
        *abi,
        "balanceOf",
        &[
            Token::Address(owner_address.into()),
            Token::Uint(token_id.into()),
        ],
        HTTP_CYCLES,
        Some(MAX_RESPONSE_BYTES),
    )
    .await;
    match result.get(0) {
        Some(Token::Uint(n)) => n.as_u64(),
        _ => panic!("Unexpected result"),
    }
}
