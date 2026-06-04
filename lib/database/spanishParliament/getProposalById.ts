import { supabaseAdmin } from "@/lib/supabaseClient";
import { Logger } from "tslog";

const log = new Logger();

export const getProposalById = async (id: number) => {
 try {
 const { data: proposal, error } = await supabaseAdmin
 .from("proposals")
 .select("*, proposal_summaries(summary_text, summary_type)")
 .eq("id", id)
 .single();

 if (error) {
 log.error("Supabase error:", error);
 throw new Error("Error fetching proposal");
 }

 if (!proposal) {
 throw new Error("Proposal not found.");
 }
 if (
 proposal &&
 proposal.votes_parties_json &&
 proposal.votes_parties_json.votes
 ) {
 proposal.votes_parties_json = proposal.votes_parties_json.votes;
 }

 // Extract summary data from the join
 if (proposal.proposal_summaries && proposal.proposal_summaries.length > 0) {
 try {
 const parsed = JSON.parse(proposal.proposal_summaries[0].summary_text);
 proposal.summary = {
 bullet_points: parsed.bullet_points || [],
 one_line: parsed.one_line || null,
 summary_type: proposal.proposal_summaries[0].summary_type,
 };
 } catch {
 proposal.summary = null;
 }
 } else {
 proposal.summary = null;
 }

 delete proposal.proposal_summaries;

 return proposal;
 } catch (e) {
 log.error(e);
 }
};
