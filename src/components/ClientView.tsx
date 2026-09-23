import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Flame,
  Zap,
  Clock,
  Music,
  CheckCircle2,
  DollarSign,
  Heart,
  MessageSquare,
  Sparkles,
  QrCode,
  Radio,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Smartphone,
  RefreshCw,
  Send,
  X,
  Play,
  Pause,
  PlusCircle,
  Volume2
} from 'lucide-react';
import { Song, SongRequest, OwnerConfig, PriorityOption } from '../types';
import { INITIAL_PRIORITY_OPTIONS } from '../data/mockDatabase';
import { soundFx } from '../services/soundEffects';
import { getOrCreateDeviceId } from '../services/realtimeSyncService';

interface ClientViewProps {
  songs: Song[];
  userRequests: SongRequest[];
  ownerConfig: OwnerConfig;
  onSubmitRequest: (
    newReq: Omit<SongRequest, 'id' | 'createdAt' | 'status' | 'platformFeeCOP' | 'djShareCOP' | 'clubShareCOP'>
  ) => void;
  onOpenQRModal?: () => void;
}

export const ClientView: React.FC<ClientViewProps> = ({
  songs,
  userRequests,
  ownerConfig,
  onSubmitRequest,
  onOpenQRModal,
}) => {
  const deviceId = getOrCreateDeviceId();

  const [activeSubTab, setActiveSubTab] = useState<'request' | 'history'>('request');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState<boolean>(false);
  const [selectedPriority, setSelectedPriority] = useState<PriorityOption>(INITIAL_PRIORITY_OPTIONS[0]);

  // Form Fields
  const [userName, setUserName] = useState<string>('');
  const [tableNumber, setTableNumber] = useState<string>('');
  const [dedicatedMessage, setDedicatedMessage] = useState<string>('');
  const [tipAmountCOP, setTipAmountCOP] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'nequi_qr' | 'bancolombia_qr'>('nequi_qr');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccessMsg, setSubmitSuccessMsg] = useState<string>('');

  // Audio Preview state
  const [playingPreviewUrl, setPlayingPreviewUrl] = useState<string | null>(null);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

  // Custom song modal fields
  const [customTitle, setCustomTitle] = useState<string>('');
  const [customArtist, setCustomArtist] = useState<string>('');

  // iTunes API Search Results State
  const [searchResults, setSearchResults] = useState<Song[]>(songs);
  const [isSearchingiTunes, setIsSearchingiTunes] = useState<boolean>(false);

  // Persistent Device History Storage
  const [localMyHistory, setLocalMyHistory] = useState<SongRequest[]>(() => {
    try {
      const raw = localStorage.getItem(`beatpulse_my_history_${deviceId}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
  });

  // Search iTunes API when user types in search box
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults(songs);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearchingiTunes(true);
      try {
        const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(searchTerm)}&limit=15&entity=song`);
        const data = await res.json();
        if (data && data.results) {
          const formatted: Song[] = data.results.map((item: any, idx: number) => ({
            id: `itunes-${item.trackId || idx}`,
            title: item.trackName || 'Canción',
            artist: item.artistName || 'Artista',
            albumCover: item.artworkUrl100 ? item.artworkUrl100.replace('100x100bb', '400x400bb') : 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80',
            genre: item.primaryGenreName || 'Latin/Club',
            bpm: 120,
            duration: item.trackTimeMillis ? `${Math.floor(item.trackTimeMillis / 60000)}:${Math.floor((item.trackTimeMillis % 60000) / 1000).toString().padStart(2, '0')}` : '3:30',
            energyLevel: 9,
            previewUrl: item.previewUrl || undefined,
          }));
          setSearchResults(formatted);
        }
      } catch (e) {
        console.warn('iTunes Search error:', e);
      } finally {
        setIsSearchingiTunes(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, songs]);

  // Combine live state and persistent device history for customer
  const myCombinedHistory = React.useMemo(() => {
    const map = new Map<string, SongRequest>();

    // Add local persistent history first
    for (const r of localMyHistory) {
      if (r && r.id) map.set(r.id, r);
    }

    // Add live matching device requests
    const deviceRequests = userRequests.filter((r) => r.deviceId === deviceId || (userName && r.userName === userName));
    for (const r of deviceRequests) {
      if (r && r.id) map.set(r.id, r);
    }

    return Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  }, [localMyHistory, userRequests, deviceId, userName]);

  const totalCostCOP = (selectedPriority?.priceCOP || 10000) + tipAmountCOP;

  // Handles clicking a song card or button -> Immediately opens the request modal
  const handleSelectSong = (song: Song) => {
    setSelectedSong(song);
    setIsOrderModalOpen(true);
    try {
      soundFx.playCoinChime();
    } catch (e) {}
  };

  // Handles opening custom song request
  const handleOpenCustomSong = () => {
    const customSong: Song = {
      id: `custom-${Date.now()}`,
      title: customTitle.trim() || 'Canción Personalizada',
      artist: customArtist.trim() || 'Artista no especificado',
      albumCover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80',
      genre: 'Reggaeton',
      bpm: 128,
      duration: '3:30',
      energyLevel: 9,
    };
    setSelectedSong(customSong);
    setIsOrderModalOpen(true);
    try {
      soundFx.playCoinChime();
    } catch (e) {}
  };

  // Handles audio preview playback
  const toggleAudioPreview = (url?: string) => {
    if (!url) return;
    if (playingPreviewUrl === url) {
      audioPreviewRef.current?.pause();
      setPlayingPreviewUrl(null);
    } else {
      if (audioPreviewRef.current) {
        audioPreviewRef.current.pause();
      }
      const audio = new Audio(url);
      audioPreviewRef.current = audio;
      audio.play().catch(() => {});
      audio.onended = () => setPlayingPreviewUrl(null);
      setPlayingPreviewUrl(url);
    }
  };

  const handleCloseModal = () => {
    if (audioPreviewRef.current) {
      audioPreviewRef.current.pause();
      setPlayingPreviewUrl(null);
    }
    setIsOrderModalOpen(false);
  };

  const handleSubmitRequestForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSong) return;

    // Use custom title/artist if specified
    const finalSong: Song = {
      ...selectedSong,
      title: customTitle.trim() && selectedSong.id.startsWith('custom-') ? customTitle.trim() : selectedSong.title,
      artist: customArtist.trim() && selectedSong.id.startsWith('custom-') ? customArtist.trim() : selectedSong.artist,
    };

    setIsSubmitting(true);

    const newReqData = {
      deviceId,
      song: finalSong,
      priority: selectedPriority,
      userName: userName.trim() || 'Cliente Anónimo',
      tableNumber: tableNumber.trim() || 'Mesa General',
      dedicatedMessage: dedicatedMessage.trim() || undefined,
      tipAmountCOP,
      totalPaidCOP: totalCostCOP,
      paymentMethod,
    };

    onSubmitRequest(newReqData);

    // Save to persistent device history storage
    const createdReq: SongRequest = {
      ...newReqData,
      id: `req-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'pending',
      platformFeeCOP: totalCostCOP * 0.2,
      djShareCOP: totalCostCOP * 0.1,
      clubShareCOP: totalCostCOP * 0.7,
    };

    const updatedHistory = [createdReq, ...localMyHistory];
    setLocalMyHistory(updatedHistory);
    try {
      localStorage.setItem(`beatpulse_my_history_${deviceId}`, JSON.stringify(updatedHistory));
    } catch (e) {}

    setIsSubmitting(false);
    setSubmitSuccessMsg(`¡"${finalSong.title}" ha sido enviada a la cabina del DJ! Tu pedido está en cola.`);
    handleCloseModal();
    setSelectedSong(null);
    setDedicatedMessage('');
    setTipAmountCOP(0);
    setCustomTitle('');
    setCustomArtist('');
    setActiveSubTab('history');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      
      {/* Party Banner Header */}
      <div className="glass-panel-neon p-6 rounded-3xl border border-purple-500/40 relative overflow-hidden text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30 text-xs font-bold uppercase tracking-wider">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>Música en Vivo • {ownerConfig.clubName || 'Club Ibiza'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Pide tu Canción y Dedícala en la Pantalla del Club
          </h2>
          <p className="text-xs text-slate-300 max-w-lg">
            Selecciona tu canción favorita, ingresa tu mesa y dedicatoria para que el DJ la ponga a sonar.
          </p>
        </div>

        {/* Action Toggle Switcher */}
        <div className="flex items-center bg-black/60 p-1.5 rounded-2xl border border-white/10 z-10 flex-shrink-0">
          <button
            onClick={() => setActiveSubTab('request')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
              activeSubTab === 'request'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🎵 Pedir Canción
          </button>
          <button
            onClick={() => setActiveSubTab('history')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all relative ${
              activeSubTab === 'history'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            📋 Mis Pedidos ({myCombinedHistory.length})
          </button>
        </div>
      </div>

      {/* QR Code & Mobile APK Card Banner */}
      {onOpenQRModal && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-900/40 via-pink-900/30 to-amber-900/30 border border-purple-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg animate-fadeIn">
          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400 flex-shrink-0">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                <span>📲 ¿Estás en una mesa del club? Descarga la App o el QR</span>
              </h4>
              <p className="text-[11px] text-slate-300">
                Comparte o descarga el código QR para que todos en tu mesa puedan pedir canciones y pagar al instante.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenQRModal}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:brightness-110 text-white font-extrabold text-xs shadow-md flex items-center gap-2 flex-shrink-0 transition-all active:scale-95"
          >
            <QrCode className="w-4 h-4" />
            <span>Ver / Descargar QR</span>
          </button>
        </div>
      )}

      {/* Success Notification Alert */}
      {submitSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-between animate-fadeIn shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span>{submitSuccessMsg}</span>
          </div>
          <button onClick={() => setSubmitSuccessMsg('')} className="text-emerald-400 hover:text-white font-bold ml-2">
            ✕
          </button>
        </div>
      )}

      {/* SUBTAB 1: REQUEST A SONG */}
      {activeSubTab === 'request' && (
        <div className="space-y-6">
          
          {/* Step 1: Search Music & Custom Song Trigger */}
          <div className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-sm font-extrabold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <span>1. Toca una Canción para Pedirla al DJ</span>
                {isSearchingiTunes && <RefreshCw className="w-4 h-4 text-pink-400 animate-spin" />}
              </h3>

              <button
                type="button"
                onClick={handleOpenCustomSong}
                className="text-xs font-bold text-pink-400 hover:text-pink-300 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-500/10 border border-pink-500/30 transition-all hover:bg-pink-500/20"
              >
                <PlusCircle className="w-4 h-4" />
                <span>¿No está tu canción? Escríbela aquí</span>
              </button>
            </div>

            <div className="relative">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Busca por nombre o artista (ej: Farruko, Bad Bunny, Karol G, Feid, Blessd)..."
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-900/90 border border-white/10 text-white text-sm focus:border-pink-500 outline-none shadow-inner"
              />
            </div>

            {/* Song Grid List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {searchResults.map((song) => {
                const isSelected = selectedSong?.id === song.id;
                return (
                  <div
                    key={song.id}
                    onClick={() => handleSelectSong(song)}
                    role="button"
                    tabIndex={0}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 group active:scale-[0.98] ${
                      isSelected
                        ? 'bg-gradient-to-r from-purple-900/70 to-pink-900/70 border-pink-500 ring-2 ring-pink-500/50 shadow-lg shadow-pink-500/30'
                        : 'bg-[#12121e] border-white/10 hover:border-pink-500/60 hover:bg-slate-900/90 hover:shadow-md hover:shadow-purple-500/10'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative flex-shrink-0">
                        <img
                          src={song.albumCover}
                          alt={song.title}
                          className="w-14 h-14 rounded-xl object-cover shadow-md group-hover:scale-105 transition-transform"
                        />
                        {song.previewUrl && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleAudioPreview(song.previewUrl);
                            }}
                            title="Escuchar 30s"
                            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-pink-600 text-white flex items-center justify-center shadow-lg hover:bg-pink-500 transition-all"
                          >
                            {playingPreviewUrl === song.previewUrl ? (
                              <Pause className="w-3 h-3" />
                            ) : (
                              <Play className="w-3 h-3 ml-0.5" />
                            )}
                          </button>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-white text-sm truncate group-hover:text-pink-300 transition-colors">
                          {song.title}
                        </h4>
                        <p className="text-xs text-slate-400 truncate">{song.artist}</p>
                        <span className="text-[10px] text-pink-400 font-semibold">{song.genre}</span>
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectSong(song);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-black shadow-md shadow-purple-600/30 flex items-center gap-1.5 transition-all group-hover:scale-105"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Pedir 🎵</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom button for custom song */}
            <div className="pt-4 text-center">
              <button
                type="button"
                onClick={handleOpenCustomSong}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-900 border border-dashed border-pink-500/50 hover:border-pink-500 text-pink-300 hover:text-white font-bold text-xs transition-all hover:bg-pink-900/20"
              >
                <PlusCircle className="w-4 h-4 text-pink-400" />
                <span>¿No encuentras lo que buscas? Escribe cualquier canción manualmente</span>
              </button>
            </div>

          </div>

          {/* Sticky Quick-Bar if a song was selected and modal closed */}
          {selectedSong && !isOrderModalOpen && (
            <div className="sticky bottom-4 z-40 p-4 rounded-2xl bg-gradient-to-r from-purple-900 via-pink-900 to-slate-900 border border-pink-500/60 shadow-2xl flex items-center justify-between gap-4 animate-fadeIn">
              <div className="flex items-center gap-3 min-w-0">
                <img src={selectedSong.albumCover} alt={selectedSong.title} className="w-11 h-11 rounded-xl object-cover shadow-md flex-shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] font-extrabold text-pink-300 uppercase tracking-wider block">Canción Seleccionada</span>
                  <h4 className="font-bold text-white text-xs truncate">{selectedSong.title}</h4>
                  <p className="text-[11px] text-slate-300 truncate">{selectedSong.artist}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOrderModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-amber-500 hover:brightness-110 text-white font-black text-xs shadow-lg flex items-center gap-2 flex-shrink-0 active:scale-95 transition-all"
              >
                <span>Completar Pedido</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      )}

      {/* 🚀 MODAL INTERACTIVO DE PEDIDO (SE ABRE AL DAR CLIC A CUALQUIER CANCIÓN) */}
      {isOrderModalOpen && selectedSong && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
          
          <div className="relative w-full max-w-lg bg-[#0e0e18] border border-purple-500/50 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5 my-auto max-h-[92vh] overflow-y-auto text-left">
            
            {/* Modal Close Button */}
            <button
              type="button"
              onClick={handleCloseModal}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-all z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Song Header in Modal */}
            <div className="flex items-center gap-4 pr-10 pb-4 border-b border-white/10">
              <div className="relative flex-shrink-0">
                <img
                  src={selectedSong.albumCover}
                  alt={selectedSong.title}
                  className="w-16 h-16 rounded-2xl object-cover shadow-lg border border-white/15"
                />
                {selectedSong.previewUrl && (
                  <button
                    type="button"
                    onClick={() => toggleAudioPreview(selectedSong.previewUrl)}
                    className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-pink-600 text-white flex items-center justify-center shadow-lg hover:bg-pink-500"
                  >
                    {playingPreviewUrl === selectedSong.previewUrl ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                  </button>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-pink-500/20 text-pink-300 text-[10px] font-bold uppercase tracking-wider">
                    {selectedSong.genre || 'Música de Club'}
                  </span>
                  {selectedSong.bpm && (
                    <span className="text-[10px] text-slate-400 font-mono">{selectedSong.bpm} BPM</span>
                  )}
                </div>
                <h3 className="text-lg font-black text-white truncate mt-0.5">{selectedSong.title}</h3>
                <p className="text-xs text-slate-300 truncate">{selectedSong.artist}</p>
              </div>
            </div>

            {/* Custom Song Inputs if manual title */}
            {selectedSong.id.startsWith('custom-') && (
              <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-500/30 space-y-3">
                <span className="text-xs font-bold text-pink-300 block">Personaliza el Título y Artista:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="Nombre de la canción *"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:border-pink-500 outline-none"
                  />
                  <input
                    type="text"
                    required
                    value={customArtist}
                    onChange={(e) => setCustomArtist(e.target.value)}
                    placeholder="Artista o Banda *"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:border-pink-500 outline-none"
                  />
                </div>
              </div>
            )}

            <form onSubmit={handleSubmitRequestForm} className="space-y-5">
              
              {/* Step 1: Speed & Priority Options */}
              <div className="space-y-2.5">
                <label className="text-xs font-extrabold text-slate-200 uppercase tracking-wider block">
                  1. Velocidad de Reproducción en Cabina
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {INITIAL_PRIORITY_OPTIONS.map((prio) => {
                    const isPrioSelected = selectedPriority.id === prio.id;
                    return (
                      <div
                        key={prio.id}
                        onClick={() => setSelectedPriority(prio)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer space-y-1.5 ${
                          isPrioSelected
                            ? 'bg-purple-900/60 border-pink-500 ring-2 ring-pink-500/40 shadow-lg shadow-purple-600/20'
                            : 'bg-slate-900/70 border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold text-white">{prio.badge}</span>
                          <span className="text-xs font-mono font-bold text-emerald-400">
                            ${prio.priceCOP.toLocaleString('es-CO')}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-300 leading-tight">{prio.tagline}</p>
                        <p className="text-[9px] text-slate-400 font-semibold">⏱ Espera: ~{prio.estimatedWaitMinutes} min</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: User Name & Table Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Tu Nombre o Apodo <span className="text-pink-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Ej: Carlos / Sofía"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:border-pink-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Mesa o Ubicación en el Club <span className="text-pink-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    placeholder="Ej: Mesa 12 / Barra Principal"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:border-pink-500 outline-none"
                  />
                </div>
              </div>

              {/* Step 3: Dedication Message */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  💬 Mensaje de Dedicatoria (Saldrá en la Pantalla del Club)
                </label>
                <input
                  type="text"
                  maxLength={120}
                  value={dedicatedMessage}
                  onChange={(e) => setDedicatedMessage(e.target.value)}
                  placeholder="Ej: ¡Para la mesa 5 con mucho cariño! / ¡Feliz cumpleaños Ana! 🎉"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:border-pink-500 outline-none"
                />
                <span className="text-[10px] text-slate-400 text-right block mt-1">
                  {dedicatedMessage.length}/120 caracteres
                </span>
              </div>

              {/* Step 4: Payment Method Selector */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-slate-200 uppercase tracking-wider block">
                  3. Método de Pago Directo
                </label>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('nequi_qr')}
                    className={`p-3 rounded-2xl border text-center font-bold text-xs transition-all ${
                      paymentMethod === 'nequi_qr'
                        ? 'bg-purple-900/60 border-pink-500 text-white shadow-md'
                        : 'bg-slate-900 border-white/10 text-slate-400'
                    }`}
                  >
                    💜 Nequi QR
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bancolombia_qr')}
                    className={`p-3 rounded-2xl border text-center font-bold text-xs transition-all ${
                      paymentMethod === 'bancolombia_qr'
                        ? 'bg-amber-900/60 border-amber-500 text-white shadow-md'
                        : 'bg-slate-900 border-white/10 text-slate-400'
                    }`}
                  >
                    💛 Bancolombia QR
                  </button>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-white/10 text-[11px] text-slate-300 flex items-center justify-between">
                  <span>Datos de Transferencia:</span>
                  <span className="font-mono font-bold text-pink-400">
                    {paymentMethod === 'nequi_qr'
                      ? `Nequi: ${ownerConfig.nequiPhoneNumber || ownerConfig.nequiPhone || '300 000 0000'}`
                      : `Bancolombia: ${ownerConfig.bancolombiaAccountNumber || ownerConfig.bancolombiaAcc || 'Ahorros 123-456789-01'}`}
                  </span>
                </div>
              </div>

              {/* Total Summary & Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-500 hover:to-pink-500 text-white font-black text-sm shadow-xl shadow-purple-600/40 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {isSubmitting
                      ? 'Enviando a la Cabina...'
                      : `🚀 Enviar Canción al DJ ($${totalCostCOP.toLocaleString('es-CO')} COP)`}
                  </span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* SUBTAB 2: MY PROGRAMMED SONGS HISTORY */}
      {activeSubTab === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-200 uppercase tracking-wider">
              Historial de mis Canciones Solicitadas
            </h3>
            <span className="text-xs font-mono font-bold text-purple-400">ID Dispositivo: {deviceId.substring(0, 14)}...</span>
          </div>

          {myCombinedHistory.length === 0 ? (
            <div className="p-12 text-center text-slate-400 glass-panel rounded-3xl space-y-3 border border-white/10">
              <Music className="w-12 h-12 mx-auto text-purple-400 opacity-40 animate-bounce" />
              <h4 className="text-base font-bold text-white">Aún no has pedido canciones</h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Tus canciones solicitadas y sus dedicatorias quedarán guardadas aquí en tu historial en tiempo real.
              </p>
              <button
                onClick={() => setActiveSubTab('request')}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all"
              >
                🎵 Pedir mi Primera Canción
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {myCombinedHistory.map((req) => (
                <div key={req.id} className="p-4 rounded-2xl bg-[#12121e] border border-white/10 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <img src={req.song?.albumCover} alt={req.song?.title} className="w-14 h-14 rounded-xl object-cover shadow-md flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          req.status === 'playing' ? 'bg-pink-500 text-white animate-pulse' :
                          req.status === 'accepted' ? 'bg-emerald-500/20 text-emerald-300' :
                          req.status === 'rejected' ? 'bg-rose-500/20 text-rose-300' :
                          'bg-purple-500/20 text-purple-300'
                        }`}>
                          {req.status === 'playing' ? '🎶 SONANDO AHORA EN PANTALLA' :
                           req.status === 'accepted' ? '✅ ACEPTADA POR DJ' :
                           req.status === 'rejected' ? '❌ RECHAZADA' :
                           '⏳ PENDIENTE VERIFICACIÓN DJ'}
                        </span>
                        <span className="text-xs font-mono font-bold text-emerald-400">${(req.totalPaidCOP || 0).toLocaleString('es-CO')} COP</span>
                      </div>

                      <h4 className="font-bold text-white text-sm truncate mt-1">{req.song?.title}</h4>
                      <p className="text-xs text-slate-400 truncate">{req.song?.artist} • {new Date(req.createdAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}</p>

                      {req.dedicatedMessage && (
                        <p className="mt-1 text-xs text-pink-300 italic truncate">💬 "{req.dedicatedMessage}"</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Contact Footer */}
      <footer className="pt-8 border-t border-white/10 text-center text-xs text-slate-400 space-y-2">
        <p className="font-semibold text-slate-300">
          ¿Problemas con tu pedido? Soporte desarrollador WhatsApp: <a href="https://wa.me/573227949751" target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline font-bold">+57 322 794 9751</a>
        </p>
        <p className="text-[10px] text-slate-400">BeatPulse DJ Platform © 2026 • Todos los derechos reservados</p>
      </footer>

    </div>
  );
};
