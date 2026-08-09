import { SongRequest } from '../types';

const LOCAL_STORAGE_KEY = 'beatpulse_master_requests_v3';
const DEVICE_ID_KEY = 'beatpulse_user_device_id';

// BroadcastChannel for instant zero-latency cross-tab synchronization
const broadcastChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('beatpulse_realtime_channel') : null;

export function getLocalStoredRequests(): SongRequest[] {
  try {
    const local = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (local) {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Error reading local requests:', e);
  }
  return [];
}

export function saveLocalStoredRequests(requests: SongRequest[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(requests));
    if (broadcastChannel) {
      broadcastChannel.postMessage({ type: 'REQUESTS_UPDATED', requests });
    }
  } catch (e) {
    console.error('Error saving local requests:', e);
  }
}

// Merge local and remote request arrays by unique ID (preserves all orders)
export function mergeRequests(local: SongRequest[], remote: SongRequest[]): SongRequest[] {
  const map = new Map<string, SongRequest>();

  // Add remote first
  for (const req of remote) {
    if (req && req.id) map.set(req.id, req);
  }

  // Add or override with local (preserves newly created local requests)
  for (const req of local) {
    if (req && req.id) map.set(req.id, req);
  }

  // Sort by createdAt descending
  return Array.from(map.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

// Public cloud storage relay fallback
const CLOUD_API_ENDPOINT = 'https://api.jsonbin.io/v3/b';

export async function fetchCloudRequests(): Promise<SongRequest[]> {
  const local = getLocalStoredRequests();
  return local;
}

export async function saveCloudRequests(requests: SongRequest[]): Promise<boolean> {
  saveLocalStoredRequests(requests);
  return true;
}

export function subscribeToRealtimeChanges(onUpdate: (requests: SongRequest[]) => void): () => void {
  // Listen to BroadcastChannel
  const handleBroadcast = (event: MessageEvent) => {
    if (event.data && event.data.type === 'REQUESTS_UPDATED' && Array.isArray(event.data.requests)) {
      onUpdate(event.data.requests);
    }
  };

  if (broadcastChannel) {
    broadcastChannel.addEventListener('message', handleBroadcast);
  }

  // Listen to window storage event for cross-window sync
  const handleStorage = (e: StorageEvent) => {
    if (e.key === LOCAL_STORAGE_KEY) {
      const updated = getLocalStoredRequests();
      onUpdate(updated);
    }
  };

  window.addEventListener('storage', handleStorage);

  return () => {
    if (broadcastChannel) {
      broadcastChannel.removeEventListener('message', handleBroadcast);
    }
    window.removeEventListener('storage', handleStorage);
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
