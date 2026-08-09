import React, { useState, useEffect } from 'react';
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
  Send
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
}

export const ClientView: React.FC<ClientViewProps> = ({
  songs,
  userRequests,
  ownerConfig,
  onSubmitRequest,
}) => {
  const deviceId = getOrCreateDeviceId();

  const [activeSubTab, setActiveSubTab] = useState<'request' | 'history'>('request');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<PriorityOption>(INITIAL_PRIORITY_OPTIONS[0]);

  // Form Fields
  const [userName, setUserName] = useState<string>('');
  const [tableNumber, setTableNumber] = useState<string>('');
  const [dedicatedMessage, setDedicatedMessage] = useState<string>('');
  const [tipAmountCOP, setTipAmountCOP] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'nequi_qr' | 'bancolombia_qr'>('nequi_qr');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccessMsg, setSubmitSuccessMsg] = useState<string>('');

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
    const deviceRequests = userRequests.filter((r) => r.deviceId === deviceId || r.userName === userName);
    for (const r of deviceRequests) {
      if (r && r.id) map.set(r.id, r);
    }

    return Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  }, [localMyHistory, userRequests, deviceId, userName]);

  const totalCostCOP = (selectedPriority?.priceCOP || 10000) + tipAmountCOP;

  const handleSelectSong = (song: Song) => {
    setSelectedSong(song);
    soundFx.playCoinChime();
  };

  const handleSubmitRequestForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSong) return;

    setIsSubmitting(true);

    const newReqData = {
      deviceId,
      song: selectedSong,
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
    setSubmitSuccessMsg('¡Tu canción ha sido enviada a la cabina del DJ! Confirma la transferencia en tu app bancaria.');
    setSelectedSong(null);
    setDedicatedMessage('');
    setTipAmountCOP(0);
    setActiveSubTab('history');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      
      {/* Party Banner Header */}
      <div className="glass-panel-neon p-6 rounded-3xl border border-purple-500/40 relative overflow-hidden text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30 text-xs font-bold uppercase tracking-wider">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>Música en Vivo • Club Ibiza</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Pide tu Canción y Dedícala en la Pantalla del Club
          </h2>
          <p className="text-xs text-slate-300 max-w-lg">
            Selecciona tu éxito musical favorito, ingresa tu mensaje de dedicatoria y sonará en los altavoces de la discoteca.
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

      {submitSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span>{submitSuccessMsg}</span>
          </div>
          <button onClick={() => setSubmitSuccessMsg('')} className="text-emerald-400 hover:text-white font-bold ml-2">
            ✕
          </button>
        </div>
      )}

      {/* SUBTAB 1: REQUEST A SONG FORM */}
      {activeSubTab === 'request' && (
        <div className="space-y-6">
          
          {/* Step 1: Search Music */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <span>1. Busca tu Canción Favorita</span>
                {isSearchingiTunes && <RefreshCw className="w-4 h-4 text-pink-400 animate-spin" />}
              </h3>
            </div>

            <div className="relative">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Busca por nombre de canción o artista (ej: Farruko, Bad Bunny, Karol G)..."
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
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-gradient-to-r from-purple-900/60 to-pink-900/60 border-pink-500 ring-2 ring-pink-500/40 shadow-lg shadow-pink-500/20'
                        : 'bg-[#12121e] border-white/10 hover:border-purple-500/40 hover:bg-slate-900/80'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img src={song.albumCover} alt={song.title} className="w-14 h-14 rounded-xl object-cover shadow-md flex-shrink-0" />
                      <div className="min-w-0">
                        <h4 className="font-bold text-white text-sm truncate">{song.title}</h4>
                        <p className="text-xs text-slate-400 truncate">{song.artist}</p>
                        <span className="text-[10px] text-pink-400 font-semibold">{song.genre}</span>
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      {isSelected ? (
                        <div className="w-7 h-7 rounded-full bg-pink-500 text-white flex items-center justify-center shadow-md">
                          <CheckCircle2 className="w-5 h-5 fill-white text-pink-500" />
                        </div>
                      ) : (
                        <button className="px-3 py-1.5 rounded-xl bg-purple-600/20 text-purple-300 text-xs font-bold hover:bg-purple-600 hover:text-white transition-all">
                          Elegir
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Options when song is selected */}
          {selectedSong && (
            <form onSubmit={handleSubmitRequestForm} className="glass-panel-neon p-6 rounded-3xl border border-purple-500/40 space-y-6 animate-fadeIn">
              
              <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                <img src={selectedSong.albumCover} alt={selectedSong.title} className="w-12 h-12 rounded-xl object-cover" />
                <div>
                  <span className="text-[10px] font-bold text-pink-400 uppercase tracking-widest block">Canción Seleccionada</span>
                  <h4 className="font-extrabold text-white text-base">{selectedSong.title}</h4>
                  <p className="text-xs text-slate-400">{selectedSong.artist}</p>
                </div>
              </div>

              {/* Step 2: Priority Speed Options */}
              <div className="space-y-3">
                <label className="text-xs font-extrabold text-slate-200 uppercase tracking-wider block">
                  2. Elige la Velocidad de Reproducción
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {INITIAL_PRIORITY_OPTIONS.map((prio) => {
                    const isPrioSelected = selectedPriority.id === prio.id;
                    return (
                      <div
                        key={prio.id}
                        onClick={() => setSelectedPriority(prio)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                          isPrioSelected
                            ? 'bg-purple-900/50 border-pink-500 ring-2 ring-pink-500/40 shadow-lg'
                            : 'bg-slate-900/70 border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold text-white">{prio.badge}</span>
                          <span className="text-xs font-mono font-bold text-emerald-400">
                            ${prio.priceCOP.toLocaleString('es-CO')} COP
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300">{prio.tagline}</p>
                        <p className="text-[10px] text-slate-400 font-semibold">⏱ Espera estimada: ~{prio.estimatedWaitMinutes} min</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 3: User Info & Message */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Tu Nombre o Apodo</label>
                  <input
                    type="text"
                    required
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Ej: Carlos / Sofía"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:border-pink-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Número de Mesa o Ubicación</label>
                  <input
                    type="text"
                    required
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    placeholder="Ej: Mesa 12 / Barra Principal"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:border-pink-500 outline-none"
                  />
                </div>
              </div>

              {/* Dedication Message */}
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
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:border-pink-500 outline-none"
                />
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-3 pt-2">
                <label className="text-xs font-extrabold text-slate-200 uppercase tracking-wider block">
                  3. Método de Pago Automático por QR
                </label>

                <div className="grid grid-cols-2 gap-3">
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
              </div>

              {/* Total Summary & Submit Button */}
              <div className="p-4 rounded-2xl bg-black/60 border border-purple-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-slate-400 block">Total a Transferir:</span>
                  <div className="text-2xl font-black text-white">
                    <span className="text-gradient-gold">${totalCostCOP.toLocaleString('es-CO')}</span>
                    <span className="text-xs text-slate-400 font-normal ml-1">COP</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white font-extrabold text-xs shadow-lg shadow-purple-600/40 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Enviar Canción y Pagar</span>
                </button>
              </div>

            </form>
          )}

        </div>
      )}

      {/* SUBTAB 2: MY PROGRAMMED SONGS HISTORY */}
      {activeSubTab === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-200 uppercase tracking-wider">
              Historial de mis Canciones Programadas
            </h3>
            <span className="text-xs font-mono font-bold text-purple-400">ID Dispositivo: {deviceId.substring(0, 14)}...</span>
          </div>

          {myCombinedHistory.length === 0 ? (
            <div className="p-12 text-center text-slate-400 glass-panel rounded-3xl space-y-3 border border-white/10">
              <Music className="w-12 h-12 mx-auto text-purple-400 opacity-40 animate-bounce" />
              <h4 className="text-base font-bold text-white">Aún no has pedido canciones</h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Tus canciones solicitadas y sus dedicatorias quedarán guardadas aquí en tu historial.
              </p>
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
