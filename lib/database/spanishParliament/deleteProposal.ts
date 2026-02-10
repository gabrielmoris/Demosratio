import { Logger } from "tslog";
import { supabaseAdmin } from "@/lib/supabaseClient";

const log = new Logger();

export const deleteProposal = async (id: number) => {
  const { error } = await supabaseAdmin.from("proposals").delete().eq("id", id);

  if (error) {
    log.error(`Error deleting proposal ${id}:`, error);
    throw error;
  }

  log.info(`Proposal ${id} deleted successfully`);
};
