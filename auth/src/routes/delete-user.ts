import express from "express";
import { currentUser } from "../helpers/current-user";
import { deleteUser } from "../database/delete-user";
import { writePool } from "../database/db";

const router = express.Router();

router.get("/api/users/delete", currentUser, async (req, res) => {
  if (!req.currentUser) {
    res.status(500).send({ error: "No ha sido posible borrar el usuario." });
    return;
  }
  await deleteUser(writePool, req.currentUser.email);
  req.session = null;
  res.send({});
});

export { router as deleteUserRouter };
