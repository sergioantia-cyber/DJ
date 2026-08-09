import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Play,
  Volume2,
  DollarSign,
  Disc3,
  Cable,
  Check,
  Bell,
  AlertTriangle,
  Music
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
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [rejectionModalReqId, setRejectionModalReqId] = useState<string | null>(null);

  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const activeRequests = requests.filter((r) => r.status === 'accepted' || r.status === 'sent_to_vdj');

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

  const handleAccept = (req: SongRequest) => {
    soundFx.playScratch();
    onUpdateRequestStatus(req.id, 'sent_to_vdj');
  };

  const handleSetPlaying = (req: SongRequest) => {
    soundFx.playBassDrop();
    onUpdateRequestStatus(req.id, 'playing');
  };

  const handleConfirmReject = (reason: string) => {
    if (!rejectionModalReqId) return;
    onUpdateRequestStatus(rejectionModalReqId, 'rejected', reason);
    setRejectionModalReqId(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      
      {/* Top DJ Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* DJ Share Net Earned (10%) */}
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

        {/* VirtualDJ Status */}
        <div className="glass-panel rounded-2xl p-5 border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">VirtualDJ Software</span>
            <div className="text-base font-bold text-white mt-1 flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${vdjConfig.connected ? 'bg-emerald-400 animate-ping' : 'bg-rose-500'}`}></span>
              <span className={vdjConfig.connected ? 'text-emerald-400' : 'text-rose-400'}>
                {vdjConfig.connected ? 'CONECTADO' : 'OFFLINE'}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 font-mono">Puerto: localhost:{vdjConfig.port}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Cable className="w-6 h-6" />
          </div>
        </div>

        {/* Auto Accept Switch */}
        <div className="glass-panel rounded-2xl p-5 border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Auto-Aceptar Ofertas</span>
            <div className="text-xs font-bold text-slate-200 mt-1">
              Si pago {'>='} ${vdjConfig.autoAcceptThresholdCOP.toLocaleString('es-CO')} COP
            </div>
            <p className="text-[10px] text-purple-300 mt-1">Envía directo a VirtualDJ</p>
          </div>
          <button
            onClick={onToggleAutoAccept}
            className={`w-12 h-7 rounded-full p-1 transition-colors ${
              vdjConfig.autoSyncToAutomix ? 'bg-purple-600' : 'bg-slate-700'
            }`}
          >
            <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
              vdjConfig.autoSyncToAutomix ? 'translate-x-5' : 'translate-x-0'
            }`}></div>
          </button>
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

      {/* Main Request Queue Deck */}
      <div className="glass-panel-neon rounded-3xl p-6 border border-purple-500/30 space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Disc3 className="w-7 h-7 text-pink-400 animate-spin-slow" />
            <div>
              <h3 className="text-xl font-extrabold text-white">Cola de Pedidos Nequi / Bancolombia</h3>
              <p className="text-xs text-slate-400">Aprueba o envía directo a la lista Automix de VirtualDJ</p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10 overflow-x-auto">
            {[
              { id: 'all', label: 'Todos' },
              { id: 'pending', label: 'Pendientes' },
              { id: 'active', label: 'En Cola VDJ' },
              { id: 'playing', label: 'Sonando' },
              { id: 'rejected', label: 'Rechazados' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filterStatus === tab.id ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          {filteredRequests.map((req) => (
            <div
              key={req.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                req.status === 'playing'
                  ? 'bg-pink-950/30 border-pink-500/60 shadow-lg shadow-pink-500/20'
                  : 'bg-[#12121e] border-white/10'
              }`}
            >
              <div className="flex items-center gap-4 min-w-0">
                <img src={req.song.albumCover} alt={req.song.title} className="w-16 h-16 rounded-xl object-cover" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-500/20 text-purple-300">
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

              <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                {req.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleAccept(req)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow-lg"
                    >
                      <Check className="w-4 h-4" />
                      <span>Aceptar & VDJ</span>
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
                    onClick={() => handleSetPlaying(req)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-xs flex items-center gap-1.5"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Poner a Sonar</span>
                  </button>
                )}

                {req.status === 'playing' && (
                  <span className="px-3 py-1.5 rounded-xl bg-pink-500 text-white font-extrabold text-xs animate-pulse">
                    SONANDO AHORA
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

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
