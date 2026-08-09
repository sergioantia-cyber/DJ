import { SongRequest } from '../types';

const LOCAL_STORAGE_KEY = 'beatpulse_master_requests_v4';
const DEVICE_ID_KEY = 'beatpulse_user_device_id';

// Global SSE Realtime Topic for BeatPulse DJ Club Ibiza
const NTFY_TOPIC = 'beatpulse_dj_club_ibiza_session_2026';
const NTFY_PUBLISH_URL = `https://ntfy.sh/${NTFY_TOPIC}`;
const NTFY_SSE_URL = `https://ntfy.sh/${NTFY_TOPIC}/json`;

// BroadcastChannel for instant local tab sync
const broadcastChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('beatpulse_channel') : null;

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

// Publish new request globally across all devices on the internet
export async function broadcastNewRequestToCloud(newReq: SongRequest): Promise<void> {
  try {
    await fetch(NTFY_PUBLISH_URL, {
      method: 'POST',
      body: JSON.stringify({
        action: 'NEW_REQUEST',
        request: newReq,
      }),
    });
  } catch (err) {
    console.warn('Global SSE publish error:', err);
  }
}

// Publish status update (accept/reject/play) globally across all devices
export async function broadcastStatusUpdateToCloud(requestId: string, status: string, reason?: string): Promise<void> {
  try {
    await fetch(NTFY_PUBLISH_URL, {
      method: 'POST',
      body: JSON.stringify({
        action: 'UPDATE_STATUS',
        requestId,
        status,
        reason,
      }),
    });
  } catch (err) {
    console.warn('Global SSE status update error:', err);
  }
}

// Subscribe to global realtime updates from any phone/laptop worldwide
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
          const data = JSON.parse(payload.message);

          if (data.action === 'NEW_REQUEST' && data.request) {
            onNewRequest(data.request);
          } else if (data.action === 'UPDATE_STATUS' && data.requestId && data.status) {
            onStatusUpdate(data.requestId, data.status, data.reason);
          }
        }
      } catch (e) {
        // Ignore heartbeats or non-JSON messages
      }
    };
  } catch (err) {
    console.warn('EventSource connection error:', err);
  }

  // Also listen for BroadcastChannel local tab changes
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
