import { Logger } from "tslog";

import { supabaseAdmin } from "@/lib/supabaseClient";

const log = new Logger();

export async function fetchAllsubjects() {
  try {
    // Count likes
    const { data: subjects, error: subjectsError } = await supabaseAdmin
      .from("subjects")
      .select("*");

    if (subjectsError) {
      throw new Error("Error fetching subjects");
    }

    return { subjects };
  } catch (error) {
    log.error("Supabase error fetching subjects:", error);
    return { error };
  }
}
