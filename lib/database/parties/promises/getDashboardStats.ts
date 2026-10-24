import { supabaseAdmin } from "@/lib/supabaseClient";

export interface DashboardStats {
  totalPromises: number;
  supportingEvidence: number;
  contradictoryEvidence: number;
  partialEvidence: number;
}

/** Stats of a party's promises; only those of `campaignId` (its campaign in a legislatura) when given. */
export async function getDashboardStats(partyId: number, campaignId?: number): Promise<DashboardStats> {
  try {
    let totalQuery = supabaseAdmin
      .from("promises")
      .select("*", { count: "exact", head: true })
      .eq("party_id", partyId);
    if (campaignId) totalQuery = totalQuery.eq("campaign_id", campaignId);

    const { count: totalPromises, error: totalError } = await totalQuery;

    if (totalError) throw totalError;

    let promisesQuery = supabaseAdmin.from("promises").select("id").eq("party_id", partyId);
    if (campaignId) promisesQuery = promisesQuery.eq("campaign_id", campaignId);

    const { data: promises, error: promisesError } = await promisesQuery;

    if (promisesError) throw promisesError;

    if (!promises || promises.length === 0) {
      return {
        totalPromises: 0,
        supportingEvidence: 0,
        contradictoryEvidence: 0,
        partialEvidence: 0,
      };
    }

    const promiseIds = promises.map((p) => p.id);

    const { data: analyses, error: analysisError } = await supabaseAdmin
      .from("promise_status")
      .select("promise_id, fulfillment_status")
      .in("promise_id", promiseIds);

    if (analysisError) throw analysisError;

    const analysesByPromise: Record<number, string[]> = {};
    analyses?.forEach((analysis) => {
      if (!analysesByPromise[analysis.promise_id]) {
        analysesByPromise[analysis.promise_id] = [];
      }
      analysesByPromise[analysis.promise_id].push(analysis.fulfillment_status);
    });

    let supportingEvidence = 0;
    let contradictoryEvidence = 0;
    let partialEvidence = 0;

    promises.forEach((promise) => {
      const statuses = analysesByPromise[promise.id] || [];

      if (statuses.length === 0) {
        contradictoryEvidence++;
        return;
      }

      const hasSupporting = statuses.includes("Supporting Evidence");
      const hasContradictory = statuses.includes("Contradictory Evidence");
      const hasPartial = statuses.includes("Partial/Indirect Evidence");

      if (hasPartial) {
        partialEvidence++;
      } else if (hasSupporting && hasContradictory) {
        partialEvidence++;
      } else if (hasSupporting) {
        supportingEvidence++;
      } else if (hasContradictory) {
        contradictoryEvidence++;
      }
    });

    return {
      totalPromises: totalPromises || 0,
      supportingEvidence,
      contradictoryEvidence,
      partialEvidence,
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw error;
  }
}
