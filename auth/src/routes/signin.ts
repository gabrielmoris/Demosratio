import express, { Request, Response } from "express";
import { body } from "express-validator";
import jwt from "jsonwebtoken";
import { validateRequest } from "../helpers/validate-request";
import { Password } from "../helpers/password";
import { listenPool } from "../database/db";
import { findUser } from "../database/find-user";

const router = express.Router();

router.post(
  "/api/users/signin",
  [body("email").isEmail().withMessage("Email must be valid."), body("password").trim().notEmpty().withMessage("You must apply a password.")],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    // Get user HERE

    const existingUser = await findUser(listenPool, email);

    if (!existingUser || existingUser == null) {
      throw new Error("Invalid credentials");
    }

    const passwordsMatch = await Password.compare(existingUser!.password, password);

    if (!passwordsMatch) {
      throw new Error("Invalid credentials");
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
