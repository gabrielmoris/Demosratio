export interface PoliticalParties {
  id: number;
  created_at: Date;
  year: string;
  name: string;
  logo_url: string;
}

export interface Campaign {
  id: number;
  created_at: Date;
  year: number;
  party_id: number;
  campaign_pdf_url: string;
}
