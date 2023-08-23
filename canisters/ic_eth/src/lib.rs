use std::str::FromStr;

use candid::candid_method;
use eth_rpc::call_eth;
use ethers_core::{
    abi::{self, Contract, Token},
    types::{Address, RecoveryMessage, Signature},
};
use ic_cdk::api::management_canister::http_request::{HttpHeader, HttpResponse, TransformArgs};
use util::from_hex;

mod eth_rpc;
mod util;

// Load relevant ABIs (Ethereum equivalent of Candid interfaces)
thread_local! {
    static ERC_721: Contract = include_abi!("../abi/erc721.json");
    static ERC_1155: Contract = include_abi!("../abi/erc1155.json");
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

    let data = ERC_721.with(|abi| {
        abi.function("ownerOf")
            .unwrap()
            .encode_input(&[abi::Token::Uint(token_id.into())])
            .expect("Error while encoding input")
    });

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

    ERC_1155.with(|abi| {
        let f = abi
            .function("ownerOf")
            .unwrap()
            .encode_input(&[
                abi::Token::Address(owner_address.into()),
                abi::Token::Uint(token_id.into()),
            ])
            .expect("Error while encoding input");
        let result = call_eth(&network, contract_address, data).await;
        match f
            .decode_output(&from_hex(&result).expect("decode_hex"))
            .expect("Error while decoding JSON result")
            .get(0)
        {
            Some(Token::Uint(n)) => n.as_u64(),
            _ => panic!("Unexpected JSON output"),
        }
    })
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
