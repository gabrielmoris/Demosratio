import { Logger } from "tslog";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { PartyPromise } from "@/types/politicalParties";

const log = new Logger();

export async function fetchStructuredPartyPromises(
  party_id: number,
  campaign_id: number
) {
  try {
    const { data: promises, error: promisesError } = await supabaseAdmin
      .from("promises")
      .select(`*, subjects(*)`)
      .eq("campaign_id", campaign_id)
      .eq("party_id", party_id);

    if (promisesError) {
      log.error(`Error getting party ID: `, promisesError);
      throw promisesError;
    }

    const subjectsMap = new Map<
      number,
      {
        id: number;
        name: string;
        description: string;
        promises: PartyPromise[];
      }
    >();

    promises.forEach((promise) => {
      if (promise.subjects) {
        const subjectId = promise.subjects.id;
        const description = promise.subjects.description;
        if (!subjectsMap.has(subjectId)) {
          subjectsMap.set(subjectId, {
            id: subjectId,
            name: promise.subjects.name,
            description,
            promises: [],
          });
        }

        // delete promise.subjects;
        subjectsMap.get(subjectId)?.promises.push(promise);
      }
    });

    const subjectsArray = Array.from(subjectsMap.values());

    return { promises: subjectsArray };
  } catch (error) {
    log.error("Supabase error fetching subjects:", error);
    return { error };
  }
}
