import React, { useState, useRef } from 'react';
import {
  CheckCircle2,
  XCircle,
  Play,
  Pause,
  SkipForward,
  Volume2,
  VolumeX,
  DollarSign,
  Disc3,
  Cable,
  Check,
  Bell,
  AlertTriangle,
  Music,
  Radio,
  ExternalLink,
  Smartphone,
  Sliders,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { SongRequest, RequestStatus, VirtualDJConfig, OwnerConfig } from '../types';
import { soundFx } from '../services/soundEffects';

interface DJBoothViewProps {
  requests: SongRequest[];
  vdjConfig: VirtualDJConfig;
  ownerConfig: OwnerConfig;
  onUpdateRequestStatus: (requestId: string, newStatus: RequestStatus, reason?: string) => void;
  onToggleAutoAccept: () => void;
}

export const DJBoothView: React.FC<DJBoothViewProps> = ({
  requests,
  vdjConfig,
  ownerConfig,
  onUpdateRequestStatus,
  onToggleAutoAccept,
}) => {
  // Default to showing 'all' or 'pending' requests
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [rejectionModalReqId, setRejectionModalReqId] = useState<string | null>(null);

  // Standalone Sound System Player State
  const [soundSystemMode, setSoundSystemMode] = useState<'virtualdj' | 'web_player' | 'spotify'>('web_player');
  const [isPlayingWebAudio, setIsPlayingWebAudio] = useState<boolean>(false);
  const [currentPlayingReq, setCurrentPlayingReq] = useState<SongRequest | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const validRequests = requests.filter((r) => r.status !== 'rejected');
  const totalGrossCOP = validRequests.reduce((sum, r) => sum + r.totalPaidCOP, 0);
  const djEarnedCOP = validRequests.reduce((sum, r) => sum + r.djShareCOP, 0);

  const filteredRequests = requests.filter((r) => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'pending') return r.status === 'pending';
    if (filterStatus === 'active') return r.status === 'accepted' || r.status === 'sent_to_vdj';
    if (filterStatus === 'playing') return r.status === 'playing';
    if (filterStatus === 'completed') return r.status === 'completed';
    if (filterStatus === 'rejected') return r.status === 'rejected';
    return true;
  });

  const handlePlaySongStandalone = (req: SongRequest) => {
    setCurrentPlayingReq(req);
    onUpdateRequestStatus(req.id, 'playing');

    if (audioRef.current) {
      audioRef.current.pause();
    }

    if (req.song.previewUrl) {
      const audio = new Audio(req.song.previewUrl);
      audioRef.current = audio;
      audio.play();
      setIsPlayingWebAudio(true);

      audio.onended = () => {
        setIsPlayingWebAudio(false);
        onUpdateRequestStatus(req.id, 'completed');
        const next = requests.find((r) => (r.status === 'accepted' || r.status === 'pending') && r.id !== req.id);
        if (next) {
          handlePlaySongStandalone(next);
        }
      };
    } else {
      soundFx.playBassDrop();
      setIsPlayingWebAudio(true);
    }
  };

  const handleTogglePauseWebAudio = () => {
    if (!audioRef.current) return;
    if (isPlayingWebAudio) {
      audioRef.current.pause();
      setIsPlayingWebAudio(false);
    } else {
      audioRef.current.play();
      setIsPlayingWebAudio(true);
    }
  };

  const handleApproveRequest = (req: SongRequest) => {
    soundFx.playScratch();
    onUpdateRequestStatus(req.id, 'accepted');
  };

  const handleConfirmReject = (reason: string) => {
    if (!rejectionModalReqId) return;
    onUpdateRequestStatus(rejectionModalReqId, 'rejected', reason);
    setRejectionModalReqId(null);
  };

  const openInSpotifySearch = (songTitle: string, artist: string) => {
    const query = encodeURIComponent(`${songTitle} ${artist}`);
    window.open(`https://open.spotify.com/search/${query}`, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      
      {/* Sound Output Mode Switcher Banner */}
      <div className="glass-panel-neon p-5 rounded-3xl border border-cyan-500/40 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest block">
                Configuración del Sistema de Sonido del Club
              </span>
              <h3 className="text-lg font-extrabold text-white">¿Desde qué dispositivo sonará la música?</h3>
            </div>
          </div>

          {/* Mode Selector Tabs */}
          <div className="flex items-center bg-black/50 p-1.5 rounded-2xl border border-white/10 overflow-x-auto">
            <button
              onClick={() => setSoundSystemMode('web_player')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                soundSystemMode === 'web_player'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>📱 Móvil / Bluetooth (Web Player)</span>
            </button>

            <button
              onClick={() => setSoundSystemMode('virtualdj')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                soundSystemMode === 'virtualdj'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Cable className="w-3.5 h-3.5" />
              <span>💻 Laptop VirtualDJ</span>
            </button>

            <button
              onClick={() => setSoundSystemMode('spotify')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                soundSystemMode === 'spotify'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>🎧 Enlace Spotify</span>
            </button>
          </div>
        </div>

        {/* Live Audio Deck */}
        {soundSystemMode === 'web_player' && (
          <div className="p-4 rounded-2xl bg-black/60 border border-purple-500/30 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-purple-900/60 border border-purple-500/40 flex items-center justify-center flex-shrink-0">
                <Disc3 className={`w-7 h-7 text-pink-400 ${isPlayingWebAudio ? 'animate-spin' : ''}`} />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-pink-400 uppercase tracking-widest block">
                  Reproductor Directo a Altavoces / Bluetooth
                </span>
                <h4 className="font-extrabold text-white text-sm truncate">
                  {currentPlayingReq ? currentPlayingReq.song.title : 'Esperando primera canción...'}
                </h4>
                <p className="text-xs text-slate-400 truncate">
                  {currentPlayingReq ? `${currentPlayingReq.song.artist} • Pedido por ${currentPlayingReq.userName}` : 'Conecta este teléfono/tablet al AUX o Bluetooth del club'}
                </p>
              </div>
            </div>

            {/* Playback controls */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                disabled={!currentPlayingReq}
                onClick={handleTogglePauseWebAudio}
                className="w-11 h-11 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/40 active:scale-95 disabled:opacity-40"
              >
                {isPlayingWebAudio ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Top DJ Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* DJ Share Net Earned */}
        <div className="glass-panel-neon rounded-2xl p-5 border border-purple-500/30 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tu Ganancia DJ (10%)</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              <span className="text-gradient-gold">${djEarnedCOP.toLocaleString('es-CO')}</span>
              <span className="text-xs text-slate-400 font-normal ml-1">COP</span>
            </div>
            <p className="text-[10px] text-emerald-400 font-semibold mt-1">De un bruto de ${totalGrossCOP.toLocaleString('es-CO')} COP</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <DollarSign className="w-7 h-7" />
          </div>
        </div>

        {/* Pending Requests */}
        <div className="glass-panel rounded-2xl p-5 border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Solicitudes Pendientes</span>
            <div className="text-3xl font-extrabold text-white mt-1 flex items-center gap-2">
              <span>{pendingRequests.length}</span>
              {pendingRequests.length > 0 && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-pink-500 text-white animate-pulse">
                  NUEVAS
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Nequi / Bancolombia Confirmados</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400">
            <Bell className="w-6 h-6 animate-bounce" />
          </div>
        </div>

        {/* Output Mode Status */}
        <div className="glass-panel rounded-2xl p-5 border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Modo de Sonido</span>
            <div className="text-sm font-bold text-white mt-1 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span>{soundSystemMode === 'web_player' ? 'Móvil / Bluetooth' : soundSystemMode === 'virtualdj' ? 'VirtualDJ Deck' : 'Spotify Sync'}</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Conectado a los altavoces del club</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Volume2 className="w-6 h-6" />
          </div>
        </div>

        {/* Total Songs in Queue */}
        <div className="glass-panel rounded-2xl p-5 border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total en Registro</span>
            <div className="text-3xl font-extrabold text-white mt-1">
              {requests.length} <span className="text-xs text-slate-400 font-normal">canciones</span>
            </div>
            <p className="text-[10px] text-purple-300 mt-1">Sincronizado en Vivo</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Music className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* DJ Soundboard */}
      <div className="glass-panel rounded-2xl p-4 border border-white/10 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-pink-400" />
          <span className="text-xs font-extrabold text-white uppercase tracking-wider">DJ Soundboard FX:</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => soundFx.playAirhorn()} className="px-3.5 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600 border border-purple-500/40 text-purple-200 font-bold text-xs">
            🎺 Airhorn
          </button>
          <button onClick={() => soundFx.playScratch()} className="px-3.5 py-1.5 rounded-xl bg-pink-600/30 hover:bg-pink-600 border border-pink-500/40 text-pink-200 font-bold text-xs">
            🎧 Scratch
          </button>
          <button onClick={() => soundFx.playBassDrop()} className="px-3.5 py-1.5 rounded-xl bg-amber-600/30 hover:bg-amber-600 border border-amber-500/40 text-amber-200 font-bold text-xs">
            🔊 Bass Drop
          </button>
          <button onClick={() => soundFx.playCoinChime()} className="px-3.5 py-1.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600 border border-emerald-500/40 text-emerald-200 font-bold text-xs">
            🪙 Coin Chime
          </button>
        </div>
      </div>

      {/* Main Request Queue Deck Header (Renamed to "Cola de Pedidos") */}
      <div className="glass-panel-neon rounded-3xl p-6 border border-purple-500/30 space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Disc3 className="w-7 h-7 text-pink-400 animate-spin-slow" />
            <div>
              <h3 className="text-xl font-extrabold text-white">Cola de Pedidos</h3>
              <p className="text-xs text-slate-400">Verifica el pago del cliente y aprueba para proyectar en la Pantalla del Club</p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10 overflow-x-auto">
            {[
              { id: 'all', label: `Todos (${requests.length})` },
              { id: 'pending', label: `Pendientes (${pendingRequests.length})` },
              { id: 'active', label: 'En Cola' },
              { id: 'playing', label: 'Sonando' },
              { id: 'rejected', label: 'Rechazados' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filterStatus === tab.id ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Requests List */}
        {filteredRequests.length === 0 ? (
          <div className="p-12 text-center text-slate-400 glass-panel rounded-3xl space-y-3 border border-white/10">
            <Music className="w-12 h-12 mx-auto text-purple-400 opacity-40 animate-bounce" />
            <h4 className="text-base font-bold text-white">No hay canciones en la cola</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Las canciones solicitadas por los clientes desde sus teléfonos aparecerán automáticamente aquí para tu aprobación.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((req) => (
              <div
                key={req.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                  req.status === 'playing'
                    ? 'bg-pink-950/30 border-pink-500/60 shadow-lg shadow-pink-500/20'
                    : req.status === 'pending'
                    ? 'bg-purple-950/40 border-purple-500/50 shadow-md ring-1 ring-purple-500/30'
                    : 'bg-[#12121e] border-white/10'
                }`}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <img src={req.song.albumCover} alt={req.song.title} className="w-16 h-16 rounded-xl object-cover shadow-md flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {req.priority.badge}
                      </span>
                      <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                        +${req.totalPaidCOP.toLocaleString('es-CO')} COP ({req.paymentMethod.toUpperCase()})
                      </span>
                    </div>

                    <h4 className="font-bold text-white text-base truncate mt-1">{req.song.title}</h4>
                    <p className="text-xs text-slate-400 truncate">{req.song.artist} • Pedido por {req.userName} ({req.tableNumber})</p>

                    {req.dedicatedMessage && (
                      <p className="mt-1 text-xs text-pink-300 bg-pink-500/10 px-2.5 py-1 rounded-lg border border-pink-500/20 italic">
                        💬 "{req.dedicatedMessage}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-wrap">
                  
                  {/* Spotify quick link */}
                  <button
                    onClick={() => openInSpotifySearch(req.song.title, req.song.artist)}
                    className="px-3 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white font-bold text-xs flex items-center gap-1 border border-emerald-500/30"
                    title="Abrir en Spotify"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Spotify</span>
                  </button>

                  {req.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApproveRequest(req)}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/30"
                      >
                        <CheckCircle2 className="w-4 h-4 text-white" />
                        <span>Aprobar Pago</span>
                      </button>

                      <button
                        onClick={() => handlePlaySongStandalone(req)}
                        className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-purple-600/30"
                      >
                        <Play className="w-4 h-4 fill-white" />
                        <span>Sonar Ahora</span>
                      </button>

                      <button
                        onClick={() => setRejectionModalReqId(req.id)}
                        className="px-3 py-2 rounded-xl bg-rose-600/20 text-rose-300 font-bold text-xs border border-rose-500/30"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </>
                  )}

                  {(req.status === 'accepted' || req.status === 'sent_to_vdj') && (
                    <button
                      onClick={() => handlePlaySongStandalone(req)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-xs flex items-center gap-1.5"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>Sonar Ahora</span>
                    </button>
                  )}

                  {req.status === 'playing' && (
                    <span className="px-3 py-1.5 rounded-xl bg-pink-500 text-white font-extrabold text-xs animate-pulse">
                      SONANDO AHORA EN PANTALLA
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Rejection Modal */}
      {rejectionModalReqId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md glass-panel-neon rounded-3xl p-6 border border-rose-500/40 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              <span>Rechazar Pedido y Reembolsar</span>
            </h3>

            <div className="space-y-2">
              {['Canción no encaja con el género actual', 'Esta canción ya sonó hace pocos minutos', 'Contenido explícito no permitido'].map((reason) => (
                <button
                  key={reason}
                  onClick={() => handleConfirmReject(reason)}
                  className="w-full text-left p-3 rounded-xl bg-slate-900 text-xs font-semibold text-slate-200 hover:bg-rose-950/40"
                >
                  • {reason}
                </button>
              ))}
            </div>

            <div className="pt-2 text-right">
              <button onClick={() => setRejectionModalReqId(null)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
