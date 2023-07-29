# IC ~ ETH

> #### Canister code for interacting with the [Ethereum](https://ethereum.org/) blockchain from the [Internet Computer](https://internetcomputer.org/).

---

### Get started directly in your browser:

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/dfinity/ic-eth-starter)

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

When ready, run `dfx deploy` to build and deploy your application.

## Technology Stack

**Front-end Webapp:**
- [TypeScript](https://www.typescriptlang.org/): JavaScript extended with syntax for types
- [Vite](https://vitejs.dev/): high-performance tooling for front-end web development
- [React](https://reactjs.org/): a component-based UI library
- [Zustand](https://www.npmjs.com/package/zustand): a simple, clean state management library
- [Tailwind](https://tailwindcss.com/): a highly expressive, utility-first CSS framework
- [Prettier](https://prettier.io/): code formatting for a wide range of supported languages

**Back-end Service:**
- [Motoko](https://github.com/dfinity/motoko#readme): a safe and simple programming language for the Internet Computer
- [mo-dev](https://github.com/dfinity/motoko-dev-server#readme): a live reload development server for Motoko
- [MOPS](https://j4mwm-bqaaa-aaaam-qajbq-cai.ic0.app/): an on-chain community package manager for Motoko

## Documentation

- [Vite developer docs](https://vitejs.dev/guide/)
- [React quick start guide](https://react.dev/learn)
- [Tailwind reference](https://v2.tailwindcss.com/docs)
- [Internet Computer docs](https://internetcomputer.org/docs/current/developer-docs/ic-overview)
- [Motoko developer docs](https://internetcomputer.org/docs/current/developer-docs/build/cdks/motoko-dfinity/motoko/)
- [MOPS usage instructions](https://j4mwm-bqaaa-aaaam-qajbq-cai.ic0.app/#/docs/install)
- [`dfx.json` reference schema](https://internetcomputer.org/docs/current/references/dfx-json-reference/)

## Tips and Tricks

- Customize your project's code style by editing the `.prettierrc` file and then running `npm run format`.
- Reduce the latency of update calls by passing the `--emulator` flag to `dfx start`.
- Install a Motoko package by running `npx ic-mops add <package-name>`. Here is a [list of available packages](https://mops.one/).
- Split your frontend and backend console output by running `npm run frontend` and `npm run backend` in separate terminals.

---

Contributions are welcome! Please check out the [contributor guidelines](https://github.com/dfinity/ic-eth-starter/blob/main/.github/CONTRIBUTING.md) for more information.
