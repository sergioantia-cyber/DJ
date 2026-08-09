import React from 'react';
import { Smartphone, Disc3, Tv, Cable, Building, ShieldCheck, DollarSign } from 'lucide-react';
import { VirtualDJConfig, OwnerConfig } from '../types';

interface NavbarProps {
  activeTab: 'client' | 'dj' | 'owner' | 'stage' | 'bridge';
  setActiveTab: (tab: 'client' | 'dj' | 'owner' | 'stage' | 'bridge') => void;
  vdjConfig: VirtualDJConfig;
  ownerConfig: OwnerConfig;
  totalEarnedCOP: number;
  pendingCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  vdjConfig,
  ownerConfig,
  totalEarnedCOP,
  pendingCount,
}) => {
  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-purple-500/20 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-3">
        
        {/* Brand logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-pink-500 to-cyan-400 p-[2px] shadow-lg shadow-purple-500/30">
            <div className="w-full h-full bg-[#0d0d15] rounded-[10px] flex items-center justify-center">
              <Disc3 className="w-6 h-6 text-pink-400 animate-spin-slow" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-xl tracking-tight text-white">
                BeatPulse <span className="text-gradient-neon">DJ</span>
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
                COLOMBIA
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">{ownerConfig.clubName} • VirtualDJ Connected</p>
          </div>
        </div>

        {/* 3 Main User Role Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-[#12121e] p-1.5 rounded-2xl border border-white/5 shadow-inner overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab('client')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'client'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>1. Cliente (Móvil)</span>
          </button>

          <button
            onClick={() => setActiveTab('dj')}
            className={`relative flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'dj'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Disc3 className="w-4 h-4" />
            <span>2. Cabina DJ</span>
            {pendingCount > 0 && (
              <span className="flex items-center justify-center w-5 h-5 text-[10px] font-black rounded-full bg-pink-500 text-white animate-bounce shadow-md shadow-pink-500/50">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('owner')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'owner'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black shadow-lg shadow-amber-500/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Building className="w-4 h-4 text-amber-400" />
            <span>3. Dueño Discoteca</span>
          </button>

          <button
            onClick={() => setActiveTab('stage')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'stage'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Tv className="w-4 h-4" />
            <span>Pantalla Club</span>
          </button>

          <button
            onClick={() => setActiveTab('bridge')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'bridge'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Cable className="w-4 h-4" />
            <span>VirtualDJ Bridge</span>
          </button>
        </nav>

        {/* Total Earned Badge */}
        <div className="hidden xl:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border border-amber-500/30 text-amber-300 font-bold text-xs">
          <DollarSign className="w-4 h-4 text-amber-400" />
          <span>Bruto Noche: ${totalEarnedCOP.toLocaleString('es-CO')} COP</span>
        </div>

      </div>
    </header>
  );
};
