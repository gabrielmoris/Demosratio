import { Logger } from "tslog";
import { supabaseAdmin } from "@/lib/supabaseClient";

const log = new Logger();

export const saveSubject = async (name: string, description: string) => {
  const { data: result, error: insertError } = await supabaseAdmin
    .from("subjects")
    .insert([
      {
        name,
        description,
      },
    ])
    .select("id")
    .single();

  if (insertError) {
    log.error(`Error inserting subject:`, insertError);
    throw insertError;
  }

  return result;
};
