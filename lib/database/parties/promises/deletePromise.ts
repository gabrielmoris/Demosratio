import { Logger } from "tslog";
import { supabaseAdmin } from "@/lib/supabaseClient";

const log = new Logger();

export const deletePromise = async (id: number) => {
  const { data: result, error: insertError } = await supabaseAdmin.from("promises").delete().eq("id", id).select("id").single();

  if (insertError) {
    log.error(`Error deleting subject: `, insertError);
    throw insertError;
  }

  return result;
};
