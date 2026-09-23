/**
 * Modular Scoring Engine for Nilo
 * Never uses a single opaque AI number. Every dimension is explicit,
 * auditable, and calibrated by historical outcome feedback.
 */

export interface ScoreComponents {
  recencyScore: number;          // 0-100: How fresh are the signals (exponential decay)
  evidenceQualityScore: number;  // 0-100: Directness, presence of verifiable URLs & quotes
  signalConvergenceScore: number;// 0-100: Multiple independent signals pointing to same need
  sourceReliabilityScore: number;// 0-100: Permitted platform authority & verified status
  relevanceScore: number;        // 0-100: Semantic alignment with target user's profile
  historicalCalibrationScore: number; // 0-100: Boost based on past won/meeting outcomes for similar signals
  overallScore: number;          // Weighted composite (0-100)
}

export interface TargetUserProfile {
  services?: string[];
  industries?: string[];
  locations?: string[];
  preferredOpportunity?: string;
  minConfidence?: number;
}

export interface HistoricalOutcomeStats {
  totalLogged: number;
  wonCount: number;
  meetingCount: number;
  lostCount: number;
  conversionMultiplierBySignalType: Record<string, number>;
}

export class OpportunityScorer {
  private weights = {
    recency: 0.20,
    evidenceQuality: 0.20,
    signalConvergence: 0.25,
    sourceReliability: 0.15,
    relevance: 0.10,
    historicalCalibration: 0.10,
  };

  /**
   * Deterministic transparent score calculation
   */
  public score(
    opportunity: {
      createdAt?: string;
      confidence?: number;
      facts?: string[];
      evidence?: any[];
      signalIds?: string[];
      category?: string;
      potentialServices?: string[];
      scoringBreakdown?: Partial<ScoreComponents>;
    },
    signals: any[] = [],
    targetProfile?: TargetUserProfile,
    historicalStats?: HistoricalOutcomeStats
  ): ScoreComponents {
    // 1. Recency Score (Exponential temporal decay)
    const now = Date.now();
    const created = opportunity.createdAt ? new Date(opportunity.createdAt).getTime() : now;
    const ageInDays = Math.max(0, (now - created) / (1000 * 60 * 60 * 24));
    // Signals average age
    let signalAgeBonus = 0;
    if (signals.length > 0) {
      const avgSignalDays = signals.reduce((acc, s) => {
        const obs = s.observedAt ? new Date(s.observedAt).getTime() : now;
        return acc + Math.max(0, (now - obs) / (1000 * 60 * 60 * 24));
      }, 0) / signals.length;
      signalAgeBonus = Math.max(0, (14 - avgSignalDays) * 2);
    }
    const recencyRaw = Math.max(40, 100 - ageInDays * 4 + signalAgeBonus);
    const recencyScore = Math.min(100, Math.round(recencyRaw));

    // 2. Evidence Quality Score (Verifiable facts + quotes + URLs)
    const factsCount = (opportunity.facts || []).length;
    const evidenceCount = (opportunity.evidence || []).length;
    const directQuotesCount = (opportunity.evidence || []).filter(e => e.quote && e.quote.length > 20).length;
    const evidenceQualityRaw = 50 + Math.min(25, factsCount * 6) + Math.min(15, evidenceCount * 5) + Math.min(10, directQuotesCount * 5);
    const evidenceQualityScore = Math.min(100, Math.round(evidenceQualityRaw));

    // 3. Signal Convergence Score (Crucial: 1 signal is just noise, 3+ independent signals is an event)
    const signalCount = Math.max(signals.length, (opportunity.signalIds || []).length);
    let convergenceRaw = 55;
    if (signalCount === 1) convergenceRaw = 62;
    else if (signalCount === 2) convergenceRaw = 78;
    else if (signalCount === 3) convergenceRaw = 88;
    else if (signalCount >= 4) convergenceRaw = 95;

    // Check diversity of signal categories
    const categories = new Set(signals.map(s => s.signalCategory).filter(Boolean));
    if (categories.size >= 2) convergenceRaw += 4;
    const signalConvergenceScore = Math.min(100, Math.round(convergenceRaw));

    // 4. Source Reliability Score
    let sourceScoreRaw = 75;
    const verifiedSources = signals.filter(s => s.sourceUrl && (s.sourceUrl.includes('.gov') || s.sourceUrl.includes('.edu') || s.sourceUrl.includes('sec.gov') || s.sourceUrl.includes('linkedin') || s.sourceUrl.includes('github')));
    if (verifiedSources.length > 0) sourceScoreRaw += 15;
    const sourceReliabilityScore = Math.min(100, Math.round(sourceScoreRaw));

    // 5. Relevance Score (Fit to User's Services / Profile)
    let relevanceScore = 80;
    if (targetProfile?.services && targetProfile.services.length > 0) {
      const userServices = targetProfile.services.map(s => s.toLowerCase());
      const oppServices = (opportunity.potentialServices || []).map(s => s.toLowerCase());
      const match = oppServices.some(os => userServices.some(us => os.includes(us) || us.includes(os)));
      if (match) relevanceScore = 95;
      else relevanceScore = 72;
    }

    // 6. Historical Calibration Score (Feedback Learning from Outcomes!)
    let historicalScore = 75;
    if (historicalStats && historicalStats.totalLogged > 0) {
      // If past signals of this category converted to "won" or "meeting", increase historical rating
      const multiplier = historicalStats.conversionMultiplierBySignalType[opportunity.category || ''] || 1.0;
      historicalScore = Math.min(100, Math.round(75 * multiplier));
    }

    // Overall Weighted Composite
    const overallScore = Math.round(
      recencyScore * this.weights.recency +
      evidenceQualityScore * this.weights.evidenceQuality +
      signalConvergenceScore * this.weights.signalConvergence +
      sourceReliabilityScore * this.weights.sourceReliability +
      relevanceScore * this.weights.relevance +
      historicalScore * this.weights.historicalCalibration
    );

    return {
      recencyScore,
      evidenceQualityScore,
      signalConvergenceScore,
      sourceReliabilityScore,
      relevanceScore,
      historicalCalibrationScore: historicalScore,
      overallScore: Math.min(100, Math.max(10, overallScore)),
    };
  }
}
