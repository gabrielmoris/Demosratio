import express, { Request, Response } from "express";

const router = express.Router();

router.get("/api/proposals", async (req: Request, res: Response) => {
  res.status(200).send({ true: "true" });
});

export { router as indexParliamentRouter };
