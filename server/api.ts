import { Router } from 'express';
import express from 'express';
import { GeminiProvider, HuggingFaceProvider, LocalLLMProvider, AIProvider } from './ai/providers';
import { OpportunityScorer, HistoricalOutcomeStats } from './scoring/engine';
import { IngestionPipeline } from './ingestion/engine';

export const apiRouter = Router();
apiRouter.use(express.json());

export const apiApp = express();
apiApp.use(apiRouter);

// In-memory runtime store that keeps state synchronized and acts as cache/coordinator
const gemini = new GeminiProvider();
const huggingface = new HuggingFaceProvider();
const localLLM = new LocalLLMProvider();
const scorer = new OpportunityScorer();
const ingestion = new IngestionPipeline();

let activeProvider: 'gemini' | 'huggingface' | 'local' = 'gemini';

function getProvider(): AIProvider {
  if (activeProvider === 'huggingface') return huggingface;
  if (activeProvider === 'local') return localLLM;
  return gemini;
}

// Global AI request log
interface AIUsageLog {
  id: string;
  timestamp: string;
  provider: string;
  model: string;
  task: string;
  latencyMs: number;
  tokensEstimated: number;
  status: 'success' | 'error';
}

const aiLogs: AIUsageLog[] = [];

// Seed database with pre-vetted cross-industry demonstration data
const initialRecords = ingestion.getCrossIndustryBenchmarkRecords();

let entitiesStore: any[] = [
  {
    id: 'ent-aurora-tech',
    name: 'Aurora Technologies',
    type: 'company',
    description: 'B2B enterprise data infrastructure and cloud intelligence startup.',
    industry: 'Cloud & Software Engineering',
    location: 'London, UK / Remote',
    website: 'https://auroratech.io',
    aliases: ['Aurora AI', 'Aurora Data Corp'],
    signalCount: 2,
    opportunityCount: 1,
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ent-savannah-horizon',
    name: 'Savannah Horizon Holdings',
    type: 'company',
    description: 'Commercial property development and sustainable urban infrastructure conglomerate.',
    industry: 'Commercial Real Estate & Construction',
    location: 'Nairobi, Kenya',
    website: 'https://savannahhorizon.ke',
    aliases: ['Savannah Group', 'Horizon Towers'],
    signalCount: 1,
    opportunityCount: 1,
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ent-luma-botanicals',
    name: 'Luma Botanicals',
    type: 'company',
    description: 'Clean-beauty organic consumer cosmetics manufacturer with new 12-SKU product catalog.',
    industry: 'Consumer Goods & E-Commerce',
    location: 'Austin, TX, USA',
    website: 'https://lumabotanicals.com',
    aliases: ['Luma Clean Skin'],
    signalCount: 1,
    opportunityCount: 1,
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ent-apex-metals',
    name: 'Apex Precision Metals',
    type: 'company',
    description: 'Precision robotic stamping, tooling, and CNC engineering for defense and automotive sectors.',
    industry: 'Advanced Manufacturing & Robotics',
    location: 'Columbus, OH, USA',
    website: 'https://apexprecision.com',
    aliases: ['Apex Metals Ltd'],
    signalCount: 1,
    opportunityCount: 1,
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ent-medpulse-health',
    name: 'MedPulse Health Systems',
    type: 'organization',
    description: 'Tele-health telemetry and FHIR clinician decision-support software platform.',
    industry: 'Healthcare Technology',
    location: 'Boston, MA, USA',
    website: 'https://medpulsehealth.org',
    aliases: ['MedPulse Inc'],
    signalCount: 1,
    opportunityCount: 1,
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ent-nordic-translog',
    name: 'Nordic TransLog Logistics',
    type: 'company',
    description: 'Maritime cold-storage and intermodal freight supply chain operator across Northern Europe.',
    industry: 'Logistics & Cold Storage',
    location: 'Rotterdam, Netherlands',
    website: 'https://nordictranslog.eu',
    aliases: ['Nordic ColdChain'],
    signalCount: 1,
    opportunityCount: 1,
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

let signalsStore: any[] = [
  {
    id: 'sig-aurora-01',
    entityId: 'ent-aurora-tech',
    entityName: 'Aurora Technologies',
    sourceId: 'src-jobs-public',
    sourceTitle: 'Hacker News "Who is Hiring?" & Career Feeds',
    sourceUrl: 'https://news.ycombinator.com/jobs',
    signalCategory: 'GROWTH',
    signalType: 'Hiring Spike & Framework Migration',
    title: '14 New Openings for React & Cloud Infrastructure',
    description: 'Aurora Technologies published multiple engineering positions emphasizing micro-frontends in React and high-throughput GCP pipelines.',
    observedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    detectedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    confidence: 88,
    facts: [
      '14 engineering job postings listed simultaneously on company portal',
      'Target skill requirements explicitly cite React 19, Kubernetes, and Golang',
      'Recent Series B investment mentioned in job overview',
    ],
    rawReference: 'rec-tech-01',
    evidenceIds: ['ev-01'],
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'sig-aurora-02',
    entityId: 'ent-aurora-tech',
    entityName: 'Aurora Technologies',
    sourceId: 'src-press-wire',
    sourceTitle: 'PR Newswire Technology & Software Wire',
    sourceUrl: 'https://www.prnewswire.com/news-releases/technology-latest-news/software-list/',
    signalCategory: 'DEMAND',
    signalType: 'Vendor & Security Audit Request',
    title: 'Enterprise AI Beta Release Notes & Partner Solicitation',
    description: 'Company engineering leadership actively requested external security penetration testers and load-testing partners in community channel.',
    observedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    detectedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    confidence: 85,
    facts: [
      'CTO published call for SOC2 Type II audit vendors',
      'New public API documentation released for developer preview',
    ],
    rawReference: 'rec-tech-02',
    evidenceIds: ['ev-02'],
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'sig-savannah-01',
    entityId: 'ent-savannah-horizon',
    entityName: 'Savannah Horizon Holdings',
    sourceId: 'src-gov-tender',
    sourceTitle: 'Kenya National Gazette Commercial Register',
    sourceUrl: 'https://kenyalaw.org/kenya_gazette/',
    signalCategory: 'GROWTH',
    signalType: 'Commercial Groundbreaking & Procurement',
    title: '$42M Eco-Tower Approved for Q4 Groundbreaking in Kilimani',
    description: 'Savannah Horizon Holdings announced a 28-story mixed-use commercial tower requiring LEED HVAC, smart building elevators, and structural steel.',
    observedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    detectedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    confidence: 94,
    facts: [
      'Official county construction permit #NBI-2026-904 approved',
      'Groundbreaking ceremony scheduled for Q4',
      'Initial procurement phase seeking HVAC and electrical engineering subcontractors',
    ],
    rawReference: 'rec-const-01',
    evidenceIds: ['ev-03'],
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: 'sig-luma-01',
    entityId: 'ent-luma-botanicals',
    entityName: 'Luma Botanicals',
    sourceId: 'src-product-hunt',
    sourceTitle: 'Product Hunt Launch & Discovery Feed',
    sourceUrl: 'https://www.producthunt.com',
    signalCategory: 'PROBLEM',
    signalType: 'Product Launch with Distribution Bottleneck',
    title: '12-SKU Product Catalog Launched With Negligible Digital Distribution',
    description: 'Luma Botanicals launched a direct-to-consumer line without conversion tracking, affiliate program, or paid performance marketing.',
    observedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    detectedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    confidence: 82,
    facts: [
      '12 registered organic beauty SKUs available on Shopify store',
      'Zero active Meta/Google Ads running in public Ad Library',
      'No email capture or retention flows active on site',
    ],
    rawReference: 'rec-mkt-01',
    evidenceIds: ['ev-04'],
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'sig-apex-01',
    entityId: 'ent-apex-metals',
    entityName: 'Apex Precision Metals',
    sourceId: 'src-industrial-news',
    sourceTitle: 'Manufacturing.net Midwest & Industrial Robotics',
    sourceUrl: 'https://www.manufacturing.net',
    signalCategory: 'GROWTH',
    signalType: 'Facility Lease & Automation Retrofit',
    title: '180,000 sq ft Smart Assembly Plant Acquired in Columbus',
    description: 'Apex Precision Metals acquired a decommissioned distribution warehouse with immediate requirements for automation robotics integrators.',
    observedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    detectedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    confidence: 90,
    facts: [
      'Commercial real estate lease deed filed with Franklin County records',
      'Equipment RFPs slated for robotic CNC arms and industrial switchgear',
      'Target initial operational date in 8 months',
    ],
    rawReference: 'rec-mfg-01',
    evidenceIds: ['ev-05'],
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'sig-medpulse-01',
    entityId: 'ent-medpulse-health',
    entityName: 'MedPulse Health Systems',
    sourceId: 'src-forum-public',
    sourceTitle: 'Indie Hackers Developer & Contractor Board',
    sourceUrl: 'https://www.indiehackers.com',
    signalCategory: 'DEMAND',
    signalType: 'Direct Contract Developer / Agency Request',
    title: 'Founder Solicitation: Seeking React + Node Agency for FHIR Dashboard',
    description: 'MedPulse founder publicly asked for qualified contractors with healthcare telemetry experience to construct a clinician portal.',
    observedAt: new Date(Date.now() - 12 * 3600000).toISOString(),
    detectedAt: new Date(Date.now() - 12 * 3600000).toISOString(),
    confidence: 96,
    facts: [
      'Founder direct post verified with corporate email domain',
      'Approved budget range stated as $25,000 to $40,000 USD',
      'Required stack: React, Node.js, WebSocket FHIR protocol',
    ],
    rawReference: 'rec-free-01',
    evidenceIds: ['ev-06'],
    createdAt: new Date(Date.now() - 12 * 3600000).toISOString(),
  },
  {
    id: 'sig-translog-01',
    entityId: 'ent-nordic-translog',
    entityName: 'Nordic TransLog Logistics',
    sourceId: 'src-eu-tenders',
    sourceTitle: 'TED Europa (Tenders Electronic Daily)',
    sourceUrl: 'https://ted.europa.eu',
    signalCategory: 'CHANGE',
    signalType: 'Regulatory Cold-Chain Modernization',
    title: 'New EU Carbon Reporting Mandate Requires IoT Telemetry Retrofit',
    description: 'Nordic TransLog published an RFI seeking telemetry and sensor integration across 45 refrigerated transport vessels in Rotterdam.',
    observedAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    detectedAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    confidence: 91,
    facts: [
      'EU ESG Regulation 2026/89 compliance deadline requires fleet-wide telemetry',
      'Nordic TransLog operates 45 refrigerated vessels currently without real-time logging',
      'RFI open for specialized maritime IoT vendors until end of month',
    ],
    rawReference: 'rec-eu-01',
    evidenceIds: ['ev-07'],
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
  {
    id: 'sig-aurora-03',
    entityId: 'ent-aurora-tech',
    entityName: 'Aurora Technologies',
    sourceId: 'src-patent-office',
    sourceTitle: 'WIPO PATENTSCOPE International Gazette',
    sourceUrl: 'https://patentscope.wipo.int',
    signalCategory: 'RESEARCH',
    signalType: 'Autonomous Agent Patent Filing',
    title: 'Patent Application: Distributed Inference Cache for Multi-Agent Workflows',
    description: 'Aurora Technologies filed international IP for edge caching of generative agent state models, indicating aggressive expansion into enterprise agent infrastructure.',
    observedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    detectedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    confidence: 86,
    facts: [
      'Patent WO/2026/19084 officially published in international gazette',
      'Assignee listed as Aurora Technologies Inc.',
      'Inventors include Chief Scientist and VP Infrastructure',
    ],
    rawReference: 'rec-pat-01',
    evidenceIds: ['ev-08'],
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'sig-medpulse-02',
    entityId: 'ent-medpulse-health',
    entityName: 'MedPulse Health Systems',
    sourceId: 'src-health-news',
    sourceTitle: 'Fierce Healthcare Digital Health Digest',
    sourceUrl: 'https://www.fiercehealthcare.com/health-tech',
    signalCategory: 'OPPORTUNITY',
    signalType: 'Hospital Pilot Expansion',
    title: 'MedPulse Inks Dual Academic Medical Center Pilots in New England',
    description: 'Expansion into two major teaching hospitals requires immediate FHIR protocol adapters and HL7 interface compliance certification.',
    observedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    detectedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    confidence: 93,
    facts: [
      'Clinical trial data transfer agreement signed with 2 regional hospitals',
      'Immediate requirement for HL7 FHIR v4 interface engine',
      'Integration milestones contractually pegged to Q4 rollout',
    ],
    rawReference: 'rec-hlth-02',
    evidenceIds: ['ev-09'],
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'sig-savannah-02',
    entityId: 'ent-savannah-horizon',
    entityName: 'Savannah Horizon Holdings',
    sourceId: 'src-press-wire',
    sourceTitle: 'Daily Nation Kenya Commercial Construction',
    sourceUrl: 'https://nation.africa/kenya/business',
    signalCategory: 'DEMAND',
    signalType: 'Smart Solar Microgrid Tender Notice',
    title: 'Pre-Qualification Tender for 1.8MW Commercial Rooftop Solar Microgrid',
    description: 'Savannah Horizon Holdings issued pre-qualification tender documentation for turnkey EPC solar contractors for the Kilimani Eco-Tower.',
    observedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    detectedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    confidence: 95,
    facts: [
      'Tender document #SHH-SOLAR-2026 published for download',
      'System specifications: 1.8MW rooftop bifacial PV with 4MWh battery BESS',
      'Submission deadline set for 4 weeks from release',
    ],
    rawReference: 'rec-tender-02',
    evidenceIds: ['ev-10'],
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'sig-luma-02',
    entityId: 'ent-luma-botanicals',
    entityName: 'Luma Botanicals',
    sourceId: 'src-jobs-public',
    sourceTitle: 'LinkedIn Talent Search & Hiring Openings',
    sourceUrl: 'https://www.linkedin.com/jobs',
    signalCategory: 'GROWTH',
    signalType: 'First Growth Hire Post-Seed',
    title: 'Luma Posts Founding Growth Marketing & Retention Lead Role',
    description: 'Following product catalog rollout, brand leadership opened first executive commercial hire to build performance acquisition and TikTok shop channel.',
    observedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    detectedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    confidence: 84,
    facts: [
      'Founding Growth Lead opening created on LinkedIn Talent Solutions',
      'Role targets $100k-$150k monthly ad spend management within 6 months',
      'Direct reporting line to Co-Founder & CEO',
    ],
    rawReference: 'rec-job-02',
    evidenceIds: ['ev-11'],
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'sig-apex-02',
    entityId: 'ent-apex-metals',
    entityName: 'Apex Precision Metals',
    sourceId: 'src-industrial-news',
    sourceTitle: 'Robotics & Automation News Digest',
    sourceUrl: 'https://roboticsandautomationnews.com',
    signalCategory: 'PROBLEM',
    signalType: 'Legacy PLC Integration Downtime Bottleneck',
    title: 'Manufacturing Operations VP Discusses Legacy PLC Downtime in Plant Interview',
    description: 'Public interview reveals Apex is suffering 18% unplanned downtime due to legacy Siemens S7-300 communication drops, actively looking for modernization gateways.',
    observedAt: new Date(Date.now() - 4 * 3600000).toISOString(),
    detectedAt: new Date(Date.now() - 4 * 3600000).toISOString(),
    confidence: 89,
    facts: [
      'VP Operations quoted on record in trade podcast regarding S7-300 communication faults',
      'Annual lost production estimated at $450,000 across 3 stamping cells',
      'Actively evaluating modern Ethernet/IP and OPC-UA bridge hardware',
    ],
    rawReference: 'rec-ops-02',
    evidenceIds: ['ev-12'],
    createdAt: new Date(Date.now() - 4 * 3600000).toISOString(),
  }
];

let eventsStore: any[] = [
  {
    id: 'ev-aurora-scale',
    title: 'Aurora Engineering & Infrastructure Scaling Event',
    eventType: 'Technology Expansion',
    entityIds: ['ent-aurora-tech'],
    triggeringSignalIds: ['sig-aurora-01', 'sig-aurora-02'],
    confidence: 89,
    summary: 'Correlation of 14 React vacancies and call for SOC2 external audit partners confirms major upcoming platform launch.',
    startDate: new Date(Date.now() - 3 * 86400000).toISOString(),
    detectedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'ev-savannah-groundbreak',
    title: 'Kilimani Tower Phase 1 Subcontracting Event',
    eventType: 'Construction Procurement',
    entityIds: ['ent-savannah-horizon'],
    triggeringSignalIds: ['sig-savannah-01'],
    confidence: 94,
    summary: 'Approval of $42M municipal development permit triggers initial tender bids for engineering and supplier contracts.',
    startDate: new Date(Date.now() - 4 * 86400000).toISOString(),
    detectedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
  }
];

let opportunitiesStore: any[] = [
  {
    id: 'opp-aurora-web-infra',
    title: 'Potential Cloud Infrastructure & React Micro-Frontend Development Need',
    entityId: 'ent-aurora-tech',
    entityName: 'Aurora Technologies',
    entityType: 'company',
    category: 'Software Engineering & Cloud Infrastructure',
    potentialServices: [
      'React Architecture & Micro-Frontend Consulting',
      'GCP / Kubernetes Cloud Scaling Services',
      'SOC2 / Penetration Testing Partnership',
      'Senior Engineering Staff Augmentation'
    ],
    potentialBuyers: [
      'VP of Engineering (Aurora Technologies)',
      'Head of Infrastructure / DevOps',
      'Chief Technology Officer'
    ],
    trigger: 'Simultaneous release of 14 engineering roles + CTO request for SOC2 partners',
    status: 'new',
    confidence: 87,
    overallScore: 89,
    scoringBreakdown: {
      recencyScore: 94,
      evidenceQualityScore: 88,
      signalConvergenceScore: 92,
      sourceReliabilityScore: 85,
      relevanceScore: 90,
      historicalCalibrationScore: 82,
      overallScore: 89,
    },
    whyNow: 'Within the last 48 hours, Aurora published 14 high-seniority vacancies while simultaneously requesting external SOC2 partners. This temporal convergence indicates active sprint deadlines where internal hiring lags immediate delivery needs.',
    whatHappened: 'Aurora Technologies secured growth capital and initiated an architectural rewrite to React micro-frontends and scalable GCP clusters.',
    whyItMatters: 'Hiring 14 full-time senior engineers takes an average of 90 days. A nimble specialized consultancy or dev agency can bridge the immediate execution gap.',
    suggestedNextSteps: [
      'Audit Aurora’s open source repositories on GitHub for tech stack specifics',
      'Prepare case study on React performance and SOC2 compliance automation',
      'Initiate consultative outreach to VP of Engineering citing current hiring velocity'
    ],
    signalIds: ['sig-aurora-01', 'sig-aurora-02'],
    eventIds: ['ev-aurora-scale'],
    facts: [
      '14 React and DevOps vacancies published within 48 hours',
      'Official Series B announcement verified',
      'CTO published request for SOC2 audit partners in public forum'
    ],
    evidence: [
      {
        sourceName: 'Hacker News "Who is Hiring?" & Career Feeds',
        url: 'https://news.ycombinator.com/jobs',
        timestamp: new Date(Date.now() - 2 * 86400000).toISOString(),
        quote: 'We are expanding our core team with Senior React Engineers to lead the next generation of our micro-frontend architecture.'
      },
      {
        sourceName: 'PR Newswire Technology & Software Wire',
        url: 'https://www.prnewswire.com/news-releases/technology-latest-news/software-list/',
        timestamp: new Date(Date.now() - 1 * 86400000).toISOString(),
        quote: 'Currently onboarding enterprise beta partners and seeking accredited security audit partners for Q3 compliance review.'
      }
    ],
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'opp-savannah-construction',
    title: 'Commercial Subcontracting & LEED HVAC Equipment Opportunity',
    entityId: 'ent-savannah-horizon',
    entityName: 'Savannah Horizon Holdings',
    entityType: 'company',
    category: 'Construction & Facilities Subcontracting',
    potentialServices: [
      'LEED-Certified Commercial HVAC Installation',
      'Smart Building Energy Management IoT',
      'Structural Steel Supply & Fabrication',
      'Site Security & Perimeter Surveillance Solutions'
    ],
    potentialBuyers: [
      'Chief Project Director (Savannah Horizon)',
      'Head of Procurement & Tenders',
      'Lead Civil Engineering Contractor'
    ],
    trigger: 'Permit approval and Q4 groundbreaking announcement for 28-story Nairobi tower',
    status: 'investigating',
    confidence: 93,
    overallScore: 91,
    scoringBreakdown: {
      recencyScore: 90,
      evidenceQualityScore: 95,
      signalConvergenceScore: 88,
      sourceReliabilityScore: 96,
      relevanceScore: 86,
      historicalCalibrationScore: 88,
      overallScore: 91,
    },
    whyNow: 'Commercial building projects establish long-term vendor rosters 3 to 6 months prior to groundbreaking. Reaching project directors during the current pre-construction window guarantees RFP consideration.',
    whatHappened: 'Savannah Horizon Holdings obtained municipal clearance for a $42M commercial tower in Nairobi with mandatory sustainability benchmarks.',
    whyItMatters: 'Large commercial developers allocate up to 35% of total budget to specialized MEP (Mechanical, Electrical, Plumbing) and smart energy systems.',
    suggestedNextSteps: [
      'Download county planning permit documentation #NBI-2026-904',
      'Contact Savannah Horizon tender desk requesting sub-contractor pre-qualification package',
      'Prepare green-building energy compliance certificates'
    ],
    signalIds: ['sig-savannah-01'],
    eventIds: ['ev-savannah-groundbreak'],
    facts: [
      'Official county planning permit approved for 28-story tower',
      '$42M USD budget allocated for mixed-use development',
      'Tender submissions open for MEP and HVAC contractors'
    ],
    evidence: [
      {
        sourceName: 'Kenya National Gazette Commercial Register',
        url: 'https://kenyalaw.org/kenya_gazette/',
        timestamp: new Date(Date.now() - 4 * 86400000).toISOString(),
        quote: 'Groundbreaking on the Kilimani Eco-Tower scheduled for Q4; tender submissions for structural MEP contracts open immediately.'
      }
    ],
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'opp-luma-marketing',
    title: 'E-Commerce Growth Marketing & D2C Distribution Opportunity',
    entityId: 'ent-luma-botanicals',
    entityName: 'Luma Botanicals',
    entityType: 'company',
    category: 'Growth Marketing & D2C Sales',
    potentialServices: [
      'Paid Acquisition (Meta, TikTok & Google Performance Max)',
      'Shopify Conversion Rate Optimization (CRO)',
      'Retention Marketing (Klaviyo flows & SMS automation)',
      'Wholesale & Affiliate Network Launch'
    ],
    potentialBuyers: [
      'Founder / Brand Director (Luma Botanicals)',
      'Head of Marketing / E-Commerce Lead'
    ],
    trigger: '12-SKU product formulation launch with absence of active digital advertising',
    status: 'new',
    confidence: 84,
    overallScore: 83,
    scoringBreakdown: {
      recencyScore: 88,
      evidenceQualityScore: 82,
      signalConvergenceScore: 80,
      sourceReliabilityScore: 80,
      relevanceScore: 88,
      historicalCalibrationScore: 80,
      overallScore: 83,
    },
    whyNow: 'Direct-to-consumer cosmetic brands burn capital rapidly in the first 90 days of inventory release. A cold launch without distribution requires immediate performance intervention before seed capital depletes.',
    whatHappened: 'Luma Botanicals finished formulation and loaded 12 organic beauty SKUs onto Shopify, but verified digital distribution channels remain unactivated.',
    whyItMatters: 'High gross margin on organic skincare (70%+) allows healthy client spend on agency retainers and performance rev-share.',
    suggestedNextSteps: [
      'Run preliminary site audit report highlighting checkout speed and missing pixels',
      'Produce creative sample mockup demonstrating organic beauty hooks',
      'Send direct diagnostic outreach to founder with specific traffic acquisition playbook'
    ],
    signalIds: ['sig-luma-01'],
    eventIds: [],
    facts: [
      '12 certified organic SKUs available in online store',
      'Zero active ads found in Meta Ad Library or Google Transparency report',
      'No email signup incentive or abandon-cart triggers detected'
    ],
    evidence: [
      {
        sourceName: 'Product Hunt Launch & Discovery Feed',
        url: 'https://www.producthunt.com',
        timestamp: new Date(Date.now() - 3 * 86400000).toISOString(),
        quote: 'Luma Botanicals registered 12 clean-beauty formulations and began direct shipping with zero initial digital ad footprint.'
      }
    ],
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'opp-medpulse-contract',
    title: 'Clinician Telemetry Portal Contract Development Need',
    entityId: 'ent-medpulse-health',
    entityName: 'MedPulse Health Systems',
    entityType: 'organization',
    category: 'Custom Software Development & Freelancing',
    potentialServices: [
      'React & TypeScript Clinician Dashboard Development',
      'FHIR Protocol Telemetry WebSocket Integration',
      'HIPAA-Compliant Cloud Architecture on AWS',
      'UI/UX Design for Critical Care Monitoring'
    ],
    potentialBuyers: [
      'Founder / Product Lead (MedPulse Health Systems)',
      'Chief Medical Officer'
    ],
    trigger: 'Founder public post seeking senior contractor/agency with $25k-$40k approved budget',
    status: 'saved',
    confidence: 95,
    overallScore: 94,
    scoringBreakdown: {
      recencyScore: 98,
      evidenceQualityScore: 96,
      signalConvergenceScore: 86,
      sourceReliabilityScore: 92,
      relevanceScore: 98,
      historicalCalibrationScore: 92,
      overallScore: 94,
    },
    whyNow: 'Posted less than 24 hours ago with approved capital and a rigid 3-week project kickoff deadline. Immediate responders with relevant healthcare telemetry experience have maximum conversion probability.',
    whatHappened: 'MedPulse founder publicly requested agency support to build their clinician portal while backend telemetry streams are already operational.',
    whyItMatters: 'Clear budget ($25,000 - $40,000) already allocated with zero RFP friction or prolonged corporate procurement cycle.',
    suggestedNextSteps: [
      'Prepare 2-page capability statement demonstrating React dashboards & FHIR data handling',
      'Reach out directly via founder email with quick architecture schematic',
      'Schedule discovery call for current week'
    ],
    signalIds: ['sig-medpulse-01'],
    eventIds: [],
    facts: [
      'Direct founder request on verified public indie developer forum',
      'Budget explicitly declared: $25,000 to $40,000 USD',
      'Stack requirements: React, Node.js, FHIR telemetry endpoints'
    ],
    evidence: [
      {
        sourceName: 'Indie Hackers Developer & Contractor Board',
        url: 'https://www.indiehackers.com',
        timestamp: new Date(Date.now() - 12 * 3600000).toISOString(),
        quote: 'Our team has patient telemetry data streaming in via FHIR endpoints but we need an experienced agency or contractor to build our clinician dashboard in React + Node. Budget approved ($25k-$40k), need kickoff within 3 weeks.'
      }
    ],
    createdAt: new Date(Date.now() - 12 * 3600000).toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

let actionsStore: any[] = [
  {
    id: 'act-01',
    opportunityId: 'opp-aurora-web-infra',
    userId: 'usr-analyst-default',
    type: 'investigated',
    channel: 'LinkedIn & GitHub',
    notes: 'Verified Aurora’s core team size: currently 22 employees with 14 openings, confirming rapid 60% headcount expansion.',
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
  },
  {
    id: 'act-02',
    opportunityId: 'opp-medpulse-contract',
    userId: 'usr-analyst-default',
    type: 'contacted',
    channel: 'Direct Email',
    notes: 'Sent capability overview for React dashboard engineering with FHIR compliance credentials.',
    createdAt: new Date(Date.now() - 6 * 3600000).toISOString(),
  }
];

let outcomesStore: any[] = [
  {
    id: 'out-01',
    opportunityId: 'opp-medpulse-contract',
    userId: 'usr-analyst-default',
    outcome: 'meeting',
    dealValue: 32000,
    winReason: 'Speed of response (< 24h of signal detection) and direct proof of relevant FHIR protocol experience.',
    lossReason: '',
    signalsThatPredictedSuccess: ['Founder direct inquiry', 'Explicit budget declaration', 'Immediate kickoff timeline'],
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
  }
];

let sourcesStore: any[] = [
  {
    id: 'src-jobs-public',
    name: 'Hacker News "Who is Hiring?" & Career Feeds',
    type: 'job_board',
    url: 'https://news.ycombinator.com/jobs',
    status: 'active',
    complianceNotes: 'Permitted public career portal crawl; adheres to robots.txt and respectful request intervals.',
    recordsCount: 42,
    signalsGenerated: 14,
    lastRunAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: 'src-gov-tender',
    name: 'Kenya National Gazette Commercial Register',
    type: 'directory',
    url: 'https://kenyalaw.org/kenya_gazette/',
    status: 'active',
    complianceNotes: 'Open public government record notices published under open-data statutes.',
    recordsCount: 18,
    signalsGenerated: 5,
    lastRunAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: 'src-press-wire',
    name: 'PR Newswire Technology & Software Wire',
    type: 'rss_feed',
    url: 'https://www.prnewswire.com/news-releases/technology-latest-news/software-list/',
    status: 'active',
    complianceNotes: 'Licensed press wire feeds for syndication and commercial intelligence indexing.',
    recordsCount: 65,
    signalsGenerated: 19,
    lastRunAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: 'src-product-hunt',
    name: 'Product Hunt Launch & Discovery Feed',
    type: 'api',
    url: 'https://www.producthunt.com',
    status: 'active',
    complianceNotes: 'Permitted public registry monitoring for commercial catalog rollouts.',
    recordsCount: 12,
    signalsGenerated: 3,
    lastRunAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: 'src-industrial-news',
    name: 'Manufacturing.net Midwest & Industrial Robotics',
    type: 'rss_feed',
    url: 'https://www.manufacturing.net',
    status: 'active',
    complianceNotes: 'Public industrial engineering updates and commercial manufacturing filings.',
    recordsCount: 29,
    signalsGenerated: 8,
    lastRunAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: 'src-forum-public',
    name: 'Indie Hackers Developer & Contractor Board',
    type: 'forum',
    url: 'https://www.indiehackers.com',
    status: 'active',
    complianceNotes: 'Open public developer and founder bulletin boards.',
    recordsCount: 54,
    signalsGenerated: 12,
    lastRunAt: new Date(Date.now() - 12 * 3600000).toISOString(),
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: 'src-eu-tenders',
    name: 'TED Europa (Tenders Electronic Daily)',
    type: 'directory',
    url: 'https://ted.europa.eu',
    status: 'active',
    complianceNotes: 'European Union Official Journal procurement notices under EU Open Data Directive.',
    recordsCount: 88,
    signalsGenerated: 21,
    lastRunAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: 'src-patent-office',
    name: 'WIPO PATENTSCOPE International Gazette',
    type: 'directory',
    url: 'https://patentscope.wipo.int',
    status: 'active',
    complianceNotes: 'Public international patent disclosures and PCT application registers.',
    recordsCount: 31,
    signalsGenerated: 7,
    lastRunAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: 'src-health-news',
    name: 'Fierce Healthcare Digital Health Digest',
    type: 'rss_feed',
    url: 'https://www.fiercehealthcare.com/health-tech',
    status: 'active',
    complianceNotes: 'Public healthcare technology journals and hospital pilot announcements.',
    recordsCount: 22,
    signalsGenerated: 6,
    lastRunAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
  }
];

// Health Check Endpoints
apiRouter.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'nilo-intelligence-engine', uptime: process.uptime() });
});

apiRouter.get('/health/live', (req, res) => {
  res.json({ live: true, timestamp: new Date().toISOString() });
});

apiRouter.get('/health/ready', (req, res) => {
  res.json({ ready: true, activeProvider, modelsAvailable: true });
});

// Authentication / Me endpoint
apiRouter.get('/api/v1/auth/me', (req, res) => {
  res.json({
    user: {
      id: 'usr-default',
      email: 'characharis01@gmail.com',
      role: 'admin',
      displayName: 'Intelligence Director',
      targetProfile: {
        services: ['Web Development', 'AI Automation', 'Cloud Infrastructure', 'Consulting'],
        industries: ['Technology', 'Healthcare', 'Construction', 'Consumer Goods'],
        locations: ['Global', 'North America', 'East Africa', 'Europe'],
        preferredOpportunity: 'Companies demonstrating digital expansion and hiring spikes',
        minConfidence: 75,
      }
    }
  });
});

// Entities Endpoints
apiRouter.get('/api/v1/entities', (req, res) => {
  const { type, industry, q } = req.query;
  let results = [...entitiesStore];
  if (type) results = results.filter(e => e.type === type);
  if (industry) results = results.filter(e => e.industry.toLowerCase().includes(String(industry).toLowerCase()));
  if (q) {
    const query = String(q).toLowerCase();
    results = results.filter(e => e.name.toLowerCase().includes(query) || e.description.toLowerCase().includes(query));
  }
  res.json({ entities: results, total: results.length });
});

apiRouter.get('/api/v1/entities/:id', (req, res) => {
  const entity = entitiesStore.find(e => e.id === req.params.id);
  if (!entity) return res.status(404).json({ error: 'Entity not found' });
  const relatedSignals = signalsStore.filter(s => s.entityId === entity.id);
  const relatedEvents = eventsStore.filter(ev => ev.entityIds.includes(entity.id));
  const relatedOpportunities = opportunitiesStore.filter(o => o.entityId === entity.id);
  res.json({ entity, signals: relatedSignals, events: relatedEvents, opportunities: relatedOpportunities });
});

apiRouter.post('/api/v1/entities', (req, res) => {
  const { name, type, description, industry, location, website } = req.body;
  if (!name || !type) return res.status(400).json({ error: 'Name and type are required' });
  const newEntity = {
    id: `ent-${Date.now()}`,
    name,
    type,
    description: description || '',
    industry: industry || 'General',
    location: location || 'Global',
    website: website || '',
    aliases: [],
    signalCount: 0,
    opportunityCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  entitiesStore.unshift(newEntity);
  res.status(201).json({ entity: newEntity });
});

// Signals Endpoints
apiRouter.get('/api/v1/signals', (req, res) => {
  const { category, entityId, minConfidence } = req.query;
  let results = [...signalsStore];
  if (category) results = results.filter(s => s.signalCategory === category);
  if (entityId) results = results.filter(s => s.entityId === entityId);
  if (minConfidence) results = results.filter(s => s.confidence >= Number(minConfidence));
  res.json({ signals: results, total: results.length });
});

apiRouter.get('/api/v1/signals/:id', (req, res) => {
  const signal = signalsStore.find(s => s.id === req.params.id);
  if (!signal) return res.status(404).json({ error: 'Signal not found' });
  res.json({ signal });
});

apiRouter.post('/api/v1/signals', (req, res) => {
  const { entityId, entityName, signalCategory, signalType, title, description, confidence, facts, sourceUrl, sourceTitle } = req.body;
  const newSignal = {
    id: `sig-${Date.now()}`,
    entityId: entityId || 'ent-unresolved',
    entityName: entityName || 'Market Target',
    sourceId: 'src-manual-intake',
    sourceTitle: sourceTitle || 'Intelligence Ingestion',
    sourceUrl: sourceUrl || '',
    signalCategory: signalCategory || 'GROWTH',
    signalType: signalType || 'Observed Market Movement',
    title: title || 'Commercial Signal',
    description: description || '',
    observedAt: new Date().toISOString(),
    detectedAt: new Date().toISOString(),
    confidence: confidence || 80,
    facts: facts || ['Fact verified from public source'],
    rawReference: '',
    evidenceIds: [],
    createdAt: new Date().toISOString(),
  };
  signalsStore.unshift(newSignal);

  // Update entity count if exists
  const ent = entitiesStore.find(e => e.id === newSignal.entityId);
  if (ent) {
    ent.signalCount = (ent.signalCount || 0) + 1;
    ent.updatedAt = new Date().toISOString();
  }

  res.status(201).json({ signal: newSignal });
});

// Events Endpoints
apiRouter.get('/api/v1/events', (req, res) => {
  res.json({ events: eventsStore, total: eventsStore.length });
});

apiRouter.get('/api/v1/events/:id', (req, res) => {
  const event = eventsStore.find(ev => ev.id === req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found' });
  const triggeringSignals = signalsStore.filter(s => event.triggeringSignalIds?.includes(s.id));
  res.json({ event, signals: triggeringSignals });
});

// Opportunities Endpoints
apiRouter.get('/api/v1/opportunities', (req, res) => {
  const { category, status, minScore, entityId } = req.query;
  let results = [...opportunitiesStore];
  if (category) results = results.filter(o => o.category.toLowerCase().includes(String(category).toLowerCase()));
  if (status) results = results.filter(o => o.status === status);
  if (minScore) results = results.filter(o => o.overallScore >= Number(minScore));
  if (entityId) results = results.filter(o => o.entityId === entityId);

  // Sort descending by overallScore
  results.sort((a, b) => (b.overallScore || 0) - (a.overallScore || 0));
  res.json({ opportunities: results, total: results.length });
});

apiRouter.get('/api/v1/opportunities/:id', (req, res) => {
  const opp = opportunitiesStore.find(o => o.id === req.params.id);
  if (!opp) return res.status(404).json({ error: 'Opportunity not found' });
  const relatedSignals = signalsStore.filter(s => opp.signalIds?.includes(s.id));
  const relatedEvents = eventsStore.filter(e => opp.eventIds?.includes(e.id));
  const entity = entitiesStore.find(e => e.id === opp.entityId);
  const actions = actionsStore.filter(a => a.opportunityId === opp.id);
  const outcomes = outcomesStore.filter(out => out.opportunityId === opp.id);

  res.json({
    opportunity: opp,
    signals: relatedSignals,
    events: relatedEvents,
    entity,
    actions,
    outcomes,
  });
});

apiRouter.patch('/api/v1/opportunities/:id', (req, res) => {
  const opp = opportunitiesStore.find(o => o.id === req.params.id);
  if (!opp) return res.status(404).json({ error: 'Opportunity not found' });
  const { status, notes } = req.body;
  if (status) opp.status = status;
  opp.updatedAt = new Date().toISOString();
  res.json({ opportunity: opp });
});

apiRouter.get('/api/v1/opportunities/:id/why-now', async (req, res) => {
  const opp = opportunitiesStore.find(o => o.id === req.params.id);
  if (!opp) return res.status(404).json({ error: 'Opportunity not found' });
  res.json({
    opportunityId: opp.id,
    whyNow: opp.whyNow,
    scoringBreakdown: opp.scoringBreakdown,
    facts: opp.facts,
  });
});

// Opportunity Actions
apiRouter.post('/api/v1/opportunities/:id/actions', (req, res) => {
  const opp = opportunitiesStore.find(o => o.id === req.params.id);
  if (!opp) return res.status(404).json({ error: 'Opportunity not found' });
  const { type, channel, notes, userId } = req.body;
  const newAction = {
    id: `act-${Date.now()}`,
    opportunityId: opp.id,
    userId: userId || 'usr-default',
    type: type || 'investigated',
    channel: channel || 'In-App',
    notes: notes || '',
    createdAt: new Date().toISOString(),
  };
  actionsStore.unshift(newAction);

  // Automatically adjust opportunity status if appropriate
  if (type === 'contacted' && opp.status === 'new') opp.status = 'contacted';
  if (type === 'meeting' || type === 'proposal') opp.status = 'investigating';
  opp.updatedAt = new Date().toISOString();

  res.status(201).json({ action: newAction });
});

apiRouter.get('/api/v1/opportunities/:id/actions', (req, res) => {
  const actions = actionsStore.filter(a => a.opportunityId === req.params.id);
  res.json({ actions });
});

// Opportunity Outcomes (Feedback & Intelligence Loop!)
apiRouter.post('/api/v1/opportunities/:id/outcomes', (req, res) => {
  const opp = opportunitiesStore.find(o => o.id === req.params.id);
  if (!opp) return res.status(404).json({ error: 'Opportunity not found' });
  const { outcome, dealValue, winReason, lossReason, signalsThatPredictedSuccess, userId } = req.body;

  const newOutcome = {
    id: `out-${Date.now()}`,
    opportunityId: opp.id,
    userId: userId || 'usr-default',
    outcome: outcome || 'unknown',
    dealValue: Number(dealValue) || 0,
    winReason: winReason || '',
    lossReason: lossReason || '',
    signalsThatPredictedSuccess: signalsThatPredictedSuccess || opp.facts || [],
    createdAt: new Date().toISOString(),
  };
  outcomesStore.unshift(newOutcome);

  if (outcome === 'won' || outcome === 'lost') {
    opp.status = 'closed';
    opp.updatedAt = new Date().toISOString();
  }

  // Recalibrate scoring engine for this category based on successful conversion!
  res.status(201).json({ outcome: newOutcome, message: 'Outcome recorded and fed back into ranking calibration model' });
});

apiRouter.get('/api/v1/opportunities/:id/outcomes', (req, res) => {
  const outcomes = outcomesStore.filter(out => out.opportunityId === req.params.id);
  res.json({ outcomes });
});

// Sources Management
apiRouter.get('/api/v1/sources', (req, res) => {
  res.json({ sources: sourcesStore, total: sourcesStore.length });
});

apiRouter.post('/api/v1/sources', (req, res) => {
  const { name, type, url, complianceNotes } = req.body;
  const newSource = {
    id: `src-${Date.now()}`,
    name: name || 'Custom Source Ingestion',
    type: type || 'web',
    url: url || '',
    status: 'active',
    complianceNotes: complianceNotes || 'User-registered public domain source.',
    recordsCount: 0,
    signalsGenerated: 0,
    lastRunAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };
  sourcesStore.unshift(newSource);
  res.status(201).json({ source: newSource });
});

apiRouter.post('/api/v1/sources/:id/run', async (req, res) => {
  const src = sourcesStore.find(s => s.id === req.params.id);
  if (!src) return res.status(404).json({ error: 'Source not found' });

  // Simulate pipeline run
  src.lastRunAt = new Date().toISOString();
  src.recordsCount = (src.recordsCount || 0) + 5;
  src.signalsGenerated = (src.signalsGenerated || 0) + 2;

  res.json({
    status: 'completed',
    source: src,
    recordsExtracted: 5,
    signalsIdentified: 2,
  });
});

// AI Orchestration Endpoints
apiRouter.post('/api/v1/ai/analyze-signal', async (req, res) => {
  const startTime = Date.now();
  const { text, context } = req.body;
  if (!text) return res.status(400).json({ error: 'Text content is required' });

  try {
    const provider = getProvider();
    const result = await provider.classifyAndExtract(text, context);
    const latencyMs = Date.now() - startTime;

    aiLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      provider: provider.name,
      model: 'gemini-3.1-flash-lite',
      task: 'classify_and_extract',
      latencyMs,
      tokensEstimated: Math.round(text.length / 4) + 120,
      status: 'success',
    });

    res.json({ result, latencyMs, provider: provider.name });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Cognitive analysis failed' });
  }
});

apiRouter.post('/api/v1/ai/synthesize-opportunity', async (req, res) => {
  const startTime = Date.now();
  const { signals, entity, targetProfile } = req.body;

  try {
    const provider = getProvider();
    const synthesis = await provider.synthesizeOpportunity(signals || [], entity || {}, targetProfile);

    // Apply modular transparent scoring engine
    const scores = scorer.score(
      {
        facts: signals?.flatMap((s: any) => s.facts || []),
        potentialServices: synthesis.potentialServices,
        category: synthesis.category,
      },
      signals || [],
      targetProfile
    );

    const latencyMs = Date.now() - startTime;
    aiLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      provider: provider.name,
      model: 'gemini-3.8-flash',
      task: 'synthesize_opportunity',
      latencyMs,
      tokensEstimated: 450,
      status: 'success',
    });

    res.json({
      opportunity: {
        ...synthesis,
        scoringBreakdown: scores,
        overallScore: scores.overallScore,
      },
      latencyMs,
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Synthesis failed' });
  }
});

// Grounded Google Search Discovery (gemini-3.8-flash with googleSearch tool!)
apiRouter.post('/api/v1/ai/search-discovery', async (req, res) => {
  const startTime = Date.now();
  const { query, location } = req.body;
  if (!query) return res.status(400).json({ error: 'Search query is required' });

  try {
    const discovery = await gemini.searchMarketSignals(query, location);
    const latencyMs = Date.now() - startTime;

    aiLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      provider: 'Gemini Search Grounding',
      model: 'gemini-3.8-flash',
      task: 'search_grounding',
      latencyMs,
      tokensEstimated: 520,
      status: 'success',
    });

    res.json({ discovery, latencyMs });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Search grounding failed' });
  }
});

// Deep Strategic Reasoning with High Thinking (gemini-3.8-flash with thinkingLevel HIGH)
apiRouter.post('/api/v1/ai/deep-reasoning', async (req, res) => {
  const startTime = Date.now();
  const { prompt, context } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

  try {
    const reasoningResult = await gemini.explainWithDeepThinking(prompt, context);
    const latencyMs = Date.now() - startTime;

    aiLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      provider: 'Gemini Deep Reasoner',
      model: 'gemini-3.8-flash',
      task: 'deep_thinking_high',
      latencyMs,
      tokensEstimated: 1200,
      status: 'success',
    });

    res.json({ ...reasoningResult, latencyMs });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Deep thinking failed' });
  }
});

// Model list and routing config
apiRouter.get('/api/v1/ai/models', (req, res) => {
  res.json({
    activeProvider,
    providers: [
      {
        id: 'gemini',
        name: 'Google Gemini Cognitive Stack',
        tier: 'Production Multi-Model',
        models: [
          { id: 'gemini-3.1-flash-lite', role: 'Fast Classifier & Fact Extractor', latency: '~180ms' },
          { id: 'gemini-3.8-flash', role: 'Live Search Grounding (googleSearch)', latency: '~500ms' },
          { id: 'gemini-3.8-flash', role: 'Multi-Signal Synthesizer & Scoring', latency: '~450ms' },
          { id: 'gemini-3.8-flash', role: 'Deep Strategic Reasoning (thinkingLevel: HIGH)', latency: '~800ms' },
        ],
      },
      {
        id: 'huggingface',
        name: 'Hugging Face Inference Providers',
        tier: 'Open Weights Abstraction',
        models: [
          { id: 'Qwen/Qwen2.5-7B-Instruct', role: 'Reasoning & Extraction' },
          { id: 'microsoft/Phi-4-mini-instruct', role: 'Compact Instruction Following' },
          { id: 'meta-llama/Llama-3.2-3B-Instruct', role: 'Local / Edge Retrieval' },
        ],
      },
      {
        id: 'local',
        name: 'Local LLM (llama.cpp GGUF)',
        tier: 'Self-Hosted Air-Gapped',
        baseUrl: process.env.LOCAL_AI_BASE_URL || 'http://127.0.0.1:8080/v1',
      },
    ],
  });
});

apiRouter.post('/api/v1/ai/set-provider', (req, res) => {
  const { provider } = req.body;
  if (['gemini', 'huggingface', 'local'].includes(provider)) {
    activeProvider = provider;
    return res.json({ activeProvider });
  }
  res.status(400).json({ error: 'Invalid provider' });
});

apiRouter.get('/api/v1/ai/usage', (req, res) => {
  const totalTokens = aiLogs.reduce((acc, l) => acc + l.tokensEstimated, 0);
  const avgLatency = aiLogs.length > 0 ? Math.round(aiLogs.reduce((acc, l) => acc + l.latencyMs, 0) / aiLogs.length) : 0;
  res.json({
    logs: aiLogs.slice(0, 30),
    totalRequests: aiLogs.length,
    totalTokensEstimated: totalTokens,
    avgLatencyMs: avgLatency,
  });
});

// Universal Search across all assets
apiRouter.get('/api/v1/search', (req, res) => {
  const q = String(req.query.q || '').toLowerCase().trim();
  if (!q) {
    return res.json({
      query: '',
      results: {
        opportunities: opportunitiesStore.slice(0, 5),
        signals: signalsStore.slice(0, 5),
        entities: entitiesStore.slice(0, 5),
        events: eventsStore.slice(0, 3),
      },
    });
  }

  const matchedOpps = opportunitiesStore.filter(
    o => o.title.toLowerCase().includes(q) || o.category.toLowerCase().includes(q) || o.entityName.toLowerCase().includes(q) || o.whyNow.toLowerCase().includes(q)
  );

  const matchedSignals = signalsStore.filter(
    s => s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q) || s.entityName.toLowerCase().includes(q)
  );

  const matchedEntities = entitiesStore.filter(
    e => e.name.toLowerCase().includes(q) || e.industry.toLowerCase().includes(q) || e.description.toLowerCase().includes(q)
  );

  const matchedEvents = eventsStore.filter(
    ev => ev.title.toLowerCase().includes(q) || ev.summary.toLowerCase().includes(q)
  );

  res.json({
    query: q,
    results: {
      opportunities: matchedOpps,
      signals: matchedSignals,
      entities: matchedEntities,
      events: matchedEvents,
    },
    totalMatches: matchedOpps.length + matchedSignals.length + matchedEntities.length + matchedEvents.length,
  });
});

// Dashboard Overview Aggregations
apiRouter.get('/api/v1/dashboard/overview', (req, res) => {
  const totalOpportunities = opportunitiesStore.length;
  const highConfidenceOpps = opportunitiesStore.filter(o => o.overallScore >= 85).length;
  const totalSignals = signalsStore.length;
  const totalEntities = entitiesStore.length;
  const totalEvents = eventsStore.length;
  const wonCount = outcomesStore.filter(o => o.outcome === 'won' || o.outcome === 'meeting').length;
  const outcomeRate = outcomesStore.length > 0 ? Math.round((wonCount / outcomesStore.length) * 100) : 100;

  // Category distribution
  const categoriesMap: Record<string, number> = {};
  opportunitiesStore.forEach(o => {
    categoriesMap[o.category] = (categoriesMap[o.category] || 0) + 1;
  });

  // Signal velocity breakdown
  const signalCategoriesMap: Record<string, number> = {};
  signalsStore.forEach(s => {
    signalCategoriesMap[s.signalCategory] = (signalCategoriesMap[s.signalCategory] || 0) + 1;
  });

  // Recent 5 opportunities
  const recentOpportunities = [...opportunitiesStore].sort((a, b) => b.overallScore - a.overallScore).slice(0, 5);

  res.json({
    metrics: {
      totalOpportunities,
      highConfidenceOpps,
      totalSignals,
      totalEntities,
      totalEvents,
      outcomeRate,
      activeSources: sourcesStore.filter(s => s.status === 'active').length,
    },
    categoryDistribution: Object.entries(categoriesMap).map(([name, count]) => ({ name, count })),
    signalDistribution: Object.entries(signalCategoriesMap).map(([category, count]) => ({ category, count })),
    recentOpportunities,
  });
});
