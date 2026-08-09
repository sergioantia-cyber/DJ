import { SongRequest } from '../types';

// High-Reliability Cross-Device Cloud Realtime Relay Service
// Eliminates 405 Method Not Allowed errors using open CORS Key-Value Cloud Storage

// Unique session bucket for BeatPulse DJ
const KVDB_BUCKET_ID = 'beatpulse_club_ibiza_2026';
const CLOUD_SYNC_URL = `https://kvdb.io/8vFzW9zP6kQ2mR7xN1/${KVDB_BUCKET_ID}`;
const LOCAL_STORAGE_KEY = 'beatpulse_master_requests_backup';

export async function fetchCloudRequests(): Promise<SongRequest[]> {
  try {
    const res = await fetch(CLOUD_SYNC_URL, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      cache: 'no-store'
    });

    if (res.status === 404) {
      // Key doesn't exist yet in cloud, return local cache
      return getLocalStoredRequests();
    }

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    
    const data = await res.json();
    if (data && Array.isArray(data)) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
      return data;
    }
  } catch (err) {
    // Fallback to local storage if offline or CORS blocked
    const local = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {}
    }
  }
  return getLocalStoredRequests();
}

export async function saveCloudRequests(requests: SongRequest[]): Promise<boolean> {
  // Always update local cache instantly
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(requests));

  try {
    const res = await fetch(CLOUD_SYNC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requests),
    });
    return res.ok;
  } catch (err) {
    console.warn('Cloud sync push warning:', err);
    return false;
  }
}

export function getLocalStoredRequests(): SongRequest[] {
  const local = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (local) {
    try {
      return JSON.parse(local);
    } catch (e) {}
  }
  return [];
}

export function getOrCreateDeviceId(): string {
  let devId = localStorage.getItem('beatpulse_device_id');
  if (!devId) {
    devId = `dev_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem('beatpulse_device_id', devId);
  }
  return devId;
}
