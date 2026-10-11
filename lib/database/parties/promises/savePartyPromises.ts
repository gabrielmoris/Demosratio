import { Logger } from "tslog";
import { supabaseAdmin } from "@/lib/supabaseClient";

const log = new Logger();

export type NewPromise = { subject_id: number; promise: string };

/** Inserts many promises of one campaign in a single request. */
export async function savePartyPromises(party_id: number, campaign_id: number, promises: NewPromise[]) {
  const rows = promises.map(({ subject_id, promise }) => ({ promise, subject_id, party_id, campaign_id }));

  const { data, error } = await supabaseAdmin.from("promises").insert(rows).select("id");

  if (error) {
    log.error("Error inserting promises:", error);
    throw error;
  }

  return data;
}
