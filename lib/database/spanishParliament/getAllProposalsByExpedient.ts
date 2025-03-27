import { supabaseAdmin } from "@/lib/supabaseClient";
import { Logger } from "tslog";
import { fetchAllLikesAndDislikes } from "../likes/getTotalLikesAndDislikes";

const log = new Logger();

export const getAllProposalsByExpedient = async (
  expedient_text: string,
  page: number,
  pageSize: number
) => {
  try {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const {
      data: proposals,
      error,
      count,
    } = await supabaseAdmin
      .from("proposals")
      .select("*", { count: "exact" })
      .ilike("expedient_text", `%${expedient_text}%`)
      .order("date", { ascending: false })
      .order("id", { ascending: false })
      .range(from, to);

    if (error) {
      log.error("Supabase error:", error);
      throw new Error("Error searching proposals");
    }

    for (const proposal of proposals) {
      const proposalLikesAndDislikes = await fetchAllLikesAndDislikes(
        proposal.id
      );
      proposal.likesAndDislikes = proposalLikesAndDislikes.result;
    }

    return { proposals, count };
  } catch (e) {
    log.error(e);
    throw new Error("Error: " + e);
  }
};
