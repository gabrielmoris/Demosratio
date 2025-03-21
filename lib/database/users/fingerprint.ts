import { supabaseAdmin } from "@/lib/supabaseClient";
import { Logger } from "tslog";

const log = new Logger();

export async function findFingerprint(hash: string) {
  try {
    const { data, error } = await supabaseAdmin.from("user_devices").select("*").eq("device_hash", hash).single();

    if (error && error.code !== "PGRST116") {
      log.error("Error finding fingerprint:", error);
      return null;
    }

    return data;
  } catch (e) {
    log.error("Error finding fingerprint:", e);
    return null;
  }
}

export async function saveFingerprint(data: { userId: string; hash: string }) {
  try {
    const { hash, userId } = data;

    // Check if fingerprint exists
    const existingFingerprint = await findFingerprint(hash);
    if (existingFingerprint) {
      log.warn(`Device with this Hash already exists. Skipping.`);
      return null;
    }

    // Save fingerprint
    const { data: result, error } = await supabaseAdmin
      .from("user_devices")
      .insert([{ user_id: userId, device_hash: hash }])
      .select("id, device_hash")
      .single();

    if (error) {
      log.error("Error saving fingerprint:", error);
      throw error;
    }

    if (result) {
      log.info(`Hash saved with ID: ${result.id}`);
      return result;
    } else {
      log.warn(`Hash was not saved.`);
      return null;
    }
  } catch (error) {
    log.error("Error saving fingerprint:", error);
    throw error;
  }
}
