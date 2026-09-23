import crypto from 'crypto';

export interface RawRecord {
  id: string;
  sourceId: string;
  sourceName: string;
  url: string;
  title: string;
  rawText: string;
  observedAt: string;
  hash: string;
}

export interface IngestionResult {
  recordsProcessed: number;
  signalsExtracted: number;
  entitiesIdentified: number;
  dedupedCount: number;
}

export interface SourceProvider {
  name: string;
  type: 'web' | 'rss' | 'api' | 'user_upload' | 'directory' | 'job_board' | 'news';
  discover(): Promise<RawRecord[]>;
  normalize(raw: any): RawRecord;
}

export class IngestionPipeline {
  private seenHashes = new Set<string>();

  public computeHash(content: string): string {
    return crypto.createHash('sha256').update(content.trim().toLowerCase()).digest('hex');
  }

  public deduplicate(records: RawRecord[]): RawRecord[] {
    const unique: RawRecord[] = [];
    for (const r of records) {
      if (!this.seenHashes.has(r.hash)) {
        this.seenHashes.add(r.hash);
        unique.push(r);
      }
    }
    return unique;
  }

  /**
   * Generates realistic, legally permitted cross-industry benchmark seed sources
   */
  public getCrossIndustryBenchmarkRecords(): RawRecord[] {
    const now = new Date();
    const records = [
      // 1. Technology: Hiring spike & framework transition
      {
        id: 'rec-tech-01',
        sourceId: 'src-jobs-public',
        sourceName: 'Public Engineering Career Portal',
        url: 'https://careers.auroratech.io/openings',
        title: 'Aurora Technologies lists 14 React & Cloud Infrastructure Roles',
        rawText: 'Aurora Technologies (London & Remote) has posted 14 new engineering vacancies: Senior React Engineer, Distributed Systems Architect, and Cloud Platform Specialist. The listings cite migration to next-gen micro-frontends and rapid data pipeline scaling following their Series B announcement.',
        observedAt: new Date(now.getTime() - 2 * 86400000).toISOString(),
      },
      // 2. Technology: Signal 2 for Aurora (patent/stack expansion)
      {
        id: 'rec-tech-02',
        sourceId: 'src-press-wire',
        sourceName: 'Enterprise Software Dispatch',
        url: 'https://techdispatch.io/aurora-ai-expansion',
        title: 'Aurora Technologies Unveils Enterprise AI Data Engine Beta',
        rawText: 'Aurora Technologies published release notes for their autonomous data pipeline platform, highlighting customer integrations with AWS and GCP. Community discussions reveal team actively asking for third-party security audit and load-testing partners.',
        observedAt: new Date(now.getTime() - 1 * 86400000).toISOString(),
      },
      // 3. Construction & Infrastructure: Nairobi Project Announcement
      {
        id: 'rec-const-01',
        sourceId: 'src-gov-tender',
        sourceName: 'East Africa Commercial Gazette',
        url: 'https://gazette.gov.ke/notices/kilimani-commercial-hub',
        title: 'Savannah Horizon Holdings Greenlights $42M Mixed-Use Eco-Tower in Nairobi',
        rawText: 'Savannah Horizon Holdings announces groundbreaking on a 28-story mixed-use commercial tower in Kilimani, Nairobi. Groundbreaking scheduled for Q4 with immediate procurement phases for LEED-certified HVAC systems, structural steel fabrication, smart elevators, and site surveillance contracts.',
        observedAt: new Date(now.getTime() - 4 * 86400000).toISOString(),
      },
      // 4. Marketing & Distribution: Brand launch with distribution bottleneck
      {
        id: 'rec-mkt-01',
        sourceId: 'src-product-hunt',
        sourceName: 'New Product Directory & Registries',
        url: 'https://brandregistry.org/luma-botanicals',
        title: 'Luma Botanicals Launches 12-SKU Premium Skincare Line With Low Digital Footprint',
        rawText: 'Luma Botanicals completed direct-to-consumer formulation launch with 12 organic cosmetics SKUs. Analysis reveals single landing page with no paid search capture, sub-100 social followers, missing conversion pixels, and no active wholesale affiliate portal.',
        observedAt: new Date(now.getTime() - 3 * 86400000).toISOString(),
      },
      // 5. Manufacturing: New Facility Announcement
      {
        id: 'rec-mfg-01',
        sourceId: 'src-industrial-news',
        sourceName: 'Midwest Manufacturing Weekly',
        url: 'https://midwestmfg.org/apex-robotics-expansion',
        title: 'Apex Precision Metals Signs Lease for 180,000 sq ft Smart Assembly Plant in Ohio',
        rawText: 'Apex Precision Metals announced the acquisition of a decommissioned logistics center in Columbus, OH to convert into a robotic stamping and CNC manufacturing hub. Operations require automation robotics integrators, industrial power retrofits, and local technical workforce training.',
        observedAt: new Date(now.getTime() - 5 * 86400000).toISOString(),
      },
      // 6. Direct Demand / Freelancing: Public Vendor Search
      {
        id: 'rec-free-01',
        sourceId: 'src-forum-public',
        sourceName: 'Open Developer Community Board',
        url: 'https://community.indiehackers.com/t/hiring-custom-api-developer',
        title: 'Founder Query: Seeking Senior Full-Stack Agency to Build Real-Time Analytics Dashboard',
        rawText: 'Public post by founder of MedPulse Health: "Our team has patient telemetry data streaming in via FHIR endpoints but we need an experienced agency or senior contractor to build our clinician dashboard in React + Node. Budget approved ($25k-$40k), need kickoff within 3 weeks."',
        observedAt: new Date(now.getTime() - 12 * 3600000).toISOString(),
      },
      // 7. Logistics / Cold Chain Expansion
      {
        id: 'rec-log-01',
        sourceId: 'src-maritime-registry',
        sourceName: 'Global Freight & Cold Chain Review',
        url: 'https://coldchainreview.com/nordic-cold-ports',
        title: 'Nordic TransLog Expands Cold Chain Capacity at Rotterdam & Hamburg Ports',
        rawText: 'Nordic TransLog has commissioned 40,000 cubic meters of temperature-controlled warehousing. The company has published vendor request notices for IoT telemetry sensors, refrigeration backup power systems, and bilingual warehouse management software.',
        observedAt: new Date(now.getTime() - 6 * 86400000).toISOString(),
      }
    ];

    return records.map(r => ({
      ...r,
      hash: this.computeHash(r.rawText),
    }));
  }
}
