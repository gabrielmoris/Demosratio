import express, { Request, Response } from "express";
import { body } from "express-validator";
import jwt from "jsonwebtoken";
import { validateRequest } from "../helpers/validate-request";
import { Password } from "../helpers/password";
import { listenPool, writePool } from "../database/db";
import { findUser } from "../database/find-user";
import { findFingerprint } from "../database/find-fingerprint";
import { saveFingerprintToDb } from "../database/save-fingerprint";

const router = express.Router();

router.post(
  "/api/users/signin",
  [body("email").isEmail().withMessage("Email must be valid."), body("password").trim().notEmpty().withMessage("You must apply a password.")],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password, fingerprint } = req.body;

    const existingUser = await findUser(listenPool, email);

    if (!existingUser || existingUser == null) {
      res.status(401).send({ error: "Invalid Credentials" });
      return;
    }

    const fingerprintFromUser = await findFingerprint(listenPool, fingerprint);

    if (fingerprintFromUser.user_id !== existingUser.id) {
      const existingFingerprint = await findFingerprint(listenPool, fingerprint);
      if (existingFingerprint) {
        res.status(401).send({ error: "Este dispositivo no está vinculado a tu usuario." });
        return;
      } else {
        const fingerprintToSave = {
          userId: Number(existingUser.id),
          hash: String(fingerprint),
        };
        await saveFingerprintToDb(writePool, fingerprintToSave);
      }
    }

    const passwordsMatch = await Password.compare(existingUser!.password, password);

    if (!passwordsMatch) {
      res.status(401).send({ error: "Invalid Credentials" });
      return;
    }

    // Generate JWT
    const userJwt = jwt.sign(
      {
        id: existingUser.id,
        email: existingUser.email,
      },
      process.env.JWT_KEY!
    );

    // Store it on session object
    req.session = {
      jwt: userJwt,
    };

    res.status(200).send(existingUser);
  }
);

export { router as signinRouter };
