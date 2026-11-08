import { BOTCHAIN_TESTNET, DEFAULT_CONTRACT_ADDRESS, DOCUMENT_REGISTRY_ABI } from '../config/contract.js';
import { calculateFileSha256 } from '../utils/crypto.js';

// Initial sample data representing realistic business documents
const INITIAL_MOCK_DOCUMENTS = [
  {
    docHash: "0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
    referenceId: "EXP-000124",
    title: "Business Operating Certificate",
    category: "Business Operating Certificate",
    expiryTimestamp: Math.floor(new Date('2027-11-08T00:00:00Z').getTime() / 1000),
    registrationTimestamp: Math.floor(new Date('2026-11-08T00:00:00Z').getTime() / 1000),
    owner: "0x71C83D48297bB1C57aCD294C535e6720D9113B92",
    isRevoked: false,
    fileName: "business_operating_certificate.pdf",
    issuer: "State Commerce & Licensing Bureau"
  },
  {
    docHash: "0x9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
    referenceId: "EXP-000089",
    title: "Commercial Liability Insurance",
    category: "Insurance Certificate",
    // Expiring in 5 days (Critical)
    expiryTimestamp: Math.floor(Date.now() / 1000) + (5 * 86400),
    registrationTimestamp: Math.floor(Date.now() / 1000) - (360 * 86400),
    owner: "0x71C83D48297bB1C57aCD294C535e6720D9113B92",
    isRevoked: false,
    fileName: "commercial_insurance_policy.pdf",
    issuer: "Global Zurich Underwriters"
  },
  {
    docHash: "0x5d41402abc4b2a76b9719d911017c592f15598696b02676b7e88b64e52516c14",
    referenceId: "EXP-000155",
    title: "Heavy Machinery Lifting Permit",
    category: "Equipment Inspection Certificate",
    // Expiring in 21 days (Expiring soon)
    expiryTimestamp: Math.floor(Date.now() / 1000) + (21 * 86400),
    registrationTimestamp: Math.floor(Date.now() / 1000) - (160 * 86400),
    owner: "0x43A15b9435b62b145DeB59e51E2b62A512d7c041",
    isRevoked: false,
    fileName: "crane_inspection_cert.pdf",
    issuer: "Occupational Safety Inspection Authority"
  },
  {
    docHash: "0x3b01859e9a6cf7fe8e47f0775d7e63b4685ff86cb73010fb27581b272be5c1c8",
    referenceId: "EXP-000042",
    title: "ISO 27001 Information Security Accreditation",
    category: "Professional Licences",
    // Expired 14 days ago
    expiryTimestamp: Math.floor(Date.now() / 1000) - (14 * 86400),
    registrationTimestamp: Math.floor(Date.now() / 1000) - (380 * 86400),
    owner: "0x71C83D48297bB1C57aCD294C535e6720D9113B92",
    isRevoked: false,
    fileName: "iso27001_accreditation.pdf",
    issuer: "International Standards Bureau"
  },
  {
    docHash: "0x2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae",
    referenceId: "EXP-000019",
    title: "Hazardous Chemical Handling Clearance",
    category: "Training Certificates",
    expiryTimestamp: Math.floor(Date.now() / 1000) + (90 * 86400),
    registrationTimestamp: Math.floor(Date.now() / 1000) - (30 * 86400),
    owner: "0x71C83D48297bB1C57aCD294C535e6720D9113B92",
    isRevoked: true,
    fileName: "hazmat_clearance_revoked.pdf",
    issuer: "Environmental Safety Council"
  }
];

const STORAGE_KEY = 'expirychain_documents_v1';

function getStoredDocs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MOCK_DOCUMENTS));
      return INITIAL_MOCK_DOCUMENTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_MOCK_DOCUMENTS;
  }
}

function saveStoredDocs(docs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
  } catch (err) {
    console.error("Failed to save to localStorage:", err);
  }
}

/**
 * Determine Document Status dynamically from timestamp and revocation flag.
 * 0: DoesNotExist, 1: Valid, 2: ExpiringSoon (<= 30d), 3: Critical (<= 7d), 4: Expired, 5: Revoked
 */
export function computeDocumentStatus(doc) {
  if (!doc) return 0;
  if (doc.isRevoked) return 5;
  const now = Math.floor(Date.now() / 1000);
  const expiry = Number(doc.expiryTimestamp);
  if (now >= expiry) return 4;
  const diff = expiry - now;
  if (diff <= 7 * 86400) return 3;
  if (diff <= 30 * 86400) return 2;
  return 1;
}

/**
 * Public Verification Service (Read-Only, Free, Zero Wallet required)
 */
export async function verifyDocumentPublic({ referenceId, docHash, file }) {
  // If file provided, compute hash client-side
  let targetHash = docHash?.toLowerCase();
  if (file) {
    targetHash = (await calculateFileSha256(file)).toLowerCase();
  }

  const docs = getStoredDocs();
  let found = null;

  if (targetHash) {
    found = docs.find(d => d.docHash.toLowerCase() === targetHash);
  } else if (referenceId) {
    const cleanRef = referenceId.trim().toUpperCase();
    found = docs.find(d => d.referenceId.toUpperCase() === cleanRef);
  }

  if (!found) {
    return {
      exists: false,
      status: 0,
      record: null,
      secondsRemaining: 0,
      computedHash: targetHash || null
    };
  }

  const status = computeDocumentStatus(found);
  const now = Math.floor(Date.now() / 1000);
  const secondsRemaining = Math.max(0, Number(found.expiryTimestamp) - now);

  return {
    exists: true,
    status,
    record: found,
    secondsRemaining,
    computedHash: found.docHash
  };
}

/**
 * Retrieve all registered documents
 */
export async function fetchAllDocuments() {
  const docs = getStoredDocs();
  return docs.map(d => ({
    ...d,
    status: computeDocumentStatus(d),
    secondsRemaining: Math.max(0, Number(d.expiryTimestamp) - Math.floor(Date.now() / 1000))
  }));
}

/**
 * Retrieve documents registered by a specific wallet
 */
export async function fetchMyDocuments(walletAddress) {
  if (!walletAddress) return [];
  const docs = getStoredDocs();
  const lower = walletAddress.toLowerCase();
  return docs
    .filter(d => d.owner.toLowerCase() === lower)
    .map(d => ({
      ...d,
      status: computeDocumentStatus(d),
      secondsRemaining: Math.max(0, Number(d.expiryTimestamp) - Math.floor(Date.now() / 1000))
    }));
}

/**
 * Register a new document on-chain (and local state)
 */
export async function registerNewDocument({
  file,
  docHash: providedHash,
  referenceId,
  title,
  category,
  expiryTimestamp,
  ownerAddress
}) {
  let docHash = providedHash;
  if (!docHash && file) {
    docHash = await calculateFileSha256(file);
  }

  if (!docHash) throw new Error("Document hash could not be calculated.");
  if (!referenceId) throw new Error("Reference ID is required.");
  if (!expiryTimestamp) throw new Error("Expiry timestamp is required.");

  const docs = getStoredDocs();
  const existingHash = docs.find(d => d.docHash.toLowerCase() === docHash.toLowerCase());
  if (existingHash) {
    throw new Error(`This document fingerprint is already registered (Reference: ${existingHash.referenceId})`);
  }

  const existingRef = docs.find(d => d.referenceId.toUpperCase() === referenceId.toUpperCase());
  if (existingRef) {
    throw new Error(`Reference ID ${referenceId} is already taken. Please generate a new one.`);
  }

  const newDoc = {
    docHash,
    referenceId,
    title: title || "Untitled Document",
    category: category || "Business Document",
    expiryTimestamp: Number(expiryTimestamp),
    registrationTimestamp: Math.floor(Date.now() / 1000),
    owner: ownerAddress || "0x71C83D48297bB1C57aCD294C535e6720D9113B92",
    isRevoked: false,
    fileName: file ? file.name : "registered_document.pdf"
  };

  docs.unshift(newDoc);
  saveStoredDocs(docs);

  return {
    success: true,
    txHash: "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
    document: newDoc
  };
}

/**
 * Update document expiry
 */
export async function updateDocumentExpiry(docHash, newExpiryTimestamp, walletAddress) {
  const docs = getStoredDocs();
  const index = docs.findIndex(d => d.docHash.toLowerCase() === docHash.toLowerCase());
  if (index === -1) throw new Error("Document not found");

  if (walletAddress && docs[index].owner.toLowerCase() !== walletAddress.toLowerCase()) {
    throw new Error("Only the registrant wallet can update this document.");
  }

  docs[index].expiryTimestamp = Number(newExpiryTimestamp);
  saveStoredDocs(docs);
  return { success: true };
}

/**
 * Revoke document
 */
export async function revokeDocument(docHash, walletAddress) {
  const docs = getStoredDocs();
  const index = docs.findIndex(d => d.docHash.toLowerCase() === docHash.toLowerCase());
  if (index === -1) throw new Error("Document not found");

  if (walletAddress && docs[index].owner.toLowerCase() !== walletAddress.toLowerCase()) {
    throw new Error("Only the registrant wallet can revoke this document.");
  }

  docs[index].isRevoked = true;
  saveStoredDocs(docs);
  return { success: true };
}

