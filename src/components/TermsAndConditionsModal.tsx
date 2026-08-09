import React, { useState } from 'react';
import { ShieldCheck, Percent, FileText, CheckCircle2, Lock, ArrowRight, Building, Music } from 'lucide-react';
import { soundFx } from '../services/soundEffects';

interface TermsAndConditionsModalProps {
  isOpen: boolean;
  onAccept: () => void;
  clubName: string;
}

export const TermsAndConditionsModal: React.FC<TermsAndConditionsModalProps> = ({
  isOpen,
  onAccept,
  clubName,
}) => {
  const [isChecked, setIsChecked] = useState(false);

  if (!isOpen) return null;

  const handleAcceptBtn = () => {
    if (!isChecked) return;
    soundFx.playCoinChime();
    onAccept();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fadeIn">
      <div className="relative w-full max-w-2xl glass-panel-neon rounded-3xl p-6 sm:p-8 border border-purple-500/40 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center gap-4 border-b border-purple-500/20 pb-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-500 to-amber-500 p-[2px] shadow-xl flex-shrink-0">
            <div className="w-full h-full bg-[#0d0d15] rounded-[14px] flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-8 h-8" />
            </div>
          </div>
          <div>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-black uppercase tracking-widest border border-purple-500/30">
              Acuerdo Legal de Servicio • Discoteca
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-0.5">
              Términos y Condiciones de Distribución de Fondos
            </h2>
            <p className="text-xs text-slate-300">Establecimiento: <strong className="text-white">{clubName}</strong></p>
          </div>
        </div>

        {/* Content Box */}
        <div className="space-y-4 text-xs text-slate-300 leading-relaxed bg-[#0c0c14] p-5 rounded-2xl border border-white/10 max-h-72 overflow-y-auto scrollbar-thin">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <FileText className="w-4 h-4 text-pink-400" />
            <span>Cláusula de Distribución de Ingresos Recaudados (Revenue Split)</span>
          </h3>
          <p>
            Al ingresar y operar la plataforma BeatPulse DJ en su establecimiento nocturno, usted acepta la distribución automática de cada pago de propina o canción solicitada por los clientes a través de Nequi / Bancolombia / Tarjeta:
          </p>

          {/* Graphical percentage split cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-3">
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center space-y-1">
              <span className="text-[10px] font-bold uppercase text-amber-400 block">Desarrollador / App</span>
              <span className="text-3xl font-extrabold text-amber-300">20%</span>
              <p className="text-[10px] text-slate-400">Retención automática para el Creador del Software</p>
            </div>

            <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-center space-y-1">
              <span className="text-[10px] font-bold uppercase text-purple-400 block">Cabina del DJ</span>
              <span className="text-3xl font-extrabold text-purple-300">10%</span>
              <p className="text-[10px] text-slate-400">Comisión fija asignada al DJ en turno</p>
            </div>

            <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-center space-y-1">
              <span className="text-[10px] font-bold uppercase text-cyan-400 block">Dueño de Discoteca</span>
              <span className="text-3xl font-extrabold text-cyan-300">70%</span>
              <p className="text-[10px] text-slate-400">Ingreso neto abonado al propietario del club</p>
            </div>
          </div>

          <h4 className="font-bold text-white mt-3">Cláusula 2: Pagos Directos 100% Digitales</h4>
          <p>
            Los pagos ingresan directamente a la cuenta del club y del sistema mediante transferencia de código QR (Nequi / Bancolombia) desde los teléfonos de los clientes, sin necesidad de contratar personal adicional para cobros en mesa.
          </p>

          <h4 className="font-bold text-white mt-3">Cláusula 3: Gestión de Reprogramación y Reembolsos</h4>
          <p>
            El DJ y la discoteca conservan la facultad de administrar la cola de reproducción en VirtualDJ o rechazar peticiones no aptas. En caso de rechazo, el dinero se devuelve automáticamente al cliente.
          </p>
        </div>

        {/* Acceptance Checkbox */}
        <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30 flex items-start gap-3">
          <input
            type="checkbox"
            id="accept-terms"
            checked={isChecked}
            onChange={(e) => setIsChecked(e.target.checked)}
            className="mt-1 w-5 h-5 rounded bg-slate-900 border-white/20 text-purple-600 focus:ring-purple-500 cursor-pointer"
          />
          <label htmlFor="accept-terms" className="text-xs text-slate-200 cursor-pointer select-none">
            Acepto expresamente los <strong className="text-white">Términos y Condiciones de Servicio</strong>, confirmando la distribución del <strong className="text-amber-400">20% para el Desarrollador</strong>, <strong className="text-purple-400">10% para el DJ</strong> y <strong className="text-cyan-400">70% para el Dueño de la Discoteca</strong> sobre cada transacción generada cada noche.
          </label>
        </div>

        {/* Action Button */}
        <button
          disabled={!isChecked}
          onClick={handleAcceptBtn}
          className={`w-full py-4 rounded-2xl font-extrabold text-sm shadow-xl flex items-center justify-center gap-2 transition-all ${
            isChecked
              ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white hover:opacity-95 shadow-purple-600/40 active:scale-98 cursor-pointer'
              : 'bg-slate-800 text-slate-500 border border-white/5 cursor-not-allowed'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Aceptar Términos e Ingresar al Panel del Dueño</span>
          <ArrowRight className="w-4 h-4" />
        </button>

      </div>
    </div>
  );
};
