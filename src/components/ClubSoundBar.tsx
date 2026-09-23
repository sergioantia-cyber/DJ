import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Sparkles, Disc3 } from 'lucide-react';
import { clubAudioPlayer, ClubAudioState } from '../services/clubAudioPlayer';

export const ClubSoundBar: React.FC = () => {
  const [audioState, setAudioState] = useState<ClubAudioState>(() => clubAudioPlayer.getState());

  useEffect(() => {
    const unsubscribe = clubAudioPlayer.subscribe((newState) => {
      setAudioState({ ...newState });
    });
    return () => unsubscribe();
  }, []);

  // Only show if there is an active song or audio source loaded
  if (!audioState.currentSong) return null;

  return (
    <div className="sticky top-[53px] z-30 px-3 py-2 bg-gradient-to-r from-purple-950/95 via-pink-950/95 to-slate-950/95 backdrop-blur-xl border-b border-pink-500/30 shadow-lg animate-fadeIn">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        
        {/* Song info & equalizer */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-pink-500/20 border border-pink-500/40 flex items-center justify-center flex-shrink-0">
            <Disc3 className={`w-5 h-5 text-pink-400 ${!audioState.isMuted && audioState.isPlaying ? 'animate-spin' : ''}`} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping flex-shrink-0"></span>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-pink-300 truncate">
                {audioState.isMuted ? 'Música en Reproducción (Silenciada)' : 'Música en Vivo en Altavoces'}
              </span>
            </div>
            <p className="text-xs font-bold text-white truncate">
              {audioState.currentSong.title} <span className="text-slate-400 font-normal">• {audioState.currentSong.artist}</span>
            </p>
          </div>
        </div>

        {/* Action Button: Activar Sonido o Silenciar */}
        <div className="flex-shrink-0">
          {audioState.isMuted ? (
            <button
              type="button"
              onClick={() => clubAudioPlayer.unmuteAndPlay()}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 hover:brightness-110 text-white font-black text-xs shadow-lg shadow-pink-500/40 flex items-center gap-1.5 active:scale-95 animate-pulse transition-all"
            >
              <Volume2 className="w-4 h-4 animate-bounce" />
              <span>🔊 Activar Sonido para Escuchar</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => clubAudioPlayer.mute()}
              className="px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/10 font-bold text-xs flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <VolumeX className="w-4 h-4 text-rose-400" />
              <span>🔇 Silenciar Música</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
