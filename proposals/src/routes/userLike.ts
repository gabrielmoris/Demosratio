import express, { Request, Response } from "express";
import { listenPool, writePool } from "../database/db";

import { addLikesToDb } from "../database/addLike";
import { getLikeandDislikeByUserId } from "../database/getLikeAndDislikeByUserId";
import { deleteUserLike } from "../database/deleteUserLike";
import { deleteUserDislike } from "../database/deleteUserDislike";
import { getLikesAndDislikesFromDb } from "../database/getLikesAndDislikes";

interface UserPayload {
  id: string;
  email: string;
}

// This is a way to extend the Request object from express
declare global {
  namespace Express {
    interface Request {
      currentUser?: UserPayload;
      session?: { jwt: string };
    }
  }
}

const router = express.Router();

router.post("/api/likes/like", async (req: Request, res: Response) => {
  const proposal_id = Number(req.body.proposal_id);

  if (!proposal_id || !req.currentUser) {
    res.status(400).send({ error: "Invalid parameters" });
    return;
  }

  const currentUserLikes = await getLikeandDislikeByUserId(
    listenPool,
    proposal_id,
    Number(req.currentUser.id)
  );

  if (currentUserLikes.likes > 0) {
    await deleteUserLike(writePool, {
      proposal_id,
      user_id: Number(req.currentUser.id),
    });
  } else {
    await addLikesToDb(writePool, {
      proposal_id,
      user_id: Number(req.currentUser.id),
    });
  }

  if (currentUserLikes.dislikes > 0) {
    await deleteUserDislike(writePool, {
      proposal_id,
      user_id: Number(req.currentUser.id),
    });
  }
  const updatedLikes = await getLikesAndDislikesFromDb(writePool, proposal_id);
  res.status(200).send(updatedLikes);
});

export { router as useLike };
