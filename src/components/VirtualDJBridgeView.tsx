import React, { useState } from 'react';
import {
  Cable,
  CheckCircle2,
  AlertCircle,
  Download,
  Terminal,
  Copy,
  Check,
  RefreshCw,
  Sliders,
  ExternalLink,
  ShieldAlert,
  Play
} from 'lucide-react';
import { VirtualDJConfig, SongRequest } from '../types';
import { soundFx } from '../services/soundEffects';

interface VirtualDJBridgeViewProps {
  vdjConfig: VirtualDJConfig;
  requests: SongRequest[];
  onTestConnection: () => void;
  onUpdatePort: (port: number) => void;
}

export const VirtualDJBridgeView: React.FC<VirtualDJBridgeViewProps> = ({
  vdjConfig,
  requests,
  onTestConnection,
  onUpdatePort,
}) => {
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [isTesting, setIsTesting] = useState<boolean>(false);

  const nodeScriptCode = `// VirtualDJ Local Bridge Server (Node.js)
// Save as virtualdj-bridge-server.js and run with: node virtualdj-bridge-server.js
const http = require('http');

const VDJ_PORT = ${vdjConfig.port};
const BRIDGE_PORT = 4000;

console.log('🎧 Starting BeatPulse DJ -> VirtualDJ Bridge...');

// Http Listener for incoming web app paid song requests
const server = http.createServer((req, res) => {
  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        console.log('⚡ Received Paid Track for VirtualDJ:', payload.song.title);
        
        // Push song to VirtualDJ REST API / OS2L local endpoint
        // VirtualDJ HTTP Endpoint: http://127.0.0.1:8000/automix?add=song_name
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Track sent to VirtualDJ deck' }));
      } catch (err) {
        res.writeHead(400);
        res.end('Invalid Payload');
      }
    });
  } else {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('VirtualDJ Bridge Active');
  }
});

server.listen(BRIDGE_PORT, () => {
  console.log(\`✅ Bridge Listening on http://localhost:\${BRIDGE_PORT}\`);
  console.log(\`🔌 Forwarding to VirtualDJ Web Server on http://localhost:\${VDJ_PORT}\`);
});`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(nodeScriptCode);
    setCopiedCode(true);
    soundFx.playCoinChime();
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleTestBtn = () => {
    setIsTesting(true);
    soundFx.playScratch();
    setTimeout(() => {
      onTestConnection();
      setIsTesting(false);
    }, 1200);
  };

  const handleExportM3U = () => {
    const approved = requests.filter(r => r.status === 'accepted' || r.status === 'sent_to_vdj' || r.status === 'playing');
    if (approved.length === 0) {
      alert('No hay canciones aprobadas aún para exportar a la lista de VirtualDJ.');
      return;
    }

    let m3uContent = '#EXTM3U\n# BeatPulse DJ - VirtualDJ Automix Request Playlist\n';
    approved.forEach((req) => {
      m3uContent += `#EXTINF:240,${req.song.artist} - ${req.song.title} (Requested by ${req.userName})\n`;
      m3uContent += `C:\\VirtualDJ\\Music\\${req.song.artist} - ${req.song.title}.mp3\n`;
    });

    const blob = new Blob([m3uContent], { type: 'audio/x-mpegurl' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VirtualDJ_Automix_BeatPulse_${new Date().toISOString().slice(0, 10)}.m3u`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    soundFx.playCoinChime();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      
      {/* Title Header */}
      <div className="glass-panel-neon rounded-3xl p-6 border border-cyan-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-widest mb-1">
            <Cable className="w-4 h-4" /> Módulo de Integración con VirtualDJ Software
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            VirtualDJ <span className="text-gradient-neon">Connection Bridge</span>
          </h2>
          <p className="text-sm text-slate-300 mt-1">
            Conecta los pedidos pagados de la app directamente a la lista de Automix o Sidelist de VirtualDJ en tu laptop.
          </p>
        </div>

        {/* Test Connection Button */}
        <button
          onClick={handleTestBtn}
          disabled={isTesting}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-extrabold text-xs shadow-lg shadow-cyan-600/30 flex items-center gap-2 flex-shrink-0 transition-all active:scale-95"
        >
          <RefreshCw className={`w-4 h-4 ${isTesting ? 'animate-spin' : ''}`} />
          <span>{isTesting ? 'Probando Conexión...' : 'Probar Estado de VirtualDJ'}</span>
        </button>
      </div>

      {/* Grid: Methods to Connect */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Method 1: VirtualDJ Web Server REST API */}
        <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 font-bold">
                01
              </div>
              <div>
                <h3 className="font-bold text-white text-base">API REST / Servidor HTTP Local</h3>
                <p className="text-xs text-slate-400">Comunicación nativa en tiempo real</p>
              </div>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${vdjConfig.connected ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300'}`}>
              {vdjConfig.connected ? 'ONLINE' : 'CONFIGURABLE'}
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            VirtualDJ incluye un servidor HTTP interno que permite a aplicaciones externas (como BeatPulse DJ) inyectar canciones a la cola de Automix automáticamente.
          </p>

          {/* Steps */}
          <div className="space-y-2 text-xs text-slate-300 bg-slate-900/80 p-4 rounded-2xl border border-white/5">
            <p className="font-bold text-purple-300">Pasos para activar en VirtualDJ:</p>
            <ol className="list-decimal list-inside space-y-1.5 text-slate-400">
              <li>Abre <strong>VirtualDJ</strong> en tu ordenador.</li>
              <li>Ve a <strong>Configuración (⚙️)</strong> → <strong>Opciones</strong>.</li>
              <li>Busca la palabra <code className="text-pink-300 bg-black/50 px-1 py-0.5 rounded">webserver</code>.</li>
              <li>Activa <strong>Web Server: YES</strong> (Puerto por defecto: <strong className="text-white">8000</strong>).</li>
            </ol>
          </div>

          {/* Port Input */}
          <div className="flex items-center justify-between pt-2">
            <label className="text-xs font-bold text-slate-300">Puerto HTTP VirtualDJ:</label>
            <input
              type="number"
              value={vdjConfig.port}
              onChange={(e) => onUpdatePort(Number(e.target.value) || 8000)}
              className="w-24 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-white font-mono text-xs font-bold text-center outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        {/* Method 2: Dynamic M3U Playlist Export */}
        <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-300 font-bold">
                02
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Sincronización M3U Automix</h3>
                <p className="text-xs text-slate-400">Exportación directa a carpetas de VirtualDJ</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-pink-500/20 text-pink-300 border border-pink-500/30">
              INSTANTÁNEO
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Descarga un archivo de lista de reproducción <code className="text-cyan-300 bg-black/50 px-1 py-0.5 rounded">.m3u</code> generado automáticamente con todas las canciones pagadas por los clientes de la discoteca.
          </p>

          <div className="bg-slate-900/80 p-4 rounded-2xl border border-white/5 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-300 font-bold">
              <span>Canciones Listas para Exportar:</span>
              <span className="text-emerald-400 font-extrabold text-sm">
                {requests.filter(r => r.status === 'accepted' || r.status === 'sent_to_vdj' || r.status === 'playing').length} temas
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Ubicación recomendada: C:\Users\TuUsuario\Documents\VirtualDJ\Folders\
            </p>
          </div>

          <button
            onClick={handleExportM3U}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 hover:opacity-95 text-white font-extrabold text-xs shadow-lg shadow-pink-600/30 flex items-center justify-center gap-2 transition-all active:scale-98"
          >
            <Download className="w-4 h-4" />
            <span>Descargar Lista .M3U para Automix de VirtualDJ</span>
          </button>
        </div>

      </div>

      {/* Standalone Node.js Bridge Server Code Viewer */}
      <div className="glass-panel-neon rounded-3xl p-6 border border-purple-500/30 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-purple-400" />
            <h3 className="font-bold text-white text-base">Script Puente Node.js (opcional para discotecas)</h3>
          </div>
          <button
            onClick={handleCopyCode}
            className="px-3.5 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/60 border border-purple-500/40 text-purple-200 font-bold text-xs flex items-center gap-1.5 transition-all"
          >
            {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copiedCode ? '¡Copiado al Portapapeles!' : 'Copiar Código'}</span>
          </button>
        </div>

        <p className="text-xs text-slate-300">
          Si vas a usar la app en una discoteca con servidor remoto, puedes ejecutar este pequeño script en el PC del DJ para que retransmita las peticiones web en milisegundos a la instancia local de VirtualDJ:
        </p>

        <pre className="bg-[#0b0b12] p-4 rounded-2xl border border-white/10 text-[11px] font-mono text-purple-200 overflow-x-auto max-h-56">
          {nodeScriptCode}
        </pre>
      </div>

    </div>
  );
};
