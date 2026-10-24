import { Logger } from 'tslog';
import { supabaseAdmin } from '@/lib/supabaseClient';
import { VotingData } from '@/types/proposal.types';

const log = new Logger();

export type PendingProposal = VotingData & { id: number };

/** Votes of a legislatura still waiting for the promise analysis, oldest first. */
export async function getProposalsPendingAnalysis(
  legislaturaId: number,
  limit: number
): Promise<PendingProposal[]> {
  const { data, error } = await supabaseAdmin
    .from('proposals')
    .select(
      'id, session, date, title, url, expedient_text, parliament_presence, votes_for, votes_against, abstentions, no_vote, votes_parties_json, assent, legislatura_id'
    )
    .eq('legislatura_id', legislaturaId)
    .eq('promise_analysis_status', 'pending')
    .order('date', { ascending: true })
    .order('id', { ascending: true })
    .limit(limit);

  if (error) {
    log.error('Error fetching votes pending promise analysis:', error);
    throw error;
  }

  return (data ?? []) as PendingProposal[];
}

export async function countProposalsPendingAnalysis(legislaturaId: number): Promise<number> {
  const { count, error } = await supabaseAdmin
    .from('proposals')
    .select('id', { count: 'exact', head: true })
    .eq('legislatura_id', legislaturaId)
    .eq('promise_analysis_status', 'pending');

  if (error) {
    log.error('Error counting votes pending promise analysis:', error);
    throw error;
  }

  return count ?? 0;
}

export async function markPromiseAnalysisDone(proposalId: number): Promise<void> {
  const { error } = await supabaseAdmin
    .from('proposals')
    .update({ promise_analysis_status: 'done' })
    .eq('id', proposalId);

  if (error) {
    log.error(`Error marking proposal ${proposalId} as analysed:`, error);
    throw error;
  }
}
