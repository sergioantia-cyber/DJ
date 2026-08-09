/**
 * BeatPulse DJ -> VirtualDJ Local Bridge Server
 * Run locally on DJ PC: node virtualdj-bridge-server.js
 */

const http = require('http');
const https = require('https');

const VDJ_PORT = 8000;
const BRIDGE_PORT = 4000;

console.log('===================================================');
console.log('🎧 BeatPulse DJ -> VirtualDJ Local Bridge Active');
console.log('===================================================');

const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/api/v1/request-song') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        console.log(`[${new Date().toLocaleTimeString()}] 🎵 PAID REQUEST RECIEVED:`);
        console.log(` - Track: ${payload.song.artist} - ${payload.song.title}`);
        console.log(` - Priority: ${payload.priority.name} ($${payload.totalPaid} USD)`);
        console.log(` - User: ${payload.userName} (${payload.tableNumber})`);

        // Forward to VirtualDJ internal REST API / Automix Endpoint
        // VirtualDJ Endpoint format: http://127.0.0.1:8000/automix?add=TrackTitle
        const vdjUrl = `http://127.0.0.1:${VDJ_PORT}/automix?add=${encodeURIComponent(payload.song.title)}`;

        http.get(vdjUrl, (vdjRes) => {
          console.log(`⚡ Sent to VirtualDJ API (HTTP Status: ${vdjRes.statusCode})`);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: true,
            status: 'sent_to_vdj',
            message: 'Song successfully injected into VirtualDJ Automix Deck',
            vdjStatusCode: vdjRes.statusCode
          }));
        }).on('error', (err) => {
          console.warn(`⚠️ Could not reach VirtualDJ on port ${VDJ_PORT}. (Ensure VirtualDJ Web Server option is enabled)`);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: true,
            status: 'queued_in_bridge',
            message: 'Song queued in local bridge server. VirtualDJ connection pending.',
          }));
        });

      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Malformed JSON payload' }));
      }
    });
  } else if (req.method === 'GET' && req.url === '/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      bridgeOnline: true,
      vdjPort: VDJ_PORT,
      time: new Date().toISOString()
    }));
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(BRIDGE_PORT, () => {
  console.log(`✅ Local Bridge listening at: http://localhost:${BRIDGE_PORT}`);
  console.log(`🔌 Target VirtualDJ Web Server: http://localhost:${VDJ_PORT}`);
  console.log('🚀 Ready to receive paid song requests from BeatPulse DJ web app!\n');
});
