import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ClientView } from './components/ClientView';
import { DJBoothView } from './components/DJBoothView';
import { OwnerDashboardView } from './components/OwnerDashboardView';
import { StageScreenView } from './components/StageScreenView';
import { VirtualDJBridgeView } from './components/VirtualDJBridgeView';
import { TermsAndConditionsModal } from './components/TermsAndConditionsModal';
import { Lock, ShieldCheck, KeyRound, X } from 'lucide-react';

import { INITIAL_SONGS, INITIAL_REQUESTS, DEFAULT_OWNER_CONFIG } from './data/mockDatabase';
import { SongRequest, RequestStatus, VirtualDJConfig, OwnerConfig } from './types';
import { soundFx } from './services/soundEffects';
import {
  fetchCloudRequests,
  saveCloudRequests,
  getLocalStoredRequests,
  getOrCreateDeviceId,
  subscribeToRealtimeChanges
} from './services/realtimeSyncService';

export function App() {
  const queryParams = new URLSearchParams(window.location.search);
  const urlRole = queryParams.get('role') as 'client' | 'dj' | 'owner' | 'stage' | 'bridge' | null;
  const urlAccessSecret = queryParams.get('access') || queryParams.get('admin');

  // Persistent stealth admin unlock state
  const [isStealthAdminUnlocked, setIsStealthAdminUnlocked] = useState<boolean>(() => {
    const savedUnlocked = localStorage.getItem('beatpulse_stealth_unlocked');
    return Boolean(savedUnlocked === 'true' || urlAccessSecret || urlRole === 'dj' || urlRole === 'owner' || urlRole === 'bridge');
  });

  // Persistent active portal tab state
  const [activeTab, setActiveTab] = useState<'client' | 'dj' | 'owner' | 'stage' | 'bridge'>(() => {
    const savedTab = localStorage.getItem('beatpulse_active_tab') as 'client' | 'dj' | 'owner' | 'stage' | 'bridge' | null;
    return urlRole || savedTab || 'client';
  });

  const [songs] = useState(INITIAL_SONGS);
  
  // Realtime multi-device request queue with BroadcastChannel & Persistent LocalStorage
  const [requests, setRequests] = useState<SongRequest[]>(() => {
    return getLocalStoredRequests();
  });

  // Owner Config stored persistently
  const [ownerConfig, setOwnerConfig] = useState<OwnerConfig>(() => {
    const savedConfig = localStorage.getItem('beatpulse_owner_config');
    if (savedConfig) {
      try {
        return JSON.parse(savedConfig);
      } catch (e) {}
    }
    return DEFAULT_OWNER_CONFIG;
  });

  const [isTermsModalOpen, setIsTermsModalOpen] = useState<boolean>(false);
  const [logoTapCount, setLogoTapCount] = useState<number>(0);

  // Security PIN state for DJ and Owner portals
  const [pinPromptRole, setPinPromptRole] = useState<'dj' | 'owner' | 'admin' | null>(null);
  const [enteredPin, setEnteredPin] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');

  const DJ_PIN = '1234';
  const OWNER_PIN = '9999';

  const [vdjConfig, setVdjConfig] = useState<VirtualDJConfig>({
    connected: true,
    serverUrl: 'http://localhost',
    port: 8000,
    autoAcceptThresholdCOP: 10000,
    autoSyncToAutomix: true,
    sentCount: 2,
    lastPing: new Date().toISOString()
  });

  // Realtime subscription listener across tabs/windows
  useEffect(() => {
    const unsubscribe = subscribeToRealtimeChanges((updatedReqs) => {
      setRequests(updatedReqs);
    });
    return () => unsubscribe();
  }, []);

  // Save activeTab & stealth status persistently to localStorage
  useEffect(() => {
    localStorage.setItem('beatpulse_active_tab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('beatpulse_stealth_unlocked', isStealthAdminUnlocked ? 'true' : 'false');
  }, [isStealthAdminUnlocked]);

  // Save owner config changes persistently
  useEffect(() => {
    localStorage.setItem('beatpulse_owner_config', JSON.stringify(ownerConfig));
  }, [ownerConfig]);

  const validRequests = requests.filter((r) => r.status !== 'rejected');
  const totalEarnedCOP = validRequests.reduce((sum, r) => sum + r.totalPaidCOP, 0);
  const pendingCount = requests.filter((r) => r.status === 'pending').length;

  const handleSecretLogoTap = () => {
    const newCount = logoTapCount + 1;
    setLogoTapCount(newCount);

    if (newCount >= 5) {
      setLogoTapCount(0);
      soundFx.playScratch();
      setPinPromptRole('admin');
      setEnteredPin('');
      setPinError('');
    }
  };

  const handleTabSwitchRequest = (tab: 'client' | 'dj' | 'owner' | 'stage' | 'bridge') => {
    if (tab === 'dj') {
      if (!isStealthAdminUnlocked) {
        setPinPromptRole('dj');
        setEnteredPin('');
        setPinError('');
        return;
      }
    }

    if (tab === 'owner') {
      if (!isStealthAdminUnlocked) {
        setPinPromptRole('owner');
        setEnteredPin('');
        setPinError('');
        return;
      }
    }

    setActiveTab(tab);
  };

  const handleVerifyPin = () => {
    if (pinPromptRole === 'admin') {
      if (enteredPin === DJ_PIN || enteredPin === OWNER_PIN) {
        soundFx.playCoinChime();
        setIsStealthAdminUnlocked(true);
        setActiveTab(enteredPin === OWNER_PIN ? 'owner' : 'dj');
        setPinPromptRole(null);
        if (enteredPin === OWNER_PIN && !ownerConfig.hasAcceptedTerms) {
          setIsTermsModalOpen(true);
        }
      } else {
        setPinError('Clave de acceso incorrecta');
        soundFx.playScratch();
      }
      return;
    }

    if (pinPromptRole === 'dj') {
      if (enteredPin === DJ_PIN) {
        soundFx.playCoinChime();
        setIsStealthAdminUnlocked(true);
        setActiveTab('dj');
        setPinPromptRole(null);
      } else {
        setPinError('PIN de Cabina DJ incorrecto (Clave: 1234)');
        soundFx.playScratch();
      }
    } else if (pinPromptRole === 'owner') {
      if (enteredPin === OWNER_PIN) {
        soundFx.playCoinChime();
        setIsStealthAdminUnlocked(true);
        setActiveTab('owner');
        setPinPromptRole(null);
        if (!ownerConfig.hasAcceptedTerms) {
          setIsTermsModalOpen(true);
        }
      } else {
        setPinError('PIN de Administrador incorrecto (Clave: 9999)');
        soundFx.playScratch();
      }
    }
  };

  const handleAcceptTerms = () => {
    setOwnerConfig((prev) => ({
      ...prev,
      hasAcceptedTerms: true,
      acceptedTermsDate: new Date().toLocaleDateString('es-CO'),
    }));
    setIsTermsModalOpen(false);
  };

  const handleSubmitNewRequest = (
    newReqData: Omit<SongRequest, 'id' | 'createdAt' | 'status' | 'platformFeeCOP' | 'djShareCOP' | 'clubShareCOP'>
  ) => {
    const totalPaid = newReqData.totalPaidCOP;

    const platformFeeCOP = totalPaid * (ownerConfig.platformFeePercent / 100);
    const djShareCOP = totalPaid * (ownerConfig.djSharePercent / 100);
    const clubShareCOP = totalPaid * (ownerConfig.clubSharePercent / 100);

    const deviceId = getOrCreateDeviceId();

    const newRequest: SongRequest = {
      ...newReqData,
      id: `req-${Date.now()}`,
      deviceId,
      createdAt: new Date().toISOString(),
      status: 'pending', // Shows in DJ Booth first!
      platformFeeCOP,
      djShareCOP,
      clubShareCOP,
    };

    const updatedRequests = [newRequest, ...requests];
    setRequests(updatedRequests);
    saveCloudRequests(updatedRequests);
    soundFx.playAirhorn();
  };

  const handleUpdateRequestStatus = (requestId: string, newStatus: RequestStatus, reason?: string) => {
    const updatedRequests = requests.map((req) => {
      if (req.id === requestId) {
        const updated: SongRequest = {
          ...req,
          status: newStatus,
          rejectionReason: reason,
        };
        if (newStatus === 'accepted' || newStatus === 'sent_to_vdj') {
          updated.acceptedAt = new Date().toISOString();
        }
        if (newStatus === 'playing') {
          updated.playedAt = new Date().toISOString();
        }
        return updated;
      }
      return req;
    });

    setRequests(updatedRequests);
    saveCloudRequests(updatedRequests);
  };

  const handleUpdateOwnerConfig = (updatedFields: Partial<OwnerConfig>) => {
    setOwnerConfig((prev) => ({ ...prev, ...updatedFields }));
  };

  const handleToggleAutoAccept = () => {
    setVdjConfig((prev) => ({ ...prev, autoSyncToAutomix: !prev.autoSyncToAutomix }));
    soundFx.playScratch();
  };

  const handleTestConnection = () => {
    setVdjConfig((prev) => ({ ...prev, connected: true, lastPing: new Date().toISOString() }));
  };

  const handleUpdatePort = (port: number) => {
    setVdjConfig((prev) => ({ ...prev, port }));
  };

  return (
    <div className="min-h-screen bg-[#08080c] text-slate-100 flex flex-col font-['Outfit',sans-serif]">
      
      {/* Top Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleTabSwitchRequest}
        vdjConfig={vdjConfig}
        ownerConfig={ownerConfig}
        totalEarnedCOP={totalEarnedCOP}
        pendingCount={pendingCount}
        isStealthAdminUnlocked={isStealthAdminUnlocked}
        onSecretLogoTap={handleSecretLogoTap}
      />

      {/* Main Content View */}
      <main className="flex-1 pb-16">
        {activeTab === 'client' && (
          <ClientView
            songs={songs}
            userRequests={requests}
            ownerConfig={ownerConfig}
            onSubmitRequest={handleSubmitNewRequest}
          />
        )}

        {activeTab === 'dj' && (
          <DJBoothView
            requests={requests}
            vdjConfig={vdjConfig}
            ownerConfig={ownerConfig}
            onUpdateRequestStatus={handleUpdateRequestStatus}
            onToggleAutoAccept={handleToggleAutoAccept}
          />
        )}

        {activeTab === 'owner' && (
          <OwnerDashboardView
            ownerConfig={ownerConfig}
            onUpdateOwnerConfig={handleUpdateOwnerConfig}
            requests={requests}
            onOpenTermsModal={() => setIsTermsModalOpen(true)}
          />
        )}

        {activeTab === 'stage' && (
          <div className="p-4 sm:p-6">
            <StageScreenView requests={requests} />
          </div>
        )}

        {activeTab === 'bridge' && (
          <VirtualDJBridgeView
            vdjConfig={vdjConfig}
            requests={requests}
            onTestConnection={handleTestConnection}
            onUpdatePort={handleUpdatePort}
          />
        )}
      </main>

      {/* PIN Security Modal for Secret Access */}
      {pinPromptRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-sm glass-panel-neon rounded-3xl p-6 border border-purple-500/40 space-y-4 text-center">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-pink-400 uppercase">
                <KeyRound className="w-4 h-4" />
                <span>Acceso Restringido Staff</span>
              </div>
              <button onClick={() => setPinPromptRole(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-extrabold text-white">
                {pinPromptRole === 'admin'
                  ? 'Panel de Control Staff / DJ / Dueño'
                  : pinPromptRole === 'dj'
                  ? 'Acceso a Cabina DJ'
                  : 'Panel de Administración del Dueño'}
              </h3>
              <p className="text-xs text-slate-300">
                {pinPromptRole === 'dj'
                  ? 'Ingresa el PIN del DJ (Clave: 1234)'
                  : 'Ingresa el PIN del Administrador (Clave: 9999)'}
              </p>
            </div>

            <div>
              <input
                type="password"
                maxLength={6}
                value={enteredPin}
                onChange={(e) => setEnteredPin(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleVerifyPin()}
                placeholder="****"
                className="w-full text-center tracking-[0.5em] font-mono text-2xl font-black py-3 rounded-2xl bg-slate-900 border border-white/10 text-white focus:border-pink-500 outline-none"
                autoFocus
              />
              {pinError && <p className="text-xs text-rose-400 font-bold mt-2">{pinError}</p>}
            </div>

            <button
              onClick={handleVerifyPin}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white font-extrabold text-xs shadow-lg shadow-purple-600/40"
            >
              Ingresar al Portal
            </button>
          </div>
        </div>
      )}

      {/* Mandatory Terms & Conditions Modal for Nightclub Owner */}
      <TermsAndConditionsModal
        isOpen={isTermsModalOpen}
        onAccept={handleAcceptTerms}
        clubName={ownerConfig.clubName}
      />

    </div>
  );
}
