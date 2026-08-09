import React from 'react';
import { Disc3, Music, DollarSign, Smartphone, Tv, Cpu, ShieldAlert, Sparkles, Volume2 } from 'lucide-react';
import { VirtualDJConfig, OwnerConfig } from '../types';

interface NavbarProps {
  activeTab: 'client' | 'dj' | 'owner' | 'stage' | 'bridge';
  setActiveTab: (tab: 'client' | 'dj' | 'owner' | 'stage' | 'bridge') => void;
  vdjConfig: VirtualDJConfig;
  ownerConfig: OwnerConfig;
  totalEarnedCOP: number;
  pendingCount: number;
  isStealthAdminUnlocked: boolean;
  unlockedRole?: 'dj' | 'owner' | null;
  onSecretLogoTap: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  vdjConfig,
  ownerConfig,
  totalEarnedCOP,
  pendingCount,
  isStealthAdminUnlocked,
  unlockedRole = 'dj',
  onSecretLogoTap,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#08080c]/90 backdrop-blur-xl border-b border-white/10 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Stealth Logo with Secret Tap Detector */}
        <div
          onClick={onSecretLogoTap}
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-500 to-amber-400 p-0.5 shadow-lg shadow-purple-600/30 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-black rounded-[14px] flex items-center justify-center">
              <Disc3 className="w-6 h-6 text-pink-400 animate-spin-slow" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-lg font-black tracking-tight text-white font-['Outfit']">
                BEATPULSE
              </h1>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-pink-500/20 text-pink-400 border border-pink-500/30 uppercase tracking-widest">
                CLUB IBIZA
              </span>
            </div>
            <p className="text-[10px] font-semibold text-slate-400">Pide tu música favorita en vivo</p>
          </div>
        </div>

        {/* Navigation Portal Tabs */}
        <div className="flex items-center gap-1 bg-slate-900/80 p-1.5 rounded-2xl border border-white/10 overflow-x-auto">
          
          {/* Client Tab */}
          <button
            onClick={() => setActiveTab('client')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'client'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span className="hidden sm:inline">📱 Cliente</span>
          </button>

          {/* Club Stage Screen Tab */}
          <button
            onClick={() => setActiveTab('stage')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'stage'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Tv className="w-4 h-4" />
            <span>🪩 Pantalla Club</span>
          </button>

          {/* DJ Booth Portal (Only when stealth unlocked or PIN entered) */}
          {isStealthAdminUnlocked && (unlockedRole === 'dj' || unlockedRole === 'owner') && (
            <button
              onClick={() => setActiveTab('dj')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'dj'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-600/30 ring-2 ring-purple-400/50'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Disc3 className="w-4 h-4" />
              <span>🎧 Cabina DJ</span>
              {pendingCount > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-black rounded-full bg-pink-500 text-white animate-bounce">
                  {pendingCount}
                </span>
              )}
            </button>
          )}

          {/* Owner Portal (Strictly visible ONLY to Owner PIN 9999) */}
          {isStealthAdminUnlocked && unlockedRole === 'owner' && (
            <button
              onClick={() => setActiveTab('owner')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'owner'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/30'
                  : 'text-amber-400/80 hover:text-amber-300'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>👑 Panel Dueño</span>
            </button>
          )}

          {/* VirtualDJ Bridge Tab (Visible ONLY to Owner PIN 9999) */}
          {isStealthAdminUnlocked && unlockedRole === 'owner' && (
            <button
              onClick={() => setActiveTab('bridge')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'bridge'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span className="hidden md:inline">🔌 VirtualDJ</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
};
