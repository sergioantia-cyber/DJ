import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  QrCode,
  Download,
  Copy,
  Check,
  Smartphone,
  Share2,
  ExternalLink,
  X,
  Sparkles,
  Printer,
  Info,
  Layers
} from 'lucide-react';
import { OwnerConfig } from '../types';

interface DownloadableQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  ownerConfig: OwnerConfig;
  onUpdateOwnerConfig?: (updatedFields: Partial<OwnerConfig>) => void;
}

export const DownloadableQRModal: React.FC<DownloadableQRModalProps> = ({
  isOpen,
  onClose,
  ownerConfig,
  onUpdateOwnerConfig,
}) => {
  const [activeTab, setActiveTab] = useState<'qr' | 'instructions' | 'config'>('qr');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [isGeneratingDownload, setIsGeneratingDownload] = useState<boolean>(false);

  // Target URL: Default to current origin or custom APK/App URL
  const currentAppUrl = typeof window !== 'undefined' ? window.location.origin : 'https://dj-phi-ruby.vercel.app';
  const targetUrl = ownerConfig.apkDownloadUrl?.trim() || currentAppUrl;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Render QR Code onto canvas
  useEffect(() => {
    if (!isOpen) return;

    // Give time for modal DOM to mount
    const timer = setTimeout(() => {
      if (canvasRef.current) {
        QRCode.toCanvas(
          canvasRef.current,
          targetUrl,
          {
            width: 280,
            margin: 2,
            color: {
              dark: '#0f172a',
              light: '#ffffff',
            },
            errorCorrectionLevel: 'H',
          },
          (error) => {
            if (error) console.error('Error generating QR:', error);
          }
        );
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isOpen, targetUrl]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(targetUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Download 1: Solo el Código QR en PNG de alta resolución
  const handleDownloadOnlyQR = async () => {
    try {
      const dataUrl = await QRCode.toDataURL(targetUrl, {
        width: 1024,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'H',
      });

      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `QR-Codigo-${ownerConfig.clubName.replace(/\s+/g, '-')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error('Error downloading QR:', e);
    }
  };

  // Download 2: Afiche Diseñado para Imprimir en Mesas (1024 x 1440 px)
  const handleDownloadTablePoster = async () => {
    setIsGeneratingDownload(true);
    try {
      const qrDataUrl = await QRCode.toDataURL(targetUrl, {
        width: 600,
        margin: 2,
        color: {
          dark: '#09090b',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'H',
      });

      const qrImage = new Image();
      qrImage.src = qrDataUrl;
      await new Promise((resolve) => {
        qrImage.onload = resolve;
      });

      const posterCanvas = document.createElement('canvas');
      posterCanvas.width = 1080;
      posterCanvas.height = 1520;
      const ctx = posterCanvas.getContext('2d');

      if (ctx) {
        // 1. Background Gradient (Dark Neon Club Aesthetic)
        const bgGradient = ctx.createLinearGradient(0, 0, 1080, 1520);
        bgGradient.addColorStop(0, '#09090e');
        bgGradient.addColorStop(0.5, '#120d24');
        bgGradient.addColorStop(1, '#09090e');
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, 1080, 1520);

        // 2. Outer Neon Border
        ctx.lineWidth = 14;
        const borderGradient = ctx.createLinearGradient(0, 0, 1080, 1520);
        borderGradient.addColorStop(0, '#a855f7');
        borderGradient.addColorStop(0.5, '#ec4899');
        borderGradient.addColorStop(1, '#f59e0b');
        ctx.strokeStyle = borderGradient;
        ctx.strokeRect(30, 30, 1020, 1460);

        // 3. Header Club Badge
        ctx.fillStyle = '#ec4899';
        ctx.font = 'bold 36px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🎶 MÚSICA EN VIVO & PEDIDOS AL DJ 🎶', 540, 120);

        // 4. Club Name Title
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 68px sans-serif';
        ctx.fillText(ownerConfig.clubName.toUpperCase(), 540, 200);

        // Subtitle
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '500 32px sans-serif';
        ctx.fillText('¡Tú eres el DJ de tu noche! Pide y dedica tus temas', 540, 260);

        // 5. White Box for QR Code
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'rgba(236, 72, 153, 0.4)';
        ctx.shadowBlur = 35;
        ctx.beginPath();
        ctx.roundRect(240, 320, 600, 600, 40);
        ctx.fill();
        ctx.shadowColor = 'transparent'; // Reset shadow

        // 6. Draw QR Code inside
        ctx.drawImage(qrImage, 265, 345, 550, 550);

        // 7. Instructions Box
        ctx.fillStyle = 'rgba(255, 255, 255, 0.07)';
        ctx.beginPath();
        ctx.roundRect(100, 980, 880, 340, 30);
        ctx.fill();

        ctx.strokeStyle = 'rgba(168, 85, 247, 0.4)';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.fillStyle = '#facc15';
        ctx.font = 'bold 36px sans-serif';
        ctx.fillText('⚡ ¿CÓMO PEDIR TU CANCIÓN? ⚡', 540, 1040);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 30px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('1. Escanea el código QR con la cámara de tu celular', 150, 1110);
        ctx.fillText('2. Elige tu canción y escribe tu dedicatoria en pantalla', 150, 1170);
        ctx.fillText('3. Paga al instante por Nequi o Bancolombia QR', 150, 1230);
        ctx.fillText('4. ¡Tu canción suena en los altavoces de la discoteca!', 150, 1290);

        // 8. Footer Brand
        ctx.textAlign = 'center';
        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 26px sans-serif';
        ctx.fillText('BeatPulse DJ Platform • Sistema de Pedidos en Vivo', 540, 1400);

        ctx.fillStyle = '#ec4899';
        ctx.font = 'italic 22px sans-serif';
        ctx.fillText('Coloca este afiche en la mesa para que tus clientes escaneen y pidan música', 540, 1440);

        // Export and Trigger Download
        const posterUrl = posterCanvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = posterUrl;
        link.download = `Afiche-Mesas-QR-${ownerConfig.clubName.replace(/\s+/g, '-')}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      console.error('Error generating table poster:', err);
    } finally {
      setIsGeneratingDownload(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg glass-panel-neon rounded-3xl p-6 border border-purple-500/50 shadow-2xl space-y-5 text-center relative max-h-[92vh] overflow-y-auto">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5 text-left">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 p-0.5 shadow-md flex-shrink-0">
              <div className="w-full h-full bg-black rounded-[14px] flex items-center justify-center">
                <QrCode className="w-5 h-5 text-pink-400" />
              </div>
            </div>
            <div>
              <h3 className="text-base font-black text-white tracking-tight">
                Código QR & Descarga de la App
              </h3>
              <p className="text-xs text-slate-400">{ownerConfig.clubName} • Pedidos en Vivo</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-black/60 p-1.5 rounded-2xl border border-white/10">
          <button
            onClick={() => setActiveTab('qr')}
            className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'qr'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Código QR</span>
          </button>

          <button
            onClick={() => setActiveTab('instructions')}
            className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'instructions'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Instalar App / APK</span>
          </button>

          {onUpdateOwnerConfig && (
            <button
              onClick={() => setActiveTab('config')}
              className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'config'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Personalizar URL</span>
            </button>
          )}
        </div>

        {/* TAB 1: QR CODE VIEW & DOWNLOAD BUTTONS */}
        {activeTab === 'qr' && (
          <div className="space-y-5 animate-fadeIn">
            
            {/* Visual Canvas QR Code Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-b from-purple-950/40 to-slate-900 border border-purple-500/30 flex flex-col items-center justify-center space-y-3 shadow-inner">
              <div className="p-3 bg-white rounded-2xl shadow-xl">
                <canvas ref={canvasRef} className="max-w-full h-auto rounded-lg" />
              </div>
              
              <div className="text-center space-y-1">
                <span className="text-[11px] font-extrabold text-pink-400 uppercase tracking-wider block">
                  Escanea para pedir canciones en {ownerConfig.clubName}
                </span>
                <p className="text-[10px] text-slate-400 max-w-xs">
                  Abre la cámara de cualquier teléfono Android o iPhone para entrar al sistema de pedidos.
                </p>
              </div>
            </div>

            {/* Direct URL Box with Copy Button */}
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs">
              <input
                type="text"
                readOnly
                value={targetUrl}
                className="flex-1 bg-transparent text-slate-300 font-mono text-[11px] outline-none px-2 truncate"
              />
              <button
                onClick={handleCopyLink}
                className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] flex items-center gap-1.5 transition-all flex-shrink-0"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>

            {/* DOWNLOAD ACTION BUTTONS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Button 1: Download Full Table Stand Poster */}
              <button
                onClick={handleDownloadTablePoster}
                disabled={isGeneratingDownload}
                className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-500 hover:to-pink-500 text-white font-black text-xs shadow-lg shadow-purple-600/40 flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <Printer className="w-4 h-4" />
                <span>{isGeneratingDownload ? 'Generando Afiche...' : '📥 Descargar Afiche Mesas (PNG)'}</span>
              </button>

              {/* Button 2: Download Clean QR code only */}
              <button
                onClick={handleDownloadOnlyQR}
                className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs border border-white/10 flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <Download className="w-4 h-4 text-pink-400" />
                <span>Descargar Solo QR (PNG)</span>
              </button>
            </div>

            <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Diseñado listo para imprimir en tamaño carta, habladores de acrílico o volantes</span>
            </div>

          </div>
        )}

        {/* TAB 2: APP / APK INSTALLATION INSTRUCTIONS */}
        {activeTab === 'instructions' && (
          <div className="space-y-4 text-left animate-fadeIn">
            
            <div className="p-4 rounded-2xl bg-purple-900/30 border border-purple-500/30 space-y-2">
              <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-pink-400" />
                <span>¿Cómo instalar la App en tu Celular?</span>
              </h4>
              <p className="text-xs text-slate-300">
                Tus clientes pueden instalar BeatPulse directamente desde su navegador como una aplicación nativa (PWA / APK) sin necesidad de descargar archivos pesados desde Play Store.
              </p>
            </div>

            {/* Android Instructions */}
            <div className="p-4 rounded-2xl bg-[#12121e] border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-400">
                <span>🤖 En Celulares Android (Google Chrome)</span>
              </div>
              <ol className="list-decimal list-inside text-xs text-slate-300 space-y-1.5 pl-1">
                <li>Abre el enlace escaneando el código QR con tu cámara.</li>
                <li>Toca los tres puntos de opciones <span className="text-white font-bold">(⋮)</span> en la esquina superior derecha.</li>
                <li>Selecciona <span className="text-emerald-400 font-bold">"Instalar aplicación"</span> o <span className="text-emerald-400 font-bold">"Agregar a la pantalla principal"</span>.</li>
                <li>¡Listo! El ícono de BeatPulse Club quedará en tu menú de apps como una APK instalada.</li>
              </ol>
            </div>

            {/* iPhone / iOS Instructions */}
            <div className="p-4 rounded-2xl bg-[#12121e] border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-xs font-extrabold text-sky-400">
                <span>🍎 En iPhone / iPad (Safari)</span>
              </div>
              <ol className="list-decimal list-inside text-xs text-slate-300 space-y-1.5 pl-1">
                <li>Escanea el código QR y ábrelo en <span className="text-white font-bold">Safari</span>.</li>
                <li>Toca el botón de <span className="text-sky-400 font-bold">Compartir</span> (el cuadrado con la flecha hacia arriba).</li>
                <li>Desliza hacia abajo y elige <span className="text-sky-400 font-bold">"Agregar a pantalla de inicio"</span>.</li>
                <li>Presiona "Agregar" para tener acceso rápido en tu pantalla.</li>
              </ol>
            </div>

            {/* Direct APK Download Button */}
            <div className="pt-2 space-y-2">
              <a
                href={ownerConfig.apkDownloadUrl || '/beatpulse-dj.apk'}
                download="beatpulse-dj.apk"
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>📥 Descargar Archivo APK Directo (4.2 MB)</span>
              </a>

              <a
                href={targetUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-2 hover:brightness-110 transition-all"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Abrir Web App Móvil</span>
              </a>
            </div>

          </div>
        )}

        {/* TAB 3: CUSTOMIZE APK / APP URL (FOR OWNER / DJ) */}
        {activeTab === 'config' && onUpdateOwnerConfig && (
          <div className="space-y-4 text-left animate-fadeIn">
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
              <div className="flex items-center gap-2 text-amber-300 text-xs font-extrabold">
                <Info className="w-4 h-4 flex-shrink-0" />
                <span>Enlace de Descarga de APK Personalizado</span>
              </div>
              <p className="text-xs text-slate-300">
                Si ya compilaste un archivo <code className="text-amber-300 font-mono">.apk</code> para Android y lo subiste a Google Drive, Mediafire o GitHub, puedes pegar el enlace aquí para que el código QR dirija directamente a la descarga del APK.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-200 block">
                URL del Enlace QR / Descarga APK:
              </label>
              <input
                type="url"
                value={ownerConfig.apkDownloadUrl || ''}
                onChange={(e) => onUpdateOwnerConfig({ apkDownloadUrl: e.target.value })}
                placeholder={currentAppUrl}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white text-xs font-mono focus:border-amber-500 outline-none"
              />
              <p className="text-[11px] text-slate-400">
                * Si dejas este campo vacío, el código QR abrirá automáticamente la versión web de la app ({currentAppUrl}).
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 text-[11px] text-slate-300 space-y-1">
              <p className="font-bold text-white">💡 Sugerencia:</p>
              <p>Puedes dejar la URL web por defecto. Al escanearla, los usuarios pueden pedir música de inmediato sin esperar a descargar ningún archivo pesado.</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
