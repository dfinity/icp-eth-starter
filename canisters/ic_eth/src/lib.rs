use std::{cell::RefCell, str::FromStr};

use candid::candid_method;
use ethers_core::{
    abi,
    types::{Address, RecoveryMessage, Signature},
};
use ic_cdk::api::management_canister::http_request::{
    http_request as make_http_request, CanisterHttpRequestArgument, HttpHeader, HttpMethod,
};
use serde::{Deserialize, Serialize};

thread_local! {
    static NEXT_ID: RefCell<usize> = RefCell::default();
}

fn next_id() -> usize {
    NEXT_ID.with(|next_id| {
        let mut next_id = next_id.borrow_mut();
        let id = *next_id;
        *next_id = next_id.wrapping_add(1);
        id
    })
}

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

//
// ?? whitelist / access control
// ?? cycles estimation (for HTTP outcall to RPC mech).
//

#[ic_cdk_macros::update]
#[candid_method]
pub async fn erc721_owner_of(
    network: String,
    nft_contract_address: String,
    token_id: usize,
) -> String {
    let max_response_bytes = 2048;
    let service_url = match network.as_str() {
        "mainnet" => "https://cloudflare-eth.com",
        "sepolia" => "https://rpc.sepolia.org",
        _ => panic!("Unknown network: {}", network),
    }
    .to_string();

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

    let data = to_hex(
        &f.encode_input(&[abi::Token::Uint(token_id.into())])
            .expect("encode_input"),
    );

    #[derive(Serialize)]
    struct JsonRpcRequest {
        id: usize,
        jsonrpc: String,
        method: String,
        params: (EthCallParams, String),
    }
    #[derive(Serialize)]
    struct EthCallParams {
        to: String,
        data: String,
    }

    let json_rpc_payload = serde_json::to_string(&JsonRpcRequest {
        id: next_id(),
        jsonrpc: "2.0".to_string(),
        method: "eth_call".to_string(),
        params: (
            EthCallParams {
                to: nft_contract_address,
                data,
            },
            "latest".to_string(),
        ),
    })
    .expect("Error while encoding JSON-RPC request");

    let parsed_url = url::Url::parse(&service_url).expect("Service URL parse error");
    let host = parsed_url
        .host_str()
        .expect("Invalid service URL host")
        .to_string();

    let request_headers = vec![
        HttpHeader {
            name: "Content-Type".to_string(),
            value: "application/json".to_string(),
        },
        HttpHeader {
            name: "Host".to_string(),
            value: host.to_string(),
        },
    ];
    let request = CanisterHttpRequestArgument {
        url: service_url,
        max_response_bytes: Some(max_response_bytes),
        method: HttpMethod::POST,
        headers: request_headers,
        body: Some(json_rpc_payload.as_bytes().to_vec()),
        transform: None,
    };
    let result = match make_http_request(request, 5000000).await {
        Ok((r,)) => r,
        Err((r, m)) => panic!("{:?} {:?}", r, m),
    };

    #[derive(Deserialize)]
    struct JsonRpcResult {
        result: Option<String>,
        error: Option<JsonRpcError>,
    }
    #[derive(Deserialize)]
    struct JsonRpcError {
        code: isize,
        message: String,
    }
    let json: JsonRpcResult =
        serde_json::from_str(std::str::from_utf8(&result.body).expect("utf8"))
            .expect("JSON was not well-formatted");
    if let Some(err) = json.error {
        panic!("JSON-RPC error code {}: {}", err.code, err.message);
    }
    let result = json.result.expect("Unexpected JSON response");
    format!("0x{}", &result[result.len() - 40..]).to_string()
}

fn to_hex(data: &[u8]) -> String {
    format!("0x{}", hex::encode(data))
}

#[ic_cdk_macros::update]
#[candid_method]
pub async fn erc1155_balance_of(
    network: String,
    nft_contract_address: String,
    owner_address: String,
    token_id: usize,
) -> usize {
    // to do -- use BigUint ?
    // Remove leading `0x` when found
    let network = preprocess_address(&network);
    let nft_contract_address = preprocess_address(&nft_contract_address);
    let owner_address = preprocess_address(&owner_address);
    let owner_address = ethers_core::types::H160::from_slice(owner_address.as_bytes());

    let max_response_bytes = 2048;
    let service_url = match network {
        "mainnet" => "https://cloudflare-eth.com",
        "sepolia" => "https://rpc.sepolia.org",
        _ => panic!("Unknown network: {}", network),
    }
    .to_string();

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

    let data = hex::encode(
        f.encode_input(&[
            abi::Token::Address(owner_address.into()),
            abi::Token::Uint(token_id.into()),
        ])
        .expect("encode_input"),
    );

    #[derive(Serialize)]
    struct JsonRpcRequest {
        id: usize,
        jsonrpc: String,
        method: String,
        params: (EthCallParams, String),
    }
    #[derive(Serialize)]
    struct EthCallParams {
        to: String,
        data: String,
    }

    let json_rpc_payload = serde_json::to_string(&JsonRpcRequest {
        id: 1, // TODO: possibly increment id for each call?
        jsonrpc: "2.0".to_string(),
        method: "eth_call".to_string(),
        params: (
            EthCallParams {
                to: format!("0x{nft_contract_address}").to_string(),
                data: format!("0x{data}").to_string(),
            },
            "latest".to_string(),
        ),
    })
    .expect("Error while encoding JSON-RPC request");

    let parsed_url = url::Url::parse(&service_url).expect("Service URL parse error");
    let host = parsed_url
        .host_str()
        .expect("Invalid service URL host")
        .to_string();

    let request_headers = vec![
        HttpHeader {
            name: "Content-Type".to_string(),
            value: "application/json".to_string(),
        },
        HttpHeader {
            name: "Host".to_string(),
            value: host.to_string(),
        },
    ];
    let request = CanisterHttpRequestArgument {
        url: service_url,
        max_response_bytes: Some(max_response_bytes),
        method: HttpMethod::POST,
        headers: request_headers,
        body: Some(json_rpc_payload.as_bytes().to_vec()),
        transform: None,
    };
    let result = match make_http_request(request, 5000000).await {
        Ok((r,)) => r,
        Err((r, m)) => panic!("{:?} {:?}", r, m),
    };

    #[derive(Deserialize)]
    struct JsonRpcResult {
        result: Option<usize>,
        error: Option<JsonRpcError>,
    }
    #[derive(Deserialize)]
    struct JsonRpcError {
        code: isize,
        message: String,
        // data: String,
    }
    let json: JsonRpcResult =
        serde_json::from_str(std::str::from_utf8(&result.body).expect("utf8"))
            .expect("JSON was not well-formatted");
    if let Some(err) = json.error {
        panic!("JSON-RPC error code {}: {}", err.code, err.message);
    }
    let result = json.result.expect("Unexpected JSON response");
    result
}
