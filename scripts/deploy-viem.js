import fs from 'node:fs';
import path from 'node:path';
import solc from 'solc';
import { createWalletClient, createPublicClient, http, defineChain } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

// Bohr Testnet definition
const bohrTestnet = defineChain({
  id: 968,
  name: 'Bohr Testnet',
  network: 'bohr-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Bohr Token',
    symbol: 'BOT',
  },
  rpcUrls: {
    default: { http: ['https://rpc.bohr.life'] },
    public: { http: ['https://rpc.bohr.life'] },
  },
  blockExplorers: {
    default: { name: 'BohrScan', url: 'https://scan.bohr.life' },
  },
  testnet: true,
});

// Read environment variables from .env
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [key, ...rest] = trimmed.split('=');
    if (key && rest.length > 0) {
      env[key.trim()] = rest.join('=').trim().replace(/^["']|["']$/g, '');
    }
  }
  return env;
}

async function main() {
  console.log('----------------------------------------------------');
  console.log('ExpiryChain — Bohr Testnet Smart Contract Deployment');
  console.log('----------------------------------------------------');

  const env = loadEnv();
  let rawKey = env.PRIVATE_KEY || process.env.PRIVATE_KEY;

  if (!rawKey || rawKey === 'your_private_key_without_0x_prefix') {
    console.error('Error: PRIVATE_KEY not found in .env');
    console.error('Please open .env and enter your wallet private key.');
    process.exit(1);
  }

  if (!rawKey.startsWith('0x')) {
    rawKey = `0x${rawKey}`;
  }

  const account = privateKeyToAccount(rawKey);
  console.log(`Deployer Address: ${account.address}`);

  const publicClient = createPublicClient({
    chain: bohrTestnet,
    transport: http('https://rpc.bohr.life'),
  });

  const walletClient = createWalletClient({
    account,
    chain: bohrTestnet,
    transport: http('https://rpc.bohr.life'),
  });

  // Check balance
  const balance = await publicClient.getBalance({ address: account.address });
  const balanceInBot = Number(balance) / 1e18;
  console.log(`Account Balance: ${balanceInBot} BOT`);

  if (balance === 0n) {
    console.warn('\nWarning: Your balance is 0 BOT on Bohr Testnet.');
    console.warn('You will need a small amount of testnet BOT for gas to deploy.');
  }

  // Compile DocumentExpiryRegistry.sol
  console.log('\nCompiling contracts/DocumentExpiryRegistry.sol...');
  const contractPath = path.resolve(process.cwd(), 'contracts', 'DocumentExpiryRegistry.sol');
  const source = fs.readFileSync(contractPath, 'utf8');

  const input = {
    language: 'Solidity',
    sources: {
      'DocumentExpiryRegistry.sol': {
        content: source,
      },
    },
    settings: {
      outputSelection: {
        '*': {
          '*': ['abi', 'evm.bytecode.object'],
        },
      },
    },
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input)));

  if (output.errors) {
    const errors = output.errors.filter(e => e.severity === 'error');
    if (errors.length > 0) {
      console.error('Compilation Errors:', errors);
      process.exit(1);
    }
  }

  const compiled = output.contracts['DocumentExpiryRegistry.sol']['DocumentExpiryRegistry'];
  const bytecode = `0x${compiled.evm.bytecode.object}`;
  const abi = compiled.abi;

  console.log('Compilation successful!');

  // Deploy
  console.log('\nSubmitting deployment transaction to Bohr Testnet (Chain ID 968)...');
  const hash = await walletClient.deployContract({
    abi,
    bytecode,
    args: [],
  });

  console.log(`Transaction Hash: ${hash}`);
  console.log('Waiting for block confirmation on BohrScan...');

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  const contractAddress = receipt.contractAddress;

  console.log('\n====================================================');
  console.log('CONTRACT SUCCESSFULLY DEPLOYED!');
  console.log(`Contract Address: ${contractAddress}`);
  console.log(`View on BohrScan: https://scan.bohr.life/address/${contractAddress}`);
  console.log('====================================================\n');

  // Auto-update .env with deployed address
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    let envContent = fs.readFileSync(envPath, 'utf8');
    if (envContent.includes('VITE_CONTRACT_ADDRESS=')) {
      envContent = envContent.replace(
        /VITE_CONTRACT_ADDRESS=.*/,
        `VITE_CONTRACT_ADDRESS=${contractAddress}`
      );
    } else {
      envContent += `\nVITE_CONTRACT_ADDRESS=${contractAddress}`;
    }
    fs.writeFileSync(envPath, envContent);
    console.log(`Updated .env with VITE_CONTRACT_ADDRESS=${contractAddress}`);
  } catch (err) {
    console.warn('Could not auto-write contract address to .env:', err.message);
  }
}

main().catch((err) => {
  console.error('\nDeployment failed:', err.message || err);
  process.exit(1);
});

