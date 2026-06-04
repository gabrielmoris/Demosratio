import { supabaseAdmin } from "@/lib/supabaseClient";
import { Logger } from "tslog";
import { fetchAllLikesAndDislikes } from "../likes/getTotalLikesAndDislikes";

const log = new Logger();

export const getAllProposals = async (page: number, pageSize: number) => {
 try {
 const from = (page - 1) * pageSize;
 const to = from + pageSize - 1;

 const {
 data: proposals,
 error,
 count,
 } = await supabaseAdmin
 .from("proposals")
 .select("*, proposal_summaries(summary_text, summary_type)", { count: "exact" })
 .order("date", { ascending: false })
 .order("id", { ascending: false })
 .range(from, to);

 if (error) {
 log.error("Supabase error:", error);
 throw new Error("Error fetching proposals");
 }

 for (const proposal of proposals) {
 const proposalLikesAndDislikes = await fetchAllLikesAndDislikes(
 proposal.id
 );
 proposal.likesAndDislikes = proposalLikesAndDislikes.result;

 // Extract one_line summary from the join
 if (proposal.proposal_summaries && proposal.proposal_summaries.length > 0) {
 try {
 const parsed = JSON.parse(proposal.proposal_summaries[0].summary_text);
 proposal.summary_one_line = parsed.one_line || null;
 proposal.summary_data = proposal.proposal_summaries[0];
 } catch {
 proposal.summary_one_line = null;
 proposal.summary_data = null;
 }
 } else {
 proposal.summary_one_line = null;
 proposal.summary_data = null;
 }

 // Remove the raw join data to clean up the response
 delete proposal.proposal_summaries;
 }

 return { proposals, count };
 } catch (e) {
 log.error(e);
 throw new Error(e instanceof Error ? e.message : String(e));
 }
};
