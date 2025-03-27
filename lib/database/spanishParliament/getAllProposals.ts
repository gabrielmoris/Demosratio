import { supabaseAdmin } from "@/lib/supabaseClient";
import { Logger } from "tslog";
import { fetchAllLikesAndDislikes } from "../likes/getTotalLikesAndDislikes";

const log = new Logger();

export const getAllProposals = async (page: number, pageSize: number) => {
  try {
    // Calculate pagination values
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Query Supabase with pagination
    const {
      data: proposals,
      error,
      count,
    } = await supabaseAdmin
      .from("proposals")
      .select("*", { count: "exact" })
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
    }

    return { proposals, count };
  } catch (e) {
    log.error(e);
    throw new Error(e instanceof Error ? e.message : String(e));
  }
};
