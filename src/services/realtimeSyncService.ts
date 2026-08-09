import { SongRequest } from '../types';

const SESSION_KEY = 'beatpulse_club_ibiza_requests';
const DEVICE_ID_KEY = 'beatpulse_user_device_id';
const CLOUD_SYNC_ENDPOINT = 'https://api.restful-api.dev/objects/beatpulse_live_session_101';

// Generate or retrieve persistent unique Device ID fingerprint
export function getOrCreateDeviceId(): string {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = `dev_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
}

export async function fetchCloudRequests(): Promise<SongRequest[] | null> {
  try {
    const response = await fetch(CLOUD_SYNC_ENDPOINT);
    if (!response.ok) return null;
    const data = await response.json();

    if (data && data.data && Array.isArray(data.data.requests)) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(data.data.requests));
      return data.data.requests;
    }
    return null;
  } catch (err) {
    const local = localStorage.getItem(SESSION_KEY);
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        return null;
      }
    }
    return null;
  }
}

export async function saveCloudRequests(requests: SongRequest[]): Promise<boolean> {
  localStorage.setItem(SESSION_KEY, JSON.stringify(requests));

  try {
    const response = await fetch('https://api.restful-api.dev/objects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: 'beatpulse_live_session_101',
        name: 'BeatPulse Club Ibiza Live Session',
        data: {
          requests,
          updatedAt: new Date().toISOString(),
        },
      }),
    });
    return response.ok;
  } catch (err) {
    console.warn('Cloud sync push warning:', err);
    return false;
  }
}

export function getLocalStoredRequests(): SongRequest[] {
  const local = localStorage.getItem(SESSION_KEY);
  if (local) {
    try {
      return JSON.parse(local);
    } catch (e) {
      return [];
    }
  }
  return [];
}
