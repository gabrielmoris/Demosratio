export interface Party {
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

export interface Subject {
  id: number;
  created_at: Date;
  description: string;
  name: string;
}
