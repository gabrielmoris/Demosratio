import { Logger } from "tslog";
import { supabaseAdmin } from "@/lib/supabaseClient";

const log = new Logger();

export const updateSubject = async (id: number, name: string, description: string) => {
  const { data: result, error: updateError } = await supabaseAdmin
    .from("subjects")
    .update({ name, description })
    .eq("id", id)
    .select("id")
    .single();

  if (updateError) {
    log.error(`Error updating subject:`, updateError);
    throw updateError;
  }

  return result;
};
