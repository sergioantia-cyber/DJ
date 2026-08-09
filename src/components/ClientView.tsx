import React, { useState, useEffect } from 'react';
import {
  Search,
  Sparkles,
  Flame,
  Clock,
  Zap,
  Music,
  QrCode,
  Smartphone,
  CreditCard,
  MessageSquare,
  Volume2,
  VolumeX,
  TrendingUp,
  X,
  Radio,
  Globe,
  Loader2,
  Tv,
  PhoneCall
} from 'lucide-react';
import { Song, PriorityOption, Genre, SongRequest, OwnerConfig, PaymentMethodType } from '../types';
import { INITIAL_PRIORITY_OPTIONS } from '../data/mockDatabase';
import { NequiBancolombiaPaymentModal } from './NequiBancolombiaPaymentModal';
import { StageScreenView } from './StageScreenView';
import { searchLiveWebMusic, fetchDefaultTopClubHits } from '../services/musicSearchService';
import { soundFx } from '../services/soundEffects';

interface ClientViewProps {
  songs: Song[];
  userRequests: SongRequest[];
  ownerConfig: OwnerConfig;
  onSubmitRequest: (newReq: Omit<SongRequest, 'id' | 'createdAt' | 'status' | 'platformFeeCOP' | 'djShareCOP' | 'clubShareCOP'>) => void;
}

export const ClientView: React.FC<ClientViewProps> = ({
  songs,
  userRequests,
  ownerConfig,
  onSubmitRequest,
}) => {
  const [selectedGenre, setSelectedGenre] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [defaultHits, setDefaultHits] = useState<Song[]>([]);
  const [isSearchingWeb, setIsSearchingWeb] = useState<boolean>(false);

  const [selectedSong, setSelectedSong] = useState<Song | null>(null);

  // Audio player state for 30s preview
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [activeAudioElement, setActiveAudioElement] = useState<HTMLAudioElement | null>(null);

  // Form states for request modal
  const [userName, setUserName] = useState<string>('Alex M.');
  const [tableNumber, setTableNumber] = useState<string>('Mesa 12 (Zona VIP)');
  const [selectedPriority, setSelectedPriority] = useState<PriorityOption>(INITIAL_PRIORITY_OPTIONS[1]);
  const [extraTipCOP, setExtraTipCOP] = useState<number>(5000);
  const [dedicatedMessage, setDedicatedMessage] = useState<string>('');

  // Nequi / Bancolombia Payment Modal Trigger
  const [isNequiModalOpen, setIsNequiModalOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'catalog' | 'my_requests' | 'stage_screen'>('catalog');

  const genresList = ['Todos', 'Reggaeton', 'Electro / House', 'Techno & EDM', 'Salsa & Bachata', 'Trap & Urban', 'Pop Hits'];

  // Initial load of real top hits from iTunes API
  useEffect(() => {
    async function loadHits() {
      setIsSearchingWeb(true);
      const hits = await fetchDefaultTopClubHits();
      setDefaultHits(hits);
      setIsSearchingWeb(false);
    }
    loadHits();
  }, []);

  // Live Web Search from iTunes API
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearchingWeb(false);
      return;
    }

    setIsSearchingWeb(true);
    const timeoutId = setTimeout(async () => {
      const liveSongs = await searchLiveWebMusic(searchQuery);
      setSearchResults(liveSongs);
      setIsSearchingWeb(false);
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const rawDisplayedSongs = searchQuery.trim() ? searchResults : defaultHits;
  const displayedSongs = rawDisplayedSongs.filter(
    (song) => selectedGenre === 'Todos' || song.genre === selectedGenre
  );

  const getBasePriceCOP = (priorityId: string) => {
    if (ownerConfig.pricingMode === 'flat_single') {
      return ownerConfig.flatSinglePriceCOP;
    }
    if (priorityId === 'normal') return ownerConfig.tieredPricesCOP.normal;
    if (priorityId === 'vip') return ownerConfig.tieredPricesCOP.vip;
    if (priorityId === 'play_now') return ownerConfig.tieredPricesCOP.play_now;
    return 10000;
  };

  const calculateTotalCOP = () => {
    const base = getBasePriceCOP(selectedPriority.id);
    return base + extraTipCOP;
  };

  const handleOpenOrderModal = (song: Song) => {
    if (activeAudioElement) {
      activeAudioElement.pause();
      setActiveAudioElement(null);
      setPlayingAudioId(null);
    }
    setSelectedSong(song);
    soundFx.playScratch();
  };

  const handleToggleAudioPreview = (song: Song) => {
    if (playingAudioId === song.id && activeAudioElement) {
      activeAudioElement.pause();
      setActiveAudioElement(null);
      setPlayingAudioId(null);
      return;
    }

    if (activeAudioElement) {
      activeAudioElement.pause();
    }

    if (song.previewUrl) {
      const audio = new Audio(song.previewUrl);
      audio.play();
      setActiveAudioElement(audio);
      setPlayingAudioId(song.id);
      audio.onended = () => {
        setPlayingAudioId(null);
        setActiveAudioElement(null);
      };
    } else {
      soundFx.playScratch();
      setPlayingAudioId(song.id);
      setTimeout(() => setPlayingAudioId(null), 4000);
    }
  };

  const handlePaymentSuccess = (paymentMethod: PaymentMethodType) => {
    if (!selectedSong) return;

    const total = calculateTotalCOP();

    onSubmitRequest({
      song: selectedSong,
      userName: userName || 'Cliente Anónimo',
      tableNumber: tableNumber || 'Mesa General',
      priority: {
        ...selectedPriority,
        priceCOP: getBasePriceCOP(selectedPriority.id)
      },
      tipAmountCOP: extraTipCOP,
      totalPaidCOP: total,
      paymentMethod,
      dedicatedMessage: dedicatedMessage.trim() ? dedicatedMessage : undefined,
    });

    setIsNequiModalOpen(false);
    setSelectedSong(null);
    setDedicatedMessage('');
    setActiveTab('my_requests');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      
      {/* Top Ultra-Attractive Party Banner (No Payment Method mentions in Title) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-900/50 via-pink-900/40 to-slate-900/90 border border-purple-500/40 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-pink-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-black text-pink-400 uppercase tracking-widest mb-1.5">
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" /> Conectado en Vivo a {ownerConfig.clubName}
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
              ¡Haz que la fiesta suene <span className="text-gradient-neon">a tu ritmo!</span> 🔥
            </h2>
            <p className="text-sm text-slate-200 mt-1.5 font-medium leading-relaxed">
              Elige tu canción favorita, enlázala directo a la cabina del DJ y proyecta tu dedicatoria en las pantallas del club 🪩✨
            </p>
          </div>

          {/* Customer Tabs Switcher */}
          <div className="flex items-center bg-black/50 p-1.5 rounded-2xl border border-white/10 w-full sm:w-auto overflow-x-auto flex-shrink-0">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === 'catalog'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🎵 Catálogo
            </button>
            <button
              onClick={() => setActiveTab('my_requests')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === 'my_requests'
                  ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Radio className="w-3.5 h-3.5 animate-pulse text-pink-300" />
              <span>Mis Pedidos</span>
              {userRequests.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-[10px]">
                  {userRequests.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('stage_screen')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === 'stage_screen'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-600/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Tv className="w-3.5 h-3.5 text-cyan-300" />
              <span>🪩 Pantalla Club</span>
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'catalog' && (
        <>
          {/* Search bar & Live Web API indicator */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Busca cualquier canción en vivo (Ej: Feid, Bad Bunny, Karol G, Pepas...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-12 py-3.5 rounded-2xl bg-[#12121e] border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 text-sm font-medium transition-all shadow-inner"
              />
              {isSearchingWeb ? (
                <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-pink-400 animate-spin" />
              ) : searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : null}
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {genresList.map((genre) => (
                <button
                  key={genre}
                  onClick={() => setSelectedGenre(genre)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedGenre === genre
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                      : 'bg-[#141422] text-slate-400 hover:text-white border border-white/5'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          {/* Song Grid */}
          {displayedSongs.length === 0 && !isSearchingWeb ? (
            <div className="p-12 text-center text-slate-400 glass-panel rounded-3xl space-y-2">
              <Music className="w-10 h-10 mx-auto opacity-40 animate-bounce" />
              <p className="font-bold text-white">No se encontraron canciones</p>
              <p className="text-xs text-slate-400">Intenta escribiendo el nombre de tu artista favorito en el buscador.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayedSongs.map((song) => (
                <div
                  key={song.id}
                  className="glass-panel rounded-2xl p-4 flex items-center justify-between gap-4 glass-card-hover border border-white/5 group"
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={song.albumCover}
                      alt={song.title}
                      className="w-16 h-16 rounded-xl object-cover shadow-md group-hover:scale-105 transition-transform"
                    />
                    <button
                      onClick={() => handleToggleAudioPreview(song)}
                      className={`absolute inset-0 rounded-xl flex items-center justify-center transition-all ${
                        playingAudioId === song.id
                          ? 'bg-pink-600/80 text-white'
                          : 'bg-black/40 opacity-0 group-hover:opacity-100 text-white hover:bg-black/60'
                      }`}
                      title="Escuchar 30s de vista previa real"
                    >
                      {playingAudioId === song.id ? (
                        <VolumeX className="w-6 h-6 animate-pulse text-white" />
                      ) : (
                        <Volume2 className="w-6 h-6 text-white" />
                      )}
                    </button>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white text-base truncate group-hover:text-pink-300 transition-colors">
                        {song.title}
                      </h3>
                      {song.isExplicit && (
                        <span className="px-1.5 py-0.2 text-[9px] font-black uppercase rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          EXPLICIT
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{song.artist}</p>

                    <div className="flex items-center gap-2 mt-2 text-[11px]">
                      <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 font-semibold border border-purple-500/20">
                        {song.genre}
                      </span>
                      <span className="text-slate-400 font-mono">{song.bpm} BPM</span>
                      {song.previewUrl && (
                        <span className="text-[10px] text-cyan-400 font-bold flex items-center gap-0.5">
                          <Volume2 className="w-3 h-3" /> Audio 30s
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenOrderModal(song)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 flex-shrink-0 active:scale-95 transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Pedir</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'my_requests' && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Radio className="w-5 h-5 text-pink-400 animate-pulse" />
            <span>Mis Solicitudes de Música</span>
          </h3>

          {userRequests.length === 0 ? (
            <div className="glass-panel rounded-3xl p-8 text-center space-y-2 border border-white/10">
              <Music className="w-10 h-10 text-slate-600 mx-auto animate-bounce" />
              <p className="text-white font-bold">Aún no has solicitado ninguna canción</p>
              <p className="text-slate-400 text-xs">Busca tu tema favorito y envíalo con Nequi o Bancolombia.</p>
            </div>
          ) : (
            userRequests.map((req) => (
              <div key={req.id} className="glass-panel-neon rounded-3xl p-5 border border-purple-500/30 space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img src={req.song.albumCover} alt={req.song.title} className="w-14 h-14 rounded-2xl object-cover" />
                    <div>
                      <h4 className="font-bold text-white text-base">{req.song.title}</h4>
                      <p className="text-xs text-slate-400">{req.song.artist} • ${req.totalPaidCOP.toLocaleString('es-CO')} COP</p>
                    </div>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                    req.status === 'playing' ? 'bg-pink-500 text-white animate-pulse' : 'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    {req.status === 'pending' && '⏳ Esperando DJ'}
                    {req.status === 'accepted' && '✅ Aprobado'}
                    {req.status === 'sent_to_vdj' && '⚡ En VirtualDJ'}
                    {req.status === 'playing' && '🎵 SONANDO AHORA'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'stage_screen' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Tv className="w-5 h-5 text-cyan-400 animate-pulse" />
              <span>Pantalla en Vivo del Club</span>
            </h3>
            <span className="text-xs text-slate-400">Transmisión en tiempo real</span>
          </div>

          <StageScreenView requests={userRequests.length > 0 ? userRequests : []} />
        </div>
      )}

      {/* REQUEST MODAL */}
      {selectedSong && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg glass-panel-neon rounded-3xl p-6 border border-purple-500/40 space-y-5 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold text-pink-400 uppercase tracking-widest">
                  Programar Canción al DJ
                </span>
                <h3 className="text-xl font-extrabold text-white">{selectedSong.title}</h3>
                <p className="text-xs text-slate-300">{selectedSong.artist}</p>
              </div>
              <button onClick={() => setSelectedSong(null)} className="p-1.5 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Form */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Tu Nombre</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs font-semibold outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Mesa / Ubicación</label>
                <input
                  type="text"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs font-semibold outline-none"
                />
              </div>
            </div>

            {/* Priority Option Selector */}
            {ownerConfig.pricingMode === 'flat_single' ? (
              <div className="p-4 rounded-2xl bg-purple-900/30 border border-purple-500/40 text-center space-y-1">
                <span className="text-xs font-bold text-purple-300 uppercase">Tarifa Única Fija del Club</span>
                <div className="text-2xl font-extrabold text-white">
                  ${ownerConfig.flatSinglePriceCOP.toLocaleString('es-CO')} COP
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {INITIAL_PRIORITY_OPTIONS.map((priority) => {
                  const price = getBasePriceCOP(priority.id);
                  return (
                    <div
                      key={priority.id}
                      onClick={() => setSelectedPriority(priority)}
                      className={`p-3.5 rounded-2xl border cursor-pointer flex items-center justify-between ${
                        selectedPriority.id === priority.id
                          ? 'bg-purple-900/40 border-purple-500 ring-2 ring-purple-500/30'
                          : 'bg-slate-900/60 border-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white bg-gradient-to-tr ${priority.color}`}>
                          {priority.id === 'play_now' ? <Flame className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-sm">{priority.name}</h4>
                          <p className="text-xs text-slate-400">{priority.tagline}</p>
                        </div>
                      </div>

                      <span className="font-black text-white text-base font-mono">
                        ${price.toLocaleString('es-CO')} COP
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Extra Tip Slider */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-300 uppercase">Propina Extra (COP)</label>
                <span className="text-xs font-bold text-amber-400">+${extraTipCOP.toLocaleString('es-CO')} COP</span>
              </div>
              <div className="flex items-center gap-2">
                {[0, 2000, 5000, 10000, 20000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setExtraTipCOP(amt)}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold ${
                      extraTipCOP === amt ? 'bg-amber-500 text-black' : 'bg-slate-900 text-slate-400'
                    }`}
                  >
                    {amt === 0 ? 'Sin tip' : `+$${amt / 1000}k`}
                  </button>
                ))}
              </div>
            </div>

            {/* Dedicated Message Input */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                Dedicatoria para Pantallas del Club
              </label>
              <input
                type="text"
                maxLength={70}
                value={dedicatedMessage}
                onChange={(e) => setDedicatedMessage(e.target.value)}
                placeholder="Ej: ¡Salud por el cumple de Mafe! 🎉"
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs outline-none"
              />
            </div>

            {/* Proceed to Payment Button */}
            <div className="pt-3 border-t border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Total a Pagar:</span>
                <span className="text-2xl font-extrabold text-white text-gradient-gold">
                  ${calculateTotalCOP().toLocaleString('es-CO')} COP
                </span>
              </div>

              <button
                onClick={() => setIsNequiModalOpen(true)}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-pink-600 via-purple-600 to-amber-500 text-white font-extrabold text-sm shadow-xl shadow-pink-600/40 flex items-center justify-center gap-2"
              >
                <Smartphone className="w-5 h-5" />
                <span>Enviar Canción y Pagar por QR</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* NEQUI / BANCOLOMBIA QR PAYMENT MODAL */}
      {selectedSong && (
        <NequiBancolombiaPaymentModal
          isOpen={isNequiModalOpen}
          song={selectedSong}
          priority={selectedPriority}
          extraTipCOP={extraTipCOP}
          totalCOP={calculateTotalCOP()}
          userName={userName}
          tableNumber={tableNumber}
          dedicatedMessage={dedicatedMessage}
          ownerConfig={ownerConfig}
          onClose={() => setIsNequiModalOpen(false)}
          onConfirmSuccess={handlePaymentSuccess}
        />
      )}

      {/* Subtle Developer Contact Footer */}
      <footer className="pt-8 pb-4 border-t border-white/5 text-center text-[11px] text-slate-500 font-medium space-y-1">
        <p>
          Desarrollado por <strong className="text-slate-300">BeatPulse DJ Platform</strong>
        </p>
        <p className="flex items-center justify-center gap-1">
          <PhoneCall className="w-3 h-3 text-pink-400" />
          <span>Soporte / Contacto Desarrollador:</span>
          <a
            href="https://wa.me/573227949751"
            target="_blank"
            rel="noopener noreferrer"
            className="text-pink-400 font-bold hover:underline ml-0.5"
          >
            +57 322 794 9751
          </a>
        </p>
      </footer>

    </div>
  );
};
