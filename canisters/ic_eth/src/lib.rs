use std::str::FromStr;

use candid::candid_method;
use eth_rpc::call_eth;
use ethers_core::{
    abi::{self, Token},
    types::{Address, RecoveryMessage, Signature},
};
use ic_cdk::api::management_canister::http_request::{HttpHeader, HttpResponse, TransformArgs};
use util::from_hex;

mod util;
mod eth_rpc;

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

    // `ownerOf()` function interface
    #[allow(deprecated)]
    let f = abi::Function {
        name: "ownerOf".to_string(),
        inputs: vec![abi::Param {
            name: "_tokenId".to_string(),
            kind: abi::ParamType::Uint(256),
            internal_type: None,
        }],
        outputs: vec![abi::Param {
            name: "".to_string(),
            kind: abi::ParamType::Address,
            internal_type: None,
        }],
        constant: None,
        state_mutability: abi::StateMutability::View,
    };

    let data = f
        .encode_input(&[abi::Token::Uint(token_id.into())])
        .expect("encode_input");

    let result = call_eth(&network, contract_address, data).await;
    format!("0x{}", &result[result.len() - 40..]).to_string()
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

    // `balanceOf()` function interface
    #[allow(deprecated)]
    let f = abi::Function {
        name: "balanceOf".to_string(),
        inputs: vec![
            abi::Param {
                name: "account".to_string(),
                kind: abi::ParamType::Address,
                internal_type: None,
            },
            abi::Param {
                name: "id".to_string(),
                kind: abi::ParamType::Uint(256),
                internal_type: None,
            },
        ],
        outputs: vec![abi::Param {
            name: "".to_string(),
            kind: abi::ParamType::Uint(256),
            internal_type: None,
        }],
        constant: None,
        state_mutability: abi::StateMutability::View,
    };

    let data = f
        .encode_input(&[
            abi::Token::Address(owner_address.into()),
            abi::Token::Uint(token_id.into()),
        ])
        .expect("encode_input");

    let result = call_eth(&network, contract_address, data).await;
    match f
        .decode_output(&from_hex(&result).expect("decode_hex"))
        .expect("Error while decoding JSON result")
        .get(0)
    {
        Some(Token::Uint(n)) => n.as_u64(), // TODO: convert to `candid::Nat`
        _ => panic!("Unexpected JSON output"),
    }
}

/// Required for HTTP outcalls.
#[ic_cdk_macros::query(name = "transform")]
fn transform(args: TransformArgs) -> HttpResponse {
    HttpResponse {
        status: args.response.status.clone(),
        body: args.response.body,
        // Strip headers as they contain the Date which is not necessarily the same
        // and will prevent consensus on the result.
        headers: Vec::<HttpHeader>::new(),
    }
}
