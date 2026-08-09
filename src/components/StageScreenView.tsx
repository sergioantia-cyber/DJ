import React, { useState, useEffect, useRef } from 'react';
import { Disc3, QrCode, Sparkles, MessageSquare, Volume2, VolumeX, Radio, Zap, Play, Pause } from 'lucide-react';
import { SongRequest } from '../types';

interface StageScreenViewProps {
  requests: SongRequest[];
}

export const StageScreenView: React.FC<StageScreenViewProps> = ({ requests }) => {
  // EXCLUDE 'pending' requests from public Stage Screen display!
  // Only display songs confirmed/accepted by the DJ (status: playing, accepted, sent_to_vdj, completed)
  const confirmedRequests = requests.filter((r) => r.status !== 'pending' && r.status !== 'rejected');

  const currentSongReq =
    confirmedRequests.find((r) => r.status === 'playing') ||
    confirmedRequests.find((r) => r.status === 'sent_to_vdj' || r.status === 'accepted') ||
    confirmedRequests[0];

  const nextSongReq = confirmedRequests.find(
    (r) => r.id !== currentSongReq?.id && r.status !== 'completed'
  );

  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Auto-play audio whenever the active song changes
  useEffect(() => {
    if (!currentSongReq || !currentSongReq.song) return;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    if (currentSongReq.song.previewUrl) {
      const audio = new Audio(currentSongReq.song.previewUrl);
      audioRef.current = audio;
      audio.play().then(() => {
        setIsPlayingAudio(true);
      }).catch((e) => {
        console.log('Audio autoplay requires user interaction:', e);
        setIsPlayingAudio(false);
      });

      audio.onended = () => {
        setIsPlayingAudio(false);
      };
    }
  }, [currentSongReq?.id]);

  const handleToggleStageAudio = () => {
    if (!audioRef.current && currentSongReq?.song.previewUrl) {
      const audio = new Audio(currentSongReq.song.previewUrl);
      audioRef.current = audio;
      audio.play();
      setIsPlayingAudio(true);
      return;
    }

    if (audioRef.current) {
      if (isPlayingAudio) {
        audioRef.current.pause();
        setIsPlayingAudio(false);
      } else {
        audioRef.current.play();
        setIsPlayingAudio(true);
      }
    }
  };

  return (
    <div className="min-h-[88vh] bg-club-gradient rounded-3xl p-6 sm:p-10 border border-purple-500/30 flex flex-col justify-between relative overflow-hidden shadow-2xl">
      
      {/* Background glowing blurred circles */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl pointer-events-none animate-pulse"></div>

      {/* Top Header: Club Name & Live Indicator & Stage Audio Toggle */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full bg-pink-500 animate-ping"></div>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-widest uppercase">
            CLUB IBIZA <span className="text-gradient-neon">• EN VIVO</span>
          </h2>
        </div>

        {/* Audio Toggle Button for Stage Screen */}
        {currentSongReq?.song.previewUrl && (
          <button
            onClick={handleToggleStageAudio}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl border backdrop-blur-md transition-all ${
              isPlayingAudio
                ? 'bg-pink-600/80 border-pink-400 text-white shadow-lg shadow-pink-600/40'
                : 'bg-black/60 border-purple-500/40 text-pink-300 hover:text-white'
            }`}
          >
            {isPlayingAudio ? <Volume2 className="w-5 h-5 animate-bounce" /> : <VolumeX className="w-5 h-5" />}
            <span className="text-xs font-black tracking-wider uppercase">
              {isPlayingAudio ? 'SONIDO EN VIVO ACTIVO' : 'ACTIVAR SONIDO PANTALLA'}
            </span>
          </button>
        )}
      </div>

      {/* Center Stage: Now Playing Showcase */}
      {currentSongReq ? (
        <div className="my-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10">
          
          {/* Vinyl & Album Artwork */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-64 h-64 sm:w-80 sm:h-80">
              {/* Spinning Vinyl behind */}
              <div className="absolute inset-0 rounded-full bg-black border-4 border-slate-800 shadow-2xl flex items-center justify-center animate-spin-slow translate-x-12 sm:translate-x-16">
                <div className="w-24 h-24 rounded-full border-4 border-slate-900 bg-purple-900/40 flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-slate-900"></div>
                </div>
              </div>
              
              {/* Front Cover Art */}
              <img
                src={currentSongReq.song.albumCover}
                alt={currentSongReq.song.title}
                className="relative z-10 w-full h-full rounded-3xl object-cover shadow-2xl border-2 border-purple-500/50"
              />
            </div>
          </div>

          {/* Song Info & Equalizer */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-500/20 border border-pink-500/40 text-pink-300 text-xs font-black tracking-widest uppercase mb-3">
                <Sparkles className="w-4 h-4 text-amber-400" /> SONANDO AHORA EN LA PISTA
              </div>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none drop-shadow-lg">
                {currentSongReq.song.title}
              </h1>
              <p className="text-xl sm:text-2xl text-purple-200 font-bold mt-2">
                {currentSongReq.song.artist}
              </p>
            </div>

            {/* Dedicated Message Neon Banner */}
            {currentSongReq.dedicatedMessage ? (
              <div className="p-5 rounded-3xl bg-gradient-to-r from-purple-950/80 via-pink-950/60 to-purple-950/80 border-2 border-pink-500/60 shadow-2xl shadow-pink-500/20 backdrop-blur-xl animate-pulse">
                <div className="flex items-center gap-2 text-pink-400 font-bold text-xs uppercase tracking-wider mb-1">
                  <MessageSquare className="w-4 h-4" /> DEDICATORIA DE {currentSongReq.userName.toUpperCase()} ({currentSongReq.tableNumber.toUpperCase()})
                </div>
                <p className="text-lg sm:text-2xl font-black text-white italic">
                  "{currentSongReq.dedicatedMessage}"
                </p>
              </div>
            ) : (
              <div className="text-sm text-slate-300 font-semibold italic">
                Solicitado por <strong className="text-white">{currentSongReq.userName}</strong> ({currentSongReq.tableNumber})
              </div>
            )}

            {/* Visualizer Spectrum Bars */}
            <div className="flex items-end justify-center lg:justify-start gap-2 h-16 pt-2">
              {[60, 100, 45, 80, 95, 30, 85, 60, 90, 75, 100, 40, 70, 90, 50].map((h, i) => (
                <div
                  key={i}
                  className="w-3 bg-gradient-to-t from-purple-600 via-pink-500 to-cyan-400 rounded-t-full animate-equalizer shadow-lg shadow-pink-500/30"
                  style={{ animationDuration: `${0.4 + (i % 5) * 0.15}s` }}
                ></div>
              ))}
            </div>
          </div>

        </div>
      ) : (
        <div className="p-12 text-center space-y-4">
          <Disc3 className="w-16 h-16 text-pink-400 mx-auto animate-spin" />
          <h3 className="text-2xl font-black text-white">Esperando confirmación de canciones por parte del DJ...</h3>
          <p className="text-slate-400 text-xs">Pide tu tema en la app y realiza tu transferencia Nequi / Bancolombia.</p>
        </div>
      )}

      {/* Bottom Footer: Next Up + Scan QR Box */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-6 border-t border-purple-500/20 z-10 items-center">
        
        {/* Next Up Song */}
        <div className="md:col-span-7 glass-panel rounded-2xl p-4 border border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 font-black text-xs uppercase flex-shrink-0">
            A CONTINUACIÓN
          </div>
          {nextSongReq ? (
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                {nextSongReq.priority.badge}
              </span>
              <h4 className="font-bold text-white text-base truncate">{nextSongReq.song.title}</h4>
              <p className="text-xs text-slate-400 truncate">{nextSongReq.song.artist} • Pedido por {nextSongReq.userName}</p>
            </div>
          ) : (
            <div className="text-xs text-slate-400 italic">
              Sé el primero en pedir la siguiente canción escaneando el código QR 📱
            </div>
          )}
        </div>

        {/* Scan QR Code Banner */}
        <div className="md:col-span-5 glass-panel-neon rounded-2xl p-4 border border-pink-500/40 flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-black text-pink-400 uppercase tracking-widest block">
              ¿Quieres escuchar tu música?
            </span>
            <h4 className="text-sm font-extrabold text-white">Escanea para pedir al DJ</h4>
            <p className="text-[11px] text-slate-300 mt-0.5">Paga fácil con Nequi o Bancolombia</p>
          </div>
          <div className="w-16 h-16 bg-white rounded-xl p-1.5 flex items-center justify-center flex-shrink-0 shadow-lg">
            <QrCode className="w-full h-full text-slate-900" />
          </div>
        </div>

      </div>

    </div>
  );
};
