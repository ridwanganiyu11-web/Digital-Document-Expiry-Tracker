import React, { useState } from 'react';
import { 
  UploadCloud, 
  FileCheck, 
  Hash, 
  Calendar, 
  Tag, 
  ShieldCheck, 
  RefreshCw, 
  Copy, 
  Check, 
  AlertCircle,
  ExternalLink,
  QrCode,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { calculateFileSha256, generateReferenceId, truncateHash } from '../utils/crypto';
import { registerNewDocument } from '../services/blockchain';

const CATEGORIES = [
  "Business Operating Certificate",
  "Professional Licences",
  "Insurance Certificate",
  "Training Certificates",
  "Equipment Inspection Certificate",
  "Membership Documents",
  "Environmental & Health Clearance",
  "Other Compliance Document"
];

export default function RegisterDoc({ 
  walletAddress, 
  setActiveTab, 
  onSelectDocumentForVerify, 
  onSelectDocumentForQr 
}) {
  const [file, setFile] = useState(null);
  const [docHash, setDocHash] = useState('');
  const [isHashing, setIsHashing] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [expiryDate, setExpiryDate] = useState('');
  const [referenceId, setReferenceId] = useState(generateReferenceId());
  const [copiedHash, setCopiedHash] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [registeredDoc, setRegisteredDoc] = useState(null);

  // Handle file select & calculate SHA-256 instantly
  const handleFileChange = async (selectedFile) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    setIsHashing(true);
    setError('');

    if (!title) {
      // Auto-populate title from file name without extension
      const cleanName = selectedFile.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }

    try {
      const hash = await calculateFileSha256(selectedFile);
      setDocHash(hash);
    } catch (err) {
      console.error(err);
      setError("Failed to compute SHA-256 fingerprint: " + err.message);
    } finally {
      setIsHashing(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleCopyHash = () => {
    if (!docHash) return;
    navigator.clipboard.writeText(docHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleQuickExpiry = (months) => {
    const d = new Date();
    d.setMonth(d.getMonth() + months);
    setExpiryDate(d.toISOString().split('T')[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!docHash) {
      setError("Please select a document file to calculate its cryptographic fingerprint.");
      return;
    }
    if (!title.trim()) {
      setError("Please enter a document title.");
      return;
    }
    if (!expiryDate) {
      setError("Please select an expiration date.");
      return;
    }

    const expiryTimestamp = Math.floor(new Date(expiryDate).getTime() / 1000);
    if (expiryTimestamp <= Math.floor(Date.now() / 1000)) {
      setError("Expiry date must be in the future.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await registerNewDocument({
        file,
        docHash,
        referenceId,
        title,
        category,
        expiryTimestamp,
        ownerAddress: walletAddress || "0x71C83D48297bB1C57aCD294C535e6720D9113B92"
      });

      setRegisteredDoc(res.document);
      
      // Trigger confetti celebration!
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });

    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to register document on-chain.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-indigo-400" />
          <span>Register Document on Blockchain</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Anchor document fingerprint & expiry timestamp on Bohr Testnet (Chain ID 968). Files remain 100% private and never leave your device.
        </p>
      </div>

      {/* Success Modal / Result View */}
      {registeredDoc ? (
        <div className="rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-500/40 p-6 sm:p-8 space-y-6 shadow-2xl text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
            <Check className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white">Document Successfully Registered!</h2>
            <p className="text-xs text-slate-300">
              The cryptographic fingerprint and expiry conditions are now immutable on Bohr Testnet.
            </p>
          </div>

          <div className="max-w-lg mx-auto bg-slate-950/80 rounded-xl p-4 border border-slate-800 text-left text-xs space-y-2">
            <div className="flex justify-between border-b border-slate-800/80 pb-2">
              <span className="text-slate-400">Reference ID:</span>
              <span className="font-mono font-bold text-indigo-400">{registeredDoc.referenceId}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800/80 pb-2">
              <span className="text-slate-400">Title:</span>
              <span className="font-medium text-white">{registeredDoc.title}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800/80 pb-2">
              <span className="text-slate-400">Category:</span>
              <span className="text-slate-200">{registeredDoc.category}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800/80 pb-2">
              <span className="text-slate-400">Fingerprint (SHA-256):</span>
              <span className="font-mono text-cyan-400 truncate max-w-[200px]">{truncateHash(registeredDoc.docHash, 8)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Expiry Date:</span>
              <span className="font-semibold text-emerald-400">
                {new Date(registeredDoc.expiryTimestamp * 1000).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                if (onSelectDocumentForQr) onSelectDocumentForQr(registeredDoc.referenceId);
                setActiveTab('qr');
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all"
            >
              <QrCode className="w-4 h-4" />
              <span>Generate QR Verification Seal</span>
            </button>
            <button
              onClick={() => {
                if (onSelectDocumentForVerify) onSelectDocumentForVerify(registeredDoc.referenceId);
                setActiveTab('verify');
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
            >
              <span>Verify Document Status</span>
              <ArrowRight className="w-4 h-4 text-cyan-400" />
            </button>
            <button
              onClick={() => {
                setRegisteredDoc(null);
                setFile(null);
                setDocHash('');
                setTitle('');
                setReferenceId(generateReferenceId());
              }}
              className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white text-xs font-medium"
            >
              Register Another Document
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* File Upload & Fingerprint Dropzone */}
          <div 
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all ${
              file 
                ? 'border-indigo-500/60 bg-indigo-950/20' 
                : 'border-slate-700 hover:border-slate-500 bg-slate-900/60'
            }`}
          >
            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={(e) => handleFileChange(e.target.files[0])}
            />

            {file ? (
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mx-auto">
                  <FileCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">{file.name}</h3>
                  <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB • Local cryptographic hash ready</p>
                </div>

                {isHashing ? (
                  <div className="text-xs text-cyan-400 flex items-center justify-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Computing SHA-256 fingerprint in browser...</span>
                  </div>
                ) : (
                  <div className="max-w-xl mx-auto flex items-center justify-between gap-2 p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs">
                    <div className="flex items-center gap-2 text-slate-300 truncate">
                      <Hash className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span className="truncate">{docHash}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyHash}
                      title="Copy SHA-256 hash"
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] shrink-0 flex items-center gap-1"
                    >
                      {copiedHash ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedHash ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                )}

                <label
                  htmlFor="file-upload"
                  className="inline-block text-xs text-indigo-400 hover:text-indigo-300 underline cursor-pointer pt-1"
                >
                  Choose a different file
                </label>
              </div>
            ) : (
              <label htmlFor="file-upload" className="cursor-pointer space-y-3 block">
                <div className="w-12 h-12 rounded-xl bg-slate-800 text-indigo-400 flex items-center justify-center mx-auto">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">
                    Drag and drop your document here, or <span className="text-indigo-400 underline">browse</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Supports PDF, PNG, JPG, DOCX. Calculated via browser Web Crypto API; file is never sent to any server.
                  </p>
                </div>
              </label>
            )}
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
            
            {/* Title */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-slate-300">
                Document Title / Name *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. State Business Operating Certificate"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-indigo-500 text-xs text-white placeholder-slate-500 outline-none"
                required
              />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-indigo-400" />
                <span>Document Category</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-indigo-500 text-xs text-white outline-none"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Reference ID */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Unique Reference Code</span>
                <button
                  type="button"
                  onClick={() => setReferenceId(generateReferenceId())}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Generate New</span>
                </button>
              </label>
              <input
                type="text"
                value={referenceId}
                onChange={(e) => setReferenceId(e.target.value.toUpperCase())}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 font-mono font-bold text-indigo-400 text-xs outline-none"
                required
              />
            </div>

            {/* Expiry Date */}
            <div className="space-y-1.5 md:col-span-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Document Expiry Date *</span>
                </label>
                {/* Presets */}
                <div className="flex items-center gap-1 text-[11px]">
                  <span className="text-slate-400 mr-1">Quick:</span>
                  <button
                    type="button"
                    onClick={() => handleQuickExpiry(6)}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                  >
                    +6 Mo
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickExpiry(12)}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                  >
                    +1 Yr
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickExpiry(24)}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                  >
                    +2 Yrs
                  </button>
                </div>
              </div>

              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-indigo-500 text-xs text-white outline-none"
                required
              />
            </div>
          </div>

          {/* Network & Gas Fee Info */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-xs">
            <div className="flex items-center gap-2 text-indigo-200">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>Target: <strong>Bohr Testnet (Chain ID 968)</strong></span>
            </div>
            <div className="text-slate-400">
              Est. Gas Fee: <span className="font-mono text-emerald-400">~0.0004 BOT</span>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !docHash}
            className={`w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
              isSubmitting || !docHash
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30 hover:scale-[1.01]'
            }`}
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Broadcasting to Bohr Testnet...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Register Document on Blockchain</span>
              </>
            )}
          </button>
        </form>
      )}

    </div>
  );
}

