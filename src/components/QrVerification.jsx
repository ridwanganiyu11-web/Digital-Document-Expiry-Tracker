import React, { useState, useEffect, useRef } from 'react';
import { 
  QrCode, 
  Printer, 
  Copy, 
  Check, 
  ExternalLink, 
  ShieldCheck, 
  Building2, 
  Calendar, 
  Search, 
  Share2,
  ScanLine,
  Camera,
  UploadCloud,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import jsQR from 'jsqr';
import StatusBadge from './StatusBadge';
import { fetchAllDocuments } from '../services/blockchain';
import { truncateHash, formatTimestamp } from '../utils/crypto';

export default function QrVerification({ 
  initialReferenceId, 
  setActiveTab, 
  onSelectDocumentForVerify 
}) {
  const [activeSubTab, setActiveSubTab] = useState('seal'); // 'seal' or 'scanner'
  const [documents, setDocuments] = useState([]);
  const [selectedReference, setSelectedReference] = useState(initialReferenceId || '');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Scanner state
  const [scannedResult, setScannedResult] = useState('');
  const [scanError, setScanError] = useState('');
  const [isScanningImage, setIsScanningImage] = useState(false);

  useEffect(() => {
    loadDocs();
  }, []);

  const loadDocs = async () => {
    const list = await fetchAllDocuments();
    setDocuments(list);
    
    if (initialReferenceId) {
      const match = list.find(d => d.referenceId.toUpperCase() === initialReferenceId.toUpperCase());
      if (match) {
        setSelectedDoc(match);
        setSelectedReference(match.referenceId);
        return;
      }
    }
    if (list.length > 0 && !selectedDoc) {
      setSelectedDoc(list[0]);
      setSelectedReference(list[0].referenceId);
    }
  };

  const handleSelectDoc = (refId) => {
    setSelectedReference(refId);
    const found = documents.find(d => d.referenceId === refId);
    setSelectedDoc(found || null);
  };

  const verificationUrl = typeof window !== 'undefined' && selectedDoc 
    ? `${window.location.origin}/?verify=${selectedDoc.referenceId}`
    : 'https://expirychain.io/verify';

  const handleCopy = () => {
    navigator.clipboard.writeText(verificationUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Decode QR Code from an uploaded image
  const handleQrImageUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    setIsScanningImage(true);
    setScanError('');
    setScannedResult('');

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, img.width, img.height);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        setIsScanningImage(false);
        if (code && code.data) {
          setScannedResult(code.data);
          // Extract ref code if URL format (?verify=EXP-...)
          let extractedRef = code.data;
          try {
            if (code.data.includes('verify=')) {
              extractedRef = code.data.split('verify=')[1].split('&')[0];
            } else if (code.data.includes('ref=')) {
              extractedRef = code.data.split('ref=')[1].split('&')[0];
            }
          } catch {}

          if (onSelectDocumentForVerify && extractedRef) {
            onSelectDocumentForVerify(extractedRef);
          }
        } else {
          setScanError("No valid QR code could be detected in this image. Ensure the image is clear and focused.");
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <QrCode className="w-6 h-6 text-indigo-400" />
            <span>QR Verification & Digital Seal</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Generate verifiable digital seals or scan existing QR codes to inspect authenticity & expiry on Bohr Testnet.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-slate-900 border border-slate-800 p-1 text-xs">
          <button
            onClick={() => setActiveSubTab('seal')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeSubTab === 'seal' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Digital Seal Badge
          </button>
          <button
            onClick={() => setActiveSubTab('scanner')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'scanner' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ScanLine className="w-3.5 h-3.5" />
            <span>Scan QR Code</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'seal' ? (
        <div className="space-y-6">
          
          {/* Quick selector dropdown */}
          <div className="flex items-center justify-between bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-300 font-medium">Select Registered Document:</span>
            <select
              value={selectedReference}
              onChange={(e) => handleSelectDoc(e.target.value)}
              className="w-full max-w-sm px-3.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white outline-none"
            >
              {documents.map(d => (
                <option key={d.referenceId} value={d.referenceId}>
                  {d.referenceId} — {d.title}
                </option>
              ))}
            </select>
          </div>

          {selectedDoc ? (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              
              {/* Printable Digital Certificate Card */}
              <div 
                id="printable-seal"
                className="md:col-span-8 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-indigo-500/30 p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden"
              >
                {/* Top Seal Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center text-white shadow-md">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs uppercase font-extrabold tracking-wider text-indigo-400">
                        ExpiryChain Verified Digital Seal
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Immutable Ledger • Bohr Testnet (Chain ID 968)
                      </div>
                    </div>
                  </div>
                  <StatusBadge status={selectedDoc.status} size="md" />
                </div>

                {/* Document Title & Reference */}
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Document Name & Classification
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    {selectedDoc.title}
                  </h2>
                  <div className="text-xs text-slate-300 flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{selectedDoc.category}</span>
                    {selectedDoc.issuer && (
                      <>
                        <span>•</span>
                        <span className="text-slate-400">Issuer: {selectedDoc.issuer}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Center Content: QR Code & Metadata */}
                <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl bg-slate-950/70 border border-slate-800/80">
                  
                  {/* High-res QR Code */}
                  <div className="p-3 bg-white rounded-xl shadow-lg shrink-0">
                    <QRCodeSVG
                      value={verificationUrl}
                      size={140}
                      level="H"
                      includeMargin={false}
                    />
                  </div>

                  {/* Data fields */}
                  <div className="flex-1 space-y-2.5 text-xs w-full">
                    <div className="flex justify-between items-center border-b border-slate-800/80 pb-1.5">
                      <span className="text-slate-400">Reference Code:</span>
                      <span className="font-mono font-bold text-indigo-400 text-sm">
                        {selectedDoc.referenceId}
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-800/80 pb-1.5">
                      <span className="text-slate-400">Expiration Date:</span>
                      <span className="font-semibold text-white">
                        {formatTimestamp(selectedDoc.expiryTimestamp)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-800/80 pb-1.5">
                      <span className="text-slate-400">Registration Date:</span>
                      <span className="text-slate-300">
                        {formatTimestamp(selectedDoc.registrationTimestamp)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Fingerprint (SHA-256):</span>
                      <span className="font-mono text-cyan-400 text-[11px]">
                        {truncateHash(selectedDoc.docHash, 6)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Verification instructions footer */}
                <div className="text-[11px] text-slate-400 text-center border-t border-slate-800/80 pt-3">
                  Scan this QR code with any smartphone camera to inspect authenticity & real-time expiry validity. Zero wallet required.
                </div>
              </div>

              {/* Side Controls & Share Box */}
              <div className="md:col-span-4 space-y-4">
                
                {/* Share & Actions Card */}
                <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-indigo-400" />
                    <span>Share & Export Seal</span>
                  </h3>

                  <div className="space-y-2">
                    <label className="text-[11px] font-medium text-slate-400">
                      Public Verification Deep-Link:
                    </label>
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-indigo-300 truncate">
                      <span className="truncate">{verificationUrl}</span>
                    </div>
                    <button
                      onClick={handleCopy}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all"
                    >
                      {copiedLink ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedLink ? "Link Copied to Clipboard!" : "Copy Verification Link"}</span>
                    </button>
                  </div>

                  <div className="pt-2 border-t border-slate-800 space-y-2">
                    <button
                      onClick={() => window.print()}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
                    >
                      <Printer className="w-4 h-4 text-cyan-400" />
                      <span>Print Digital Seal Badge</span>
                    </button>

                    <button
                      onClick={() => {
                        if (onSelectDocumentForVerify) onSelectDocumentForVerify(selectedDoc.referenceId);
                        setActiveTab('verify');
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-800 transition-all"
                    >
                      <ExternalLink className="w-4 h-4 text-slate-400" />
                      <span>Open Verification Page</span>
                    </button>
                  </div>
                </div>

                {/* Quick Tips */}
                <div className="rounded-xl bg-indigo-950/20 border border-indigo-500/20 p-4 text-xs text-indigo-200/80 space-y-1">
                  <span className="font-semibold text-indigo-300">Where to attach this QR code:</span>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-300">
                    <li>Print in the corner of operating certificates</li>
                    <li>Display on equipment inspection stickers</li>
                    <li>Add to business email signatures & invoices</li>
                    <li>Share with auditors for instant compliance check</li>
                  </ul>
                </div>

              </div>

            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              No documents registered yet. Register your first document to generate a QR seal.
            </div>
          )}

        </div>
      ) : (
        /* QR Code Scanner / Image Decoder Sub-tab */
        <div className="max-w-xl mx-auto rounded-2xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mx-auto">
              <ScanLine className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-white">Scan or Upload QR Code</h2>
            <p className="text-xs text-slate-400">
              Upload a snapshot or photo of any ExpiryChain QR code to extract its reference code and verify.
            </p>
          </div>

          <div className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-2xl p-8 text-center bg-slate-950/40 transition-colors">
            <input
              type="file"
              id="qr-file-input"
              accept="image/*"
              className="hidden"
              onChange={handleQrImageUpload}
            />
            <label htmlFor="qr-file-input" className="cursor-pointer space-y-3 block">
              <UploadCloud className="w-10 h-10 text-cyan-400 mx-auto" />
              <div className="font-semibold text-white text-xs sm:text-sm">
                {isScanningImage ? "Scanning image for QR barcode..." : "Click to select or drop QR code image"}
              </div>
              <p className="text-[11px] text-slate-400">
                Supports PNG, JPG, WebP, SVG screenshots and camera photos
              </p>
            </label>
          </div>

          {scanError && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{scanError}</span>
            </div>
          )}

          {scannedResult && (
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                <Check className="w-4 h-4" />
                <span>QR Code Decoded Successfully!</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 font-mono text-xs text-slate-200 break-all border border-slate-800">
                {scannedResult}
              </div>
              <button
                onClick={() => setActiveTab('verify')}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-all"
              >
                <span>Proceed to Verification</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
