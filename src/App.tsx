import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { ClientView } from './components/ClientView';
import { DJBoothView } from './components/DJBoothView';
import { OwnerDashboardView } from './components/OwnerDashboardView';
import { StageScreenView } from './components/StageScreenView';
import { VirtualDJBridgeView } from './components/VirtualDJBridgeView';
import { TermsAndConditionsModal } from './components/TermsAndConditionsModal';

import { INITIAL_SONGS, INITIAL_REQUESTS, DEFAULT_OWNER_CONFIG } from './data/mockDatabase';
import { SongRequest, RequestStatus, VirtualDJConfig, OwnerConfig } from './types';
import { soundFx } from './services/soundEffects';

export function App() {
  const [activeTab, setActiveTab] = useState<'client' | 'dj' | 'owner' | 'stage' | 'bridge'>('client');
  const [songs] = useState(INITIAL_SONGS);
  const [requests, setRequests] = useState<SongRequest[]>(INITIAL_REQUESTS);

  const [ownerConfig, setOwnerConfig] = useState<OwnerConfig>(DEFAULT_OWNER_CONFIG);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState<boolean>(false);

  const [vdjConfig, setVdjConfig] = useState<VirtualDJConfig>({
    connected: true,
    serverUrl: 'http://localhost',
    port: 8000,
    autoAcceptThresholdCOP: 30000,
    autoSyncToAutomix: true,
    sentCount: 2,
    lastPing: new Date().toISOString()
  });

  const validRequests = requests.filter((r) => r.status !== 'rejected');
  const totalEarnedCOP = validRequests.reduce((sum, r) => sum + r.totalPaidCOP, 0);
  const pendingCount = requests.filter((r) => r.status === 'pending').length;

  const handleTabSwitch = (tab: 'client' | 'dj' | 'owner' | 'stage' | 'bridge') => {
    setActiveTab(tab);
    if (tab === 'owner' && !ownerConfig.hasAcceptedTerms) {
      setIsTermsModalOpen(true);
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

    // Automatic 20% platform fee calculation
    const platformFeeCOP = totalPaid * (ownerConfig.platformFeePercent / 100);
    const djShareCOP = totalPaid * (ownerConfig.djSharePercent / 100);
    const clubShareCOP = totalPaid * (ownerConfig.clubSharePercent / 100);

    const isAutoAccept = vdjConfig.autoSyncToAutomix && totalPaid >= vdjConfig.autoAcceptThresholdCOP;

    const newRequest: SongRequest = {
      ...newReqData,
      id: `req-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: isAutoAccept ? 'sent_to_vdj' : 'pending',
      platformFeeCOP,
      djShareCOP,
      clubShareCOP,
    };

    setRequests((prev) => [newRequest, ...prev]);

    if (isAutoAccept) {
      soundFx.playAirhorn();
      setVdjConfig((prev) => ({ ...prev, sentCount: prev.sentCount + 1 }));
    }
  };

  const handleUpdateRequestStatus = (requestId: string, newStatus: RequestStatus, reason?: string) => {
    setRequests((prev) =>
      prev.map((req) => {
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
      })
    );
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
      {/* Top Navbar Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleTabSwitch}
        vdjConfig={vdjConfig}
        ownerConfig={ownerConfig}
        totalEarnedCOP={totalEarnedCOP}
        pendingCount={pendingCount}
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

      {/* Mandatory Terms & Conditions Modal for Nightclub Owner */}
      <TermsAndConditionsModal
        isOpen={isTermsModalOpen}
        onAccept={handleAcceptTerms}
        clubName={ownerConfig.clubName}
      />

      {/* Bottom Bar Alert for Pending Requests */}
      {pendingCount > 0 && activeTab !== 'dj' && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40">
          <button
            onClick={() => {
              setActiveTab('dj');
              soundFx.playAirhorn();
            }}
            className="px-6 py-3 rounded-full bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-500 text-white font-extrabold text-xs shadow-2xl shadow-pink-500/50 flex items-center gap-2 animate-bounce border border-pink-400/40 hover:scale-105 transition-transform"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
            <span>¡Tienes {pendingCount} pedido(s) por Nequi/Bancolombia en la Cabina DJ!</span>
          </button>
        </div>
      )}
    </div>
  );
}
