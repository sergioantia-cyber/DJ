import { Song, SongRequest } from '../types';

export interface ClubAudioState {
  isMuted: boolean;
  isPlaying: boolean;
  currentSong: Song | null;
  currentReq: SongRequest | null;
  hasAudioSource: boolean;
}

type AudioListener = (state: ClubAudioState) => void;

class ClubAudioPlayerService {
  private audio: HTMLAudioElement | null = null;
  private isMuted: boolean = true; // Silenciado como predeterminado por requisito
  private isPlaying: boolean = false;
  private currentSong: Song | null = null;
  private currentReq: SongRequest | null = null;
  private listeners: Set<AudioListener> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      this.audio = new Audio();
      this.audio.preload = 'auto';
      this.audio.muted = this.isMuted; // Inicia silenciado

      this.audio.addEventListener('play', () => {
        this.isPlaying = true;
        this.notify();
      });

      this.audio.addEventListener('pause', () => {
        this.isPlaying = false;
        this.notify();
      });

      this.audio.addEventListener('ended', () => {
        this.isPlaying = false;
        this.notify();
      });

      this.audio.addEventListener('error', (e) => {
        console.warn('ClubAudioPlayer error:', e);
      });
    }
  }

  public getState(): ClubAudioState {
    return {
      isMuted: this.isMuted,
      isPlaying: this.isPlaying,
      currentSong: this.currentSong,
      currentReq: this.currentReq,
      hasAudioSource: Boolean(this.currentSong?.previewUrl || (this.audio && this.audio.src)),
    };
  }

  public subscribe(listener: AudioListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    const state = this.getState();
    this.listeners.forEach((fn) => fn(state));
  }

  /**
   * Carga y reproduce una canción.
   * Si está silenciado (por defecto), se reproduce en modo mute para garantizar
   * compatibilidad con la política de autoplay del navegador.
   */
  public async playSong(song: Song, req?: SongRequest): Promise<void> {
    if (!this.audio) return;

    this.currentSong = song;
    this.currentReq = req || null;

    let audioUrl = song.previewUrl;

    // Si la canción no tiene previewUrl, buscar dinámicamente en iTunes API
    if (!audioUrl && song.title) {
      try {
        const query = encodeURIComponent(`${song.title} ${song.artist || ''}`);
        const res = await fetch(`https://itunes.apple.com/search?term=${query}&limit=1&entity=song`);
        const data = await res.json();
        if (data.results && data.results[0] && data.results[0].previewUrl) {
          audioUrl = data.results[0].previewUrl;
          song.previewUrl = audioUrl; // Cachear
        }
      } catch (e) {
        console.warn('Dynamic audio preview fetch error:', e);
      }
    }

    // Fallback: URL oficial de respaldo club si todo lo demás falla
    if (!audioUrl) {
      audioUrl = 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/71/f4/06/71f40693-8198-bda7-15fa-cef96b897f74/mzaf_10196410050022616641.plus.aac.p.m4a';
    }

    try {
      this.audio.src = audioUrl;
      this.audio.muted = this.isMuted;
      this.audio.volume = 1.0;
      await this.audio.play();
      this.isPlaying = true;
    } catch (e) {
      console.log('Audio play waiting for user unlock:', e);
      this.isPlaying = false;
    }

    this.notify();
  }

  /**
   * Activa el sonido (Unmute) y reproduce con volumen completo.
   */
  public unmuteAndPlay(): void {
    if (!this.audio) return;
    this.isMuted = false;
    this.audio.muted = false;
    this.audio.volume = 1.0;

    // Si estaba pausado y hay canción, reanudar
    if (this.audio.paused && this.audio.src) {
      this.audio.play().catch(() => {});
    }

    this.notify();
  }

  /**
   * Silencia la música (Mute).
   */
  public mute(): void {
    if (!this.audio) return;
    this.isMuted = true;
    this.audio.muted = true;
    this.notify();
  }

  /**
   * Alterna entre Silenciar y Activar Sonido.
   */
  public toggleMute(): void {
    if (this.isMuted) {
      this.unmuteAndPlay();
    } else {
      this.mute();
    }
  }

  public pause(): void {
    if (this.audio) {
      this.audio.pause();
    }
  }

  public resume(): void {
    if (this.audio && this.audio.src) {
      this.audio.play().catch(() => {});
    }
  }
}

export const clubAudioPlayer = new ClubAudioPlayerService();
