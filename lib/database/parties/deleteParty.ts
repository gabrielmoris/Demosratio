import { Logger } from "tslog";
import { supabaseAdmin } from "@/lib/supabaseClient";

const log = new Logger();

export const deleteParty = async (name: string) => {
  const { data: result, error: insertError } = await supabaseAdmin
    .from("parties")
    .delete()
    .eq("name", name)
    .select("id")
    .single();

  if (insertError) {
    log.error(`Error deleting party:`, insertError);
    throw insertError;
  }

  return result;
};
