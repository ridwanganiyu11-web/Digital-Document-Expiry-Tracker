// Botchain / Bohr Testnet Configuration
export const BOTCHAIN_TESTNET = {
  id: 968,
  name: 'Bohr Testnet',
  network: 'bohr-testnet',
  nativeCurrency: {
    name: 'Bohr Token',
    symbol: 'BOT',
    decimals: 18,
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
};

// Contract Address - reads from .env VITE_CONTRACT_ADDRESS with fallback to deployed Bohr Testnet contract
export const DEFAULT_CONTRACT_ADDRESS = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_CONTRACT_ADDRESS) 
  ? import.meta.env.VITE_CONTRACT_ADDRESS 
  : "0xc0068c93b50087b1ceeefec41e05b0593adcea5d";

export const DOCUMENT_REGISTRY_ABI = [
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "bytes32", "name": "docHash", "type": "bytes32" },
      { "indexed": false, "internalType": "string", "name": "referenceId", "type": "string" },
      { "indexed": true, "internalType": "address", "name": "owner", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "expiryTimestamp", "type": "uint256" },
      { "indexed": false, "internalType": "string", "name": "title", "type": "string" },
      { "indexed": false, "internalType": "string", "name": "category", "type": "string" }
    ],
    "name": "DocumentRegistered",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "bytes32", "name": "docHash", "type": "bytes32" },
      { "indexed": false, "internalType": "uint256", "name": "oldExpiry", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "newExpiry", "type": "uint256" }
    ],
    "name": "DocumentExpiryUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "bytes32", "name": "docHash", "type": "bytes32" },
      { "indexed": true, "internalType": "address", "name": "owner", "type": "address" }
    ],
    "name": "DocumentRevoked",
    "type": "event"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "docHash", "type": "bytes32" },
      { "internalType": "string", "name": "referenceId", "type": "string" },
      { "internalType": "string", "name": "title", "type": "string" },
      { "internalType": "string", "name": "category", "type": "string" },
      { "internalType": "uint256", "name": "expiryTimestamp", "type": "uint256" }
    ],
    "name": "registerDocument",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "docHash", "type": "bytes32" },
      { "internalType": "uint256", "name": "newExpiryTimestamp", "type": "uint256" }
    ],
    "name": "updateExpiry",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "docHash", "type": "bytes32" }
    ],
    "name": "revokeDocument",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "docHash", "type": "bytes32" }
    ],
    "name": "verifyDocument",
    "outputs": [
      { "internalType": "bool", "name": "exists", "type": "bool" },
      { "internalType": "uint8", "name": "status", "type": "uint8" },
      {
        "components": [
          { "internalType": "bytes32", "name": "docHash", "type": "bytes32" },
          { "internalType": "string", "name": "referenceId", "type": "string" },
          { "internalType": "string", "name": "title", "type": "string" },
          { "internalType": "string", "name": "category", "type": "string" },
          { "internalType": "uint256", "name": "expiryTimestamp", "type": "uint256" },
          { "internalType": "uint256", "name": "registrationTimestamp", "type": "uint256" },
          { "internalType": "address", "name": "owner", "type": "address" },
          { "internalType": "bool", "name": "isRevoked", "type": "bool" }
        ],
        "internalType": "struct DocumentExpiryRegistry.DocumentRecord",
        "name": "record",
        "type": "tuple"
      },
      { "internalType": "uint256", "name": "secondsRemaining", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "referenceId", "type": "string" }
    ],
    "name": "verifyByReference",
    "outputs": [
      { "internalType": "bool", "name": "exists", "type": "bool" },
      { "internalType": "uint8", "name": "status", "type": "uint8" },
      {
        "components": [
          { "internalType": "bytes32", "name": "docHash", "type": "bytes32" },
          { "internalType": "string", "name": "referenceId", "type": "string" },
          { "internalType": "string", "name": "title", "type": "string" },
          { "internalType": "string", "name": "category", "type": "string" },
          { "internalType": "uint256", "name": "expiryTimestamp", "type": "uint256" },
          { "internalType": "uint256", "name": "registrationTimestamp", "type": "uint256" },
          { "internalType": "address", "name": "owner", "type": "address" },
          { "internalType": "bool", "name": "isRevoked", "type": "bool" }
        ],
        "internalType": "struct DocumentExpiryRegistry.DocumentRecord",
        "name": "record",
        "type": "tuple"
      },
      { "internalType": "uint256", "name": "secondsRemaining", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "docHash", "type": "bytes32" }
    ],
    "name": "getDocument",
    "outputs": [
      {
        "components": [
          { "internalType": "bytes32", "name": "docHash", "type": "bytes32" },
          { "internalType": "string", "name": "referenceId", "type": "string" },
          { "internalType": "string", "name": "title", "type": "string" },
          { "internalType": "string", "name": "category", "type": "string" },
          { "internalType": "uint256", "name": "expiryTimestamp", "type": "uint256" },
          { "internalType": "uint256", "name": "registrationTimestamp", "type": "uint256" },
          { "internalType": "address", "name": "owner", "type": "address" },
          { "internalType": "bool", "name": "isRevoked", "type": "bool" }
        ],
        "internalType": "struct DocumentExpiryRegistry.DocumentRecord",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getMyDocuments",
    "outputs": [
      {
        "components": [
          { "internalType": "bytes32", "name": "docHash", "type": "bytes32" },
          { "internalType": "string", "name": "referenceId", "type": "string" },
          { "internalType": "string", "name": "title", "type": "string" },
          { "internalType": "string", "name": "category", "type": "string" },
          { "internalType": "uint256", "name": "expiryTimestamp", "type": "uint256" },
          { "internalType": "uint256", "name": "registrationTimestamp", "type": "uint256" },
          { "internalType": "address", "name": "owner", "type": "address" },
          { "internalType": "bool", "name": "isRevoked", "type": "bool" }
        ],
        "internalType": "struct DocumentExpiryRegistry.DocumentRecord[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllDocuments",
    "outputs": [
      {
        "components": [
          { "internalType": "bytes32", "name": "docHash", "type": "bytes32" },
          { "internalType": "string", "name": "referenceId", "type": "string" },
          { "internalType": "string", "name": "title", "type": "string" },
          { "internalType": "string", "name": "category", "type": "string" },
          { "internalType": "uint256", "name": "expiryTimestamp", "type": "uint256" },
          { "internalType": "uint256", "name": "registrationTimestamp", "type": "uint256" },
          { "internalType": "address", "name": "owner", "type": "address" },
          { "internalType": "bool", "name": "isRevoked", "type": "bool" }
        ],
        "internalType": "struct DocumentExpiryRegistry.DocumentRecord[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTotalDocuments",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "docHash", "type": "bytes32" }
    ],
    "name": "getDocumentStatus",
    "outputs": [
      { "internalType": "uint8", "name": "", "type": "uint8" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

export const STATUS_LABELS = {
  0: { label: "Not Found", color: "gray", badgeClass: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" },
  1: { label: "Valid", color: "emerald", badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800" },
  2: { label: "Expiring Soon", color: "amber", badgeClass: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800" },
  3: { label: "Critical (<7d)", color: "orange", badgeClass: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-800" },
  4: { label: "Expired", color: "rose", badgeClass: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800" },
  5: { label: "Revoked", color: "slate", badgeClass: "bg-slate-200 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700" }
};

