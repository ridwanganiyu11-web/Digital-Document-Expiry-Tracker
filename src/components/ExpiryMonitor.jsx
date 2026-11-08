import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  AlertOctagon,
  Clock,
  CheckCircle2,
  Building2,
  ArrowRight,
  Edit3,
  QrCode,
  ShieldCheck,
  ExternalLink,
  BellRing
} from 'lucide-react';
import StatusBadge from './StatusBadge';
import { fetchAllDocuments } from '../services/blockchain';
import { formatTimestamp, formatTimeRemaining } from '../utils/crypto';

export default function ExpiryMonitor({
  setActiveTab,
  onSelectDocumentForVerify,
  onSelectDocumentForQr
}) {
  const [documents, setDocuments] = useState([]);
  const [filterBucket, setFilterBucket] = useState('all'); // 'all', 'critical', 'warning', 'expired', 'healthy'

  useEffect(() => {
    loadDocs();
  }, []);

  const loadDocs = async () => {
    const list = await fetchAllDocuments();
    setDocuments(list);
  };

  // Group documents into 4 buckets
  const criticalDocs = documents.filter(d => d.status === 3); // <= 7 days
  const warningDocs = documents.filter(d => d.status === 2);  // <= 30 days
  const expiredDocs = documents.filter(d => d.status === 4);  // expired
  const healthyDocs = documents.filter(d => d.status === 1);  // > 30 days
  const revokedDocs = documents.filter(d => d.status === 5);  // revoked

  const renderDocCard = (doc, borderTheme) => (
    <div
      key={doc.referenceId}
      className={`rounded-xl bg-slate-900 border ${borderTheme} p-4 space-y-3 hover:translate-y-[-2px] transition-all shadow-md`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
            {doc.referenceId}
          </span>
          <h3 className="font-bold text-white text-sm mt-1">{doc.title}</h3>
          <p className="text-[11px] text-slate-400 flex items-center gap-1">
            <Building2 className="w-3 h-3 text-slate-500" />
            <span>{doc.category}</span>
          </p>
        </div>
        <StatusBadge status={doc.status} size="sm" />
      </div>

      <div className="bg-slate-950/70 rounded-lg p-2.5 text-xs space-y-1 border border-slate-800/80">
        <div className="flex justify-between">
          <span className="text-slate-400">Expires:</span>
          <span className="font-semibold text-white">{formatTimestamp(doc.expiryTimestamp)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Time Status:</span>
          <span className="font-bold text-amber-400">{formatTimeRemaining(doc.secondsRemaining)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-1 text-xs">
        <button
          onClick={() => {
            if (onSelectDocumentForQr) onSelectDocumentForQr(doc.referenceId);
            setActiveTab('qr');
          }}
          className="text-slate-400 hover:text-white flex items-center gap-1"
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>QR Seal</span>
        </button>

        <button
          onClick={() => {
            if (onSelectDocumentForVerify) onSelectDocumentForVerify(doc.referenceId);
            setActiveTab('verify');
          }}
          className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
        >
          <span>Verify</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto py-6 space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BellRing className="w-6 h-6 text-amber-400" />
            <span>Expiry Radar & Monitoring Cockpit</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time compliance surveillance grouping documents into 7-day critical alerts, 30-day warnings, and overdue items.
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={() => setActiveTab('my-docs')}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
        >
          Manage All In My Documents
        </button>
      </div>

      {/* Summary Alert Pill */}
      {(criticalDocs.length > 0 || expiredDocs.length > 0) && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-orange-950/40 to-rose-950/40 border border-orange-500/30 flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <AlertOctagon className="w-5 h-5 text-orange-400 shrink-0" />
            <div className="space-y-0.5">
              <span className="font-bold text-white">Action Required: Compliance Expirations Detected</span>
              <p className="text-slate-300">
                You have <strong className="text-orange-400">{criticalDocs.length} document(s)</strong> expiring within 7 days and <strong className="text-rose-400">{expiredDocs.length} expired document(s)</strong>.
              </p>
            </div>
          </div>
          <button
            onClick={() => setFilterBucket('critical')}
            className="px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-400 text-black font-bold whitespace-nowrap text-xs transition-colors shrink-0"
          >
            Review Critical
          </button>
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex rounded-xl bg-slate-900 border border-slate-800 p-1 overflow-x-auto text-xs">
        {[
          { id: 'all', label: `All Tracked (${documents.length})` },
          { id: 'critical', label: `Critical ≤7d (${criticalDocs.length})`, alert: criticalDocs.length > 0 },
          { id: 'warning', label: `Warning ≤30d (${warningDocs.length})` },
          { id: 'expired', label: `Expired (${expiredDocs.length})`, alert: expiredDocs.length > 0 },
          { id: 'healthy', label: `Healthy >30d (${healthyDocs.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterBucket(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${filterBucket === tab.id
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
          >
            <span>{tab.label}</span>
            {tab.alert && <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />}
          </button>
        ))}
      </div>

      {/* 4 Radar Columns or Filtered Grid */}
      {filterBucket === 'all' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

          {/* Column 1: Critical (<= 7 Days) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-orange-500/30">
              <div className="flex items-center gap-2 text-xs font-bold text-orange-400">
                <AlertOctagon className="w-4 h-4" />
                <span>Critical (≤ 7 Days)</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 font-bold">
                {criticalDocs.length}
              </span>
            </div>
            <div className="space-y-3">
              {criticalDocs.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-center text-xs text-slate-500">
                  No documents expiring in ≤ 7 days.
                </div>
              ) : (
                criticalDocs.map(doc => renderDocCard(doc, 'border-orange-500/40 hover:border-orange-500'))
              )}
            </div>
          </div>

          {/* Column 2: Warning (<= 30 Days) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-amber-500/30">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                <AlertTriangle className="w-4 h-4" />
                <span>Warning (≤ 30 Days)</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                {warningDocs.length}
              </span>
            </div>
            <div className="space-y-3">
              {warningDocs.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-center text-xs text-slate-500">
                  No documents expiring in ≤ 30 days.
                </div>
              ) : (
                warningDocs.map(doc => renderDocCard(doc, 'border-amber-500/40 hover:border-amber-500'))
              )}
            </div>
          </div>

          {/* Column 3: Already Expired */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-rose-500/30">
              <div className="flex items-center gap-2 text-xs font-bold text-rose-400">
                <Clock className="w-4 h-4" />
                <span>Expired Documents</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold">
                {expiredDocs.length}
              </span>
            </div>
            <div className="space-y-3">
              {expiredDocs.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-center text-xs text-slate-500">
                  No expired documents.
                </div>
              ) : (
                expiredDocs.map(doc => renderDocCard(doc, 'border-rose-500/40 hover:border-rose-500'))
              )}
            </div>
          </div>

          {/* Column 4: Healthy (> 30 Days) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-emerald-500/30">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Healthy (&gt; 30 Days)</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                {healthyDocs.length}
              </span>
            </div>
            <div className="space-y-3">
              {healthyDocs.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-center text-xs text-slate-500">
                  No healthy documents registered.
                </div>
              ) : (
                healthyDocs.map(doc => renderDocCard(doc, 'border-emerald-500/30 hover:border-emerald-500'))
              )}
            </div>
          </div>

        </div>
      ) : (
        /* Filtered Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(
            filterBucket === 'critical' ? criticalDocs :
              filterBucket === 'warning' ? warningDocs :
                filterBucket === 'expired' ? expiredDocs :
                  healthyDocs
          ).map(doc => renderDocCard(doc, 'border-slate-800 hover:border-indigo-500'))}
        </div>
      )}

    </div>
  );
}
