import { supabaseAdmin } from "@/lib/supabaseClient";
import { Logger } from "tslog";

const log = new Logger();

export interface User {
  id?: string;
  name: string;
  password?: string;
}

export interface UserDevice {
  id?: string;
  user_id: string;
  device_hash: string;
}

export async function findUserByName(name: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("name", name)
      .single();

    if (error) {
      // This error is expected when no user is found
      if (error.code === "PGRST116") {
        return null;
      }

      log.error("Error finding user:", error);
      return null;
    }

    return data;
  } catch (e) {
    log.error("Error finding user:", e);
    return null;
  }
}

export async function findFingerprint(hash: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from("user_devices")
      .select("*")
      .eq("device_hash", hash)
      .single();

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

export async function saveUser(userData: User) {
  try {
    const { name, password } = userData;

    // Check if user already exists
    const existingUser = await findUserByName(name);

    if (existingUser) {
      log.warn(`User with name "${name}" already exists. Skipping.`);
      return null;
    }

    // Save the user
    const { data, error } = await supabaseAdmin
      .from("users")
      .insert([{ name, password }])
      .select("id, name")
      .single();

    if (error) {
      log.error("Error saving user:", error);
      throw error;
    }

    if (data) {
      log.info(`User "${name}" saved with ID: ${data.id}`);
      return data;
    } else {
      log.warn(`User "${name}" was not saved.`);
      return null;
    }
  } catch (error) {
    log.error("Error saving user:", error);
    throw error;
  }
}

export async function saveFingerprint(data: { userId: string; hash: string }) {
  try {
    const { hash, userId } = data;

    // Check if fingerprint exists
    const existingFingerprint = await findFingerprint(hash);
    if (existingFingerprint) {
      log.warn(`Device with hash "${hash}" already exists. Skipping.`);
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
      log.info(`Hash "${hash}" saved with ID: ${result.id}`);
      return result;
    } else {
      log.warn(`Hash "${hash}" was not saved.`);
      return null;
    }
  } catch (error) {
    log.error("Error saving fingerprint:", error);
    throw error;
  }
}

export async function deleteUser(name: string) {
  try {
    // Find the user first to get ID for cascade deletion
    const user = await findUserByName(name);
    if (!user) {
      return null;
    }

    // Delete fingerprints associated with the user
    await supabaseAdmin.from("user_devices").delete().eq("user_id", user.id);

    // Delete the user
    const { data, error } = await supabaseAdmin
      .from("users")
      .delete()
      .eq("name", name)
      .select();

    if (error) {
      log.error("Error deleting user:", error);
      return null;
    }

    return data && data.length > 0 ? data[0] : null;
  } catch (e) {
    log.error("Error deleting user:", e);
    return null;
  }
}
