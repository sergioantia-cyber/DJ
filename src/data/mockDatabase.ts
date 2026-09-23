import { Song, SongRequest, OwnerConfig, PriorityOption } from '../types';

export const INITIAL_PRIORITY_OPTIONS: PriorityOption[] = [
  {
    id: 'prio-normal',
    name: 'Normal (Standard)',
    tagline: 'Fila regular por orden de llegada',
    priceCOP: 10000,
    estimatedWaitMinutes: 20,
    color: 'from-blue-600 to-indigo-600',
    badge: 'Standard',
    iconName: 'Clock',
  },
  {
    id: 'prio-express',
    name: '⚡ Express VIP',
    tagline: 'Salta 5 turnos adelante en la fila',
    priceCOP: 25000,
    estimatedWaitMinutes: 8,
    color: 'from-amber-500 to-orange-600',
    badge: 'Express VIP',
    iconName: 'Zap',
  },
  {
    id: 'prio-now',
    name: '🔥 SONAR AHORA (Siguiente Canción)',
    tagline: 'Canción siguiente inmediata en el escenario',
    priceCOP: 60000,
    estimatedWaitMinutes: 2,
    color: 'from-pink-600 via-rose-600 to-amber-500',
    badge: 'Sonar Ahora',
    iconName: 'Flame',
  },
];

export const INITIAL_SONGS: Song[] = [
  {
    id: 'song-1',
    title: 'Pepas',
    artist: 'Farruko',
    albumCover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80',
    genre: 'Guaracha / Reggaeton',
    bpm: 128,
    duration: '4:47',
    energyLevel: 10,
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/71/f4/06/71f40693-8198-bda7-15fa-cef96b897f74/mzaf_10196410050022616641.plus.aac.p.m4a',
  },
  {
    id: 'song-2',
    title: 'MONACO',
    artist: 'Bad Bunny',
    albumCover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80',
    genre: 'Latin Trap',
    bpm: 112,
    duration: '4:27',
    energyLevel: 9,
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/93/f7/49/93f74959-31cf-822f-5a12-ab40bd1f73be/mzaf_16943526665607661808.plus.aac.p.m4a',
  },
  {
    id: 'song-3',
    title: 'Qlona',
    artist: 'Karol G ft. Peso Pluma',
    albumCover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80',
    genre: 'Reggaeton',
    bpm: 95,
    duration: '2:52',
    energyLevel: 8,
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/89/19/a2/8919a2a9-8296-1d4e-c473-8e1a1bf09103/mzaf_3896003535913058051.plus.aac.p.m4a',
  },
  {
    id: 'song-4',
    title: 'La Bebé (Remix)',
    artist: 'Yng Lvcas & Peso Pluma',
    albumCover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80',
    genre: 'Reggaeton',
    bpm: 96,
    duration: '3:54',
    energyLevel: 9,
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/69/6f/10/696f10d4-04eb-0d59-2fa7-91b0b915065e/mzaf_4870463956684181967.plus.aac.p.m4a',
  },
];

// Completely empty initial requests so ONLY real user requests are shown
export const INITIAL_REQUESTS: SongRequest[] = [];

export const DEFAULT_OWNER_CONFIG: OwnerConfig = {
  clubName: 'Club Ibiza Nightclub',
  nequiQrUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80',
  nequiPhoneNumber: '300 123 4567',
  nequiAccountName: 'BeatPulse Club',
  bancolombiaQrUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80',
  bancolombiaAccountNumber: '123-456789-01',
  bancolombiaAccountName: 'BeatPulse Club S.A.S',
  baseSongPriceCOP: 10000,
  platformFeePercent: 20,
  djSharePercent: 10,
  clubSharePercent: 70,
  allowFreeRequests: false,
  hasAcceptedTerms: true,
  acceptedTermsDate: new Date().toLocaleDateString('es-CO'),
};
