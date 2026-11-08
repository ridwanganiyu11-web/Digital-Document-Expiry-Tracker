import React, { useState, useEffect } from 'react';
import { 
  FolderLock, 
  Search, 
  Filter, 
  Calendar, 
  Edit3, 
  Ban, 
  QrCode, 
  Copy, 
  Check, 
  ExternalLink, 
  AlertCircle,
  Clock,
  Building2,
  X
} from 'lucide-react';
import StatusBadge from './StatusBadge';
import { fetchAllDocuments, updateDocumentExpiry, revokeDocument } from '../services/blockchain';
import { truncateHash, formatTimestamp, formatTimeRemaining } from '../utils/crypto';

export default function MyDocuments({ 
  walletAddress, 
  setActiveTab, 
  onSelectDocumentForVerify, 
  onSelectDocumentForQr 
}) {
  const [documents, setDocuments] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  // Modals
  const [selectedDocForUpdate, setSelectedDocForUpdate] = useState(null);
  const [newExpiryDate, setNewExpiryDate] = useState('');
  const [selectedDocForRevoke, setSelectedDocForRevoke] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    loadDocs();
  }, [walletAddress]);

  const loadDocs = async () => {
    const list = await fetchAllDocuments();
    // In production, filter by walletAddress. If no wallet or demo, show all registered so user can manage
    if (walletAddress) {
      const lower = walletAddress.toLowerCase();
      const userDocs = list.filter(d => d.owner.toLowerCase() === lower);
      // If user has zero docs with this specific wallet, show full list so user can test managing
      setDocuments(userDocs.length > 0 ? userDocs : list);
    } else {
      setDocuments(list);
    }
  };

  const handleCopyLink = (referenceId) => {
    const link = `${window.location.origin}/?verify=${referenceId}`;
    navigator.clipboard.writeText(link);
    setCopiedId(referenceId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleUpdateExpiry = async (e) => {
    e.preventDefault();
    if (!newExpiryDate || !selectedDocForUpdate) return;
    const newTimestamp = Math.floor(new Date(newExpiryDate).getTime() / 1000);
    if (newTimestamp <= Math.floor(Date.now() / 1000)) {
      setActionError("New expiry date must be in the future.");
      return;
    }

    try {
      setIsProcessing(true);
      setActionError('');
      await updateDocumentExpiry(selectedDocForUpdate.docHash, newTimestamp, walletAddress);
      setSelectedDocForUpdate(null);
      setNewExpiryDate('');
      await loadDocs();
    } catch (err) {
      setActionError(err.message || "Failed to update expiry");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmRevoke = async () => {
    if (!selectedDocForRevoke) return;
    try {
      setIsProcessing(true);
      setActionError('');
      await revokeDocument(selectedDocForRevoke.docHash, walletAddress);
      setSelectedDocForRevoke(null);
      await loadDocs();
    } catch (err) {
      setActionError(err.message || "Failed to revoke document");
    } finally {
      setIsProcessing(false);
    }
  };

  // Filter logic
  const filteredDocs = documents.filter(doc => {
    const matchesSearch = 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.referenceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.category.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (filterStatus === 'all') return true;
    if (filterStatus === 'valid') return doc.status === 1;
    if (filterStatus === 'warning') return doc.status === 2 || doc.status === 3;
    if (filterStatus === 'expired') return doc.status === 4;
    if (filterStatus === 'revoked') return doc.status === 5;
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto py-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FolderLock className="w-6 h-6 text-indigo-400" />
            <span>My Registered Documents</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage your registered compliance documents, update expiry dates, or revoke certificates on Bohr Testnet.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('register')}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all"
        >
          + Register New Document
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
        
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs">
          {[
            { id: 'all', label: 'All Documents' },
            { id: 'valid', label: 'Valid' },
            { id: 'warning', label: 'Expiring Soon' },
            { id: 'expired', label: 'Expired' },
            { id: 'revoked', label: 'Revoked' },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setFilterStatus(pill.id)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                filterStatus === pill.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, ref..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 outline-none"
          />
        </div>
      </div>

      {/* Document Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/80">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
              <th className="py-3.5 px-4">Document Details</th>
              <th className="py-3.5 px-4">Reference</th>
              <th className="py-3.5 px-4">Expiry Date</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {filteredDocs.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-12 text-slate-400">
                  No documents found for current filter.
                </td>
              </tr>
            ) : (
              filteredDocs.map((doc) => (
                <tr key={doc.referenceId} className="hover:bg-slate-800/40 transition-colors">
                  
                  {/* Title & Category */}
                  <td className="py-3 px-4">
                    <div className="font-semibold text-white">{doc.title}</div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Building2 className="w-3 h-3 text-slate-500" />
                      <span>{doc.category}</span>
                    </div>
                  </td>

                  {/* Reference */}
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                      {doc.referenceId}
                    </span>
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

                  {/* Status */}
                  <td className="py-3 px-4">
                    <StatusBadge status={doc.status} size="sm" />
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      
                      {/* Copy Public Link */}
                      <button
                        onClick={() => handleCopyLink(doc.referenceId)}
                        title="Copy public verification link"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      >
                        {copiedId === doc.referenceId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>

                      {/* QR View */}
                      <button
                        onClick={() => {
                          if (onSelectDocumentForQr) onSelectDocumentForQr(doc.referenceId);
                          setActiveTab('qr');
                        }}
                        title="View QR Code Seal"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                      </button>

                      {/* Update Expiry */}
                      {!doc.isRevoked && (
                        <button
                          onClick={() => {
                            setSelectedDocForUpdate(doc);
                            setNewExpiryDate(new Date(doc.expiryTimestamp * 1000).toISOString().split('T')[0]);
                          }}
                          title="Update Expiry Date"
                          className="p-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 transition-all"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Revoke */}
                      {!doc.isRevoked && (
                        <button
                          onClick={() => setSelectedDocForRevoke(doc)}
                          title="Revoke Document"
                          className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 transition-all"
                        >
                          <Ban className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Update Expiry Modal */}
      {selectedDocForUpdate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-indigo-400" />
                <span>Update Expiry Date</span>
              </h3>
              <button 
                onClick={() => setSelectedDocForUpdate(null)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-300 space-y-1">
              <div><strong>Document:</strong> {selectedDocForUpdate.title}</div>
              <div><strong>Reference:</strong> <span className="font-mono text-indigo-400">{selectedDocForUpdate.referenceId}</span></div>
            </div>

            <form onSubmit={handleUpdateExpiry} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Select New Expiry Date
                </label>
                <input
                  type="date"
                  value={newExpiryDate}
                  onChange={(e) => setNewExpiryDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white outline-none"
                  required
                />
              </div>

              {actionError && (
                <div className="text-xs text-rose-400 bg-rose-950/40 border border-rose-500/30 p-2.5 rounded-lg">
                  {actionError}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedDocForUpdate(null)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all disabled:opacity-50"
                >
                  {isProcessing ? "Updating on Bohr..." : "Confirm Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Revoke Confirmation Modal */}
      {selectedDocForRevoke && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-rose-900/40 p-6 space-y-4 shadow-2xl">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <Ban className="w-5 h-5" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Revoke Document?</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Are you sure you want to revoke <strong>{selectedDocForRevoke.title}</strong> ({selectedDocForRevoke.referenceId})?
                This action is permanently recorded on Bohr Testnet. The document will immediately show as <strong>Revoked</strong> on public verification.
              </p>
            </div>

            {actionError && (
              <div className="text-xs text-rose-400 bg-rose-950/40 border border-rose-500/30 p-2.5 rounded-lg">
                {actionError}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedDocForRevoke(null)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRevoke}
                disabled={isProcessing}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md transition-all disabled:opacity-50"
              >
                {isProcessing ? "Revoking on Chain..." : "Yes, Revoke Document"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

