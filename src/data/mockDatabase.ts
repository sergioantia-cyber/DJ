import { Song, PriorityOption, SongRequest, OwnerConfig } from '../types';

export const DEFAULT_OWNER_CONFIG: OwnerConfig = {
  clubName: 'Club Ibiza • VIP Zone',
  hasAcceptedTerms: false,
  platformFeePercent: 20, // 20% Creador del Software / Desarrollador
  djSharePercent: 10,     // 10% Cabina del DJ
  clubSharePercent: 70,   // 70% Dueño de la Discoteca
  pricingMode: 'tiered',
  flatSinglePriceCOP: 15000,
  tieredPricesCOP: {
    normal: 10000,
    vip: 25000,
    play_now: 60000,
  },
  nequiPhone: '300 123 4567',
  bancolombiaAcc: '031-987654-21 (Ahorros)',
  bancolombiaQrImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&q=80',
};

export const INITIAL_PRIORITY_OPTIONS: PriorityOption[] = [
  {
    id: 'normal',
    name: 'Cola Standard',
    tagline: 'Entra en el orden de llegada del DJ',
    priceCOP: 10000,
    estimatedWaitMinutes: 25,
    color: 'from-slate-700 to-slate-800',
    badge: '🥉 Standard',
    iconName: 'Clock'
  },
  {
    id: 'vip',
    name: 'Prioridad VIP 15m',
    tagline: 'Sube puestos rápido en la cola de la fiesta',
    priceCOP: 25000,
    estimatedWaitMinutes: 12,
    color: 'from-purple-600 to-pink-600',
    badge: '🥈 VIP Boost',
    iconName: 'Zap'
  },
  {
    id: 'play_now',
    name: '🔥 PLAY NEXT NOW',
    tagline: '¡Interrumpe la cola! Suena justo después de esta canción',
    priceCOP: 60000,
    estimatedWaitMinutes: 3,
    color: 'from-amber-500 via-rose-500 to-red-600',
    badge: '🥇 PLAY NEXT NOW',
    iconName: 'Flame'
  }
];

export const INITIAL_SONGS: Song[] = [
  {
    id: 'song-1',
    title: 'Tití Me Preguntó',
    artist: 'Bad Bunny',
    albumCover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80',
    genre: 'Reggaeton',
    bpm: 111,
    duration: '4:03',
    energyLevel: 9,
    isExplicit: true
  },
  {
    id: 'song-2',
    title: 'Pepas (Club Remix)',
    artist: 'Farruko',
    albumCover: 'https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?w=400&q=80',
    genre: 'Electro / House',
    bpm: 130,
    duration: '4:47',
    energyLevel: 10,
    isExplicit: false
  },
  {
    id: 'song-3',
    title: 'Gata Only',
    artist: 'FloyyMenor x Cris Mj',
    albumCover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80',
    genre: 'Reggaeton',
    bpm: 100,
    duration: '3:42',
    energyLevel: 8,
    isExplicit: true
  },
  {
    id: 'song-4',
    title: 'Titanium (EDM Festival Mix)',
    artist: 'David Guetta ft. Sia',
    albumCover: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&q=80',
    genre: 'Techno & EDM',
    bpm: 126,
    duration: '4:05',
    energyLevel: 10,
    isExplicit: false
  },
  {
    id: 'song-5',
    title: 'La Bachata',
    artist: 'Manuel Turizo',
    albumCover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80',
    genre: 'Salsa & Bachata',
    bpm: 125,
    duration: '2:42',
    energyLevel: 7,
    isExplicit: false
  },
  {
    id: 'song-6',
    title: 'Provenza',
    artist: 'Karol G',
    albumCover: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&q=80',
    genre: 'Reggaeton',
    bpm: 115,
    duration: '3:30',
    energyLevel: 9,
    isExplicit: false
  }
];

export const INITIAL_REQUESTS: SongRequest[] = [
  {
    id: 'req-101',
    song: INITIAL_SONGS[0], // Titi Me Pregunto
    userName: 'Mateo & Amigos',
    tableNumber: 'Mesa 12 (Zona VIP)',
    priority: INITIAL_PRIORITY_OPTIONS[2], // PLAY NEXT NOW ($60.000 COP)
    tipAmountCOP: 10000,
    totalPaidCOP: 70000,
    paymentMethod: 'nequi_qr',
    dedicatedMessage: '¡Feliz cumpleaños a Sofia! Que retumben los bajos 🎉🥂',
    status: 'accepted',
    createdAt: new Date(Date.now() - 3 * 60000).toISOString(),
    acceptedAt: new Date(Date.now() - 2 * 60000).toISOString(),
    platformFeeCOP: 14000, // 20% Desarrollador
    djShareCOP: 7000,       // 10% DJ
    clubShareCOP: 49000,    // 70% Dueño Discoteca
  },
  {
    id: 'req-102',
    song: INITIAL_SONGS[1], // Pepas
    userName: 'Carlos V.',
    tableNumber: 'Mesa 04',
    priority: INITIAL_PRIORITY_OPTIONS[1], // VIP Boost ($25.000 COP)
    tipAmountCOP: 5000,
    totalPaidCOP: 30000,
    paymentMethod: 'bancolombia_qr',
    dedicatedMessage: 'Salud por la graduación del equipo 🎓🔥',
    status: 'pending',
    createdAt: new Date(Date.now() - 1 * 60000).toISOString(),
    platformFeeCOP: 6000,  // 20% Desarrollador
    djShareCOP: 3000,      // 10% DJ
    clubShareCOP: 21000,   // 70% Dueño Discoteca
  }
];
