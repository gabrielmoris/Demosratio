import { describe, it, expect } from "vitest";
import { mergeVotesByParty } from "@/lib/helpers/spanishParliamentExtractor/votesPerParty";
import { Votacion } from "@/types/proposal.types";

describe("mergeVotesByParty", () => {
  it("should merge votes by party correctly", () => {
    const votes: Votacion[] = [
      { grupo: "PSOE", voto: "Sí" },
      { grupo: "PP", voto: "No" },
      { grupo: "PSOE", voto: "Sí" },
      { grupo: "VOX", voto: "Abstención" },
    ];

    const result = mergeVotesByParty(votes);

    expect(result.votes).toContainEqual(expect.objectContaining({ party: "PSOE", for: 2 }));
    expect(result.votes).toContainEqual(expect.objectContaining({ party: "PP", against: 1 }));
    expect(result.votes).toContainEqual(expect.objectContaining({ party: "VOX", abstain: 1 }));
  });

  it("should handle empty votes array", () => {
    const votes: Votacion[] = [];
    const result = mergeVotesByParty(votes);
    expect(result.votes).toEqual([]);
  });

  it("should handle 'No vota' votes", () => {
    const votes: Votacion[] = [{ grupo: "PSOE", voto: "No vota" }];

    const result = mergeVotesByParty(votes);
    expect(result.votes).toContainEqual(expect.objectContaining({ party: "PSOE", noVote: 1 }));
  });

  it("should skip votes with missing party or vote", () => {
    const votes: Votacion[] = [
      { grupo: "", voto: "Sí" },
      { grupo: "PP", voto: "" },
      { grupo: "VOX", voto: "No" },
    ];

    const result = mergeVotesByParty(votes);
    expect(result.votes).toContainEqual(expect.objectContaining({ party: "VOX", against: 1 }));
    console.log(result.votes);
    expect(result.votes.length).toBe(1);
  });
});
