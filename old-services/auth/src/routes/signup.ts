import express, { Request, Response } from "express";
import { body } from "express-validator";
import jwt from "jsonwebtoken";
import { validateRequest } from "../helpers/validate-request";
import { findUser } from "../database/find-user";
import { listenPool, writePool } from "../database/db";
import { saveUserToDb } from "../database/save-user";
import { Password } from "../helpers/password";
import { findFingerprint } from "../database/find-fingerprint";
import { saveFingerprintToDb } from "../database/save-fingerprint";
import { deleteUser } from "../database/delete-user";
import { Logger } from "tslog";

const log = new Logger();

const router = express.Router();

router.post(
  "/api/users/signup",
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("password").trim().isLength({ min: 4, max: 20 }).withMessage("Password  must be between 4 and 20 characters"),
  ],
  validateRequest,
  async (req: Request, res: Response): Promise<void> => {
    const { email, password, fingerprint } = req.body;

    const existingUser = await findUser(listenPool, email);
    const existingFingerprint = await findFingerprint(listenPool, fingerprint);

    if (existingUser) {
      res.status(401).send({ error: "No ha sido posible registrarse." });
      return;
    }

    if (existingFingerprint) {
      await deleteUser(writePool, email);
      res.status(401).send({ error: "Este dispositivo ya está vinculado en otro usuario." });
      return;
    }

    // IF NOT SAVE USER HERE
    const hashed = await Password.toHash(password);

    const userToSave = {
      email,
      password: hashed,
      hash: fingerprint,
    };

    try {
      const user = await saveUserToDb(writePool, userToSave);
      const fingerprintToSave = {
        userId: user.id,
        hash: fingerprint,
      };
      await saveFingerprintToDb(writePool, fingerprintToSave);
      // Generate JWT
      const userJwt = jwt.sign(
        {
          id: user.id,
          email: user.email,
        },
        process.env.JWT_KEY!
      );

      // Store it on session object
      req.session = {
        jwt: userJwt,
      };

      res.status(201).send(user);
    } catch {
      await deleteUser(writePool, email);
      res.status(500).send({ error: "No ha sido posible registrarse." });
    }
  }
);

export { router as signupRouter };
