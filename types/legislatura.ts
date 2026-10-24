export interface Legislatura {
  /** Number of the legislatura: 15 = XV */
  id: number;
  /** "YYYY-MM-DD"; prefills the campaign year of its parties */
  election_date: string | null;
  start_date: string | null;
  end_date: string | null;
  /** What the website shows by default and what the cron scrapes and analyses */
  is_current: boolean;
  created_at?: string;
}

export type LegislaturaInput = Pick<Legislatura, 'id' | 'election_date' | 'start_date' | 'end_date'>;
