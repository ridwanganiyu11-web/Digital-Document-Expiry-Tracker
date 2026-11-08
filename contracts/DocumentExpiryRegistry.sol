// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title DocumentExpiryRegistry
 * @dev ExpiryChain - On-chain document fingerprint & expiration tracking registry.
 * Documents remain 100% off-chain; only SHA-256 fingerprints, reference IDs, and expiry timestamps are stored.
 */
contract DocumentExpiryRegistry {
    enum DocumentStatus {
        DoesNotExist,
        Valid,
        ExpiringSoon, // <= 30 days
        Critical,     // <= 7 days
        Expired,
        Revoked
    }

    struct DocumentRecord {
        bytes32 docHash;              // SHA-256 hash of document
        string referenceId;           // Human-readable reference ID (e.g., EXP-000124)
        string title;                 // Document title/name
        string category;              // Category (License, Insurance, Certificate, etc.)
        uint256 expiryTimestamp;      // Expiration time in Unix seconds
        uint256 registrationTimestamp;// Block timestamp when registered
        address owner;                // Registrant wallet address
        bool isRevoked;               // Revocation flag
    }

    // Mapping from docHash (SHA-256) to DocumentRecord
    mapping(bytes32 => DocumentRecord) public documents;

    // Mapping from reference ID to docHash
    mapping(string => bytes32) public referenceToHash;

    // Mapping from wallet owner to list of registered docHashes
    mapping(address => bytes32[]) private userDocuments;

    // Array of all registered document hashes (for public tracking/verification)
    bytes32[] private allDocHashes;

    // Events
    event DocumentRegistered(
        bytes32 indexed docHash,
        string referenceId,
        address indexed owner,
        uint256 expiryTimestamp,
        string title,
        string category
    );

    event DocumentExpiryUpdated(
        bytes32 indexed docHash,
        uint256 oldExpiry,
        uint256 newExpiry
    );

    event DocumentRevoked(
        bytes32 indexed docHash,
        address indexed owner
    );

    error DocumentAlreadyRegistered(bytes32 docHash);
    error ReferenceIdAlreadyExists(string referenceId);
    error DocumentNotFound();
    error NotDocumentOwner();
    error DocumentAlreadyRevoked();
    error InvalidExpiryDate();
    error EmptyHash();
    error EmptyReferenceId();

    modifier onlyDocOwner(bytes32 docHash) {
        if (documents[docHash].docHash == bytes32(0)) revert DocumentNotFound();
        if (documents[docHash].owner != msg.sender) revert NotDocumentOwner();
        _;
    }

    /**
     * @notice Register a new document with its SHA-256 fingerprint and expiry timestamp.
     * @param docHash The SHA-256 fingerprint (bytes32) of the original file.
     * @param referenceId A unique reference code (e.g. EXP-000124).
     * @param title Title or descriptive name of the document.
     * @param category Category or tag (e.g., "Professional Licence", "Insurance Certificate").
     * @param expiryTimestamp Future Unix timestamp when the document expires.
     */
    function registerDocument(
        bytes32 docHash,
        string calldata referenceId,
        string calldata title,
        string calldata category,
        uint256 expiryTimestamp
    ) external {
        if (docHash == bytes32(0)) revert EmptyHash();
        if (bytes(referenceId).length == 0) revert EmptyReferenceId();
        if (documents[docHash].docHash != bytes32(0)) revert DocumentAlreadyRegistered(docHash);
        if (referenceToHash[referenceId] != bytes32(0)) revert ReferenceIdAlreadyExists(referenceId);
        if (expiryTimestamp <= block.timestamp) revert InvalidExpiryDate();

        DocumentRecord memory newDoc = DocumentRecord({
            docHash: docHash,
            referenceId: referenceId,
            title: title,
            category: category,
            expiryTimestamp: expiryTimestamp,
            registrationTimestamp: block.timestamp,
            owner: msg.sender,
            isRevoked: false
        });

        documents[docHash] = newDoc;
        referenceToHash[referenceId] = docHash;
        userDocuments[msg.sender].push(docHash);
        allDocHashes.push(docHash);

        emit DocumentRegistered(
            docHash,
            referenceId,
            msg.sender,
            expiryTimestamp,
            title,
            category
        );
    }

    /**
     * @notice Determine status of a document dynamically based on block.timestamp.
     */
    function getDocumentStatus(bytes32 docHash) public view returns (DocumentStatus) {
        DocumentRecord memory doc = documents[docHash];
        if (doc.docHash == bytes32(0)) {
            return DocumentStatus.DoesNotExist;
        }
        if (doc.isRevoked) {
            return DocumentStatus.Revoked;
        }
        if (block.timestamp >= doc.expiryTimestamp) {
            return DocumentStatus.Expired;
        }
        uint256 secondsLeft = doc.expiryTimestamp - block.timestamp;
        if (secondsLeft <= 7 days) {
            return DocumentStatus.Critical;
        }
        if (secondsLeft <= 30 days) {
            return DocumentStatus.ExpiringSoon;
        }
        return DocumentStatus.Valid;
    }

    /**
     * @notice Verify document details by its SHA-256 fingerprint.
     * Read-only public function — no gas or wallet required.
     */
    function verifyDocument(bytes32 docHash)
        external
        view
        returns (
            bool exists,
            DocumentStatus status,
            DocumentRecord memory record,
            uint256 secondsRemaining
        )
    {
        DocumentRecord memory doc = documents[docHash];
        if (doc.docHash == bytes32(0)) {
            return (false, DocumentStatus.DoesNotExist, doc, 0);
        }

        DocumentStatus currentStatus = getDocumentStatus(docHash);
        uint256 remaining = (block.timestamp < doc.expiryTimestamp)
            ? (doc.expiryTimestamp - block.timestamp)
            : 0;

        return (true, currentStatus, doc, remaining);
    }

    /**
     * @notice Verify document details by its human-readable reference ID.
     * Read-only public function — no gas or wallet required.
     */
    function verifyByReference(string calldata referenceId)
        external
        view
        returns (
            bool exists,
            DocumentStatus status,
            DocumentRecord memory record,
            uint256 secondsRemaining
        )
    {
        bytes32 docHash = referenceToHash[referenceId];
        if (docHash == bytes32(0)) {
            DocumentRecord memory emptyDoc;
            return (false, DocumentStatus.DoesNotExist, emptyDoc, 0);
        }
        return this.verifyDocument(docHash);
    }

    /**
     * @notice Retrieve full document record by hash.
     */
    function getDocument(bytes32 docHash) external view returns (DocumentRecord memory) {
        return documents[docHash];
    }

    /**
     * @notice Retrieve all documents registered by the caller wallet.
     */
    function getMyDocuments() external view returns (DocumentRecord[] memory) {
        bytes32[] memory hashes = userDocuments[msg.sender];
        DocumentRecord[] memory myDocs = new DocumentRecord[](hashes.length);
        for (uint256 i = 0; i < hashes.length; i++) {
            myDocs[i] = documents[hashes[i]];
        }
        return myDocs;
    }

    /**
     * @notice Retrieve all registered documents for dashboard & registry explorer.
     */
    function getAllDocuments() external view returns (DocumentRecord[] memory) {
        uint256 count = allDocHashes.length;
        DocumentRecord[] memory allDocs = new DocumentRecord[](count);
        for (uint256 i = 0; i < count; i++) {
            allDocs[i] = documents[allDocHashes[i]];
        }
        return allDocs;
    }

    /**
     * @notice Get total registered document count.
     */
    function getTotalDocuments() external view returns (uint256) {
        return allDocHashes.length;
    }

    /**
     * @notice Update expiry date for a registered document. Only owner can execute.
     */
    function updateExpiry(bytes32 docHash, uint256 newExpiryTimestamp) external onlyDocOwner(docHash) {
        if (documents[docHash].isRevoked) revert DocumentAlreadyRevoked();
        if (newExpiryTimestamp <= block.timestamp) revert InvalidExpiryDate();

        uint256 oldExpiry = documents[docHash].expiryTimestamp;
        documents[docHash].expiryTimestamp = newExpiryTimestamp;

        emit DocumentExpiryUpdated(docHash, oldExpiry, newExpiryTimestamp);
    }

    /**
     * @notice Revoke a document. Only owner can execute.
     */
    function revokeDocument(bytes32 docHash) external onlyDocOwner(docHash) {
        if (documents[docHash].isRevoked) revert DocumentAlreadyRevoked();
        documents[docHash].isRevoked = true;

        emit DocumentRevoked(docHash, msg.sender);
    }
}

