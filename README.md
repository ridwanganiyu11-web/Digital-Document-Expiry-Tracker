# ExpiryChain (Digital Document Expiry Tracker)

> **Register. Track. Verify. Never miss an expiry.**

ExpiryChain is a Web3 compliance and document tracking platform built for **Bohr Testnet (Chain ID 968)**. It allows individuals, enterprises, schools, and organizations to register document fingerprints on-chain, track expiry dates, and let anyone publicly verify whether a document is still valid, expiring soon, or expired—**completely free and without connecting a wallet**.

---

## 🌐 Network Specifications

| Parameter | Value |
| :--- | :--- |
| **Network Name** | Bohr Testnet |
| **Chain ID** | `968` |
| **RPC URL** | `https://rpc.bohr.life` |
| **Native Token** | `BOT` |
| **Total Supply** | 150 Million |
| **Block Explorer** | [https://scan.bohr.life](https://scan.bohr.life) |

---

## 🔒 Privacy & Architecture (Option A: Full Document Verification)

1. **Zero File Upload / 100% Confidential**: Original document files are **never** uploaded to any server or public blockchain.
2. **Client-side Fingerprinting**: The browser computes the document's cryptographic **SHA-256 hash** using the native Web Crypto API (`crypto.subtle.digest`).
3. **On-Chain Anchor**: Only the SHA-256 fingerprint (`bytes32`), unique Reference ID (e.g., `EXP-000124`), title, category, and expiry timestamp are stored in the smart contract.
4. **Dynamic Expiration**: When the expiry timestamp passes, verification queries automatically resolve to **Expired** based on the block timestamp. No subsequent transaction or renewal fee is needed for the status to change.

---

## 🚀 6 Core Application Modules

1. **Dashboard**: High-level compliance overview (Total Docs, Valid, Expiring Soon, Critical, Expired, Revoked), testnet statistics, recent registrations, and instant lookup search.
2. **Register Document**: Drag-and-drop file uploader with live SHA-256 fingerprint generation, unique reference code generator, category selector, expiry date picker, and one-click transaction signing.
3. **Verify Document**: **Free public verification requiring zero wallet or crypto**. Supports both searching by Reference ID / Hash or dropping the original file to verify its fingerprint against the ledger.
4. **My Documents**: Full document lifecycle management for connected wallets. Search, filter by status, update expiration dates, and revoke compromised or superseded documents.
5. **QR Verification**: Generates high-resolution digital seal certificates with scannable QR codes pointing to deep-link verification (`?verify=EXP-XXXXXX`), printable badges, and shareable links.
6. **Expiry Monitor**: Compliance radar dashboard with dedicated warning sections for **Critical (≤ 7 days)**, **Impending (≤ 30 days)**, **Expired**, and **Healthy (> 30 days)**.

---

## 📜 Smart Contract (`DocumentExpiryRegistry.sol`)

The lightweight, gas-optimized Solidity smart contract is located in [`contracts/DocumentExpiryRegistry.sol`](contracts/DocumentExpiryRegistry.sol):

- `registerDocument(bytes32 docHash, string referenceId, string title, string category, uint256 expiryTimestamp)`
- `verifyDocument(bytes32 docHash)` *(Public View, Free)*
- `verifyByReference(string referenceId)` *(Public View, Free)*
- `getDocument(bytes32 docHash)` *(View)*
- `getMyDocuments()` *(View)*
- `getAllDocuments()` *(View)*
- `updateExpiry(bytes32 docHash, uint256 newExpiryTimestamp)` *(Owner only)*
- `revokeDocument(bytes32 docHash)` *(Owner only)*

---

## ⛽ Gas Economics

| Action | Gas Required? | Wallet Required? |
| :--- | :---: | :---: |
| **Register Document** | Yes (Gas in BOT) | Yes (MetaMask / AppKit) |
| **Update Expiry** | Yes (Gas in BOT) | Yes (Owner Wallet) |
| **Revoke Document** | Yes (Gas in BOT) | Yes (Owner Wallet) |
| **Public Verification** | **Free** | **No Wallet Needed** |
| **Scan QR Code** | **Free** | **No Wallet Needed** |
| **Browse Dashboard** | **Free** | **No Wallet Needed** |

---

## 🛠️ Development & Running Locally

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Production build
npm run build
```
