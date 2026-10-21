import { Logger } from "tslog";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { ProposalToSummarize, ProposalSummaryUpdate } from "@/lib/services/proposalSummary";

const log = new Logger();

/**
 * Votes that still need a summary: never tried (status null) or failed last time ("error").
 * Newest first, so fresh votes get their summary before the backlog.
 */
export async function getProposalsMissingSummary(limit: number): Promise<ProposalToSummarize[]> {
  const { data, error } = await supabaseAdmin
    .from("proposals")
    .select("id, title, url, expedient_text")
    .or("plain_summary_status.is.null,plain_summary_status.eq.error")
    .order("date", { ascending: false })
    .order("id", { ascending: false })
    .limit(limit);

  if (error) {
    log.error("Error fetching proposals without summary:", error);
    throw error;
  }

  return data ?? [];
}

export async function saveProposalSummary(proposalId: number, update: ProposalSummaryUpdate): Promise<void> {
  const { error } = await supabaseAdmin.from("proposals").update(update).eq("id", proposalId);

  if (error) {
    log.error(`Error saving summary for proposal ${proposalId}:`, error);
    throw error;
  }
}
