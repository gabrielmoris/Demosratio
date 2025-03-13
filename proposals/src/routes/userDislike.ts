import express, { Request, Response } from "express";
import { writePool } from "../database/db";

import { addLikesToDb } from "../database/addLike";
import { addDislikesToDb } from "../database/addDislike";

const router = express.Router();

router.post("/api/likes/dislike", async (req: Request, res: Response) => {
  const proposal_id = Number(req.body.proposal_id);

  if (!proposal_id || !req.currentUser) {
    res.status(400).send({ error: "Invalid parameters" });
    return;
  }

  // This is for the sake to save it only, later I will check if it is already liked and delete it from DB if it was already

  const likeUser = await addDislikesToDb(writePool, {
    proposal_id,
    user_id: Number(req.currentUser.id),
  });

  res.status(200).send({ liked: likeUser, proposal_id });
});

export { router as useLike };
