/// <reference types="vitest" />
import { defineConfig } from 'vite';

import react from '@vitejs/plugin-react';
import { spawnSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

const localNetwork = 'local';
const network = process.env['DFX_NETWORK'] || localNetwork;

let canisterIdPath: string;
if (network === localNetwork) {
  // Local replica canister IDs
  canisterIdPath = join(__dirname, '.dfx/local/canister_ids.json');
} else {
  // Custom canister IDs
  canisterIdPath = join(__dirname, 'canister_ids.json');
}

if (!existsSync(canisterIdPath)) {
  // Create empty canisters
  spawnSync('dfx', ['canister', 'create', '--all'], { cwd: __dirname });

  if (!existsSync(canisterIdPath)) {
    throw new Error(
      'Unable to find canisters. Running `dfx deploy` should fix this problem.',
    );
  }
}
const canisterIds = JSON.parse(readFileSync(canisterIdPath, 'utf8'));

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: './dist',
    emptyOutDir: true,
  },
  plugins: [
    react({
      babel: {
        plugins: ['babel-plugin-twin', 'babel-plugin-macros'],
        ignore: ['\x00commonjsHelpers.js'], // Fix build error (ben-rogerson/babel-plugin-twin#9)
      },
    }),
  ],
  define: {
    'import.meta.env.DFX_NETWORK': JSON.stringify(process.env.DFX_NETWORK),
    // Expose canister IDs provided by `dfx deploy`
    ...Object.fromEntries(
      Object.entries(canisterIds).map(([name, ids]: any) => [
        `process.env.CANISTER_ID_${name.toUpperCase()}`,
        JSON.stringify(ids[network] || ids[localNetwork]),
      ]),
    ),
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        // Patch CBOR library used in agent-js
        global: 'globalThis',
      },
    },
  },
  server: {
    // Local IC replica proxy
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:4943',
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    cache: { dir: './node_modules/.vitest' },
  },
});
