import React, { useState } from 'react';
import { 
  ShieldCheck, 
  LayoutDashboard, 
  FilePlus, 
  SearchCheck, 
  FolderLock, 
  QrCode, 
  AlertCircle, 
  Wallet, 
  ExternalLink,
  ChevronDown,
  Menu,
  X
} from 'lucide-react';
import { BOTCHAIN_TESTNET } from '../config/contract';

export default function Navbar({ activeTab, setActiveTab, walletAddress, setWalletAddress }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Connect MetaMask or browser wallet to Bohr Testnet
  const handleConnectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      alert("MetaMask or Web3 wallet is not detected. You can still publicly verify documents without a wallet!");
      // Fallback demo address for testing if no extension installed
      const demoAddress = "0x71C83D48297bB1C57aCD294C535e6720D9113B92";
      setWalletAddress(demoAddress);
      return;
    }

    try {
      setIsConnecting(true);
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts && accounts.length > 0) {
        setWalletAddress(accounts[0]);
        // Request network switch to Bohr Testnet (Chain ID 968 / hex 0x3c8)
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x3c8' }], // 968 in hex
          });
        } catch (switchError) {
          // If chain not added to wallet, add it
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0x3c8',
                chainName: 'Bohr Testnet',
                nativeCurrency: {
                  name: 'Bohr Token',
                  symbol: 'BOT',
                  decimals: 18,
                },
                rpcUrls: ['https://rpc.bohr.life'],
                blockExplorerUrls: ['https://scan.bohr.life'],
              }],
            });
          }
        }
      }
    } catch (err) {
      console.error("Wallet connection error:", err);
    } finally {
      setIsConnecting(false);
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'register', label: 'Register Document', icon: FilePlus },
    { id: 'verify', label: 'Verify Document', icon: SearchCheck, highlight: 'Public' },
    { id: 'my-docs', label: 'My Documents', icon: FolderLock },
    { id: 'qr', label: 'QR Verification', icon: QrCode },
    { id: 'monitor', label: 'Expiry Monitor', icon: AlertCircle, badge: 'Live' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#090d16]/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div 
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white group-hover:text-indigo-400 transition-colors">
                  ExpiryChain
                </span>
                <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Chain 968
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Never miss an expiry.
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    isActive 
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' 
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.highlight && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {item.highlight}
                    </span>
                  )}
                  {item.badge && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Header: Testnet status & Wallet */}
          <div className="flex items-center gap-3">
            {/* Bohr Testnet indicator */}
            <a 
              href="https://scan.bohr.life" 
              target="_blank" 
              rel="noreferrer"
              title="Bohr Testnet Explorer (Chain ID 968)"
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-900 border border-slate-700/80 text-slate-300 hover:border-indigo-500/50 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>Bohr Testnet</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>

            {/* Wallet Button */}
            {walletAddress ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('my-docs')}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/80 border border-indigo-500/40 text-slate-200 text-xs font-mono font-medium shadow-inner transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>{`${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`}</span>
                </button>
                <button
                  onClick={() => setWalletAddress(null)}
                  title="Disconnect Wallet"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 text-xs"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnectWallet}
                disabled={isConnecting}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
              >
                <Wallet className="w-4 h-4" />
                <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
              </button>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6 text-white" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-3 px-2 border-t border-slate-800 bg-[#090d16] space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${
                    isActive 
                      ? 'bg-indigo-600 text-white' 
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.highlight && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                      {item.highlight}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
}

