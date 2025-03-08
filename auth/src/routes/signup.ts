import express, { Request, Response } from "express";
import { body } from "express-validator";
import jwt from "jsonwebtoken";
import { validateRequest } from "../helpers/validate-request";
import { findUser } from "../database/find-user";
import { listenPool, writePool } from "../database/db";
import { saveUserToDb } from "../database/save-user";
import { Password } from "../helpers/password";

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

    if (existingUser) {
      console.log("Email in use.");
      throw new Error("Email in use");
    }

    // IF NOT SAVE USER HERE
    const hashed = await Password.toHash(password);

    const userToSave = {
      email,
      password: hashed,
      hash: fingerprint,
    };

    const user = await saveUserToDb(writePool, userToSave);

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
  }
);

export { router as signupRouter };
