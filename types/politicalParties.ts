export interface Party {
  id: number;
  created_at?: Date;
  year: string;
  name: string;
  logo_url?: string;
}

export interface PartyWithPromises extends Party {
  campaign_year?: number;
  campaign_pdf_url?: string;
  campaign_id?: number;
  promises: PartyPromise[];
}

export interface Campaign {
  id: number;
  created_at: Date;
  year: number;
  party_id: number;
  campaign_pdf_url: string;
}

export interface Subject {
  id: number;
  created_at: Date;
  description: string;
  name: string;
}

export interface PartyPromise {
  id: number;
  created_at: Date;
  campaign_id: number;
  subject_id: number;
  promise: string;
  party_id: number;
}

export interface StructuredPromises {
  id: number;
  name: string;
  description: string;
  promises: [
    {
      id: number;
      created_at: Date;
      campaign_id: number;
      subject_id: number;
      promise: string;
      party_id: number;
      subjects: Subject;
    }
  ];
}

export interface PartiesWithCampaigns {
  id: number;
  name: string;
  abbreviation: string;
  campaign_year: number;
  campaign_pdf_url: string;
}

export type FulfillmentStatus = "Supporting Evidence" | "Contradictory Evidence" | "Partial/Indirect Evidence";

export interface PromiseAnalysis {
  id: number;
  promise_id: number;
  party_name: string;
  subject_id: number;
  proposal_id: number;
  campaign_year: number;
  promise_text: string;
  analysis_summary: string;
  fulfillment_status: FulfillmentStatus;
}

export interface PartyAnalysisOutput {
  party_id: number;
  party_name: string;
  party_abbreviation: string;
  campaign_year: number;
  promise_analyses: PromiseAnalysis[];
}
