import { NextResponse } from "next/server";
import { getProposalsForAlignment } from "@/lib/database/spanishParliament/getProposalsForAlignment";

type VoteEntry = {
  party: string;
  for: number;
  against: number;
  abstain: number;
  noVote: number;
};

function normalizeVotes(raw: unknown): VoteEntry[] | null {
  if (!raw) return null;
  if (Array.isArray(raw)) return raw as VoteEntry[];
  const obj = raw as Record<string, unknown>;
  if (obj.votes && Array.isArray(obj.votes)) return obj.votes as VoteEntry[];
  return null;
}

function getPosition(entry: VoteEntry): "for" | "against" | "abstain" | null {
  if (entry.for > 0) return "for";
  if (entry.against > 0) return "against";
  if (entry.abstain > 0) return "abstain";
  return null;
}

export async function GET() {
  try {
    const proposals = await getProposalsForAlignment();

    const alignCounts: Record<string, Record<string, number>> = {};
    const coVoteCounts: Record<string, Record<string, number>> = {};
    const partySet = new Set<string>();

    for (const proposal of proposals) {
      const votes = normalizeVotes(proposal.votes_parties_json);
      if (!votes) continue;

      const positionMap = new Map<string, "for" | "against" | "abstain" | null>();
      for (const v of votes) {
        partySet.add(v.party);
        positionMap.set(v.party, getPosition(v));
      }

      const active = [...positionMap.entries()]
        .filter(([, pos]) => pos !== null)
        .map(([party]) => party);

      for (let i = 0; i < active.length; i++) {
        for (let j = i + 1; j < active.length; j++) {
          const a = active[i];
          const b = active[j];

          if (!coVoteCounts[a]) coVoteCounts[a] = {};
          if (!coVoteCounts[b]) coVoteCounts[b] = {};
          if (!alignCounts[a]) alignCounts[a] = {};
          if (!alignCounts[b]) alignCounts[b] = {};

          coVoteCounts[a][b] = (coVoteCounts[a][b] || 0) + 1;
          coVoteCounts[b][a] = (coVoteCounts[b][a] || 0) + 1;

          if (positionMap.get(a) === positionMap.get(b)) {
            alignCounts[a][b] = (alignCounts[a][b] || 0) + 1;
            alignCounts[b][a] = (alignCounts[b][a] || 0) + 1;
          }
        }
      }
    }

    const parties = Array.from(partySet).sort();
    const matrix: Record<string, Record<string, { pct: number | null; coVotes: number }>> = {};

    for (const a of parties) {
      matrix[a] = {};
      for (const b of parties) {
        if (a === b) {
          matrix[a][b] = { pct: 100, coVotes: proposals.length };
        } else {
          const coVotes = coVoteCounts[a]?.[b] ?? 0;
          const aligned = alignCounts[a]?.[b] ?? 0;
          matrix[a][b] = {
            pct: coVotes > 0 ? Math.round((aligned / coVotes) * 100) : null,
            coVotes,
          };
        }
      }
    }

    return NextResponse.json({ parties, matrix, totalProposals: proposals.length });
  } catch {
    return NextResponse.json({ error: "Failed to compute alignment matrix" }, { status: 500 });
  }
}
