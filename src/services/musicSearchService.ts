import { Song, Genre } from '../types';

interface iTunesTrack {
  trackId: number;
  trackName: string;
  artistName: string;
  artworkUrl100: string;
  primaryGenreName: string;
  previewUrl: string;
  trackTimeMillis: number;
  contentAdvisoryRating?: string;
}

export async function searchLiveWebMusic(query: string): Promise<Song[]> {
  if (!query.trim()) return [];

  try {
    const encodedQuery = encodeURIComponent(query.trim());
    const response = await fetch(
      `https://itunes.apple.com/search?term=${encodedQuery}&entity=song&limit=15&country=CO`
    );

    if (!response.ok) {
      throw new Error(`iTunes API HTTP Error: ${response.status}`);
    }

    const data = await response.json();
    if (!data.results || !Array.isArray(data.results)) {
      return [];
    }

    return data.results.map((track: iTunesTrack) => {
      // Map iTunes genre to our Genre types
      let mappedGenre: Genre = 'Pop Hits';
      const rawGenre = (track.primaryGenreName || '').toLowerCase();

      if (rawGenre.includes('latin') || rawGenre.includes('reggaeton') || rawGenre.includes('urbano')) {
        mappedGenre = 'Reggaeton';
      } else if (rawGenre.includes('dance') || rawGenre.includes('house') || rawGenre.includes('electronic')) {
        mappedGenre = 'Electro / House';
      } else if (rawGenre.includes('trance') || rawGenre.includes('techno') || rawGenre.includes('edm')) {
        mappedGenre = 'Techno & EDM';
      } else if (rawGenre.includes('salsa') || rawGenre.includes('bachata') || rawGenre.includes('tropical')) {
        mappedGenre = 'Salsa & Bachata';
      } else if (rawGenre.includes('hip-hop') || rawGenre.includes('rap') || rawGenre.includes('urban')) {
        mappedGenre = 'Trap & Urban';
      }

      // High res album cover (change 100x100 to 400x400)
      const highResCover = (track.artworkUrl100 || '').replace('100x100bb', '400x400bb');

      // Estimate BPM based on genre
      const estimatedBpm = mappedGenre === 'Electro / House' ? 128 : mappedGenre === 'Reggaeton' ? 105 : 120;

      // Duration format
      const durationSec = Math.floor((track.trackTimeMillis || 200000) / 1000);
      const mins = Math.floor(durationSec / 60);
      const secs = durationSec % 60;
      const durationFormatted = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

      return {
        id: `itunes-${track.trackId}`,
        title: track.trackName || 'Sin título',
        artist: track.artistName || 'Artista desconocido',
        albumCover: highResCover || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80',
        genre: mappedGenre,
        bpm: estimatedBpm,
        duration: durationFormatted,
        energyLevel: 9,
        isExplicit: track.contentAdvisoryRating === 'Explicit',
        previewUrl: track.previewUrl,
      };
    });
  } catch (err) {
    console.warn('Live music search API error:', err);
    return [];
  }
}
