import { Logger } from "tslog";
import { supabaseAdmin } from "@/lib/supabaseClient";

const log = new Logger();

export const saveParty = async (name: string, logo_url: string) => {
  const { data: result, error: insertError } = await supabaseAdmin
    .from("parties")
    .insert([
      {
        name,
        logo_url,
      },
    ])
    .select("id")
    .single();

  if (insertError) {
    log.error(`Error inserting party:`, insertError);
    throw insertError;
  }

  return result;
};
