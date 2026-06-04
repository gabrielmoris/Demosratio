import { supabaseAdmin } from '@/lib/supabaseClient';
import { Logger } from 'tslog';

const log = new Logger();

export async function getProposalSummary(proposalId: number) {
 try {
 const { data, error } = await supabaseAdmin
 .from('proposal_summaries')
 .select('*')
 .eq('proposal_id', proposalId)
 .single();

 if (error) {
 if (error.code === 'PGRST116') {
 // No rows returned - summary doesn't exist yet
 return { summary: null };
 }
 log.error('Error fetching proposal summary:', error);
 throw error;
 }

 return { summary: data };
 } catch (error) {
 log.error('Error in getProposalSummary:', error);
 throw error;
 }
}

export async function getMultipleProposalSummaries(proposalIds: number[]) {
 try {
 const { data, error } = await supabaseAdmin
 .from('proposal_summaries')
 .select('*')
 .in('proposal_id', proposalIds);

 if (error) {
 log.error('Error fetching multiple proposal summaries:', error);
 throw error;
 }

 return { summaries: data || [] };
 } catch (error) {
 log.error('Error in getMultipleProposalSummaries:', error);
 throw error;
 }
}
