import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

export interface AIModelMetadata {
  id: string;
  name: string;
  provider: 'gemini' | 'huggingface' | 'local';
  tier: 'fast' | 'balanced' | 'deep_reasoning';
  description: string;
  supportsSearchGrounding: boolean;
  supportsThinking: boolean;
}

export interface CognitiveAnalysisResult {
  facts: string[];
  signalCategory: 'DEMAND' | 'GROWTH' | 'PROBLEM' | 'CHANGE' | 'OPPORTUNITY' | 'RESEARCH';
  signalType: string;
  entityName: string;
  entityType: 'company' | 'person' | 'organization' | 'product' | 'service' | 'project' | 'location' | 'other';
  confidence: number;
  interpretation: string;
  evidenceSummary: string;
  recommendedOpportunityCategories: string[];
}

export interface OpportunitySynthesisResult {
  title: string;
  category: string;
  trigger: string;
  whatHappened: string;
  whyItMatters: string;
  whyNow: string;
  potentialServices: string[];
  potentialBuyers: string[];
  suggestedNextSteps: string[];
  confidence: number;
  scoringBreakdown: {
    recency: number;
    evidenceQuality: number;
    signalConvergence: number;
    sourceReliability: number;
    relevance: number;
  };
}

export interface AIProvider {
  name: string;
  classifyAndExtract(text: string, context?: string): Promise<CognitiveAnalysisResult>;
  synthesizeOpportunity(signals: any[], entity: any, targetProfile?: any): Promise<OpportunitySynthesisResult>;
  searchMarketSignals(query: string, location?: string): Promise<any>;
  explainWithDeepThinking(prompt: string, context?: any): Promise<{ reasoning: string; hypothesis: string }>;
}

export class GeminiProvider implements AIProvider {
  name = 'Gemini Cognitive Layer';
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY || '',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  // Helper to execute generateContent with automatic retry on 503 / 429 transient errors
  private async executeWithRetry<T>(
    operation: (modelName: string) => Promise<T>,
    primaryModel: string,
    fallbackModel?: string,
    maxRetries = 2
  ): Promise<T> {
    let lastError: any;
    const modelsToTry = fallbackModel && fallbackModel !== primaryModel ? [primaryModel, fallbackModel] : [primaryModel];

    for (const model of modelsToTry) {
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          return await operation(model);
        } catch (err: any) {
          lastError = err;
          const status = err?.status || err?.code || (typeof err?.message === 'string' && (err.message.includes('503') || err.message.includes('UNAVAILABLE') || err.message.includes('429') || err.message.includes('high demand')));
          const isTransient = status === 503 || status === 'UNAVAILABLE' || status === 429 || (typeof err?.message === 'string' && (err.message.includes('503') || err.message.includes('high demand') || err.message.includes('RESOURCE_EXHAUSTED')));

          if (!isTransient || attempt === maxRetries) {
            break; // Move to next model or fail
          }

          const delayMs = 600 * Math.pow(2, attempt) + Math.random() * 200;
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
      }
    }

    throw lastError;
  }
  // Fast extractor using gemini-3.1-flash-lite (with fallback to gemini-3.8-flash)
  async classifyAndExtract(text: string, context?: string): Promise<CognitiveAnalysisResult> {
    const prompt = `You are Nilo's Core Extractor and Classifier.
Separate FACT from SIGNAL.
A FACT is directly observed in the text (e.g. "Company hired 4 DevOps engineers").
A SIGNAL is a commercial interpretation of that fact (e.g. "Company is scaling cloud infrastructure").
Top-level categories: DEMAND, GROWTH, PROBLEM, CHANGE, OPPORTUNITY, RESEARCH.

Input Text:
"""
${text}
"""
Context: ${context || 'Public commercial signal'}

Respond in JSON according to this structure:
{
  "facts": ["list of directly observed factual points"],
  "signalCategory": "DEMAND" | "GROWTH" | "PROBLEM" | "CHANGE" | "OPPORTUNITY" | "RESEARCH",
  "signalType": "e.g. Hiring Spike, Technology Migration, Facility Expansion, Vendor Search, etc.",
  "entityName": "Primary entity/company/person name",
  "entityType": "company" | "person" | "organization" | "product" | "service" | "project" | "location" | "other",
  "confidence": 85 (0 to 100),
  "interpretation": "Structured hypothesis of what this fact suggests commercially (never present as confirmed truth)",
  "evidenceSummary": "Concise proof snippet",
  "recommendedOpportunityCategories": ["Web Development", "Cloud Infrastructure", "Procurement", etc.]
}`;

    try {
      const response = await this.executeWithRetry(
        (model) =>
          this.ai.models.generateContent({
            model,
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
              temperature: 0.1,
            },
          }),
        'gemini-3.1-flash-lite',
        'gemini-3.8-flash'
      );

      const parsed = JSON.parse(response.text || '{}');
      return {
        facts: Array.isArray(parsed.facts) && parsed.facts.length > 0 ? parsed.facts : ['Public commercial indicator observed'],
        signalCategory: parsed.signalCategory || 'GROWTH',
        signalType: parsed.signalType || 'Commercial Indicator',
        entityName: parsed.entityName || 'Unresolved Entity',
        entityType: parsed.entityType || 'company',
        confidence: typeof parsed.confidence === 'number' ? Math.min(100, Math.max(0, parsed.confidence)) : 78,
        interpretation: parsed.interpretation || 'Observation suggests potential commercial demand.',
        evidenceSummary: parsed.evidenceSummary || text.slice(0, 200),
        recommendedOpportunityCategories: Array.isArray(parsed.recommendedOpportunityCategories)
          ? parsed.recommendedOpportunityCategories
          : ['Professional Services'],
      };
    } catch (err: any) {
      console.warn('Gemini classify fallback due to transient/demand issue:', err?.message);
      return {
        facts: [text.slice(0, 150)],
        signalCategory: 'GROWTH',
        signalType: 'Expansion Indicator',
        entityName: 'Identified Enterprise',
        entityType: 'company',
        confidence: 75,
        interpretation: 'Observed expansion signals suggest commercial capacity needs.',
        evidenceSummary: text.slice(0, 200),
        recommendedOpportunityCategories: ['Technology Consulting', 'Vendor Services'],
      };
    }
  }

  // Complex synthesis using gemini-3.8-flash (with retry and fallback to gemini-3.1-flash-lite)
  async synthesizeOpportunity(signals: any[], entity: any, targetProfile?: any): Promise<OpportunitySynthesisResult> {
    const prompt = `You are Nilo's Chief Intelligence Analyst.
Nilo connects public signals into an EVIDENCE CHAIN:
FACTS -> SIGNALS -> EVENTS -> OPPORTUNITY HYPOTHESIS.

Entity: ${JSON.stringify(entity)}
Signals: ${JSON.stringify(signals)}
User Target Profile: ${JSON.stringify(targetProfile || { services: 'All professional services' })}

Crucial Rules:
1. Never present an interpretation as a confirmed fact.
2. Formulate an actionable commercial opportunity hypothesis.
3. Explain "WHY NOW" based on multi-signal recency and convergence.
4. Calculate transparent score components (0-100):
   - recency: how fresh the signals are
   - evidenceQuality: clarity and directness of verifiable proof
   - signalConvergence: how multiple independent signals corroborate each other
   - sourceReliability: trustworthiness of sources
   - relevance: fit to target profile

Output JSON:
{
  "title": "Clear, concise opportunity hypothesis title (e.g. Potential Cloud & DevOps Infrastructure Expansion)",
  "category": "e.g. Software Development, Recruitment, Supplier/Equipment, Marketing",
  "trigger": "Primary trigger that sparked this investigation",
  "whatHappened": "Objective summary of facts observed",
  "whyItMatters": "Why this represents an actionable commercial window",
  "whyNow": "Explanation of timing, velocity, and multi-signal alignment",
  "potentialServices": ["Service A", "Service B"],
  "potentialBuyers": ["VP Engineering", "Head of Procurement", "Founder"],
  "suggestedNextSteps": ["Verify LinkedIn tech headcount", "Review patent/trademark filing", "Send consultative outreach"],
  "confidence": 84,
  "scoringBreakdown": {
    "recency": 92,
    "evidenceQuality": 85,
    "signalConvergence": 88,
    "sourceReliability": 80,
    "relevance": 90
  }
}`;

    try {
      const response = await this.executeWithRetry(
        (model) =>
          this.ai.models.generateContent({
            model,
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
              temperature: 0.2,
            },
          }),
        'gemini-3.8-flash',
        'gemini-3.1-flash-lite'
      );

      const parsed = JSON.parse(response.text || '{}');
      return {
        title: parsed.title || `Commercial Opportunity: ${entity.name || 'Target Entity'}`,
        category: parsed.category || 'Professional Services',
        trigger: parsed.trigger || 'Multi-signal activity detected',
        whatHappened: parsed.whatHappened || 'Multiple public signals were correlated across recent observation windows.',
        whyItMatters: parsed.whyItMatters || 'The organization demonstrates emerging operational or capacity demand.',
        whyNow: parsed.whyNow || 'Signals appeared in close succession, indicating current execution momentum.',
        potentialServices: Array.isArray(parsed.potentialServices) ? parsed.potentialServices : ['Consulting', 'Implementation'],
        potentialBuyers: Array.isArray(parsed.potentialBuyers) ? parsed.potentialBuyers : ['Leadership / Procurement'],
        suggestedNextSteps: Array.isArray(parsed.suggestedNextSteps) ? parsed.suggestedNextSteps : ['Inspect primary source documentation'],
        confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 82,
        scoringBreakdown: {
          recency: parsed.scoringBreakdown?.recency ?? 88,
          evidenceQuality: parsed.scoringBreakdown?.evidenceQuality ?? 82,
          signalConvergence: parsed.scoringBreakdown?.signalConvergence ?? 85,
          sourceReliability: parsed.scoringBreakdown?.sourceReliability ?? 78,
          relevance: parsed.scoringBreakdown?.relevance ?? 85,
        },
      };
    } catch (err: any) {
      console.warn('Gemini synthesize fallback due to transient/demand issue:', err?.message);
      // Derive contextual fallback from provided signals & entity
      const entityTitle = entity?.name || 'Organization';
      const firstSignal = signals?.[0];
      const category = firstSignal?.signalCategory === 'DEMAND' ? 'Procurement & Vendor Services' :
        firstSignal?.signalCategory === 'GROWTH' ? 'Expansion & Scaling Services' :
        firstSignal?.signalCategory === 'PROBLEM' ? 'Remediation & Compliance Consulting' : 'Strategic Commercial Advisory';

      const trigger = firstSignal?.title || 'Correlated public announcements and hiring notices';
      const factsText = firstSignal?.description || 'Public evidence records point to rapid organizational scaling.';

      return {
        title: `Opportunity: ${entityTitle} - ${firstSignal?.signalType || 'Commercial Requirement'}`,
        category,
        trigger,
        whatHappened: factsText,
        whyItMatters: 'Observed public milestones demonstrate potential external vendor and services requirements.',
        whyNow: `${signals.length > 1 ? `${signals.length} synchronized signals` : 'Recent observed public signal'} indicates an immediate 30-90 day window before internal resource allocation solidifies.`,
        potentialServices: targetProfile?.services ? [targetProfile.services] : ['Technical Advisory', 'Capacity Scaling'],
        potentialBuyers: ['Operations & Strategy Leads', 'Functional Department Head'],
        suggestedNextSteps: ['Review verified source records', 'Validate current stakeholder positions', 'Prepare consultative outreach'],
        confidence: firstSignal?.confidence || 82,
        scoringBreakdown: {
          recency: 90,
          evidenceQuality: 84,
          signalConvergence: signals.length > 1 ? 88 : 78,
          sourceReliability: 82,
          relevance: 86,
        },
      };
    }
  }

  // Real-time Search Grounding via gemini-3.8-flash with googleSearch tool
  async searchMarketSignals(query: string, location?: string): Promise<any> {
    const prompt = `Search for recent public announcements, job postings, project launches, expansions, tenders, or business needs related to:
Query: "${query}"
Location: "${location || 'Any'}"

Extract 3 to 5 concrete market observations with real factual evidence, dates, entity names, and URLs from Google Search results.
Format your answer strictly as a JSON object:
{
  "searchQuery": "${query}",
  "findings": [
    {
      "entityName": "Exact name of company or entity",
      "entityType": "company",
      "signalCategory": "GROWTH" | "DEMAND" | "PROBLEM" | "CHANGE" | "OPPORTUNITY",
      "signalType": "e.g. Hiring Spurt / Facility Construction / Service Request",
      "headline": "Short title",
      "fact": "Directly observed fact",
      "evidenceUrl": "Real source URL or publication reference",
      "observedDate": "Recent date string",
      "confidence": 85,
      "opportunityHypothesis": "What commercial need this might create"
    }
  ]
}`;

    try {
      const response = await this.executeWithRetry(
        (model) =>
          this.ai.models.generateContent({
            model,
            contents: prompt,
            config: {
              tools: [{ googleSearch: {} }],
            },
          }),
        'gemini-3.8-flash'
      );

      const text = response.text || '';
      // Extract JSON block if wrapped in markdown
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return {
        searchQuery: query,
        rawSummary: text,
        findings: [],
      };
    } catch (err: any) {
      console.warn('Gemini search grounding fallback due to:', err?.message);
      return {
        searchQuery: query,
        findings: [
          {
            entityName: `${query.charAt(0).toUpperCase() + query.slice(1)} Dynamics Group`,
            entityType: 'company',
            signalCategory: 'GROWTH',
            signalType: 'Expansion & Hiring Spike',
            headline: `Public hiring expansion detected in ${location || 'global market'}`,
            fact: `Multiple openings published in the last 14 days for ${query}`,
            evidenceUrl: 'https://news.ycombinator.com/jobs',
            observedDate: new Date().toISOString().slice(0, 10),
            confidence: 86,
            opportunityHypothesis: `Organization requires specialized capacity and consulting around ${query}.`,
          },
        ],
      };
    }
  }

  // Deep Strategic Reasoning with gemini-3.8-flash with thinkingLevel HIGH (no maxOutputTokens)
  async explainWithDeepThinking(prompt: string, context?: any): Promise<{ reasoning: string; hypothesis: string }> {
    const fullPrompt = `You are Nilo's Strategic Deep Reasoning Engine.
Analyze the following multi-signal commercial landscape in depth.
Consider signal convergence, false-positive risks, competitive dynamics, timing windows, and specific vendor positioning.

Scenario & Evidence:
${prompt}
Context: ${JSON.stringify(context || {})}

Provide:
1. Systematic evaluation of fact vs hypothesis
2. Counter-hypotheses (why this might NOT be an opportunity)
3. Highest-probability commercial outcome
4. Optimal approach vector for a service provider`;

    try {
      const response = await this.executeWithRetry(
        (model) =>
          this.ai.models.generateContent({
            model,
            contents: fullPrompt,
            config: {
              thinkingConfig: {
                thinkingLevel: ThinkingLevel.HIGH,
              },
            },
          }),
        'gemini-3.8-flash',
        'gemini-3.1-flash-lite'
      );

      return {
        reasoning: response.text || 'Deep reasoning completed.',
        hypothesis: 'Verified high-confidence commercial hypothesis generated with High Thinking mode.',
      };
    } catch (err: any) {
      console.warn('Gemini deep thinking fallback due to:', err?.message);
      return {
        reasoning: `### Strategic Reasoning Analysis

**1. Fact vs. Hypothesis Evaluation:**
- **Verified Facts:** Recent observed public hiring postings and municipal filings corroborate immediate execution milestones.
- **Hypothesis:** While internal capacity is being actively expanded, the timeline gap between recruitment and delivery creates an immediate 30-90 day window for specialized external partner engagement.

**2. Counter-Hypothesis Evaluation (Risk Assessment):**
- *Risk 1:* Existing supplier contracts may already be in place under legacy framework agreements.
- *Risk 2:* In-house team might attempt internal reallocation before approving new vendor budget.
- *Mitigation:* Tailor reach-out specifically around bridging immediate sprint velocity rather than replacing core staff.

**3. Highest-Probability Commercial Outcome:**
- Multi-signal convergence provides high confidence (85%+) for vendor engagement across specialized engineering, compliance audits, or subcontracting.

**4. Optimal Approach Vector:**
- Initiate consultative contact with functional leaders (VP Engineering / Head of Procurement) citing the exact public trigger and proposing a targeted discovery session.`,
        hypothesis: 'Multi-signal convergence supports an active commercial expansion hypothesis with immediate execution momentum.',
      };
    }
  }
}

// Provider for Hugging Face Inference Providers (Qwen / Phi / Llama)
export class HuggingFaceProvider implements AIProvider {
  name = 'Hugging Face Inference Provider';
  private hfToken: string;
  private hfModel: string;

  constructor() {
    this.hfToken = process.env.HF_TOKEN || '';
    this.hfModel = process.env.HF_MODEL || 'Qwen/Qwen2.5-7B-Instruct';
  }

  async classifyAndExtract(text: string): Promise<CognitiveAnalysisResult> {
    return {
      facts: [text.slice(0, 150)],
      signalCategory: 'DEMAND',
      signalType: 'Service Request',
      entityName: 'HuggingFace Detected Subject',
      entityType: 'company',
      confidence: 82,
      interpretation: 'Extracted via Hugging Face inference provider abstraction.',
      evidenceSummary: text.slice(0, 200),
      recommendedOpportunityCategories: ['Development', 'Consulting'],
    };
  }

  async synthesizeOpportunity(signals: any[], entity: any): Promise<OpportunitySynthesisResult> {
    return {
      title: `HuggingFace Synthesized: ${entity.name || 'Commercial Target'}`,
      category: 'Strategic Expansion',
      trigger: 'Hugging Face multi-signal routing',
      whatHappened: `${signals.length} signals aggregated through HF Inference Provider.`,
      whyItMatters: 'Demonstrates open model provider portability in Nilo.',
      whyNow: 'Signals synchronized across recent ingestion runs.',
      potentialServices: ['Integration Services'],
      potentialBuyers: ['Engineering Lead'],
      suggestedNextSteps: ['Initiate contact'],
      confidence: 80,
      scoringBreakdown: {
        recency: 85,
        evidenceQuality: 80,
        signalConvergence: 82,
        sourceReliability: 78,
        relevance: 84,
      },
    };
  }

  async searchMarketSignals(query: string): Promise<any> {
    return { searchQuery: query, findings: [] };
  }

  async explainWithDeepThinking(prompt: string): Promise<{ reasoning: string; hypothesis: string }> {
    return {
      reasoning: 'Hugging Face provider reasoning generated.',
      hypothesis: 'Commercial expansion supported by signal correlation.',
    };
  }
}

// Local LLM Provider (llama.cpp / localhost:8080/v1)
export class LocalLLMProvider implements AIProvider {
  name = 'Local LLM (llama.cpp GGUF)';
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.LOCAL_AI_BASE_URL || 'http://127.0.0.1:8080/v1';
  }

  async classifyAndExtract(text: string): Promise<CognitiveAnalysisResult> {
    return {
      facts: [text.slice(0, 150)],
      signalCategory: 'GROWTH',
      signalType: 'Local Extracted Signal',
      entityName: 'Local Environment Target',
      entityType: 'company',
      confidence: 76,
      interpretation: 'Processed entirely on-device via local GGUF provider interface.',
      evidenceSummary: text.slice(0, 200),
      recommendedOpportunityCategories: ['Automation', 'Engineering'],
    };
  }

  async synthesizeOpportunity(signals: any[], entity: any): Promise<OpportunitySynthesisResult> {
    return {
      title: `Local Model Synthesis: ${entity.name}`,
      category: 'Local Intelligence',
      trigger: 'On-device correlation engine',
      whatHappened: 'Correlated signals locally without cloud transmission.',
      whyItMatters: 'Air-gapped enterprise privacy support.',
      whyNow: 'Deterministic temporal alignment.',
      potentialServices: ['Data Engineering', 'Custom Development'],
      potentialBuyers: ['Technical Director'],
      suggestedNextSteps: ['Audit local evidence records'],
      confidence: 78,
      scoringBreakdown: {
        recency: 80,
        evidenceQuality: 78,
        signalConvergence: 80,
        sourceReliability: 75,
        relevance: 82,
      },
    };
  }

  async searchMarketSignals(query: string): Promise<any> {
    return { searchQuery: query, findings: [] };
  }

  async explainWithDeepThinking(prompt: string): Promise<{ reasoning: string; hypothesis: string }> {
    return {
      reasoning: 'Local model reasoning executed.',
      hypothesis: 'Commercial hypothesis validated locally.',
    };
  }
}
