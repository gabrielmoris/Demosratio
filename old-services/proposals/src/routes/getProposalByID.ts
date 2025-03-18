import express, { Request, Response } from "express";
import { writePool } from "../database/db";
import { getProposalsById } from "../database/getProposalsById";

const router = express.Router();

router.get("/api/proposals/:id", async (req: Request, res: Response) => {
  const { id } = req.params; // Extract the 'id' from req.params

  if (!id) {
    res.status(400).send({ error: "Proposal ID is required." });
    return;
  }

  try {
    const proposals = await getProposalsById(writePool, Number(id));

    if (!proposals) {
      res.status(404).send({ error: "Proposal not found." });
      return;
    }

    res.status(200).send(proposals);
  } catch (error) {
    console.error("Error fetching proposal:", error);
    res.status(500).send({ error: "Internal server error." });
    return;
  }
});

export { router as getProposalByIdRouter };
