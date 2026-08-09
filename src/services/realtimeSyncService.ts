import { SongRequest } from '../types';

// Real-Time Cross-Device Cloud Sync Service for BeatPulse DJ
// Synchronizes requests across all phones, tablets, and computers connected to Vercel

const SESSION_KEY = 'beatpulse_club_ibiza_requests';
const CLOUD_SYNC_ENDPOINT = 'https://api.restful-api.dev/objects/beatpulse_live_session_101';

export async function fetchCloudRequests(): Promise<SongRequest[] | null> {
  try {
    const response = await fetch(CLOUD_SYNC_ENDPOINT);
    if (!response.ok) return null;
    const data = await response.json();

    if (data && data.data && Array.isArray(data.data.requests)) {
      // Update local storage cache
      localStorage.setItem(SESSION_KEY, JSON.stringify(data.data.requests));
      return data.data.requests;
    }
    return null;
  } catch (err) {
    // Fallback to localStorage if offline
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
  // Save to localStorage immediately
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
