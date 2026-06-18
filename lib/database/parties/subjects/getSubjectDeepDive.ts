import { Logger } from "tslog";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { PromiseAnalysis } from "@/types/politicalParties";
import { SubjectDeepDive, SubjectPartyData, SubjectProposal } from "@/types/temas";

const log = new Logger();

export async function getSubjectDeepDive(subjectId: number): Promise<{ data: SubjectDeepDive | null; error?: Error }> {
  try {
    const { data: subject, error: subjectError } = await supabaseAdmin
      .from("subjects")
      .select("*")
      .eq("id", subjectId)
      .single();

    if (subjectError) throw subjectError;
    if (!subject) throw new Error("Subject not found");

    const { data: rawPromises, error: promisesError } = await supabaseAdmin
      .from("promises")
      .select(`
        id,
        promise,
        party_id,
        campaign_id,
        parties (id, name, logo_url),
        campaigns (id, year)
      `)
      .eq("subject_id", subjectId);

    if (promisesError) throw promisesError;

    type RawPromise = {
      id: number;
      promise: string;
      party_id: number;
      campaign_id: number;
      parties: { id: number; name: string; logo_url?: string } | null;
      campaigns: { id: number; year: number } | null;
    };

    const promises: RawPromise[] = (rawPromises || []) as unknown as RawPromise[];

    if (promises.length === 0) {
      return {
        data: {
          subject,
          stats: { totalPromises: 0, totalParties: 0, totalVotes: 0, supporting: 0, contradictory: 0, partial: 0, notAnalyzed: 0 },
          parties: [],
          relatedProposals: [],
        },
      };
    }

    const promiseIds = promises.map((p) => p.id);

    const { data: analyses, error: analysesError } = await supabaseAdmin
      .from("promise_status")
      .select("id, promise_id, proposal_id, fulfillment_status, analysis_summary, party_name, campaign_year, promise_text, subject_id, proposals (id, title, expedient_text, votes_for, votes_against, url)")
      .in("promise_id", promiseIds);

    if (analysesError) throw analysesError;

    const allAnalyses = (analyses || []) as unknown as PromiseAnalysis[];

    const proposalIds = [...new Set(allAnalyses.map((a) => a.proposal_id))];
    let relatedProposals: SubjectProposal[] = [];

    if (proposalIds.length > 0) {
      const { data: proposals, error: proposalsError } = await supabaseAdmin
        .from("proposals")
        .select("id, title, expedient_text, votes_for, votes_against, abstentions, no_vote, date, url, assent")
        .in("id", proposalIds)
        .order("date", { ascending: false })
        .limit(15);

      if (!proposalsError) {
        relatedProposals = (proposals || []) as SubjectProposal[];
      }
    }

    const analysesByPromise: Record<number, PromiseAnalysis[]> = {};
    allAnalyses.forEach((analysis) => {
      if (!analysesByPromise[analysis.promise_id]) {
        analysesByPromise[analysis.promise_id] = [];
      }
      analysesByPromise[analysis.promise_id].push(analysis);
    });

    let supporting = 0;
    let contradictory = 0;
    let partial = 0;
    let notAnalyzed = 0;

    promises.forEach((promise) => {
      const promiseAnalyses = analysesByPromise[promise.id] || [];
      if (promiseAnalyses.length === 0) {
        notAnalyzed++;
        return;
      }
      const hasSupporting = promiseAnalyses.some((a) => a.fulfillment_status === "Supporting Evidence");
      const hasContradictory = promiseAnalyses.some((a) => a.fulfillment_status === "Contradictory Evidence");
      const hasPartial = promiseAnalyses.some((a) => a.fulfillment_status === "Partial/Indirect Evidence");

      if (hasPartial || (hasSupporting && hasContradictory)) {
        partial++;
      } else if (hasSupporting) {
        supporting++;
      } else if (hasContradictory) {
        contradictory++;
      } else {
        partial++;
      }
    });

    const partiesByIdMap: Record<number, SubjectPartyData> = {};
    promises.forEach((promise) => {
      const partyInfo = promise.parties as unknown as { id: number; name: string; logo_url?: string };
      const campaignInfo = promise.campaigns as unknown as { id: number; year: number };

      if (!partyInfo) return;

      if (!partiesByIdMap[promise.party_id]) {
        partiesByIdMap[promise.party_id] = {
          party_id: promise.party_id,
          party_name: partyInfo.name,
          party_logo: partyInfo.logo_url,
          promises: [],
        };
      }

      partiesByIdMap[promise.party_id].promises.push({
        id: promise.id,
        promise: promise.promise,
        campaign_year: campaignInfo?.year || 0,
        analyses: analysesByPromise[promise.id] || [],
      });
    });

    const uniqueParties = Object.values(partiesByIdMap).sort((a, b) =>
      a.party_name.localeCompare(b.party_name)
    );

    return {
      data: {
        subject,
        stats: {
          totalPromises: promises.length,
          totalParties: uniqueParties.length,
          totalVotes: proposalIds.length,
          supporting,
          contradictory,
          partial,
          notAnalyzed,
        },
        parties: uniqueParties,
        relatedProposals,
      },
    };
  } catch (error) {
    log.error("Error fetching subject deep dive:", error);
    return { data: null, error: error as Error };
  }
}
