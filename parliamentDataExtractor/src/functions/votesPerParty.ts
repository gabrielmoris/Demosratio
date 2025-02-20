import { Votacion } from "../../types/proposal.types";
import { Logger } from "tslog";

const log = new Logger();

export const mergeVotesByParty = (votes: Votacion[]) => {
  const mergedVotes = new Map<string, { against: number; for: number; abstain: number; noVote: number }>();

  for (const vote of votes) {
    const { grupo: party, voto: votation } = vote;

    if (!party || !vote) {
      log.warn("Invalid vote Obj: ", vote);
      continue;
    }

    const currentParty = mergedVotes.has(party);

    if (!currentParty) {
      mergedVotes.set(party, { against: 0, for: 0, abstain: 0, noVote: 0 });
    }

    const currentCount = mergedVotes.get(party) || { against: 0, for: 0, abstain: 0, noVote: 0 };

    switch (votation) {
      case "Sí":
        mergedVotes.set(party, { ...currentCount, for: currentCount.for + 1 });
        break;
      case "No":
        mergedVotes.set(party, { ...currentCount, against: currentCount.against + 1 });
        break;
      case "No vota":
        mergedVotes.set(party, { ...currentCount, abstain: currentCount.noVote + 1 });
        break;
      case "Abstención":
        mergedVotes.set(party, { ...currentCount, abstain: currentCount.abstain + 1 });
        break;
      default:
        console.warn(`Unknown vote type: ${votation}`);
    }
  }

  return Object.fromEntries(mergedVotes);
};
