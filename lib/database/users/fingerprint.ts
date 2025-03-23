import { decodeFingerprint } from "@/lib/helpers/users/fingerprintEncoding";
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

export async function calculateSimilarity(fp1: string, fp2: string): Promise<number> {
  try {
    const { fingerprintData: obj1 } = await decodeFingerprint(fp1);
    const { fingerprintData: obj2 } = await decodeFingerprint(fp2);

    let similarity = 0;

    // WebGL parameters (hardware-dependent and stable)
    try {
      const webgl1 = obj1.wg;
      const webgl2 = obj2.wg;

      // Vendor and Renderer (highly specific to GPU)
      similarity += webgl1.p1 === webgl2.p1 ? 0.2 : 0; // vendor
      similarity += webgl1.p2 === webgl2.p2 ? 0.2 : 0; // renderer

      // Max Texture Sizes (indicative of GPU capabilities)
      similarity += webgl1.p12 === webgl2.p12 ? 0.1 : 0; // maxTextureSize
      similarity += webgl1.p8 === webgl2.p8 ? 0.05 : 0; // maxCubeMapTextureSize

      // Other WebGL parameters (less weight but still hardware-dependent)
      similarity += webgl1.p9 === webgl2.p9 ? 0.05 : 0; // maxFragmentUniformVectors
      similarity += webgl1.p16 === webgl2.p16 ? 0.05 : 0; // maxVertexUniformVectors
      similarity += webgl1.p3 === webgl2.p3 ? 0.025 : 0;
      similarity += webgl1.p4 === webgl2.p4 ? 0.025 : 0;
      similarity += webgl1.p5 === webgl2.p5 ? 0.025 : 0;
      similarity += webgl1.p6 === webgl2.p6 ? 0.025 : 0;
      similarity += webgl1.p7 === webgl2.p7 ? 0.025 : 0;
      similarity += webgl1.p10 === webgl2.p10 ? 0.025 : 0;
      similarity += webgl1.p11 === webgl2.p11 ? 0.025 : 0;
      similarity += webgl1.p13 === webgl2.p13 ? 0.025 : 0;
      similarity += webgl1.p14 === webgl2.p14 ? 0.025 : 0;
      similarity += webgl1.p15 === webgl2.p15 ? 0.025 : 0;
      similarity += webgl1.p17 === webgl2.p17 ? 0.025 : 0;
      similarity += webgl1.p18 === webgl2.p18 ? 0.025 : 0;
    } catch (error) {
      console.error("Error comparing WebGL parameters:", error);
    }

    // Hardware information (highly stable across sessions)
    try {
      const hardware1 = JSON.parse(obj1.h);
      const hardware2 = JSON.parse(obj2.h);

      similarity += hardware1.h1 === hardware2.h1 ? 0.1 : 0; // hardwareConcurrency
      similarity += hardware1.h2 === hardware2.h2 ? 0.1 : 0; // screenResolution
      similarity += hardware1.h3 === hardware2.h3 ? 0.05 : 0; // colorDepth
      similarity += hardware1.h4 === hardware2.h4 ? 0.05 : 0; // timezone
    } catch (error) {
      console.error("Error comparing hardware information:", error);
    }

    // Canvas fingerprint (less stable but still useful)
    similarity += obj1.c === obj2.c ? 0.05 : 0; // canvasHash

    return similarity;
  } catch (error) {
    console.error("Error parsing fingerprint strings:", error);
    return 0;
  }
}

export async function findFingerprintsForUser(userId: string) {
  try {
    const { data, error } = await supabaseAdmin.from("user_devices").select("*").eq("user_id", userId);

    if (error) {
      log.error("Error finding fingerprints for user:", error);
      return [];
    }
    return data;
  } catch (e) {
    log.error("Error finding fingerprints for user:", e);
    return [];
  }
}

export async function findSimilarFingerprint(fingerprint: string, threshold: number) {
  try {
    const { data, error } = await supabaseAdmin.from("user_devices").select("*");

    if (error) {
      log.error("Error finding similar fingerprint:", error);
      return null;
    }

    for (const storedFingerprint of data) {
      const similarity = await calculateSimilarity(fingerprint, storedFingerprint.device_hash);
      if (similarity >= threshold) {
        return storedFingerprint;
      }
    }

    return null;
  } catch (e) {
    log.error("Error finding similar fingerprint:", e);
    return null;
  }
}
