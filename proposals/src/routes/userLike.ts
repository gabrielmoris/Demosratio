import express, { Request, Response } from "express";
import { writePool } from "../database/db";

import { addLikesToDb } from "../database/addLike";

const router = express.Router();

router.post("/api/likes/like", async (req: Request, res: Response) => {
  const proposal_id = Number(req.body.proposal_id);

  if (!proposal_id || !req.currentUser) {
    res.status(400).send({ error: "Invalid parameters" });
    return;
  }

  const likeUser = await addLikesToDb(writePool, {
    proposal_id,
    user_id: Number(req.currentUser.id),
  });

  res.status(200).send({ liked: likeUser, proposal_id });
});

export { router as useLike };
