import { Logger } from 'tslog';
import { supabaseAdmin } from '@/lib/supabaseClient';

const log = new Logger();

export const updateCampaign = async (campaign_id: number, year: number, campaign_pdf_url: string) => {
  const { data, error } = await supabaseAdmin
    .from('campaigns')
    .update({ year, campaign_pdf_url })
    .eq('id', campaign_id)
    .select('id')
    .single();

  if (error) {
    log.error('Error updating campaign:', error);
    throw error;
  }

  return data;
};
