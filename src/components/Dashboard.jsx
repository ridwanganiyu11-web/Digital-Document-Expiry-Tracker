import React, { useState, useEffect } from 'react';
import { 
  FileCheck2, 
  AlertTriangle, 
  AlertOctagon, 
  Clock, 
  ShieldAlert, 
  FilePlus, 
  Search, 
  ArrowRight, 
  ExternalLink, 
  QrCode, 
  Layers, 
  Sparkles,
  Building2,
  FileText,
  Copy,
  Check
} from 'lucide-react';
import StatusBadge from './StatusBadge';
import { fetchAllDocuments } from '../services/blockchain';
import { truncateHash, formatTimestamp, formatTimeRemaining } from '../utils/crypto';

export default function Dashboard({ setActiveTab, onSelectDocumentForVerify, onSelectDocumentForQr }) {
  const [documents, setDocuments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedHash, setCopiedHash] = useState(null);

  useEffect(() => {
    loadDocs();
  }, []);

  const loadDocs = async () => {
    const list = await fetchAllDocuments();
    setDocuments(list);
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(id);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  // Metrics
  const totalDocs = documents.length;
  const validDocs = documents.filter(d => d.status === 1).length;
  const expiringSoonDocs = documents.filter(d => d.status === 2).length;
  const criticalDocs = documents.filter(d => d.status === 3).length;
  const expiredDocs = documents.filter(d => d.status === 4).length;
  const revokedDocs = documents.filter(d => d.status === 5).length;

  // Filtered list
  const filteredDocs = documents.filter(doc => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      doc.title.toLowerCase().includes(q) ||
      doc.referenceId.toLowerCase().includes(q) ||
      doc.category.toLowerCase().includes(q) ||
      doc.docHash.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8 py-6">
      
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-950 border border-indigo-500/20 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Decentralized Compliance on Bohr Testnet</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Register. Track. Verify. <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-300 to-emerald-400">
                Never Miss an Expiry.
              </span>
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              ExpiryChain stores cryptographic fingerprints and expiration dates directly on Bohr Testnet (Chain ID 968).
              Off-chain document confidentiality with 100% public, wallet-free verification.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap gap-3 w-full md:w-auto">
            <button
              onClick={() => setActiveTab('register')}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
            >
              <FilePlus className="w-4 h-4" />
              <span>Register Document</span>
            </button>
            <button
              onClick={() => setActiveTab('verify')}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-800/90 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-sm font-semibold transition-all hover:scale-[1.02]"
            >
              <Search className="w-4 h-4 text-cyan-400" />
              <span>Free Public Verify</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Total Registered */}
        <div className="col-span-2 sm:col-span-1 lg:col-span-1 rounded-xl bg-slate-900/90 border border-slate-800 p-4 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Total Docs</span>
            <Layers className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white">{totalDocs}</div>
          <p className="text-[11px] text-slate-400 mt-1">Stored on-chain</p>
        </div>

        {/* Valid */}
        <div className="rounded-xl bg-slate-900/90 border border-emerald-900/30 p-4 hover:border-emerald-600/50 transition-all">
          <div className="flex items-center justify-between text-emerald-400 mb-2">
            <span className="text-xs font-medium">Active & Valid</span>
            <FileCheck2 className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-emerald-300">{validDocs}</div>
          <p className="text-[11px] text-emerald-500/80 mt-1">Compliance clear</p>
        </div>

        {/* Expiring Soon (<30d) */}
        <div 
          onClick={() => setActiveTab('monitor')}
          className="rounded-xl bg-slate-900/90 border border-amber-900/30 p-4 hover:border-amber-600/50 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-amber-400 mb-2">
            <span className="text-xs font-medium">Warning (≤30d)</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-amber-300">{expiringSoonDocs}</div>
          <p className="text-[11px] text-amber-500/80 mt-1">Review advised</p>
        </div>

        {/* Critical (<7d) */}
        <div 
          onClick={() => setActiveTab('monitor')}
          className="rounded-xl bg-slate-900/90 border border-orange-900/30 p-4 hover:border-orange-600/50 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-orange-400 mb-2">
            <span className="text-xs font-medium">Critical (≤7d)</span>
            <AlertOctagon className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-orange-300">{criticalDocs}</div>
          <p className="text-[11px] text-orange-500/80 mt-1">Immediate action</p>
        </div>

        {/* Expired */}
        <div 
          onClick={() => setActiveTab('monitor')}
          className="rounded-xl bg-slate-900/90 border border-rose-900/30 p-4 hover:border-rose-600/50 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-rose-400 mb-2">
            <span className="text-xs font-medium">Expired</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-rose-300">{expiredDocs}</div>
          <p className="text-[11px] text-rose-500/80 mt-1">Requires renewal</p>
        </div>

        {/* Revoked */}
        <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-4 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Revoked</span>
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-slate-300">{revokedDocs}</div>
          <p className="text-[11px] text-slate-400 mt-1">Invalidated</p>
        </div>
      </div>

      {/* Network Quick Details Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 font-bold">
            968
          </div>
          <div>
            <div className="text-slate-400">Chain Network</div>
            <div className="font-semibold text-white">Bohr Testnet (Chain ID 968)</div>
          </div>
        </div>
        <div>
          <div className="text-slate-400">RPC Endpoint</div>
          <div className="font-mono text-slate-200 truncate">https://rpc.bohr.life</div>
        </div>
        <div>
          <div className="text-slate-400">Native Token</div>
          <div className="font-semibold text-white">BOT (Supply: 150M)</div>
        </div>
        <div className="flex items-center justify-between md:justify-end">
          <a
            href="https://scan.bohr.life"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 font-medium transition-colors"
          >
            <span>Open Bohr Explorer</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Search & Filter Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-400" />
              <span>Registered Document Registry</span>
            </h2>
            <p className="text-xs text-slate-400">
              Browse recently anchored documents or search by title, reference code, or fingerprint hash.
            </p>
          </div>

          <div className="relative max-w-sm w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reference (e.g. EXP-000124) or hash..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs text-white placeholder-slate-500 outline-none transition-colors"
            />
          </div>
        </div>

        {/* Document Records Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/80 shadow-md">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">Document Details</th>
                <th className="py-3.5 px-4">Reference Code</th>
                <th className="py-3.5 px-4">SHA-256 Fingerprint</th>
                <th className="py-3.5 px-4">Registration</th>
                <th className="py-3.5 px-4">Expiry Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-400">
                    No documents found matching "{searchQuery}".
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => (
                  <tr key={doc.referenceId} className="hover:bg-slate-800/40 transition-colors">
                    {/* Title & Category */}
                    <td className="py-3 px-4">
                      <div className="font-medium text-white">{doc.title}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3 h-3 text-slate-500" />
                        <span>{doc.category}</span>
                      </div>
                    </td>

                    {/* Reference ID */}
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                        {doc.referenceId}
                      </span>
                    </td>

                    {/* Hash */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 font-mono text-slate-400">
                        <span>{truncateHash(doc.docHash, 5)}</span>
                        <button
                          onClick={() => handleCopy(doc.docHash, doc.referenceId)}
                          title="Copy full SHA-256 hash"
                          className="p-1 hover:text-white rounded"
                        >
                          {copiedHash === doc.referenceId ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Registration */}
                    <td className="py-3 px-4 text-slate-300">
                      {formatTimestamp(doc.registrationTimestamp)}
                    </td>

                    {/* Expiry */}
                    <td className="py-3 px-4">
                      <div className="text-white font-medium">
                        {formatTimestamp(doc.expiryTimestamp)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {formatTimeRemaining(doc.secondsRemaining)}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4">
                      <StatusBadge status={doc.status} size="sm" />
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            if (onSelectDocumentForVerify) onSelectDocumentForVerify(doc.referenceId);
                            setActiveTab('verify');
                          }}
                          title="Public Verification"
                          className="px-2.5 py-1 rounded bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 font-medium transition-all"
                        >
                          Verify
                        </button>
                        <button
                          onClick={() => {
                            if (onSelectDocumentForQr) onSelectDocumentForQr(doc.referenceId);
                            setActiveTab('qr');
                          }}
                          title="QR Code & Digital Seal"
                          className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

