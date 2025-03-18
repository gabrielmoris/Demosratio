import { Request, Response, NextFunction } from "express";

interface UserPayload {
  id: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      currentUser?: UserPayload;
    }
  }
}

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // asuminh that currentUser is set by currentUser middleware
  if (!req.currentUser) {
    res.status(400).send({ error: "No user." });
    throw new Error();
  }

  next();
};
