import React from 'react';
import { Disc3, Music, DollarSign, Smartphone, Tv, Cpu, QrCode, LogOut } from 'lucide-react';
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
  onOpenQRModal?: () => void;
  onExitDJMode?: () => void;
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
  onOpenQRModal,
  onExitDJMode,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#08080c]/90 backdrop-blur-xl border-b border-white/10 px-3 py-2 sm:px-4 sm:py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Stealth Logo with Secret Tap Detector (Low-Scale Compact) */}
        <div
          onClick={onSecretLogoTap}
          className="flex items-center gap-2 sm:gap-2.5 cursor-pointer select-none group flex-shrink-0"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-pink-500 to-amber-400 p-0.5 shadow-md shadow-purple-600/30 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-black rounded-[10px] flex items-center justify-center">
              <Disc3 className="w-5 h-5 text-pink-400 animate-spin-slow" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm sm:text-base font-black tracking-tight text-white font-['Outfit']">
                BEATPULSE
              </h1>
              <span className="px-1.5 py-0.5 rounded text-[8px] font-black bg-pink-500/20 text-pink-400 border border-pink-500/30 uppercase tracking-wider">
                {ownerConfig.clubName ? ownerConfig.clubName.substring(0, 10).toUpperCase() : 'CLUB'}
              </span>
            </div>
            <p className="text-[9px] font-semibold text-slate-400 hidden sm:block">Pide tu música favorita en vivo</p>
          </div>
        </div>

        {/* Desktop Mini-Navigation (Hidden on Mobile to save space since BottomQuickBar handles it) */}
        <div className="hidden md:flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-white/10 text-xs">
          
          {/* Client Tab */}
          <button
            onClick={() => setActiveTab('client')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'client'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Inicio</span>
          </button>

          {/* Club Stage Screen Tab */}
          <button
            onClick={() => setActiveTab('stage')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'stage'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>Pantalla Club</span>
          </button>

          {/* DJ Booth Portal (Only when stealth unlocked) */}
          {isStealthAdminUnlocked && (unlockedRole === 'dj' || unlockedRole === 'owner') && (
            <button
              onClick={() => setActiveTab('dj')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'dj'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Disc3 className="w-3.5 h-3.5" />
              <span>Cabina DJ</span>
              {pendingCount > 0 && (
                <span className="px-1.5 py-0.2 text-[9px] font-black rounded-full bg-pink-500 text-white animate-bounce">
                  {pendingCount}
                </span>
              )}
            </button>
          )}

          {/* Owner Portal */}
          {isStealthAdminUnlocked && unlockedRole === 'owner' && (
            <button
              onClick={() => setActiveTab('owner')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'owner'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md'
                  : 'text-amber-400/80 hover:text-amber-300'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Panel Dueño</span>
            </button>
          )}

          {/* VirtualDJ Bridge Tab */}
          {isStealthAdminUnlocked && unlockedRole === 'owner' && (
            <button
              onClick={() => setActiveTab('bridge')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'bridge'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>VirtualDJ</span>
            </button>
          )}

        </div>

        {/* Right Action Icons (Exit DJ Button & QR Modal Button) */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          
          {/* Botón Salir de Modo DJ en Header (si está activo el modo DJ) */}
          {(activeTab === 'dj' || isStealthAdminUnlocked) && onExitDJMode && (
            <button
              onClick={onExitDJMode}
              title="Salir del Modo DJ y volver a modo cliente"
              className="px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 hover:text-rose-200 border border-rose-500/40 active:scale-95"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden xs:inline sm:inline">Salir DJ</span>
            </button>
          )}

          {/* Downloadable QR Code & APK Button */}
          {onOpenQRModal && (
            <button
              onClick={onOpenQRModal}
              title="Ver y Descargar Código QR / App APK para Mesas"
              className="px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 bg-gradient-to-r from-purple-600/30 to-pink-600/30 hover:from-purple-600 hover:to-pink-600 text-pink-300 hover:text-white border border-pink-500/40 shadow-sm active:scale-95"
            >
              <QrCode className="w-3.5 h-3.5 text-pink-400" />
              <span className="hidden sm:inline">QR / App</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
};
