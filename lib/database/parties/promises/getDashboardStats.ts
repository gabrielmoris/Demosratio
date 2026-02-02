import { supabaseAdmin } from "@/lib/supabaseClient";

export interface DashboardStats {
  totalPromises: number;
  supportingEvidence: number;
  contradictoryEvidence: number;
  partialEvidence: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const { count: totalPromises, error: totalError } = await supabaseAdmin.from("party_promises").select("*", { count: "exact", head: true });

    if (totalError) throw totalError;
    const { data: analyses, error: analysisError } = await supabaseAdmin.from("promise_status").select("fulfillment_status");

    if (analysisError) throw analysisError;

    let supportingEvidence = 0;
    let contradictoryEvidence = 0;
    let partialEvidence = 0;

    analyses?.forEach((analysis) => {
      switch (analysis.fulfillment_status) {
        case "Supporting Evidence":
          supportingEvidence++;
          break;
        case "Contradictory Evidence":
          contradictoryEvidence++;
          break;
        case "Partial/Indirect Evidence":
          partialEvidence++;
          break;
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
