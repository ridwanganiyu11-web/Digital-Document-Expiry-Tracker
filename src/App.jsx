import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import RegisterDoc from './components/RegisterDoc';
import VerifyDoc from './components/VerifyDoc';
import MyDocuments from './components/MyDocuments';
import QrVerification from './components/QrVerification';
import ExpiryMonitor from './components/ExpiryMonitor';
import { BOTCHAIN_TESTNET, DEFAULT_CONTRACT_ADDRESS } from './config/contract';
import { ExternalLink, ShieldCheck, Heart } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [walletAddress, setWalletAddress] = useState(null);
  const [targetReferenceId, setTargetReferenceId] = useState('');

  // Handle URL deep-links (e.g. ?verify=EXP-000124 or ?tab=qr&ref=EXP-000124)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const verifyParam = params.get('verify') || params.get('ref');
      const tabParam = params.get('tab');

      if (verifyParam) {
        setTargetReferenceId(verifyParam);
        setActiveTab('verify');
      } else if (tabParam) {
        setActiveTab(tabParam);
      }
    }
  }, []);

  const handleSelectDocumentForVerify = (refId) => {
    setTargetReferenceId(refId);
    setActiveTab('verify');
  };

  const handleSelectDocumentForQr = (refId) => {
    setTargetReferenceId(refId);
    setActiveTab('qr');
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      
      {/* Sticky Navigation */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        walletAddress={walletAddress}
        setWalletAddress={setWalletAddress}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {activeTab === 'dashboard' && (
          <Dashboard 
            setActiveTab={setActiveTab} 
            onSelectDocumentForVerify={handleSelectDocumentForVerify}
            onSelectDocumentForQr={handleSelectDocumentForQr}
          />
        )}

        {activeTab === 'register' && (
          <RegisterDoc 
            walletAddress={walletAddress}
            setActiveTab={setActiveTab}
            onSelectDocumentForVerify={handleSelectDocumentForVerify}
            onSelectDocumentForQr={handleSelectDocumentForQr}
          />
        )}

        {activeTab === 'verify' && (
          <VerifyDoc 
            initialReferenceId={targetReferenceId}
            setActiveTab={setActiveTab}
            onSelectDocumentForQr={handleSelectDocumentForQr}
          />
        )}

        {activeTab === 'my-docs' && (
          <MyDocuments 
            walletAddress={walletAddress}
            setActiveTab={setActiveTab}
            onSelectDocumentForVerify={handleSelectDocumentForVerify}
            onSelectDocumentForQr={handleSelectDocumentForQr}
          />
        )}

        {activeTab === 'qr' && (
          <QrVerification 
            initialReferenceId={targetReferenceId}
            setActiveTab={setActiveTab}
            onSelectDocumentForVerify={handleSelectDocumentForVerify}
          />
        )}

        {activeTab === 'monitor' && (
          <ExpiryMonitor 
            setActiveTab={setActiveTab}
            onSelectDocumentForVerify={handleSelectDocumentForVerify}
            onSelectDocumentForQr={handleSelectDocumentForQr}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-[#070a12] py-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-white text-sm">ExpiryChain</span>
                <p className="text-[11px] text-slate-400">
                  Register. Track. Verify. Never miss an expiry.
                </p>
              </div>
            </div>

            {/* Quick Network Info Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300 font-mono text-[11px]">
                Network: Bohr Testnet (Chain ID 968)
              </span>
              <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-emerald-400 font-mono text-[11px]">
                Gas Token: BOT
              </span>
              <a
                href="https://scan.bohr.life"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors"
              >
                <span>BohrScan Explorer</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
            <div>
              &copy; 2026 ExpiryChain. All original files remain local and confidential on your device.
            </div>
            <div className="flex items-center gap-4">
              <span>Client-side SHA-256</span>
              <span>•</span>
              <span>Zero-knowledge hashing</span>
              <span>•</span>
              <span>Instant Public QR</span>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
