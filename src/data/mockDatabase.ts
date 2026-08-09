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
  nequiPhone: '300 000 0000',
  bancolombiaAcc: '000-000000-00',
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

export const INITIAL_SONGS: Song[] = [];

export const INITIAL_REQUESTS: SongRequest[] = [];
