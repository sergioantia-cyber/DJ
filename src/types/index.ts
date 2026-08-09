export type Genre = 'Reggaeton' | 'Electro / House' | 'Techno & EDM' | 'Salsa & Bachata' | 'Trap & Urban' | 'Pop Hits';

export interface Song {
  id: string;
  title: string;
  artist: string;
  albumCover: string;
  genre: Genre;
  bpm: number;
  duration: string;
  energyLevel: number; // 1-10
  isExplicit?: boolean;
  previewUrl?: string; // Audio preview MP3 from iTunes / Apple Music
}

export type PriorityLevel = 'normal' | 'vip' | 'play_now';

export interface PriorityOption {
  id: PriorityLevel;
  name: string;
  tagline: string;
  priceCOP: number;
  estimatedWaitMinutes: number;
  color: string;
  badge: string;
  iconName: string;
}

export type RequestStatus = 'pending' | 'accepted' | 'sent_to_vdj' | 'playing' | 'completed' | 'rejected';

export type PaymentMethodType = 'nequi_qr' | 'bancolombia_qr' | 'pse_qr';

export interface SongRequest {
  id: string;
  deviceId?: string; // Unique persistent device ID fingerprint
  song: Song;
  userName: string;
  tableNumber: string;
  priority: PriorityOption;
  tipAmountCOP: number;
  totalPaidCOP: number;
  paymentMethod: PaymentMethodType;
  dedicatedMessage?: string;
  status: RequestStatus;
  createdAt: string;
  acceptedAt?: string;
  playedAt?: string;
  rejectionReason?: string;
  // Revenue split values in COP (20% Dev, 10% DJ, 70% Club Owner)
  platformFeeCOP: number;  // 20% Creador del Software
  djShareCOP: number;       // 10% Cabina del DJ
  clubShareCOP: number;     // 70% Dueño de la Discoteca
}

export interface VirtualDJConfig {
  connected: boolean;
  serverUrl: string;
  port: number;
  autoAcceptThresholdCOP: number; // e.g. auto accept if totalPaid >= 30,000 COP
  autoSyncToAutomix: boolean;
  lastPing?: string;
  sentCount: number;
}

export interface OwnerConfig {
  clubName: string;
  hasAcceptedTerms: boolean;
  acceptedTermsDate?: string;
  // Revenue Split (20% Dev, 10% DJ, 70% Club Owner)
  platformFeePercent: number; // 20% Desarrollador
  djSharePercent: number;     // 10% DJ
  clubSharePercent: number;   // 70% Dueño Discoteca
  // Pricing Strategy
  pricingMode: 'tiered' | 'flat_single';
  flatSinglePriceCOP: number;
  tieredPricesCOP: {
    normal: number;
    vip: number;
    play_now: number;
  };
  // Payment Details
  nequiPhone: string;
  bancolombiaAcc: string;
  bancolombiaQrImage: string;
}
