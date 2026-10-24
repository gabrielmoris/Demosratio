import { Logger } from "tslog";

import { supabaseAdmin } from "@/lib/supabaseClient";

const log = new Logger();

/**
 * Without a legislatura: every party. With one: only the parties that have a campaign in it,
 * each with that campaign in `campaigns`.
 */
export async function fetchAllParties(legislaturaId?: number) {
  try {
    const query = legislaturaId
      ? supabaseAdmin
          .from("parties")
          .select("*, campaigns!inner(id, created_at, year, party_id, campaign_pdf_url, legislatura_id)")
          .eq("campaigns.legislatura_id", legislaturaId)
      : supabaseAdmin.from("parties").select("*");

    const { data: parties, error: partiesError } = await query;

    if (partiesError) {
      throw new Error("Error fetching parties");
    }

    return { parties };
  } catch (error) {
    log.error("Supabase error fetching Parties:", error);
    return { error };
  }
}
