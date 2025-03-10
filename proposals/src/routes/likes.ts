import express, { Request, Response } from "express";
import { writePool } from "../database/db";
import { getLikesAndDislikesFromDb } from "../database/getLikesAndDislikes";

const router = express.Router();

router.post("/api/likes", async (req: Request, res: Response) => {
  const proposal_id = Number(req.body.proposal_id);

  if (!proposal_id) {
    res.status(400).send({ error: "Invalid parameters" });
    return;
  }

  const proposals = await getLikesAndDislikesFromDb(writePool, proposal_id);
  res.status(200).send(proposals);
});

export { router as getLikesAndDislikesRouter };
