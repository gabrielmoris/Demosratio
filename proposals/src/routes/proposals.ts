import express, { Request, Response } from "express";
import { writePool } from "../database/db";
import { getProposalsFromDb } from "../database/getProposal";

const router = express.Router();

router.get("/api/proposals", async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string, 10) || 1;
  const pageSize = parseInt(req.query.pageSize as string, 10) || 10;

  if (isNaN(page) || isNaN(pageSize) || page < 1 || pageSize < 1) {
    res.status(400).send({ error: "Invalid page or offset parameters" });
    return;
  }

  const proposals = await getProposalsFromDb(writePool, page, pageSize);
  res.status(200).send(proposals);
});

export { router as getProposalsRouter };
