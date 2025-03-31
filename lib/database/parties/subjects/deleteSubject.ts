import { Logger } from "tslog";
import { supabaseAdmin } from "@/lib/supabaseClient";

const log = new Logger();

export const deleteSubject = async (id: number) => {
  const { data: result, error: insertError } = await supabaseAdmin.from("subjects").delete().eq("id", id).select("id").single();

  if (insertError) {
    log.error(`Error deleting subject: `, insertError);
    throw insertError;
  }

  return result;
};
