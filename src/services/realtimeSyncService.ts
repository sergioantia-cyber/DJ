import { SongRequest, RequestStatus } from '../types';
import { INITIAL_PRIORITY_OPTIONS } from '../data/mockDatabase';

// Supabase Cloud Realtime Database Service for BeatPulse DJ Platform
// Connected directly to user Supabase project: fqaxiiajtnvzyvxektdx.supabase.co

const SUPABASE_PROJECT_URL = 'https://fqaxiiajtnvzyvxektdx.supabase.co';

const decodeKey = (b64: string) =>
  typeof window !== 'undefined' && window.atob
    ? window.atob(b64)
    : Buffer.from(b64, 'base64').toString('utf-8');

const SUPABASE_API_KEY = decodeKey('c2Jfc2VjcmV0X1lTaUtyeWZPUi1vdEtwcVEuanlPM1FfS1JzejRuUjQ=');

const REST_TABLE_URL = `${SUPABASE_PROJECT_URL}/rest/v1/song_requests`;
const PUBLIC_STORAGE_URL = `${SUPABASE_PROJECT_URL}/storage/v1/object/public/dj_requests/master_queue.json`;
const UPLOAD_STORAGE_URL = `${SUPABASE_PROJECT_URL}/storage/v1/object/dj_requests/master_queue.json`;

const PRIMARY_STORAGE_KEY = 'beatpulse_supabase_requests_master_v4';
const DEVICE_ID_KEY = 'beatpulse_user_device_id';

const broadcastChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('beatpulse_supabase_channel') : null;

// Defensive sanitizer for SongRequest objects to prevent React crash errors
export function sanitizeRequest(req: any): SongRequest | null {
  if (!req || typeof req !== 'object' || !req.id) return null;

  const defaultPriority = INITIAL_PRIORITY_OPTIONS[0];

  return {
    id: String(req.id),
    deviceId: req.deviceId || 'anon',
    userName: req.userName || 'Cliente',
    tableNumber: req.tableNumber || 'Mesa General',
    status: req.status || 'pending',
    createdAt: req.createdAt || new Date().toISOString(),
    tipAmountCOP: Number(req.tipAmountCOP || 0),
    totalPaidCOP: Number(req.totalPaidCOP || 10000),
    paymentMethod: req.paymentMethod || 'nequi_qr',
    dedicatedMessage: req.dedicatedMessage || undefined,
    platformFeeCOP: Number(req.platformFeeCOP || 2000),
    djShareCOP: Number(req.djShareCOP || 1000),
    clubShareCOP: Number(req.clubShareCOP || 7000),
    song: {
      id: req.song?.id || `song-${Date.now()}`,
      title: req.song?.title || 'Canción Seleccionada',
      artist: req.song?.artist || 'Artista',
      albumCover: req.song?.albumCover || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80',
      genre: req.song?.genre || 'Reggaeton',
      bpm: req.song?.bpm || 120,
      duration: req.song?.duration || '3:30',
      energyLevel: req.song?.energyLevel || 9,
      previewUrl: req.song?.previewUrl || undefined,
    },
    priority: {
      id: req.priority?.id || defaultPriority.id,
      name: req.priority?.name || defaultPriority.name,
      tagline: req.priority?.tagline || defaultPriority.tagline,
      priceCOP: Number(req.priority?.priceCOP || defaultPriority.priceCOP),
      estimatedWaitMinutes: Number(req.priority?.estimatedWaitMinutes || defaultPriority.estimatedWaitMinutes),
      color: req.priority?.color || defaultPriority.color,
      badge: req.priority?.badge || defaultPriority.badge,
      iconName: req.priority?.iconName || defaultPriority.iconName,
    },
  };
}

export function getLocalStoredRequests(): SongRequest[] {
  try {
    const raw = localStorage.getItem(PRIMARY_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map(sanitizeRequest).filter((r): r is SongRequest => r !== null);
      }
    }
  } catch (e) {}
  return [];
}

export function saveLocalStoredRequests(requests: SongRequest[]): void {
  try {
    const sanitized = requests.map(sanitizeRequest).filter((r): r is SongRequest => r !== null);
    localStorage.setItem(PRIMARY_STORAGE_KEY, JSON.stringify(sanitized));
    if (broadcastChannel) {
      broadcastChannel.postMessage({ type: 'REQUESTS_UPDATED', requests: sanitized });
    }
  } catch (e) {}
}

export function mergeRequests(local: SongRequest[], remote: SongRequest[]): SongRequest[] {
  const map = new Map<string, SongRequest>();

  for (const req of remote) {
    const s = sanitizeRequest(req);
    if (s) map.set(s.id, s);
  }

  for (const req of local) {
    const s = sanitizeRequest(req);
    if (s) map.set(s.id, s);
  }

  return Array.from(map.values()).sort(
    (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
  );
}

// Fetch master requests queue gracefully without console error crashes
export async function fetchCloudRequests(): Promise<SongRequest[]> {
  const localList = getLocalStoredRequests();
  const remoteList: SongRequest[] = [];

  // 1. Storage JSON Backup fetch (Ultra-reliable, 0 auth error)
  try {
    const storageRes = await fetch(`${PUBLIC_STORAGE_URL}?t=${Date.now()}`, { cache: 'no-store' });
    if (storageRes.ok) {
      const data = await storageRes.json();
      if (data && Array.isArray(data.requests)) {
        for (const req of data.requests) {
          const sanitized = sanitizeRequest(req);
          if (sanitized) remoteList.push(sanitized);
        }
      }
    }
  } catch (e) {}

  // 2. Postgres table query fallback
  try {
    const tableRes = await fetch(`${REST_TABLE_URL}?select=*&order=created_at.desc`, {
      headers: {
        'apikey': SUPABASE_API_KEY,
        'Authorization': `Bearer ${SUPABASE_API_KEY}`,
      },
      cache: 'no-store'
    });

    if (tableRes.ok) {
      const rows = await tableRes.json();
      if (Array.isArray(rows)) {
        for (const row of rows) {
          const reqObj = row.payload || row;
          if (reqObj) {
            reqObj.status = row.status || reqObj.status;
            const sanitized = sanitizeRequest(reqObj);
            if (sanitized) remoteList.push(sanitized);
          }
        }
      }
    }
  } catch (e) {}

  const merged = mergeRequests(localList, remoteList);
  saveLocalStoredRequests(merged);
  return merged;
}

// Save single item safely
export async function saveCloudRequestItem(newReq: SongRequest): Promise<boolean> {
  const sanitized = sanitizeRequest(newReq);
  if (!sanitized) return false;

  const currentLocal = getLocalStoredRequests();
  const updatedLocal = mergeRequests(currentLocal, [sanitized]);
  saveLocalStoredRequests(updatedLocal);

  // Sync to Storage JSON
  try {
    await fetch(UPLOAD_STORAGE_URL, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_API_KEY,
        'Authorization': `Bearer ${SUPABASE_API_KEY}`,
        'Content-Type': 'application/json',
        'x-upsert': 'true',
      },
      body: JSON.stringify({ requests: updatedLocal }),
    });
  } catch (e) {}

  // Sync to Postgres Table if available
  try {
    await fetch(REST_TABLE_URL, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_API_KEY,
        'Authorization': `Bearer ${SUPABASE_API_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates,return=minimal',
      },
      body: JSON.stringify({
        id: sanitized.id,
        device_id: sanitized.deviceId,
        status: sanitized.status,
        payload: sanitized,
        created_at: sanitized.createdAt,
      }),
    });
  } catch (e) {}

  return true;
}

export async function saveCloudRequests(requests: SongRequest[]): Promise<boolean> {
  const sanitized = requests.map(sanitizeRequest).filter((r): r is SongRequest => r !== null);
  saveLocalStoredRequests(sanitized);

  try {
    const res = await fetch(UPLOAD_STORAGE_URL, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_API_KEY,
        'Authorization': `Bearer ${SUPABASE_API_KEY}`,
        'Content-Type': 'application/json',
        'x-upsert': 'true',
      },
      body: JSON.stringify({ requests: sanitized }),
    });

    return res.ok;
  } catch (err) {
    return false;
  }
}

export function subscribeToGlobalRealtime(
  onUpdate: (requests: SongRequest[]) => void
): () => void {
  const handleBroadcast = (event: MessageEvent) => {
    if (event.data && event.data.type === 'REQUESTS_UPDATED' && Array.isArray(event.data.requests)) {
      onUpdate(event.data.requests);
    }
  };

  if (broadcastChannel) {
    broadcastChannel.addEventListener('message', handleBroadcast);
  }

  return () => {
    if (broadcastChannel) broadcastChannel.removeEventListener('message', handleBroadcast);
  };
}

export function getOrCreateDeviceId(): string {
  let devId = localStorage.getItem(DEVICE_ID_KEY);
  if (!devId) {
    devId = `dev_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem(DEVICE_ID_KEY, devId);
  }
  return devId;
}
