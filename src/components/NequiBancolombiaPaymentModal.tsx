import React, { useState, useEffect } from 'react';
import {
  QrCode,
  Smartphone,
  CreditCard,
  X,
  Copy,
  Check,
  Sparkles,
  Clock,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Song, PriorityOption, PaymentMethodType, OwnerConfig } from '../types';
import { soundFx } from '../services/soundEffects';

interface NequiBancolombiaPaymentModalProps {
  isOpen: boolean;
  song: Song;
  priority: PriorityOption;
  extraTipCOP: number;
  totalCOP: number;
  userName: string;
  tableNumber: string;
  dedicatedMessage?: string;
  ownerConfig: OwnerConfig;
  onClose: () => void;
  onConfirmSuccess: (paymentMethod: PaymentMethodType) => void;
}

export const NequiBancolombiaPaymentModal: React.FC<NequiBancolombiaPaymentModalProps> = ({
  isOpen,
  song,
  priority,
  extraTipCOP,
  totalCOP,
  userName,
  tableNumber,
  dedicatedMessage,
  ownerConfig,
  onClose,
  onConfirmSuccess,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>('nequi_qr');
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(180); // 3 minutes

  useEffect(() => {
    if (!isOpen) return;
    setTimeLeftSeconds(180);
    const interval = setInterval(() => {
      setTimeLeftSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyNequi = () => {
    navigator.clipboard.writeText(ownerConfig.nequiPhone.replace(/\s+/g, ''));
    setCopiedPhone(true);
    soundFx.playCoinChime();
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const handleConfirmBtn = () => {
    setIsVerifying(true);
    soundFx.playCoinChime();

    setTimeout(() => {
      setIsVerifying(false);
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#8b5cf6', '#ec4899', '#06b6d4', '#f59e0b']
      });

      if (priority.id === 'play_now') {
        soundFx.playBassDrop();
      }

      onConfirmSuccess(selectedMethod);
    }, 1400);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg glass-panel-neon rounded-3xl p-6 border border-pink-500/40 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[10px] font-black text-pink-400 uppercase tracking-widest block">
              Pago Directo por QR • Nequi & Bancolombia
            </span>
            <h3 className="text-xl font-extrabold text-white">Escanea o Transfiere para Pedir</h3>
            <p className="text-xs text-slate-300">{song.title} • {userName} ({tableNumber})</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch between Nequi and Bancolombia */}
        <div className="flex items-center bg-black/40 p-1.5 rounded-2xl border border-white/10">
          <button
            onClick={() => {
              setSelectedMethod('nequi_qr');
              soundFx.playScratch();
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              selectedMethod === 'nequi_qr'
                ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md shadow-pink-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4 text-pink-300" />
            <span>Nequi QR / Celular</span>
          </button>

          <button
            onClick={() => {
              setSelectedMethod('bancolombia_qr');
              soundFx.playScratch();
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              selectedMethod === 'bancolombia_qr'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md shadow-amber-500/30 font-extrabold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CreditCard className="w-4 h-4 text-amber-900" />
            <span>Bancolombia QR</span>
          </button>
        </div>

        {/* Total Amount Badge */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/60 to-pink-950/60 border border-purple-500/30 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Valor Total a Transferir</span>
            <span className="text-2xl font-black text-white text-gradient-gold">
              ${totalCOP.toLocaleString('es-CO')} COP
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-pink-300">
            <Clock className="w-3.5 h-3.5 animate-spin" />
            <span>Expira en {formatTime(timeLeftSeconds)}</span>
          </div>
        </div>

        {/* QR Code Container & Transfer Details */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 flex flex-col items-center text-center space-y-3">
          
          {selectedMethod === 'nequi_qr' ? (
            <>
              {/* Nequi QR Code */}
              <div className="relative p-3 bg-white rounded-2xl shadow-xl border-4 border-pink-500/50">
                <img
                  src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=nequi://pay?phone=3001234567"
                  alt="Nequi QR Code"
                  className="w-40 h-40 object-contain"
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="px-2 py-0.5 rounded bg-pink-600 text-white font-black text-[9px] uppercase shadow">
                    NEQUI
                  </span>
                </div>
              </div>

              <div className="w-full space-y-1">
                <span className="text-[11px] text-slate-400 font-bold block uppercase">
                  O Envía por Nequi al número:
                </span>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-lg font-extrabold text-white font-mono">{ownerConfig.nequiPhone}</span>
                  <button
                    onClick={handleCopyNequi}
                    className="p-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/40 text-xs font-bold flex items-center gap-1"
                  >
                    {copiedPhone ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedPhone ? '¡Copiado!' : 'Copiar'}</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Bancolombia QR Code */}
              <div className="relative p-3 bg-white rounded-2xl shadow-xl border-4 border-amber-500/50">
                <img
                  src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=bancolombia://pay?acc=03198765421"
                  alt="Bancolombia QR Code"
                  className="w-40 h-40 object-contain"
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="px-2 py-0.5 rounded bg-amber-500 text-black font-black text-[9px] uppercase shadow">
                    BANCOLOMBIA
                  </span>
                </div>
              </div>

              <div className="w-full space-y-1">
                <span className="text-[11px] text-slate-400 font-bold block uppercase">
                  Cuenta Ahorros Bancolombia:
                </span>
                <span className="text-base font-extrabold text-white font-mono block">
                  {ownerConfig.bancolombiaAcc}
                </span>
              </div>
            </>
          )}

          <p className="text-[11px] text-slate-300 leading-snug pt-1">
            Una vez realizada la transferencia desde tu app de {selectedMethod === 'nequi_qr' ? 'Nequi' : 'Bancolombia'}, haz clic en el botón de abajo para confirmar.
          </p>

        </div>

        {/* Confirmation Button */}
        <div className="space-y-2">
          <button
            disabled={isVerifying}
            onClick={handleConfirmBtn}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-500 hover:opacity-95 text-white font-extrabold text-sm shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 transition-transform active:scale-98"
          >
            {isVerifying ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Verificando Transferencia con Nequi / Bancolombia...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-5 h-5 text-emerald-300" />
                <span>Ya Hice la Transferencia de ${totalCOP.toLocaleString('es-CO')} COP</span>
              </>
            )}
          </button>

          <p className="text-[10px] text-slate-400 text-center flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Al confirmar, la canción se enviará directo a la cabina de VirtualDJ</span>
          </p>
        </div>

      </div>
    </div>
  );
};
