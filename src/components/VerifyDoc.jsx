import React, { useState, useEffect } from 'react';
import { 
  SearchCheck, 
  UploadCloud, 
  FileCheck2, 
  Hash, 
  Calendar, 
  ShieldCheck, 
  ShieldAlert, 
  ExternalLink, 
  QrCode, 
  Copy, 
  Check, 
  RefreshCw,
  Building2,
  FileQuestion,
  Info,
  Clock,
  Printer
} from 'lucide-react';
import StatusBadge from './StatusBadge';
import { verifyDocumentPublic } from '../services/blockchain';
import { calculateFileSha256, truncateHash, formatTimestamp, formatTimeRemaining } from '../utils/crypto';

export default function VerifyDoc({ initialReferenceId, setActiveTab, onSelectDocumentForQr }) {
  const [method, setMethod] = useState('ref'); // 'ref' or 'file'
  const [referenceInput, setReferenceInput] = useState(initialReferenceId || '');
  const [file, setFile] = useState(null);
  const [computedFileHash, setComputedFileHash] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [copiedHash, setCopiedHash] = useState(false);

  useEffect(() => {
    if (initialReferenceId) {
      setReferenceInput(initialReferenceId);
      triggerVerification({ referenceId: initialReferenceId });
    }
  }, [initialReferenceId]);

  const triggerVerification = async ({ referenceId, fileToVerify }) => {
    setIsVerifying(true);
    setVerificationResult(null);

    try {
      const res = await verifyDocumentPublic({
        referenceId: referenceId ? referenceId.trim() : null,
        file: fileToVerify || null
      });
      setVerificationResult(res);
    } catch (err) {
      console.error(err);
      setVerificationResult({
        exists: false,
        status: 0,
        record: null,
        error: err.message
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleRefSubmit = (e) => {
    e.preventDefault();
    if (!referenceInput.trim()) return;
    triggerVerification({ referenceId: referenceInput });
  };

  const handleFileChange = async (selectedFile) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    setIsVerifying(true);
    try {
      const hash = await calculateFileSha256(selectedFile);
      setComputedFileHash(hash);
      await triggerVerification({ fileToVerify: selectedFile });
    } catch (err) {
      console.error(err);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6">
      
      {/* Title & Free Public Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <SearchCheck className="w-6 h-6 text-cyan-400" />
              <span>Public Document Verification</span>
            </h1>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Free • Zero Wallet Required
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Verify authenticity, registration timestamp, and expiration validity directly against Bohr Testnet.
          </p>
        </div>

        {/* Quick Sample Ref Pill */}
        <button
          onClick={() => {
            setMethod('ref');
            setReferenceInput('EXP-000124');
            triggerVerification({ referenceId: 'EXP-000124' });
          }}
          className="text-xs text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20"
        >
          Try sample: <span className="font-mono font-bold">EXP-000124</span>
        </button>
      </div>

      {/* Tabs: By Reference ID / Hash OR By File Upload */}
      <div className="flex rounded-xl bg-slate-900 border border-slate-800 p-1 max-w-md">
        <button
          onClick={() => setMethod('ref')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
            method === 'ref'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Search by Reference ID / Hash
        </button>
        <button
          onClick={() => setMethod('file')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
            method === 'file'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Verify by Original File
        </button>
      </div>

      {/* Input Box based on Method */}
      {method === 'ref' ? (
        <form onSubmit={handleRefSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Hash className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={referenceInput}
              onChange={(e) => setReferenceInput(e.target.value)}
              placeholder="Enter Reference ID (e.g. EXP-000124) or full 0x... SHA-256 hash"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-700 focus:border-indigo-500 text-xs sm:text-sm text-white placeholder-slate-500 outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={isVerifying || !referenceInput.trim()}
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {isVerifying ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <SearchCheck className="w-4 h-4" />
            )}
            <span>Verify</span>
          </button>
        </form>
      ) : (
        <div 
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              handleFileChange(e.dataTransfer.files[0]);
            }
          }}
          className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-2xl p-6 text-center bg-slate-900/60 cursor-pointer transition-all"
        >
          <input
            type="file"
            id="verify-file"
            className="hidden"
            onChange={(e) => handleFileChange(e.target.files[0])}
          />
          <label htmlFor="verify-file" className="cursor-pointer space-y-2 block">
            <UploadCloud className="w-8 h-8 text-cyan-400 mx-auto" />
            <div className="font-semibold text-white text-xs sm:text-sm">
              {file ? `Analyzing: ${file.name}` : "Drop original document here to verify fingerprint"}
            </div>
            <p className="text-[11px] text-slate-400">
              The file is hashed locally via SHA-256 and matched against the on-chain registry.
            </p>
          </label>
        </div>
      )}

      {/* Loading Indicator */}
      {isVerifying && (
        <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
          <p className="text-xs text-slate-300">
            Querying Bohr Testnet contract (Chain ID 968) for cryptographic proof...
          </p>
        </div>
      )}

      {/* Verification Result Card */}
      {verificationResult && (
        <div className="space-y-4 animate-fade-in">
          {verificationResult.exists ? (
            <div className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-2xl">
              
              {/* Status Header Strip */}
              <div className={`p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b ${
                verificationResult.status === 1 ? 'bg-emerald-950/30 border-emerald-900/40' :
                verificationResult.status === 2 ? 'bg-amber-950/30 border-amber-900/40' :
                verificationResult.status === 3 ? 'bg-orange-950/30 border-orange-900/40' :
                verificationResult.status === 4 ? 'bg-rose-950/30 border-rose-900/40' :
                'bg-slate-950/60 border-slate-800'
              }`}>
                <div className="space-y-1">
                  <div className="text-[11px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Cryptographic Verification Status</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">
                    {verificationResult.record.title}
                  </h2>
                  <div className="text-xs text-slate-400 flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>{verificationResult.record.category}</span>
                    {verificationResult.record.issuer && (
                      <>
                        <span>•</span>
                        <span>Issuer: {verificationResult.record.issuer}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-start sm:items-end gap-1">
                  <StatusBadge status={verificationResult.status} size="lg" />
                  <span className="text-[11px] text-slate-400">
                    {formatTimeRemaining(verificationResult.secondsRemaining)}
                  </span>
                </div>
              </div>

              {/* Document Details Grid */}
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
                
                {/* Reference ID */}
                <div className="space-y-1">
                  <span className="text-slate-400 uppercase text-[10px] font-semibold">Reference Code</span>
                  <div className="font-mono text-base font-bold text-indigo-400">
                    {verificationResult.record.referenceId}
                  </div>
                </div>

                {/* Expiry Date */}
                <div className="space-y-1">
                  <span className="text-slate-400 uppercase text-[10px] font-semibold">Expiry Date</span>
                  <div className="font-semibold text-white text-base">
                    {formatTimestamp(verificationResult.record.expiryTimestamp)}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Based on block timestamp
                  </div>
                </div>

                {/* Registration Date */}
                <div className="space-y-1">
                  <span className="text-slate-400 uppercase text-[10px] font-semibold">Registered On-Chain</span>
                  <div className="font-semibold text-white text-base">
                    {formatTimestamp(verificationResult.record.registrationTimestamp)}
                  </div>
                </div>

                {/* Fingerprint */}
                <div className="sm:col-span-2 space-y-1">
                  <span className="text-slate-400 uppercase text-[10px] font-semibold">
                    Document Fingerprint (SHA-256)
                  </span>
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-cyan-300">
                    <span className="truncate">{verificationResult.record.docHash}</span>
                    <button
                      onClick={() => handleCopy(verificationResult.record.docHash)}
                      className="p-1 hover:text-white rounded shrink-0"
                      title="Copy Hash"
                    >
                      {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Registrant Wallet */}
                <div className="space-y-1">
                  <span className="text-slate-400 uppercase text-[10px] font-semibold">Registrant Wallet</span>
                  <a
                    href={`https://scan.bohr.life/address/${verificationResult.record.owner}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 font-mono text-xs text-indigo-400 hover:text-indigo-300 underline"
                  >
                    <span>{truncateHash(verificationResult.record.owner, 6)}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Verification Seal & Action Footer */}
              <div className="bg-slate-950/80 border-t border-slate-800 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Verified on Bohr Testnet • Contract ledger is immutable</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (onSelectDocumentForQr) onSelectDocumentForQr(verificationResult.record.referenceId);
                      setActiveTab('qr');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 font-medium"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>View QR Badge</span>
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Certificate Proof</span>
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="rounded-2xl bg-slate-900/80 border border-rose-900/40 p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
                <FileQuestion className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">No Matching Record Found</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                The document fingerprint or reference ID does not exist on the Bohr Testnet registry.
                Ensure you have selected the exact original file or typed the correct reference ID.
              </p>
              {computedFileHash && (
                <div className="max-w-md mx-auto p-2 bg-slate-950 rounded-lg text-slate-400 font-mono text-[11px] truncate">
                  Computed SHA-256: {computedFileHash}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Info Callout */}
      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 text-xs text-slate-400 flex items-start gap-3">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-semibold text-slate-300">How Blockchain Expiry Verification Works:</span>
          <p>
            When an expiry date passes, the status automatically displays <strong className="text-rose-400">Expired</strong> based on the block timestamp. No new transaction or renewal fee is required for the status to change.
          </p>
        </div>
      </div>

    </div>
  );
}

