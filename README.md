# IC 🔗 ETH

> #### Interact with the [Ethereum](https://ethereum.org/) blockchain from the [Internet Computer](https://internetcomputer.org/).

---

### Get started directly in your browser:

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/dfinity/ic-eth-starter)

[Visit Deployed Webapp](https://xm3ir-rqaaa-aaaap-abhqq-cai.icp0.io/)

## Create a New Project

Make sure that [Node.js](https://nodejs.org/en/) `>= 16.x`, [`dfx`](https://internetcomputer.org/docs/current/developer-docs/build/install-upgrade-remove) `>= 0.12.x`, and the latest version of [Rust](https://www.rust-lang.org/tools/install) are installed on your system.

Set up Rust canister development with the following command:

```sh
rustup target add wasm32-unknown-unknown
```

Run the following commands in a new, empty project directory:

```sh
npx degit dfinity/ic-eth-starter # Download this starter project
dfx start --clean --background # Run dfx in the background
npm run setup # Install packages, deploy canisters, and generate type bindings

npm start # Start the development server
```

When ready, run `dfx deploy --network ic` to deploy your application to the Internet Computer.

## Ethereum Testnets

This starter project makes it possible for an IC canister to verify the ownership of Ethereum NFTs. Both the [Sepolia](https://www.alchemy.com/overviews/sepolia-testnet) and [Goerli](https://goerli.net/) testnets are supported in addition to the Ethereum mainnet. 

Here is our recommended way to acquire tokens and NFTs on the Sepolia testnet:

- Install [MetaMask](https://metamask.io/) and create a new wallet for testing purposes
- Fund your wallet using the [Sepolia Faucet](https://sepoliafaucet.com/) (requires signing up for an [Alchemy](https://www.alchemy.com/) account)
- Navigate to MetaMask's [E2E Test Dapp](https://metamask.github.io/test-dapp/)
  - Connect your wallet
  - In your MetaMask extension, change the network from "Ethereum Mainnet" to "Sepolia" ([visual guide](https://support.metamask.io/hc/en-us/articles/13946422437147-How-to-view-testnets-in-MetaMask))
  - Scroll down to the "NFTs" section
  - Press "Deploy" and then "Mint" (may take a few seconds)
  - Press "Watch all NFTs" and in the MetaMask prompt, click the link with text "Test Dapp NFTs #1"
  - In the bottom-right of the page (under "TokenID"), press "#1" to view your newly minted NFT
  - Copy / paste the URL into the [IC 🔗 ETH demo project](https://xm3ir-rqaaa-aaaap-abhqq-cai.icp0.io/verify) to verify that you are the owner of the NFT. 

## Technology Stack

**Front-end Webapp:**
- [TypeScript](https://www.typescriptlang.org/): JavaScript extended with syntax for types
- [Vite](https://vitejs.dev/): high-performance tooling for front-end web development
- [React](https://reactjs.org/): a component-based UI library
- [Tailwind](https://tailwindcss.com/): a highly expressive, utility-first CSS framework
- [Prettier](https://prettier.io/): code formatting for a wide range of supported languages

**Back-end Canister:**
- [Motoko](https://github.com/dfinity/motoko#readme): a safe and simple programming language for the Internet Computer
- [Mops](https://mops.one): an on-chain community package manager for Motoko
- [mo-dev](https://github.com/dfinity/motoko-dev-server#readme): a live reload development server for Motoko

**Ethereum Integration:**
- [Rust](https://www.rust-lang.org/): a secure, high-performance canister programming language
- [MetaMask](https://metamask.io/): a wallet and browser extension for interacting with Ethereum dapps

## Documentation

- [Vite developer docs](https://vitejs.dev/guide/)
- [React quick start guide](https://react.dev/learn)
- [Tailwind reference](https://v2.tailwindcss.com/docs)
- [Internet Computer docs](https://internetcomputer.org/docs/current/developer-docs/ic-overview)
- [`dfx.json` reference schema](https://internetcomputer.org/docs/current/references/dfx-json-reference/)
- [Motoko developer docs](https://internetcomputer.org/docs/current/developer-docs/build/cdks/motoko-dfinity/motoko/)
- [Mops usage instructions](https://j4mwm-bqaaa-aaaam-qajbq-cai.ic0.app/#/docs/install)
- [Rust canister guide](https://internetcomputer.org/docs/current/developer-docs/backend/rust/)
- [MetaMask developer docs](https://docs.metamask.io/)

## Tips and Tricks

- Customize your project's code style by editing the `.prettierrc` file and then running `npm run format`.
- Reduce the latency of update calls by passing the `--emulator` flag to `dfx start`.
- Install a Motoko package by running `npx ic-mops add <package-name>`. Here is a [list of available packages](https://mops.one/).
- Split your frontend and backend console output by running `npm run frontend` and `npm run backend` in separate terminals.

---

Contributions are welcome! Please check out the [contributor guidelines](https://github.com/dfinity/ic-eth-starter/blob/main/.github/CONTRIBUTING.md) for more information.
