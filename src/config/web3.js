import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { defineChain } from 'viem';

// Bohr / Botchain Testnet Definition (Chain ID 968)
export const bohrTestnet = defineChain({
  id: 968,
  name: 'Bohr Testnet',
  network: 'bohr-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Bohr Token',
    symbol: 'BOT',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.bohr.life'],
    },
    public: {
      http: ['https://rpc.bohr.life'],
    },
  },
  blockExplorers: {
    default: {
      name: 'BohrScan',
      url: 'https://scan.bohr.life',
    },
  },
  testnet: true,
});

// AppKit project ID (reads from .env VITE_REOWN_PROJECT_ID with development fallback)
export const projectId = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_REOWN_PROJECT_ID)
  ? import.meta.env.VITE_REOWN_PROJECT_ID
  : 'c4f79cc821944d9680842e34466bfb';

export const networks = [bohrTestnet];

export const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks,
});

// AppKit modal setup
export const metadata = {
  name: 'ExpiryChain',
  description: 'Register. Track. Verify. Never miss an expiry.',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://expirychain.io',
  icons: ['https://scan.bohr.life/favicon.ico'],
};

// Initialize AppKit conditionally
let appKitInstance = null;
if (typeof window !== 'undefined') {
  try {
    appKitInstance = createAppKit({
      adapters: [wagmiAdapter],
      networks: [bohrTestnet],
      defaultNetwork: bohrTestnet,
      metadata,
      projectId,
      features: {
        analytics: false,
      },
      themeMode: 'dark',
      themeVariables: {
        '--w3m-accent': '#6366f1',
        '--w3m-border-radius-master': '12px',
      }
    });
  } catch (err) {
    console.warn("AppKit init warning:", err);
  }
}

export { appKitInstance };

