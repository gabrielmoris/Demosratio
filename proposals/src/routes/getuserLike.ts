import express, { Request, Response } from "express";
import { writePool } from "../database/db";
import { getLikeandDislikeByUserId } from "../database/getLikeAndDislikeByUserId";

const router = express.Router();

router.post("/api/likes/user", async (req: Request, res: Response) => {
  const proposal_id = Number(req.body.proposal_id);

  if (!proposal_id || !req.currentUser) {
    res.status(400).send({ error: "Invalid parameters" });
    return;
  }

  const likesAndDislikesFromUser = await getLikeandDislikeByUserId(
    writePool,
    proposal_id,
    Number(req.currentUser.id)
  );

  res.status(200).send(likesAndDislikesFromUser);
});

export { router as getUserLikesAndDislikes };
