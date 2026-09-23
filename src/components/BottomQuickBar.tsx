import React from 'react';
import { Home, Tv, Disc3, DollarSign, LogOut } from 'lucide-react';

interface BottomQuickBarProps {
  activeTab: 'client' | 'dj' | 'owner' | 'stage' | 'bridge';
  onSelectTab: (tab: 'client' | 'dj' | 'owner' | 'stage' | 'bridge') => void;
  isStealthAdminUnlocked: boolean;
  unlockedRole?: 'dj' | 'owner' | null;
  pendingCount: number;
  onExitDJMode: () => void;
}

export const BottomQuickBar: React.FC<BottomQuickBarProps> = ({
  activeTab,
  onSelectTab,
  isStealthAdminUnlocked,
  unlockedRole,
  pendingCount,
  onExitDJMode,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0a0a12]/95 backdrop-blur-2xl border-t border-white/10 px-3 py-1.5 shadow-[0_-8px_30px_rgba(0,0,0,0.7)]">
      <div className="max-w-md mx-auto flex items-center justify-around gap-1">
        
        {/* 1. Inicio (Cliente / Pedir Música) */}
        <button
          type="button"
          onClick={() => onSelectTab('client')}
          className={`flex flex-col items-center justify-center flex-1 py-1.5 px-2 rounded-2xl transition-all ${
            activeTab === 'client'
              ? 'text-pink-400 bg-white/5 font-extrabold shadow-inner'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Home className={`w-5 h-5 ${activeTab === 'client' ? 'stroke-[2.5px] scale-110' : 'stroke-[1.75px]'}`} />
          <span className="text-[10px] tracking-tight mt-0.5">Inicio</span>
        </button>

        {/* 2. Pantalla Club (Escenario / Live Screen) */}
        <button
          type="button"
          onClick={() => onSelectTab('stage')}
          className={`flex flex-col items-center justify-center flex-1 py-1.5 px-2 rounded-2xl transition-all ${
            activeTab === 'stage'
              ? 'text-pink-400 bg-white/5 font-extrabold shadow-inner'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Tv className={`w-5 h-5 ${activeTab === 'stage' ? 'stroke-[2.5px] scale-110' : 'stroke-[1.75px]'}`} />
          <span className="text-[10px] tracking-tight mt-0.5">Pantalla Club</span>
        </button>

        {/* 3. Cabina DJ (Booth) */}
        <button
          type="button"
          onClick={() => onSelectTab('dj')}
          className={`relative flex flex-col items-center justify-center flex-1 py-1.5 px-2 rounded-2xl transition-all ${
            activeTab === 'dj'
              ? 'text-purple-400 bg-purple-500/10 font-extrabold shadow-inner'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Disc3 className={`w-5 h-5 ${activeTab === 'dj' ? 'stroke-[2.5px] scale-110 text-purple-400 animate-spin-slow' : 'stroke-[1.75px]'}`} />
            {pendingCount > 0 && (
              <span className="absolute -top-1 -right-2 px-1.5 py-0.2 text-[9px] font-black rounded-full bg-pink-500 text-white animate-bounce shadow-md">
                {pendingCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Cabina DJ</span>
        </button>

        {/* 4. Panel Dueño (Only if unlocked as Owner) */}
        {isStealthAdminUnlocked && unlockedRole === 'owner' && (
          <button
            type="button"
            onClick={() => onSelectTab('owner')}
            className={`flex flex-col items-center justify-center flex-1 py-1.5 px-2 rounded-2xl transition-all ${
              activeTab === 'owner'
                ? 'text-amber-400 bg-amber-500/10 font-extrabold shadow-inner'
                : 'text-amber-400/70 hover:text-amber-300'
            }`}
          >
            <DollarSign className={`w-5 h-5 ${activeTab === 'owner' ? 'stroke-[2.5px] scale-110' : 'stroke-[1.75px]'}`} />
            <span className="text-[10px] tracking-tight mt-0.5">Dueño</span>
          </button>
        )}

        {/* 5. Salir del Modo DJ (Visible when in DJ/Owner mode or unlocked) */}
        {(activeTab === 'dj' || isStealthAdminUnlocked) && (
          <button
            type="button"
            onClick={onExitDJMode}
            title="Cerrar sesión de DJ y volver a vista normal de cliente"
            className="flex flex-col items-center justify-center flex-1 py-1.5 px-2 rounded-2xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all border border-rose-500/20 active:scale-95"
          >
            <LogOut className="w-5 h-5 stroke-[2px]" />
            <span className="text-[10px] font-bold tracking-tight mt-0.5">Salir DJ</span>
          </button>
        )}

      </div>
    </nav>
  );
};
