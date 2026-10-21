import { fetchAllCampaigns } from "@/lib/database/parties/campaigns/getAllCampagns";
import { fetchAllParties } from "@/lib/database/parties/getAllParties";
import { analyzePromisesWithGemini } from "@/lib/services/geminiClient";
import { PartyAnalysisOutput, PartyWithPromises } from "@/types/politicalParties";
import { Logger } from "tslog";
import { fetchPartyPromises } from "../../database/parties/promises/getPartyPromises";
import { VotingData } from "@/types/proposal.types";

const log = new Logger();

export const aiPromiseAnalizer = async (proposal: VotingData, retryCount = 2): Promise<PartyAnalysisOutput[]> => {
  try {
    if (!proposal) throw new Error("Need to send Propuesta.");
    const result = await fetchAllParties();
    if (!result.parties) throw new Error("Error fetching parties");
    const parties: PartyWithPromises[] = result.parties;
    const { campaigns } = await fetchAllCampaigns();
    if (!campaigns || !parties) throw new Error("Error fetching campaigns");

    let latestcampaign = 2018;

    campaigns.forEach((campaign) => {
      if (campaign.year > latestcampaign) latestcampaign = campaign.year;
    });

    const mappedCampaigns = campaigns.filter((campaign) => campaign.year === latestcampaign);

    for (const party of parties) {
      for (const campaign of mappedCampaigns) {
        if (party.id === campaign.party_id) {
          const { promises } = await fetchPartyPromises(party.id, campaign.id);
          if (!promises) {
            log.error("No Promises for this party: ", party.name);
            break;
          }

          party.campaign_year = campaign.year;
          party.campaign_pdf_url = campaign.campaign_pdf_url;
          party.campaign_id = campaign.id;
          party.promises = promises;

          delete party.logo_url;
          delete party.created_at;

          break;
        }
      }
    }

    const analysis = await analyzePromisesWithGemini(parties, proposal);

    return analysis;
  } catch (error) {
    log.error("Error analising promises:", error);
    // geminiFetch already waited for the quota; retrying now would only hit it again
    const rateLimited = error instanceof Error && error.message.includes("Rate limit hit");
    // Gemini errors were already retried by geminiFetch; retry only other failures (DB, bad JSON)
    const geminiFailed = error instanceof Error && error.message.includes("Gemini API error");
    if (retryCount > 0 && !rateLimited && !geminiFailed) {
      log.info(`Retrying... (${retryCount} attempts remaining)`);
      await new Promise((resolve) => setTimeout(resolve, 5000));
      return aiPromiseAnalizer(proposal, retryCount - 1);
    }
    // Keep the rate-limit message so the importer can tell "quota used up" from other failures
    if (rateLimited) throw error;
    throw new Error("Error analising promises after retries.");
  }
};
