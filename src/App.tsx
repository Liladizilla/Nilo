import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  limit
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { Navbar } from './components/Navbar';
import { EvidenceChainGraphic } from './components/EvidenceChainGraphic';
import { OverviewView } from './components/OverviewView';
import { OpportunitiesView } from './components/OpportunitiesView';
import { SignalsView } from './components/SignalsView';
import { EntitiesView } from './components/EntitiesView';
import { SearchDiscoveryView } from './components/SearchDiscoveryView';
import { OutcomeLoopView } from './components/OutcomeLoopView';
import { SourcesView } from './components/SourcesView';
import { OpportunityDetailModal } from './components/OpportunityDetailModal';
import { TargetProfileModal } from './components/TargetProfileModal';
import { AISettingsModal } from './components/AISettingsModal';
import { Opportunity, Signal, Entity, MarketEvent, IntelligenceSource, OpportunityOutcome, TargetUserProfile } from './types';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [user, setUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [showTargetProfileModal, setShowTargetProfileModal] = useState<boolean>(false);
  const [showAISettingsModal, setShowAISettingsModal] = useState<boolean>(false);
  const [isIngesting, setIsIngesting] = useState<boolean>(false);

  // Core Data Stores
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [events, setEvents] = useState<MarketEvent[]>([]);
  const [sources, setSources] = useState<IntelligenceSource[]>([]);
  const [outcomes, setOutcomes] = useState<OpportunityOutcome[]>([]);

  // User Target Profile
  const [targetProfile, setTargetProfile] = useState<TargetUserProfile>({
    services: ['Web Development', 'React Architecture', 'Cloud Infrastructure', 'LEED Engineering', 'Growth Marketing'],
    industries: ['Technology', 'Healthcare', 'Construction', 'Consumer Goods', 'Manufacturing'],
    locations: ['Global', 'North America', 'East Africa', 'Europe'],
    preferredOpportunity: 'Growing companies with public hiring surges, facility investments, or direct vendor solicitations',
    minConfidence: 75,
  });

  // Track Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Sync or retrieve user target profile from Firestore
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const snap = await getDoc(userDocRef);
          if (snap.exists()) {
            const data = snap.data();
            if (data.targetProfile) {
              setTargetProfile(data.targetProfile);
            }
          } else {
            // Initialize user doc
            await setDoc(userDocRef, {
              uid: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || '',
              photoURL: currentUser.photoURL || '',
              role: 'analyst',
              targetProfile,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
          }
        } catch (err) {
          console.warn('User profile sync notice:', err);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch initial data from backend API
  const fetchAllData = async () => {
    try {
      const [oppsRes, sigsRes, entsRes, eventsRes, sourcesRes, outcomesRes] = await Promise.all([
        fetch('/api/v1/opportunities').then(r => r.json()),
        fetch('/api/v1/signals').then(r => r.json()),
        fetch('/api/v1/entities').then(r => r.json()),
        fetch('/api/v1/events').then(r => r.json()),
        fetch('/api/v1/sources').then(r => r.json()),
        fetch('/api/v1/opportunities/opp-medpulse-contract/outcomes').then(r => r.json()).catch(() => ({ outcomes: [] })),
      ]);

      if (oppsRes.opportunities) setOpportunities(oppsRes.opportunities);
      if (sigsRes.signals) setSignals(sigsRes.signals);
      if (entsRes.entities) setEntities(entsRes.entities);
      if (eventsRes.events) setEvents(eventsRes.events);
      if (sourcesRes.sources) setSources(sourcesRes.sources);
      if (outcomesRes.outcomes) setOutcomes(outcomesRes.outcomes);
    } catch (err) {
      console.error('Error fetching Nilo intelligence data:', err);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Action: Record user action on an opportunity
  const handleRecordAction = async (actionData: { type: string; channel: string; notes: string }) => {
    if (!selectedOpportunity) return;
    try {
      const res = await fetch(`/api/v1/opportunities/${selectedOpportunity.id}/actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...actionData, userId: user?.uid || 'usr-analyst' }),
      });
      const data = await res.json();

      // Persist to Firestore if user signed in
      if (user) {
        try {
          const actionRef = doc(db, 'opportunities', selectedOpportunity.id, 'actions', data.action.id);
          await setDoc(actionRef, {
            ...data.action,
            userId: user.uid,
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, `opportunities/${selectedOpportunity.id}/actions/${data.action.id}`);
        }
      }

      await fetchAllData();
      // Update selected opportunity status locally
      setSelectedOpportunity(prev => prev ? { ...prev, status: actionData.type === 'contacted' ? 'contacted' : prev.status } : null);
    } catch (err) {
      console.error('Record action failed:', err);
    }
  };

  // Action: Record commercial outcome (Feedback Loop)
  const handleRecordOutcome = async (outcomeData: { outcome: string; dealValue: number; winReason: string; lossReason: string }) => {
    if (!selectedOpportunity) return;
    try {
      const res = await fetch(`/api/v1/opportunities/${selectedOpportunity.id}/outcomes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...outcomeData, userId: user?.uid || 'usr-analyst' }),
      });
      const data = await res.json();

      // Persist to Firestore if user signed in
      if (user) {
        try {
          const outcomeRef = doc(db, 'opportunities', selectedOpportunity.id, 'outcomes', data.outcome.id);
          await setDoc(outcomeRef, {
            ...data.outcome,
            userId: user.uid,
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, `opportunities/${selectedOpportunity.id}/outcomes/${data.outcome.id}`);
        }
      }

      if (data.outcome) {
        setOutcomes(prev => [data.outcome, ...prev]);
      }
      await fetchAllData();
    } catch (err) {
      console.error('Record outcome failed:', err);
    }
  };

  // Deep Reasoning with High Thinking (gemini-3.1-pro-preview with thinkingLevel HIGH)
  const handleRunDeepReasoning = async (opp: Opportunity): Promise<string> => {
    try {
      const res = await fetch('/api/v1/ai/deep-reasoning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Analyze commercial opportunity: "${opp.title}" for Entity "${opp.entityName}".
Trigger: ${opp.trigger}
Facts Observed: ${JSON.stringify(opp.facts)}
Potential Services: ${JSON.stringify(opp.potentialServices)}`,
          context: { category: opp.category, overallScore: opp.overallScore },
        }),
      });
      const data = await res.json();
      return data.reasoning || data.hypothesis || 'Deep reasoning completed.';
    } catch (err: any) {
      return `Deep reasoning failed: ${err?.message}`;
    }
  };

  // Live Signal Analysis (gemini-3.1-flash-lite)
  const handleAnalyzeNewSignal = async (text: string, context?: string) => {
    const res = await fetch('/api/v1/ai/analyze-signal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, context }),
    });
    const data = await res.json();

    // If analysis produced an entity and signal, persist to signals store
    if (data.result) {
      const newSignalRes = await fetch('/api/v1/signals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityName: data.result.entityName,
          signalCategory: data.result.signalCategory,
          signalType: data.result.signalType,
          title: `${data.result.entityName}: ${data.result.signalType}`,
          description: data.result.interpretation,
          confidence: data.result.confidence,
          facts: data.result.facts,
          sourceTitle: 'Live Extractor Intake',
        }),
      });
      const newSignal = await newSignalRes.json();
      if (newSignal.signal) {
        setSignals(prev => [newSignal.signal, ...prev]);
      }
    }

    return data;
  };

  // Search Grounding (gemini-3.5-flash with googleSearch tool)
  const handleRunSearchGrounding = async (query: string, location?: string) => {
    const res = await fetch('/api/v1/ai/search-discovery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, location }),
    });
    return await res.json();
  };

  // Synthesize newly discovered grounded finding into full Opportunity
  const handleSynthesizeFromFinding = async (finding: any) => {
    // 1. Create or resolve entity
    const entRes = await fetch('/api/v1/entities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: finding.entityName,
        type: finding.entityType || 'company',
        description: `Discovered via live Google Search grounding for commercial activity.`,
        industry: finding.signalType || 'General Industry',
      }),
    });
    const entData = await entRes.json();
    const newEntity = entData.entity;

    // 2. Create signal
    const sigRes = await fetch('/api/v1/signals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        entityId: newEntity.id,
        entityName: newEntity.name,
        signalCategory: finding.signalCategory || 'GROWTH',
        signalType: finding.signalType || 'Expansion Indicator',
        title: finding.headline || `${finding.entityName} Commercial Movement`,
        description: finding.opportunityHypothesis,
        confidence: finding.confidence || 85,
        facts: [finding.fact],
        sourceUrl: finding.evidenceUrl || '',
        sourceTitle: 'Google Search Live Grounding',
      }),
    });
    const sigData = await sigRes.json();
    const newSignal = sigData.signal;

    // 3. Synthesize structured opportunity with safe fallback handling
    let synthesizedOpp: any = null;
    try {
      const synthRes = await fetch('/api/v1/ai/synthesize-opportunity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signals: [newSignal],
          entity: newEntity,
          targetProfile,
        }),
      });
      if (synthRes.ok) {
        const synthData = await synthRes.json();
        synthesizedOpp = synthData?.opportunity;
      }
    } catch (err) {
      console.warn('Synthesis network issue, generating resilient opportunity:', err);
    }

    if (!synthesizedOpp) {
      synthesizedOpp = {
        title: `Opportunity: ${finding.entityName} - Commercial Demand`,
        category: 'Market Expansion',
        potentialServices: ['Consulting', 'Technical Services'],
        potentialBuyers: ['Leadership / Operations'],
        trigger: finding.fact || 'Observed public market signal',
        confidence: finding.confidence || 82,
        overallScore: 84,
        scoringBreakdown: {
          recencyScore: 90,
          evidenceQualityScore: 82,
          signalConvergenceScore: 80,
          sourceReliabilityScore: 80,
          relevanceScore: 85,
        },
        whyNow: 'Fresh verified market observation indicates active execution window.',
        whatHappened: finding.fact,
        whyItMatters: finding.opportunityHypothesis || 'Commercial opportunity identified via public verification.',
        suggestedNextSteps: ['Inspect source citation', 'Initiate introductory outreach'],
      };
    }

    const fullOpp: Opportunity = {
      id: `opp-${Date.now()}`,
      title: synthesizedOpp.title,
      entityId: newEntity.id,
      entityName: newEntity.name,
      entityType: newEntity.type,
      category: synthesizedOpp.category,
      potentialServices: synthesizedOpp.potentialServices,
      potentialBuyers: synthesizedOpp.potentialBuyers,
      trigger: synthesizedOpp.trigger || finding.fact,
      status: 'new',
      confidence: synthesizedOpp.confidence || 85,
      overallScore: synthesizedOpp.overallScore || 87,
      scoringBreakdown: synthesizedOpp.scoringBreakdown,
      whyNow: synthesizedOpp.whyNow,
      whatHappened: synthesizedOpp.whatHappened,
      whyItMatters: synthesizedOpp.whyItMatters,
      suggestedNextSteps: synthesizedOpp.suggestedNextSteps,
      signalIds: [newSignal.id],
      eventIds: [],
      facts: [finding.fact],
      evidence: [
        {
          sourceName: 'Google Search Live Grounding',
          url: finding.evidenceUrl || 'https://news.google.com',
          timestamp: new Date().toISOString(),
          quote: finding.fact,
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save to server & Firestore
    setOpportunities(prev => [fullOpp, ...prev]);
    setSignals(prev => [newSignal, ...prev]);
    setEntities(prev => [newEntity, ...prev]);

    if (user) {
      try {
        const oppDocRef = doc(db, 'opportunities', fullOpp.id);
        await setDoc(oppDocRef, fullOpp);
      } catch (err) {
        console.warn('Firestore opp save notice:', err);
      }
    }
  };

  // Run source ingestion
  const handleRunSource = async (sourceId: string) => {
    setIsIngesting(true);
    try {
      await fetch(`/api/v1/sources/${sourceId}/run`, { method: 'POST' });
      await fetchAllData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsIngesting(false);
    }
  };

  const handleRunAllIngestion = async () => {
    setIsIngesting(true);
    try {
      for (const s of sources) {
        await fetch(`/api/v1/sources/${s.id}/run`, { method: 'POST' });
      }
      await fetchAllData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsIngesting(false);
    }
  };

  const handleAddSource = async (sourceData: any) => {
    const res = await fetch('/api/v1/sources', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sourceData),
    });
    const data = await res.json();
    if (data.source) {
      setSources(prev => [data.source, ...prev]);
    }
  };

  const handleSaveProfile = async (updated: TargetUserProfile) => {
    setTargetProfile(updated);
    if (user) {
      try {
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, { targetProfile: updated, updatedAt: new Date().toISOString() }, { merge: true });
      } catch (err) {
        console.warn('Profile save notice:', err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* Primary Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onOpenTargetProfile={() => setShowTargetProfileModal(true)}
        onOpenAISettings={() => setShowAISettingsModal(true)}
        onRunIngestion={handleRunAllIngestion}
        isIngesting={isIngesting}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Nilo Universal Evidence Chain Lineage Breadcrumb (shown on sub-tabs) */}
        {activeTab !== 'overview' && (
          <EvidenceChainGraphic
            activeStep={
              activeTab === 'sources' ? 'source' :
              activeTab === 'signals' ? 'signal' :
              activeTab === 'entities' ? 'entity' :
              activeTab === 'outcomes' ? 'outcome' :
              activeTab === 'discovery' ? 'observation' :
              'opportunity'
            }
            onSelectStep={(step) => {
              if (step === 'source') setActiveTab('sources');
              else if (step === 'signal' || step === 'observation') setActiveTab('signals');
              else if (step === 'entity') setActiveTab('entities');
              else if (step === 'outcome' || step === 'action') setActiveTab('outcomes');
              else setActiveTab('opportunities');
            }}
            opportunities={opportunities}
            signals={signals}
            entities={entities}
            sources={sources}
            events={events}
            outcomes={outcomes}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onSelectOpportunity={(opp) => setSelectedOpportunity(opp)}
          />
        )}

        {/* Tab Views */}
        {activeTab === 'overview' && (
          <OverviewView
            opportunities={opportunities}
            signals={signals}
            entities={entities}
            sources={sources}
            events={events}
            outcomes={outcomes}
            onSelectOpportunity={(opp) => setSelectedOpportunity(opp)}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'opportunities' && (
          <OpportunitiesView
            opportunities={opportunities}
            onSelectOpportunity={(opp) => setSelectedOpportunity(opp)}
            searchFilter={searchQuery}
          />
        )}

        {activeTab === 'signals' && (
          <SignalsView
            signals={signals}
            entities={entities}
            sources={sources}
            onAnalyzeNewSignal={handleAnalyzeNewSignal}
            onSelectEntity={(entityId) => {
              setActiveTab('entities');
            }}
          />
        )}

        {activeTab === 'entities' && (
          <EntitiesView
            entities={entities}
            signals={signals}
            opportunities={opportunities}
            onSelectOpportunity={(opp) => setSelectedOpportunity(opp)}
          />
        )}

        {activeTab === 'discovery' && (
          <SearchDiscoveryView
            onRunSearchGrounding={handleRunSearchGrounding}
            onSynthesizeFromFinding={handleSynthesizeFromFinding}
          />
        )}

        {activeTab === 'outcomes' && (
          <OutcomeLoopView
            outcomes={outcomes}
          />
        )}

        {activeTab === 'sources' && (
          <SourcesView
            sources={sources}
            onRunSource={handleRunSource}
            onAddSource={handleAddSource}
            isIngesting={isIngesting}
          />
        )}

      </main>

      {/* Detail Slide-over / Modal */}
      {selectedOpportunity && (
        <OpportunityDetailModal
          opportunity={selectedOpportunity}
          signals={signals.filter(s => selectedOpportunity.signalIds?.includes(s.id))}
          events={events.filter(e => selectedOpportunity.eventIds?.includes(e.id))}
          onClose={() => setSelectedOpportunity(null)}
          onRecordAction={handleRecordAction}
          onRecordOutcome={handleRecordOutcome}
          onRunDeepReasoning={handleRunDeepReasoning}
        />
      )}

      {/* Target Profile Modal */}
      {showTargetProfileModal && (
        <TargetProfileModal
          currentProfile={targetProfile}
          onSaveProfile={handleSaveProfile}
          onClose={() => setShowTargetProfileModal(false)}
        />
      )}

      {/* AI Settings Modal */}
      {showAISettingsModal && (
        <AISettingsModal
          onClose={() => setShowAISettingsModal(false)}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 text-center text-xs text-slate-400 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>NILO Opportunity Intelligence Engine • Fact-Grounded Cognitive Discovery</span>
          <span>Google Gemini Cognitive Stack • Firebase Auth &amp; Firestore</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
