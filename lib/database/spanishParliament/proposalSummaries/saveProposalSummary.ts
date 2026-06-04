import { supabaseAdmin } from '@/lib/supabaseClient';
import { Logger } from 'tslog';

const log = new Logger();

export async function saveProposalSummary(
 proposalId: number,
 summaryText: string,
 summaryType: 'title-based' | 'enriched' = 'title-based'
) {
 try {
 const { data, error } = await supabaseAdmin
 .from('proposal_summaries')
 .upsert(
 {
 proposal_id: proposalId,
 summary_text: summaryText,
 summary_type: summaryType,
 },
 { onConflict: 'proposal_id' }
 )
 .select('id')
 .single();

 if (error) {
 log.error('Error saving proposal summary:', error);
 throw error;
 }

 return data;
 } catch (error) {
 log.error('Error in saveProposalSummary:', error);
 throw error;
 }
}
