import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  Sliders,
  ShieldCheck,
  Percent,
  Smartphone,
  CreditCard,
  QrCode,
  Printer,
  CheckCircle2,
  AlertCircle,
  Building,
  Edit3,
  Save,
  Lock,
  Music
} from 'lucide-react';
import { OwnerConfig, SongRequest } from '../types';
import { soundFx } from '../services/soundEffects';

interface OwnerDashboardViewProps {
  ownerConfig: OwnerConfig;
  onUpdateOwnerConfig: (newConfig: Partial<OwnerConfig>) => void;
  requests: SongRequest[];
  onOpenTermsModal: () => void;
}

export const OwnerDashboardView: React.FC<OwnerDashboardViewProps> = ({
  ownerConfig,
  onUpdateOwnerConfig,
  requests,
  onOpenTermsModal,
}) => {
  const [selectedTableForQR, setSelectedTableForQR] = useState<string>('Mesa 12 (Zona VIP)');
  const [isEditingPrices, setIsEditingPrices] = useState<boolean>(false);

  // Form states for prices
  const [flatPrice, setFlatPrice] = useState<number>(ownerConfig.flatSinglePriceCOP);
  const [normalPrice, setNormalPrice] = useState<number>(ownerConfig.tieredPricesCOP.normal);
  const [vipPrice, setVipPrice] = useState<number>(ownerConfig.tieredPricesCOP.vip);
  const [playNowPrice, setPlayNowPrice] = useState<number>(ownerConfig.tieredPricesCOP.play_now);

  // Form states for Nequi / Bancolombia
  const [nequiPhone, setNequiPhone] = useState<string>(ownerConfig.nequiPhone);
  const [bancolombiaAcc, setBancolombiaAcc] = useState<string>(ownerConfig.bancolombiaAcc);

  // Calculations for total revenue & revenue splits (COP)
  const validRequests = requests.filter((r) => r.status !== 'rejected');
  const totalRevenueCOP = validRequests.reduce((sum, r) => sum + r.totalPaidCOP, 0);

  const platformFeeTotalCOP = totalRevenueCOP * (ownerConfig.platformFeePercent / 100); // 20%
  const djShareTotalCOP = totalRevenueCOP * (ownerConfig.djSharePercent / 100);          // 10%
  const clubShareTotalCOP = totalRevenueCOP * (ownerConfig.clubSharePercent / 100);      // 70%

  const handleSavePrices = () => {
    onUpdateOwnerConfig({
      flatSinglePriceCOP: Number(flatPrice) || 15000,
      tieredPricesCOP: {
        normal: Number(normalPrice) || 10000,
        vip: Number(vipPrice) || 25000,
        play_now: Number(playNowPrice) || 60000,
      },
      nequiPhone,
      bancolombiaAcc,
    });
    setIsEditingPrices(false);
    soundFx.playCoinChime();
  };

  const handleTogglePricingMode = (mode: 'tiered' | 'flat_single') => {
    onUpdateOwnerConfig({ pricingMode: mode });
    soundFx.playScratch();
  };

  const handlePrintQR = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      
      {/* Terms & Conditions Notice Card */}
      {!ownerConfig.hasAcceptedTerms ? (
        <div className="glass-panel-neon p-6 rounded-3xl border border-amber-500/40 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-amber-400 flex-shrink-0 animate-bounce" />
            <div>
              <h3 className="font-extrabold text-white text-lg">Acuerdo de Términos y Condiciones Pendiente</h3>
              <p className="text-xs text-slate-300">
                Para operar en la discoteca debes revisar y aceptar la distribución: <strong>20% Desarrollador, 10% DJ y 70% Discoteca</strong>.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenTermsModal}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/30 flex-shrink-0"
          >
            Ver y Aceptar Términos Legales
          </button>
        </div>
      ) : (
        <div className="glass-panel p-4 rounded-2xl border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Términos Firmados el {ownerConfig.acceptedTermsDate || 'Hoy'}</span>
          </div>
          <span className="font-bold text-amber-400">Distribución: 20% App | 10% DJ | 70% Discoteca</span>
        </div>
      )}

      {/* Revenue Split Financial Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Recaudado Noche */}
        <div className="glass-panel-neon rounded-3xl p-5 border border-purple-500/30 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Recaudado Noche</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            ${totalRevenueCOP.toLocaleString('es-CO')} <span className="text-xs font-normal text-slate-400">COP</span>
          </div>
          <p className="text-[10px] text-slate-400">{validRequests.length} pedidos procesados</p>
        </div>

        {/* 70% Club Owner Net Revenue */}
        <div className="glass-panel rounded-3xl p-5 border border-cyan-500/30 space-y-1 bg-cyan-950/10">
          <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
            <Building className="w-3.5 h-3.5" /> Tu Ganancia Discoteca (70%)
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-cyan-300">
            ${clubShareTotalCOP.toLocaleString('es-CO')} <span className="text-xs font-normal text-slate-400">COP</span>
          </div>
          <p className="text-[10px] text-cyan-400/80">Neto para la cuenta del club</p>
        </div>

        {/* 20% App Developer Platform Fee */}
        <div className="glass-panel rounded-3xl p-5 border border-amber-500/30 space-y-1 bg-amber-950/10">
          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
            <Percent className="w-3.5 h-3.5" /> Desarrollador App (20%)
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-300">
            ${platformFeeTotalCOP.toLocaleString('es-CO')} <span className="text-xs font-normal text-slate-400">COP</span>
          </div>
          <p className="text-[10px] text-amber-400/80">Retención automática de software</p>
        </div>

        {/* 10% DJ Share */}
        <div className="glass-panel rounded-3xl p-5 border border-purple-500/30 space-y-1">
          <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1">
            <Music className="w-3.5 h-3.5" /> Cabina del DJ (10%)
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-purple-300">
            ${djShareTotalCOP.toLocaleString('es-CO')} <span className="text-xs font-normal text-slate-400">COP</span>
          </div>
          <p className="text-[10px] text-purple-300/80">Pago asignado al DJ</p>
        </div>

      </div>

      {/* Customizable Pricing Strategy & Nequi / Bancolombia Setup */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Pricing Strategy Manager */}
        <div className="lg:col-span-7 glass-panel-neon rounded-3xl p-6 border border-purple-500/30 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-pink-400" />
              <h3 className="text-lg font-extrabold text-white">Configuración de Tarifas (Modificables en COP)</h3>
            </div>
            {!isEditingPrices ? (
              <button
                onClick={() => setIsEditingPrices(true)}
                className="px-3.5 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/40 text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <Edit3 className="w-4 h-4" />
                <span>Editar Precios</span>
              </button>
            ) : (
              <button
                onClick={handleSavePrices}
                className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Guardar Cambios</span>
              </button>
            )}
          </div>

          {/* Pricing Mode Switcher */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Modo de Cobro a los Clientes
            </span>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleTogglePricingMode('tiered')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  ownerConfig.pricingMode === 'tiered'
                    ? 'bg-purple-900/40 border-purple-500 text-white ring-2 ring-purple-500/30'
                    : 'bg-slate-900 border-white/5 text-slate-400'
                }`}
              >
                <span className="font-bold text-xs block text-white">Modo Tarifas por Nivel</span>
                <span className="text-[10px] text-slate-400">Normal, VIP Boost y Play Next</span>
              </button>

              <button
                onClick={() => handleTogglePricingMode('flat_single')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  ownerConfig.pricingMode === 'flat_single'
                    ? 'bg-pink-900/40 border-pink-500 text-white ring-2 ring-pink-500/30'
                    : 'bg-slate-900 border-white/5 text-slate-400'
                }`}
              >
                <span className="font-bold text-xs block text-white">Modo Tarifa Única Fija</span>
                <span className="text-[10px] text-slate-400">Mismo valor para cualquier canción</span>
              </button>
            </div>
          </div>

          {/* Inputs */}
          {ownerConfig.pricingMode === 'flat_single' ? (
            <div className="p-4 rounded-2xl bg-slate-900 border border-white/10 space-y-2">
              <label className="block text-xs font-bold text-slate-300">
                Precio Único Fijo por Canción ($ COP)
              </label>
              <input
                type="number"
                disabled={!isEditingPrices}
                value={flatPrice}
                onChange={(e) => setFlatPrice(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-black border border-white/10 text-white font-mono text-base font-extrabold outline-none focus:border-pink-500 disabled:opacity-60"
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-white/10 space-y-1">
                <label className="block text-[11px] font-bold text-slate-400 uppercase">🥉 Cola Normal</label>
                <input
                  type="number"
                  disabled={!isEditingPrices}
                  value={normalPrice}
                  onChange={(e) => setNormalPrice(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-xl bg-black border border-white/10 text-white font-mono text-sm font-bold outline-none focus:border-purple-500 disabled:opacity-60"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900 border border-white/10 space-y-1">
                <label className="block text-[11px] font-bold text-purple-400 uppercase">🥈 VIP 15 min</label>
                <input
                  type="number"
                  disabled={!isEditingPrices}
                  value={vipPrice}
                  onChange={(e) => setVipPrice(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-xl bg-black border border-white/10 text-white font-mono text-sm font-bold outline-none focus:border-purple-500 disabled:opacity-60"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900 border border-white/10 space-y-1">
                <label className="block text-[11px] font-bold text-amber-400 uppercase">🥇 PLAY NEXT NOW</label>
                <input
                  type="number"
                  disabled={!isEditingPrices}
                  value={playNowPrice}
                  onChange={(e) => setPlayNowPrice(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-xl bg-black border border-white/10 text-white font-mono text-sm font-bold outline-none focus:border-amber-500 disabled:opacity-60"
                />
              </div>
            </div>
          )}

          {/* Nequi & Bancolombia Account Numbers */}
          <div className="pt-2 border-t border-white/10 space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">
              Datos de Recaudo Nequi y Bancolombia del Club
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-pink-400 mb-1">Número Celular Nequi</label>
                <input
                  type="text"
                  disabled={!isEditingPrices}
                  value={nequiPhone}
                  onChange={(e) => setNequiPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs font-mono font-bold outline-none focus:border-pink-500 disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-amber-400 mb-1">Cuenta Bancolombia</label>
                <input
                  type="text"
                  disabled={!isEditingPrices}
                  value={bancolombiaAcc}
                  onChange={(e) => setBancolombiaAcc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs font-mono font-bold outline-none focus:border-amber-500 disabled:opacity-60"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Printable Table QR Code Generator */}
        <div className="lg:col-span-5 glass-panel rounded-3xl p-6 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-cyan-400" />
              <h3 className="font-extrabold text-white text-base">Generador de QRs para Mesas</h3>
            </div>
            <button
              onClick={handlePrintQR}
              className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-600/30 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir QR</span>
            </button>
          </div>

          <p className="text-xs text-slate-300">
            Imprime este acrílico con código QR para colocar en mesas o barra VIP.
          </p>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
              Seleccionar Mesa / Zona:
            </label>
            <select
              value={selectedTableForQR}
              onChange={(e) => setSelectedTableForQR(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs font-bold outline-none"
            >
              <option value="Mesa 12 (Zona VIP)">Mesa 12 (Zona VIP)</option>
              <option value="Mesa 04 (Pista Central)">Mesa 04 (Pista Central)</option>
              <option value="Barra Principal 1">Barra Principal 1</option>
              <option value="Terraza VIP 02">Terraza VIP 02</option>
            </select>
          </div>

          <div className="p-6 bg-gradient-to-b from-slate-950 to-slate-900 rounded-2xl border-2 border-purple-500/40 text-center space-y-3 shadow-2xl printable-card">
            <span className="text-[10px] font-black tracking-widest uppercase text-pink-400 block">
              {ownerConfig.clubName}
            </span>
            <h4 className="text-lg font-black text-white">¿Quieres escuchar tu canción?</h4>
            
            <div className="w-40 h-40 mx-auto bg-white p-2.5 rounded-2xl shadow-xl flex items-center justify-center">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=https://beatpulse.club/request?table=${encodeURIComponent(selectedTableForQR)}`}
                alt="Table QR Code"
                className="w-full h-full object-contain"
              />
            </div>

            <span className="text-xs font-extrabold text-amber-400 block">{selectedTableForQR}</span>
            <p className="text-[10px] text-slate-400">Escanea con tu cámara • Paga fácil con Nequi o Bancolombia</p>
          </div>

        </div>

      </div>

    </div>
  );
};
