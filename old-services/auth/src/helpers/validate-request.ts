import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";

export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    throw new Error("Error validating Request");
  }

  next();
};
