import { SongRequest } from '../types';

const PRIMARY_STORAGE_KEY = 'beatpulse_unlimited_master_v6';
const DEVICE_ID_KEY = 'beatpulse_user_device_id';

// Unlimited Global Realtime Serverless Topic
const NTFY_TOPIC = 'beatpulse_club_ibiza_unlimited_master_2026';
const NTFY_POST_URL = `https://ntfy.sh/${NTFY_TOPIC}`;
const NTFY_POLL_URL = `https://ntfy.sh/${NTFY_TOPIC}/json?poll=1`;
const NTFY_SSE_URL = `https://ntfy.sh/${NTFY_TOPIC}/json`;

// BroadcastChannel for instant local tab sync
const broadcastChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('beatpulse_channel_v6') : null;

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

// Fetch historical messages from cloud topic buffer on startup
export async function fetchHistoricalCloudRequests(): Promise<SongRequest[]> {
  const map = new Map<string, SongRequest>();

  // Add local stored first
  const localList = getLocalStoredRequests();
  for (const req of localList) {
    if (req && req.id) map.set(req.id, req);
  }

  try {
    const res = await fetch(NTFY_POLL_URL, { cache: 'no-store' });
    if (res.ok) {
      const text = await res.text();
      const lines = text.split('\n').filter(Boolean);

      for (const line of lines) {
        try {
          const payload = JSON.parse(line);
          if (payload && payload.message) {
            const data = typeof payload.message === 'string' ? JSON.parse(payload.message) : payload.message;
            if (data.action === 'NEW_REQUEST' && data.request && data.request.id) {
              map.set(data.request.id, data.request);
            } else if (data.action === 'UPDATE_STATUS' && data.requestId && data.status) {
              const existing = map.get(data.requestId);
              if (existing) {
                existing.status = data.status;
                if (data.reason) existing.rejectionReason = data.reason;
              }
            }
          }
        } catch (e) {}
      }
    }
  } catch (err) {
    console.warn('Unlimited historical poll warning:', err);
  }

  const merged = Array.from(map.values()).sort(
    (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
  );

  saveLocalStoredRequests(merged);
  return merged;
}

// Publish new request globally across all devices on the internet
export async function broadcastNewRequestToCloud(newReq: SongRequest): Promise<void> {
  try {
    await fetch(NTFY_POST_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'NEW_REQUEST',
        request: newReq,
      }),
    });
  } catch (err) {
    console.warn('Global ntfy publish error:', err);
  }
}

// Publish status update globally
export async function broadcastStatusUpdateToCloud(requestId: string, status: string, reason?: string): Promise<void> {
  try {
    await fetch(NTFY_POST_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'UPDATE_STATUS',
        requestId,
        status,
        reason,
      }),
    });
  } catch (err) {
    console.warn('Global ntfy status update error:', err);
  }
}

// Subscribe to global realtime updates
export function subscribeToGlobalRealtime(
  onNewRequest: (req: SongRequest) => void,
  onStatusUpdate: (requestId: string, status: string, reason?: string) => void
): () => void {
  let eventSource: EventSource | null = null;

  try {
    eventSource = new EventSource(NTFY_SSE_URL);

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload && payload.message) {
          const data = typeof payload.message === 'string' ? JSON.parse(payload.message) : payload.message;

          if (data.action === 'NEW_REQUEST' && data.request) {
            onNewRequest(data.request);
          } else if (data.action === 'UPDATE_STATUS' && data.requestId && data.status) {
            onStatusUpdate(data.requestId, data.status, data.reason);
          }
        }
      } catch (e) {}
    };
  } catch (err) {
    console.warn('EventSource connection error:', err);
  }

  const handleBroadcast = (event: MessageEvent) => {
    if (event.data && event.data.type === 'REQUESTS_UPDATED' && Array.isArray(event.data.requests)) {
      // Local sync handled in App
    }
  };

  if (broadcastChannel) {
    broadcastChannel.addEventListener('message', handleBroadcast);
  }

  return () => {
    if (eventSource) eventSource.close();
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
