import express, { Request, Response } from "express";
import { writePool } from "../database/db";
import { getProposalsByExpedientText } from "../database/getProposalsByExpedientId";

const router = express.Router();

router.get("/api/proposals/search", async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string, 10) || 1;
  const pageSize = parseInt(req.query.pageSize as string, 10) || 10;
  const expedient_text = req.query.expedient_text as string;

  if (
    isNaN(page) ||
    isNaN(pageSize) ||
    page < 1 ||
    pageSize < 1 ||
    !expedient_text
  ) {
    res.status(400).send({ error: "Invalid page or offset parameters" });
    return;
  }

  const proposals = await getProposalsByExpedientText(
    writePool,
    expedient_text,
    page,
    pageSize
  );
  res.status(200).send(proposals);
});

export { router as getProposalsByExpedientRouter };
