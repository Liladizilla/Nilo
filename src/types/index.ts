export type SignalCategory = 'DEMAND' | 'GROWTH' | 'PROBLEM' | 'CHANGE' | 'OPPORTUNITY' | 'RESEARCH';

export interface ScoreComponents {
  recencyScore: number;
  evidenceQualityScore: number;
  signalConvergenceScore: number;
  sourceReliabilityScore: number;
  relevanceScore: number;
  historicalCalibrationScore?: number;
  overallScore: number;
}

export interface Signal {
  id: string;
  entityId: string;
  entityName: string;
  sourceId: string;
  sourceTitle: string;
  sourceUrl?: string;
  signalCategory: SignalCategory;
  signalType: string;
  title: string;
  description: string;
  observedAt: string;
  detectedAt: string;
  confidence: number;
  facts: string[];
  rawReference?: string;
  evidenceIds?: string[];
  createdAt: string;
}

export interface MarketEvent {
  id: string;
  title: string;
  eventType: string;
  entityIds: string[];
  triggeringSignalIds: string[];
  confidence: number;
  summary: string;
  startDate?: string;
  detectedAt: string;
  createdAt: string;
}

export interface Entity {
  id: string;
  name: string;
  type: 'company' | 'person' | 'organization' | 'product' | 'service' | 'project' | 'location' | 'other';
  description: string;
  industry: string;
  location: string;
  website?: string;
  aliases?: string[];
  signalCount?: number;
  opportunityCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface EvidenceItem {
  sourceName: string;
  url: string;
  timestamp: string;
  quote: string;
}

export interface Opportunity {
  id: string;
  title: string;
  entityId: string;
  entityName: string;
  entityType: string;
  category: string;
  potentialServices: string[];
  potentialBuyers: string[];
  trigger: string;
  status: 'new' | 'investigating' | 'saved' | 'contacted' | 'closed' | 'archived';
  confidence: number;
  overallScore: number;
  scoringBreakdown: ScoreComponents;
  whyNow: string;
  whatHappened: string;
  whyItMatters: string;
  suggestedNextSteps: string[];
  signalIds: string[];
  eventIds: string[];
  facts: string[];
  evidence: EvidenceItem[];
  createdAt: string;
  updatedAt: string;
}

export interface OpportunityAction {
  id: string;
  opportunityId: string;
  userId: string;
  type: 'investigated' | 'contacted' | 'meeting' | 'proposal' | 'saved' | 'note' | 'ignore';
  channel: string;
  notes: string;
  createdAt: string;
}

export interface OpportunityOutcome {
  id: string;
  opportunityId: string;
  userId: string;
  outcome: 'won' | 'lost' | 'meeting' | 'proposal' | 'responded' | 'no_response' | 'not_relevant' | 'unknown';
  dealValue: number;
  winReason?: string;
  lossReason?: string;
  signalsThatPredictedSuccess: string[];
  createdAt: string;
}

export interface IntelligenceSource {
  id: string;
  name: string;
  type: 'web' | 'rss' | 'api' | 'user_upload' | 'directory' | 'job_board' | 'news';
  url: string;
  status: 'active' | 'paused' | 'error';
  complianceNotes: string;
  recordsCount: number;
  signalsGenerated: number;
  lastRunAt: string;
  createdAt: string;
}

export interface TargetUserProfile {
  services: string[];
  industries: string[];
  locations: string[];
  preferredOpportunity: string;
  minConfidence: number;
}
