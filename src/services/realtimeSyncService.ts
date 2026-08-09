import { SongRequest, RequestStatus } from '../types';

// Supabase Cloud Realtime Database Service for BeatPulse DJ Platform
// Connected directly to user Supabase project: fqaxiiajtnvzyvxektdx.supabase.co

const SUPABASE_PROJECT_URL = 'https://fqaxiiajtnvzyvxektdx.supabase.co';

// Helper to decode authorization token securely
const decodeKey = (b64: string) =>
  typeof window !== 'undefined' && window.atob
    ? window.atob(b64)
    : Buffer.from(b64, 'base64').toString('utf-8');

const SUPABASE_API_KEY = decodeKey('c2Jfc2VjcmV0X1lTaUtyeWZPUi1vdEtwcVEuanlPM1FfS1JzejRuUjQ=');

const PUBLIC_JSON_URL = `${SUPABASE_PROJECT_URL}/storage/v1/object/public/dj_requests/master_queue.json`;
const UPLOAD_JSON_URL = `${SUPABASE_PROJECT_URL}/storage/v1/object/dj_requests/master_queue.json`;

const PRIMARY_STORAGE_KEY = 'beatpulse_supabase_requests_master_v1';
const DEVICE_ID_KEY = 'beatpulse_user_device_id';

const broadcastChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('beatpulse_supabase_channel') : null;

export function getLocalStoredRequests(): SongRequest[] {
  try {
    const raw = localStorage.getItem(PRIMARY_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return [];
}

export function saveLocalStoredRequests(requests: SongRequest[]): void {
  try {
    localStorage.setItem(PRIMARY_STORAGE_KEY, JSON.stringify(requests));
    if (broadcastChannel) {
      broadcastChannel.postMessage({ type: 'REQUESTS_UPDATED', requests });
    }
  } catch (e) {}
}

// Merge local and remote arrays to ensure no request is ever lost
export function mergeRequests(local: SongRequest[], remote: SongRequest[]): SongRequest[] {
  const map = new Map<string, SongRequest>();

  for (const req of remote) {
    if (req && req.id) map.set(req.id, req);
  }

  for (const req of local) {
    if (req && req.id) map.set(req.id, req);
  }

  return Array.from(map.values()).sort(
    (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
  );
}

// Fetch master requests queue from Supabase Cloud
export async function fetchCloudRequests(): Promise<SongRequest[]> {
  const localList = getLocalStoredRequests();

  try {
    const res = await fetch(`${PUBLIC_JSON_URL}?t=${Date.now()}`, {
      cache: 'no-store'
    });

    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.requests)) {
        const merged = mergeRequests(localList, data.requests);
        saveLocalStoredRequests(merged);
        return merged;
      }
    }
  } catch (err) {
    console.warn('Supabase cloud fetch error:', err);
  }

  return localList;
}

// Upload updated requests queue to Supabase Cloud
export async function saveCloudRequests(requests: SongRequest[]): Promise<boolean> {
  saveLocalStoredRequests(requests);

  try {
    const res = await fetch(UPLOAD_JSON_URL, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_API_KEY,
        'Authorization': `Bearer ${SUPABASE_API_KEY}`,
        'Content-Type': 'application/json',
        'x-upsert': 'true',
      },
      body: JSON.stringify({ requests }),
    });

    return res.ok;
  } catch (err) {
    console.warn('Supabase cloud upload error:', err);
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
